import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, Clock, Check, Sliders,
  FileText, Layers, XCircle, ChevronDown, AlertCircle, X,
  MessageSquare, BookOpen, Target, TrendingUp, TrendingDown,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import CourseATR from '../atr/CourseATR';

// ── Design tokens ─────────────────────────────────────────────────────────────
const ink    = '#0f172a';
const muted  = '#64748b';
const accent = '#4f46e5';
const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const inputStyle = {
  height: '40px', fontSize: '13px', border: '1px solid #e2e8f0',
  borderRadius: '8px', padding: '0 12px', background: '#ffffff',
  color: ink, width: '100%', outline: 'none', fontFamily: 'inherit',
};

const STATUS_META = {
  VERIFIED:         { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', label: 'Verified & Approved', icon: '✓' },
  APPROVED:         { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', label: 'Approved',             icon: '✓' },
  PENDING_APPROVAL: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review',       icon: '⏳' },
  DRAFT:            { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'Draft',                icon: '—'  },
  REJECTED:         { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Needs Revision',       icon: '⚠' },
};

function StatusBadge({ status, size = 'md' }) {
  const s = STATUS_META[status] || STATUS_META.DRAFT;
  const pad = size === 'sm' ? '2px 8px' : '4px 11px';
  const fs  = size === 'sm' ? '10.5px'  : '11.5px';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: fs, fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '6px', padding: pad, whiteSpace: 'nowrap' }}>
      {s.icon} {s.label}
    </span>
  );
}

