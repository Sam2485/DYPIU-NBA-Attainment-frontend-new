import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, Filter, Check, X,
  BookOpen, Users, ChevronDown, AlertTriangle, BarChart3, MessageSquare,
  Layers, FileText, Target, ShieldCheck,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import ApprovalHeaderControls from '../../components/common/ApprovalHeaderControls';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';

// ── Style tokens ─────────────────────────────────────────────────────────────
const surface = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
const ink    = '#0f172a';
const muted  = '#64748b';
const accent = '#4f46e5';
const inputStyle = {
  height: '40px', fontSize: '13px', border: '1px solid #e2e8f0',
  borderRadius: '8px', padding: '0 12px', background: '#ffffff',
  color: ink, width: '100%', outline: 'none', fontFamily: 'inherit',
};

const STATUS_META = {
  VERIFIED:             { bg: '#f0fdf4', color: '#15803d', border: '#86efac', label: 'Verified & Approved', icon: '✓' },
  APPROVED:             { bg: '#f0fdf4', color: '#15803d', border: '#86efac', label: 'Verified & Approved', icon: '✓' },
  SUBMITTED:            { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review',     icon: '⏳' },
  PENDING_APPROVAL:     { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review',     icon: '⏳' },
  WAITING_FOR_APPROVAL: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review',     icon: '⏳' },
  PENDING:              { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review',     icon: '⏳' },
  DRAFT:                { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'Draft',              icon: '—'  },
  REJECTED:             { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Needs Revision',     icon: '⚠' },
  REVISION_REQUESTED:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Needs Revision',     icon: '⚠' },
  NEEDS_REVISION:       { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Needs Revision',     icon: '⚠' },
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

function SectionHeader({
  title,
  subtitle,
  status,
  onApprove,
  onReject,
  revisionCardTitle = 'Revision Requested',
  revisionCardRemarks = 'Please review and revise details as per HOD notes.',
  revisionCardActionText = 'The Programme Coordinator has been notified to revise the submission.',
}) {
  const isNeedsRevision = status === 'REJECTED' || status === 'REVISION_REQUESTED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ ...surface, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: ink }}>{title}</div>
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
          requestedBy="Head of Department (HOD)"
          remarks={revisionCardRemarks}
          actionText={revisionCardActionText}
        />
      )}
    </div>
  );
}

// ── PROGRAMME ATR REVIEW TAB ──────────────────────────────────────────────────
function ProgATRTab({ selectedProgramme, activePOs, normPSOs, progAtrRows, onApprove, onReject, status, remarks }) {
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
        title="Programme ATR"
        subtitle={`Submitted by Programme Coordinator: ${selectedProgramme?.coordinator || 'Dr. A. K. Sharma'}`}
        status={status}
        onApprove={onApprove}
        onReject={onReject}
        revisionCardTitle={`Revision Requested for Programme ATR (${selectedProgramme?.code})`}
        revisionCardRemarks={remarks || 'Please review PO/PSO target vs actual attainment calculations.'}
        revisionCardActionText="The Programme Coordinator has been notified to revise programme-level ATR entries."
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

// ── MAIN HOD APPROVALS COMPONENT ─────────────────────────────────────────────
export default function HodApprovals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    departments = [],
    masterProgrammes = [],
    courses = [],
    activePOs = [],
    activePSOs = [],
    poPsoTargets = {},
    approveHodSubmission = () => {},
    academicYear = '2025-26',
    courseVerificationStore = {},
    updateCourseVerificationStatus = () => {},
  } = useAcademic();

  const verifierName = user?.name || 'Dr. Raj Shaikh (HOD)';

  const currentDept =
    departments.find((d) => d.hod === user?.name || d.hodEmail === user?.email) ||
    departments[0];

  const hodProgrammes = masterProgrammes.filter(
    (p) =>
      p.departmentId === currentDept?.id ||
      p.department === currentDept?.name ||
      p.departmentId === 'dept-1'
  );

  const [selectedProgId, setSelectedProgId] = useState(hodProgrammes[0]?.id || masterProgrammes[0]?.id || 'prog-1');

  const activeProg =
    masterProgrammes.find((p) => p.id === selectedProgId) ||
    hodProgrammes[0] ||
    masterProgrammes[0] ||
    { id: 'prog-1', name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  const progCourses = courses.filter(
    (c) => c.programmeId === selectedProgId || (!c.programmeId && selectedProgId === 'prog-1')
  );

  // ── Verification Keys & Records ───────────────────────────────────────────
  const allocationKey = `allocation-${selectedProgId}`;
  const allocationRecord = courseVerificationStore[allocationKey] || {};
  const allocationStatus = allocationRecord.allocationStatus || 'PENDING';
  const allocationRemarks = allocationRecord.allocationRemarks || '';

  const progAtrKey = `prog-atr-${selectedProgId}`;
  const progAtrRecord = courseVerificationStore[progAtrKey] || courseVerificationStore[allocationKey] || courseVerificationStore[selectedProgId] || {};
  const programmeAtrStatus = progAtrRecord.programmeAtrStatus || 'PENDING';
  const programmeAtrRemarks = progAtrRecord.programmeAtrRemarks || '';

  // ── Active Tab (URL-driven) ───────────────────────────────────────────────
  const TABS = ['allocations', 'programme-atr'];
  const currentTabParam = searchParams.get('tab') || 'allocations';
  const [activeTab, setActiveTab] = useState(
    TABS.includes(currentTabParam) ? currentTabParam : 'allocations',
  );

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && TABS.includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // ── Filter State for Courses Table ────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [hoveredRow, setHoveredRow] = useState(null);

  const filteredCourses = progCourses.filter((c) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ASSIGNED') return !!(c.coordinator || c.faculty);
    if (filterStatus === 'UNASSIGNED') return !(c.coordinator || c.faculty);
    return true;
  });

  // ── Outcome ATR Rows for Tab 2 ────────────────────────────────────────────
  const progTargets = poPsoTargets[selectedProgId] || {};
  const normPSOs = activePSOs.map((p) => ({ ...p, competencies: p.competencies ?? [] }));
  const progAtrRows = [
    ...activePOs.map((po) => ({
      code: po.code, type: 'PO', statement: po.statement,
      target: progTargets.poTargets?.[po.code] ?? 2.0,
      actual: (progTargets.poTargets?.[po.code] ?? 2.0) * (0.88 + Math.random() * 0.25),
    })),
    ...normPSOs.map((pso) => ({
      code: pso.code, type: 'PSO', statement: pso.statement,
      target: progTargets.psoTargets?.[pso.code] ?? 2.0,
      actual: (progTargets.psoTargets?.[pso.code] ?? 2.0) * (0.88 + Math.random() * 0.25),
    })),
  ].map((r) => ({ ...r, actual: Math.min(3, Math.round(r.actual * 100) / 100), met: r.actual >= r.target }));

  // ── Rejection / Revision Modal State ──────────────────────────────────────
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectRemarksInput, setRejectRemarksInput] = useState('');

  const openRejectModal = (statusType, title, defaultRemark = '') => {
    setRejectModalData({ statusType, title });
    setRejectRemarksInput(defaultRemark || 'Please review and re-assign Course Coordinators as per HOD notes.');
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!rejectModalData) return;
    const { statusType } = rejectModalData;
    const finalRemarks = rejectRemarksInput.trim() || 'Please review and revise details as per HOD notes.';

    if (statusType === 'allocationStatus') {
      updateCourseVerificationStatus(allocationKey, 'allocationStatus', 'REVISION_REQUESTED', finalRemarks, verifierName);
    } else if (statusType === 'programmeAtrStatus') {
      updateCourseVerificationStatus(progAtrKey, 'programmeAtrStatus', 'REVISION_REQUESTED', finalRemarks, verifierName);
      updateCourseVerificationStatus(allocationKey, 'programmeAtrStatus', 'REVISION_REQUESTED', finalRemarks, verifierName);
      updateCourseVerificationStatus(selectedProgId, 'programmeAtrStatus', 'REVISION_REQUESTED', finalRemarks, verifierName);
    }

    setShowRejectModal(false);
    setRejectModalData(null);
    setRejectRemarksInput('');
  };

  const handleApproveSubmission = (statusType) => {
    if (statusType === 'allocationStatus') {
      updateCourseVerificationStatus(allocationKey, 'allocationStatus', 'APPROVED', '', verifierName);
      approveHodSubmission(selectedProgId, verifierName);
      approveHodSubmission('ALL', verifierName);
    } else if (statusType === 'programmeAtrStatus') {
      updateCourseVerificationStatus(progAtrKey, 'programmeAtrStatus', 'APPROVED', '', verifierName);
      updateCourseVerificationStatus(allocationKey, 'programmeAtrStatus', 'APPROVED', '', verifierName);
      updateCourseVerificationStatus(selectedProgId, 'programmeAtrStatus', 'APPROVED', '', verifierName);
    }
  };

  const tabDefs = [
    { id: 'allocations',   label: '1. Courses & Coordinators', icon: Users,  status: allocationStatus   },
    { id: 'programme-atr', label: '2. Programme ATR',          icon: Layers, status: programmeAtrStatus },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            HOD Portal &nbsp;·&nbsp; Verification Panel
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Programme Submissions Review
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Verify and approve programme submissions for <strong>{activeProg.name}</strong> ({academicYear}).
          </p>
        </div>

        {/* Programme selector on extreme right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: 'auto' }}>
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <select
              value={selectedProgId}
              onChange={(e) => setSelectedProgId(e.target.value)}
              style={{ ...inputStyle, paddingRight: '32px', fontWeight: '700', color: accent, appearance: 'none', cursor: 'pointer', background: '#f5f3ff', border: '1.5px solid #c7d2fe' }}
            >
              {hodProgrammes.map((p) => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: accent, pointerEvents: 'none' }} />
          </div>
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
                padding: '8px 18px', borderRadius: '7px', border: 'none', fontSize: '12.5px',
                fontWeight: '700', cursor: 'pointer',
                background: activeTab === id ? '#ffffff' : 'transparent',
                color: activeTab === id ? accent : muted,
                boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: COURSES & COORDINATORS ALLOCATIONS REVIEW ──────────────── */}
      {activeTab === 'allocations' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <SectionHeader
            title="Courses &amp; Coordinator Allocations"
            subtitle={`Submitted by Programme Coordinator: ${activeProg.coordinator || 'Dr. A. K. Sharma'}`}
            status={allocationStatus}
            onApprove={() => handleApproveSubmission('allocationStatus')}
            onReject={() => openRejectModal('allocationStatus', `Course Allocations — ${activeProg.code}`, allocationRemarks)}
            revisionCardTitle={`Revision Requested for Course Coordinator Allocations (${activeProg.code})`}
            revisionCardRemarks={allocationRemarks || 'Please review and re-assign Course Coordinators as per HOD notes.'}
            revisionCardActionText="The Programme Coordinator has been notified to revise the Course Coordinator assignments."
          />

          {/* Table Card */}
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            {/* Filter toolbar */}
            <div style={{
              padding: '12px 18px', borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} style={{ color: accent }} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>Course Roster</span>
                <span style={{ fontSize: '11px', fontWeight: '800', background: '#eef2ff', color: accent, padding: '2px 8px', borderRadius: '5px', border: '1px solid #c7d2fe' }}>
                  {filteredCourses.length} Courses
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <Filter size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    height: '34px', fontSize: '12px', fontWeight: '600',
                    color: ink, background: '#ffffff',
                    border: '1px solid #e2e8f0', borderRadius: '8px',
                    padding: '0 10px 0 28px', outline: 'none',
                    appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <option value="ALL">All Courses</option>
                  <option value="ASSIGNED">Assigned Only</option>
                  <option value="UNASSIGNED">Unassigned Only</option>
                </select>
              </div>
            </div>

            {/* Courses table */}
            <table className="audit-data-table" style={{ margin: 0, border: 'none' }}>
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Course Code</th>
                  <th>Course Name</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Semester</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Type</th>
                  <th>Assigned Coordinator</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px 20px', color: muted, fontSize: '13px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={28} style={{ color: '#cbd5e1' }} />
                        <span style={{ fontWeight: '600', color: '#94a3b8' }}>
                          {filterStatus !== 'ALL'
                            ? `No ${filterStatus.toLowerCase()} courses found.`
                            : `No courses added yet under ${activeProg?.name} by Programme Coordinator.`}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c, idx) => {
                    const hasCoordinator = !!(c.coordinator || c.faculty);
                    const isHovered = hoveredRow === c.id;
                    return (
                      <tr
                        key={c.id}
                        onMouseEnter={() => setHoveredRow(c.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          background: isHovered ? '#f8faff' : '#ffffff',
                          transition: 'background 0.12s ease',
                        }}
                      >
                        <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: '12px' }}>
                          {idx + 1}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: '800', fontSize: '12px', color: '#4f46e5', background: '#eef2ff', borderRadius: '6px', padding: '3px 9px' }}>
                            {c.code}
                          </span>
                        </td>
                        <td style={{ fontWeight: '700', color: ink }}>
                          {c.name}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted, background: '#f8fafc', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            {c.semester || `Sem ${idx + 1}`}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: '700', color: c.type === 'LAB' ? '#0284c7' : '#7c3aed', background: c.type === 'LAB' ? '#f0f9ff' : '#f5f3ff', padding: '2px 8px', borderRadius: '6px', border: `1px solid ${c.type === 'LAB' ? '#bae6fd' : '#ddd6fe'}` }}>
                            {c.type || 'Theory'}
                          </span>
                        </td>
                        <td>
                          {hasCoordinator ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #a5b4fc, #818cf8)',
                                display: 'grid', placeItems: 'center',
                                fontSize: '10px', fontWeight: '800', color: '#ffffff', flexShrink: 0,
                              }}>
                                {(c.coordinator || c.faculty || '?')[0]}
                              </div>
                              <span style={{ fontWeight: '700', color: '#059669', fontSize: '13px' }}>
                                {c.coordinator || c.faculty}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#f59e0b', fontSize: '12.5px', fontWeight: '600', fontStyle: 'italic' }}>
                              — Not Assigned —
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <StatusBadge status={allocationStatus} size="sm" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Table summary footer */}
            {filteredCourses.length > 0 && (
              <div style={{
                padding: '10px 18px', borderTop: '1px solid #f1f5f9',
                background: '#fafbfc', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
              }}>
                <span style={{ fontSize: '12px', color: muted }}>
                  Showing {filteredCourses.length} of {progCourses.length} course{progCourses.length !== 1 ? 's' : ''}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={13} style={{ color: muted }} />
                  <span style={{ fontSize: '12px', color: muted }}>
                    {progCourses.filter((c) => c.coordinator || c.faculty).length} / {progCourses.length} coordinators assigned
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: PROGRAMME ATR REVIEW ───────────────────────────────────── */}
      {activeTab === 'programme-atr' && (
        <ProgATRTab
          selectedProgramme={activeProg}
          activePOs={activePOs}
          normPSOs={normPSOs}
          progAtrRows={progAtrRows}
          onApprove={() => handleApproveSubmission('programmeAtrStatus')}
          onReject={() => openRejectModal('programmeAtrStatus', `Programme ATR — ${activeProg.code}`, programmeAtrRemarks)}
          status={programmeAtrStatus}
          remarks={programmeAtrRemarks}
        />
      )}

      {/* ── REJECTION / REVISION MODAL DIALOG ──────────────────────────────── */}
      {showRejectModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '20px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px',
            width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto',
            padding: '24px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'grid', placeItems: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                  Request Revision
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              Target Item: <strong>{rejectModalData?.title}</strong>
            </p>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
              Feedback / Action Required for Programme Coordinator:
            </label>
            <textarea
              rows={4}
              value={rejectRemarksInput}
              onChange={(e) => setRejectRemarksInput(e.target.value)}
              placeholder="e.g. Please re-assign Course Coordinators for Semester V and verify PO/PSO target calculations."
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none',
                fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmReject}
                style={{ background: '#dc2626', color: '#ffffff', fontWeight: '800' }}
              >
                Confirm Revision Request →
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
