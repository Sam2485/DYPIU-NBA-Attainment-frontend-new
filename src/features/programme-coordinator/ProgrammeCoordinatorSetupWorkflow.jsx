import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Target, CheckCircle2,
  ArrowRight, ArrowLeft, Check, Plus, Trash2, X,
  ChevronDown, AlertCircle, Save, Clock, Layers, Send, Lock,
} from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';
import ProgrammeATR from '../atr/ProgrammeATR';

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

const STEPS = [
  { number: 1, title: 'Add Courses',        desc: 'Add & allocate courses under programme',      path: '/programme-coordinator/courses',         icon: BookOpen,     color: '#4f46e5', bg: '#eef2ff' },
  { number: 2, title: 'Set PO/PSO Targets', desc: 'Configure PO & PSO target levels (1.0 – 3.0)', path: '/programme-coordinator/target-settings', icon: Target,       color: '#7c3aed', bg: '#f5f3ff' },
  { number: 3, title: 'Programme ATR',     desc: 'Fill & submit Programme Action Taken Report', path: '/programme-coordinator/programme-atr',   icon: Layers,       color: '#0284c7', bg: '#f0f9ff' },
  { number: 4, title: 'Review and Confirm', desc: 'Verify setup summary & finish',               path: '/programme-coordinator/reports',         icon: CheckCircle2, color: '#059669', bg: '#f0fdf4' },
];