function SectionHeader({ title, subtitle, status, onApprove, onReject }) {
  const isVerified = status === 'VERIFIED' || status === 'APPROVED';
  const isRejected = status === 'REJECTED';

  return (
    <div style={{ ...surface, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '800', color: ink }}>{title}</div>
        {subtitle && <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>{subtitle}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <StatusBadge status={status} />

        {/* If NOT verified (i.e. Pending, Draft, OR Rejected), show Verify button */}
        {!isVerified && (
          <button
            type="button"
            onClick={onApprove}
            style={{ height: '36px', padding: '0 16px', fontSize: '12.5px', fontWeight: '800', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
          >
            <Check size={14} /> Verify &amp; Approve
          </button>
        )}

        {/* If NOT rejected (i.e. Pending, Draft, OR Verified), show Reject button */}
        {!isRejected && (
          <button
            type="button"
            onClick={onReject}
            style={{ height: '36px', padding: '0 16px', fontSize: '12.5px', fontWeight: '800', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
          >
            <XCircle size={14} /> Send Back / Reject
          </button>
        )}
      </div>
    </div>
  );
}

// ── PROGRAMME ATR TAB ────────────────────────────────────────────────────────
function ProgATRTab({ selectedProgramme, activePOs, normPSOs, progAtrRows, onApprove, onReject, status }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(
      progAtrRows.map((r) => ({
        ...r,
        actions: r.met
          ? []
          : [`Conduct targeted interventions for ${r.code} — ${r.statement.slice(0, 50)}...`,
             'Review assessment methodology and increase practice problem frequency.'],
        remark: r.met ? 'Target achieved. Maintain current teaching strategy and assessment approach.' : '',
      }))
    );
  }, [progAtrRows]);

  const poEntries  = entries.filter((e) => e.type === 'PO');
  const psoEntries = entries.filter((e) => e.type === 'PSO');

  const renderCards = (list, accentCol) => list.map((entry) => {
    const pct = Number(((entry.actual / entry.target) * 100).toFixed(1));
    return (
      <div key={entry.code} style={{ border: `1px solid ${entry.met ? '#bbf7d0' : '#fecaca'}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ background: entry.met ? '#f0fdf4' : '#fef2f2', borderBottom: `1px solid ${entry.met ? '#bbf7d0' : '#fecaca'}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>
            <span style={{ color: accentCol, fontWeight: '900', marginRight: '6px' }}>{entry.code}:</span>
            {entry.statement}
          </span>
        </div>

        <table className="audit-data-table" style={{ margin: 0, border: 'none' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ width: '70px', textAlign: 'center' }}>Outcome</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Target</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Attainment</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Observation</th>
              <th>{entry.met ? 'Remark' : 'Corrective Actions'}</th>
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
              <td style={{ padding: '10px 14px', verticalAlign: 'top', fontSize: '12.5px', color: ink }}>
                {entry.met ? entry.remark : (
                  <ul style={{ margin: 0, paddingLeft: '16px', display: 'grid', gap: '4px' }}>
                    {entry.actions.map((act, aIdx) => <li key={aIdx}>{act}</li>)}
                  </ul>
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
      <SectionHeader
        title={`Programme ATR — ${selectedProgramme.name} (${selectedProgramme.code})`}
        subtitle="Overall PO & PSO target vs attainment analysis across all courses."
        status={status}
        onApprove={onApprove}
        onReject={onReject}
      />

      {poEntries.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Programme Outcomes (POs)</div>
          <div style={{ display: 'grid', gap: '12px' }}>{renderCards(poEntries, accent)}</div>
        </div>
      )}
      {psoEntries.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', marginTop: '12px' }}>Programme Specific Outcomes (PSOs)</div>
          <div style={{ display: 'grid', gap: '12px' }}>{renderCards(psoEntries, '#059669')}</div>
        </div>
      )}
    </div>
  );
}

// ── MAIN HUB COMPONENT ────────────────────────────────────────────────────────
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
    configStatus: 'DRAFT', coStatus: 'PENDING_APPROVAL', atrStatus: 'DRAFT', programmeAtrStatus: 'DRAFT',
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

  // Active status & remarks for top alert banner
  const activeStatusKey  = activeTab === 'config' ? 'configStatus' : activeTab === 'cos' ? 'coStatus' : activeTab === 'atr' ? 'atrStatus' : 'programmeAtrStatus';
  const activeRemarkKey  = activeTab === 'config' ? 'configRemarks' : activeTab === 'cos' ? 'coRemarks' : activeTab === 'atr' ? 'atrRemarks' : 'programmeAtrRemarks';

  const activeTabStatus  = courseReview[activeStatusKey] || 'DRAFT';
  const activeTabRemarks = courseReview[activeRemarkKey] || '';

  // ── REJECTION REMARKS MODAL STATE ───────────────────────────────────────────
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectRemarksInput, setRejectRemarksInput] = useState('');

  const openRejectModal = (statusType, title, defaultRemark = '') => {
    setRejectModalData({ statusType, title });
    setRejectRemarksInput(defaultRemark || 'Please review threshold settings and revise target attainment parameters before resubmission.');
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!rejectModalData) return;
    const { statusType } = rejectModalData;
    updateCourseVerificationStatus(reviewCourseId, statusType, 'REJECTED', rejectRemarksInput, user?.name || 'Programme Coordinator');

    if (statusType === 'coStatus') {
      const updated = courseCOs.map((co) => ({ ...co, status: 'REJECTED' }));
      updateCourseCOs(reviewCourseId, updated);
    }

    setShowRejectModal(false);
    setRejectModalData(null);
    setRejectRemarksInput('');
  };

  const handleApproveSubmission = (statusType) => {
    updateCourseVerificationStatus(reviewCourseId, statusType, 'VERIFIED', '', user?.name || 'Programme Coordinator');
    if (statusType === 'configStatus') {
      updateCourseAttainmentConfig(reviewCourseId, { status: 'VERIFIED' });
    } else if (statusType === 'coStatus') {
      const updated = courseCOs.map((co) => ({ ...co, status: 'APPROVED', approvedBy: user?.name || 'Programme Coordinator' }));
      updateCourseCOs(reviewCourseId, updated);
    }
  };

  const tabDefs = [
    { id: 'config',        label: '1. Attainment Config', icon: Sliders,       status: courseReview.configStatus },
    { id: 'cos',           label: '2. CO Approvals',      icon: CheckCircle2,  status: courseReview.coStatus     },
    { id: 'atr',           label: '3. Course ATR',        icon: FileText,      status: courseReview.atrStatus    },
    { id: 'programme-atr', label: '4. Programme ATR',     icon: Layers,        status: courseReview.programmeAtrStatus },
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
            const done     = status === 'VERIFIED' || status === 'APPROVED';
            const rejected = status === 'REJECTED';
            const pending  = status && !done && !rejected;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                style={{ padding: '7px 16px', borderRadius: '7px', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', background: activeTab === id ? '#ffffff' : 'transparent', color: activeTab === id ? accent : muted, boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Icon size={13} />
                {label}
                {done     && <Check size={12} style={{ color: '#16a34a' }} />}
                {rejected && <XCircle size={12} style={{ color: '#dc2626' }} />}
                {pending  && <Clock size={12} style={{ color: '#d97706' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TOP REJECTION REMARKS ALERT BANNER ────────────────────────────── */}
      {activeTabStatus === 'REJECTED' && activeTabRemarks && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 4px 12px rgba(220,38,38,0.08)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: '2px' }}>
            <AlertCircle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#991b1b', marginBottom: '4px' }}>
              ⚠️ Action Required — Submission Sent Back for Revisions
            </div>
            <div style={{ fontSize: '13px', color: '#b91c1c', fontWeight: '600', lineHeight: 1.5, background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
              <strong>Remarks Forwarded:</strong> "{activeTabRemarks}"
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 1: ATTAINMENT CONFIG ──────────────────────────────────────── */}
      {activeTab === 'config' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <SectionHeader
            title={`Attainment Configuration — ${selectedCourse?.code} · ${selectedCourse?.name}`}
            subtitle={`Submitted by ${selectedCourse?.faculty || 'Course Coordinator'}`}
            status={courseReview.configStatus}
            onApprove={() => handleApproveSubmission('configStatus')}
            onReject={() => openRejectModal('configStatus', `Attainment Config — ${selectedCourse?.code}`)}
          />

          {/* Weight + threshold cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ ...surface, padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Assessment Weightage</div>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div><div style={{ fontSize: '24px', fontWeight: '800', color: accent }}>{attainmentConfig.directWeight}%</div><div style={{ fontSize: '11.5px', color: muted }}>Direct Assessment</div></div>
                <div><div style={{ fontSize: '24px', fontWeight: '800', color: '#0284c7' }}>{attainmentConfig.indirectWeight}%</div><div style={{ fontSize: '11.5px', color: muted }}>Indirect Assessment</div></div>
              </div>
            </div>
            <div style={{ ...surface, padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>CO Target Attainment Threshold</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>{attainmentConfig.directThreshold}%</div>
              <div style={{ fontSize: '11.5px', color: muted }}>Students scoring ≥ {attainmentConfig.directThreshold}% marks meet CO benchmark</div>
            </div>
          </div>

          {/* Direct Level Bands Table */}
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc' }}>
              <Layers size={15} style={{ color: accent }} />
              <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>Direct Assessment Level Percentage Bands (Configured by Course Coordinator)</span>
            </div>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px', textAlign: 'center' }}>Level</th>
                  <th style={{ textAlign: 'center' }}>Min % Marks</th>
                  <th style={{ textAlign: 'center' }}>Max % Marks</th>
                  <th style={{ textAlign: 'center' }}>Attainment Score</th>
                  <th>Description / Target Standard</th>
                </tr>
              </thead>
              <tbody>
                {(attainmentConfig.directLevels || []).map((lvl) => (
                  <tr key={lvl.level}>
                    <td style={{ textAlign: 'center', fontWeight: '800', color: accent }}>Level {lvl.level}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: ink }}>{lvl.minPercentage}%</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: ink }}>{lvl.maxPercentage}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: '800', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '5px' }}>
                        {lvl.level}.0 / 3.0
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: muted }}>
                      {lvl.level === 1 ? 'Low Direct Attainment (Students scoring within minimum threshold)' : lvl.level === 2 ? 'Moderate Direct Attainment (Students scoring within target threshold)' : 'High Direct Attainment (Students exceeding target benchmark)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Indirect Level Bands Table */}
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc' }}>
              <Layers size={15} style={{ color: '#0284c7' }} />
              <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>Indirect Assessment Level Percentage Bands (Configured by Course Coordinator)</span>
            </div>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px', textAlign: 'center' }}>Level</th>
                  <th style={{ textAlign: 'center' }}>Min % Survey Rating</th>
                  <th style={{ textAlign: 'center' }}>Max % Survey Rating</th>
                  <th style={{ textAlign: 'center' }}>Attainment Score</th>
                  <th>Description / Survey Standard</th>
                </tr>
              </thead>
              <tbody>
                {(attainmentConfig.indirectLevels || []).map((lvl) => (
                  <tr key={lvl.level}>
                    <td style={{ textAlign: 'center', fontWeight: '800', color: '#0284c7' }}>Level {lvl.level}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: ink }}>{lvl.minPercentage}%</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: ink }}>{lvl.maxPercentage}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: '800', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '5px' }}>
                        {lvl.level}.0 / 3.0
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: muted }}>
                      {lvl.level === 1 ? 'Low Indirect Rating (Below 50% positive survey feedback)' : lvl.level === 2 ? 'Moderate Indirect Rating (50% to 70% positive survey feedback)' : 'High Indirect Rating (Above 70% positive survey feedback)'}
                    </td>
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
          <SectionHeader
            title={`Course Outcomes — ${selectedCourse?.code} · ${selectedCourse?.name}`}
            subtitle={`Submitted by ${selectedCourse?.faculty || 'Course Coordinator'}`}
            status={courseReview.coStatus}
            onApprove={() => handleApproveSubmission('coStatus')}
            onReject={() => openRejectModal('coStatus', `Course Outcomes — ${selectedCourse?.code}`)}
          />

          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Code</th>
                  <th>Statement</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {courseCOs.map((co) => (
                  <tr key={co.code}>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: accent }}>{co.code}</td>
                    <td style={{ fontSize: '12.5px', color: ink }}>{co.statement}</td>
                    <td style={{ textAlign: 'center' }}>
                      <StatusBadge status={courseReview.coStatus === 'REJECTED' ? 'REJECTED' : co.status || 'PENDING_APPROVAL'} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: COURSE ATR REVIEW ──────────────────────────────────────── */}
      {activeTab === 'atr' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <SectionHeader
            title={`Course ATR — ${selectedCourse?.code} · ${selectedCourse?.name}`}
            subtitle="Target gap analysis & corrective actions from Course Coordinator."
            status={courseReview.atrStatus}
            onApprove={() => handleApproveSubmission('atrStatus')}
            onReject={() => openRejectModal('atrStatus', `Course ATR — ${selectedCourse?.code}`)}
          />

          <CourseATR courseId={reviewCourseId} hideHeader={true} hideFooter={true} readOnly={true} />
        </div>
      )}

      {/* ── TAB 4: PROGRAMME ATR REVIEW ───────────────────────────────────── */}
      {activeTab === 'programme-atr' && (
        <ProgATRTab
          selectedProgramme={selectedProgramme}
          activePOs={activePOs}
          normPSOs={normPSOs}
          progAtrRows={progAtrRows}
          onApprove={() => handleApproveSubmission('programmeAtrStatus')}
          onReject={() => openRejectModal('programmeAtrStatus', `Programme ATR — ${selectedProgramme.code}`)}
          status={courseReview.programmeAtrStatus}
        />
      )}

      {/* ── REJECTION REMARKS MODAL DIALOG ──────────────────────────────────── */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'grid', placeItems: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'grid', placeItems: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                  Send Back Submission for Revision
                </h3>
              </div>
              <button type="button" onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              Target Item: <strong>{rejectModalData?.title}</strong>
            </p>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
              Enter Remarks &amp; Action Required for Course Coordinator:
            </label>
            <textarea
              rows={4}
              value={rejectRemarksInput}
              onChange={(e) => setRejectRemarksInput(e.target.value)}
              placeholder="e.g. Target threshold for CO3 should be revised to 2.8 and direct weightage adjusted to 80%."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmReject}
                style={{ background: '#dc2626', color: '#ffffff', fontWeight: '800' }}
              >
                Send Back with Remarks →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
