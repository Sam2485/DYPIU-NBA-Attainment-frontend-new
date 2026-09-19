import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { analyticsApi, academicApi } from '../../../api';
import HistoricalAttainmentChart from './HistoricalAttainmentChart';
import LatestBatchContextCard from './LatestBatchContextCard';
import DirectVsIndirectHistoricalChart from './DirectVsIndirectHistoricalChart';
import OutcomeHeatmapMatrix from './OutcomeHeatmapMatrix';
import { ArrowLeft, GitCompare, RefreshCw, AlertCircle, School, GraduationCap } from 'lucide-react';

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
  const { masterProgrammeId: paramProgId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Resolve masterProgrammeId from route param or query param
  const masterProgrammeId = paramProgId || searchParams.get('masterProgrammeId') || '';
  const initialOutcome = searchParams.get('outcomeCode') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [programmeDetails, setProgrammeDetails] = useState(null);

  const [selectedOutcomeCode, setSelectedOutcomeCode] = useState(initialOutcome || 'PO1');
  const [selectedOutcomeType, setSelectedOutcomeType] = useState('PO');

  const [allProgrammes, setAllProgrammes] = useState([]);

  // Fetch all programmes for selector/fallback
  useEffect(() => {
    academicApi.getMasterProgrammes()
      .then((res) => {
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : (payload?.data || []);
        setAllProgrammes(list);
        if (!masterProgrammeId && list.length > 0) {
          navigate(`/analytics/programme/${list[0].id}/historical`, { replace: true });
        }
      })
      .catch((err) => {
        console.error('[HistoricalProgrammeAttainmentView] Error loading programmes list:', err);
      });
  }, [masterProgrammeId, navigate]);

  // Load Programme metadata (e.g. School name) if available
  useEffect(() => {
    if (!masterProgrammeId) return;
    academicApi.getProgrammeById(masterProgrammeId)
      .then((res) => {
        const payload = res?.data ?? res;
        setProgrammeDetails(payload);
      })
      .catch(() => {
        // Silently ignore if not found or unauthorized for full academic entity
      });
  }, [masterProgrammeId]);

  // Load Historical Programme Attainment
  const fetchHistoricalData = useCallback(async () => {
    if (!masterProgrammeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call endpoint without outcomeCode filter so we receive all data points for both heatmap and selected chart
      const res = await analyticsApi.getHistoricalProgrammeAttainment({
        masterProgrammeId,
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
  }, [masterProgrammeId, initialOutcome]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  const handleOutcomeChange = (code) => {
    const cleanCode = code.toUpperCase();
    const type = cleanCode.startsWith('PSO') ? 'PSO' : 'PO';
    setSelectedOutcomeCode(code);
    setSelectedOutcomeType(type);

    // Update URL param without refreshing
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('outcomeCode', code);
      return next;
    }, { replace: true });
  };

  const handleBack = () => {
    navigate(-1);
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
            <span>Back</span>
          </button>
        </div>
      </div>
    );
  }

  const completedBatches = data?.batches || [];
  const outcomes = sortOutcomesAscending(data?.outcomes || []);
  const dataPoints = data?.dataPoints || [];
  const programmeName = data?.programmeName || programmeDetails?.name || 'Programme';
  const schoolName = programmeDetails?.schoolName || programmeDetails?.department?.schoolName || '';

  // Identify latest completed batch (last in chronological order)
  const latestBatch = completedBatches.length > 0 ? completedBatches[completedBatches.length - 1] : null;
  const latestDataPoint = latestBatch
    ? dataPoints.find(
        (dp) => dp.batchId === latestBatch.batchId && (dp.outcomeCode || '').toUpperCase() === selectedOutcomeCode.toUpperCase()
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
              <span>Back</span>
            </button>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em' }}>
              ANALYTICS / PROGRAMME / HISTORICAL ATTAINMENT
            </span>
          </div>

          {/* Action: Compare Batches Button */}
          <button
            type="button"
            onClick={() => navigate('/analytics/compare-batches')}
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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Historical Programme Attainment
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 8px 0', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0284c7' }}>
              {programmeName}
            </span>
            {allProgrammes.length > 1 && (
              <select
                value={masterProgrammeId}
                onChange={(e) => navigate(`/analytics/programme/${e.target.value}/historical`)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {allProgrammes.map((p) => (
                  <option key={p.id} value={p.id}>
                    Switch Programme: {p.name}
                  </option>
                ))}
              </select>
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
              <span>{completedBatches.length} Completed Batches in scope</span>
            </div>
            <span>Excludes active/in-progress batches</span>
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

      {completedBatches.length === 0 ? (
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
          No completed batch attainment data is available for this programme.
        </div>
      ) : (
        <>
          {/* SECTION 1: Main Historical Attainment (Vertical Stacked Direct + Indirect) */}
          <HistoricalAttainmentChart
            batches={completedBatches}
            dataPoints={dataPoints}
            selectedOutcomeCode={selectedOutcomeCode}
            selectedOutcomeType={selectedOutcomeType}
          />

          {/* SECTION 2: Latest Batch Context */}
          <LatestBatchContextCard
            latestBatch={latestBatch}
            latestDataPoint={latestDataPoint}
            selectedOutcomeCode={selectedOutcomeCode}
            selectedOutcomeType={selectedOutcomeType}
          />

          {/* SECTION 3: Direct vs Indirect Historical Comparison (Vertical Grouped Bars) */}
          <DirectVsIndirectHistoricalChart
            batches={completedBatches}
            dataPoints={dataPoints}
            selectedOutcomeCode={selectedOutcomeCode}
          />

          {/* SECTION 4: PO/PSO x Batch Overview (Heatmap Matrix) */}
          <OutcomeHeatmapMatrix
            batches={completedBatches}
            outcomes={outcomes}
            dataPoints={dataPoints}
            selectedOutcomeCode={selectedOutcomeCode}
            onSelectOutcome={(code, type) => {
              setSelectedOutcomeCode(code);
              setSelectedOutcomeType(type);
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('outcomeCode', code);
                return next;
              }, { replace: true });
            }}
          />
        </>
      )}
    </div>
  );
}
