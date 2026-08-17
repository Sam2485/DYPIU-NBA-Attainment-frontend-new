import { useState } from 'react';
import { Plus, Trash2, Check, Search, ChevronDown, BookOpen, Layers, Send, Lock, CheckCircle2, Clock } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';

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
const labelStyle = {
  display: 'block', fontSize: '11.5px', fontWeight: '600',
  color: muted, marginBottom: '5px',
};

const SEMESTERS = ['Sem III', 'Sem IV', 'Sem V', 'Sem VI', 'Sem VII', 'Sem VIII'];

export default function AcademicSetup() {
  const { user } = useAuth();
  const {
    masterProgrammes = [],
    programmeId,
    setProgrammeId,
    activePOs  = [],
    activePSOs = [],
    activePEOs = [],
    courses    = [],
    assignCourseCoordinator = () => {},
    addCourse    = () => {},
    deleteCourse = () => {},
    courseVerificationStore = {},
    updateCourseVerificationStatus = () => {},
  } = useAcademic();

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) ||
    masterProgrammes[0] ||
    { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  const allocationKey = `allocation-${programmeId}`;
  const allocationRecord = courseVerificationStore[allocationKey] || {};
  const allocationStatus = allocationRecord.allocationStatus || 'NO_SUBMISSION';
  const allocationRemarks = allocationRecord.allocationRemarks || '';
  const verifierName = allocationRecord.verifiedBy || 'Head of Department (HOD)';

  const isAllocationApproved = allocationStatus === 'APPROVED' || allocationStatus === 'VERIFIED';
  const isAllocationRevision = allocationStatus === 'REVISION_REQUESTED' || allocationStatus === 'REJECTED' || allocationStatus === 'NEEDS_REVISION';
  const isAllocationSubmitted = allocationStatus === 'SUBMITTED' || allocationStatus === 'PENDING_APPROVAL';

  const handleSubmitAllocations = () => {
    updateCourseVerificationStatus(allocationKey, 'allocationStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
    alert(`Course Coordinator allocations for ${selectedProgramme?.name} submitted for HOD approval!`);
  };

  const [activeTab,   setActiveTab]   = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeTab,  setOutcomeTab]  = useState('PO');

  // ── Add-course form ───────────────────────────────────────────────────────
  const [newCode,  setNewCode]  = useState('');
  const [newName,  setNewName]  = useState('');
  const [newSem,   setNewSem]   = useState('Sem V');
  const [newCoord, setNewCoord] = useState(MASTER_FACULTY_LIST[0] || '');

  const progCourses = courses.filter((c) => !c.programmeId || c.programmeId === programmeId);
  const normPSOs    = activePSOs.map((p) => ({ ...p, competencies: p.competencies ?? [] }));

  const filtered = progCourses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.coordinator || c.faculty || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCode || !newName) return;
    addCourse({
      id: `crs-${Date.now()}`,
      programmeId,
      code: newCode, name: newName, semester: newSem,
      coordinator: newCoord, faculty: newCoord,
    });
    setNewCode(''); setNewName('');
  };

  const tabs = [
    { id: 'courses',   label: `Courses & Coordinator (${progCourses.length})`, icon: BookOpen },
    { id: 'outcomes',  label: 'View PO / PSO / PEO',                           icon: Layers   },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Programme Coordinator &nbsp;·&nbsp; Programme Setup
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Programme Setup
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            Manage courses, assign coordinators, and view outcomes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              style={{ height: '38px', paddingLeft: '12px', paddingRight: '32px', fontSize: '12.5px', fontWeight: '600', border: '1.5px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', color: accent, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none', maxWidth: '300px' }}
            >
              {masterProgrammes.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>

          {activeTab === 'courses' && (
            !isAllocationApproved ? (
              <button
                type="button"
                onClick={handleSubmitAllocations}
                style={{
                  height: '38px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700',
                  background: accent, color: '#ffffff', border: 'none',
                  borderRadius: '8px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit'
                }}
              >
                <Send size={14} /> Submit Allocations for HOD Review
              </button>
            ) : (
              <span style={{ height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={13} /> Course &amp; Coordinator Locked
              </span>
            )
          )}
        </div>
      </div>

      {/* ── TAB STRIP ─────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '9px' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)}
              style={{ padding: '7px 18px', borderRadius: '7px', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', background: activeTab === id ? '#ffffff' : 'transparent', color: activeTab === id ? accent : muted, boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
        {activeTab === 'courses' && (
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '34px', fontSize: '12.5px' }} />
          </div>
        )}
      </div>

      {/* ── TAB 1: COURSES & COORDINATOR ──────────────────────────────────── */}
      {activeTab === 'courses' && (
        <div>
          {/* ── HOD APPROVAL / REVISION / SUBMISSION STATUS BANNERS ─────────────── */}
          {isAllocationRevision && (
            <RequestRevisionCard
              title={`Course & Coordinator Allocation Revision Requested (${selectedProgramme?.code || 'Programme'})`}
              requestedBy={verifierName}
              remarks={allocationRemarks || 'Please review and adjust course allocations as per HOD notes.'}
              actionText="Please update course list or coordinator assignments below and resubmit for HOD approval."
            />
          )}

          {isAllocationApproved && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', padding: '14px 18px', marginBottom: '18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '13.5px', color: '#15803d', fontWeight: '800', display: 'block' }}>
                  ✓ ALL COURSE &amp; COORDINATOR ALLOCATIONS VERIFIED &amp; APPROVED BY {verifierName.toUpperCase()}
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#166534' }}>
                  Course list and coordinator assignments for {selectedProgramme.name} are verified and locked.
                </p>
              </div>
            </div>
          )}

          {isAllocationSubmitted && !isAllocationApproved && (
            <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', padding: '14px 18px', marginBottom: '18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '13.5px', color: '#92400e', fontWeight: '800', display: 'block' }}>
                  Submitted — Pending HOD Verification
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b45309' }}>
                  Course Coordinator allocations for {selectedProgramme.name} have been submitted and are awaiting {verifierName} review.
                </p>
              </div>
            </div>
          )}

          {/* Inline add form */}
          {!isAllocationApproved && (
            <form onSubmit={handleAddCourse} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '10px' }}>Add Course</div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 130px 220px auto', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={labelStyle}>Code *</label>
                  <input type="text" required placeholder="CS305" value={newCode} onChange={(e) => setNewCode(e.target.value)} style={{ ...inputStyle, fontWeight: '700', color: accent }} />
                </div>
                <div>
                  <label style={labelStyle}>Course Name *</label>
                  <input type="text" required placeholder="e.g. Compiler Design" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Semester</label>
                  <select value={newSem} onChange={(e) => setNewSem(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Course Coordinator</label>
                  <select value={newCoord} onChange={(e) => setNewCoord(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', color: accent, fontWeight: '600' }}>
                    {MASTER_FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <button type="submit" style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </form>
          )}

          {/* Single combined table */}
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Code</th>
                  <th>Course Name</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Semester</th>
                  <th style={{ width: '250px' }}>Course Coordinator</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: muted, fontSize: '12.5px' }}>
                    No courses yet — add one above.
                  </td></tr>
                )}
                {filtered.map((c) => {
                  const coord = c.coordinator || (c.faculty || '').split('/')[0].trim();
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '700', color: accent }}>{c.code}</td>
                      <td style={{ fontWeight: '600', color: ink }}>{c.name}</td>
                      <td style={{ textAlign: 'center', color: muted, fontSize: '12px' }}>{c.semester}</td>
                      <td>
                        <select
                          disabled={isAllocationApproved}
                          value={coord}
                          onChange={(e) => assignCourseCoordinator(c.id, e.target.value)}
                          style={{
                            ...inputStyle,
                            height: '34px',
                            fontSize: '12px',
                            cursor: isAllocationApproved ? 'not-allowed' : 'pointer',
                            color: accent,
                            fontWeight: '600',
                            background: isAllocationApproved ? '#f8fafc' : '#ffffff',
                          }}
                        >
                          {MASTER_FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                          <Check size={11} /> Active
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {!isAllocationApproved ? (
                          <button onClick={() => deleteCourse(c.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                            <Trash2 size={13} />
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: VIEW PO / PSO / PEO (READ-ONLY) ───────────────────────── */}
      {activeTab === 'outcomes' && (
        <div>
          {/* Outcome type sub-tabs */}
          <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '9px', width: 'fit-content', marginBottom: '18px' }}>
            {[
              ['PO',  `POs (${activePOs.length})`],
              ['PSO', `PSOs (${normPSOs.length})`],
              ['PEO', `PEOs (${activePEOs.length})`],
            ].map(([tab, label]) => (
              <button key={tab} type="button" onClick={() => setOutcomeTab(tab)}
                style={{ padding: '7px 18px', borderRadius: '7px', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', background: outcomeTab === tab ? '#ffffff' : 'transparent', color: outcomeTab === tab ? accent : muted, boxShadow: outcomeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Read-only notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
            <span style={{ fontSize: '11.5px', color: muted, fontWeight: '600' }}>
              📖 Read-only view. POs, PSOs and PEOs are managed by the HOD.
            </span>
          </div>

          {/* PO list */}
          {outcomeTab === 'PO' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {activePOs.length === 0 && (
                <div style={{ ...surface, padding: '32px', textAlign: 'center', color: muted, fontSize: '12.5px' }}>
                  No Programme Outcomes defined yet. Ask your HOD to add them.
                </div>
              )}
              {activePOs.map((po, idx) => (
                <div key={idx} style={{ ...surface, padding: '14px 18px', borderLeft: '3px solid #4f46e5' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: accent, width: '48px', flexShrink: 0, paddingTop: '1px' }}>{po.code}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: ink, lineHeight: 1.5 }}>{po.statement}</div>
                      {(po.competencies || []).length > 0 && (
                        <div style={{ marginTop: '8px', display: 'grid', gap: '4px' }}>
                          {(po.competencies || []).map((comp, ci) => (
                            <div key={ci} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#818cf8', flexShrink: 0, paddingTop: '1px' }}>{po.code}.{ci + 1}</span>
                              <span style={{ fontSize: '12px', color: muted }}>{comp.statement}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PSO list */}
          {outcomeTab === 'PSO' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {normPSOs.length === 0 && (
                <div style={{ ...surface, padding: '32px', textAlign: 'center', color: muted, fontSize: '12.5px' }}>
                  No Programme Specific Outcomes defined yet. Ask your HOD to add them.
                </div>
              )}
              {normPSOs.map((pso, idx) => (
                <div key={idx} style={{ ...surface, padding: '14px 18px', borderLeft: '3px solid #059669' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#059669', width: '48px', flexShrink: 0, paddingTop: '1px' }}>{pso.code}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: ink, lineHeight: 1.5 }}>{pso.statement}</div>
                      {pso.competencies.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'grid', gap: '4px' }}>
                          {pso.competencies.map((comp, ci) => (
                            <div key={ci} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6ee7b7', flexShrink: 0, paddingTop: '1px' }}>{pso.code}.{ci + 1}</span>
                              <span style={{ fontSize: '12px', color: muted }}>{comp.statement}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PEO list */}
          {outcomeTab === 'PEO' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {activePEOs.length === 0 && (
                <div style={{ ...surface, padding: '32px', textAlign: 'center', color: muted, fontSize: '12.5px' }}>
                  No Programme Educational Objectives defined yet. Ask your HOD to add them.
                </div>
              )}
              {activePEOs.map((peo, idx) => (
                <div key={idx} style={{ ...surface, padding: '14px 18px', borderLeft: '3px solid #0284c7', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0284c7', width: '48px', flexShrink: 0 }}>{peo.code}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: ink, lineHeight: 1.5 }}>{peo.statement}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
