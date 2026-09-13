import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { analyticsApi } from '../../../api';
import StudentEvidenceModal from './StudentEvidenceModal';
import {
  Layers,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Search,
  X,
  TrendingUp,
  Users,
} from 'lucide-react';

/**
 * Format numerical values safely to 2 decimal places.
 */
function formatNumber(val) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return num.toFixed(2);
}

/**
 * Format ISO datetime string.
 */
function formatDateTime(dtStr) {
  if (!dtStr) return '—';
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dtStr;
  }
}

/**
 * Returns color tokens for ATR status.
 */
function getAtrBadgeStyle(status, hasAtr) {
  if (!hasAtr || !status) {
    return { label: 'No ATR Recorded', bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' };
  }
  const upper = status.toUpperCase();
  switch (upper) {
    case 'APPROVED':
      return { label: 'Approved', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
    case 'VERIFIED':
    case 'SUBMITTED_FOR_VERIFICATION':
    case 'PENDING_APPROVAL':
    case 'SUBMITTED':
      return { label: 'In Verification', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
    case 'NEEDS_REVISION':
    case 'REVISION_REQUESTED':
    case 'REJECTED':
      return { label: 'Revision Required', bg: '#fff1f2', text: '#be123c', border: '#fda4af' };
    case 'DRAFT':
      return { label: 'Draft', bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
    default:
      return { label: upper.replace(/_/g, ' '), bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  }
}

export default function ProgrammeDiagnosticSection({
  _selectedSchoolId = null,
  _selectedDepartmentId = null,
  selectedMasterProgrammeId = null,
  selectedProgrammeBatchId = null,
  programmeBatches = [],
  activeProgramme = null,
  activeDepartment = null,
  activeSchool = null,
  onSelectBatch = () => {},
  onClearProgramme = () => {},
}) {
  const [poHealth, setPoHealth] = useState([]);
  const [psoHealth, setPsoHealth] = useState([]);
  const [trends, setTrends] = useState([]);
  const [atrIntelligence, setAtrIntelligence] = useState(null);

  const [isLoadingMain, setIsLoadingMain] = useState(false);
  const [mainError, setMainError] = useState(null);

  // Active outcome selected for deep drill-down
  const [selectedOutcome, setSelectedOutcome] = useState(null); // { code: 'PO4', type: 'PO' | 'PSO', ... }
  const [courseEvidence, setCourseEvidence] = useState([]);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState(null);
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [selectedCoForStudentEvidence, setSelectedCoForStudentEvidence] = useState(null);

  const requestCounterRef = useRef(0);
  const evidenceRequestRef = useRef(0);

  // Batches belonging to this master programme
  const programmeSpecificBatches = useMemo(() => {
    if (!selectedMasterProgrammeId) return [];
    return programmeBatches.filter(
      (b) => b.masterProgrammeId === selectedMasterProgrammeId && !b.deletedAt
    );
  }, [programmeBatches, selectedMasterProgrammeId]);

  // Determine the effective batch ID for single-cohort diagnosis
  const effectiveBatchId = useMemo(() => {
    if (selectedProgrammeBatchId) return selectedProgrammeBatchId;
    if (programmeSpecificBatches.length > 0) return programmeSpecificBatches[0].id;
    return null;
  }, [selectedProgrammeBatchId, programmeSpecificBatches]);

  // Fetch Main Programme Diagnostic Data
  const loadDiagnosticData = useCallback(async () => {
    if (!selectedMasterProgrammeId) {
      setPoHealth([]);
      setPsoHealth([]);
      setTrends([]);
      setAtrIntelligence(null);
      return;
    }

    const reqId = ++requestCounterRef.current;
    setIsLoadingMain(true);
    setMainError(null);

    try {
      const scopeParams = {
        masterProgrammeId: selectedMasterProgrammeId,
        programmeBatchId: effectiveBatchId || undefined,
      };

      const [poRes, psoRes, trendsRes, atrRes] = await Promise.all([
        analyticsApi.getPoHealth(scopeParams),
        analyticsApi.getPsoHealth(scopeParams),
        analyticsApi.getTrends({ masterProgrammeId: selectedMasterProgrammeId }),
        analyticsApi.getAtrIntelligence(scopeParams),
      ]);

      if (reqId === requestCounterRef.current) {
        const poData = poRes?.data?.data ?? poRes?.data ?? [];
        const psoData = psoRes?.data?.data ?? psoRes?.data ?? [];
        const trendsData = trendsRes?.data?.data ?? trendsRes?.data ?? [];
        const atrData = atrRes?.data?.data ?? atrRes?.data ?? null;

        setPoHealth(Array.isArray(poData) ? poData : []);
        setPsoHealth(Array.isArray(psoData) ? psoData : []);
        setTrends(Array.isArray(trendsData) ? trendsData : []);
        setAtrIntelligence(atrData);

        // Auto-select first deficit or first PO if none selected
        const deficits = Array.isArray(poData) ? poData.filter((p) => p.gap !== null && p.gap < 0) : [];
        if (deficits.length > 0) {
          setSelectedOutcome((prev) => prev || { ...deficits[0], type: 'PO', code: deficits[0].poCode });
        } else if (poData.length > 0) {
          setSelectedOutcome((prev) => prev || { ...poData[0], type: 'PO', code: poData[0].poCode });
        }
      }
    } catch (err) {
      if (reqId === requestCounterRef.current) {
        console.error('Failed to load Programme Diagnostic Analytics:', err);
        setMainError('Unable to load Programme Diagnostic Analytics. Please try again.');
      }
    } finally {
      if (reqId === requestCounterRef.current) {
        setIsLoadingMain(false);
      }
    }
  }, [selectedMasterProgrammeId, effectiveBatchId]);

  useEffect(() => {
    loadDiagnosticData();
  }, [loadDiagnosticData]);

  // Fetch Course/CO Evidence for Selected Outcome
  const loadCourseEvidence = useCallback(async (outcome) => {
    if (!outcome || !effectiveBatchId) {
      setCourseEvidence([]);
      return;
    }

    const reqId = ++evidenceRequestRef.current;
    setIsLoadingEvidence(true);
    setEvidenceError(null);

    try {
      const res = await analyticsApi.getCourseEvidence({
        programmeBatchId: effectiveBatchId,
        outcomeCode: outcome.code || outcome.poCode || outcome.psoCode,
        outcomeType: outcome.type || (outcome.psoCode ? 'PSO' : 'PO'),
      });

      if (reqId === evidenceRequestRef.current) {
        const data = res?.data?.data ?? res?.data ?? [];
        setCourseEvidence(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (reqId === evidenceRequestRef.current) {
        console.error('Failed to load course evidence:', err);
        setEvidenceError('Unable to load associated course/CO evidence.');
      }
    } finally {
      if (reqId === evidenceRequestRef.current) {
        setIsLoadingEvidence(false);
      }
    }
  }, [effectiveBatchId]);

  useEffect(() => {
    if (selectedOutcome) {
      loadCourseEvidence(selectedOutcome);
    }
  }, [selectedOutcome, loadCourseEvidence]);

  // Derived evidence metrics
  const poMetCount = poHealth.filter((p) => p.targetMet).length;
  const poTotalCount = poHealth.length;
  const poDeficitCount = poTotalCount - poMetCount;

  const psoMetCount = psoHealth.filter((p) => p.targetMet).length;
  const psoTotalCount = psoHealth.length;
  const psoDeficitCount = psoTotalCount - psoMetCount;

  // Largest deficit outcome across POs and PSOs
  const largestDeficit = useMemo(() => {
    let worst = null;
    poHealth.forEach((p) => {
      if (p.gap !== null && p.gap < 0) {
        if (!worst || p.gap < worst.gap) {
          worst = { ...p, type: 'PO', code: p.poCode };
        }
      }
    });
    psoHealth.forEach((p) => {
      if (p.gap !== null && p.gap < 0) {
        if (!worst || p.gap < worst.gap) {
          worst = { ...p, type: 'PSO', code: p.psoCode };
        }
      }
    });
    return worst;
  }, [poHealth, psoHealth]);

  // Historical data points for selected outcome
  const outcomeHistoricalPoints = useMemo(() => {
    if (!selectedOutcome || trends.length === 0) return [];
    const code = (selectedOutcome.code || selectedOutcome.poCode || selectedOutcome.psoCode || '').toUpperCase().trim();
    const series = trends[0]; // Programme level series
    if (!series || !series.cohortDataPoints) return [];

    return series.cohortDataPoints
      .filter((p) => p.outcomeCode && p.outcomeCode.toUpperCase().trim() === code)
      .sort((a, b) => (a.startYear || 0) - (b.startYear || 0));
  }, [selectedOutcome, trends]);

  // Associated ATR record for selected outcome
  const outcomeAtrRecord = useMemo(() => {
    if (!selectedOutcome || !atrIntelligence || !atrIntelligence.gapAtrRecords) return null;
    const code = (selectedOutcome.code || selectedOutcome.poCode || selectedOutcome.psoCode || '').toUpperCase().trim();
    return atrIntelligence.gapAtrRecords.find(
      (r) => r.outcomeCode && r.outcomeCode.toUpperCase().trim() === code
    );
  }, [selectedOutcome, atrIntelligence]);

  // Filtered course evidence
  const filteredCourseEvidence = useMemo(() => {
    if (!evidenceSearch.trim()) return courseEvidence;
    const q = evidenceSearch.toLowerCase().trim();
    return courseEvidence.filter(
      (c) =>
        (c.courseCode || '').toLowerCase().includes(q) ||
        (c.courseName || '').toLowerCase().includes(q) ||
        (c.coCode || '').toLowerCase().includes(q) ||
        (c.courseCoordinatorName || '').toLowerCase().includes(q)
    );
  }, [courseEvidence, evidenceSearch]);

  // If no programme selected, render compact contextual prompt
  if (!selectedMasterProgrammeId) {
    return (
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px dashed #cbd5e1',
            borderRadius: 14,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'inline-grid',
              placeItems: 'center',
              marginBottom: 10,
            }}
          >
            <BookOpen size={20} />
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            Programme Diagnostic Analytics
          </h4>
          <p style={{ margin: '0 auto', fontSize: 13, color: '#64748b', maxWidth: 520, lineHeight: 1.5 }}>
            Select a programme from the <strong>Programme Landscape</strong> below or choose one from the top scope selector to launch deep diagnostic intelligence across outcomes, course/CO evidence, and ATR continuous improvement records.
          </p>
        </div>
      </div>
    );
  }

  const progName = activeProgramme?.name || 'Selected Programme';
  const progCode = activeProgramme?.code || '';
  const deptName = activeDepartment?.name || '';
  const schName = activeSchool?.name || '';

  return (
    <div style={{ marginBottom: 28 }}>
      {/* 1. Header with Programme Context and Return Button */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#0284c7',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                padding: '2px 8px',
                borderRadius: 6,
                textTransform: 'uppercase',
              }}
            >
              Phase 8 Deep Diagnostic
            </span>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              {progName} {progCode ? `(${progCode})` : ''}
            </h3>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
            {deptName} • {schName} • Outcome Diagnostics, Mapped CO/Course Evidence & ATR Closed-Loop Actions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Batch Selector Dropdown within Programme */}
          {programmeSpecificBatches.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Cohort:</span>
              <select
                value={effectiveBatchId || ''}
                aria-label="Select cohort batch for diagnostic"
                onChange={(e) => onSelectBatch(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                }}
              >
                {programmeSpecificBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.startYear}-{b.endYear})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={loadDiagnosticData}
            disabled={isLoadingMain}
            title="Refresh Diagnostic Data"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: '#475569',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              cursor: isLoadingMain ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={13} style={{ animation: isLoadingMain ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>

          <button
            onClick={onClearProgramme}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: '#0284c7',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={13} />
            Back to Landscape
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 22,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Main Error */}
        {mainError && (
          <div
            style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecdd3',
              borderRadius: 8,
              color: '#b91c1c',
              fontSize: 13,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} />
              <span>{mainError}</span>
            </div>
            <button
              onClick={loadDiagnosticData}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#b91c1c',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* 2. Evidence-Driven "Where to Focus" Panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {/* PO Health Summary */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Programme Outcomes (PO)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <strong style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                {isLoadingMain ? '—' : `${poMetCount} / ${poTotalCount} Met`}
              </strong>
              {poDeficitCount > 0 ? (
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#e11d48' }}>
                  {poDeficitCount} Deficit{poDeficitCount > 1 ? 's' : ''}
                </span>
              ) : (
                <CheckCircle2 size={16} color="#15803d" />
              )}
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Criterion 3 Attainment Status</span>
          </div>

          {/* PSO Health Summary */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Programme Specific Outcomes (PSO)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <strong style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                {isLoadingMain ? '—' : psoTotalCount > 0 ? `${psoMetCount} / ${psoTotalCount} Met` : 'None Configured'}
              </strong>
              {psoDeficitCount > 0 ? (
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#e11d48' }}>
                  {psoDeficitCount} Deficit{psoDeficitCount > 1 ? 's' : ''}
                </span>
              ) : (
                psoTotalCount > 0 && <CheckCircle2 size={16} color="#15803d" />
              )}
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Programme Boundary Isolated</span>
          </div>

          {/* Focus Area / Largest Deficit */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: largestDeficit ? '#fff1f2' : '#f0fdf4',
              border: `1px solid ${largestDeficit ? '#fecdd3' : '#bbf7d0'}`,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: largestDeficit ? '#9f1239' : '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Diagnostic Focus
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <strong style={{ fontSize: 15, fontWeight: 800, color: largestDeficit ? '#e11d48' : '#15803d' }}>
                {largestDeficit ? `${largestDeficit.code} (Gap: ${formatNumber(largestDeficit.gap)})` : 'All Outcomes Met'}
              </strong>
              {largestDeficit ? <AlertTriangle size={16} color="#e11d48" /> : <CheckCircle2 size={16} color="#15803d" />}
            </div>
            <span style={{ fontSize: 11, color: largestDeficit ? '#be123c' : '#16a34a' }}>
              {largestDeficit ? 'Largest observed target deficit' : 'No target deficits detected'}
            </span>
          </div>

          {/* ATR Coverage in Programme */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CQI & ATR Action Status
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <strong style={{ fontSize: 18, fontWeight: 800, color: '#7e22ce' }}>
                {atrIntelligence ? `${atrIntelligence.gapsWithAtr} / ${atrIntelligence.totalGapsInScope} Covered` : '—'}
              </strong>
              <FileText size={16} color="#7e22ce" />
            </div>
            <span style={{ fontSize: 11, color: '#9333ea' }}>
              {atrIntelligence && atrIntelligence.totalGapsInScope === 0
                ? 'No deficits requiring ATR'
                : `${atrIntelligence?.gapsWithoutAtr || 0} gap(s) missing ATR`}
            </span>
          </div>
        </div>

        {/* 3. PO Diagnostic Matrix Table */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Programme Outcomes (PO1 - PO12) Diagnostic Matrix
            </h4>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              Click any outcome row to inspect detailed CO evidence and historical trajectory
            </span>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>PO Code</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, minWidth: 200 }}>Outcome Statement</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Target</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Direct</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Indirect</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Attained</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Gap</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingMain ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '24px 0', textAlign: 'center', color: '#64748b' }}>
                      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite', marginBottom: 6 }} />
                      <div>Loading PO diagnostic matrix...</div>
                    </td>
                  </tr>
                ) : poHealth.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '24px 0', textAlign: 'center', color: '#64748b' }}>
                      No finalized PO attainment data found for this programme cohort.
                    </td>
                  </tr>
                ) : (
                  poHealth.map((item) => {
                    const isSelected =
                      selectedOutcome &&
                      (selectedOutcome.code || selectedOutcome.poCode) === item.poCode &&
                      selectedOutcome.type === 'PO';
                    const isDeficit = item.gap !== null && item.gap < 0;

                    return (
                      <tr
                        key={item.poCode}
                        onClick={() => setSelectedOutcome({ ...item, type: 'PO', code: item.poCode })}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          background: isSelected ? '#f0f9ff' : isDeficit ? '#fffdfd' : '#ffffff',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0284c7' }}>
                          {item.poCode}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#334155', maxWidth: 280 }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.statement || `Programme Outcome ${item.poCode}`}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                          {formatNumber(item.targetLevel)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>
                          {formatNumber(item.directAttainment)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>
                          {formatNumber(item.indirectAttainment)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {formatNumber(item.finalAttainment)}
                        </td>
                        <td
                          style={{
                            padding: '10px 12px',
                            textAlign: 'right',
                            fontWeight: 800,
                            color: isDeficit ? '#e11d48' : '#15803d',
                          }}
                        >
                          {formatNumber(item.gap)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: item.targetMet ? '#15803d' : '#e11d48',
                              background: item.targetMet ? '#f0fdf4' : '#fff1f2',
                              border: `1px solid ${item.targetMet ? '#bbf7d0' : '#fecdd3'}`,
                              padding: '2px 8px',
                              borderRadius: 6,
                            }}
                          >
                            {item.targetMet ? 'Met' : 'Deficit'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOutcome({ ...item, type: 'PO', code: item.poCode });
                            }}
                            style={{
                              padding: '3px 8px',
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 5,
                              border: '1px solid #cbd5e1',
                              background: isSelected ? '#0284c7' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#475569',
                              cursor: 'pointer',
                            }}
                          >
                            {isSelected ? 'Active' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. PSO Diagnostic Matrix (If PSOs exist) */}
        {psoHealth.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                Programme Specific Outcomes (PSO) Diagnostic Matrix
              </h4>
              <span style={{ fontSize: 11, color: '#64748b' }}>
                Isolated to {progName} boundary
              </span>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>PSO Code</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, minWidth: 200 }}>Outcome Statement</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Target</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Direct</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Indirect</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Attained</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Gap</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {psoHealth.map((item) => {
                    const isSelected =
                      selectedOutcome &&
                      (selectedOutcome.code || selectedOutcome.psoCode) === item.psoCode &&
                      selectedOutcome.type === 'PSO';
                    const isDeficit = item.gap !== null && item.gap < 0;

                    return (
                      <tr
                        key={item.psoCode}
                        onClick={() => setSelectedOutcome({ ...item, type: 'PSO', code: item.psoCode })}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          background: isSelected ? '#f0f9ff' : isDeficit ? '#fffdfd' : '#ffffff',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#7e22ce' }}>
                          {item.psoCode}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#334155', maxWidth: 280 }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.statement || `Programme Specific Outcome ${item.psoCode}`}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                          {formatNumber(item.targetLevel)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>
                          {formatNumber(item.directAttainment)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>
                          {formatNumber(item.indirectAttainment)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {formatNumber(item.finalAttainment)}
                        </td>
                        <td
                          style={{
                            padding: '10px 12px',
                            textAlign: 'right',
                            fontWeight: 800,
                            color: isDeficit ? '#e11d48' : '#15803d',
                          }}
                        >
                          {formatNumber(item.gap)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: item.targetMet ? '#15803d' : '#e11d48',
                              background: item.targetMet ? '#f0fdf4' : '#fff1f2',
                              border: `1px solid ${item.targetMet ? '#bbf7d0' : '#fecdd3'}`,
                              padding: '2px 8px',
                              borderRadius: 6,
                            }}
                          >
                            {item.targetMet ? 'Met' : 'Deficit'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOutcome({ ...item, type: 'PSO', code: item.psoCode });
                            }}
                            style={{
                              padding: '3px 8px',
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 5,
                              border: '1px solid #cbd5e1',
                              background: isSelected ? '#7e22ce' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#475569',
                              cursor: 'pointer',
                            }}
                          >
                            {isSelected ? 'Active' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Selected Outcome Deep Diagnostic Drill-Down Section */}
        {selectedOutcome && (
          <div
            style={{
              padding: 20,
              background: '#f8fafc',
              borderRadius: 12,
              border: '1px solid #cbd5e1',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
            }}
          >
            {/* Outcome Detail Header */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: selectedOutcome.type === 'PSO' ? '#7e22ce' : '#0284c7',
                      background: selectedOutcome.type === 'PSO' ? '#faf5ff' : '#f0f9ff',
                      border: `1px solid ${selectedOutcome.type === 'PSO' ? '#e9d5ff' : '#bae6fd'}`,
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {selectedOutcome.code || selectedOutcome.poCode || selectedOutcome.psoCode}
                  </span>
                  <strong style={{ fontSize: 15, color: '#0f172a' }}>
                    Outcome Evidence Chain & Diagnostic Deep-Dive
                  </strong>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.5, maxWidth: 680 }}>
                  {selectedOutcome.statement || `Detailed diagnosis for outcome ${selectedOutcome.code}`}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Metric Badges */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Target vs Attained
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {formatNumber(selectedOutcome.targetLevel || selectedOutcome.configuredTarget)} $\rightarrow${' '}
                    {formatNumber(selectedOutcome.finalAttainment || selectedOutcome.attainedValue)}
                  </div>
                </div>
                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: (selectedOutcome.gap || 0) < 0 ? '#fff1f2' : '#f0fdf4',
                    border: `1px solid ${(selectedOutcome.gap || 0) < 0 ? '#fecdd3' : '#bbf7d0'}`,
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: (selectedOutcome.gap || 0) < 0 ? '#9f1239' : '#166534' }}>
                    GAP DELTA
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: (selectedOutcome.gap || 0) < 0 ? '#e11d48' : '#15803d' }}>
                    {formatNumber(selectedOutcome.gap)}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct vs. Indirect Breakdown Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 10,
                background: '#ffffff',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                marginBottom: 16,
              }}
            >
              <div>
                <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>DIRECT ATTAINMENT (80%)</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                  {formatNumber(selectedOutcome.directAttainment)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>INDIRECT ATTAINMENT (20%)</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                  {formatNumber(selectedOutcome.indirectAttainment)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>OVERALL WEIGHTED</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', marginTop: 2 }}>
                  {formatNumber(selectedOutcome.finalAttainment || selectedOutcome.attainedValue)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>CRITERION 3 STATUS</span>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: selectedOutcome.targetMet ? '#15803d' : '#e11d48',
                    marginTop: 2,
                  }}
                >
                  {selectedOutcome.targetMet ? 'Target Achieved' : 'Deficit Benchmark'}
                </div>
              </div>
            </div>

            {/* Longitudinal Historical Trajectory for This Specific Outcome */}
            {outcomeHistoricalPoints.length > 0 && (
              <div style={{ marginBottom: 18, background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={15} color="#0284c7" />
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>
                      Historical Cohort Trajectory ({selectedOutcome.code || selectedOutcome.poCode || selectedOutcome.psoCode})
                    </strong>
                  </div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    {outcomeHistoricalPoints.length} available finalized cohort(s)
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '6px 10px', fontWeight: 700 }}>Cohort Batch</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700 }}>Period</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'right' }}>Target (Snapshot)</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'right' }}>Direct</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'right' }}>Indirect</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'right' }}>Attained</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'right' }}>Gap</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'center' }}>Target Met</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outcomeHistoricalPoints.map((pt, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 10px', fontWeight: 600, color: '#0f172a' }}>{pt.batchName}</td>
                          <td style={{ padding: '6px 10px', color: '#64748b' }}>
                            {pt.startYear} - {pt.endYear}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#475569' }}>
                            {formatNumber(pt.configuredTarget)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#64748b' }}>
                            {formatNumber(pt.directAttainment)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#64748b' }}>
                            {formatNumber(pt.indirectAttainment)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            {formatNumber(pt.overallAttainment)}
                          </td>
                          <td
                            style={{
                              padding: '6px 10px',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: pt.targetMet ? '#15803d' : '#e11d48',
                            }}
                          >
                            {formatNumber(pt.gap)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: pt.targetMet ? '#15803d' : '#e11d48',
                              }}
                            >
                              {pt.targetMet ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mapped CO -> Course Evidence Chain */}
            <div style={{ marginBottom: 18, background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={15} color="#0284c7" />
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>
                      Mapped Course & CO Evidence Chain
                    </strong>
                  </div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    Courses articulating to {selectedOutcome.code || selectedOutcome.poCode || selectedOutcome.psoCode} (mapping indicates pedagogical alignment, not direct individual causality)
                  </span>
                </div>

                {/* Evidence Search */}
                <div style={{ position: 'relative', width: 220 }}>
                  <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 8, top: 8 }} />
                  <input
                    type="text"
                    placeholder="Search course or CO..."
                    aria-label="Search mapped course or CO code"
                    value={evidenceSearch}
                    onChange={(e) => setEvidenceSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px 4px 26px',
                      fontSize: 11.5,
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {evidenceSearch && (
                    <button
                      onClick={() => setEvidenceSearch('')}
                      aria-label="Clear evidence search input"
                      style={{
                        position: 'absolute',
                        right: 6,
                        top: 6,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: 0,
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {isLoadingEvidence ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: 12.5 }}>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginBottom: 4 }} />
                  <div>Loading course assessment evidence...</div>
                </div>
              ) : evidenceError ? (
                <div style={{ padding: 12, background: '#fef2f2', color: '#b91c1c', fontSize: 12, borderRadius: 6 }}>
                  {evidenceError}
                </div>
              ) : filteredCourseEvidence.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                  {courseEvidence.length === 0
                    ? 'No mapped course or CO records found for this outcome in the selected cohort report.'
                    : 'No course evidence matches your search query.'}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '6px 10px', fontWeight: 700 }}>Course Code</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700 }}>Course Name</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700 }}>Sem</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700 }}>Coordinator</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700 }}>CO Code</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'center' }}>Strength</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'right' }}>CO Target</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'right' }}>CO Direct</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'right' }}>CO Indirect</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'right' }}>CO Attained</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'center' }}>Target Met</th>
                        <th style={{ padding: '6px 10px', fontWeight: 700, textAlign: 'center' }}>Student Evidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourseEvidence.map((ev, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 10px', fontWeight: 700, color: '#0284c7' }}>
                            {ev.courseCode}
                          </td>
                          <td style={{ padding: '6px 10px', color: '#1e293b', maxWidth: 180 }}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ev.courseName}
                            </div>
                          </td>
                          <td style={{ padding: '6px 10px', color: '#64748b' }}>Sem {ev.semester || '—'}</td>
                          <td style={{ padding: '6px 10px', color: '#64748b', maxWidth: 140 }}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ev.courseCoordinatorName || '—'}
                            </div>
                          </td>
                          <td style={{ padding: '6px 10px', fontWeight: 700, color: '#0f172a' }}>
                            {ev.coCode}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: '#f1f5f9',
                                color: '#334155',
                              }}
                            >
                              {ev.mappingStrength || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#475569' }}>
                            {formatNumber(ev.coTarget)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#64748b' }}>
                            {formatNumber(ev.coDirectAttainment)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#64748b' }}>
                            {formatNumber(ev.coIndirectAttainment)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            {formatNumber(ev.coOverallAttainment)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: ev.coTargetMet ? '#15803d' : '#e11d48',
                              }}
                            >
                              {ev.coTargetMet ? 'Met' : 'Deficit'}
                            </span>
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                            <button
                              onClick={() => setSelectedCoForStudentEvidence({
                                programmeBatchCourseId: ev.courseOfferingId,
                                coCode: ev.coCode,
                                courseName: ev.courseName,
                                courseCode: ev.courseCode,
                                courseCoordinatorName: ev.courseCoordinatorName,
                              })}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                fontSize: 11,
                                fontWeight: 600,
                                borderRadius: 5,
                                border: '1px solid #bae6fd',
                                background: '#f0f9ff',
                                color: '#0284c7',
                                cursor: 'pointer',
                              }}
                              title="View student performance distribution & mark records"
                            >
                              <Users size={11} />
                              Drill-Down
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ATR Improvement Actions for This Specific Outcome */}
            <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={15} color="#0284c7" />
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>
                    Action Taken Report (ATR) Improvement Plan
                  </strong>
                </div>
                {outcomeAtrRecord ? (
                  (() => {
                    const badge = getAtrBadgeStyle(outcomeAtrRecord.atrStatus, outcomeAtrRecord.hasRecordedAtr);
                    return (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: badge.text,
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {badge.label}
                      </span>
                    );
                  })()
                ) : (
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>No ATR Record</span>
                )}
              </div>

              {outcomeAtrRecord && outcomeAtrRecord.hasRecordedAtr ? (
                <div>
                  {/* Action Points */}
                  {Array.isArray(outcomeAtrRecord.recordedActions) && outcomeAtrRecord.recordedActions.length > 0 ? (
                    <div style={{ marginBottom: 10, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#166534', display: 'block', marginBottom: 4 }}>
                        Recorded Remedial & Pedagogical Actions:
                      </span>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                        {outcomeAtrRecord.recordedActions.map((act, idx) => (
                          <li key={idx} style={{ marginBottom: 2 }}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 8 }}>
                      No discrete action items listed in report JSON.
                    </div>
                  )}

                  {/* Observations & Comments */}
                  {outcomeAtrRecord.recordedObservations && (
                    <div style={{ fontSize: 12, color: '#334155', background: '#f8fafc', padding: '8px 12px', borderRadius: 6, marginBottom: 8 }}>
                      <strong style={{ color: '#0f172a' }}>Observations / Comments: </strong>
                      {outcomeAtrRecord.recordedObservations}
                    </div>
                  )}

                  {/* Sign-off audit */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, color: '#64748b', marginTop: 6, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                    {outcomeAtrRecord.submittedBy && (
                      <span><strong>Submitted by:</strong> {outcomeAtrRecord.submittedBy} ({formatDateTime(outcomeAtrRecord.submittedAt)})</span>
                    )}
                    {outcomeAtrRecord.verifiedBy && (
                      <span><strong>Verified by:</strong> {outcomeAtrRecord.verifiedBy} ({formatDateTime(outcomeAtrRecord.verifiedAt)})</span>
                    )}
                    {outcomeAtrRecord.approvedBy && (
                      <span><strong>Approved by:</strong> {outcomeAtrRecord.approvedBy} ({formatDateTime(outcomeAtrRecord.approvedAt)})</span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#64748b', padding: '8px 0' }}>
                  {(selectedOutcome.gap || 0) < 0
                    ? 'No Action Taken Report (ATR) has been recorded for this target deficit in the active cohort.'
                    : 'Target is met for this outcome. No corrective Action Taken Report is required.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 6. Student Evidence & Performance Drill-Down Modal (Phase 9) */}
      <StudentEvidenceModal
        isOpen={!!selectedCoForStudentEvidence}
        onClose={() => setSelectedCoForStudentEvidence(null)}
        programmeBatchCourseId={selectedCoForStudentEvidence?.programmeBatchCourseId}
        coCode={selectedCoForStudentEvidence?.coCode}
        coDetails={selectedCoForStudentEvidence}
      />
    </div>
  );
}
