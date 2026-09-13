import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { analyticsApi } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import {
  X,
  RefreshCw,
  AlertTriangle,
  Search,
  Users,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Check,
} from 'lucide-react';

/**
 * Format numerical value safely to 2 decimal places.
 */
function formatNumber(val) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return num.toFixed(2);
}

export default function StudentEvidenceModal({
  isOpen = false,
  onClose = () => {},
  programmeBatchCourseId = null,
  coCode = null,
  coDetails = null,
}) {
  const { role } = useAuth();
  const isIqacAdmin = role === 'IQAC' || role === 'SUPER_ADMIN' || role === 'ADMIN';

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'MET' | 'BELOW'
  const [searchQuery, setSearchQuery] = useState('');

  // Threshold Configuration State (IQAC Authoritative)
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [thresholdInput, setThresholdInput] = useState('50.00');
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);
  const [thresholdSaveError, setThresholdSaveError] = useState(null);
  const [thresholdSaveSuccess, setThresholdSaveSuccess] = useState(false);

  const requestCounterRef = useRef(0);

  const fetchStudentEvidence = useCallback(async () => {
    if (!programmeBatchCourseId || !coCode) {
      setData(null);
      return;
    }

    const reqId = ++requestCounterRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const res = await analyticsApi.getStudentEvidence({
        programmeBatchCourseId,
        coCode,
      });

      if (reqId === requestCounterRef.current) {
        const payload = res?.data?.data ?? res?.data ?? null;
        setData(payload);
        if (payload?.configuredThresholdPercentage !== undefined && payload?.configuredThresholdPercentage !== null) {
          setThresholdInput(Number(payload.configuredThresholdPercentage).toFixed(2));
        }
      }
    } catch (err) {
      if (reqId === requestCounterRef.current) {
        console.error('Failed to load student evidence:', err);
        setError('Unable to load student performance evidence for this Course Outcome.');
      }
    } finally {
      if (reqId === requestCounterRef.current) {
        setIsLoading(false);
      }
    }
  }, [programmeBatchCourseId, coCode]);

  useEffect(() => {
    if (isOpen && programmeBatchCourseId && coCode) {
      fetchStudentEvidence();
    } else {
      setData(null);
      setError(null);
      setSearchQuery('');
      setActiveTab('ALL');
      setIsEditingThreshold(false);
      setThresholdSaveError(null);
      setThresholdSaveSuccess(false);
    }
  }, [isOpen, programmeBatchCourseId, coCode, fetchStudentEvidence]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const configuredThreshold = data?.configuredThresholdPercentage !== undefined && data?.configuredThresholdPercentage !== null
    ? Number(data.configuredThresholdPercentage)
    : 50.00;

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    const num = parseFloat(thresholdInput);
    if (isNaN(num) || num < 0 || num > 100) {
      setThresholdSaveError('Threshold must be a valid number between 0.00% and 100.00%.');
      return;
    }

    setIsSavingThreshold(true);
    setThresholdSaveError(null);
    setThresholdSaveSuccess(false);

    try {
      await analyticsApi.updateStudentEvidenceThreshold({ thresholdPercentage: num });
      setThresholdSaveSuccess(true);
      setIsEditingThreshold(false);
      await fetchStudentEvidence();
      setTimeout(() => setThresholdSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update threshold:', err);
      const msg = err?.response?.data?.message || 'Failed to update Student Performance Evidence Threshold.';
      setThresholdSaveError(msg);
    } finally {
      setIsSavingThreshold(false);
    }
  };

  // Filtered student records
  const allRecords = useMemo(() => data?.studentRecords || [], [data]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      if (activeTab === 'MET' && !rec.thresholdMet) return false;
      if (activeTab === 'BELOW' && rec.thresholdMet) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchPrn = (rec.maskedPrn || '').toLowerCase().includes(q);
        const matchId = (rec.studentIdentifier || '').toLowerCase().includes(q);
        if (!matchPrn && !matchId) return false;
      }

      return true;
    });
  }, [allRecords, activeTab, searchQuery]);

  if (!isOpen) return null;

  const totalStudents = data?.totalStudentsEvaluated || 0;
  const studentsMet = data?.studentsMeetingThreshold || 0;
  const studentsBelow = data?.studentsBelowThreshold || 0;
  const attainmentRate = data?.attainmentRatePercentage || 0;
  const classAvg = data?.classAveragePercentage || 0;
  const highestPct = data?.highestPercentage || 0;
  const lowestPct = data?.lowestPercentage || 0;
  const distribution = data?.scoreDistribution || {};

  const courseTitle = data?.courseName || coDetails?.courseName || 'Course Offering';
  const courseCodeStr = data?.courseCode || coDetails?.courseCode || '';
  const coordinator = data?.courseCoordinatorName || coDetails?.courseCoordinatorName || '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-evidence-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          maxWidth: 820,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#0284c7',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                {coCode} Student Evidence
              </span>
              <h4 id="student-evidence-modal-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                {courseTitle} {courseCodeStr ? `(${courseCodeStr})` : ''}
              </h4>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
              Coordinator: {coordinator || 'Department Faculty'} • Aggregated CO Attainment Evidence & Performance Drill-Down
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close student evidence modal"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 6,
              padding: 6,
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* IQAC-Configurable Threshold Bar */}
        {isEditingThreshold ? (
          <form
            onSubmit={handleSaveThreshold}
            style={{
              padding: '10px 22px',
              background: '#f0f9ff',
              borderBottom: '1px solid #bae6fd',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#0369a1' }}>
                  Student Evidence Threshold (%):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  style={{
                    width: 80,
                    padding: '3px 8px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: '1px solid #0284c7',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={isSavingThreshold}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#ffffff',
                    background: '#0284c7',
                    border: 'none',
                    borderRadius: 6,
                    cursor: isSavingThreshold ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSavingThreshold ? 'Saving...' : 'Save Setting'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingThreshold(false);
                    setThresholdSaveError(null);
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#64748b',
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
              <span style={{ fontSize: 11, color: '#0369a1' }}>
                Used solely for student evidence categorization inside Phase 9 (does not alter OBE targets).
              </span>
            </div>
            {thresholdSaveError && (
              <div style={{ fontSize: 11, color: '#b91c1c', fontWeight: 600 }}>
                {thresholdSaveError}
              </div>
            )}
          </form>
        ) : (
          <div
            style={{
              padding: '8px 22px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sliders size={13} color="#0284c7" />
              <span style={{ fontSize: 12, color: '#334155' }}>
                Student Performance Evidence Threshold: <strong style={{ color: '#0f172a' }}>{formatNumber(configuredThreshold)}%</strong>
              </span>
              {!isIqacAdmin && (
                <span style={{ fontSize: 10.5, color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>
                  (IQAC Authoritative Setting)
                </span>
              )}
              {thresholdSaveSuccess && (
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Check size={13} /> Threshold Updated
                </span>
              )}
            </div>

            {isIqacAdmin && (
              <button
                onClick={() => {
                  setThresholdInput(configuredThreshold.toFixed(2));
                  setThresholdSaveError(null);
                  setIsEditingThreshold(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#0284c7',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <Sliders size={11} />
                Configure Threshold
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: 22, overflowY: 'auto', flex: 1 }}>
          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: '#fef2f2',
                border: '1px solid #fecdd3',
                borderRadius: 8,
                color: '#b91c1c',
                fontSize: 13,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchStudentEvidence}
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

          {isLoading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 10, color: '#0284c7' }} />
              <div style={{ fontSize: 13 }}>Loading student assessment evidence...</div>
            </div>
          ) : totalStudents === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: 10,
                border: '1px dashed #cbd5e1',
              }}
            >
              <Users size={32} color="#94a3b8" style={{ marginBottom: 10 }} />
              <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                No Student-Level Marks Uploaded
              </h4>
              <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', maxWidth: 440, marginInline: 'auto' }}>
                The course attainment report exists, but individual student CO marks have not been uploaded or stored for this offering.
              </p>
            </div>
          ) : (
            <div>
              {/* 1. Aggregated Evidence Metric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Evaluated Students
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    {totalStudents}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                    Met Threshold (&ge; {formatNumber(configuredThreshold)}%)
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d', marginTop: 2 }}>
                    {studentsMet}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', background: studentsBelow > 0 ? '#fff1f2' : '#f8fafc', border: `1px solid ${studentsBelow > 0 ? '#fecdd3' : '#e2e8f0'}`, borderRadius: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: studentsBelow > 0 ? '#9f1239' : '#64748b', textTransform: 'uppercase' }}>
                    Below Threshold (&lt; {formatNumber(configuredThreshold)}%)
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: studentsBelow > 0 ? '#e11d48' : '#0f172a', marginTop: 2 }}>
                    {studentsBelow}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                    Attainment Rate
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0284c7', marginTop: 2 }}>
                    {formatNumber(attainmentRate)}%
                  </div>
                </div>

                <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Class Average
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    {formatNumber(classAvg)}%
                  </div>
                </div>

                <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Score Range
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#475569', marginTop: 4 }}>
                    {formatNumber(lowestPct)}% - {formatNumber(highestPct)}%
                  </div>
                </div>
              </div>

              {/* 2. Neutral Numerical Performance Distribution Ranges */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 18,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <TrendingUp size={15} color="#0284c7" />
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>
                    Performance Range Distribution (Neutral Numerical Intervals)
                  </strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                  {Object.entries(distribution).map(([range, count]) => {
                    const pctOfCohort = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
                    return (
                      <div
                        key={range}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          padding: '8px 10px',
                          textAlign: 'center',
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{range}</span>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>
                          {count}
                        </div>
                        <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${pctOfCohort}%`,
                              background: range.includes('<50') ? '#e11d48' : '#0284c7',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, display: 'block' }}>
                          {pctOfCohort.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Privacy-Preserved Individual Student Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', padding: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  {/* Filter Tabs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => setActiveTab('ALL')}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        background: activeTab === 'ALL' ? '#0f172a' : '#f1f5f9',
                        color: activeTab === 'ALL' ? '#ffffff' : '#475569',
                      }}
                    >
                      All Students ({allRecords.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('MET')}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        background: activeTab === 'MET' ? '#15803d' : '#f1f5f9',
                        color: activeTab === 'MET' ? '#ffffff' : '#166534',
                      }}
                    >
                      Met Threshold (&ge; {formatNumber(configuredThreshold)}%) ({studentsMet})
                    </button>
                    <button
                      onClick={() => setActiveTab('BELOW')}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        background: activeTab === 'BELOW' ? '#e11d48' : '#f1f5f9',
                        color: activeTab === 'BELOW' ? '#ffffff' : '#9f1239',
                      }}
                    >
                      Below Threshold (&lt; {formatNumber(configuredThreshold)}%) ({studentsBelow})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div style={{ position: 'relative', width: 200 }}>
                    <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 8, top: 7 }} />
                    <input
                      type="text"
                      placeholder="Search masked PRN..."
                      aria-label="Search students by masked PRN or identifier"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                  </div>
                </div>

                <div style={{ overflowX: 'auto', maxHeight: 260 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '8px 10px', fontWeight: 700 }}>Identifier</th>
                        <th style={{ padding: '8px 10px', fontWeight: 700 }}>Masked PRN</th>
                        <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Marks</th>
                        <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Max</th>
                        <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Percentage</th>
                        <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'center' }}>Threshold Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((rec, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 10px', fontWeight: 600, color: '#334155' }}>
                            {rec.studentIdentifier}
                          </td>
                          <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#0f172a' }}>
                            {rec.maskedPrn}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#475569' }}>
                            {formatNumber(rec.marksObtained)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#64748b' }}>
                            {formatNumber(rec.maxMarks)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            {formatNumber(rec.percentage)}%
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: rec.thresholdMet ? '#15803d' : '#e11d48',
                                background: rec.thresholdMet ? '#f0fdf4' : '#fff1f2',
                                border: `1px solid ${rec.thresholdMet ? '#bbf7d0' : '#fecdd3'}`,
                                padding: '1px 6px',
                                borderRadius: 4,
                              }}
                            >
                              {rec.thresholdMet ? `Met (>= ${formatNumber(configuredThreshold)}%)` : `Below (< ${formatNumber(configuredThreshold)}%)`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Privacy & Academic Confidentiality Notice */}
              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11,
                  color: '#64748b',
                  background: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: 6,
                }}
              >
                <ShieldCheck size={14} color="#0284c7" />
                <span>
                  <strong>Academic Confidentiality Notice:</strong> Student records are privacy-preserved for institutional OBE quality audit. Identifiers are masked in accordance with NBA OBE governance standards.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '12px 22px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#ffffff',
              background: '#0f172a',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Close Evidence View
          </button>
        </div>
      </div>
    </div>
  );
}
