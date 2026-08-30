import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Target, CheckCircle2,
  ArrowRight, ArrowLeft, Check, Plus, X,
  ChevronDown, AlertCircle, Save, Clock, Layers, Send, Lock, ClipboardList, Upload, Download, Loader2,
} from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import ProgrammeATR from '../atr/ProgrammeATR';
import { useAttainment } from '../../context/attainment';
import { approvalsApi } from '../../api/approvals';

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

const semesterNumber = (value) => {
  const romanValues = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12 };
  const semester = String(value ?? '').replace(/^Sem\s*/i, '').trim();
  return Number(semester) || romanValues[semester] || null;
};

const targetSignature = (pos, psos, poTargets, psoTargets) => JSON.stringify({
  pos: pos.map((po) => ({ code: po.code, target: Number(poTargets[po.code] ?? po.target ?? 2) })),
  psos: psos.map((pso) => ({ code: pso.code, target: Number(psoTargets[pso.code] ?? pso.target ?? 2) })),
});

const STEPS = [
  { number: 1, key: 'courses', title: 'Add Courses',        desc: 'Add & allocate courses under programme',      path: '/programme-coordinator/courses',         icon: BookOpen,     color: '#4f46e5', bg: '#eef2ff' },
  { number: 2, key: 'po_pso_target', title: 'Set PO/PSO Targets', desc: 'Configure PO & PSO target levels (1.0 – 3.0)', path: '/programme-coordinator/target-settings', icon: Target,       color: '#7c3aed', bg: '#f5f3ff' },
  { number: 3, key: 'indirect_attainment', title: 'Indirect Attainment', desc: 'Upload programme end survey', path: '/programme-coordinator/indirect-attainment', icon: ClipboardList, color: '#059669', bg: '#f0fdf4' },
  { number: 4, key: 'programme_atr', title: 'Programme ATR',     desc: 'Fill & submit Programme Action Taken Report', path: '/programme-coordinator/programme-atr',   icon: Layers,       color: '#0284c7', bg: '#f0f9ff' },
  { number: 5, key: 'review', title: 'Review and Confirm', desc: 'Verify setup summary & finish',               path: '/programme-coordinator/reports',         icon: CheckCircle2, color: '#059669', bg: '#f0fdf4' },
];

