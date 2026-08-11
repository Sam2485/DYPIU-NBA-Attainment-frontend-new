import { useState } from 'react';
import {
  CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, Filter, Check, X, BookOpen, Users,
  ChevronDown, AlertTriangle, BarChart3, MessageSquare,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';
import { useAuth } from '../../context/AuthContext';

/* ─── tiny style helpers ─────────────────────────────────────────── */
const surface = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
const ink   = '#0f172a';
const muted = '#64748b';
const accent = '#4f46e5';

function Badge({ children, color = 'blue' }) {
  const map = {
    blue:   { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    green:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    amber:  { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    red:    { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    purple: { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
    slate:  { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  };
  const c = map[color] || map.blue;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '11px', fontWeight: '700', borderRadius: '6px',
      padding: '2px 8px', background: c.bg, color: c.text,
      border: `1px solid ${c.border}`, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}


/* ─── status pill used in table rows ────────────────────────────── */
function StatusPill({ status }) {
  if (status === 'APPROVED')
    return <Badge color="green"><Check size={10} /> Approved</Badge>;
  if (status === 'REVISION_REQUESTED')
    return <Badge color="red"><AlertTriangle size={10} /> Revision</Badge>;
  return <Badge color="amber"><Clock size={10} /> Pending</Badge>;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function HodApprovals() {
  const { user } = useAuth();
  const {
    departments = [],
    masterProgrammes = [],
    courses = [],
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

  const [selectedProgId, setSelectedProgId] = useState(hodProgrammes[0]?.id || 'prog-1');
  const [showRejectModal, setShowRejectModal]   = useState(false);
  const [rejectRemarks, setRejectRemarks]       = useState('');
  const [filterStatus, setFilterStatus]         = useState('ALL');
  const [hoveredRow, setHoveredRow]             = useState(null);

  const activeProg =
    masterProgrammes.find((p) => p.id === selectedProgId) ||
    hodProgrammes[0] ||
    masterProgrammes[0];

  const progCourses = courses.filter(
    (c) => c.programmeId === selectedProgId || (!c.programmeId && selectedProgId === 'prog-1')
  );

  const allocationKey    = `allocation-${selectedProgId}`;
  const allocationRecord = courseVerificationStore[allocationKey] || {};
  const allocationStatus = allocationRecord.allocationStatus || 'PENDING';
  const allocationRemarks = allocationRecord.allocationRemarks || '';
  const isApproved       = allocationStatus === 'APPROVED';
  const isNeedsRevision  = allocationStatus === 'REVISION_REQUESTED';


  /* ── filtered courses ──────────────────────────────────────────── */
  const filteredCourses = progCourses.filter((c) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ASSIGNED') return !!(c.coordinator || c.faculty);
    if (filterStatus === 'UNASSIGNED') return !(c.coordinator || c.faculty);
    return true;
  });

  /* ── actions ───────────────────────────────────────────────────── */
  const handleApprove = () => {
    updateCourseVerificationStatus(allocationKey, 'allocationStatus', 'APPROVED', '', verifierName);
    alert(`🎉 Course Coordinator allocations for ${activeProg?.code || 'programme'} approved by HOD!`);
  };

  const handleConfirmReject = () => {
    const finalRemarks = rejectRemarks.trim() || 'Please review and re-assign Course Coordinators as per HOD notes.';
    updateCourseVerificationStatus(
      allocationKey,
      'allocationStatus',
      'REVISION_REQUESTED',
      finalRemarks,
      verifierName
    );
    setShowRejectModal(false);
    alert(`⚠️ Revision request sent to Programme Coordinator for ${activeProg?.code || 'programme'}!`);
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="animated-page" style={{ paddingBottom: '56px' }}>

      {/* ── HEADER BANNER ──────────────────────────────────────────── */}
      <div className="banner-dark-gradient" style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px',
        }}>
          {/* Left: title block */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: '#eef2ff', color: accent,
                fontWeight: '800', fontSize: '10px', borderRadius: '5px',
                padding: '2px 9px', letterSpacing: '0.07em', textTransform: 'uppercase',
                border: '1px solid #c7d2fe',
              }}>
                HOD Portal · Approvals
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#000000', fontWeight: '800', letterSpacing: '-0.01em' }}>
              Approvals
            </h2>
          </div>

          {/* Right: programme selector + coordinator name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '280px', maxWidth: '380px', flex: '1 1 280px' }}>
            <label style={{
              display: 'block', fontSize: '10px', fontWeight: '800',
              color: '#475569', textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}>
              Programme under review
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedProgId}
                onChange={(e) => setSelectedProgId(e.target.value)}
                style={{
                  width: '100%', height: '40px', fontSize: '13px',
                  fontWeight: '700', color: '#1e293b',
                  background: '#ffffff', border: '1.5px solid rgba(255,255,255,0.8)',
                  borderRadius: '9px', padding: '0 34px 0 12px',
                  outline: 'none', appearance: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                }}
              >
                {hodProgrammes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} style={{
                position: 'absolute', right: '10px', top: '50%',
                transform: 'translateY(-50%)', color: '#4f46e5', pointerEvents: 'none',
              }} />
            </div>
            {/* Coordinator name beneath selector */}
            <div style={{ fontSize: '11.5px', color: '#94a3b8', paddingLeft: '2px' }}>
              Programme Coordinator: <span style={{ color: '#e2e8f0', fontWeight: '700' }}>{activeProg?.coordinator || 'Dr. A. K. Sharma'}</span>
            </div>
          </div>
        </div>
      </div>


      {/* ── STATUS ALERT BANNERS ────────────────────────────────────── */}
      {isApproved && (
        <div style={{
          background: '#f0fdf4', border: '1.5px solid #86efac',
          borderRadius: '12px', padding: '14px 18px',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#dcfce7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#15803d' }}>
              Course Coordinator Allocations Approved — {activeProg?.code}
            </div>
            <div style={{ fontSize: '12.5px', color: '#166534', marginTop: '2px' }}>
              All assignments for <strong>{activeProg?.name}</strong> have been verified and approved by {verifierName}.
            </div>
          </div>
        </div>
      )}



      {/* ── MAIN TABLE CARD ─────────────────────────────────────────── */}
      <div style={{ ...surface, overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
          background: '#fafbfc',
        }}>
          {/* Left: title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: '#4f46e5' }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>
                Courses &amp; Coordinator Allocations
                <span style={{ marginLeft: '8px' }}>
                  <Badge color="purple">{activeProg?.code}</Badge>
                </span>
              </div>
              <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
                Submitted by Programme Coordinator: <strong>{activeProg?.coordinator || 'Dr. A. K. Sharma'}</strong>
              </div>
            </div>
          </div>

          {/* Right: filter + action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter dropdown */}
            <div style={{ position: 'relative' }}>
              <Filter size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  height: '34px', fontSize: '12px', fontWeight: '600',
                  color: ink, background: '#f8fafc',
                  border: '1px solid #e2e8f0', borderRadius: '8px',
                  padding: '0 10px 0 28px', outline: 'none',
                  appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <option value="ALL">All Courses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="UNASSIGNED">Unassigned</option>
              </select>
            </div>

            {/* Approve button */}
            <button
              type="button"
              onClick={handleApprove}
              style={{
                height: '36px', padding: '0 16px', fontSize: '12.5px',
                fontWeight: '800', display: 'inline-flex', alignItems: 'center',
                gap: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit',
                background: isApproved ? '#16a34a' : '#059669',
                color: '#ffffff',
                boxShadow: isApproved ? '0 0 0 3px rgba(187,247,208,0.6)' : 'none',
              }}
            >
              <Check size={14} />
              {isApproved ? `Approved (${activeProg?.code})` : `Approve Allocations`}
            </button>

            {/* Reject / Revision button */}
            <button
              type="button"
              onClick={() => { setRejectRemarks(allocationRemarks || 'Please review and re-assign Course Coordinators as per HOD notes.'); setShowRejectModal(true); }}
              style={{
                height: '36px', padding: '0 14px', fontSize: '12.5px',
                fontWeight: '700', display: 'inline-flex', alignItems: 'center',
                gap: '6px', borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'inherit',
                background: isNeedsRevision ? '#fee2e2' : '#fef2f2',
                color: '#dc2626',
                border: `1px solid ${isNeedsRevision ? '#fca5a5' : '#fecaca'}`,
              }}
            >
              <RefreshCw size={13} />
              {isNeedsRevision ? 'Edit Revision Request' : 'Request Revision'}
            </button>
          </div>
        </div>

        {/* Revision Alert Card */}
        {isNeedsRevision && (
          <div style={{ padding: '0 20px', paddingTop: '16px' }}>
            <RequestRevisionCard
              title="Revision Requested for Programme Allocations"
              requestedBy="Head of Department (HOD)"
              remarks={allocationRemarks || 'Course Coordinator allocations sent back to Programme Coordinator for revision.'}
              actionText="The Programme Coordinator has been notified to revise the Course Coordinator assignments."
            />
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['#', 'Course Code', 'Course Name', 'Semester', 'Course Type', 'Assigned Coordinator', 'Status'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: i <= 1 || i === 3 ? 'center' : 'left',
                    fontSize: '11px', fontWeight: '700', color: muted,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{
                    textAlign: 'center', padding: '48px 20px',
                    color: muted, fontSize: '13px',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={32} style={{ color: '#cbd5e1' }} />
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
                        borderBottom: '1px solid #f1f5f9',
                        background: isHovered ? '#f8faff' : '#ffffff',
                        transition: 'background 0.12s ease',
                      }}
                    >
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: '12px' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{
                          fontWeight: '800', fontSize: '12px', color: '#4f46e5',
                          background: '#eef2ff', borderRadius: '6px', padding: '3px 9px',
                        }}>
                          {c.code}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: ink, maxWidth: '220px' }}>
                        {c.name}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <Badge color="slate">Sem {c.semester || idx + 1}</Badge>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge color={c.type === 'LAB' ? 'blue' : 'purple'}>
                          {c.type || 'Theory'}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
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
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <StatusPill status={allocationStatus} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filteredCourses.length > 0 && (
          <div style={{
            padding: '10px 18px',
            borderTop: '1px solid #f1f5f9',
            background: '#fafbfc',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '8px',
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


      {/* ── REJECTION / REVISION MODAL ─────────────────────────────── */}
      {showRejectModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,23,42,0.55)',
          display: 'grid', placeItems: 'center',
          zIndex: 200, padding: '20px',
          backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px',
            width: '100%', maxWidth: '520px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '18px 22px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fef2f2',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', display: 'grid', placeItems: 'center', color: '#dc2626' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#991b1b' }}>
                    Request Revision
                  </div>
                  <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '1px' }}>
                    Send allocations back to Programme Coordinator
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'rgba(220,38,38,0.08)', border: 'none',
                  cursor: 'pointer', display: 'grid', placeItems: 'center',
                  color: '#dc2626',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 22px' }}>
              {/* Target info chip */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '9px',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                marginBottom: '16px',
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: '#4f46e5', flexShrink: 0 }}>
                  <BookOpen size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: ink }}>
                    {activeProg?.code} — {activeProg?.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: muted }}>
                    Coordinator: {activeProg?.coordinator || 'Dr. A. K. Sharma'}
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: ink, marginBottom: '6px' }}>
                Feedback for Programme Coordinator <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                rows={4}
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="Describe which assignments need to be revised and why…"
                style={{
                  width: '100%', fontSize: '13px', lineHeight: '1.5',
                  border: '1.5px solid #e2e8f0', borderRadius: '9px',
                  padding: '10px 13px', outline: 'none',
                  fontFamily: 'inherit', resize: 'vertical',
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#fca5a5'; }}
                onBlur={(e)  => { e.target.style.borderColor = '#e2e8f0'; }}
              />
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '5px' }}>
                This feedback will be visible to the Programme Coordinator for revision.
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  style={{
                    height: '38px', padding: '0 18px', fontSize: '13px',
                    fontWeight: '700', background: '#f1f5f9',
                    color: '#475569', border: 'none', borderRadius: '9px',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  style={{
                    height: '38px', padding: '0 20px', fontSize: '13px',
                    fontWeight: '800', background: '#dc2626',
                    color: '#ffffff', border: 'none', borderRadius: '9px',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    opacity: rejectRemarks.trim() ? 1 : 0.55,
                  }}
                >
                  <RefreshCw size={13} /> Confirm Revision Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
