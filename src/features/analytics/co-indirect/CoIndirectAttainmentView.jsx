import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import CoIndirectAttainmentHeader from './CoIndirectAttainmentHeader';
import CoIndirectSummaryCard from './CoIndirectSummaryCard';
import CoIndirectDistributionChart from './CoIndirectDistributionChart';
import CoIndirectResponseTable from './CoIndirectResponseTable';
import CoIndirectInterpretationPanel from './CoIndirectInterpretationPanel';
import CoIndirectAllOverview from './CoIndirectAllOverview';
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

const skeletonItem = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite ease-in-out',
  borderRadius: 10,
};

function CoIndirectSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ height: 130, borderRadius: 14, ...skeletonItem }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 100, borderRadius: 10, ...skeletonItem }} />
        ))}
      </div>
      <div style={{ height: 300, borderRadius: 14, ...skeletonItem }} />
      <div style={{ height: 220, borderRadius: 14, ...skeletonItem }} />
    </div>
  );
}

function unwrapResponseData(res) {
  if (!res) return null;
  if (res.data !== undefined && res.data !== null) {
    if (typeof res.data === 'object' && res.data.data !== undefined && res.data.data !== null) {
      return res.data.data;
    }
    return res.data;
  }
  return res;
}

function sortCosAscending(cos = []) {
  return [...cos].sort((a, b) => {
    const codeA = a.coCode || a.code || '';
    const codeB = b.coCode || b.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

export default function CoIndirectAttainmentView() {
  const { programmeBatchId, programmeBatchCourseId, coCode: urlCoCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlOutcomeType = searchParams.get('outcomeType') || 'PO';
  const urlOutcomeCode = searchParams.get('outcomeCode') || null;
  const initialScope = searchParams.get('coScope') || (urlCoCode && urlCoCode.toLowerCase() !== 'all' ? 'SELECTED' : 'ALL');

  const [coScope, setCoScope] = useState(initialScope);
  const [selectedCoCode, setSelectedCoCode] = useState(
    urlCoCode && urlCoCode.toLowerCase() !== 'all' ? urlCoCode.toUpperCase() : 'CO1'
  );

  const [coData, setCoData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [availableCos, setAvailableCos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // 1. Initial Course Analytics load to discover all COs and context
  useEffect(() => {
    if (!programmeBatchCourseId) return;

    let isMounted = true;
    analyticsApi
      .getCourseAnalytics({ programmeBatchCourseId })
      .then((res) => {
        if (!isMounted) return;
        const data = unwrapResponseData(res);
        if (data) {
          setCourseData(data);
          const rawCos = data.courseOutcomes || [];
          const sorted = sortCosAscending(rawCos);
          setAvailableCos(sorted);
          if (sorted.length > 0 && (!selectedCoCode || selectedCoCode === 'CO1')) {
            const firstCode = sorted[0].coCode || sorted[0].code;
            if (urlCoCode && sorted.some((c) => (c.coCode || c.code) === urlCoCode.toUpperCase())) {
              setSelectedCoCode(urlCoCode.toUpperCase());
            } else if (firstCode) {
              setSelectedCoCode(firstCode);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load course analytics overview in CoIndirectAttainmentView:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [programmeBatchCourseId, urlCoCode]);

  // 2. Fetch Detailed Indirect Data for Selected CO or All CO
  const fetchIndirectData = useCallback(async () => {
    if (!programmeBatchCourseId) return;

    setLoading(true);
    setError(null);
    setIsForbidden(false);

    try {
      if (coScope === 'ALL') {
        const courseRes = await analyticsApi.getCourseAnalytics({ programmeBatchCourseId });
        const cData = unwrapResponseData(courseRes);
        setCourseData(cData);
        if (cData?.courseOutcomes) {
          setAvailableCos(sortCosAscending(cData.courseOutcomes));
        }
      } else {
        const targetCo = (selectedCoCode || 'CO1').toUpperCase();
        const coRes = await analyticsApi.getCoAnalytics({
          programmeBatchCourseId,
          coCode: targetCo,
        });
        setCoData(unwrapResponseData(coRes));
      }
    } catch (err) {
      console.error('Failed to load CO Indirect Attainment evidence:', err);
      const status = err?.response?.status;
      if (status === 403) {
        setIsForbidden(true);
      } else {
        setError(err.message || 'Unable to load indirect survey assessment evidence for this Course Outcome.');
      }
    } finally {
      setLoading(false);
    }
  }, [programmeBatchCourseId, coScope, selectedCoCode]);

  useEffect(() => {
    fetchIndirectData();
  }, [fetchIndirectData]);

  const handleCoScopeChange = (newScope) => {
    setCoScope(newScope);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('coScope', newScope);
    setSearchParams(newParams, { replace: true });
  };

  const handleSelectCo = (newCoCode) => {
    const code = newCoCode.toUpperCase();
    setSelectedCoCode(code);
    setCoScope('SELECTED');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('coScope', 'SELECTED');
    setSearchParams(newParams, { replace: true });
  };

  if (isForbidden) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #fee2e2',
          padding: 40,
          textAlign: 'center',
          maxWidth: 600,
          margin: '40px auto',
        }}
      >
        <ShieldAlert size={48} style={{ color: '#dc2626', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#991b1b', marginBottom: 8 }}>
          Access Denied
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
          You do not have authorization to inspect indirect survey assessment data for this course offering.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#16a34a',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} />
          <span>Return to Previous Screen</span>
        </button>
      </div>
    );
  }

  if (loading && !coData && !courseData) {
    return <CoIndirectSkeleton />;
  }

  if (error && !coData && !courseData) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #fecaca',
          padding: 40,
          textAlign: 'center',
          maxWidth: 600,
          margin: '40px auto',
        }}
      >
        <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#991b1b', marginBottom: 8 }}>
          Unable to Load Survey Evidence
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
          {error}
        </p>
        <button
          type="button"
          onClick={fetchIndirectData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#16a34a',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const activeCourse = courseData || coData;
  const indirectEvidenceSummary = coData?.indirectEvidenceSummary;
  const responseCount = indirectEvidenceSummary?.responseCount ?? 0;
  const levelDistribution = indirectEvidenceSummary?.levelDistribution || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Header & Context */}
      <CoIndirectAttainmentHeader
        programmeBatchId={programmeBatchId}
        programmeBatchCourseId={programmeBatchCourseId}
        batchName={activeCourse?.batchName}
        programmeName={activeCourse?.programmeName}
        courseCode={activeCourse?.courseCode}
        courseName={activeCourse?.courseName}
        semester={activeCourse?.semester}
        courseCoordinator={activeCourse?.courseCoordinator || activeCourse?.courseCoordinatorName}
        coCode={coScope === 'SELECTED' ? selectedCoCode : 'All COs'}
        coStatement={coScope === 'SELECTED' ? coData?.coStatement : 'All Course Outcomes Indirect Attainment Overview'}
        coScope={coScope}
        onCoScopeChange={handleCoScopeChange}
        onSelectCo={handleSelectCo}
        availableCos={availableCos}
        outcomeCode={urlOutcomeCode}
        outcomeType={urlOutcomeType}
      />

      {/* 2. Body based on Scope */}
      {coScope === 'ALL' ? (
        <CoIndirectAllOverview
          courseOutcomes={courseData?.courseOutcomes || availableCos}
          onSelectCo={handleSelectCo}
        />
      ) : (
        <>
          {/* Summary Metric Cards */}
          <CoIndirectSummaryCard
            coCode={selectedCoCode}
            indirectAttainment={coData?.indirectAttainment}
            indirectLevel={indirectEvidenceSummary?.indirectLevel}
            target={coData?.target}
            targetMet={coData?.targetMet}
            responseCount={responseCount}
            indirectScore={indirectEvidenceSummary?.indirectScore}
            assessmentMethod="Course-End Survey"
            indirectWeight={coData?.indirectWeight || 20}
          />

          {/* Response Distribution Vertical Bar Chart */}
          <CoIndirectDistributionChart
            levelDistribution={levelDistribution}
            responseCount={responseCount}
            coCode={selectedCoCode}
          />

          {/* Aggregate Survey Response Distribution Table */}
          <CoIndirectResponseTable
            levelDistribution={levelDistribution}
            responseCount={responseCount}
            coCode={selectedCoCode}
          />

          {/* Interpretation and Privacy Panel */}
          <CoIndirectInterpretationPanel />
        </>
      )}
    </div>
  );
}
