import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import OutcomeDirectHeader from './OutcomeDirectHeader';
import OutcomeDirectSummary from './OutcomeDirectSummary';
import OutcomeDirectAttainmentChart from './OutcomeDirectAttainmentChart';
import CourseContributionChart from './CourseContributionChart';
import CourseContributionTable from './CourseContributionTable';
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

const skeletonItem = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite ease-in-out',
  borderRadius: 10,
};

function DirectDrilldownSkeleton() {
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

      {/* Summary Skeleton */}
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

      {/* Course Contribution Chart Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          height: 340,
          ...skeletonItem,
        }}
      />

      {/* Course List Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          height: 280,
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

export default function OutcomeDirectDrilldownView() {
  const { programmeBatchId, outcomeType = 'PO', outcomeCode = 'PO1' } = useParams();
  const navigate = useNavigate();

  const currentType = (outcomeType || 'PO').toUpperCase();
  const currentCode = (outcomeCode || 'PO1').toUpperCase();

  const [data, setData] = useState(null);
  const [availableOutcomes, setAvailableOutcomes] = useState([]);
  const [batchContext, setBatchContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

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
        // Non-critical: dropdown will fallback to current outcome
        console.warn('[OutcomeDirectDrilldownView] Unable to load full batch outcome list:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [programmeBatchId]);

  // Fetch authoritative outcome direct drilldown data
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
      const res = await analyticsApi.getOutcomeDirectDrilldown({
        programmeBatchId,
        outcomeCode: currentCode,
        outcomeType: currentType,
      });

      const payload = res?.data ?? res;
      if (payload) {
        setData(payload);
      } else {
        setError('Direct attainment details are currently unavailable.');
      }
    } catch (err) {
      console.error('[OutcomeDirectDrilldownView] Error fetching direct drilldown:', err);
      if (err?.response?.status === 403) {
        setIsForbidden(true);
        setError('You do not have permission to view direct attainment for this batch.');
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to load direct attainment details.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [programmeBatchId, currentCode, currentType]);

  useEffect(() => {
    fetchDrilldown();
  }, [fetchDrilldown]);

  // Handle switching outcomes from the dropdown: updates canonical route without whole-page refresh
  const handleSelectOutcome = (newCode, newType) => {
    if (newCode === currentCode && newType === currentType) return;
    navigate(`/analytics/batch/${programmeBatchId}/direct/${newType}/${newCode}`);
  };

  if (loading) {
    return <DirectDrilldownSkeleton />;
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
          {isForbidden ? 'Access Denied' : 'Unable to load direct attainment'}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Header with Breadcrumbs, Outcome Dropdown & Definition */}
      <OutcomeDirectHeader
        programmeBatchId={programmeBatchId}
        batchName={batchDisplayName}
        programmeName={programmeName}
        schoolName={schoolName}
        outcomeCode={data.outcomeCode || currentCode}
        outcomeType={data.outcomeType || currentType}
        outcomeStatement={data.outcomeStatement}
        availableOutcomes={availableOutcomes}
        onSelectOutcome={handleSelectOutcome}
      />

      {/* 2. Top Summary Metric Cards */}
      <OutcomeDirectSummary
        outcomeCode={data.outcomeCode || currentCode}
        outcomeType={data.outcomeType || currentType}
        directAttainment={data.directAttainment}
        target={data.target}
        directGap={data.directGap}
        targetMet={data.targetMet}
        contributingCourseCount={data.contributingCourseCount}
      />

      {/* 3. Direct Attainment vs Target Visual (STRICTLY VERTICAL BAR CHART) */}
      <OutcomeDirectAttainmentChart
        outcomeCode={data.outcomeCode || currentCode}
        outcomeType={data.outcomeType || currentType}
        directAttainment={data.directAttainment}
        target={data.target}
        directGap={data.directGap}
        targetMet={data.targetMet}
      />

      {/* 4. Course Contributions Analytical Chart (STRICTLY VERTICAL BAR CHART) */}
      <CourseContributionChart
        courses={data.courses || []}
        outcomeCode={data.outcomeCode || currentCode}
        outcomeType={data.outcomeType || currentType}
        programmeBatchId={programmeBatchId}
      />

      {/* 5. Course Contributions List / Table with Show All & View Details */}
      <CourseContributionTable
        courses={data.courses || []}
        contributingCourseCount={data.contributingCourseCount}
        outcomeCode={data.outcomeCode || currentCode}
        outcomeType={data.outcomeType || currentType}
        programmeBatchId={programmeBatchId}
      />
    </div>
  );
}
