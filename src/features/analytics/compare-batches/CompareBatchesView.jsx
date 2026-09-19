import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../../api';
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

  // Sync initial URL params if provided
  useEffect(() => {
    if (paramBatch1 && paramBatch2) {
      fetchComparison(paramBatch1, paramBatch2);
    }
  }, [paramBatch1, paramBatch2, fetchComparison]);

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
  };

  const handleCompareClick = () => {
    if (!slot1 || !slot2) return;
    setSearchParams(
      { programmeBatchId1: slot1.batchId, programmeBatchId2: slot2.batchId },
      { replace: true }
    );
    fetchComparison(slot1.batchId, slot2.batchId);
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
              onClick={() => navigate(-1)}
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
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            Loading side-by-side comparison...
          </div>
          <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
            Aggregating direct, indirect, and final attainment levels for both batches
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {!loading && comparisonData && (
        <>
          {/* Comparison Header Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '20px 24px',
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {/* Batch 1 Side */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: '#f0f9ff',
                  border: `1.5px solid ${BATCH_1_COLOR}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: BATCH_1_COLOR, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Batch 1
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      background: batch1Meta?.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                      color: batch1Meta?.status === 'ACTIVE' ? '#15803d' : '#475569',
                      border: `1px solid ${batch1Meta?.status === 'ACTIVE' ? '#bbf7d0' : '#cbd5e1'}`,
                    }}
                  >
                    {batch1Meta?.status || 'ACTIVE'}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  {batch1Meta?.batchName}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                  {batch1Meta?.programmeName}
                </div>
              </div>

              {/* VS Divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 900,
                  color: '#475569',
                }}
              >
                VS
              </div>

              {/* Batch 2 Side */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: '#f5f3ff',
                  border: `1.5px solid ${BATCH_2_COLOR}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: BATCH_2_COLOR, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Batch 2
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      background: batch2Meta?.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                      color: batch2Meta?.status === 'ACTIVE' ? '#15803d' : '#475569',
                      border: `1px solid ${batch2Meta?.status === 'ACTIVE' ? '#bbf7d0' : '#cbd5e1'}`,
                    }}
                  >
                    {batch2Meta?.status || 'ACTIVE'}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  {batch2Meta?.batchName}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                  {batch2Meta?.programmeName}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: Final Attainment Comparison Chart */}
          <BatchFinalAttainmentComparisonChart
            outcomes={outcomes}
            batch1Meta={batch1Meta}
            batch2Meta={batch2Meta}
          />

          {/* SECTION 2: Direct Attainment Comparison Chart */}
          <BatchDirectAttainmentComparisonChart
            outcomes={outcomes}
            batch1Meta={batch1Meta}
            batch2Meta={batch2Meta}
          />

          {/* SECTION 3: Indirect Attainment Comparison Chart */}
          <BatchIndirectAttainmentComparisonChart
            outcomes={outcomes}
            batch1Meta={batch1Meta}
            batch2Meta={batch2Meta}
          />
        </>
      )}

      {/* Empty State when no batches are selected yet */}
      {!loading && !comparisonData && !error && (
        <div
          style={{
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: 14,
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <GitCompare size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            Select Two Batches to Begin Comparison
          </div>
          <div style={{ fontSize: 12.5, color: '#64748b', maxWidth: 460, margin: '0 auto' }}>
            Choose a programme and batch in the selector above, add them to Slot 1 and Slot 2, then click
            &ldquo;Compare Batches&rdquo; to view side-by-side vertical attainment charts.
          </div>
        </div>
      )}
    </div>
  );
}
