import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import CoAnalyticsHeader from './CoAnalyticsHeader';
import CoSummaryCard from './CoSummaryCard';
import CoDirectVsIndirectSection from './CoDirectVsIndirectSection';
import CoOutcomeMappingCard from './CoOutcomeMappingCard';
import CourseEndSurveyModal from './CourseEndSurveyModal';
import StudentEvidenceModal from '../components/StudentEvidenceModal';
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

const skeletonItem = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite ease-in-out',
  borderRadius: 10,
};

function CoAnalyticsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ height: 150, borderRadius: 14, ...skeletonItem }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{ height: 110, borderRadius: 12, ...skeletonItem }} />
        <div style={{ height: 110, borderRadius: 12, ...skeletonItem }} />
        <div style={{ height: 110, borderRadius: 12, ...skeletonItem }} />
        <div style={{ height: 110, borderRadius: 12, ...skeletonItem }} />
      </div>
      <div style={{ height: 320, borderRadius: 14, ...skeletonItem }} />
      <div style={{ height: 180, borderRadius: 14, ...skeletonItem }} />
    </div>
  );
}

function sortCosAscending(cos = []) {
  return [...cos].sort((a, b) => {
    const codeA = a.coCode || a.code || '';
    const codeB = b.coCode || b.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
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

function sortOutcomesAscending(outcomes = []) {
  const poList = [];
  const psoList = [];
  const otherList = [];

  outcomes.forEach((item) => {
    const code = (item.code || item.outcomeCode || item.poCode || item.psoCode || '').toUpperCase();
    const type = (item.type || item.outcomeType || (code.startsWith('PSO') ? 'PSO' : 'PO')).toUpperCase();
    if (type === 'PO' || (code.startsWith('PO') && !code.startsWith('PSO'))) {
      poList.push(item);
    } else if (type === 'PSO' || code.startsWith('PSO')) {
      psoList.push(item);
    } else {
      otherList.push(item);
    }
  });

  const naturalSort = (a, b) => {
    const codeA = a.code || a.outcomeCode || a.poCode || a.psoCode || '';
    const codeB = b.code || b.outcomeCode || b.poCode || b.psoCode || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  };

  poList.sort(naturalSort);
  psoList.sort(naturalSort);
  otherList.sort(naturalSort);

  return [...poList, ...psoList, ...otherList];
}

export default function CoAnalyticsView() {
  const { programmeBatchId, programmeBatchCourseId, coCode: urlCoCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';

  const urlOutcomeType = searchParams.get('outcomeType') || 'PO';
  const urlOutcomeCode = searchParams.get('outcomeCode') || null;

  // Navigation handlers to dedicated evidence screens
  const handleOpenStudentEvidence = (targetCo = null) => {
    const co = targetCo || (coData ? coData.coCode : selectedCoCode) || 'CO1';
    const params = new URLSearchParams();
    if (urlOutcomeCode) {
      params.set('outcomeCode', urlOutcomeCode);
      params.set('outcomeType', urlOutcomeType);
    }
    params.set('coScope', coScope);
    const query = params.toString() ? `?${params.toString()}` : '';
    navigate(`${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}/co/${co}/direct${query}`);
  };

  const handleOpenSurvey = (targetCo = null) => {
    const co = targetCo || (coData ? coData.coCode : selectedCoCode) || 'CO1';
    const params = new URLSearchParams();
    if (urlOutcomeCode) {
      params.set('outcomeCode', urlOutcomeCode);
      params.set('outcomeType', urlOutcomeType);
    }
    params.set('coScope', coScope);
    const query = params.toString() ? `?${params.toString()}` : '';
    navigate(`${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}/co/${co}/indirect${query}`);
  };

  // Active state for CO and Outcome selectors
  const [coScope, setCoScope] = useState('SELECTED'); // 'SELECTED' | 'ALL'
  const [selectedCoCode, setSelectedCoCode] = useState(urlCoCode || 'CO1');
  const [outcomeScope, setOutcomeScope] = useState(urlOutcomeCode ? 'SELECTED' : 'ALL');

  // Authoritative data state
  const [coData, setCoData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [availableCos, setAvailableCos] = useState([]);
  const [availableOutcomes, setAvailableOutcomes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // Modals state
  const [isStudentEvidenceOpen, setIsStudentEvidenceOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  // Sync selectedCoCode with urlCoCode
  useEffect(() => {
    if (urlCoCode && urlCoCode !== selectedCoCode) {
      setSelectedCoCode(urlCoCode);
    }
  }, [urlCoCode]);

  // 1. Fetch Course-level context (to populate all available COs & outcomes)
  useEffect(() => {
    if (!programmeBatchCourseId) return;
    let isMounted = true;

    analyticsApi
      .getCourseAnalytics({
        programmeBatchCourseId,
        outcomeCode: urlOutcomeCode,
        outcomeType: urlOutcomeType,
      })
      .then((res) => {
        if (!isMounted) return;
        const payload = unwrapResponseData(res);
        if (payload) {
          setCourseData(payload);

          // Extract all COs for this course
          if (payload.courseOutcomes) {
            setAvailableCos(sortCosAscending(payload.courseOutcomes));
          }

          // Extract all mapped outcomes
          const list = payload.outcomes || [
            ...(payload.poContributions || []),
            ...(payload.psoContributions || []),
          ];
          setAvailableOutcomes(sortOutcomesAscending(list));
        }
      })
      .catch((err) => {
        console.warn('[CoAnalyticsView] Course context fetch failed:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [programmeBatchCourseId, urlOutcomeCode, urlOutcomeType]);

  // 2. Fetch Single CO Analytics data when in 'SELECTED' scope
  const fetchSingleCoAnalytics = useCallback(async (targetCo) => {
    const activeCo = targetCo || selectedCoCode;
    if (!programmeBatchCourseId || !activeCo) {
      setError('Course identifier or CO code is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsForbidden(false);

    try {
      const res = await analyticsApi.getCoAnalytics({
        programmeBatchCourseId,
        coCode: activeCo,
      });

      const payload = unwrapResponseData(res);
      if (payload && (payload.coCode || payload.target !== undefined)) {
        setCoData(payload);
      } else {
        setError('CO analytics details are currently unavailable.');
      }
    } catch (err) {
      console.error('[CoAnalyticsView] Error fetching CO analytics:', err);
      if (err?.response?.status === 403) {
        setIsForbidden(true);
        setError('You do not have permission to view analytics for this Course Outcome.');
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to load CO analytics details.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [programmeBatchCourseId, selectedCoCode]);

  useEffect(() => {
    if (coScope === 'SELECTED') {
      fetchSingleCoAnalytics(selectedCoCode);
    } else {
      setLoading(false);
    }
  }, [coScope, selectedCoCode, fetchSingleCoAnalytics]);

  // Handle switching CO
  const handleSelectCo = (newCoCode) => {
    if (!newCoCode) return;
    setCoScope('SELECTED');
    setSelectedCoCode(newCoCode);

    const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '';
    const query = urlOutcomeCode
      ? `?outcomeType=${urlOutcomeType}&outcomeCode=${urlOutcomeCode}`
      : '';
    navigate(`${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}/co/${newCoCode}${query}`, {
      replace: true,
    });
  };

  // Handle switching CO scope ("Selected CO" vs "All CO")
  const handleCoScopeChange = (newScope) => {
    setCoScope(newScope);
    if (newScope === 'SELECTED') {
      fetchSingleCoAnalytics(selectedCoCode);
    }
  };

  // Handle switching outcome
  const handleSelectOutcome = (newCode, newType) => {
    setOutcomeScope('SELECTED');
    setSearchParams({
      outcomeType: newType || 'PO',
      outcomeCode: newCode,
    });
  };

  if (loading) {
    return <CoAnalyticsSkeleton />;
  }

  if (error || isForbidden) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #fee2e2',
          borderRadius: 14,
          padding: '40px 24px',
          textAlign: 'center',
          maxWidth: 520,
          margin: '40px auto',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          {isForbidden ? (
            <ShieldAlert size={26} color="#dc2626" />
          ) : (
            <AlertCircle size={26} color="#dc2626" />
          )}
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          {isForbidden ? 'Access Denied' : 'Unable to load CO analytics'}
        </h2>

        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
          {error}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {!isForbidden && (
            <button
              type="button"
              onClick={() => fetchSingleCoAnalytics(selectedCoCode)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 8,
                background: '#7c3aed',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '';
              const query = urlOutcomeCode
                ? `?outcomeType=${urlOutcomeType}&outcomeCode=${urlOutcomeCode}`
                : '';
              navigate(`${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}${query}`);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Course Analytics</span>
          </button>
        </div>
      </div>
    );
  }

  // Active data context
  const activeCourse = coData || courseData;
  if (!activeCourse && !coData) return null;

  const currentCoCode = coScope === 'SELECTED' ? (coData?.coCode || selectedCoCode) : 'ALL';
  const currentCoStatement = coData?.coStatement || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Header with Breadcrumbs, Course Context, and Selectors */}
      <CoAnalyticsHeader
        programmeBatchId={programmeBatchId}
        programmeBatchCourseId={programmeBatchCourseId}
        batchName={activeCourse?.batchName}
        programmeName={activeCourse?.programmeName}
        courseCode={activeCourse?.courseCode}
        courseName={activeCourse?.courseName}
        semester={activeCourse?.semester}
        courseCoordinator={activeCourse?.courseCoordinator}
        coCode={selectedCoCode}
        coStatement={currentCoStatement}
        coScope={coScope}
        onCoScopeChange={handleCoScopeChange}
        onSelectCo={handleSelectCo}
        availableCos={availableCos}
        outcomeCode={urlOutcomeCode}
        outcomeType={urlOutcomeType}
        outcomeScope={outcomeScope}
        onOutcomeScopeChange={setOutcomeScope}
        onSelectOutcome={handleSelectOutcome}
        availableOutcomes={availableOutcomes}
      />

      {/* 2. Main Content: ALL COs View or Single SELECTED CO View */}
      {coScope === 'ALL' ? (
        <>
          {/* Top Summary Metrics for All COs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              }}
            >
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Total Course Outcomes
              </span>
              <div style={{ margin: '8px 0 4px' }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
                  {(courseData?.courseOutcomes || availableCos).length}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginLeft: 6 }}>COs</span>
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Active curriculum outcomes</span>
            </div>

            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 12,
                padding: '16px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              }}
            >
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                Targets Met
              </span>
              <div style={{ margin: '8px 0 4px' }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#15803d' }}>
                  {(courseData?.courseOutcomes || availableCos).filter((c) => c.targetMet === true).length}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginLeft: 6 }}>
                  / {(courseData?.courseOutcomes || availableCos).length}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#15803d' }}>
                {(courseData?.courseOutcomes || availableCos).filter((c) => c.targetMet === false).length > 0
                  ? `${(courseData?.courseOutcomes || availableCos).filter((c) => c.targetMet === false).length} COs below target`
                  : 'All targets achieved'}
              </span>
            </div>

            <div
              style={{
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: 12,
                padding: '16px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              }}
            >
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase' }}>
                Average CO Attainment
              </span>
              <div style={{ margin: '8px 0 4px' }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#581c87' }}>
                  {(() => {
                    const list = (courseData?.courseOutcomes || availableCos)
                      .map((c) => c.overallAttainment)
                      .filter((v) => v != null)
                      .map(Number);
                    return list.length > 0 ? (list.reduce((a, b) => a + b, 0) / list.length).toFixed(2) : '—';
                  })()}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#9333ea', marginLeft: 4 }}>/ 3.00</span>
              </div>
              <span style={{ fontSize: 11, color: '#7e22ce' }}>Course-wide average across all COs</span>
            </div>
          </div>

          {/* Unified Stacked Vertical Bar Chart for All COs (Direct bottom, Indirect top) */}
          <CoDirectVsIndirectSection
            coScope="ALL"
            courseOutcomes={courseData?.courseOutcomes || availableCos}
            onSelectCo={handleSelectCo}
            outcomeCode={urlOutcomeCode}
          />
        </>
      ) : (
        <>
          {/* Top Summary Metric Cards for Selected CO */}
          {coData && (
            <CoSummaryCard
              coCode={coData.coCode}
              target={coData.target}
              targetMet={coData.targetMet}
              directAttainment={coData.directAttainment ?? coData.directEvidenceSummary?.directAttainment ?? coData.directEvidenceSummary?.directLevel}
              indirectAttainment={coData.indirectAttainment ?? coData.indirectEvidenceSummary?.indirectScore ?? coData.indirectEvidenceSummary?.indirectLevel}
              overallAttainment={coData.overallAttainment}
              directWeight={coData.directWeight}
              indirectWeight={coData.indirectWeight}
              observation={coData.observation}
            />
          )}

          {/* Unified Stacked Vertical Bar Chart for Single Selected CO (Direct bottom, Indirect top) */}
          {coData && (
            <CoDirectVsIndirectSection
              coScope="SELECTED"
              coCode={coData.coCode}
              directAttainment={coData.directAttainment ?? coData.directEvidenceSummary?.directAttainment ?? coData.directEvidenceSummary?.directLevel}
              indirectAttainment={coData.indirectAttainment ?? coData.indirectEvidenceSummary?.indirectScore ?? coData.indirectEvidenceSummary?.indirectLevel}
              overallAttainment={coData.overallAttainment}
              target={coData.target}
              targetMet={coData.targetMet}
              directEvidenceSummary={coData.directEvidenceSummary}
              indirectEvidenceSummary={coData.indirectEvidenceSummary}
              directWeight={coData.directWeight}
              indirectWeight={coData.indirectWeight}
              onOpenStudentEvidence={() => handleOpenStudentEvidence()}
              onOpenSurvey={() => handleOpenSurvey()}
              outcomeCode={urlOutcomeCode}
            />
          )}

          {/* PO / PSO Mappings Card for Selected CO */}
          {coData && (
            <CoOutcomeMappingCard
              coCode={coData.coCode}
              poMappings={coData.poMappings}
              psoMappings={coData.psoMappings}
              programmeBatchId={programmeBatchId}
              outcomeScope={outcomeScope}
              selectedOutcomeCode={urlOutcomeCode}
              onSelectOutcome={handleSelectOutcome}
            />
          )}

          {/* Student Performance Evidence Modal */}
          {coData && (
            <StudentEvidenceModal
              isOpen={isStudentEvidenceOpen}
              onClose={() => setIsStudentEvidenceOpen(false)}
              programmeBatchCourseId={programmeBatchCourseId}
              coCode={coData.coCode}
              coDetails={{
                coCode: coData.coCode,
                statement: coData.coStatement,
              }}
            />
          )}

          {/* Course-End Survey Modal */}
          {coData && (
            <CourseEndSurveyModal
              isOpen={isSurveyModalOpen}
              onClose={() => setIsSurveyModalOpen(false)}
              coCode={coData.coCode}
              coStatement={coData.coStatement}
              indirectEvidence={coData.indirectEvidenceSummary}
              courseCode={activeCourse?.courseCode}
              courseName={activeCourse?.courseName}
            />
          )}
        </>
      )}
    </div>
  );
}
