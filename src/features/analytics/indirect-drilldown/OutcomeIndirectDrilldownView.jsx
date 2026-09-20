import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import OutcomeIndirectHeader from './OutcomeIndirectHeader';
import OutcomeIndirectSummary from './OutcomeIndirectSummary';
import OutcomeIndirectAttainmentChart from './OutcomeIndirectAttainmentChart';
import OutcomeIndirectEvidenceOverview from './OutcomeIndirectEvidenceOverview';
import OutcomeIndirectTimeline from './OutcomeIndirectTimeline';
import OutcomeIndirectTrendChart from './OutcomeIndirectTrendChart';
import OutcomeIndirectEvidenceTable from './OutcomeIndirectEvidenceTable';
import OutcomeIndirectFormationExplanation from './OutcomeIndirectFormationExplanation';
import IndirectEvidenceRecordModal from './IndirectEvidenceRecordModal';
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert, FileQuestion } from 'lucide-react';

const skeletonItem = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite ease-in-out',
  borderRadius: 10,
};

function IndirectDrilldownSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 24,
          height: 150,
          ...skeletonItem,
        }}
      />

      {/* Summary Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              height: 100,
              ...skeletonItem,
            }}
          />
        ))}
      </div>

      {/* Attainment Chart Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          height: 320,
          ...skeletonItem,
        }}
      />

      {/* Evidence Overview Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          height: 140,
          ...skeletonItem,
        }}
      />

      {/* Timeline Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          height: 360,
          ...skeletonItem,
        }}
      />
    </div>
  );
}

function sortOutcomesAscending(outcomes = []) {
  return [...outcomes].sort((a, b) => {
    const codeA = a.code || a.poCode || a.psoCode || '';
    const codeB = b.code || b.poCode || b.psoCode || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

export default function OutcomeIndirectDrilldownView() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Resolve programmeBatchId, outcomeCode, outcomeType from path params or query params
  const programmeBatchId = params.programmeBatchId || searchParams.get('programmeBatchId') || '';
  const paramType = params.outcomeType || searchParams.get('outcomeType') || 'PO';
  const paramCode = params.outcomeCode || searchParams.get('outcomeCode') || 'PO1';

  const currentType = (paramType || 'PO').toUpperCase();
  const currentCode = (paramCode || 'PO1').toUpperCase();

  const [data, setData] = useState(null);
  const [availableOutcomes, setAvailableOutcomes] = useState([]);
  const [batchContext, setBatchContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [selectedEvidenceRecord, setSelectedEvidenceRecord] = useState(null);

  // Fetch complete outcome catalog for the batch to populate the dropdown selector
  useEffect(() => {
    if (!programmeBatchId) return;

    let isMounted = true;
    analyticsApi
      .getBatchOverview(programmeBatchId)
      .then((res) => {
        if (!isMounted) return;
        const payload = res?.data ?? res;
        if (payload) {
          if (payload.batch) setBatchContext(payload.batch);

          const poList = (payload.poHealth || []).map((p) => ({
            code: p.poCode,
            type: 'PO',
            statement: p.poStatement,
          }));
          const psoList = (payload.psoHealth || []).map((p) => ({
            code: p.psoCode,
            type: 'PSO',
            statement: p.psoStatement,
          }));

          const combined = [
            ...sortOutcomesAscending(poList),
            ...sortOutcomesAscending(psoList),
          ];
          setAvailableOutcomes(combined);
        }
      })
      .catch((err) => {
        console.warn('[OutcomeIndirectDrilldownView] Unable to load full batch outcome list:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [programmeBatchId]);

  // Fetch authoritative outcome indirect drilldown data
  const fetchDrilldown = useCallback(async () => {
    if (!programmeBatchId) {
      setError('No Programme Batch identifier provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsForbidden(false);

    try {
      const res = await analyticsApi.getOutcomeIndirectDrilldown({
        programmeBatchId,
        outcomeCode: currentCode,
        outcomeType: currentType,
      });

      const payload = res?.data ?? res;
      if (payload) {
        setData(payload);
      } else {
        setError('Indirect attainment details are currently unavailable.');
      }
    } catch (err) {
      console.error('[OutcomeIndirectDrilldownView] Error fetching indirect drilldown:', err);
      if (err?.response?.status === 403) {
        setIsForbidden(true);
        setError('You do not have permission to view indirect attainment for this batch.');
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to load indirect attainment details.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [programmeBatchId, currentCode, currentType]);

  useEffect(() => {
    fetchDrilldown();
  }, [fetchDrilldown]);

  // Handle switching outcomes from the dropdown: updates canonical route
  const handleSelectOutcome = (newCode, newType) => {
    if (newCode === currentCode && newType === currentType) return;
    navigate(`/analytics/batch/${programmeBatchId}/indirect/${newType}/${newCode}`);
  };

  if (loading) {
    return <IndirectDrilldownSkeleton />;
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
          {isForbidden ? 'Access Denied' : 'Unable to load indirect attainment'}
        </h2>

        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
          {error}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {!isForbidden && (
            <button
              type="button"
              onClick={fetchDrilldown}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 8,
                background: '#0284c7',
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
            onClick={() => navigate(`/analytics/batch/${programmeBatchId}`)}
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
            <span>Back to Batch Analytics</span>
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const programmeName = batchContext?.programme?.name || '';
  const batchDisplayName = data.batchName || batchContext?.batchName || '';
  const schoolName = batchContext?.school?.name || '';
  const departmentName = batchContext?.department?.name || '';
  const coordinatorName = batchContext?.coordinatorName || '';

  const totalCount = data.totalEvidenceCount ?? 0;
  const participatingCount = data.participatingEvidenceCount ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Header with Breadcrumbs, Outcome Dropdown & Definition */}
      <OutcomeIndirectHeader
        programmeBatchId={programmeBatchId}
        batchName={batchDisplayName}
        programmeName={programmeName}
        schoolName={schoolName}
        departmentName={departmentName}
        coordinatorName={coordinatorName}
        outcomeCode={data.outcomeCode || currentCode}
        outcomeType={data.outcomeType || currentType}
        outcomeStatement={data.outcomeStatement}
        availableOutcomes={availableOutcomes}
        onSelectOutcome={handleSelectOutcome}
      />

      {/* 2. Top Summary Metric Cards */}
      <OutcomeIndirectSummary
        outcomeCode={data.outcomeCode || currentCode}
        outcomeType={data.outcomeType || currentType}
        indirectAttainment={data.indirectAttainment}
        target={data.target}
        indirectGap={data.indirectGap}
        targetMet={data.targetMet}
        totalEvidenceCount={totalCount}
        participatingEvidenceCount={participatingCount}
      />

      {/* 3. Indirect Attainment vs Target Visual (STRICTLY VERTICAL BAR CHART) */}
      <OutcomeIndirectAttainmentChart
        outcomeCode={data.outcomeCode || currentCode}
        outcomeType={data.outcomeType || currentType}
        indirectAttainment={data.indirectAttainment}
        target={data.target}
        indirectGap={data.indirectGap}
        targetMet={data.targetMet}
      />

      {/* 4. Empty State Handling */}
      {totalCount === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '36px 24px',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <FileQuestion size={22} color="#94a3b8" />
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            No Programme Indirect Evidence Recorded
          </h4>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            No programme indirect evidence is available for this batch. Indirect evaluations and exit survey responses have not been recorded yet.
          </p>
        </div>
      ) : participatingCount === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '30px 24px',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <AlertCircle size={22} color="#b45309" />
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            Outcome Not Evaluated in Recorded Evidence
          </h4>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Evidence exists for this batch ({totalCount} items), but <strong>{data.outcomeCode || currentCode}</strong> has not been evaluated in the available evidence sources.
          </p>
        </div>
      ) : null}

      {/* 5. Evidence Overview Breakdown (Total vs Participating) */}
      {totalCount > 0 && (
        <OutcomeIndirectEvidenceOverview
          outcomeCode={data.outcomeCode || currentCode}
          outcomeType={data.outcomeType || currentType}
          totalEvidenceCount={totalCount}
          participatingEvidenceCount={participatingCount}
        />
      )}

      {/* 6. Chronological Trend Visualization (Shown when >= 2 evaluated points exist) */}
      {participatingCount >= 2 && (
        <OutcomeIndirectTrendChart
          evidence={data.evidence || []}
          outcomeCode={data.outcomeCode || currentCode}
          outcomeType={data.outcomeType || currentType}
          target={data.target}
        />
      )}

      {/* 7. Programme Indirect Evidence Timeline */}
      {totalCount > 0 && (
        <OutcomeIndirectTimeline
          evidence={data.evidence || []}
          outcomeCode={data.outcomeCode || currentCode}
          outcomeType={data.outcomeType || currentType}
          onViewRecord={setSelectedEvidenceRecord}
        />
      )}

      {/* 8. Detailed Evidence Register / Table */}
      {totalCount > 0 && (
        <OutcomeIndirectEvidenceTable
          evidence={data.evidence || []}
          outcomeCode={data.outcomeCode || currentCode}
          outcomeType={data.outcomeType || currentType}
          totalEvidenceCount={totalCount}
          participatingEvidenceCount={participatingCount}
          onViewRecord={setSelectedEvidenceRecord}
        />
      )}

      {/* 9. Conceptual "How this attainment is formed" Explanation */}
      <OutcomeIndirectFormationExplanation
        outcomeCode={data.outcomeCode || currentCode}
        outcomeType={data.outcomeType || currentType}
        indirectAttainment={data.indirectAttainment}
        participatingEvidenceCount={participatingCount}
      />

      {/* 10. Indirect Evidence Complete Record Modal */}
      {selectedEvidenceRecord && (
        <IndirectEvidenceRecordModal
          isOpen={Boolean(selectedEvidenceRecord)}
          onClose={() => setSelectedEvidenceRecord(null)}
          evidenceItem={selectedEvidenceRecord}
          programmeBatchId={programmeBatchId}
          outcomes={availableOutcomes}
          currentOutcomeCode={data?.outcomeCode || currentCode}
        />
      )}
    </div>
  );
}
