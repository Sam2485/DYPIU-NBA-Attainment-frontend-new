import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileText,
  Award,
  Search,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { attainmentApi } from '../../../api/attainment';

const ACCENT_COLOR = '#4f46e5'; // Indigo

const DEFAULT_POS = Array.from({ length: 12 }, (_, i) => ({
  code: `PO${i + 1}`,
  statement: `Programme Outcome ${i + 1}`,
  type: 'PO',
}));

const DEFAULT_PSOS = [
  { code: 'PSO1', statement: 'Programme Specific Outcome 1', type: 'PSO' },
  { code: 'PSO2', statement: 'Programme Specific Outcome 2', type: 'PSO' },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getTypeBadge(type) {
  const t = (type || '').toUpperCase();
  switch (t) {
    case 'EXIT_SURVEY':
      return {
        label: 'Programme End Exit Survey',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        color: '#047857',
        isExit: true,
      };
    case 'SURVEY':
      return {
        label: 'Stakeholder Survey',
        bg: '#eff6ff',
        border: '#bfdbfe',
        color: '#1d4ed8',
      };
    case 'CO_CURRICULAR':
      return {
        label: 'Co-Curricular Activity',
        bg: '#fffbeb',
        border: '#fde68a',
        color: '#b45309',
      };
    case 'EVENT':
    default:
      return {
        label: 'Academic / Technical Event',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        color: '#6d28d9',
      };
  }
}

export default function IndirectEvidenceRecordModal({
  isOpen,
  onClose,
  evidenceItem,
  programmeBatchId,
  outcomes = [],
  currentOutcomeCode = 'PO1',
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Exit Survey specific state
  const [exitSurveyData, setExitSurveyData] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');

  // Event / Survey specific state
  const [assessmentData, setAssessmentData] = useState(null);

  // Normalize outcomes
  const effectivePOs = useMemo(() => {
    const pos = outcomes.filter((o) => (o.type || 'PO').toUpperCase() === 'PO' || o.code.startsWith('PO'));
    if (pos.length > 0) {
      return [...pos].sort((a, b) =>
        a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
      );
    }
    return DEFAULT_POS;
  }, [outcomes]);

  const effectivePSOs = useMemo(() => {
    const psos = outcomes.filter((o) => (o.type || '').toUpperCase() === 'PSO' || o.code.startsWith('PSO'));
    if (psos.length > 0) {
      return [...psos].sort((a, b) =>
        a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
      );
    }
    return DEFAULT_PSOS;
  }, [outcomes]);

  const allOutcomes = useMemo(() => [...effectivePOs, ...effectivePSOs], [effectivePOs, effectivePSOs]);

  const isExitSurvey = Boolean(
    evidenceItem &&
      ((evidenceItem.type || '').toUpperCase() === 'EXIT_SURVEY' ||
        (evidenceItem.name || '').toLowerCase().includes('exit survey'))
  );

  // Fetch full record data when modal opens
  useEffect(() => {
    if (!isOpen || !evidenceItem || !programmeBatchId) return;

    setLoading(true);
    setError(null);
    setStudentSearch('');

    if (isExitSurvey) {
      attainmentApi
        .getProgrammeIndirectAttainment(programmeBatchId)
        .then((res) => {
          const payload = res?.data?.data ?? res?.data ?? res;
          setExitSurveyData(payload);
        })
        .catch((err) => {
          console.error('[IndirectEvidenceRecordModal] Error loading exit survey details:', err);
          setError('Failed to load complete student exit survey responses.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      const assessmentId = evidenceItem.assessmentId || evidenceItem.id;
      if (assessmentId) {
        attainmentApi
          .getIndirectAssessmentById(programmeBatchId, assessmentId)
          .then((res) => {
            const payload = res?.data?.data ?? res?.data ?? res;
            setAssessmentData(payload);
          })
          .catch(() => {
            // Fallback: fetch all assessments and match by id
            attainmentApi
              .getIndirectAssessments(programmeBatchId)
              .then((res) => {
                const list = res?.data?.data ?? res?.data ?? res ?? [];
                const found = Array.isArray(list) ? list.find((a) => a.id === assessmentId) : null;
                setAssessmentData(found || evidenceItem);
              })
              .catch((err2) => {
                console.error('[IndirectEvidenceRecordModal] Error loading assessment details:', err2);
                setAssessmentData(evidenceItem);
              });
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setAssessmentData(evidenceItem);
        setLoading(false);
      }
    }
  }, [isOpen, evidenceItem, isExitSurvey, programmeBatchId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !evidenceItem) return null;

  const badge = getTypeBadge(evidenceItem.type);

  // Helper for Student Exit Survey Value lookup
  const getStudentRating = (student, code) => {
    if (!student) return '—';
    const norm = String(code || '').trim().toUpperCase().replace(/\s+/g, '');
    const sources = [
      student.poRatings,
      student.psoRatings,
      student.outcomeResponses,
      student.ratings,
      student.responses,
      student.poValues,
      student.psoValues,
    ];
    for (const src of sources) {
      if (src && typeof src === 'object') {
        if (src[code] !== undefined && src[code] !== null && src[code] !== '') return src[code];
        const matchKey = Object.keys(src).find(
          (k) => String(k || '').trim().toUpperCase().replace(/\s+/g, '') === norm
        );
        if (matchKey !== undefined && src[matchKey] !== null && src[matchKey] !== '') {
          return src[matchKey];
        }
      }
    }
    return '—';
  };

  // Helper to format number or dash
  const formatVal = (val) => {
    if (val === null || val === undefined || val === '' || val === '—') return '—';
    const n = Number(val);
    return Number.isFinite(n) ? n.toFixed(2) : val;
  };

  // --------------------------------------------------------------------------
  // UI 1: PROGRAMME END SURVEY (EXCEL STUDENT RESPONSES)
  // --------------------------------------------------------------------------
  const renderExitSurveyUI = () => {
    const rawStudents =
      exitSurveyData?.studentSurveyResponses ??
      exitSurveyData?.studentResponses ??
      exitSurveyData?.students ??
      [];

    // Build map of PO and PSO average attainment
    const poMap = {};
    if (Array.isArray(exitSurveyData?.poIndirectAttainment)) {
      exitSurveyData.poIndirectAttainment.forEach((item) => {
        poMap[String(item.poCode || '').toUpperCase()] = item.indirectAttainment;
      });
    } else if (exitSurveyData?.poIndirectAttainment) {
      Object.entries(exitSurveyData.poIndirectAttainment).forEach(([k, v]) => {
        poMap[String(k).toUpperCase()] = v;
      });
    }

    const psoMap = {};
    if (Array.isArray(exitSurveyData?.psoIndirectAttainment)) {
      exitSurveyData.psoIndirectAttainment.forEach((item) => {
        psoMap[String(item.psoCode || '').toUpperCase()] = item.indirectAttainment;
      });
    } else if (exitSurveyData?.psoIndirectAttainment) {
      Object.entries(exitSurveyData.psoIndirectAttainment).forEach(([k, v]) => {
        psoMap[String(k).toUpperCase()] = v;
      });
    }

    // Filter students by search term
    const filteredStudents = rawStudents.filter((st) => {
      if (!studentSearch.trim()) return true;
      const q = studentSearch.toLowerCase();
      const prnMatch = String(st.prn || st.studentPrn || '').toLowerCase().includes(q);
      const nameMatch = String(st.studentName || st.name || '').toLowerCase().includes(q);
      return prnMatch || nameMatch;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Info Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 18px',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                Graduate Student Responses Matrix
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {rawStudents.length > 0
                  ? `${rawStudents.length} Students Processed across ${allOutcomes.length} Outcomes (Ratings: 1.00 – 3.00)`
                  : 'No student response rows available in processed record.'}
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: 240 }}>
            <Search
              size={13}
              color="#94a3b8"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search PRN or Name..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 28px',
                borderRadius: 7,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Student Responses Table */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            overflow: 'hidden',
            background: '#ffffff',
          }}
        >
          <div style={{ maxHeight: '48vh', overflowY: 'auto', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#475569', minWidth: 60, background: '#f8fafc' }}>
                    Sr No
                  </th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', minWidth: 120, background: '#f8fafc' }}>
                    PRN
                  </th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', minWidth: 180, background: '#f8fafc' }}>
                    Student Name
                  </th>

                  {/* PO Headers */}
                  {effectivePOs.map((po) => {
                    const isSelected = po.code === currentOutcomeCode;
                    return (
                      <th
                        key={po.code}
                        style={{
                          padding: '9px 8px',
                          textAlign: 'center',
                          fontWeight: 800,
                          color: isSelected ? '#0369a1' : '#475569',
                          background: isSelected ? '#e0f2fe' : '#f8fafc',
                          minWidth: 52,
                          borderLeft: '1px solid #f1f5f9',
                        }}
                        title={po.statement}
                      >
                        {po.code}
                      </th>
                    );
                  })}

                  {/* PSO Headers */}
                  {effectivePSOs.map((pso) => {
                    const isSelected = pso.code === currentOutcomeCode;
                    return (
                      <th
                        key={pso.code}
                        style={{
                          padding: '9px 8px',
                          textAlign: 'center',
                          fontWeight: 800,
                          color: isSelected ? '#047857' : '#065f46',
                          background: isSelected ? '#bbf7d0' : '#ecfdf5',
                          minWidth: 56,
                          borderLeft: '1px solid #f1f5f9',
                        }}
                        title={pso.statement}
                      >
                        {pso.code}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3 + allOutcomes.length}
                      style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}
                    >
                      {rawStudents.length === 0
                        ? 'No student survey response records found for this batch.'
                        : 'No student records match the search query.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, idx) => {
                    return (
                      <tr
                        key={st.prn || st.studentPrn || idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                        }}
                      >
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                          {st.srNo ?? idx + 1}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a', fontFamily: 'ui-monospace, monospace' }}>
                          {st.prn ?? st.studentPrn ?? '—'}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#334155', fontWeight: 600 }}>
                          {st.studentName ?? st.name ?? '—'}
                        </td>

                        {/* PO Ratings */}
                        {effectivePOs.map((po) => {
                          const val = getStudentRating(st, po.code);
                          const isSelected = po.code === currentOutcomeCode;
                          return (
                            <td
                              key={po.code}
                              style={{
                                padding: '8px',
                                textAlign: 'center',
                                fontWeight: 700,
                                color: val === '—' ? '#94a3b8' : '#0f172a',
                                background: isSelected ? '#f0f9ff' : 'transparent',
                                borderLeft: '1px solid #f1f5f9',
                              }}
                            >
                              {val}
                            </td>
                          );
                        })}

                        {/* PSO Ratings */}
                        {effectivePSOs.map((pso) => {
                          const val = getStudentRating(st, pso.code);
                          const isSelected = pso.code === currentOutcomeCode;
                          return (
                            <td
                              key={pso.code}
                              style={{
                                padding: '8px',
                                textAlign: 'center',
                                fontWeight: 700,
                                color: val === '—' ? '#94a3b8' : '#047857',
                                background: isSelected ? '#dcfce7' : '#f0fdf4',
                                borderLeft: '1px solid #f1f5f9',
                              }}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}

                {/* Bottom Summary Row: Average Attainment (Indirect) */}
                {rawStudents.length > 0 && (
                  <tr
                    style={{
                      background: '#f1f5f9',
                      borderTop: '2px solid #cbd5e1',
                      position: 'sticky',
                      bottom: 0,
                      zIndex: 10,
                    }}
                  >
                    <td colSpan={3} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      Average Attainment (Indirect)
                    </td>

                    {effectivePOs.map((po) => {
                      const avg = poMap[po.code.toUpperCase()];
                      const isSelected = po.code === currentOutcomeCode;
                      return (
                        <td
                          key={po.code}
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            fontWeight: 800,
                            color: ACCENT_COLOR,
                            background: isSelected ? '#e0e7ff' : '#f1f5f9',
                            borderLeft: '1px solid #e2e8f0',
                            fontFamily: 'ui-monospace, monospace',
                          }}
                        >
                          {formatVal(avg)}
                        </td>
                      );
                    })}

                    {effectivePSOs.map((pso) => {
                      const avg = psoMap[pso.code.toUpperCase()];
                      const isSelected = pso.code === currentOutcomeCode;
                      return (
                        <td
                          key={pso.code}
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            fontWeight: 800,
                            color: '#047857',
                            background: isSelected ? '#bbf7d0' : '#dcfce7',
                            borderLeft: '1px solid #e2e8f0',
                            fontFamily: 'ui-monospace, monospace',
                          }}
                        >
                          {formatVal(avg)}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // UI 2: EVENT / SURVEY (SINGLE ROW CALCULATED AVERAGE VALUES)
  // --------------------------------------------------------------------------
  const renderEventSurveyUI = () => {
    const activeAssessment = assessmentData || evidenceItem;
    const scores = activeAssessment.scores || {};

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Description & Metadata Card */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              Assessment Description &amp; Scope
            </span>
            <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: '#64748b' }}>
              <span>Recorded By: <strong style={{ color: '#334155' }}>{activeAssessment.createdBy || 'Programme Coordinator'}</strong></span>
              <span>•</span>
              <span>Date: <strong style={{ color: '#334155' }}>{formatDate(activeAssessment.date || activeAssessment.createdAt)}</strong></span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
            {activeAssessment.description || 'No additional activity description recorded.'}
          </p>
        </div>

        {/* Single Row Directly Calculated Table (Matching Programme Coordinator indirect table) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Directly Calculated Attainment Table
            </span>
            <span style={{ fontSize: 11, color: '#64748b' }}>Authoritative attainment on 0.00 – 3.00 scale</span>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#ffffff' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', minWidth: 200 }}>
                      Assessment Source
                    </th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#475569', minWidth: 100 }}>
                      Type
                    </th>
                    {effectivePOs.map((po) => {
                      const isSelected = po.code === currentOutcomeCode;
                      return (
                        <th
                          key={po.code}
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            fontWeight: 800,
                            color: isSelected ? '#0369a1' : '#475569',
                            background: isSelected ? '#e0f2fe' : '#f8fafc',
                            minWidth: 54,
                            borderLeft: '1px solid #f1f5f9',
                          }}
                          title={po.statement}
                        >
                          {po.code}
                        </th>
                      );
                    })}
                    {effectivePSOs.map((pso) => {
                      const isSelected = pso.code === currentOutcomeCode;
                      return (
                        <th
                          key={pso.code}
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            fontWeight: 800,
                            color: isSelected ? '#047857' : '#065f46',
                            background: isSelected ? '#bbf7d0' : '#ecfdf5',
                            minWidth: 58,
                            borderLeft: '1px solid #f1f5f9',
                          }}
                          title={pso.statement}
                        >
                          {pso.code}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                    <td style={{ padding: '14px', fontWeight: 800, color: '#0f172a' }}>
                      {activeAssessment.name}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* PO Scores */}
                    {effectivePOs.map((po) => {
                      const score = scores[po.code] ?? scores[po.code.toLowerCase()];
                      const has = score !== undefined && score !== null;
                      const isSelected = po.code === currentOutcomeCode;
                      return (
                        <td
                          key={po.code}
                          style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontWeight: has ? 800 : 500,
                            color: has ? '#0f172a' : '#94a3b8',
                            background: isSelected ? '#f0f9ff' : 'transparent',
                            borderLeft: '1px solid #f1f5f9',
                            fontFamily: has ? 'ui-monospace, monospace' : 'inherit',
                          }}
                        >
                          {has ? Number(score).toFixed(2) : '—'}
                        </td>
                      );
                    })}

                    {/* PSO Scores */}
                    {effectivePSOs.map((pso) => {
                      const score = scores[pso.code] ?? scores[pso.code.toLowerCase()];
                      const has = score !== undefined && score !== null;
                      const isSelected = pso.code === currentOutcomeCode;
                      return (
                        <td
                          key={pso.code}
                          style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontWeight: has ? 800 : 500,
                            color: has ? '#047857' : '#94a3b8',
                            background: isSelected ? '#dcfce7' : '#f0fdf4',
                            borderLeft: '1px solid #f1f5f9',
                            fontFamily: has ? 'ui-monospace, monospace' : 'inherit',
                          }}
                        >
                          {has ? Number(score).toFixed(2) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PO & PSO Cards Grid */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10 }}>
            Outcome Attainment Breakdown
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 10,
              maxHeight: '34vh',
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {allOutcomes.map((out) => {
              const score = scores[out.code] ?? scores[out.code.toLowerCase()];
              const has = score !== undefined && score !== null;
              const isSelected = out.code === currentOutcomeCode;
              const isPso = out.type === 'PSO';

              return (
                <div
                  key={out.code}
                  style={{
                    background: isSelected ? (isPso ? '#f0fdf4' : '#f0f9ff') : '#ffffff',
                    border: `1px solid ${isSelected ? (isPso ? '#86efac' : '#7dd3fc') : '#e2e8f0'}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: isPso ? '#059669' : '#0284c7',
                      }}
                    >
                      {out.code}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: isPso ? '#15803d' : '#0369a1',
                          color: '#ffffff',
                        }}
                      >
                        Current Drilldown
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Attainment:</span>
                    <strong
                      style={{
                        fontSize: 14,
                        fontFamily: 'ui-monospace, monospace',
                        color: has ? '#0f172a' : '#94a3b8',
                      }}
                    >
                      {has ? `${Number(score).toFixed(2)} / 3.00` : '— (Not Evaluated)'}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: 20,
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: isExitSurvey ? 1160 : 960,
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out',
        }}
      >
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: badge.bg,
                border: `1px solid ${badge.border}`,
                color: badge.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isExitSurvey ? <FileText size={20} /> : <Award size={20} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: '#0f172a' }}>
                  {evidenceItem.name}
                </h3>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', gap: 12 }}>
                <span>Date: <strong>{formatDate(evidenceItem.date)}</strong></span>
                {evidenceItem.responseCount != null && (
                  <span>Responses: <strong>{evidenceItem.responseCount}</strong></span>
                )}
                <span>Assessment ID: <code>{evidenceItem.assessmentId || evidenceItem.id}</code></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#64748b' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#0284c7',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 12px auto',
                }}
              />
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>
                Loading full indirect evidence record...
              </div>
            </div>
          ) : error ? (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '14px 18px',
                color: '#b91c1c',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : isExitSurvey ? (
            renderExitSurveyUI()
          ) : (
            renderEventSurveyUI()
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 11.5, color: '#64748b' }}>
            Viewing complete record across all Programme Outcomes (PO1–PO12) and Programme Specific Outcomes (PSO)
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
