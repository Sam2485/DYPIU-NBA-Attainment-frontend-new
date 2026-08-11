import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Target, CheckCircle2,
  ArrowRight, ArrowLeft, Check, Plus, Trash2, X,
  ChevronDown, AlertCircle, Save, Clock,
} from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';

// ── Style tokens (identical to HodSetupWorkflow) ─────────────────────────────
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

const TARGET_LEVELS = [1.0, 1.5, 2.0, 2.5, 3.0];

export default function ProgrammeCoordinatorSetupWorkflow() {
  const navigate = useNavigate();
  const {
    masterProgrammes = [],
    programmeId,
    setProgrammeId,
    activePOs  = [],
    activePSOs = [],
    courses    = [],
    poPsoTargets       = {},
    updatePoPsoTargets = () => {},
    addCourse    = () => {},
    deleteCourse = () => {},
    assignCourseCoordinator = () => {},
    courseVerificationStore = {},
  } = useAcademic();

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) ||
    masterProgrammes[0] ||
    { id: 'prog-1', name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP', durationYears: 4 };

  const allocationKey = `allocation-${programmeId}`;
  const allocationRecord = courseVerificationStore[allocationKey] || {};
  const allocationStatus = allocationRecord.allocationStatus || 'PENDING';
  const allocationRemarks = allocationRecord.allocationRemarks || '';

  const durationYears = selectedProgramme?.durationYears || 4;
  const totalSemesters = durationYears * 2;
  const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const programmeSemesters = Array.from({ length: totalSemesters }, (_, i) => `Sem ${ROMAN_NUMERALS[i] || i + 1}`);

  const [currentStep, setCurrentStep] = useState(1);

  // ── Step 1 – Add Courses / Programme Setup ─────────────────────────────────
  const [newCourseCode,  setNewCourseCode]  = useState('');
  const [newCourseName,  setNewCourseName]  = useState('');
  const [newCourseSem,   setNewCourseSem]   = useState(programmeSemesters[0] || 'Sem I');
  const [newCourseCoord, setNewCourseCoord] = useState(MASTER_FACULTY_LIST[0] || '');
  const progCourses = courses.filter((c) => !c.programmeId || c.programmeId === programmeId);

  // ── Step 2 – PO/PSO Targets ──────────────────────────────────────────────
  const existingTargets = poPsoTargets[programmeId] || {};
  const [poTargetDraft,  setPoTargetDraft]  = useState(() => {
    const seed = existingTargets.poTargets || {};
    const out  = {};
    activePOs.forEach((po) => { out[po.code] = seed[po.code] ?? 2.0; });
    return out;
  });
  const [psoTargetDraft, setPsoTargetDraft] = useState(() => {
    const seed = existingTargets.psoTargets || {};
    const normPSOs = activePSOs.map((p) => ({ ...p, competencies: p.competencies ?? [] }));
    const out  = {};
    normPSOs.forEach((pso) => { out[pso.code] = seed[pso.code] ?? 2.0; });
    return out;
  });

  const normPSOs = activePSOs.map((p) => ({ ...p, competencies: p.competencies ?? [] }));

  // ── Step handlers ────────────────────────────────────────────────────────
  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim()) return;
    addCourse({
      id: `crs-${Date.now()}`,
      programmeId,
      code: newCourseCode.toUpperCase().trim(),
      name: newCourseName.trim(),
      semester: newCourseSem,
      coordinator: newCourseCoord,
      faculty: newCourseCoord,
    });
    setNewCourseCode('');
    setNewCourseName('');
  };

  const handleSaveTargets = () => {
    updatePoPsoTargets(programmeId, poTargetDraft, psoTargetDraft);
  };

  const handleNext = () => {
    if (currentStep === 2) handleSaveTargets();
    if (currentStep < 3) { setCurrentStep((s) => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  const handlePrev = () => {
    if (currentStep > 1) { setCurrentStep((s) => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  const handleFinish = () => navigate('/programme-coordinator/dashboard');

  // ── Step definitions ─────────────────────────────────────────────────────
  const steps = [
    { number: 1, title: 'Programme Setup',   desc: 'Add courses under programme', icon: BookOpen     },
    { number: 2, title: 'PO / PSO Targets',  desc: 'Set benchmark levels',         icon: Target       },
    { number: 3, title: 'Review',             desc: 'Verify & finish',              icon: CheckCircle2 },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Programme Coordinator Guided Workflow &nbsp;·&nbsp; Step {currentStep} of 3
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Programme Setup
          </h2>
          <p style={{ margin: '3px 0 6px', fontSize: '12.5px', color: muted }}>{selectedProgramme.name} ({selectedProgramme.code})</p>

          {/* HOD Verification Status Badge */}
          <div>
            {allocationStatus === 'APPROVED' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '3px 10px', fontSize: '11.5px', fontWeight: '800' }}>
                <CheckCircle2 size={13} /> HOD Verification Status: Verified &amp; Approved
              </span>
            ) : allocationStatus === 'REVISION_REQUESTED' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '3px 10px', fontSize: '11.5px', fontWeight: '800' }}>
                <AlertCircle size={13} /> HOD Verification Status: Requested Revision
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', padding: '3px 10px', fontSize: '11.5px', fontWeight: '800' }}>
                <Clock size={13} /> HOD Verification Status: Pending Review
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              style={{ height: '38px', paddingLeft: '12px', paddingRight: '32px', fontSize: '12.5px', fontWeight: '600', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', color: ink, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none', maxWidth: '280px' }}
            >
              {masterProgrammes.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>
          <button
            onClick={() => navigate('/programme-coordinator/dashboard')}
            style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
          >
            <X size={14} /> Exit
          </button>
        </div>
      </div>

      {/* ── HOD REVISION ALERT BANNER ────────────────────────────────────────── */}
      {allocationStatus === 'REVISION_REQUESTED' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: '800', fontSize: '13.5px' }}>
            <AlertCircle size={17} /> HOD Revision Requested
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#991b1b' }}>
            <strong>Remarks from HOD:</strong> {allocationRemarks || 'Please review and re-assign Course Coordinators as per HOD notes.'}
          </p>
        </div>
      )}

      {/* ── STEPPER ───────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '18px', left: '16.6%', right: '16.6%', height: '1px', background: '#e2e8f0', zIndex: 0 }} />
          {steps.map((s) => {
            const done   = currentStep > s.number;
            const active = currentStep === s.number;
            const Icon   = s.icon;
            return (
              <div
                key={s.number}
                onClick={() => setCurrentStep(s.number)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative', zIndex: 1, opacity: currentStep >= s.number ? 1 : 0.45, transition: 'opacity .2s' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: done ? '#f0fdf4' : active ? '#eef2ff' : '#f8fafc', border: `1.5px solid ${done ? '#86efac' : active ? '#a5b4fc' : '#e2e8f0'}`, color: done ? '#16a34a' : active ? accent : muted, display: 'grid', placeItems: 'center', marginBottom: '8px', transition: 'all .2s' }}>
                  {done ? <Check size={15} /> : <Icon size={15} />}
                </div>
                <div style={{ fontSize: '12px', fontWeight: active ? '700' : '600', color: active ? ink : muted, textAlign: 'center' }}>{s.title}</div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8', textAlign: 'center', marginTop: '1px' }}>{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP CONTENT ──────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '24px', marginBottom: '20px' }}>

        {/* ── STEP 1: PROGRAMME SETUP (ADD COURSES) ──────────────────────── */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Programme Setup</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>
                Add the course roster under <strong>{selectedProgramme.name}</strong> ({selectedProgramme.code}). These will be submitted for HOD verification.
              </p>
            </div>

            {/* Inline add form */}
            <form onSubmit={handleAddCourse} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '10px' }}>Add Course to Roster</div>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 120px 200px auto', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={labelStyle}>Code *</label>
                  <input type="text" required placeholder="CS305" value={newCourseCode} onChange={(e) => setNewCourseCode(e.target.value)} style={{ ...inputStyle, fontWeight: '700', color: accent }} />
                </div>
                <div>
                  <label style={labelStyle}>Course Name *</label>
                  <input type="text" required placeholder="e.g. Compiler Design" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Semester</label>
                  <select value={newCourseSem} onChange={(e) => setNewCourseSem(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {programmeSemesters.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Course Coordinator</label>
                  <select value={newCourseCoord} onChange={(e) => setNewCourseCoord(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', fontWeight: '600', color: accent }}>
                    {MASTER_FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <button type="submit" style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
                  <Plus size={14} /> Add Course
                </button>
              </div>
            </form>

            {/* Courses table */}
            <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
              <table className="audit-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Code</th>
                    <th>Course Name</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Semester</th>
                    <th style={{ width: '230px' }}>Course Coordinator</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {progCourses.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: muted, fontSize: '12.5px' }}>No courses yet — add one above.</td></tr>
                  )}
                  {progCourses.map((c) => {
                    const coord = c.coordinator || (c.faculty || '').split('/')[0].trim() || MASTER_FACULTY_LIST[0];
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: '700', color: accent }}>{c.code}</td>
                        <td style={{ fontWeight: '600', color: ink }}>{c.name}</td>
                        <td style={{ textAlign: 'center', color: muted, fontSize: '12px' }}>{c.semester || 'Sem I'}</td>
                        <td>
                          <select
                            value={coord}
                            onChange={(e) => assignCourseCoordinator(c.id, e.target.value)}
                            style={{ ...inputStyle, height: '34px', fontSize: '12px', cursor: 'pointer', color: accent, fontWeight: '600' }}
                          >
                            {MASTER_FACULTY_LIST.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => deleteCourse(c.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {progCourses.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginTop: '16px' }}>
                <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>{progCourses.length} course(s) added — click Next to set PO &amp; PSO targets.</span>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: PO / PSO TARGETS ────────────────────────────────────── */}
        {currentStep === 2 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>PO &amp; PSO Target Levels</h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>
                  Set benchmark target levels (1.0 – 3.0 scale) for each PO and PSO under <strong>{selectedProgramme.name}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveTargets}
                style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
              >
                <Save size={14} /> Save Targets
              </button>
            </div>

            {/* PO Targets */}
            {activePOs.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Programme Outcomes — Target Levels ({activePOs.length} POs)
                </div>
                <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
                  <table className="audit-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px', textAlign: 'center' }}>PO</th>
                        <th>Statement</th>
                        <th style={{ width: '160px', textAlign: 'center' }}>Target Level (1.0 – 3.0)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePOs.map((po) => (
                        <tr key={po.code}>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: accent }}>{po.code}</td>
                          <td style={{ fontSize: '12.5px', color: ink }}>{po.statement}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="number" min={1} max={3} step={0.1}
                              value={poTargetDraft[po.code] ?? 2.0}
                              onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPoTargetDraft((prev) => ({ ...prev, [po.code]: v })); }}
                              onBlur={(e) => { const v = Math.min(3, Math.max(1, parseFloat(e.target.value) || 1)); setPoTargetDraft((prev) => ({ ...prev, [po.code]: Math.round(v * 10) / 10 })); }}
                              style={{ height: '36px', width: '90px', fontSize: '13.5px', fontWeight: '700', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontFamily: 'inherit', textAlign: 'center', color: accent, background: '#ffffff' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PSO Targets */}
            {normPSOs.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Programme Specific Outcomes — Target Levels ({normPSOs.length} PSOs)
                </div>
                <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
                  <table className="audit-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px', textAlign: 'center' }}>PSO</th>
                        <th>Statement</th>
                        <th style={{ width: '160px', textAlign: 'center' }}>Target Level (1.0 – 3.0)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {normPSOs.map((pso) => (
                        <tr key={pso.code}>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: '#059669' }}>{pso.code}</td>
                          <td style={{ fontSize: '12.5px', color: ink }}>{pso.statement}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="number" min={1} max={3} step={0.1}
                              value={psoTargetDraft[pso.code] ?? 2.0}
                              onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPsoTargetDraft((prev) => ({ ...prev, [pso.code]: v })); }}
                              onBlur={(e) => { const v = Math.min(3, Math.max(1, parseFloat(e.target.value) || 1)); setPsoTargetDraft((prev) => ({ ...prev, [pso.code]: Math.round(v * 10) / 10 })); }}
                              style={{ height: '36px', width: '90px', fontSize: '13.5px', fontWeight: '700', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontFamily: 'inherit', textAlign: 'center', color: '#059669', background: '#ffffff' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activePOs.length === 0 && normPSOs.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 16px' }}>
                <AlertCircle size={16} style={{ color: '#d97706', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '600' }}>
                  No POs or PSOs defined yet. Ask your HOD to add them via Programme Outcomes.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: REVIEW ──────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Review &amp; Confirm</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>
                Verify the programme setup for <strong>{selectedProgramme.name}</strong> before finishing.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
              <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#15803d' }}>Programme Setup Complete</div>
                <div style={{ fontSize: '12px', color: '#166534', marginTop: '1px' }}>
                  Courses added and PO/PSO targets configured for {selectedProgramme.name}.
                </div>
              </div>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Programme',     value: selectedProgramme.code,           color: accent    },
                { label: 'Courses Added', value: `${progCourses.length} courses`,   color: accent    },
                { label: 'POs Targeted',  value: `${activePOs.length} POs`,        color: accent    },
                { label: 'PSOs Targeted', value: `${normPSOs.length} PSOs`,        color: '#059669' },
              ].map((item) => (
                <div key={item.label} style={{ ...surface, padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Target summary tables */}
            {activePOs.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>PO Target Summary</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activePOs.map((po) => (
                    <div key={po.code} style={{ ...surface, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: accent }}>{po.code}</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>{(poTargetDraft[po.code] ?? 2.0).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {normPSOs.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>PSO Target Summary</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {normPSOs.map((pso) => (
                    <div key={pso.code} style={{ ...surface, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>{pso.code}</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>{(psoTargetDraft[pso.code] ?? 2.0).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>{/* end step content */}

      {/* ── FOOTER NAV ────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              style={{ height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
            >
              <ArrowLeft size={14} /> Previous
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {steps.map((s) => (
              <div
                key={s.number}
                style={{ width: currentStep === s.number ? '18px' : '6px', height: '6px', borderRadius: '3px', background: currentStep >= s.number ? accent : '#e2e8f0', transition: 'all .2s', cursor: 'pointer' }}
                onClick={() => setCurrentStep(s.number)}
              />
            ))}
          </div>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              style={{ height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}
            >
              {currentStep === 2 ? 'Save & Review' : 'Next'} <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              style={{ height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}
            >
              <Check size={15} /> Finish &amp; Go to Dashboard
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