export default function ProgrammeCoordinatorSetupWorkflow({
  standaloneTargetSettings = false,
  standaloneCourseManagement = false,
  approvalViewStep = null,
  approvalReadOnly = false,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, role } = useAuth();
  const { uploadProgrammeExitSurvey = () => Promise.resolve(null), programmeSurveyData = null } = useAttainment();
  const {
    masterProgrammes = [],
    programmeId,
    batches = [],
    programmeCoordinatorDashboard = null,
    batchId,
    setBatchId,
    selectedBatch = null,
    activePOs  = [],
    activePSOs = [],
    courses    = [],
    courseOfferings = [],
    courseCoordinators = [],
    loadProgrammeBatchOutcomes = () => Promise.resolve({ pos: [], psos: [], peos: [] }),
    saveProgrammeBatchOutcomeDefinitions = () => Promise.resolve(null),
    loadMasterCourses = () => Promise.resolve([]),
    loadCourseOfferings = () => Promise.resolve([]),
    addProgrammeBatchCourse = () => Promise.resolve(null),
    updateProgrammeBatchCourse = () => Promise.resolve(null),
    courseVerificationStore = {},
    programmeCoordinatorApprovals = [],
    loadProgrammeCoordinatorApprovals = () => Promise.resolve([]),
    updateCourseVerificationStatus = () => {},
    setupProgress = null,
    loadSetupProgress = () => Promise.resolve(null),
    saveSetupProgress = () => Promise.resolve(null),
    completeProgrammeCoordinatorSetupProgress = () => Promise.resolve(null),
    loadCoordinatorProgrammeBatches = () => Promise.resolve([]),
    loadCourseCoordinators = () => Promise.resolve([]),
  } = useAcademic();
  const loadedBatchScopeRef = useRef(null);
  const loadedCourseCoordinatorsRef = useRef(false);

  // Context data is initially empty while the selected programme is restored.
  // Defaults in destructuring do not cover an explicit null value, so normalize
  // each record store before indexing it.
  const safeCourseVerificationStore = courseVerificationStore ?? {};
  const loadedProgressScopeRef = useRef(null);

  // Refresh the available batches for the programme selected in the sidebar.
  // The selected batch is restored from session storage and retained whenever
  // it is still part of this returned coordinator-scoped list.
  useEffect(() => {
    if (role !== 'PROGRAMME_COORDINATOR' || !programmeId || !user?.email) return;
    const requestScope = `${programmeId}:${user.email}`;
    if (loadedBatchScopeRef.current === requestScope) return;
    loadedBatchScopeRef.current = requestScope;

    let isCurrent = true;
    loadCoordinatorProgrammeBatches(user.email, programmeId).then((loadedBatches) => {
      if (!isCurrent) return;
      const hasSelectedBatch = loadedBatches.some((batch) => String(batch.id) === String(batchId));
      if (!hasSelectedBatch) {
        const initialBatch = loadedBatches.find((batch) => batch.status === 'ACTIVE') || loadedBatches[0];
        setBatchId(initialBatch?.id ?? null);
      }
    }).catch(() => {});

    return () => { isCurrent = false; };
  }, [batchId, loadCoordinatorProgrammeBatches, programmeId, setBatchId, user?.email]);

  useEffect(() => {
    if (!programmeId) return;
    loadProgrammeCoordinatorApprovals(programmeId).catch(() => {});
  }, [loadProgrammeCoordinatorApprovals, programmeId]);

  // Setup progress is scoped by the master programme selected in the sidebar.
  useEffect(() => {
    if (!programmeId || !user?.email) return;
    const scope = `${programmeId}:${user.email}`;
    if (loadedProgressScopeRef.current === scope) return;
    loadedProgressScopeRef.current = scope;
    loadSetupProgress().catch(() => {});
  }, [loadSetupProgress, programmeId, user?.email]);

  // The server should enforce this scope. When assignment metadata is returned
  // with a batch, also keep unrelated batches out of this coordinator's UI.
  const availableBatches = batches.length > 0 ? batches : (programmeCoordinatorDashboard?.batches ?? []);
  const assignedBatches = availableBatches.filter((batch) => {
    if (programmeId && (batch.masterProgrammeId ?? batch.programmeId) !== programmeId) return false;
    const hasAssignment = batch.coordinatorId || batch.coordinatorEmail;
    if (!hasAssignment) return true;
    return String(batch.coordinatorId ?? '') === String(user?.id ?? '')
      || String(batch.coordinatorEmail ?? '').toLowerCase() === String(user?.email ?? '').toLowerCase();
  });

  const [isSavingStep, setIsSavingStep] = useState(false);
  const [programmeSurveyUploading, setProgrammeSurveyUploading] = useState(false);
  const [programmeSurveyResult, setProgrammeSurveyResult] = useState(null);
  const [programmeSurveyError, setProgrammeSurveyError] = useState(null);

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) ||
    masterProgrammes[0] ||
    { id: 'prog-1', name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP', durationYears: 4 };

  const allocationKey = `allocation-${programmeId}-${batchId}`;
  const allocationRecord = safeCourseVerificationStore[allocationKey] || {};
  const approvalForBatch = (type) => programmeCoordinatorApprovals
    .filter((approval) => approval.type === type && String(approval.programmeBatchId) === String(batchId))
    .sort((left, right) => new Date(right.submittedAt ?? right.approvedAt ?? 0) - new Date(left.submittedAt ?? left.approvedAt ?? 0))[0] ?? null;
  const allocationApproval = approvalForBatch('COURSE_ALLOCATION');
  const allocationStatus = allocationApproval?.status ?? allocationRecord.allocationStatus ?? 'DRAFT';
  const allocationRemarks = allocationApproval?.remarks ?? allocationRecord.allocationRemarks ?? '';
  const allocationApprovedBy = allocationApproval?.approvedBy ?? 'Head of Department (HOD)';

  const isAllocationApproved = allocationStatus === 'APPROVED' || allocationStatus === 'VERIFIED';
  const isAllocationSubmitted = ['PENDING', 'SUBMITTED', 'PENDING_APPROVAL', 'SUBMITTED_FOR_VERIFICATION'].includes(allocationStatus);
  const isAllocationRevision = allocationStatus === 'REVISION_REQUESTED' || allocationStatus === 'NEEDS_REVISION';

  const handleSubmitAllocations = async () => {
    if (!programmeId || !batchId) {
      alert('Select a Master Programme and Programme Batch before submitting allocations.');
      return;
    }
    try {
      await approvalsApi.submitApproval({
        type: 'COURSE_ALLOCATION',
        title: `Course Allocations for ${selectedBatch?.name || batchId}`,
        masterProgrammeId: programmeId,
        programmeBatchId: batchId,
        resourceId: batchId,
      });
      updateCourseVerificationStatus(allocationKey, 'allocationStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
      alert(`Course Coordinator allocations for ${selectedProgramme?.name} submitted for HOD approval!`);
    } catch (error) {
      console.error('Failed to submit course allocations for review:', error);
      alert(error?.response?.data?.message || 'Unable to submit allocations for HOD review. Please try again.');
    }
  };

  const targetsKey = `targets-${programmeId}-${batchId}`;
  const targetsRecord = safeCourseVerificationStore[targetsKey] || safeCourseVerificationStore[allocationKey] || {};
  const targetsApproval = approvalForBatch('PO_PSO_TARGETS') ?? approvalForBatch('PO_TARGETS');
  const targetsStatus = targetsApproval?.status ?? targetsRecord.poPsoTargetsStatus ?? targetsRecord.targetsStatus ?? 'DRAFT';
  const targetsRemarks = targetsApproval?.remarks ?? targetsRecord.poPsoTargetsRemarks ?? targetsRecord.targetsRemarks ?? '';
  const targetsApprovedBy = targetsApproval?.approvedBy ?? 'Head of Department (HOD)';

  const isTargetsApproved = targetsStatus === 'APPROVED' || targetsStatus === 'VERIFIED';
  const isTargetsSubmitted = ['PENDING', 'SUBMITTED', 'PENDING_APPROVAL', 'SUBMITTED_FOR_VERIFICATION'].includes(targetsStatus);
  const isTargetsRevision = targetsStatus === 'REVISION_REQUESTED' || targetsStatus === 'NEEDS_REVISION';

  const handleSubmitTargets = async () => {
    if (!programmeId || !batchId) {
      alert('Select a Master Programme and Programme Batch before submitting targets.');
      return;
    }
    try {
      await handleSaveTargets();
      await approvalsApi.submitApproval({
        type: 'PO_PSO_TARGETS',
        title: `PO / PSO Targets for ${selectedBatch?.name || batchId}`,
        masterProgrammeId: programmeId,
        programmeBatchId: batchId,
        resourceId: batchId,
      });
      updateCourseVerificationStatus(targetsKey, 'poPsoTargetsStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
      updateCourseVerificationStatus(allocationKey, 'poPsoTargetsStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
      alert(`PO & PSO target benchmarks for ${selectedProgramme?.name} submitted for HOD approval!`);
    } catch (error) {
      console.error('Failed to submit PO/PSO targets for review:', error);
      alert(error?.response?.data?.message || 'Unable to submit PO/PSO targets for HOD review. Please try again.');
    }
  };

  const durationYears = selectedProgramme?.durationYears || 4;
  const totalSemesters = durationYears * 2;
  const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const programmeSemesters = Array.from({ length: totalSemesters }, (_, i) => `Sem ${ROMAN_NUMERALS[i] || i + 1}`);

  // ── Per-step completion flags ──────────────────────────────────────────────
  const progProgress = setupProgress ?? {};
  const stepDone = STEPS.map((s, idx) => {
    const stepStatus = progProgress?.stepStatus ?? progProgress?.stepStatuses;
    if (Array.isArray(stepStatus)) {
      return !!stepStatus[idx];
    }
    if (Array.isArray(progProgress?.completedSteps)) {
      return progProgress.completedSteps.some((step) => (
        String(step) === s.key || Number(step) === s.number
      ));
    }
    // Older responses expose only the current step. All preceding steps have
    // necessarily completed and should still receive their green check.
    const reportedCurrentStep = Number(progProgress?.currentStep);
    if (Number.isFinite(reportedCurrentStep) && reportedCurrentStep > 0) {
      return s.number < reportedCurrentStep;
    }
    return !!progProgress?.[s.number] || !!progProgress?.[s.path];
  });
  const completedCount = stepDone.filter(Boolean).length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);

  const firstIncompleteIdx = stepDone.findIndex((done) => !done);
  const firstIncompleteStep = firstIncompleteIdx !== -1 ? firstIncompleteIdx + 1 : 1;

  const rawStepParam = searchParams.get('step');
  const parsedStep = parseInt(rawStepParam, 10);
  const hasValidParam = parsedStep >= 1 && parsedStep <= STEPS.length;

  const [currentStep, setCurrentStep] = useState(
    approvalViewStep ?? (standaloneCourseManagement ? 1 : (standaloneTargetSettings ? 2 : (hasValidParam ? parsedStep : firstIncompleteStep)))
  );

  const isStandaloneView = standaloneTargetSettings || standaloneCourseManagement || Boolean(approvalViewStep);

  useEffect(() => {
    if (approvalViewStep) {
      if (currentStep !== approvalViewStep) setCurrentStep(approvalViewStep);
      return;
    }
    if (standaloneCourseManagement) {
      if (currentStep !== 1) setCurrentStep(1);
      return;
    }
    if (standaloneTargetSettings) {
      if (currentStep !== 2) setCurrentStep(2);
      return;
    }

    const s = parseInt(searchParams.get('step'), 10);
    if (!s || isNaN(s) || s < 1 || s > STEPS.length) {
      setSearchParams({ step: firstIncompleteStep }, { replace: true });
      setCurrentStep(firstIncompleteStep);
    } else if (s !== currentStep) {
      setCurrentStep(s);
    }
  }, [approvalViewStep, currentStep, firstIncompleteStep, searchParams, setSearchParams, standaloneCourseManagement, standaloneTargetSettings]);

  const goToStep = (n) => {
    setCurrentStep(n);
    setSearchParams({ step: n });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Step 1 – Add Courses / Programme Setup ─────────────────────────────────
  const [selectedMasterCourseId, setSelectedMasterCourseId] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSem,   setNewCourseSem]   = useState(programmeSemesters[0] || 'Sem I');
  const [newCourseCoord, setNewCourseCoord] = useState('');
  const masterCourses = courses.filter((course) => course.programmeId === programmeId);
  const programmeBatchCourses = courseOfferings.filter(
    (offering) => String(offering.batchId) === String(batchId)
  );
  // The API is requested with role=COURSE_COORDINATOR. Some valid responses
  // identify those users as FACULTY, so retain both documented role values.
  const coordinatorOptions = courseCoordinators.filter((person) =>
    person.isActive !== false
      && ['COURSE_COORDINATOR', 'FACULTY'].includes(String(person.role ?? '').toUpperCase())
  );

  // The selector is populated from the HOD-created master-course catalogue
  // for the master programme selected in the Programme Coordinator sidebar.
  useEffect(() => {
    if (currentStep !== 1 || !programmeId) return;

    if (!loadedCourseCoordinatorsRef.current) {
      loadedCourseCoordinatorsRef.current = true;
      loadCourseCoordinators().then((coordinators) => {
        setNewCourseCoord((current) =>
          coordinators.some((person) => String(person.id) === String(current))
            ? current
            : String(coordinators[0]?.id ?? '')
        );
      }).catch(() => {});
    }
    loadMasterCourses({ masterProgrammeId: programmeId }).catch(() => {});
    if (batchId) loadCourseOfferings(batchId).catch(() => {});
  }, [batchId, currentStep, loadCourseCoordinators, loadCourseOfferings, loadMasterCourses, programmeId]);

  // ── Step 2 – PO/PSO Targets ──────────────────────────────────────────────
  const [poTargetDraft, setPoTargetDraft] = useState({});
  const [psoTargetDraft, setPsoTargetDraft] = useState({});
  const [isSavingTargets, setIsSavingTargets] = useState(false);
  const [savedTargetSignature, setSavedTargetSignature] = useState(null);

  const normPSOs = activePSOs.map((p) => ({ ...p, competencies: p.competencies ?? [] }));
  const currentTargetSignature = targetSignature(activePOs, activePSOs, poTargetDraft, psoTargetDraft);
  const targetsAreSaved = savedTargetSignature !== null && savedTargetSignature === currentTargetSignature;

  // Targets are defined per programme batch. Reload the exact selected batch
  // whenever the selector changes so no values bleed in from another batch.
  useEffect(() => {
    if (currentStep !== 2 || !programmeId || !batchId) return;
    let isCurrent = true;
    setSavedTargetSignature(null);

    loadProgrammeBatchOutcomes(programmeId, batchId)
      .then(({ pos = [], psos = [] } = {}) => {
        if (!isCurrent) return;
        const nextPoTargets = Object.fromEntries(pos.map((po) => [po.code, Number(po.target) || 2]));
        const nextPsoTargets = Object.fromEntries(psos.map((pso) => [pso.code, Number(pso.target) || 2]));
        setPoTargetDraft(nextPoTargets);
        setPsoTargetDraft(nextPsoTargets);
        setSavedTargetSignature(targetSignature(pos, psos, nextPoTargets, nextPsoTargets));
      })
      .catch(() => {});

    return () => { isCurrent = false; };
  }, [batchId, currentStep, loadProgrammeBatchOutcomes, programmeId]);

  // ── Step handlers ────────────────────────────────────────────────────────
  const handleAddCourse = async (e) => {
    e.preventDefault();
    const semester = semesterNumber(newCourseSem);
    const masterCourse = masterCourses.find(
      (course) => String(course.id) === String(selectedMasterCourseId)
    );
    const coordinator = coordinatorOptions.find(
      (person) => String(person.id) === String(newCourseCoord)
    );
    if (!masterCourse || !programmeId || !batchId || !semester) {
      alert('Select a master course and semester before adding the batch course.');
      return;
    }

    try {
      await addProgrammeBatchCourse({
        masterCourseId: masterCourse.id,
        programmeBatchId: batchId,
        semester,
        courseCoordinatorEmail: coordinator?.email ?? null,
        assignedFaculty: coordinator?.email ?? null,
      });
      setSelectedMasterCourseId('');
      setNewCourseCode('');
      setNewCourseName('');
    } catch (error) {
      console.error('Failed to add programme-batch course:', error);
      alert('Unable to create the programme-batch course. Please try again.');
    }
  };

  const handleCoordinatorChange = async (offering, coordinatorId) => {
    const coordinator = coordinatorOptions.find(
      (person) => String(person.id) === String(coordinatorId)
    );
    if (!coordinator) return;

    try {
      await updateProgrammeBatchCourse(offering.programmeBatchCourseId ?? offering.id, {
        masterCourseId: offering.masterCourseId ?? offering.courseId,
        programmeBatchId: offering.programmeBatchId ?? batchId,
        semester: semesterNumber(offering.semester) ?? semesterNumber(newCourseSem),
        courseCoordinatorEmail: coordinator.email,
        assignedFaculty: coordinator.email,
      });
    } catch (error) {
      console.error('Failed to assign Course Coordinator:', error);
      alert('Unable to update the Course Coordinator. Please try again.');
    }
  };

  const handleSaveTargets = async () => {
    if (!programmeId || !batchId) {
      throw new Error('Select an assigned programme batch before saving targets.');
    }
    if (isSavingTargets) return false;

    setIsSavingTargets(true);
    try {
      const response = await saveProgrammeBatchOutcomeDefinitions(programmeId, batchId, {
        pos: activePOs.map((po) => ({ ...po, target: Number(poTargetDraft[po.code] ?? po.target ?? 2) })),
        psos: activePSOs.map((pso) => ({ ...pso, target: Number(psoTargetDraft[pso.code] ?? pso.target ?? 2) })),
      });
      if (response == null) throw new Error('No save response was received.');
      setSavedTargetSignature(currentTargetSignature);
      return true;
    } finally {
      // Re-enable only after the API request has either succeeded or failed.
      setIsSavingTargets(false);
    }
  };

  const handleProgrammeSurveyUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProgrammeSurveyUploading(true);
    setProgrammeSurveyError(null);
    try {
      const result = await uploadProgrammeExitSurvey({
        targetBatchId: batchId,
        file,
      });
      setProgrammeSurveyResult(result);
    } catch (error) {
      console.error('Failed to upload programme end survey:', error);
      setProgrammeSurveyError(error?.customMessage || error?.message || 'Failed to upload the programme end survey.');
    } finally {
      setProgrammeSurveyUploading(false);
      event.target.value = '';
    }
  };

  const handleSaveAndNext = async () => {
    try {
      setIsSavingStep(true);
      if (currentStep === 2) {
        await handleSaveTargets();
      }
      await saveSetupProgress(Math.min(currentStep + 1, STEPS.length), currentStep);
      if (currentStep < STEPS.length) goToStep(currentStep + 1);
    } catch (error) {
      console.error('Failed to save Programme Coordinator setup progress:', error);
      alert('Unable to save setup progress. Please verify the selected programme and batch, then try again.');
    } finally {
      setIsSavingStep(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    await completeProgrammeCoordinatorSetupProgress();
    navigate('/programme-coordinator/dashboard');
  };

  const currentStepMeta = STEPS[currentStep - 1] || STEPS[0];

  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      {!approvalViewStep && <div style={{
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
                currentStep === 4 ? (safeCourseVerificationStore[`prog-atr-${programmeId}`]?.programmeAtrStatus || safeCourseVerificationStore[allocationKey]?.programmeAtrStatus || 'DRAFT') :
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

        {/* A coordinator is assigned to a programme batch, so this is one
            combined context selector rather than separate programme/batch inputs. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={batchId ?? ''}
              onChange={(e) => setBatchId(e.target.value || null)}
              disabled={!programmeId || assignedBatches.length === 0}
              style={{
                height: '38px',
                fontSize: '13px',
                fontWeight: '700',
                color: accent,
                border: '1.5px solid #c7d2fe',
                borderRadius: '8px',
                padding: '0 32px 0 12px',
                background: '#f5f3ff',
                minWidth: '280px',
                outline: 'none',
                appearance: 'none',
                cursor: !programmeId || assignedBatches.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <option value="">{assignedBatches.length === 0 ? 'No assigned programme batches' : 'Select assigned programme batch'}</option>
              {assignedBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>{selectedProgramme.code} · {batch.name}</option>
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
      </div>}

      {/* ── HOD REVISION ALERT BANNER ────────────────────────────────────────── */}
      {allocationStatus === 'REVISION_REQUESTED' && (
        <RequestRevisionCard
          title="HOD Revision Requested"
          requestedBy={allocationApprovedBy}
          remarks={allocationRemarks || 'Please review and re-assign Course Coordinators as per HOD notes.'}
          actionText="Please update the Course Coordinator allocations below and resubmit for HOD approval."
        />
      )}

      {/* ── STEP STEPPER (icon circles) ───────────────────────────────────────── */}
      {!isStandaloneView && <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px' }}>
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
      </div>}

      {/* ── STEP CONTENT ──────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '24px', marginBottom: '20px', pointerEvents: approvalReadOnly ? 'none' : 'auto' }}>
        <ErrorBoundary
          fallbackTitle={`Step ${currentStep} Error (${STEPS[currentStep - 1]?.title || 'Setup Step'})`}
          fallbackMessage={`An error occurred while loading this setup step. You can retry or switch to another step.`}
        >

        {/* ── STEP 1: PROGRAMME SETUP (ADD COURSES) ──────────────────────── */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>
                  {standaloneCourseManagement ? 'Manage Courses' : 'Programme Setup — Course & Coordinator Roster'}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>
                  Create programme-batch courses from the HOD master-course catalogue and assign their Course Coordinators.
                </p>
              </div>
              {!isAllocationApproved && !approvalReadOnly ? (
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
                requestedBy={allocationApprovedBy}
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
                    ✓ ALL COURSE &amp; COORDINATOR ALLOCATIONS VERIFIED &amp; APPROVED BY {allocationApprovedBy}
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
            {!isAllocationApproved && !approvalReadOnly && (
              <form onSubmit={handleAddCourse} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '3px' }}>Add Programme-Batch Course</div>
                <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: muted }}>
                  Select a master course and optionally provide a batch-specific display code or name.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 1.15fr) 105px minmax(170px, 1fr) 110px 190px auto', gap: '10px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={labelStyle}>Master Course *</label>
                    <select
                      required
                      value={selectedMasterCourseId}
                      onChange={(e) => setSelectedMasterCourseId(e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer', fontWeight: '600' }}
                    >
                      <option value="">Select master course</option>
                      {masterCourses.map((course) => (
                        <option key={course.id} value={course.id}>{course.code} — {course.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Batch Code</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      style={{ ...inputStyle, fontWeight: '700', color: accent }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Batch Course Name</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      style={inputStyle}
                    />
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
                      <option value="">Select FACULTY</option>
                      {coordinatorOptions.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                      ))}
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
                    <th style={{ width: '190px' }}>Master Course</th>
                    <th style={{ width: '100px' }}>Batch Code</th>
                    <th>Batch Course Name</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Semester</th>
                    <th style={{ width: '230px' }}>Course Coordinator</th>
                    <th style={{ width: '115px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {programmeBatchCourses.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: muted, fontSize: '12.5px' }}>No programme-batch courses yet — add one above.</td></tr>
                  )}
                  {programmeBatchCourses.map((offering) => {
                    const masterCourse = masterCourses.find(
                      (course) => String(course.id) === String(offering.masterCourseId ?? offering.courseId)
                    );
                    const assignedCoordinator = coordinatorOptions.find(
                      (faculty) => String(faculty.id) === String(offering.courseCoordinatorId)
                        || faculty.email === offering.courseCoordinatorEmail
                        || faculty.name === offering.courseCoordinatorName
                    );
                    const coordinatorId = assignedCoordinator?.id ?? offering.courseCoordinatorId ?? '';
                    return (
                      <tr key={offering.id}>
                        <td>
                          <div style={{ fontWeight: '700', color: accent, fontSize: '12px' }}>{masterCourse?.code ?? '—'}</div>
                          <div style={{ color: muted, fontSize: '11.5px', marginTop: '2px' }}>{masterCourse?.name ?? 'Master course unavailable'}</div>
                        </td>
                        <td style={{ fontWeight: '700', color: accent }}>{offering.courseCodeOverride ?? offering.courseCode ?? masterCourse?.code ?? '—'}</td>
                        <td style={{ fontWeight: '600', color: ink }}>{offering.courseNameOverride ?? offering.courseName ?? masterCourse?.name ?? '—'}</td>
                        <td style={{ textAlign: 'center', color: muted, fontSize: '12px' }}>{offering.semester ? `Sem ${offering.semester}` : '—'}</td>
                        <td>
                          <select
                            value={coordinatorId}
                            disabled={isAllocationApproved}
                            onChange={(e) => handleCoordinatorChange(offering, e.target.value)}
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
                            <option value="">Select FACULTY</option>
                            {coordinatorOptions.map((faculty) => (
                              <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isAllocationApproved ? (
                            <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle2 size={12} /> Locked
                            </span>
                          ) : (
                            <span style={{ fontSize: '11.5px', color: isAllocationSubmitted ? '#b45309' : muted, fontWeight: '700' }}>
                              {isAllocationSubmitted ? 'Pending HOD' : 'Draft'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {programmeBatchCourses.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginTop: '16px' }}>
                <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>{programmeBatchCourses.length} programme-batch course(s) added — click Next to set PO &amp; PSO targets.</span>
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
                {!isTargetsApproved && !approvalReadOnly ? (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await handleSaveTargets();
                        } catch (error) {
                          console.error('Failed to save programme-batch targets:', error);
                          alert('Unable to save targets. Please try again.');
                        }
                      }}
                      disabled={isSavingTargets || targetsAreSaved}
                      style={{
                        height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700',
                        background: '#ffffff', color: '#2563eb', border: '1px solid #2563eb',
                        borderRadius: '8px', cursor: isSavingTargets ? 'wait' : targetsAreSaved ? 'not-allowed' : 'pointer',
                        opacity: isSavingTargets || targetsAreSaved ? 0.5 : 1,
                        display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
                      }}
                    >
                      {targetsAreSaved ? <Check size={14} /> : <Save size={14} />}
                      {isSavingTargets ? 'Saving…' : targetsAreSaved ? 'Saved' : 'Save Targets'}
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
                requestedBy={targetsApprovedBy}
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
                    ✓ ALL PO &amp; PSO TARGET LEVELS VERIFIED &amp; APPROVED BY {targetsApprovedBy}
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

        {/* ── STEP 3: PROGRAMME-BATCH INDIRECT ATTAINMENT ────────────────── */}
        {currentStep === 3 && (() => {
          const surveyResult = programmeSurveyResult ?? programmeSurveyData;
          const poScores = surveyResult?.poIndirectAttainment ?? {};
          const psoScores = surveyResult?.psoIndirectAttainment ?? {};
          const resultRows = [
            ...Object.entries(poScores).map(([code, score]) => ({ code, type: 'PO', score })),
            ...Object.entries(psoScores).map(([code, score]) => ({ code, type: 'PSO', score })),
          ];
          return (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Indirect Programme Attainment</h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>Upload the programme end survey for <strong>{selectedProgramme.code} · {selectedBatch?.name ?? 'selected batch'}</strong>.</p>
              </div>
              <a href="/ProgrammeEnd-Survey.xlsx" download="ProgrammeEnd-Survey.xlsx" style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#ffffff', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <Download size={14} /> Download Template
              </a>
            </div>

            {programmeSurveyError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '13px' }}><AlertCircle size={18} />{programmeSurveyError}</div>}
            {surveyResult && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '13px' }}><CheckCircle2 size={18} />Programme end survey processed successfully.</div>}

            <div style={{ ...surface, padding: '24px', textAlign: 'center', background: '#ffffff', marginBottom: '18px' }}>
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '28px', background: '#f8fafc', maxWidth: '720px', margin: '0 auto' }}>
                {programmeSurveyUploading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}><Loader2 size={36} className="animate-spin" style={{ color: accent }} /><strong style={{ color: ink }}>Uploading and calculating programme attainment...</strong></div>
                ) : <>
                  <Upload size={36} style={{ color: accent, marginBottom: '8px' }} />
                  <strong style={{ display: 'block', fontSize: '15px', color: ink }}>Upload Programme End Survey Excel File (.xlsx, .xls)</strong>
                  <p style={{ margin: '4px 0 14px', fontSize: '12px', color: muted }}>Excel survey ratings mapped to the programme batch PO and PSO outcomes.</p>
                  <input type="file" accept=".xlsx,.xls" id="programme-survey-file-input" style={{ display: 'none' }} onChange={handleProgrammeSurveyUpload} disabled={programmeSurveyUploading || !programmeId || !batchId} />
                  <label htmlFor="programme-survey-file-input" style={{ height: '38px', padding: '0 16px', background: accent, color: '#ffffff', borderRadius: '8px', fontWeight: '700', fontSize: '12.5px', cursor: programmeId && batchId ? 'pointer' : 'not-allowed', opacity: programmeId && batchId ? 1 : 0.5, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Upload size={15} /> Select Survey Excel</label>
                </>}
              </div>
            </div>

            <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}><h4 style={{ margin: 0, fontSize: '14px', color: ink }}>Indirect Programme Attainment Summary</h4></div>
              <table className="audit-data-table"><thead><tr><th>Outcome</th><th>Type</th><th style={{ textAlign: 'center' }}>Indirect Attainment (0–3)</th></tr></thead><tbody>
                {resultRows.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No survey data uploaded yet. Upload the programme end survey to calculate PO/PSO indirect attainment.</td></tr> : resultRows.map((item) => <tr key={`${item.type}-${item.code}`}><td style={{ fontWeight: '700', color: accent }}>{item.code}</td><td style={{ color: muted }}>{item.type}</td><td style={{ textAlign: 'center', fontWeight: '800', color: accent }}>{Number(item.score).toFixed(2)}</td></tr>)}
              </tbody></table>
            </div>
          </div>
          );
        })()}

        {/* ── STEP 4: PROGRAMME ATR ───────────────────────────────────────── */}
        {currentStep === 4 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Programme Action Taken Report (ATR)</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>
                Fill and review the PO/PSO Action Taken Report for <strong>{selectedProgramme.name}</strong> ({selectedProgramme.code}) before final review.
              </p>
            </div>
            <div style={{ padding: '4px 0' }}>
              <ProgrammeATR
                programmeId={programmeId}
                batchId={batchId}
                hideFooter={true}
                hideHeader={approvalReadOnly}
                showBatchSelector={false}
                readOnly={approvalReadOnly}
              />
            </div>
          </div>
        )}

        {/* ── STEP 5: REVIEW & CONFIRM ────────────────────────────────────── */}
        {currentStep === 5 && (
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
                { label: 'Courses Added', value: `${programmeBatchCourses.length} courses`, color: accent },
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

        </ErrorBoundary>
      </div>{/* end step content */}

      {/* ── FOOTER NAV ────────────────────────────────────────────────────── */}
      {!isStandaloneView && <div style={{
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
              disabled={isSavingStep}
              style={{
                height: '40px', padding: '0 22px', fontSize: '13.5px', fontWeight: '800',
                background: `linear-gradient(135deg, ${accent} 0%, #6366f1 100%)`,
                color: '#fff', border: 'none', borderRadius: '8px', cursor: isSavingStep ? 'wait' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(79,70,229,0.28)',
              }}
            >
              {isSavingStep ? 'Saving…' : 'Save & Continue'} <ArrowRight size={14} />
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
      </div>}

    </div>
  );
}
