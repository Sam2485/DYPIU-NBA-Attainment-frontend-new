import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, Clock, Check, Sliders,
  FileText, Layers, XCircle, ChevronDown, AlertCircle, X,
  MessageSquare, BookOpen, Target, TrendingUp, TrendingDown,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import CourseATR from '../atr/CourseATR';
import ApprovalHeaderControls from '../../components/common/ApprovalHeaderControls';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';

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
  VERIFIED:             { bg: '#f0fdf4', color: '#15803d', border: '#86efac', label: 'Verified & Approved', icon: '✓' },
  APPROVED:             { bg: '#f0fdf4', color: '#15803d', border: '#86efac', label: 'Verified & Approved', icon: '✓' },
  SUBMITTED:            { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review',     icon: '⏳' },
  PENDING:              { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review',     icon: '⏳' },
  PENDING_APPROVAL:     { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review',     icon: '⏳' },
  WAITING_FOR_APPROVAL: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review',     icon: '⏳' },
  DRAFT:                { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'No Submissions Yet', icon: '—'  },
  NO_SUBMISSION:        { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'No Submissions Yet', icon: '—'  },
  NOT_SUBMITTED:        { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'No Submissions Yet', icon: '—'  },
  REJECTED:             { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Needs Revision',     icon: '⚠' },
  REVISION_REQUESTED:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Needs Revision',     icon: '⚠' },
  NEEDS_REVISION:       { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Needs Revision',     icon: '⚠' },
};

function StatusBadge({ status, size = 'md' }) {
  const s = STATUS_META[status] || STATUS_META.NO_SUBMISSION;
  const pad = size === 'sm' ? '2px 8px' : '4px 11px';
  const fs  = size === 'sm' ? '10.5px'  : '11.5px';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: fs, fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '6px', padding: pad, whiteSpace: 'nowrap' }}>
      {s.icon} {s.label}
    </span>
  );
}

function NoSubmissionsEmptyState({ itemTitle, courseCode }) {
  return (
    <div
      style={{
        ...surface,
        padding: '60px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: '#ffffff',
        border: '1.5px dashed #cbd5e1',
        borderRadius: '16px',
        margin: '8px 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'grid',
          placeItems: 'center',
          color: '#64748b',
          marginBottom: '4px',
        }}
      >
        <Clock size={28} style={{ color: '#94a3b8' }} />
      </div>
      <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
        No Submissions Yet
      </h3>
      <p style={{ margin: 0, fontSize: '13px', color: '#64748b', maxWidth: '440px', lineHeight: 1.5 }}>
        The Course Coordinator has not submitted <strong>{itemTitle}</strong> for <strong>{courseCode}</strong> yet. Once submitted for review, it will appear here for verification and approval.
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  status,
  onApprove,
  onReject,
  revisionCardTitle = 'Revision Requested',
  revisionCardRemarks = 'Please review and revise details as per coordinator notes.',
  revisionCardActionText = 'The Course Coordinator has been notified to revise the submission.',
}) {
  const isNeedsRevision = status === 'REJECTED' || status === 'REVISION_REQUESTED' || status === 'NEEDS_REVISION';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ ...surface, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{title}</div>
          {subtitle && <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>{subtitle}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ApprovalHeaderControls
            status={status}
            onApprove={onApprove}
            onRequestRevision={onReject}
            approveText="Approve & Verify"
            approvedText="Verified & Approved"
            requestRevisionText="Request Revision"
            editRevisionText="Edit Revision Request"
            showButtonsOnly={true}
          />
        </div>
      </div>

      {isNeedsRevision && (
        <RequestRevisionCard
          title={revisionCardTitle}
          requestedBy="Programme Coordinator"
          remarks={revisionCardRemarks}
          actionText={revisionCardActionText}
        />
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
    coTargets                = {},
  } = useAcademic();

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) ||
    masterProgrammes[0] ||
    { name: 'B.Tech CSE', code: 'BE-COMP' };

  // ── Active tab (URL-driven) ───────────────────────────────────────────────
  const TABS = ['config', 'cos', 'atr'];
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
    configStatus: 'NO_SUBMISSION', coStatus: 'NO_SUBMISSION', atrStatus: 'NO_SUBMISSION', programmeAtrStatus: 'NO_SUBMISSION',
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

  // Active status & remarks for top alert banner
  const activeStatusKey  = activeTab === 'config' ? 'configStatus' : activeTab === 'cos' ? 'coStatus' : 'atrStatus';
  const activeRemarkKey  = activeTab === 'config' ? 'configRemarks' : activeTab === 'cos' ? 'coRemarks' : 'atrRemarks';

  const activeTabStatus  = courseReview[activeStatusKey] || 'NO_SUBMISSION';
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
    { id: 'config', label: '1. Attainment Settings', icon: Sliders,      status: courseReview.configStatus },
    { id: 'cos',    label: '2. CO Approvals',        icon: CheckCircle2, status: courseReview.coStatus     },
    { id: 'atr',    label: '3. Course ATR',          icon: FileText,     status: courseReview.atrStatus    },
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
          {tabDefs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTabChange(id)}
              style={{
                padding: '8px 18px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                background: activeTab === id ? '#ffffff' : 'transparent',
                color: activeTab === id ? accent : muted,
                boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: ATTAINMENT SETTINGS ─────────────────────────────────────── */}
      {activeTab === 'config' && (
        !courseReview.configStatus || courseReview.configStatus === 'NO_SUBMISSION' || courseReview.configStatus === 'DRAFT' || courseReview.configStatus === 'NOT_SUBMITTED' ? (
          <NoSubmissionsEmptyState itemTitle="Attainment Settings" courseCode={selectedCourse?.code || 'this course'} />
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            <SectionHeader
              title="Attainment Settings"
              subtitle={`Submitted by Course Coordinator: ${selectedCourse?.coordinator || selectedCourse?.faculty || 'Course Coordinator'}`}
              status={courseReview.configStatus}
              onApprove={() => handleApproveSubmission('configStatus')}
              onReject={() => openRejectModal('configStatus', `Attainment Settings — ${selectedCourse?.code}`)}
              revisionCardTitle={`Revision Requested for Attainment Settings (${selectedCourse?.code})`}
              revisionCardRemarks={courseReview.configRemarks || 'Please review direct/indirect weightages and percentage level bands.'}
              revisionCardActionText="The Course Coordinator has been notified to revise threshold levels and assessment weightages."
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
        )
      )}

      {/* ── TAB 2: CO APPROVALS ───────────────────────────────────────────── */}
      {activeTab === 'cos' && (
        !courseReview.coStatus || courseReview.coStatus === 'NO_SUBMISSION' || courseReview.coStatus === 'DRAFT' || courseReview.coStatus === 'NOT_SUBMITTED' ? (
          <NoSubmissionsEmptyState itemTitle="Course Outcomes" courseCode={selectedCourse?.code || 'this course'} />
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            <SectionHeader
              title="CO Approvals"
              subtitle={`Submitted by Course Coordinator: ${selectedCourse?.coordinator || selectedCourse?.faculty || 'Course Coordinator'}`}
              status={courseReview.coStatus}
              onApprove={() => handleApproveSubmission('coStatus')}
              onReject={() => openRejectModal('coStatus', `CO Approvals — ${selectedCourse?.code}`)}
              revisionCardTitle={`Revision Requested for CO Approvals (${selectedCourse?.code})`}
              revisionCardRemarks={courseReview.coRemarks || 'Please review and update Course Outcome statements.'}
              revisionCardActionText="The Course Coordinator has been notified to revise Course Outcome statements."
            />

            <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
              <table className="audit-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>Code</th>
                    <th>Statement</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Target Level</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courseCOs.map((co) => {
                    const courseCoTargets = coTargets[reviewCourseId] || {};
                    const targetVal = courseCoTargets[co.code] || co.target || 2.50;
                    const rowStatus =
                      courseReview.coStatus === 'VERIFIED' || courseReview.coStatus === 'APPROVED'
                        ? 'VERIFIED'
                        : courseReview.coStatus === 'REJECTED' || courseReview.coStatus === 'REVISION_REQUESTED' || courseReview.coStatus === 'NEEDS_REVISION'
                        ? 'REJECTED'
                        : courseReview.coStatus === 'SUBMITTED' || courseReview.coStatus === 'PENDING_APPROVAL' || courseReview.coStatus === 'PENDING'
                        ? 'PENDING_APPROVAL'
                        : 'NO_SUBMISSION';

                    return (
                      <tr key={co.code}>
                        <td style={{ textAlign: 'center', fontWeight: '700', color: accent }}>{co.code}</td>
                        <td style={{ fontSize: '12.5px', color: ink }}>{co.statement}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: '800', color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '3px 10px', borderRadius: '6px', fontSize: '12px' }}>
                            {Number(targetVal).toFixed(2)} / 3.00
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <StatusBadge status={rowStatus} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ── TAB 3: COURSE ATR REVIEW ──────────────────────────────────────── */}
      {activeTab === 'atr' && (
        !courseReview.atrStatus || courseReview.atrStatus === 'NO_SUBMISSION' || courseReview.atrStatus === 'DRAFT' || courseReview.atrStatus === 'NOT_SUBMITTED' ? (
          <NoSubmissionsEmptyState itemTitle="Course Action Taken Report (ATR)" courseCode={selectedCourse?.code || 'this course'} />
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            <SectionHeader
              title="Course ATR"
              subtitle={`Submitted by Course Coordinator: ${selectedCourse?.coordinator || selectedCourse?.faculty || 'Course Coordinator'}`}
              status={courseReview.atrStatus}
              onApprove={() => handleApproveSubmission('atrStatus')}
              onReject={() => openRejectModal('atrStatus', `Course ATR — ${selectedCourse?.code}`)}
              revisionCardTitle={`Revision Requested for Course ATR (${selectedCourse?.code})`}
              revisionCardRemarks={courseReview.atrRemarks || 'Please review gap analysis observations and action plans.'}
              revisionCardActionText="The Course Coordinator has been notified to revise the Action Taken Report."
            />

            <CourseATR courseId={reviewCourseId} hideHeader={true} hideFooter={true} readOnly={true} />
          </div>
        )
      )}

      {/* ── REJECTION REMARKS MODAL DIALOG ──────────────────────────────────── */}
      {showRejectModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', boxSizing: 'border-box' }}>
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
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
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
        </div>,
        document.body
      )}

    </div>
  );
}
