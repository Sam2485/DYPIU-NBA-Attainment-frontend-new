import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { analyticsApi, academicApi } from '../../../api';
import HistoricalAttainmentChart from './HistoricalAttainmentChart';
import LatestBatchContextCard from './LatestBatchContextCard';
import DirectVsIndirectHistoricalChart from './DirectVsIndirectHistoricalChart';
import OutcomeHeatmapMatrix from './OutcomeHeatmapMatrix';
import { ArrowLeft, GitCompare, RefreshCw, AlertCircle, School, GraduationCap, Compass } from 'lucide-react';

const PO_COLOR = '#0284c7';
const PSO_COLOR = '#16a34a';

function sortOutcomesAscending(outcomes = []) {
  const poList = [];
  const psoList = [];
  const otherList = [];

  outcomes.forEach((code) => {
    const upper = (code || '').toUpperCase();
    if (upper.startsWith('PSO')) {
      psoList.push(code);
    } else if (upper.startsWith('PO')) {
      poList.push(code);
    } else {
      otherList.push(code);
    }
  });

  const naturalSort = (a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  };

  poList.sort(naturalSort);
  psoList.sort(naturalSort);
  otherList.sort(naturalSort);

  return [...poList, ...psoList, ...otherList];
}

export default function HistoricalProgrammeAttainmentView() {
  const { programmeBatchId, masterProgrammeId: paramProgId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Rooted in the batch we came from
  const batchId =
    programmeBatchId ||
    searchParams.get('programmeBatchId') ||
    searchParams.get('currentBatchId') ||
    '';
  const masterProgrammeId = paramProgId || searchParams.get('masterProgrammeId') || '';
  const initialOutcome = searchParams.get('outcomeCode') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);
  const [programmeDetails, setProgrammeDetails] = useState(null);

  const [selectedOutcomeCode, setSelectedOutcomeCode] = useState(initialOutcome || 'PO1');
  const [selectedOutcomeType, setSelectedOutcomeType] = useState('PO');

  // Load batch metadata if batchId is provided
  useEffect(() => {
    if (!batchId) return;
    academicApi
      .getBatchById(batchId)
      .then((res) => {
        const payload = res?.data ?? res;
        if (payload) {
          setBatchDetails(payload);
        }
      })
      .catch((err) => {
        console.warn('[HistoricalProgrammeAttainmentView] Unable to fetch batch metadata:', err);
      });
  }, [batchId]);

  // Load Historical Programme Attainment (no programme or batch selectors; rooted in current batch)
  const fetchHistoricalData = useCallback(async () => {
    if (!batchId && !masterProgrammeId) {
      setLoading(false);
      setError('No batch or programme identifier was provided.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await analyticsApi.getHistoricalProgrammeAttainment({
        programmeBatchId: batchId || undefined,
        masterProgrammeId: (!batchId && masterProgrammeId) ? masterProgrammeId : undefined,
      });

      const payload = res?.data ?? res;
      if (payload) {
        setData(payload);

        // Sort outcomes canonically
        const sortedOutcomes = sortOutcomesAscending(payload.outcomes || []);

        // Validate or set selected outcome
        if (initialOutcome && sortedOutcomes.some((o) => o.toUpperCase() === initialOutcome.toUpperCase())) {
          const match = sortedOutcomes.find((o) => o.toUpperCase() === initialOutcome.toUpperCase());
          setSelectedOutcomeCode(match);
          setSelectedOutcomeType(match.toUpperCase().startsWith('PSO') ? 'PSO' : 'PO');
        } else if (sortedOutcomes.length > 0) {
          const first = sortedOutcomes[0];
          setSelectedOutcomeCode(first);
          setSelectedOutcomeType(first.toUpperCase().startsWith('PSO') ? 'PSO' : 'PO');
        }
      } else {
        setError('Historical programme attainment details are unavailable.');
      }
    } catch (err) {
      console.error('[HistoricalProgrammeAttainment] Error loading historical data:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load historical programme attainment. Please check network connection or verify authorization.'
      );
    } finally {
      setLoading(false);
    }
  }, [batchId, masterProgrammeId, initialOutcome]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  // Fetch programme metadata (School name, etc.) once masterProgrammeId is known
  const effectiveProgId = data?.masterProgrammeId || batchDetails?.masterProgrammeId || masterProgrammeId;
  useEffect(() => {
    if (!effectiveProgId) return;
    academicApi
      .getProgrammeById(effectiveProgId)
      .then((res) => {
        const payload = res?.data ?? res;
        setProgrammeDetails(payload);
      })
      .catch(() => {
        // Silently ignore if unauthorized or not found
      });
  }, [effectiveProgId]);

  const handleOutcomeChange = (code) => {
    const cleanCode = code.toUpperCase();
    const type = cleanCode.startsWith('PSO') ? 'PSO' : 'PO';
    setSelectedOutcomeCode(code);
    setSelectedOutcomeType(type);

    // Update URL param without refreshing
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('outcomeCode', code);
        return next;
      },
      { replace: true }
    );
  };

  const handleBack = () => {
    if (batchId) {
      navigate(`/analytics/batch/${batchId}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '36px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ height: 120, background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 24 }} />
        <div style={{ height: 340, background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 24 }} />
        <div style={{ height: 260, background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }} />
      </div>
    );
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
          Unable to load historical attainment
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
          {error}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={fetchHistoricalData}
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
            onClick={handleBack}
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
            <span>Back to Batch</span>
          </button>
        </div>
      </div>
    );
  }

  const allBatches = data?.batches || [];
  const outcomes = sortOutcomesAscending(data?.outcomes || []);
  const dataPoints = data?.dataPoints || [];
  const programmeName = data?.programmeName || batchDetails?.programmeName || programmeDetails?.name || 'Programme';
  const schoolName = programmeDetails?.schoolName || programmeDetails?.department?.schoolName || '';

  // Current investigating batch
  const currentBatchId = data?.currentBatchId || batchId;
  const investigatingBatch =
    allBatches.find((b) => b.batchId === currentBatchId) ||
    (batchDetails
      ? {
          batchId: batchDetails.id,
          batchName: batchDetails.name,
          startYear: batchDetails.startYear,
          endYear: batchDetails.endYear,
          status: batchDetails.status,
        }
      : null);

  // Reference batch for context card: current batch if present, else latest batch
  const referenceBatch = investigatingBatch || (allBatches.length > 0 ? allBatches[allBatches.length - 1] : null);
  const referenceDataPoint = referenceBatch
    ? dataPoints.find(
        (dp) =>
          dp.batchId === referenceBatch.batchId &&
          (dp.outcomeCode || '').toUpperCase() === selectedOutcomeCode.toUpperCase()
      )
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Header Container */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          marginBottom: 24,
        }}
      >
        {/* Breadcrumb & Navigation Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Batch Analytics</span>
            </button>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em' }}>
              ANALYTICS / BATCH / HISTORICAL ATTAINMENT
            </span>
          </div>

          {/* Action: Compare Batches Button */}
          <button
            type="button"
            onClick={() =>
              navigate(
                currentBatchId
                  ? `/analytics/compare-batches?currentBatchId=${currentBatchId}`
                  : '/analytics/compare-batches'
              )
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.borderColor = '#0284c7';
              e.currentTarget.style.color = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#0f172a';
            }}
          >
            <GitCompare size={15} color="#0284c7" />
            <span>Compare Batches</span>
          </button>
        </div>

        {/* Programme Title & Metadata */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Historical Programme Attainment
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 8px 0', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0284c7' }}>
              {programmeName}
            </span>

            {/* Investigating Batch Indicator Badge */}
            {investigatingBatch && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#166534',
                }}
              >
                <Compass size={13} color="#16a34a" />
                <span>
                  Investigating Batch:{' '}
                  {investigatingBatch.batchName || `Batch ${investigatingBatch.startYear}-${investigatingBatch.endYear}`}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: investigatingBatch.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                    color: investigatingBatch.status === 'ACTIVE' ? '#15803d' : '#475569',
                    border: `1px solid ${investigatingBatch.status === 'ACTIVE' ? '#86efac' : '#cbd5e1'}`,
                  }}
                >
                  {investigatingBatch.status || 'ACTIVE'}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 12.5, color: '#64748b', flexWrap: 'wrap' }}>
            {schoolName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <School size={14} color="#94a3b8" />
                <span>{schoolName}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <GraduationCap size={14} color="#94a3b8" />
              <span>{allBatches.length} Batches in Programme Trend (Active & Completed)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Outcome Selector Dropdown Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label
            htmlFor="historical-outcome-select"
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Outcome
          </label>
          <select
            id="historical-outcome-select"
            value={selectedOutcomeCode}
            onChange={(e) => handleOutcomeChange(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              color: selectedOutcomeType === 'PO' ? PO_COLOR : PSO_COLOR,
              outline: 'none',
              cursor: 'pointer',
              minWidth: 160,
            }}
          >
            {outcomes.map((code) => {
              const isPso = code.toUpperCase().startsWith('PSO');
              return (
                <option key={code} value={code}>
                  {code} {isPso ? '(Programme Specific Outcome)' : '(Programme Outcome)'}
                </option>
              );
            })}
          </select>
        </div>

        <span style={{ fontSize: 12, color: '#64748b' }}>
          Select an outcome to update the historical composition and direct vs indirect breakdown below
        </span>
      </div>

      {allBatches.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '40px 24px',
            textAlign: 'center',
            color: '#64748b',
            fontSize: 13.5,
          }}
        >
          No batch attainment data is available for this programme.
        </div>
      ) : (
        <>
          {/* SECTION 1: Main Historical Attainment (Vertical Stacked Direct + Indirect) */}
          <HistoricalAttainmentChart
            batches={allBatches}
            dataPoints={dataPoints}
            selectedOutcomeCode={selectedOutcomeCode}
            selectedOutcomeType={selectedOutcomeType}
          />

          {/* SECTION 2: Reference / Investigating Batch Context */}
          <LatestBatchContextCard
            latestBatch={referenceBatch}
            latestDataPoint={referenceDataPoint}
            selectedOutcomeCode={selectedOutcomeCode}
            selectedOutcomeType={selectedOutcomeType}
          />

          {/* SECTION 3: Direct vs Indirect Historical Comparison (Vertical Grouped Bars) */}
          <DirectVsIndirectHistoricalChart
            batches={allBatches}
            dataPoints={dataPoints}
            selectedOutcomeCode={selectedOutcomeCode}
          />

          {/* SECTION 4: PO/PSO x Batch Overview (Heatmap Matrix) */}
          <OutcomeHeatmapMatrix
            batches={allBatches}
            outcomes={outcomes}
            dataPoints={dataPoints}
            selectedOutcomeCode={selectedOutcomeCode}
            onSelectOutcome={(code, type) => {
              setSelectedOutcomeCode(code);
              setSelectedOutcomeType(type);
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  next.set('outcomeCode', code);
                  return next;
                },
                { replace: true }
              );
            }}
          />
        </>
      )}
    </div>
  );
}
