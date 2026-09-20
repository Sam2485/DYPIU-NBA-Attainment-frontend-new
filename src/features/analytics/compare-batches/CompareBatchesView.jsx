import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { analyticsApi, academicApi } from '../../../api';
import ComparisonSlotSelector from './ComparisonSlotSelector';
import BatchFinalAttainmentComparisonChart from './BatchFinalAttainmentComparisonChart';
import BatchDirectAttainmentComparisonChart from './BatchDirectAttainmentComparisonChart';
import BatchIndirectAttainmentComparisonChart from './BatchIndirectAttainmentComparisonChart';
import { ArrowLeft, RefreshCw, AlertCircle, GitCompare, ChevronDown, ChevronUp } from 'lucide-react';

const BATCH_1_COLOR = '#0284c7';
const BATCH_2_COLOR = '#8b5cf6';

export default function CompareBatchesView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentBatchId =
    searchParams.get('currentBatchId') ||
    searchParams.get('programmeBatchId') ||
    searchParams.get('programmeBatchId1') ||
    '';
  const paramBatch1 = searchParams.get('programmeBatchId1') || '';
  const paramBatch2 = searchParams.get('programmeBatchId2') || '';

  const [slot1, setSlot1] = useState(null);
  const [slot2, setSlot2] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(true);

  // Fetch comparison from backend
  const fetchComparison = useCallback(async (id1, id2) => {
    if (!id1 || !id2) return;
    if (id1 === id2) {
      setError('Cannot compare a batch to itself. Please select two different batches.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await analyticsApi.compareBatches({
        programmeBatchId1: id1,
        programmeBatchId2: id2,
      });

      const payload = res?.data ?? res;
      if (payload) {
        setComparisonData(payload);
        // Populate slots from backend authoritative metadata
        if (payload.batch1) {
          setSlot1(payload.batch1);
        }
        if (payload.batch2) {
          setSlot2(payload.batch2);
        }
        setIsSelectorOpen(false); // collapse selector after comparison loads
      } else {
        setError('No comparison data returned from server.');
      }
    } catch (err) {
      console.error('[CompareBatchesView] Comparison error:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch batch comparison data. Please verify your permissions.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Pre-fill Slot 1 by default with the current investigating batch if present
  useEffect(() => {
    if (paramBatch1 && paramBatch2) {
      fetchComparison(paramBatch1, paramBatch2);
      return;
    }

    const defaultBatchId = currentBatchId || paramBatch1;
    if (defaultBatchId && !slot1) {
      academicApi
        .getBatchById(defaultBatchId)
        .then((res) => {
          const payload = res?.data ?? res;
          if (payload) {
            setSlot1({
              programmeId: payload.masterProgrammeId,
              programmeName: payload.programmeName || payload.name || 'Programme',
              batchId: payload.id,
              batchName: payload.name || `Batch ${payload.startYear}-${payload.endYear}`,
              startYear: payload.startYear,
              endYear: payload.endYear,
              status: payload.status || 'ACTIVE',
            });
          }
        })
        .catch((err) => {
          console.warn('[CompareBatchesView] Could not load current batch for Slot 1:', err);
        });
    }
  }, [paramBatch1, paramBatch2, currentBatchId, fetchComparison, slot1]);

  const handleAddSlot = (slotData) => {
    if (!slot1) {
      setSlot1(slotData);
    } else if (!slot2) {
      setSlot2(slotData);
    }
  };

  const handleRemoveSlot = (slotNumber) => {
    if (slotNumber === 1) {
      setSlot1(null);
    } else if (slotNumber === 2) {
      setSlot2(null);
    }
    setComparisonData(null);
    setIsSelectorOpen(true);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (slotNumber === 1) {
          next.delete('programmeBatchId1');
          next.delete('currentBatchId');
          next.delete('programmeBatchId');
        } else {
          next.delete('programmeBatchId2');
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleCompareClick = () => {
    if (!slot1 || !slot2) return;
    setSearchParams(
      { programmeBatchId1: slot1.batchId, programmeBatchId2: slot2.batchId },
      { replace: true }
    );
    fetchComparison(slot1.batchId, slot2.batchId);
  };

  const handleBack = () => {
    const returnBatchId = currentBatchId || slot1?.batchId;
    if (returnBatchId) {
      navigate(`/analytics/batch/${returnBatchId}`);
    } else {
      navigate(-1);
    }
  };

  const batch1Meta = comparisonData?.batch1 || slot1;
  const batch2Meta = comparisonData?.batch2 || slot2;
  const outcomes = comparisonData?.outcomes || [];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Header & Breadcrumbs */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#94a3b8';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em' }}>
              ANALYTICS / BATCHES / COMPARE BATCHES
            </span>
          </div>

          {comparisonData && (
            <button
              type="button"
              onClick={() => setIsSelectorOpen((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              <GitCompare size={14} color="#0284c7" />
              <span>{isSelectorOpen ? 'Hide Batch Selector' : 'Change Selected Batches'}</span>
              {isSelectorOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Compare Programme Batches
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Side-by-side PO &amp; PSO attainment comparison between any two programme batches.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span style={{ fontSize: 13.5, color: '#991b1b', fontWeight: 600 }}>{error}</span>
          </div>
          {slot1 && slot2 && (
            <button
              type="button"
              onClick={handleCompareClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Batch Selection Panel (collapsible once compared) */}
      {(isSelectorOpen || !comparisonData) && (
        <ComparisonSlotSelector
          slot1={slot1}
          slot2={slot2}
          initialProgrammeId={slot1?.programmeId}
          onAddSlot={handleAddSlot}
          onRemoveSlot={handleRemoveSlot}
          onCompare={handleCompareClick}
          isLoading={loading}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '60px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            marginBottom: 24,
          }}
        >
          <RefreshCw
            size={28}
            color="#0284c7"
            style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }}
          />
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            Computing Comparative Attainment Metrics...
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Aggregating Direct, Indirect, and Target attainment for both cohorts
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {!loading && comparisonData && (
        <>
          {/* Comparison Overview Header Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '20px 24px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            {/* Batch 1 Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: BATCH_1_COLOR,
                }}
              />
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Batch 1
                </span>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {batch1Meta?.programmeName} — {batch1Meta?.batchName}
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: '#94a3b8',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 999,
                padding: '4px 12px',
              }}
            >
              VS
            </div>

            {/* Batch 2 Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: BATCH_2_COLOR,
                }}
              />
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Batch 2
                </span>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {batch2Meta?.programmeName} — {batch2Meta?.batchName}
                </div>
              </div>
            </div>
          </div>

          {/* CHART 1: Final Attainment Comparison (Side-by-Side Grouped Bars) */}
          <BatchFinalAttainmentComparisonChart
            outcomes={outcomes}
            batch1={comparisonData.batch1}
            batch2={comparisonData.batch2}
            color1={BATCH_1_COLOR}
            color2={BATCH_2_COLOR}
          />

          {/* CHART 2: Direct Attainment Comparison */}
          <BatchDirectAttainmentComparisonChart
            outcomes={outcomes}
            batch1={comparisonData.batch1}
            batch2={comparisonData.batch2}
            color1={BATCH_1_COLOR}
            color2={BATCH_2_COLOR}
          />

          {/* CHART 3: Indirect Attainment Comparison */}
          <BatchIndirectAttainmentComparisonChart
            outcomes={outcomes}
            batch1={comparisonData.batch1}
            batch2={comparisonData.batch2}
            color1={BATCH_1_COLOR}
            color2={BATCH_2_COLOR}
          />
        </>
      )}
    </div>
  );
}
