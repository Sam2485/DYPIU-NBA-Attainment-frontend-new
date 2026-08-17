import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Target, CheckCircle2,
  ArrowRight, ArrowLeft, Check, Plus, Trash2, X as CloseIcon,
  ChevronDown, AlertCircle, Save, Clock, Loader2,
} from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import {
  getProgrammes,
  getCourses,
  saveCourse,
  deleteCourse as deleteCourseApi,
  getUsersByRole,
  getProgrammePOs,
  getProgrammePSOs,
  getProgrammeTargets,
  saveProgrammeTargets,
  updateProgrammeCoordinatorSetupProgress,
  completeProgrammeCoordinatorSetup,
} from '../../api/academic';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';

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
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export default function ProgrammeCoordinatorSetupWorkflow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    poPsoTargets       = {},
    updatePoPsoTargets = () => {},
    courseVerificationStore = {},
  } = useAcademic();

  // All state hooks declared upfront
  const [programmesList, setProgrammesList] = useState([]);
  const [selectedProgId, setSelectedProgId] = useState('');
  const [coursesList, setCoursesList] = useState([]);
  const [coordinatorsList, setCoordinatorsList] = useState([]);

  const [activePOsList, setActivePOsList] = useState([]);
  const [activePSOsList, setActivePSOsList] = useState([]);

  const [isLoadingProgrammes, setIsLoadingProgrammes] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  const [deletingCourse, setDeletingCourse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [newCourseCode,  setNewCourseCode]  = useState('');
  const [newCourseName,  setNewCourseName]  = useState('');
  const [newCourseSem,   setNewCourseSem]   = useState('Sem I');
  const [newCourseCoord, setNewCourseCoord] = useState('');

  // Step 2 state
  const [poTargetDraft,  setPoTargetDraft]  = useState({});
  const [psoTargetDraft, setPsoTargetDraft] = useState({});
  const [isSavingTargets, setIsSavingTargets] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // 1. Load programmes & Course Coordinators on initial mount
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      setIsLoadingProgrammes(true);
      try {
        const progRes = await getProgrammes('', '', user?.email);
        const rawProgs = progRes?.data?.programmes || progRes?.programmes || progRes?.data?.data || progRes?.data || [];
        if (isMounted && Array.isArray(rawProgs) && rawProgs.length > 0) {
          const userEmail = user?.email?.toLowerCase();
          const userAssigned = rawProgs.filter(
            (p) =>
              (p.coordinatorEmail && p.coordinatorEmail.toLowerCase() === userEmail) ||
              (p.coordinator && p.coordinator.toLowerCase() === userEmail)
          );
          const finalProgs = userAssigned.length > 0 ? userAssigned : rawProgs;
          setProgrammesList(finalProgs);

          // Always pick the first programme returned if not already set
          const firstProg = finalProgs[0];
          if (firstProg?.id) {
            setSelectedProgId(firstProg.id);
          }
        }

        // Fetch Course Coordinators and Faculty members
        const [ccRes, facRes] = await Promise.allSettled([
          getUsersByRole('course-coordinator'),
          getUsersByRole('faculty'),
        ]);

        let combinedUsers = [];
        if (ccRes.status === 'fulfilled') {
          const ccList = ccRes.value?.data?.users || ccRes.value?.users || ccRes.value?.data?.data || ccRes.value?.data || [];
          if (Array.isArray(ccList)) combinedUsers.push(...ccList);
        }
        if (facRes.status === 'fulfilled') {
          const facList = facRes.value?.data?.users || facRes.value?.users || facRes.value?.data?.data || facRes.value?.data || [];
          if (Array.isArray(facList)) combinedUsers.push(...facList);
        }

        if (isMounted) {
          const uniqueCoordinators = Array.from(
            new Map(combinedUsers.map((u) => [u.email || u.id || u.name, u.name])).values()
          );
          setCoordinatorsList(uniqueCoordinators.length > 0 ? uniqueCoordinators : MASTER_FACULTY_LIST);
        }
      } catch (err) {
        console.warn('Failed to load initial data for Programme Setup Workflow:', err);
      } finally {
        if (isMounted) setIsLoadingProgrammes(false);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // 2. Load courses, POs, and PSOs whenever selected programme changes
  useEffect(() => {
    if (!selectedProgId) return;

    let isMounted = true;
    const fetchProgrammeDetails = async () => {
      setIsLoadingCourses(true);
      try {
        const [crsRes, poRes, psoRes, targetRes] = await Promise.allSettled([
          getCourses(selectedProgId),
          getProgrammePOs(selectedProgId),
          getProgrammePSOs(selectedProgId),
          getProgrammeTargets(selectedProgId),
        ]);

        if (isMounted) {
          let pos = [];
          let psos = [];
          if (crsRes.status === 'fulfilled') {
            const fetchedCourses = crsRes.value?.data?.courses || crsRes.value?.courses || crsRes.value?.data?.data || crsRes.value?.data || [];
            setCoursesList(Array.isArray(fetchedCourses) ? fetchedCourses : []);
          }

          if (poRes.status === 'fulfilled') {
            const fetchedPOs = poRes.value?.data?.pos || poRes.value?.pos || poRes.value?.data?.data || poRes.value?.data || [];
            pos = Array.isArray(fetchedPOs) ? fetchedPOs : [];
            setActivePOsList(pos);
          }

          if (psoRes.status === 'fulfilled') {
            const fetchedPSOs = psoRes.value?.data?.psos || psoRes.value?.psos || psoRes.value?.data?.data || psoRes.value?.data || [];
            psos = Array.isArray(fetchedPSOs) ? fetchedPSOs : [];
            setActivePSOsList(psos);
          }

          let fetchedPoTargets = {};
          let fetchedPsoTargets = {};
          if (targetRes.status === 'fulfilled') {
            const rawTarget = targetRes.value?.data || targetRes.value || {};
            const targetList = Array.isArray(rawTarget) ? rawTarget : (Array.isArray(rawTarget?.targets) ? rawTarget.targets : []);
            if (targetList.length > 0) {
              targetList.forEach((t) => {
                if (t.outcomeCode?.startsWith('PO')) fetchedPoTargets[t.outcomeCode] = t.targetValue;
                if (t.outcomeCode?.startsWith('PSO')) fetchedPsoTargets[t.outcomeCode] = t.targetValue;
              });
            } else {
              fetchedPoTargets = rawTarget.poTargets || {};
              fetchedPsoTargets = rawTarget.psoTargets || {};
            }
          }

          const seedContextTargets = poPsoTargets[selectedProgId] || {};
          const seedContextPOs = seedContextTargets.poTargets || {};
          const seedContextPSOs = seedContextTargets.psoTargets || {};

          const poDraft = {};
          pos.forEach((po) => {
            poDraft[po.code] = fetchedPoTargets[po.code] ?? seedContextPOs[po.code] ?? 2.0;
          });

          const psoDraft = {};
          psos.forEach((pso) => {
            psoDraft[pso.code] = fetchedPsoTargets[pso.code] ?? seedContextPSOs[pso.code] ?? 2.0;
          });

          setPoTargetDraft(poDraft);
          setPsoTargetDraft(psoDraft);
        }
      } catch (err) {
        console.warn('Failed to fetch details for programme', selectedProgId, err);
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    };

    fetchProgrammeDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedProgId]);

  const selectedProgramme =
    programmesList.find((p) => p.id === selectedProgId) ||
    programmesList[0] ||
    { id: 'prog-fallback', name: 'No Programme Assigned Yet', code: '—', durationYears: 4 };

  const allocationKey = `allocation-${selectedProgId}`;
  const allocationRecord = courseVerificationStore[allocationKey] || {};
  const allocationStatus = allocationRecord.allocationStatus || 'PENDING';
  const allocationRemarks = allocationRecord.allocationRemarks || '';

  const durationYears = selectedProgramme?.durationYears || 4;
  const totalSemesters = durationYears * 2;
  const programmeSemesters = Array.from({ length: totalSemesters }, (_, i) => `Sem ${ROMAN_NUMERALS[i] || i + 1}`);

  useEffect(() => {
    if (coordinatorsList.length > 0 && !newCourseCoord) {
      setNewCourseCoord(coordinatorsList[0]);
    }
  }, [coordinatorsList, newCourseCoord]);

  // ── Step handlers ────────────────────────────────────────────────────────
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim()) return;

    setIsSavingCourse(true);
    try {
      const coursePayload = {
        code: newCourseCode.toUpperCase().trim(),
        name: newCourseName.trim(),
        programmeId: selectedProgId,
        semester: newCourseSem,
        coordinator: newCourseCoord || coordinatorsList[0] || 'Unassigned',
        faculty: newCourseCoord || coordinatorsList[0] || 'Unassigned',
      };

      const res = await saveCourse(coursePayload);
      const savedCourse = res?.data?.data || res?.data || coursePayload;
      setCoursesList((prev) => [...prev, savedCourse]);

      setNewCourseCode('');
      setNewCourseName('');
    } catch (err) {
      console.error('Failed to add course:', err);
      alert('Failed to save course to backend server. Please try again.');
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleAssignCourseCoordinator = async (courseObj, newCoord) => {
    try {
      const updatedObj = {
        ...courseObj,
        coordinator: newCoord,
        faculty: newCoord,
      };
      const res = await saveCourse(updatedObj);
      const savedCourse = res?.data?.data || res?.data || updatedObj;
      setCoursesList((prev) => prev.map((c) => (c.id === courseObj.id ? savedCourse : c)));
    } catch (err) {
      console.error('Failed to update course coordinator:', err);
      alert('Failed to update course coordinator in backend.');
    }
  };

  const handleOpenDelete = (c) => {
    setDeletingCourse(c);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingCourse) {
      try {
        await deleteCourseApi(deletingCourse.id);
        setCoursesList((prev) => prev.filter((c) => c.id !== deletingCourse.id));
      } catch (err) {
        console.error('Failed to delete course:', err);
        alert('Failed to delete course from backend.');
      } finally {
        setShowDeleteModal(false);
        setDeletingCourse(null);
      }
    }
  };

  const handleSaveTargets = async () => {
    if (!selectedProgId) return;
    setIsSavingTargets(true);
    try {
      updatePoPsoTargets(selectedProgId, poTargetDraft, psoTargetDraft);
      await saveProgrammeTargets(selectedProgId, {
        programmeId: selectedProgId,
        poTargets: poTargetDraft,
        psoTargets: psoTargetDraft,
      });
      await updateProgrammeCoordinatorSetupProgress(user?.email, selectedProgId, 2);
      setToastMessage('🎉 PO & PSO Target Levels saved successfully to backend database!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.warn('Failed to save targets or update setup progress step 2:', err);
      alert('Failed to save target levels to database.');
    } finally {
      setIsSavingTargets(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      try {
        await updateProgrammeCoordinatorSetupProgress(user?.email, selectedProgId, 2);
      } catch (err) {
        console.warn('Failed to update setup progress step 1:', err);
      }
    } else if (currentStep === 2) {
      await handleSaveTargets();
    }
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = async () => {
    if (selectedProgId) {
      localStorage.setItem(`pc_setup_completed_${selectedProgId}`, 'true');
    }
    if (user?.email) {
      localStorage.setItem(`pc_setup_completed_${user.email}`, 'true');
    }
    try {
      await completeProgrammeCoordinatorSetup(user?.email, selectedProgId);
    } catch (err) {
      console.warn('Failed to complete setup progress:', err);
    }
    navigate('/programme-coordinator/dashboard');
  };

  // ── Step definitions ─────────────────────────────────────────────────────
  const isCoursesDone = coursesList.length > 0;
  const isTargetsDone = Boolean(poPsoTargets[selectedProgId] || (poTargetDraft && Object.keys(poTargetDraft).length > 0));
  const isLocalStoragePcDone = Boolean(localStorage.getItem(`pc_setup_completed_${selectedProgId}`)) ||
                               Boolean(localStorage.getItem(`pc_setup_completed_${user?.email}`));
  const isReviewDone = isLocalStoragePcDone || currentStep === 3 || (isCoursesDone && isTargetsDone);

  const steps = [
    { number: 1, title: 'Course Roster & Coordinators', desc: isCoursesDone ? `${coursesList.length} courses added` : 'Add courses to programme', icon: BookOpen, isDone: isCoursesDone },
    { number: 2, title: 'PO / PSO Target Setting', desc: isTargetsDone ? 'Targets configured' : 'Configure attainment targets', icon: Target, isDone: isTargetsDone },
    { number: 3, title: 'Review & Submit for HOD Verification', desc: isReviewDone ? 'Ready to submit' : 'Verify & submit to HOD', icon: CheckCircle2, isDone: isReviewDone },
  ];

  const completedCount = steps.filter((s) => s.isDone).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

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
          <p style={{ margin: '3px 0 6px', fontSize: '12.5px', color: muted }}>
            {selectedProgramme ? `${selectedProgramme.name} (${selectedProgramme.code})` : 'No Programme Assigned Yet'}
          </p>

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
              value={selectedProgId}
              onChange={(e) => setSelectedProgId(e.target.value)}
              disabled={isLoadingProgrammes || programmesList.length === 0}
              style={{ height: '38px', paddingLeft: '12px', paddingRight: '32px', fontSize: '12.5px', fontWeight: '600', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', color: ink, cursor: programmesList.length === 0 ? 'not-allowed' : 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none', maxWidth: '280px' }}
            >
              {programmesList.length === 0 ? (
                <option value="">No programmes assigned yet</option>
              ) : (
                programmesList.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)
              )}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>
          <button
            onClick={() => navigate('/programme-coordinator/dashboard')}
            style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
          >
            <CloseIcon size={14} /> Exit
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1.5px solid #6ee7b7',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#059669' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HOD REVISION ALERT BANNER ────────────────────────────────────────── */}
      {allocationStatus === 'REVISION_REQUESTED' && (
        <RequestRevisionCard
          title="HOD Revision Requested"
          requestedBy="Head of Department (HOD)"
          remarks={allocationRemarks || 'Please review and re-assign Course Coordinators as per HOD notes.'}
          actionText="Please update the Course Coordinator allocations below and resubmit for HOD approval."
        />
      )}

      {/* ── STEPPER ───────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '18px', left: '16.6%', right: '16.6%', height: '1px', background: '#e2e8f0', zIndex: 0 }} />
          {steps.map((s) => {
            const done   = s.isDone;
            const active = currentStep === s.number;
            const Icon   = s.icon;
            return (
              <div
                key={s.number}
                onClick={() => setCurrentStep(s.number)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative', zIndex: 1, opacity: (active || done) ? 1 : 0.5, transition: 'all .2s' }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: done ? '#dcfce7' : active ? '#eef2ff' : '#f8fafc',
                  border: `1.5px solid ${done ? '#16a34a' : active ? '#a5b4fc' : '#e2e8f0'}`,
                  color: done ? '#16a34a' : active ? accent : muted,
                  display: 'grid', placeItems: 'center', marginBottom: '8px',
                  transition: 'all .2s ease',
                }}>
                  {done ? <Check size={16} strokeWidth={2.5} /> : <Icon size={15} />}
                </div>
                <div style={{ fontSize: '12px', fontWeight: active || done ? '700' : '600', color: done ? '#16a34a' : active ? ink : muted, textAlign: 'center' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '10.5px', color: done ? '#16a34a' : '#94a3b8', textAlign: 'center', marginTop: '1px' }}>
                  {s.desc}
                </div>
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
                    {coordinatorsList.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={isSavingCourse} style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: isSavingCourse ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', opacity: isSavingCourse ? 0.7 : 1 }}>
                  {isSavingCourse ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} {isSavingCourse ? 'Saving...' : 'Add Course'}
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
                  {isLoadingCourses ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: muted, fontSize: '12.5px' }}>Loading courses from backend...</td></tr>
                  ) : coursesList.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: muted, fontSize: '12.5px' }}>No courses yet — add one above.</td></tr>
                  ) : (
                    coursesList.map((c) => {
                      const coord = c.coordinator || (c.faculty || '').split('/')[0].trim() || (coordinatorsList[0] || 'Unassigned');
                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: '700', color: accent }}>{c.code}</td>
                          <td style={{ fontWeight: '600', color: ink }}>{c.name}</td>
                          <td style={{ textAlign: 'center', color: muted, fontSize: '12px' }}>{c.semester || 'Sem I'}</td>
                          <td>
                            <select
                              value={coord}
                              onChange={(e) => handleAssignCourseCoordinator(c, e.target.value)}
                              style={{ ...inputStyle, height: '34px', fontSize: '12px', cursor: 'pointer', color: accent, fontWeight: '600' }}
                            >
                              {coordinatorsList.map((f) => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => handleOpenDelete(c)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }} title="Delete Course">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {coursesList.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginTop: '16px' }}>
                <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>{coursesList.length} course(s) configured — click Next to set PO &amp; PSO targets.</span>
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
                disabled={isSavingTargets}
                style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: isSavingTargets ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', opacity: isSavingTargets ? 0.7 : 1 }}
              >
                {isSavingTargets ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                {isSavingTargets ? 'Saving...' : 'Save Targets'}
              </button>
            </div>

            {/* PO Targets */}
            {activePOsList.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Programme Outcomes — Target Levels ({activePOsList.length} POs)
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
                      {activePOsList.map((po) => (
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
            {activePSOsList.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Programme Specific Outcomes — Target Levels ({activePSOsList.length} PSOs)
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
                      {activePSOsList.map((pso) => (
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

            {activePOsList.length === 0 && activePSOsList.length === 0 && (
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
                { label: 'Courses Added', value: `${coursesList.length} courses`,   color: accent    },
                { label: 'POs Targeted',  value: `${activePOsList.length} POs`,        color: accent    },
                { label: 'PSOs Targeted', value: `${activePSOsList.length} PSOs`,        color: '#059669' },
              ].map((item) => (
                <div key={item.label} style={{ ...surface, padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Target summary tables */}
            {activePOsList.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>PO Target Summary</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activePOsList.map((po) => (
                    <div key={po.code} style={{ ...surface, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: accent }}>{po.code}</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>{(poTargetDraft[po.code] ?? 2.0).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePSOsList.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>PSO Target Summary</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activePSOsList.map((pso) => (
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