export default function ProgrammeCoordinatorSetupWorkflow() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
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
    updateCourseVerificationStatus = () => {},
    pcWorkflowProgressStore = {},
    markPcWorkflowStepComplete = () => {},
    facultyList = [],
  } = useAcademic();

  const activeFaculties = facultyList.length > 0 ? facultyList : ['Course Coordinator', 'Programme Coordinator', 'Head of Department (HOD)', 'School Director'];

  const [deletingCourse, setDeletingCourse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleOpenDelete = (c) => {
    setDeletingCourse(c);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCourse) {
      deleteCourse(deletingCourse.id);
      setShowDeleteModal(false);
      setDeletingCourse(null);
    }
  };

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) ||
    masterProgrammes[0] ||
    { id: 'prog-1', name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP', durationYears: 4 };

  const allocationKey = `allocation-${programmeId}`;
  const allocationRecord = courseVerificationStore[allocationKey] || {};
  const allocationStatus = allocationRecord.allocationStatus || 'DRAFT';
  const allocationRemarks = allocationRecord.allocationRemarks || '';

  const isAllocationApproved = allocationStatus === 'APPROVED' || allocationStatus === 'VERIFIED';
  const isAllocationSubmitted = allocationStatus === 'SUBMITTED' || allocationStatus === 'PENDING_APPROVAL';
  const isAllocationRevision = allocationStatus === 'REVISION_REQUESTED' || allocationStatus === 'NEEDS_REVISION';

  const handleSubmitAllocations = () => {
    updateCourseVerificationStatus(allocationKey, 'allocationStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
    alert(`Course Coordinator allocations for ${selectedProgramme?.name} submitted for HOD approval!`);
  };

  const targetsKey = `targets-${programmeId}`;
  const targetsRecord = courseVerificationStore[targetsKey] || courseVerificationStore[allocationKey] || {};
  const targetsStatus = targetsRecord.poPsoTargetsStatus || targetsRecord.targetsStatus || 'DRAFT';
  const targetsRemarks = targetsRecord.poPsoTargetsRemarks || targetsRecord.targetsRemarks || '';

  const isTargetsApproved = targetsStatus === 'APPROVED' || targetsStatus === 'VERIFIED';
  const isTargetsSubmitted = targetsStatus === 'SUBMITTED' || targetsStatus === 'PENDING_APPROVAL';
  const isTargetsRevision = targetsStatus === 'REVISION_REQUESTED' || targetsStatus === 'NEEDS_REVISION';

  const handleSubmitTargets = () => {
    updatePoPsoTargets(programmeId, poTargetDraft, psoTargetDraft);
    updateCourseVerificationStatus(targetsKey, 'poPsoTargetsStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
    updateCourseVerificationStatus(allocationKey, 'poPsoTargetsStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
    alert(`PO & PSO target benchmarks for ${selectedProgramme?.name} submitted for HOD approval!`);
  };

  const durationYears = selectedProgramme?.durationYears || 4;
  const totalSemesters = durationYears * 2;
  const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const programmeSemesters = Array.from({ length: totalSemesters }, (_, i) => `Sem ${ROMAN_NUMERALS[i] || i + 1}`);

  // ── Per-step completion flags ──────────────────────────────────────────────
  const progProgress = pcWorkflowProgressStore[selectedProgramme.id || 'prog-1'] || {};
  const stepDone = STEPS.map((s) => !!progProgress[s.number]);
  const completedCount = stepDone.filter(Boolean).length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);

  const firstIncompleteIdx = stepDone.findIndex((done) => !done);
  const firstIncompleteStep = firstIncompleteIdx !== -1 ? firstIncompleteIdx + 1 : 1;

  const rawStepParam = searchParams.get('step');
  const parsedStep = parseInt(rawStepParam, 10);
  const hasValidParam = parsedStep >= 1 && parsedStep <= STEPS.length;

  const [currentStep, setCurrentStep] = useState(
    hasValidParam ? parsedStep : firstIncompleteStep
  );

  useEffect(() => {
    const s = parseInt(searchParams.get('step'), 10);
    if (!s || isNaN(s) || s < 1 || s > STEPS.length) {
      setSearchParams({ step: firstIncompleteStep }, { replace: true });
      setCurrentStep(firstIncompleteStep);
    } else if (s !== currentStep) {
      setCurrentStep(s);
    }
  }, [searchParams, firstIncompleteStep]);

  const goToStep = (n) => {
    setCurrentStep(n);
    setSearchParams({ step: n });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Step 1 – Add Courses / Programme Setup ─────────────────────────────────
  const [newCourseCode,  setNewCourseCode]  = useState('');
  const [newCourseName,  setNewCourseName]  = useState('');
  const [newCourseSem,   setNewCourseSem]   = useState(programmeSemesters[0] || 'Sem I');
  const [newCourseCoord, setNewCourseCoord] = useState(activeFaculties[0] || 'Course Coordinator');
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

  const handleSaveAndNext = () => {
    if (currentStep === 2) {
      handleSaveTargets();
    }
    markPcWorkflowStepComplete(selectedProgramme.id, currentStep);
    if (currentStep < STEPS.length) {
      goToStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    markPcWorkflowStepComplete(selectedProgramme.id, STEPS.length);
    navigate('/programme-coordinator/dashboard');
  };

  const currentStepMeta = STEPS[currentStep - 1] || STEPS[0];

  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div style={{
        ...surface,
        padding: '20px 24px',
        marginBottom: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '16px',
        borderRadius: '12px 12px 0 0',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
              {currentStepMeta.title}
            </h2>
            {/* HOD Verification Status Badge */}
            {(() => {
              const currentStatus =
                currentStep === 1 ? allocationStatus :
                currentStep === 2 ? targetsStatus :
                currentStep === 3 ? (courseVerificationStore[`prog-atr-${programmeId}`]?.programmeAtrStatus || courseVerificationStore[allocationKey]?.programmeAtrStatus || 'DRAFT') :
                'DRAFT';

              const isApp = currentStatus === 'APPROVED' || currentStatus === 'VERIFIED';
              const isRev = currentStatus === 'REVISION_REQUESTED' || currentStatus === 'NEEDS_REVISION';
              const isSub = currentStatus === 'SUBMITTED' || currentStatus === 'PENDING_APPROVAL';

              if (isApp) {
                return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                    <CheckCircle2 size={12} /> HOD: Verified &amp; Approved
                  </span>
                );
              }
              if (isRev) {
                return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                    <AlertCircle size={12} /> HOD: Revision Requested
                  </span>
                );
              }
              if (isSub) {
                return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                    <Clock size={12} /> HOD: Pending Review
                  </span>
                );
              }
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                  Draft
                </span>
              );
            })()}
          </div>
        </div>

        {/* Programme selector & exit button on extreme right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={programmeId}
              onChange={(e) => {
                const nextProgId = e.target.value;
                setProgrammeId(nextProgId);
                const nextProgState = pcWorkflowProgressStore[nextProgId] || {};
                const nextIncompleteIdx = STEPS.findIndex((s) => !nextProgState[s.number]);
                const nextStepNum = nextIncompleteIdx !== -1 ? nextIncompleteIdx + 1 : 1;
                goToStep(nextStepNum);
              }}
              style={{
                height: '38px',
                fontSize: '13px',
                fontWeight: '700',
                color: accent,
                border: '1.5px solid #c7d2fe',
                borderRadius: '8px',
                padding: '0 32px 0 12px',
                background: '#f5f3ff',
                minWidth: '240px',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {masterProgrammes.map((p) => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: accent, pointerEvents: 'none' }} />
          </div>
          <button
            onClick={() => navigate('/programme-coordinator/dashboard')}
            style={{
              height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '600',
              background: '#f8fafc', color: ink, border: '1px solid #e2e8f0',
              borderRadius: '8px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
              flexShrink: 0,
            }}
          >
            <X size={14} /> Exit
          </button>
        </div>
      </div>

      {/* ── HOD REVISION ALERT BANNER ────────────────────────────────────────── */}
      {allocationStatus === 'REVISION_REQUESTED' && (
        <RequestRevisionCard
          title="HOD Revision Requested"
          requestedBy="Head of Department (HOD)"
          remarks={allocationRemarks || 'Please review and re-assign Course Coordinators as per HOD notes.'}
          actionText="Please update the Course Coordinator allocations below and resubmit for HOD approval."
        />
      )}

      {/* ── STEP STEPPER (icon circles) ───────────────────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          {/* connector line */}
          <div style={{
            position: 'absolute', top: '18px',
            left: `${100 / (STEPS.length * 2)}%`,
            right: `${100 / (STEPS.length * 2)}%`,
            height: '1px', background: '#e2e8f0', zIndex: 0,
          }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
            gap: '8px', position: 'relative', zIndex: 1,
          }}>
            {STEPS.map((s) => {
              const done   = stepDone[s.number - 1];
              const active = currentStep === s.number;
              const Icon   = s.icon;
              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => goToStep(s.number)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                    opacity: active || done ? 1 : 0.55, transition: 'opacity .2s',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: done ? '#f0fdf4' : active ? s.bg : '#f8fafc',
                    border: `2px solid ${done ? '#86efac' : active ? s.color : '#e2e8f0'}`,
                    color: done ? '#16a34a' : active ? s.color : muted,
                    display: 'grid', placeItems: 'center', transition: 'all .2s',
                    boxShadow: active ? `0 4px 12px ${s.color}33` : 'none',
                  }}>
                    {done ? <Check size={14} style={{ color: '#16a34a' }} /> : <Icon size={14} />}
                  </div>
                  <div style={{
                    fontSize: '11px', fontWeight: active ? '800' : done ? '700' : '600',
                    color: done ? '#16a34a' : active ? ink : muted,
                    textAlign: 'center', lineHeight: 1.3,
                  }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', marginTop: '1px' }}>
                    {s.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── STEP CONTENT ──────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '24px', marginBottom: '20px' }}>

        {/* ── STEP 1: PROGRAMME SETUP (ADD COURSES) ──────────────────────── */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Programme Setup — Course &amp; Coordinator Roster</h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>
                  Add the course roster and assign coordinators for HOD verification.
                </p>
              </div>
              {!isAllocationApproved ? (
                <button
                  type="button"
                  onClick={handleSubmitAllocations}
                  style={{
                    height: '36px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700',
                    background: accent, color: '#ffffff', border: 'none',
                    borderRadius: '8px', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit'
                  }}
                >
                  <Send size={14} /> Submit Allocations for HOD Review
                </button>
              ) : (
                <span style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={13} /> Course &amp; Coordinator Locked
                </span>
              )}
            </div>

            {/* HOD Allocation Revision Banner */}
            {isAllocationRevision && (
              <RequestRevisionCard
                title={`Course & Coordinator Allocation Revision Requested (${selectedProgramme?.code || 'Programme'})`}
                requestedBy="Head of Department (HOD)"
                remarks={allocationRemarks || 'Please review and adjust course allocations as per HOD notes.'}
                actionText="Please adjust the course list or coordinator assignments below and resubmit for HOD approval."
              />
            )}

            {/* Approved Banner */}
            {isAllocationApproved && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', padding: '14px 18px', marginBottom: '18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#15803d', fontWeight: '800' }}>
                    ✓ ALL COURSE &amp; COORDINATOR ALLOCATIONS VERIFIED &amp; APPROVED BY HOD
                  </strong>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#166534' }}>
                    Course list and coordinator assignments for {selectedProgramme.name} are verified and locked.
                  </p>
                </div>
              </div>
            )}

            {/* Submitted Banner */}
            {isAllocationSubmitted && !isAllocationApproved && !isAllocationRevision && (
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', padding: '14px 18px', marginBottom: '18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#92400e', fontWeight: '800', display: 'block' }}>
                    Submitted — Pending HOD Verification
                  </strong>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b45309' }}>
                    Course Coordinator allocations for {selectedProgramme.name} have been submitted and are awaiting HOD review.
                  </p>
                </div>
              </div>
            )}

            {/* Inline add form */}
            {!isAllocationApproved && (
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
                      {activeFaculties.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <button type="submit" style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
                    <Plus size={14} /> Add Course
                  </button>
                </div>
              </form>
            )}

            {/* Courses table */}
            <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
              <table className="audit-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Code</th>
                    <th>Course Name</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Semester</th>
                    <th style={{ width: '230px' }}>Course Coordinator</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {progCourses.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: muted, fontSize: '12.5px' }}>No courses yet — add one above.</td></tr>
                  )}
                  {progCourses.map((c) => {
                    const coord = c.coordinator || (c.faculty || '').split('/')[0].trim() || activeFaculties[0];
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: '700', color: accent }}>{c.code}</td>
                        <td style={{ fontWeight: '600', color: ink }}>{c.name}</td>
                        <td style={{ textAlign: 'center', color: muted, fontSize: '12px' }}>{c.semester || 'Sem I'}</td>
                        <td>
                          <select
                            value={coord}
                            disabled={isAllocationApproved}
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
                            {activeFaculties.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isAllocationApproved ? (
                            <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle2 size={12} /> Locked
                            </span>
                          ) : (
                            <button onClick={() => handleOpenDelete(c)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }} title="Delete Course">
                              <Trash2 size={13} />
                            </button>
                          )}
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
                  Set benchmark target levels (1.0 – 3.0 scale) for each PO and PSO.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!isTargetsApproved ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveTargets}
                      style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
                    >
                      <Save size={14} /> Save Targets
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitTargets}
                      style={{
                        height: '36px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700',
                        background: accent, color: '#ffffff', border: 'none',
                        borderRadius: '8px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit'
                      }}
                    >
                      <Send size={14} /> Submit Target for HOD Review
                    </button>
                  </>
                ) : (
                  <span style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={13} /> Targets Locked
                  </span>
                )}
              </div>
            </div>

            {/* HOD Targets Revision Banner */}
            {isTargetsRevision && (
              <RequestRevisionCard
                title="HOD Targets Revision Requested"
                requestedBy="Head of Department (HOD)"
                remarks={targetsRemarks || 'Please review and adjust PO/PSO target levels as per HOD notes.'}
                actionText="Please adjust the target levels below and resubmit for HOD approval."
              />
            )}

            {/* Approved Banner */}
            {isTargetsApproved && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', padding: '14px 18px', marginBottom: '18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#15803d', fontWeight: '800' }}>
                    ✓ ALL PO &amp; PSO TARGET LEVELS VERIFIED &amp; APPROVED BY HOD
                  </strong>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#166534' }}>
                    Benchmark target levels for {selectedProgramme.name} have been approved and are now locked.
                  </p>
                </div>
              </div>
            )}

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
                              disabled={isTargetsApproved}
                              value={poTargetDraft[po.code] ?? 2.0}
                              onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPoTargetDraft((prev) => ({ ...prev, [po.code]: v })); }}
                              onBlur={(e) => { const v = Math.min(3, Math.max(1, parseFloat(e.target.value) || 1)); setPoTargetDraft((prev) => ({ ...prev, [po.code]: Math.round(v * 10) / 10 })); }}
                              style={{ height: '36px', width: '90px', fontSize: '13.5px', fontWeight: '700', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontFamily: 'inherit', textAlign: 'center', color: accent, background: isTargetsApproved ? '#f8fafc' : '#ffffff', cursor: isTargetsApproved ? 'not-allowed' : 'text' }}
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
                              disabled={isTargetsApproved}
                              value={psoTargetDraft[pso.code] ?? 2.0}
                              onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPsoTargetDraft((prev) => ({ ...prev, [pso.code]: v })); }}
                              onBlur={(e) => { const v = Math.min(3, Math.max(1, parseFloat(e.target.value) || 1)); setPsoTargetDraft((prev) => ({ ...prev, [pso.code]: Math.round(v * 10) / 10 })); }}
                              style={{ height: '36px', width: '90px', fontSize: '13.5px', fontWeight: '700', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontFamily: 'inherit', textAlign: 'center', color: '#059669', background: isTargetsApproved ? '#f8fafc' : '#ffffff', cursor: isTargetsApproved ? 'not-allowed' : 'text' }}
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

        {/* ── STEP 3: PROGRAMME ATR ───────────────────────────────────────── */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Programme Action Taken Report (ATR)</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>
                Fill and review the PO/PSO Action Taken Report for <strong>{selectedProgramme.name}</strong> ({selectedProgramme.code}) before final review.
              </p>
            </div>
            <div style={{ padding: '4px 0' }}>
              <ProgrammeATR hideFooter={true} hideHeader={true} />
            </div>
          </div>
        )}

        {/* ── STEP 4: REVIEW & CONFIRM ────────────────────────────────────── */}
        {currentStep === 4 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Review &amp; Confirm</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>
                Verify the programme setup and ATR reports for <strong>{selectedProgramme.name}</strong> before finishing.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
              <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#15803d' }}>Programme Setup Complete</div>
                <div style={{ fontSize: '12px', color: '#166534', marginTop: '1px' }}>
                  Courses added, PO/PSO targets configured, and Programme ATR reviewed for {selectedProgramme.name}.
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
      <div style={{
        ...surface,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: '20px',
      }}>
        {/* Extreme Left: Previous */}
        <div style={{ minWidth: '160px', display: 'flex', justifyContent: 'flex-start' }}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              style={{
                height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '600',
                background: '#f8fafc', color: ink, border: '1px solid #e2e8f0',
                borderRadius: '8px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
              }}
            >
              <ArrowLeft size={14} /> Previous Step
            </button>
          )}
        </div>

        {/* Middle: Step dots & steps remaining */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {STEPS.map((s) => (
              <div
                key={s.number}
                onClick={() => goToStep(s.number)}
                style={{
                  width: currentStep === s.number ? '20px' : '6px',
                  height: '6px', borderRadius: '3px',
                  background: stepDone[s.number - 1] ? '#16a34a' : currentStep === s.number ? accent : '#e2e8f0',
                  transition: 'all .2s', cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {completedCount === STEPS.length ? (
            <span style={{
              fontSize: '11px', fontWeight: '700', background: '#f0fdf4',
              color: '#16a34a', border: '1px solid #bbf7d0',
              borderRadius: '6px', padding: '3px 10px',
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}>
              <Check size={11} /> All complete
            </span>
          ) : (
            <span style={{
              fontSize: '11.5px', fontWeight: '600', color: muted,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '6px', padding: '3px 10px',
            }}>
              {STEPS.length - completedCount} step{STEPS.length - completedCount !== 1 ? 's' : ''} remaining
            </span>
          )}
        </div>

        {/* Extreme Right: Save & Continue / Finish */}
        <div style={{ minWidth: '160px', display: 'flex', justifyContent: 'flex-end' }}>
          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleSaveAndNext}
              style={{
                height: '40px', padding: '0 22px', fontSize: '13.5px', fontWeight: '800',
                background: `linear-gradient(135deg, ${accent} 0%, #6366f1 100%)`,
                color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(79,70,229,0.28)',
              }}
            >
              Save &amp; Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              style={{
                height: '40px', padding: '0 22px', fontSize: '13.5px', fontWeight: '800',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              }}
            >
              <CheckCircle2 size={15} /> Finish Setup &amp; Go to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ──────────────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={showDeleteModal && !!deletingCourse}
        title="Delete Course?"
        itemName={deletingCourse ? `${deletingCourse.code} - ${deletingCourse.name}` : ''}
        description="This action cannot be undone. All data associated with this course will be permanently removed."
        confirmText="Delete Course"
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
