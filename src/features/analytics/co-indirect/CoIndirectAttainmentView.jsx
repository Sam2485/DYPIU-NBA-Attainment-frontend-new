import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import CoIndirectAttainmentHeader from './CoIndirectAttainmentHeader';
import CoIndirectSummaryCard from './CoIndirectSummaryCard';
import CoIndirectDistributionChart from './CoIndirectDistributionChart';
import CoIndirectTargetChart from './CoIndirectTargetChart';
import CoIndirectInterpretationPanel from './CoIndirectInterpretationPanel';
import CoIndirectResponseTable from './CoIndirectResponseTable';
import CoIndirectAllOverview from './CoIndirectAllOverview';
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert, FileQuestion } from 'lucide-react';

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ height: 95, borderRadius: 12, ...skeletonItem }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        <div style={{ height: 320, borderRadius: 14, ...skeletonItem }} />
        <div style={{ height: 320, borderRadius: 14, ...skeletonItem }} />
      </div>
      <div style={{ height: 180, borderRadius: 14, ...skeletonItem }} />
      <div style={{ height: 300, borderRadius: 14, ...skeletonItem }} />
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

  const [evidenceData, setEvidenceData] = useState(null);
  const [availableCos, setAvailableCos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  // Load CO Indirect Evidence
  const fetchIndirectEvidence = useCallback(async () => {
    if (!programmeBatchCourseId) return;

    setLoading(true);
    setError(null);
    setIsForbidden(false);
    setIsNotFound(false);

    try {
      const targetCo = coScope === 'SELECTED' ? (selectedCoCode || 'CO1').toUpperCase() : 'ALL';
      const res = await analyticsApi.getCoIndirectEvidence({
        programmeBatchCourseId,
        coCode: targetCo,
      });

      const data = unwrapResponseData(res);
      if (data) {
        setEvidenceData(data);

        // Populate availableCos if in ALL mode or if not yet populated
        if (data.coEvidence && data.coEvidence.length > 0) {
          if (coScope === 'ALL' || availableCos.length === 0) {
            const mapped = data.coEvidence.map((item) => ({
              coCode: item.coCode,
              code: item.coCode,
              statement: item.coStatement,
              coStatement: item.coStatement,
              target: item.coTargetLevel,
              coTargetLevel: item.coTargetLevel,
              indirectAttainment: item.indirectAttainment,
              overallIndirectPercentage: item.overallIndirectPercentage,
              targetMet: item.coTargetMet,
            }));
            const sorted = sortCosAscending(mapped);
            setAvailableCos(sorted);

            // If selectedCoCode is not yet set or not in sorted list, pick first
            if (!selectedCoCode || !sorted.some((c) => c.coCode === selectedCoCode)) {
              if (sorted.length > 0) {
                setSelectedCoCode(sorted[0].coCode);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load CO Indirect Evidence:', err);
      const status = err?.response?.status;
      if (status === 403) {
        setIsForbidden(true);
      } else if (status === 404) {
        setIsNotFound(true);
      } else {
        setError(err.message || 'Unable to load course indirect survey evidence.');
      }
    } finally {
      setLoading(false);
    }
  }, [programmeBatchCourseId, coScope, selectedCoCode, availableCos.length]);

  useEffect(() => {
    fetchIndirectEvidence();
  }, [fetchIndirectEvidence]);

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

  // Forbidden 403 State
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

  // Not Found 404 State
  if (isNotFound) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          padding: 40,
          textAlign: 'center',
          maxWidth: 600,
          margin: '40px auto',
        }}
      >
        <FileQuestion size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          Course Offering Not Found
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
          The requested course offering could not be located.
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

  // Loading Skeleton
  if (loading && !evidenceData) {
    return <CoIndirectSkeleton />;
  }

  // General Error State
  if (error && !evidenceData) {
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
          onClick={fetchIndirectEvidence}
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

  // Active Selected CO Item
  const coItems = evidenceData?.coEvidence || [];
  const selectedCoItem =
    coItems.find((item) => item.coCode === selectedCoCode) ||
    coItems[0] ||
    null;

  const currentCoCode = selectedCoItem?.coCode || selectedCoCode || 'CO1';
  const currentCoStatement = selectedCoItem?.coStatement || '';

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', paddingBottom: 60 }}>
      {/* 1. Header with breadcrumbs, context pills, and dual-scope switcher */}
      <CoIndirectAttainmentHeader
        programmeBatchId={programmeBatchId}
        programmeBatchCourseId={programmeBatchCourseId}
        batchName={evidenceData?.batchName}
        programmeName={evidenceData?.programmeName}
        courseCode={evidenceData?.courseCode}
        courseName={evidenceData?.courseName}
        semester={evidenceData?.semester}
        courseCoordinator={evidenceData?.courseCoordinatorName}
        coCode={currentCoCode}
        coStatement={currentCoStatement}
        coScope={coScope}
        onCoScopeChange={handleCoScopeChange}
        onSelectCo={handleSelectCo}
        availableCos={availableCos}
        outcomeCode={urlOutcomeCode}
        outcomeType={urlOutcomeType}
      />

      {/* 2. Top Summary Cards (5 Metrics + Selected CO Attainment Summary if in SELECTED mode) */}
      <CoIndirectSummaryCard
        coCode={currentCoCode}
        coScope={coScope}
        overallIndirectAttainment={evidenceData?.overallIndirectAttainment}
        overallIndirectPercentage={evidenceData?.overallIndirectPercentage}
        totalSurveyResponses={evidenceData?.totalSurveyResponses}
        assessmentMethod={evidenceData?.assessmentMethod}
        indirectWeight={evidenceData?.indirectWeight}
        indirectAttainment={selectedCoItem?.indirectAttainment}
        indirectScore={selectedCoItem?.indirectScore}
        coOverallIndirectPercentage={selectedCoItem?.overallIndirectPercentage}
        target={selectedCoItem?.coTargetLevel}
        targetMet={selectedCoItem?.coTargetMet}
      />

      {/* 3. Empty State banner when zero survey responses exist */}
      {evidenceData?.totalSurveyResponses === 0 && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <AlertCircle size={20} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>
            <strong style={{ color: '#0f172a' }}>No Survey Responses Recorded:</strong> No Course-End Survey responses have been submitted for this course offering yet. Attainment values reflect initial baseline state.
          </div>
        </div>
      )}

      {/* 4. Body Content: Selected-CO Drilldown vs All-CO Overview */}
      {coScope === 'SELECTED' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Charts Row: Response Distribution (left) + Target vs Attainment (right) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: 20,
            }}
          >
            <CoIndirectDistributionChart
              coCode={currentCoCode}
              coItem={selectedCoItem}
              levelDistribution={selectedCoItem?.levelDistribution}
              responseCount={selectedCoItem?.validResponseCount}
              level1Count={selectedCoItem?.level1Count}
              level2Count={selectedCoItem?.level2Count}
              level3Count={selectedCoItem?.level3Count}
              validResponseCount={selectedCoItem?.validResponseCount}
              level1Percentage={selectedCoItem?.level1Percentage}
              level2Percentage={selectedCoItem?.level2Percentage}
              level3Percentage={selectedCoItem?.level3Percentage}
            />

            <CoIndirectTargetChart
              coCode={currentCoCode}
              attainment={selectedCoItem?.indirectAttainment ?? selectedCoItem?.indirectScore}
              target={selectedCoItem?.coTargetLevel}
              targetMet={selectedCoItem?.coTargetMet}
            />
          </div>

          {/* 3-Step Interpretation Card */}
          <CoIndirectInterpretationPanel
            coCode={currentCoCode}
            validResponseCount={selectedCoItem?.validResponseCount || 0}
            level1Count={selectedCoItem?.level1Count || 0}
            level2Count={selectedCoItem?.level2Count || 0}
            level3Count={selectedCoItem?.level3Count || 0}
            indirectAttainment={selectedCoItem?.indirectAttainment}
            indirectScore={selectedCoItem?.indirectScore}
            overallIndirectPercentage={selectedCoItem?.overallIndirectPercentage}
            coTargetLevel={selectedCoItem?.coTargetLevel}
            coTargetMet={selectedCoItem?.coTargetMet}
          />

          {/* Privacy-Safe Survey Response Evidence Table */}
          <CoIndirectResponseTable
            responseRecords={selectedCoItem?.responseRecords || []}
            coCode={currentCoCode}
            validResponseCount={selectedCoItem?.validResponseCount || 0}
          />
        </div>
      ) : (
        /* All-CO Mode Overview */
        <CoIndirectAllOverview
          courseOutcomes={availableCos}
          coEvidence={coItems}
          onSelectCo={handleSelectCo}
        />
      )}
    </div>
  );
}
