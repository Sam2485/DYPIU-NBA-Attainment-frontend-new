import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, Clock, Check, Sliders,
  FileText, Layers, XCircle, ChevronDown, AlertCircle,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

// ── Style tokens ─────────────────────────────────────────────────────────────
const surface    = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink        = '#0f172a';
const muted      = '#64748b';
const accent     = '#4f46e5';
const inputStyle = {
  height: '40px', fontSize: '13px', border: '1px solid #e2e8f0',
  borderRadius: '8px', padding: '0 12px', background: '#ffffff',
  color: ink, width: '100%', outline: 'none', fontFamily: 'inherit',
};

// status pill helper
function StatusPill({ status }) {
  const map = {
    VERIFIED:         { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: '✓ Verified'      },
    APPROVED:         { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: '✓ Approved'      },
    PENDING_APPROVAL: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: '⏳ Pending'       },
    DRAFT:            { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'Draft'            },
    REJECTED:         { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: '✗ Needs Revision' },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '5px', padding: '2px 8px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

// ── Programme ATR Tab — CourseATR-style cards ────────────────────────────────
function ProgATRTab({ selectedProgramme, activePOs, normPSOs, progAtrRows }) {
  // Local editable state for actions / remarks per PO-PSO
  const [entries, setEntries] = useState(() =>
    progAtrRows.map((r) => ({
      ...r,
      actions: r.met
        ? []
        : [`Conduct targeted interventions for ${r.code} — ${r.statement.slice(0, 50)}...`,
           'Review assessment methodology and increase practice problem frequency.'],
      remark: r.met ? 'Target achieved. Maintain current teaching strategy and assessment approach.' : '',
    })),
  );

  const handleAddAction = (idx) => {
    setEntries((prev) => prev.map((e, i) => i === idx ? { ...e, actions: [...e.actions, 'New corrective action...'] } : e));
  };
  const handleUpdateAction = (idx, aIdx, val) => {
    setEntries((prev) => prev.map((e, i) => {
      if (i !== idx) return e;
      const acts = [...e.actions]; acts[aIdx] = val; return { ...e, actions: acts };
    }));
  };
  const handleDeleteAction = (idx, aIdx) => {
    setEntries((prev) => prev.map((e, i) => i === idx ? { ...e, actions: e.actions.filter((_, j) => j !== aIdx) } : e));
  };
  const handleUpdateRemark = (idx, val) => {
    setEntries((prev) => prev.map((e, i) => i === idx ? { ...e, remark: val } : e));
  };

  const poEntries  = entries.filter((e) => e.type === 'PO');
  const psoEntries = entries.filter((e) => e.type === 'PSO');

  const renderCards = (list, accentCol) => list.map((entry, listIdx) => {
    const globalIdx = entries.findIndex((e) => e.code === entry.code);
    const pct = Number(((entry.actual / entry.target) * 100).toFixed(1));
    return (
      <div key={entry.code} style={{ border: `1px solid ${entry.met ? '#bbf7d0' : '#fecaca'}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {/* Banner */}
        <div style={{ background: entry.met ? '#f0fdf4' : '#fef2f2', borderBottom: `1px solid ${entry.met ? '#bbf7d0' : '#fecaca'}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>
            <span style={{ color: accentCol, fontWeight: '900', marginRight: '6px' }}>{entry.code}:</span>
            {entry.statement}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '700', background: entry.met ? '#dcfce7' : '#fee2e2', color: entry.met ? '#15803d' : '#991b1b', border: `1px solid ${entry.met ? '#86efac' : '#fca5a5'}`, borderRadius: '5px', padding: '3px 10px', whiteSpace: 'nowrap' }}>
            Target: {entry.target.toFixed(2)} &nbsp;|&nbsp; Actual: {entry.actual.toFixed(2)} &nbsp;({pct}%) &nbsp;{entry.met ? '✓ Target Met' : '⚠ Gap Identified'}
          </span>
        </div>

        {/* Body table */}
        <table className="audit-data-table" style={{ margin: 0, border: 'none' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ width: '70px', textAlign: 'center' }}>Outcome</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Target</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Attainment</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Observation</th>
              <th>{entry.met ? 'Remark (Target Met)' : 'Corrective Actions for Improvement'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center', fontWeight: '800', color: accentCol, verticalAlign: 'top', paddingTop: '12px' }}>{entry.code}</td>
              <td style={{ textAlign: 'center', fontWeight: '700', color: muted, verticalAlign: 'top', paddingTop: '12px' }}>{entry.target.toFixed(2)}</td>
              <td style={{ textAlign: 'center', fontWeight: '800', color: entry.met ? '#16a34a' : '#dc2626', verticalAlign: 'top', paddingTop: '12px' }}>{entry.actual.toFixed(2)}</td>
              <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '700', background: entry.met ? '#dcfce7' : '#fee2e2', color: entry.met ? '#15803d' : '#991b1b', borderRadius: '5px', padding: '3px 8px' }}>
                  {pct}% {entry.met ? 'Achieved' : 'Gap'}
                </span>
              </td>
              <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                {entry.met ? (
                  /* Remark field when target is met */
                  <textarea
                    rows={3}
                    value={entry.remark}
                    onChange={(e) => handleUpdateRemark(globalIdx, e.target.value)}
                    placeholder="Enter remark for this outcome..."
                    style={{ width: '100%', fontSize: '12.5px', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '8px 10px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: ink, background: '#fafafa' }}
                  />
                ) : (
                  /* Corrective action fields when gap */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {entry.actions.map((act, aIdx) => (
                      <div key={aIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: '#3b82f6', minWidth: '68px', fontSize: '12px', paddingTop: '9px' }}>Action {aIdx + 1}:</span>
                        <textarea
                          rows={2}
                          value={act}
                          onChange={(e) => handleUpdateAction(globalIdx, aIdx, e.target.value)}
                          style={{ flex: 1, fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '6px 10px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: ink, background: '#ffffff' }}
                        />
                        {entry.actions.length > 1 && (
                          <button onClick={() => handleDeleteAction(globalIdx, aIdx)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: '4px' }}>
                            <span style={{ fontSize: '14px', lineHeight: 1 }}>×</span>
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => handleAddAction(globalIdx)} style={{ alignSelf: 'flex-start', height: '28px', padding: '0 12px', fontSize: '11.5px', fontWeight: '700', background: '#f8fafc', color: accent, border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}>
                      + Add Action
                    </button>
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  });

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Header */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: '700', color: ink, marginBottom: '3px' }}>Programme ATR — {selectedProgramme.name} ({selectedProgramme.code})</div>
          <div style={{ fontSize: '12px', color: muted }}>PO &amp; PSO attainment vs targets. Add corrective actions for gaps; add remarks for outcomes met.</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { label: `${poEntries.filter((e) => e.met).length} / ${poEntries.length} POs Met`,   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: `${psoEntries.filter((e) => e.met).length} / ${psoEntries.length} PSOs Met`, color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
          ].map((s) => (
            <span key={s.label} style={{ fontSize: '12px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '6px', padding: '4px 12px' }}>{s.label}</span>
          ))}
        </div>
      </div>

      {progAtrRows.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 18px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>No POs or PSOs configured yet. Set targets via Target Settings first.</span>
        </div>
      ) : (
        <>
          {poEntries.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Programme Outcomes (POs)</div>
              <div style={{ display: 'grid', gap: '12px' }}>{renderCards(poEntries, accent)}</div>
            </div>
          )}
          {psoEntries.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', marginTop: poEntries.length > 0 ? '8px' : 0 }}>Programme Specific Outcomes (PSOs)</div>
              <div style={{ display: 'grid', gap: '12px' }}>{renderCards(psoEntries, '#059669')}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CoordinatorReviewHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    availableCourses = [],
    masterProgrammes = [],
    programmeId,
    academicYear,
    attainmentConfigs        = {},
    updateCourseAttainmentConfig = () => {},
    courseVerificationStore  = {},
    updateCourseVerificationStatus = () => {},
    courseAtrStore           = {},
    updateCourseCOs          = () => {},
    yearMetrics              = {},
    activePOs                = [],
    activePSOs               = [],
    poPsoTargets             = {},
  } = useAcademic();

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) ||
    masterProgrammes[0] ||
    { name: 'B.Tech CSE', code: 'BE-COMP' };

  // ── Active tab (URL-driven) ───────────────────────────────────────────────
  const TABS = ['config', 'cos', 'atr', 'programme-atr'];
  const currentTabParam = searchParams.get('tab') || 'config';
  const [activeTab, setActiveTab] = useState(
    TABS.includes(currentTabParam) ? currentTabParam : 'config',
  );
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TABS.includes(t)) setActiveTab(t);
  }, [searchParams]);
  const handleTabChange = (t) => { setActiveTab(t); setSearchParams({ tab: t }); };

  // ── Selected course ───────────────────────────────────────────────────────
  const [reviewCourseId, setReviewCourseId] = useState(availableCourses[0]?.id || 'crs-1');
  const selectedCourse = availableCourses.find((c) => c.id === reviewCourseId) || availableCourses[0];

  const courseReview = courseVerificationStore[reviewCourseId] || {
    configStatus: 'DRAFT', coStatus: 'PENDING_APPROVAL', atrStatus: 'DRAFT',
  };

  const attainmentConfig = attainmentConfigs[reviewCourseId] || {
    directWeight: 80, indirectWeight: 20, directThreshold: 60,
    directLevels:   [{ level: 1, minPercentage: 0, maxPercentage: 50 }, { level: 2, minPercentage: 50, maxPercentage: 70 }, { level: 3, minPercentage: 70, maxPercentage: 100 }],
    indirectLevels: [{ level: 1, minPercentage: 0, maxPercentage: 50 }, { level: 2, minPercentage: 50, maxPercentage: 70 }, { level: 3, minPercentage: 70, maxPercentage: 100 }],
  };

  const courseCOs  = selectedCourse?.courseOutcomes || [];
  const rawAtrData = courseAtrStore[reviewCourseId] || [];

  const courseAtrData = (() => {
    if (courseCOs.length === 0) return rawAtrData;
    const rawMap = new Map(rawAtrData.map((i) => [i.code, i]));
    return courseCOs.map((co, idx) => {
      const ex       = rawMap.get(co.code);
      const target   = ex?.target ?? 2.50;
      const actual   = ex?.actual ?? (idx % 2 === 0 ? 2.80 - idx * 0.1 : 2.10);
      const pct      = Number(((actual / target) * 100).toFixed(2));
      const met      = actual >= target;
      return {
        code: co.code, statement: co.statement, target, actual, pct, met,
        actions: ex?.actions || (met
          ? ['Maintain current teaching methodology and continuous assessment structure.']
          : [`Conduct extra tutorial sessions on ${co.statement.slice(0, 45)}...`, 'Provide additional practice assignments and interactive problem sets.']),
      };
    });
  })();

  // Programme ATR mock data
  const progTargets  = poPsoTargets[programmeId] || {};
  const normPSOs     = activePSOs.map((p) => ({ ...p, competencies: p.competencies ?? [] }));
  const progAtrRows  = [
    ...activePOs.map((po) => ({
      code: po.code, type: 'PO', statement: po.statement,
      target: progTargets.poTargets?.[po.code] ?? 2.0,
      actual: (progTargets.poTargets?.[po.code] ?? 2.0) * (0.85 + Math.random() * 0.3),
    })),
    ...normPSOs.map((pso) => ({
      code: pso.code, type: 'PSO', statement: pso.statement,
      target: progTargets.psoTargets?.[pso.code] ?? 2.0,
      actual: (progTargets.psoTargets?.[pso.code] ?? 2.0) * (0.85 + Math.random() * 0.3),
    })),
  ].map((r) => ({ ...r, actual: Math.min(3, Math.round(r.actual * 100) / 100), met: r.actual >= r.target }));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleVerifyConfig = () => {
    updateCourseAttainmentConfig(reviewCourseId, { status: 'VERIFIED' });
    updateCourseVerificationStatus(reviewCourseId, 'configStatus', 'VERIFIED');
  };
  const handleApproveCOs = () => {
    const updated = courseCOs.map((co) => ({ ...co, status: 'APPROVED', approvedBy: user?.name || 'Programme Coordinator' }));
    updateCourseCOs(reviewCourseId, updated);
    updateCourseVerificationStatus(reviewCourseId, 'coStatus', 'APPROVED');
  };
  const handleApproveCO = (code) => {
    const updated = courseCOs.map((co) => co.code === code ? { ...co, status: 'APPROVED', approvedBy: user?.name || 'Programme Coordinator' } : co);
    updateCourseCOs(reviewCourseId, updated);
    if (updated.every((co) => co.status === 'APPROVED'))
      updateCourseVerificationStatus(reviewCourseId, 'coStatus', 'APPROVED');
  };
  const handleRejectCO = (code) => {
    const updated = courseCOs.map((co) => co.code === code ? { ...co, status: 'REJECTED' } : co);
    updateCourseCOs(reviewCourseId, updated);
    updateCourseVerificationStatus(reviewCourseId, 'coStatus', 'PENDING_APPROVAL');
  };
  const handleVerifyATR = () => updateCourseVerificationStatus(reviewCourseId, 'atrStatus', 'VERIFIED');

  const tabDefs = [
    { id: 'config',        label: '1. Attainment Config', icon: Sliders,       status: courseReview.configStatus },
    { id: 'cos',           label: '2. CO Approvals',      icon: CheckCircle2,  status: courseReview.coStatus     },
    { id: 'atr',           label: '3. Course ATR',        icon: FileText,      status: courseReview.atrStatus    },
    { id: 'programme-atr', label: '4. Programme ATR',     icon: Layers,        status: null                      },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Programme Coordinator &nbsp;·&nbsp; Verification Panel
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Course Submissions Review
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            Verify and approve course submissions for <strong>{selectedProgramme.name}</strong> ({academicYear}).
          </p>
        </div>

        {/* Course selector */}
        <div style={{ position: 'relative', minWidth: '300px' }}>
          <select
            value={reviewCourseId}
            onChange={(e) => setReviewCourseId(e.target.value)}
            style={{ ...inputStyle, paddingRight: '32px', fontWeight: '700', color: accent, appearance: 'none', cursor: 'pointer' }}
          >
            {availableCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
        </div>
      </div>

      {/* ── TAB STRIP ─────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '8px 12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '9px', flexWrap: 'wrap' }}>
          {tabDefs.map(({ id, label, icon: Icon, status }) => {
            const done    = status === 'VERIFIED' || status === 'APPROVED';
            const pending = status && !done;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                style={{ padding: '7px 16px', borderRadius: '7px', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', background: activeTab === id ? '#ffffff' : 'transparent', color: activeTab === id ? accent : muted, boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Icon size={13} />
                {label}
                {done    && <Check size={12} style={{ color: '#16a34a' }} />}
                {pending && <Clock size={12} style={{ color: '#d97706' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB 1: ATTAINMENT CONFIG ──────────────────────────────────────── */}
      {activeTab === 'config' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Header row */}
          <div style={{ ...surface, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: ink }}>Attainment Configuration — {selectedCourse?.code} · {selectedCourse?.name}</div>
              <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>Submitted by {selectedCourse?.faculty || 'Course Coordinator'}</div>
            </div>
            {courseReview.configStatus !== 'VERIFIED'
              ? <button onClick={handleVerifyConfig} style={{ height: '36px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}><ShieldCheck size={14} /> Verify & Approve</button>
              : <StatusPill status="VERIFIED" />
            }
          </div>

          {/* Weight + threshold cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ ...surface, padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Assessment Weightage</div>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div><div style={{ fontSize: '24px', fontWeight: '800', color: accent }}>{attainmentConfig.directWeight}%</div><div style={{ fontSize: '11.5px', color: muted }}>Direct</div></div>
                <div><div style={{ fontSize: '24px', fontWeight: '800', color: '#0284c7' }}>{attainmentConfig.indirectWeight}%</div><div style={{ fontSize: '11.5px', color: muted }}>Indirect</div></div>
              </div>
            </div>
            <div style={{ ...surface, padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>CO Threshold</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>{attainmentConfig.directThreshold}%</div>
              <div style={{ fontSize: '11.5px', color: muted }}>Students scoring ≥ {attainmentConfig.directThreshold}% are counted</div>
            </div>
          </div>

          {/* Direct level bands */}
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={14} style={{ color: accent }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>Direct Assessment Level Bands</span>
            </div>
            <table className="audit-data-table">
              <thead><tr><th style={{ width: '80px', textAlign: 'center' }}>Level</th><th style={{ textAlign: 'center' }}>Min %</th><th style={{ textAlign: 'center' }}>Max %</th><th style={{ textAlign: 'center' }}>Score</th><th>Description</th></tr></thead>
              <tbody>
                {attainmentConfig.directLevels.map((lvl) => (
                  <tr key={lvl.level}>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: accent }}>Level {lvl.level}</td>
                    <td style={{ textAlign: 'center', fontWeight: '600' }}>{lvl.minPercentage}%</td>
                    <td style={{ textAlign: 'center', fontWeight: '600' }}>{lvl.maxPercentage}%</td>
                    <td style={{ textAlign: 'center' }}><span style={{ fontWeight: '800', color: '#16a34a' }}>{lvl.level}.0 / 3.0</span></td>
                    <td style={{ fontSize: '12px', color: muted }}>{lvl.level === 1 ? 'Low attainment' : lvl.level === 2 ? 'Moderate attainment' : 'High attainment'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Indirect level bands */}
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={14} style={{ color: '#0284c7' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>Indirect Assessment Level Bands</span>
            </div>
            <table className="audit-data-table">
              <thead><tr><th style={{ width: '80px', textAlign: 'center' }}>Level</th><th style={{ textAlign: 'center' }}>Min %</th><th style={{ textAlign: 'center' }}>Max %</th><th style={{ textAlign: 'center' }}>Score</th><th>Description</th></tr></thead>
              <tbody>
                {attainmentConfig.indirectLevels.map((lvl) => (
                  <tr key={lvl.level}>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#0284c7' }}>Level {lvl.level}</td>
                    <td style={{ textAlign: 'center', fontWeight: '600' }}>{lvl.minPercentage}%</td>
                    <td style={{ textAlign: 'center', fontWeight: '600' }}>{lvl.maxPercentage}%</td>
                    <td style={{ textAlign: 'center' }}><span style={{ fontWeight: '800', color: '#0369a1' }}>{lvl.level}.0 / 3.0</span></td>
                    <td style={{ fontSize: '12px', color: muted }}>{lvl.level === 1 ? 'Low survey rating' : lvl.level === 2 ? 'Moderate survey rating' : 'High survey rating'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: CO APPROVALS ───────────────────────────────────────────── */}
      {activeTab === 'cos' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ ...surface, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: ink }}>Course Outcomes — {selectedCourse?.code} · {selectedCourse?.name}</div>
              <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>Submitted by {selectedCourse?.faculty || 'Course Coordinator'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <StatusPill status={courseReview.coStatus} />
              {courseReview.coStatus !== 'APPROVED' && (
                <button onClick={handleApproveCOs} style={{ height: '36px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
                  <Check size={14} /> Approve All COs
                </button>
              )}
            </div>
          </div>

          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Code</th>
                  <th>Statement</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courseCOs.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '28px', color: muted, fontSize: '12.5px' }}>No COs submitted for this course yet.</td></tr>
                )}
                {courseCOs.map((co) => {
                  const approved = co.status === 'APPROVED' || courseReview.coStatus === 'APPROVED';
                  const rejected = co.status === 'REJECTED';
                  return (
                    <tr key={co.code}>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: accent }}>{co.code}</td>
                      <td style={{ fontSize: '12.5px', color: ink }}>{co.statement}</td>
                      <td style={{ textAlign: 'center' }}>
                        <StatusPill status={approved ? 'APPROVED' : rejected ? 'REJECTED' : 'PENDING_APPROVAL'} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {!approved && (
                            <button onClick={() => handleApproveCO(co.code)} style={{ height: '28px', padding: '0 10px', fontSize: '11.5px', fontWeight: '700', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}>
                              <Check size={12} /> Approve
                            </button>
                          )}
                          {!rejected && (
                            <button onClick={() => handleRejectCO(co.code)} style={{ height: '28px', padding: '0 10px', fontSize: '11.5px', fontWeight: '700', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}>
                              <XCircle size={12} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: COURSE ATR REVIEW ──────────────────────────────────────── */}
      {activeTab === 'atr' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ ...surface, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: ink }}>Course ATR — {selectedCourse?.code} · {selectedCourse?.name}</div>
              <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>Target gap analysis & corrective actions from Course Coordinator.</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <StatusPill status={courseReview.atrStatus} />
              {courseReview.atrStatus !== 'VERIFIED' && (
                <button onClick={handleVerifyATR} style={{ height: '36px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
                  <ShieldCheck size={14} /> Verify ATR
                </button>
              )}
            </div>
          </div>

          {courseAtrData.length === 0 ? (
            <div style={{ ...surface, padding: '32px', textAlign: 'center', color: muted, fontSize: '12.5px' }}>No ATR submitted for this course yet.</div>
          ) : courseAtrData.map((atr) => (
            <div key={atr.code} style={{ ...surface, padding: '16px 20px', borderLeft: `3px solid ${atr.met ? '#16a34a' : '#dc2626'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>{atr.code}: {atr.statement}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '700', background: atr.met ? '#f0fdf4' : '#fef2f2', color: atr.met ? '#16a34a' : '#dc2626', border: `1px solid ${atr.met ? '#bbf7d0' : '#fecaca'}`, borderRadius: '5px', padding: '3px 10px' }}>
                  Target: {atr.target.toFixed(2)} &nbsp;|&nbsp; Actual: {atr.actual.toFixed(2)} &nbsp;({atr.pct.toFixed(1)}%)
                </span>
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '6px' }}>Corrective Actions:</div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '3px' }}>
                {atr.actions.map((a, i) => <li key={i} style={{ fontSize: '12.5px', color: ink }}>{a}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 4: PROGRAMME ATR REVIEW ───────────────────────────────────── */}
      {activeTab === 'programme-atr' && (
        <ProgATRTab
          selectedProgramme={selectedProgramme}
          activePOs={activePOs}
          normPSOs={normPSOs}
          progAtrRows={progAtrRows}
        />
      )}

    </div>
  );
}
