import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import BatchContextBlock from './BatchContextBlock';
import PoPsoHealthSection from './PoPsoHealthSection';
import AttainmentSourcesSection from './AttainmentSourcesSection';
import InvestigationActionsTiles from './InvestigationActionsTiles';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const skeletonItem = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite ease-in-out',
  borderRadius: 10,
};

function sortOutcomesAscending(outcomes = []) {
  return [...outcomes].sort((a, b) => {
    const codeA = a.poCode || a.psoCode || '';
    const codeB = b.poCode || b.psoCode || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function BatchOverviewSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
          height: 140,
          ...skeletonItem,
        }}
      />

      {/* PO / PSO Health Split Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 20,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            height: 340,
            ...skeletonItem,
          }}
        />
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            height: 340,
            ...skeletonItem,
          }}
        />
      </div>

      {/* Programme Attainment Sources Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          height: 260,
          ...skeletonItem,
        }}
      />

      {/* Action Tiles Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              height: 120,
              ...skeletonItem,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Client-side in-memory cache for Batch Analytics Overview (60s TTL, SWR pattern)
const batchOverviewCache = new Map(); // programmeBatchId -> { data, timestamp }
const inFlightBatchRequests = new Map(); // programmeBatchId -> Promise
const BATCH_OVERVIEW_TTL = 60 * 1000;

export default function BatchAnalyticsOverview() {
  const { programmeBatchId } = useParams();
  const navigate = useNavigate();

  const cachedEntry = programmeBatchId ? batchOverviewCache.get(programmeBatchId) : null;
  const isFresh = cachedEntry && (Date.now() - cachedEntry.timestamp < BATCH_OVERVIEW_TTL);

  const [data, setData] = useState(() => cachedEntry?.data ?? null);
  const [loading, setLoading] = useState(() => !cachedEntry?.data);
  const [error, setError] = useState(null);

  // Active selected outcome for deep-dive investigation across sections
  const [selectedOutcomeCode, setSelectedOutcomeCode] = useState(() => {
    if (cachedEntry?.data?.poHealth?.length > 0) return cachedEntry.data.poHealth[0].poCode;
    if (cachedEntry?.data?.psoHealth?.length > 0) return cachedEntry.data.psoHealth[0].psoCode;
    return '';
  });
  const [selectedOutcomeType, setSelectedOutcomeType] = useState(() => {
    if (cachedEntry?.data?.poHealth?.length > 0) return 'PO';
    if (cachedEntry?.data?.psoHealth?.length > 0) return 'PSO';
    return 'PO';
  });

  const fetchOverview = useCallback(async (forceRefresh = false) => {
    if (!programmeBatchId) {
      setError('No Programme Batch identifier provided.');
      setLoading(false);
      return;
    }

    const cached = batchOverviewCache.get(programmeBatchId);
    const hasFreshData = cached && (Date.now() - cached.timestamp < BATCH_OVERVIEW_TTL);

    if (!forceRefresh && hasFreshData) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Only display full-screen skeleton if we have no prior data to show
    if (!cached?.data) {
      setLoading(true);
    }
    setError(null);

    try {
      let requestPromise = inFlightBatchRequests.get(programmeBatchId);
      if (!requestPromise) {
        requestPromise = analyticsApi.getBatchOverview(programmeBatchId);
        inFlightBatchRequests.set(programmeBatchId, requestPromise);
      }

      const res = await requestPromise;
      const payload = res?.data ?? res;
      if (payload) {
        // Enforce clean ascending order on POs and PSOs
        const sortedPo = sortOutcomesAscending(payload.poHealth || []);
        const sortedPso = sortOutcomesAscending(payload.psoHealth || []);

        const formatted = {
          ...payload,
          poHealth: sortedPo,
          psoHealth: sortedPso,
        };

        batchOverviewCache.set(programmeBatchId, {
          data: formatted,
          timestamp: Date.now(),
        });

        setData(formatted);

        // Auto-select initial outcome if none selected
        if (!selectedOutcomeCode) {
          if (sortedPo.length > 0) {
            setSelectedOutcomeCode(sortedPo[0].poCode);
            setSelectedOutcomeType('PO');
          } else if (sortedPso.length > 0) {
            setSelectedOutcomeCode(sortedPso[0].psoCode);
            setSelectedOutcomeType('PSO');
          }
        }
      } else {
        setError('Batch analytics data is currently unavailable.');
      }
    } catch (err) {
      console.error('[BatchAnalyticsOverview] Error loading batch overview:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load batch analytics overview. Please check network connection or verify authorization.'
      );
    } finally {
      inFlightBatchRequests.delete(programmeBatchId);
      setLoading(false);
    }
  }, [programmeBatchId, selectedOutcomeCode]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleSelectOutcome = (outcomeCode, outcomeType = 'PO') => {
    setSelectedOutcomeCode(outcomeCode);
    setSelectedOutcomeType(outcomeType);
  };

  if (loading) {
    return <BatchOverviewSkeleton />;
  }

  if (error) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #fecaca',
          borderRadius: 14,
          padding: '36px 24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          maxWidth: 580,
          margin: '40px auto',
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}
        >
          <AlertCircle size={24} color="#dc2626" />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          Unable to load batch analytics
        </h2>

        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
          {error}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => fetchOverview(true)}
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

          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
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
            <span>Back to Live Batches</span>
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Header — Batch Context */}
      <BatchContextBlock batch={data.batch} />

      {/* 2. PO / PSO Health — Primary Visual Section (Vertical Bars with Crossing Target Markers in Ascending Order) */}
      <PoPsoHealthSection
        poHealth={data.poHealth || []}
        psoHealth={data.psoHealth || []}
        summary={data.summary || {}}
        selectedOutcomeCode={selectedOutcomeCode}
        onSelectOutcome={handleSelectOutcome}
      />

      {/* 3. Programme Attainment Sources (PO/PSO Selector in Ascending Order + Outcome-Specific Direct/Indirect Cards) */}
      <AttainmentSourcesSection
        poHealth={data.poHealth || []}
        psoHealth={data.psoHealth || []}
        directIndirect={data.directIndirect || {}}
        selectedOutcomeCode={selectedOutcomeCode}
        selectedOutcomeType={selectedOutcomeType}
        onSelectOutcome={handleSelectOutcome}
        programmeBatchId={programmeBatchId}
      />

      {/* 4. Investigation & Actions (Programme Indirect, Programme ATR, Historical Comparison) */}
      <InvestigationActionsTiles
        programmeIndirect={data.programmeIndirect || {}}
        programmeAtr={data.programmeAtr || {}}
        historical={data.historical || {}}
        programmeBatchId={programmeBatchId}
      />
    </div>
  );
}
