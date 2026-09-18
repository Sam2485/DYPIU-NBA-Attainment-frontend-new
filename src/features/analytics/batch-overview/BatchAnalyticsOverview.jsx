import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import BatchContextBlock from './BatchContextBlock';
import PoPsoHealthSection from './PoPsoHealthSection';
import AttentionAreasCard from './AttentionAreasCard';
import AttainmentSourcesSection from './AttainmentSourcesSection';
import CourseContributionsCard from './CourseContributionsCard';
import InvestigationActionsTiles from './InvestigationActionsTiles';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const skeletonItem = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite ease-in-out',
  borderRadius: 10,
};

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
            height: 380,
            ...skeletonItem,
          }}
        />
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            height: 380,
            ...skeletonItem,
          }}
        />
      </div>

      {/* Attention Areas Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          height: 220,
          ...skeletonItem,
        }}
      />

      {/* Attainment Sources Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          height: 240,
          ...skeletonItem,
        }}
      />

      {/* Course Contributions Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          height: 200,
          ...skeletonItem,
        }}
      />

      {/* Action Tiles Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
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

export default function BatchAnalyticsOverview() {
  const { programmeBatchId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    if (!programmeBatchId) {
      setError('No Programme Batch identifier provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await analyticsApi.getBatchOverview(programmeBatchId);
      const payload = res?.data ?? res;
      if (payload) {
        setData(payload);
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
      setLoading(false);
    }
  }, [programmeBatchId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleSelectOutcome = (outcomeCode, outcomeType = 'PO') => {
    navigate(
      `/po-pso-attainment?programmeBatchId=${programmeBatchId}&outcomeCode=${outcomeCode}&outcomeType=${outcomeType}`
    );
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
            onClick={fetchOverview}
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

      {/* 2. PO / PSO Health — Primary Visual Section */}
      <PoPsoHealthSection
        poHealth={data.poHealth || []}
        psoHealth={data.psoHealth || []}
        summary={data.summary || {}}
        onSelectOutcome={handleSelectOutcome}
      />

      {/* 3. Attention Areas */}
      <AttentionAreasCard
        attentionAreas={data.attentionAreas || []}
        programmeBatchId={programmeBatchId}
        onSelectOutcome={handleSelectOutcome}
      />

      {/* 4. Attainment Sources (Direct vs Indirect) */}
      <AttainmentSourcesSection
        directIndirect={data.directIndirect || {}}
        programmeBatchId={programmeBatchId}
      />

      {/* 5. Course Contribution Overview */}
      <CourseContributionsCard
        courseContributions={data.courseContributions || []}
        programmeBatchId={programmeBatchId}
      />

      {/* 6. Investigation & Actions */}
      <InvestigationActionsTiles
        programmeIndirect={data.programmeIndirect || {}}
        programmeAtr={data.programmeAtr || {}}
        courseAtr={data.courseAtr || {}}
        historical={data.historical || {}}
        programmeBatchId={programmeBatchId}
      />
    </div>
  );
}
