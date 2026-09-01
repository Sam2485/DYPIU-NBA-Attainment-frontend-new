import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, UserCheck, Calendar, Layers, CheckCircle2, ArrowRight, ArrowLeft, Save, Check, Plus, Trash2, Edit3, X, AlertCircle, ChevronDown, GraduationCap } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const STEPS = [
  { number: 1, title: 'Master Courses',        desc: 'Build the programme course catalogue', path: '/hod/setup-workflow?step=1', icon: BookOpen, color: '#4f46e5', bg: '#eef2ff' },
  { number: 2, title: 'Batch Setup',          desc: 'Initialize student batch cycle',   path: '/hod/batch-management',      icon: Calendar,    color: '#0284c7', bg: '#f0f9ff' },
  { number: 3, title: 'Coordinator Allocation', desc: 'Assign a coordinator to each batch', path: '/hod/setup-workflow?step=3', icon: UserCheck, color: '#7c3aed', bg: '#f5f3ff' },
  { number: 4, title: 'PO / PSO / PEO',       desc: 'Define outcome framework',         path: '/hod/programme-outcomes',    icon: Layers,      color: '#7c3aed', bg: '#f5f3ff' },
  { number: 5, title: 'Review & Confirm',     desc: 'Verify setup summary & finish',    path: '/hod/reports',               icon: CheckCircle2,color: '#059669', bg: '#f0fdf4' },
];

const outcomeSignature = (pos = [], psos = [], peos = []) => JSON.stringify({
  pos: pos.map((item) => ({
    code: item.code ?? '', statement: item.statement ?? item.description ?? '', target: item.target ?? null,
    competencies: (item.competencies ?? []).map((competency) => ({ code: competency.code ?? '', statement: competency.statement ?? '' })),
  })),
  psos: psos.map((item) => ({
    code: item.code ?? '', statement: item.statement ?? item.description ?? '', target: item.target ?? null,
    competencies: (item.competencies ?? []).map((competency) => ({ code: competency.code ?? '', statement: competency.statement ?? '' })),
  })),
  peos: peos.map((item) => ({ code: item.code ?? '', statement: item.statement ?? item.description ?? item.name ?? '' })),
});

export default function HodSetupWorkflow({ standaloneCoordinatorAllocation = false }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    masterProgrammes = [],
    programmeId,
    setProgrammeId,
    loadMasterProgrammes = () => Promise.resolve([]),
    loadProgrammeBatches = () => Promise.resolve([]),
    courses = [],
    loadMasterCourses = () => Promise.resolve([]),
    createMasterCourse = () => Promise.resolve(null),
    deleteMasterCourse = () => Promise.resolve(),
    programmeCoordinators = [],
    loadProgrammeCoordinators = () => Promise.resolve([]),
    loadProgrammeOutcomes = () => Promise.resolve(),
    loadProgrammeBatchOutcomes = () => Promise.resolve(),
    loadHodSetupProgress = () => Promise.resolve(),
    departments = [],
    batches = [],
    batchId,
    setBatchId,
    createProgrammeBatch = () => Promise.resolve(null),
    updateProgrammeBatch = () => Promise.resolve(null),
    deleteProgrammeBatch = () => Promise.resolve(),
    updateProgrammeBatchStatus = () => Promise.resolve(null),
    assignProgrammeBatchCoordinator = () => Promise.resolve(null),
    activePOs = [],
    activePSOs = [],
    activePEOs = [],
    updateProgrammePOs = () => {},
    updateProgrammePSOs = () => {},
    updateProgrammePEOs = () => {},
    saveProgrammeOutcomeDefinitions = () => Promise.resolve(),
    saveProgrammeBatchOutcomeDefinitions = () => Promise.resolve(),
    hodWorkflowProgress = null,
    markHodWorkflowStepComplete = () => {},
    hodDashboard = null,
    selectedDepartmentId,
  } = useAcademic();

  // Prevent step/programme state updates from repeatedly re-requesting the
  // same selected department's master programmes.
  const loadedMasterProgrammeDepartmentRef = useRef(null);
  const loadedBatchScopeRef = useRef(null);

  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    onConfirm: () => {},
  });

  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseType, setNewCourseType] = useState('THEORY');
  const [batchCoordinatorSelections, setBatchCoordinatorSelections] = useState({});
  const [assignmentSaveState, setAssignmentSaveState] = useState('idle');
  const [savedAssignmentSignature, setSavedAssignmentSignature] = useState(null);

  const triggerDeleteConfirm = ({ title, itemName, description, onConfirm }) => {
    setDeleteModalConfig({
      isOpen: true,
      title,
      itemName,
      description,
      onConfirm: () => {
        onConfirm();
        setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const selectedProgramme = masterProgrammes.find((p) => p.id === programmeId) || masterProgrammes[0] || {};
  const masterCourses = courses.filter((course) => course.programmeId === selectedProgramme.id);

  const currentDept = departments.find((d) => d.id === selectedProgramme.departmentId || d.name === selectedProgramme.department)
    || hodDashboard?.department
    || departments[0];
  // Step 2: Batch State
  const [startYearInput, setStartYearInput] = useState('2025');
  const [endYearInput, setEndYearInput] = useState('2029');
  const [batchValidationError, setBatchValidationError] = useState('');
  const [newBatchCoordinatorValue, setNewBatchCoordinatorValue] = useState('');

  // Step 2: Batch Edit State
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editBatchName, setEditBatchName] = useState('');
  const [editStartYear, setEditStartYear] = useState('');
  const [editEndYear, setEditEndYear] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editCoordinatorValue, setEditCoordinatorValue] = useState('');

  const handleStartEditBatch = (b) => {
    setEditingBatchId(b.id);
    setEditBatchName(b.name);
    setEditStartYear(b.startYear || '');
    setEditEndYear(b.endYear || '');
    setEditStatus(b.status || 'ACTIVE');
    const coordinator = coordinatorOptions.find((item) =>
      (b.coordinatorId != null && String(item.id) === String(b.coordinatorId)) ||
      (b.coordinatorEmail && item.email === b.coordinatorEmail) ||
      (b.coordinatorName && (item.name === b.coordinatorName || item.username === b.coordinatorName))
    );
    setEditCoordinatorValue(coordinator ? coordinatorValue(coordinator) : '');
  };

  const handleSaveEditBatch = async (batch) => {
    const coordinator = coordinatorOptions.find(
      (item) => coordinatorValue(item) === editCoordinatorValue
    );
    const payload = {
      name: editBatchName,
      masterProgrammeId: selectedProgramme.id,
      startYear: editStartYear,
      endYear: editEndYear,
      status: editStatus,
    };
    // Use the lifecycle endpoint whenever status changes; normal details are
    // still saved through the programme-batch update endpoint.
    if (batch.status !== editStatus && batch.status === 'INACTIVE') {
      await updateProgrammeBatchStatus(batch.id, editStatus, 'Reactivating batch for update');
    }
    await updateProgrammeBatch(batch.id, { ...payload, status: batch.status === editStatus ? batch.status : 'ACTIVE' });
    if (coordinator) await assignProgrammeBatchCoordinator(batch.id, coordinator);
    if (batch.status !== editStatus) {
      await updateProgrammeBatchStatus(batch.id, editStatus, 'Updated from HOD batch setup');
    }
    setEditingBatchId(null);
  };

  const handleDeleteBatchItem = (b) => {
    triggerDeleteConfirm({
      title: 'Delete Batch?',
      itemName: b.name,
      description: 'This action cannot be undone. All data associated with this batch will be permanently removed.',
      onConfirm: () => deleteProgrammeBatch(b.id),
    });
  };

  const programmeBatches = batches.filter(
    (b) =>
      b.programmeId === programmeId ||
      b.programmeCode === selectedProgramme.code ||
      b.name.includes(selectedProgramme.code) ||
      b.programmeName === selectedProgramme.name
  );

  // Usernames are for display; email is the stable key required by the
  // programme-batch coordinator assignment endpoint.
  const coordinatorValue = (coordinator) => String(coordinator?.email || '');
  const coordinatorLabel = (coordinator) =>
    coordinator?.username || coordinator?.name || coordinator?.email || 'Unknown coordinator';
  const coordinatorOptions = programmeCoordinators.reduce((unique, coordinator) => {
    const value = coordinatorValue(coordinator);
    if (value && !unique.some((item) => coordinatorValue(item) === value)) unique.push(coordinator);
    return unique;
  }, []);
  const assignmentSignature = JSON.stringify(programmeBatches.map((batch) => [batch.id, batchCoordinatorSelections[batch.id] ?? '']));
  const assignmentsAreSaved = savedAssignmentSignature !== null && savedAssignmentSignature === assignmentSignature;

  useEffect(() => {
    setBatchCoordinatorSelections((current) => {
      const next = { ...current };
      let changed = false;
      programmeBatches.forEach((batch) => {
        const assignedCoordinator = coordinatorOptions.find(
          (coordinator) =>
            (batch.coordinatorId != null && String(coordinator.id) === String(batch.coordinatorId)) ||
            (batch.coordinatorEmail && coordinator.email === batch.coordinatorEmail) ||
            (batch.coordinatorName && (coordinator.name === batch.coordinatorName || coordinator.username === batch.coordinatorName))
        );
        const storedCoordinatorValue = next[batch.id];

        if (storedCoordinatorValue === undefined) {
          // The programme-batches API may return only a coordinator name/email
          // (with coordinatorId null). Keep that existing assignment visible.
          next[batch.id] = assignedCoordinator
            ? coordinatorValue(assignedCoordinator)
            : batch.coordinatorName || batch.coordinator || batch.coordinatorEmail
            ? `existing:${batch.coordinatorEmail || batch.coordinatorName || batch.coordinator}`
            : '';
          changed = true;
        } else if (storedCoordinatorValue.startsWith('existing:') && assignedCoordinator) {
          // The coordinator list can arrive after the batch list. Replace the
          // temporary display option with the real selector option so its name
          // is shown once, and the value remains editable/savable.
          next[batch.id] = coordinatorValue(assignedCoordinator);
          changed = true;
        }
      });
      return changed ? next : current;
    });
  }, [programmeBatches, coordinatorOptions]);

  // Step 3: Outcomes State
  const [outcomeTab, setOutcomeTab] = useState('PO');
  const [outcomesBatchId, setOutcomesBatchId] = useState('');
  const selectedOutcomesBatch = programmeBatches.find((batch) => batch.id === outcomesBatchId) || null;
  const [savedOutcomes, setSavedOutcomes] = useState({ batchId: null, signature: null });
  const [outcomesSaveState, setOutcomesSaveState] = useState('idle');

  // ── Per-step completion flags ──────────────────────────────────────────────
  const progProgress = hodWorkflowProgress || {};
  const stepDone = STEPS.map((s, idx) => {
    if (Array.isArray(progProgress?.stepStatus)) {
      return !!progProgress.stepStatus[idx];
    }
    if (Array.isArray(progProgress?.completedSteps)) {
      return progProgress.completedSteps.includes(s.number);
    }
    return !!progProgress?.[s.number] || !!progProgress?.[s.path];
  });
  const completedCount = stepDone.filter(Boolean).length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);

  const rawStepParam = searchParams.get('step');
  const parsedStep = parseInt(rawStepParam, 10);
  const hasValidParam = parsedStep >= 1 && parsedStep <= STEPS.length;

  const [currentStep, setCurrentStep] = useState(
    standaloneCoordinatorAllocation ? 3 : (hasValidParam ? parsedStep : 1)
  );

  useEffect(() => {
    if (standaloneCoordinatorAllocation) {
      if (currentStep !== 3) setCurrentStep(3);
      return;
    }
    const s = parseInt(searchParams.get('step'), 10);
    if (!s || isNaN(s) || s < 1 || s > STEPS.length) {
      // Progress is display-only. A refresh must never redirect the HOD to
      // the first incomplete/current backend step.
      setSearchParams({ step: 1 }, { replace: true });
      setCurrentStep(1);
    } else if (s !== currentStep) {
      setCurrentStep(s);
    }
  }, [searchParams, currentStep, setSearchParams, standaloneCoordinatorAllocation]);

  // A workflow refresh has no preloaded screen data. Load the progress record
  // once so the correct initial step can be determined, then load only the
  // resources rendered by that step below.
  useEffect(() => {
    loadHodSetupProgress(selectedDepartmentId).catch(() => {});
  }, [loadHodSetupProgress, selectedDepartmentId]);

  // Batches are scoped by the master programme selected in the sidebar and
  // the signed-in HOD. Load once per scope on workflow entry and reuse the
  // returned list as the user moves through the workflow steps.
  useEffect(() => {
    if (!programmeId || !user?.email) return;
    const requestScope = `${programmeId}:${user.email}`;
    if (loadedBatchScopeRef.current === requestScope) return;
    loadedBatchScopeRef.current = requestScope;
    loadProgrammeBatches(programmeId, user.email).catch(() => {});
  }, [loadProgrammeBatches, programmeId, user?.email]);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentStep = async () => {
      // Fetch master programmes once for each department selection. Further
      // workflow step changes reuse the already scoped shared list.
      const programmes = loadedMasterProgrammeDepartmentRef.current === selectedDepartmentId
        ? masterProgrammes
        : await loadMasterProgrammes(selectedDepartmentId);
      if (cancelled) return;

      loadedMasterProgrammeDepartmentRef.current = selectedDepartmentId;

      const hasSelectedProgramme = programmes.some((programme) => programme.id === programmeId);
      const targetProgrammeId = hasSelectedProgramme ? programmeId : programmes[0]?.id;
      if (targetProgrammeId && targetProgrammeId !== programmeId) {
        setProgrammeId(targetProgrammeId);
        // Wait for the selected programme state before requesting the active
        // tab's programme-scoped endpoint.
        return;
      }
      if (!targetProgrammeId) return;

      if (currentStep === 1) {
        await loadMasterCourses({ masterProgrammeId: targetProgrammeId });
      } else if (currentStep === 2 || currentStep === 3) {
        await loadProgrammeCoordinators();
      } else if (currentStep === 4) {
      } else if (currentStep === 5) {
        // Review renders the summary of batches and outcomes, so these are
        // already loaded; outcomes are this step's only extra dependency.
        await loadProgrammeOutcomes(targetProgrammeId, { includeTargets: false });
      }
    };

    loadCurrentStep().catch(() => {});
    return () => { cancelled = true; };
  }, [
    currentStep,
    loadProgrammeBatches,
    loadMasterCourses,
    loadProgrammeCoordinators,
    assignProgrammeBatchCoordinator,
    loadProgrammeBatchOutcomes,
    loadProgrammeOutcomes,
    loadMasterProgrammes,
    programmeId,
    setProgrammeId,
    selectedDepartmentId,
  ]);

  useEffect(() => {
    if (currentStep !== 4 || programmeBatches.length === 0) {
      if (currentStep === 4 && programmeBatches.length === 0) setOutcomesBatchId('');
      return;
    }
    if (!programmeBatches.some((batch) => batch.id === outcomesBatchId)) {
      setOutcomesBatchId(programmeBatches[0].id);
    }
  }, [currentStep, outcomesBatchId, programmeBatches]);

  useEffect(() => {
    if (currentStep !== 4 || !programmeId || !outcomesBatchId) return;
    loadProgrammeBatchOutcomes(programmeId, outcomesBatchId)
      .then(({ pos = [], psos = [], peos = [] } = {}) => {
        setSavedOutcomes({ batchId: outcomesBatchId, signature: outcomeSignature(pos, psos, peos) });
        setOutcomesSaveState('idle');
      })
      .catch(() => {});
  }, [currentStep, loadProgrammeBatchOutcomes, outcomesBatchId, programmeId]);

  const goToStep = (n) => {
    setCurrentStep(n);
    setSearchParams({ step: n });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const durationYears = selectedProgramme?.durationYears || 4;

  const handleAddMasterCourse = async (event) => {
    event.preventDefault();
    if (!selectedProgramme?.id || !newCourseCode.trim() || !newCourseName.trim()) return;

    try {
      await createMasterCourse({
        masterProgrammeId: selectedProgramme.id,
        code: newCourseCode.trim().toUpperCase(),
        name: newCourseName.trim(),
        courseType: newCourseType,
        credits: 4,
        status: 'ACTIVE',
      });
      setNewCourseCode('');
      setNewCourseName('');
      setNewCourseType('THEORY');
      await loadMasterCourses({ masterProgrammeId: selectedProgramme.id });
    } catch (error) {
      console.error('Failed to add master course:', error);
      alert(error?.message || 'Unable to add the master course.');
    }
  };

  const handleDeleteMasterCourse = (course) => {
    triggerDeleteConfirm({
      title: 'Delete Master Course?',
      itemName: `${course.code} — ${course.name}`,
      description: 'Remove this course from the selected programme catalogue.',
      onConfirm: () => deleteMasterCourse(course.id),
    });
  };

  const handleStartYearChange = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    setStartYearInput(v);
    if (v.length === 4) {
      const n = parseInt(v, 10);
      setBatchValidationError(n <= 2020 ? 'Start year must be greater than 2020.' : '');
      if (n > 2020) setEndYearInput(String(n + durationYears));
    } else { setBatchValidationError(''); }
  };
  const handleEndYearChange = (val) => setEndYearInput(val.replace(/\D/g, '').slice(0, 4));

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    const s = parseInt(startYearInput, 10), en = parseInt(endYearInput, 10);
    if (!s || s <= 2020 || !en || en <= s || !selectedProgramme?.id) return;

    const programmeLabel = selectedProgramme.code?.trim() || selectedProgramme.id;
    const coordinator = coordinatorOptions.find(
      (item) => coordinatorValue(item) === newBatchCoordinatorValue
    );
    try {
      const batch = await createProgrammeBatch({
        masterProgrammeId: selectedProgramme.id,
        name: `${programmeLabel} ${s}-${en}`,
        startYear: s,
        endYear: en,
        durationYears,
        yearLevel: 'First Year',
        status: 'ACTIVE',
      });
      if (!batch?.id) throw new Error('The programme batch was not created.');
      if (coordinator) await assignProgrammeBatchCoordinator(batch.id, coordinator);
      setBatchId(batch.id);
      setNewBatchCoordinatorValue('');
    } catch (error) {
      console.error('Failed to create programme batch or assign its coordinator:', error);
      setBatchValidationError(error?.response?.data?.message || error?.message || 'Unable to create the programme batch. Please try again.');
    }
  };

  const handleBulkSaveCoordinatorAssignments = async () => {
    if (assignmentSaveState === 'saving' || assignmentsAreSaved) return;
    const assignments = programmeBatches
      .map((batch) => {
        const coordinator = coordinatorOptions.find(
          (person) => coordinatorValue(person) === String(batchCoordinatorSelections[batch.id])
        );
        return coordinator ? { batch, coordinator } : null;
      })
      .filter(Boolean);

    if (assignments.length === 0) {
      setAssignmentSaveState('empty');
      return;
    }

    setAssignmentSaveState('saving');
    try {
      await Promise.all(assignments.map(({ batch, coordinator }) => (
        assignProgrammeBatchCoordinator(batch.id, coordinator)
      )));
      setSavedAssignmentSignature(assignmentSignature);
      setAssignmentSaveState('saved');
      // A successful assignment request is still a successful save even if
      // the optional refresh has a transient failure.
      loadProgrammeBatches(selectedProgramme.id, user?.email).catch(() => {});
    } catch (error) {
      console.error('Failed to save programme coordinator assignments:', error);
      setAssignmentSaveState('error');
    }
  };

  // ── PO HANDLERS ─────────────────────────────────────────────────────────────
  const handleAddPO = () => {
    const newPo = {
      code: '',
      statement: '',
      target: 2.5,
      competencies: [],
    };
    updateProgrammePOs(programmeId, [...activePOs, newPo]);
  };
  const handleUpdatePOCode = (i, v) => {
    updateProgrammePOs(programmeId, activePOs.map((p, idx) => (idx === i ? { ...p, code: v } : p)));
  };
  const handleUpdatePOField = (i, field, value) => {
    updateProgrammePOs(programmeId, activePOs.map((p, idx) => (
      idx === i ? { ...p, [field]: value } : p
    )));
  };
  const handleUpdatePOStatement = (i, v) => {
    updateProgrammePOs(programmeId, activePOs.map((p, idx) => (
      idx === i ? { ...p, statement: v, description: v } : p
    )));
  };
  const handleDeletePO = (i) => {
    const item = activePOs[i];
    triggerDeleteConfirm({
      title: 'Delete Programme Outcome?',
      itemName: item?.code,
      description: 'This action cannot be undone. This PO mapping will be permanently removed.',
      onConfirm: () => updateProgrammePOs(programmeId, activePOs.filter((_, idx) => idx !== i)),
    });
  };
  const handleAddPOCompetency = (pi) => {
    updateProgrammePOs(
      programmeId,
      activePOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = p.competencies || [];
        return { ...p, competencies: [...comps, {
          code: `${p.code || ''}.${comps.length + 1}`,
          statement: '',
        }] };
      }),
    );
  };
  const handleUpdatePOCompetency = (pi, ci, v) => {
    updateProgrammePOs(
      programmeId,
      activePOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = [...(p.competencies || [])];
        comps[ci] = { ...comps[ci], statement: v };
        return { ...p, competencies: comps };
      }),
    );
  };
  const handleUpdatePOCompetencyField = (pi, ci, field, value) => {
    updateProgrammePOs(
      programmeId,
      activePOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = [...(p.competencies || [])];
        comps[ci] = { ...comps[ci], [field]: value };
        return { ...p, competencies: comps };
      }),
    );
  };
  const handleDeletePOCompetency = (pi, ci) => {
    updateProgrammePOs(
      programmeId,
      activePOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = (p.competencies || []).filter((_, c) => c !== ci).map((c, idx) => ({ ...c, order: idx + 1 }));
        return { ...p, competencies: comps };
      }),
    );
  };

  // ── PSO HANDLERS ────────────────────────────────────────────────────────────
  const normalisedPSOs = activePSOs.map((pso) => ({
    ...pso,
    // The supplied PSO response has no competency field, so do not generate
    // UI-only competency data that was not returned by the backend.
    competencies: pso.competencies || [],
  }));

  const handleAddPSO = () => {
    const newPso = {
      code: '',
      statement: '',
      target: 2.5,
      competencies: [],
    };
    updateProgrammePSOs(programmeId, [...normalisedPSOs, newPso]);
  };
  const handleUpdatePSOCode = (i, v) => {
    updateProgrammePSOs(programmeId, normalisedPSOs.map((p, idx) => (idx === i ? { ...p, code: v } : p)));
  };
  const handleUpdatePSOField = (i, field, value) => {
    updateProgrammePSOs(programmeId, normalisedPSOs.map((p, idx) => (
      idx === i ? { ...p, [field]: value } : p
    )));
  };
  const handleUpdatePSOStatement = (i, v) => {
    updateProgrammePSOs(programmeId, normalisedPSOs.map((p, idx) => (
      idx === i ? { ...p, statement: v, description: v } : p
    )));
  };
  const handleDeletePSO = (i) => {
    const item = normalisedPSOs[i];
    triggerDeleteConfirm({
      title: 'Delete Programme Specific Outcome?',
      itemName: item?.code,
      description: 'This action cannot be undone. This PSO mapping will be permanently removed.',
      onConfirm: () => updateProgrammePSOs(programmeId, normalisedPSOs.filter((_, idx) => idx !== i)),
    });
  };
  const handleAddPSOCompetency = (pi) => {
    updateProgrammePSOs(
      programmeId,
      normalisedPSOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = p.competencies || [];
        return { ...p, competencies: [...comps, {
          code: `${p.code || ''}.${comps.length + 1}`,
          statement: '',
        }] };
      }),
    );
  };
  const handleUpdatePSOCompetency = (pi, ci, v) => {
    updateProgrammePSOs(
      programmeId,
      normalisedPSOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = [...(p.competencies || [])];
        comps[ci] = { ...comps[ci], statement: v };
        return { ...p, competencies: comps };
      }),
    );
  };
  const handleUpdatePSOCompetencyField = (pi, ci, field, value) => {
    updateProgrammePSOs(
      programmeId,
      normalisedPSOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = [...(p.competencies || [])];
        comps[ci] = { ...comps[ci], [field]: value };
        return { ...p, competencies: comps };
      }),
    );
  };
  const handleDeletePSOCompetency = (pi, ci) => {
    updateProgrammePSOs(
      programmeId,
      normalisedPSOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = (p.competencies || []).filter((_, c) => c !== ci).map((c, idx) => ({ ...c, order: idx + 1 }));
        return { ...p, competencies: comps };
      }),
    );
  };

  // ── PEO HANDLERS ────────────────────────────────────────────────────────────
  const handleAddPEO = () => {
    updateProgrammePEOs(programmeId, [...activePEOs, {
      code: '',
      name: '',
      description: '',
      statement: '',
    }]);
  };
  const handleUpdatePEOStatement = (i, v) => {
    updateProgrammePEOs(programmeId, activePEOs.map((p, idx) => (
      idx === i ? { ...p, statement: v, name: v, description: v } : p
    )));
  };
  const handleUpdatePEOField = (i, field, value) => {
    updateProgrammePEOs(programmeId, activePEOs.map((p, idx) => (
      idx === i ? { ...p, [field]: value } : p
    )));
  };
  const handleDeletePEO = (i) => {
    const item = activePEOs[i];
    triggerDeleteConfirm({
      title: 'Delete Programme Educational Objective?',
      itemName: item?.code,
      description: 'This action cannot be undone. This PEO mapping will be permanently removed.',
      onConfirm: () => updateProgrammePEOs(programmeId, activePEOs.filter((_, idx) => idx !== i)),
    });
  };

  const currentOutcomeSignature = outcomeSignature(activePOs, normalisedPSOs, activePEOs);
  const outcomesAreSaved =
    savedOutcomes.batchId === outcomesBatchId &&
    savedOutcomes.signature === currentOutcomeSignature;

  const handleSaveBatchOutcomes = async () => {
    if (!outcomesBatchId) {
      alert('Select a Programme Batch before saving PO, PSO, and PEO outcomes.');
      return false;
    }

    setOutcomesSaveState('saving');
    try {
      const saved = await saveProgrammeBatchOutcomeDefinitions(selectedProgramme.id, outcomesBatchId, {
        pos: activePOs,
        psos: normalisedPSOs,
        peos: activePEOs,
      });
      const pos = saved?.pos ?? activePOs;
      const psos = saved?.psos ?? normalisedPSOs;
      const peos = saved?.peos ?? activePEOs;
      setSavedOutcomes({ batchId: outcomesBatchId, signature: outcomeSignature(pos, psos, peos) });
      setOutcomesSaveState('saved');
      return true;
    } catch (error) {
      console.error('Failed to save Programme Batch outcomes:', error);
      setOutcomesSaveState('error');
      alert(error?.message || 'Unable to save programme outcomes.');
      return false;
    }
  };

  const currentStepMeta = STEPS[currentStep - 1] || STEPS[0];

  const handleSaveAndNext = async () => {
    if (currentStep === 4) {
      const saved = outcomesAreSaved || await handleSaveBatchOutcomes();
      if (!saved) return;
    }
    await markHodWorkflowStepComplete(selectedProgramme.id, currentStep);
    if (currentStep < STEPS.length) {
      goToStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    await markHodWorkflowStepComplete(selectedProgramme.id, STEPS.length);
    navigate('/hod/dashboard');
  };

  const activeBatchObj = batches.find((b) => b.id === batchId) || batches[0];

  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';
  const inputStyle = { height: '38px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff', color: ink, width: '100%', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '4px' };

  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      {!standaloneCoordinatorAllocation && <div
        style={{
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
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            {currentStepMeta.title}
          </h2>
        </div>

        {/* Target Programme Selector & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={programmeId}
              onChange={(e) => {
                const nextProgId = e.target.value;
                setProgrammeId(nextProgId);
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
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: accent, pointerEvents: 'none' }} />
          </div>

          <button
            onClick={() => navigate('/hod/dashboard')}
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

      {/* ── STEP STEPPER (icon circles) ───────────────────────────────────────── */}
      {!standaloneCoordinatorAllocation && <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px' }}>
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

      {/* ── STEP CONTENT WITH ISOLATED ERROR BOUNDARY ────────────────────────── */}
      <ErrorBoundary
        fallbackTitle={`Step ${currentStep} Error (${STEPS[currentStep - 1]?.title || 'Setup Step'})`}
        fallbackMessage={`An error occurred while loading this setup step. You can retry or switch to another step.`}
      >
      {/* ── STEP 1: MASTER COURSE CATALOGUE ────────────────────────────────── */}
      {currentStep === 1 && (
        <div style={{ ...surface, padding: '24px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: ink }}>
              Step 1: Master Course Catalogue
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
              Create the reusable course catalogue for the selected programme. Course Coordinator allocation happens later at the Programme Batch Course stage.
            </p>
          </div>

          {/* Selected Master Programme */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 18px', marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Chosen Programme</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '800', color: accent }}>{selectedProgramme.code}</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{selectedProgramme.name}</div>
                <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>{currentDept?.name || selectedProgramme.department}</div>
              </div>
            </div>
          </div>

          {/* Add Master Course */}
          <form onSubmit={handleAddMasterCourse} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '10px' }}>Add Master Course</div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 150px auto', gap: '10px', alignItems: 'flex-end' }}>
              <div>
                <label style={labelStyle}>Course Code *</label>
                <input type="text" required placeholder="CS305" value={newCourseCode} onChange={(e) => setNewCourseCode(e.target.value)} style={{ ...inputStyle, fontWeight: '700', color: accent }} />
              </div>
              <div>
                <label style={labelStyle}>Course Name *</label>
                <input type="text" required placeholder="e.g. Compiler Design" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Course Type *</label>
                <select value={newCourseType} onChange={(e) => setNewCourseType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="THEORY">Theory</option>
                  <option value="LAB">Lab</option>
                  <option value="ELECTIVE">Elective</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                <Plus size={14} /> Add Course
              </button>
            </div>
          </form>

          {/* Master Course Table */}
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Code</th>
                  <th>Course Name</th>
                  <th style={{ width: '150px' }}>Course Type</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {masterCourses.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '28px', color: muted, fontSize: '12.5px' }}>No master courses yet — add one above.</td></tr>
                )}
                {masterCourses.map((course) => (
                  <tr key={course.id}>
                    <td style={{ fontWeight: '700', color: accent }}>{course.code}</td>
                    <td style={{ fontWeight: '600', color: ink }}>{course.name}</td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: accent, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '5px', padding: '2px 8px' }}>
                        {course.courseType || 'THEORY'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button type="button" onClick={() => handleDeleteMasterCourse(course)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }} title="Delete Master Course">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {masterCourses.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginTop: '16px' }}>
              <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>{masterCourses.length} master course{masterCourses.length !== 1 ? 's' : ''} added for {selectedProgramme.name}.</span>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: BATCH SETUP ───────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div style={{ ...surface, padding: '24px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: ink }}>
              Step 2: Active Student Batch Setup
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
              Initialize 4-year student batches for {selectedProgramme.name} ({durationYears} Years duration).
            </p>
          </div>

          <form onSubmit={handleCreateBatch} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: ink, marginBottom: '12px' }}>Create New Student Batch</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr minmax(210px, 1.2fr) auto', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={labelStyle}>Start Academic Year *</label>
                <input type="text" placeholder="2025" value={startYearInput} onChange={(e) => handleStartYearChange(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Graduation Year *</label>
                <input type="text" placeholder="2029" value={endYearInput} onChange={(e) => handleEndYearChange(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Programme Coordinator</label>
                <select value={newBatchCoordinatorValue} onChange={(event) => setNewBatchCoordinatorValue(event.target.value)} style={{ ...inputStyle, cursor: 'pointer', fontSize: '12px' }}>
                  <option value="">Assign later in Step 3</option>
                  {coordinatorOptions.map((coordinator) => (
                    <option key={coordinatorValue(coordinator)} value={coordinatorValue(coordinator)}>
                      {coordinatorLabel(coordinator)} — {coordinator.email}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '800' }}>
                <Plus size={15} /> Add Batch
              </button>
            </div>
            {batchValidationError && <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px', fontWeight: '600' }}>{batchValidationError}</div>}
          </form>

          <table className="audit-data-table" style={{ marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th>Batch Name</th>
                <th style={{ width: '140px' }}>Start AY</th>
                <th style={{ width: '140px' }}>End AY</th>
                <th style={{ width: '220px' }}>Programme Coordinator</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programmeBatches.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: muted, fontSize: '12.5px' }}>
                    No active batches found for {selectedProgramme.name}. Create one above to get started.
                  </td>
                </tr>
              )}
              {programmeBatches.map((b) => {
                const isEditing = editingBatchId === b.id;
                return (
                  <tr key={b.id}>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editBatchName}
                          onChange={(e) => setEditBatchName(e.target.value)}
                          style={{ ...inputStyle, height: '34px', fontSize: '12px' }}
                        />
                      ) : (
                        <span style={{ fontWeight: '700', color: ink }}>{b.name}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editStartYear}
                          onChange={(e) => setEditStartYear(e.target.value)}
                          style={{ ...inputStyle, height: '34px', fontSize: '12px' }}
                        />
                      ) : (
                        <span style={{ color: muted }}>{b.startYear}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editEndYear}
                          onChange={(e) => setEditEndYear(e.target.value)}
                          style={{ ...inputStyle, height: '34px', fontSize: '12px' }}
                        />
                      ) : (
                        <span style={{ color: muted }}>{b.endYear}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editCoordinatorValue}
                          onChange={(event) => setEditCoordinatorValue(event.target.value)}
                          style={{ ...inputStyle, height: '34px', fontSize: '11.5px' }}
                        >
                          <option value="">Unassigned</option>
                          {coordinatorOptions.map((coordinator) => (
                            <option key={coordinatorValue(coordinator)} value={coordinatorValue(coordinator)}>
                              {coordinatorLabel(coordinator)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ color: b.coordinatorName || b.coordinatorEmail ? ink : muted, fontSize: '12px', fontWeight: '600' }}>
                          {b.coordinatorName || b.coordinator || b.coordinatorEmail || 'Unassigned'}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{ ...inputStyle, height: '34px', fontSize: '11.5px', padding: '0 6px' }}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="GRADUATED">GRADUATED</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: '800', background: b.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9', color: b.status === 'ACTIVE' ? '#15803d' : '#475569', borderRadius: '5px', padding: '2px 8px' }}>
                          {b.status}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSaveEditBatch(b)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                            title="Save Batch"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingBatchId(null)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: muted, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleStartEditBatch(b)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #c7d2fe', background: '#eef2ff', color: accent, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                            title="Edit Batch"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBatchItem(b)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                            title="Delete Batch"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── STEP 3: PROGRAMME COORDINATOR ALLOCATION ───────────────────────── */}
      {currentStep === 3 && (
        <div style={{ ...surface, padding: '24px' }}>
          {!standaloneCoordinatorAllocation && <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: ink }}>
                Step 3: Programme Coordinator Allocation
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
                Assign a Programme Coordinator to each Programme Batch under {selectedProgramme.name}.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBulkSaveCoordinatorAssignments}
              disabled={assignmentSaveState === 'saving' || assignmentsAreSaved || programmeBatches.length === 0}
              className="btn btn-primary"
              style={{ height: '38px', padding: '0 18px', fontSize: '12.5px', fontWeight: '800', opacity: assignmentSaveState === 'saving' || assignmentsAreSaved || programmeBatches.length === 0 ? 0.6 : 1, cursor: assignmentSaveState === 'saving' || assignmentsAreSaved || programmeBatches.length === 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              <Save size={14} /> {assignmentSaveState === 'saving' ? 'Saving Assignments…' : assignmentsAreSaved ? 'Saved' : 'Save Assignments'}
            </button>
          </div>}

          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Programme Code</th>
                  <th style={{ width: '220px' }}>Programme Name</th>
                  <th style={{ width: '300px' }}>Programme Batch</th>
                  <th style={{ width: '270px' }}>Programme Coordinator</th>
                </tr>
              </thead>
              <tbody>
                {programmeBatches.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '28px', color: muted, fontSize: '12.5px' }}>
                      No Programme Batches found for {selectedProgramme.name}. Create a batch in Step 2 before assigning a coordinator.
                    </td>
                  </tr>
                ) : programmeBatches.map((batch) => (
                  <tr key={batch.id}>
                    <td style={{ fontWeight: '700', color: accent }}>{selectedProgramme.code}</td>
                    <td style={{ fontWeight: '600', color: ink }}>{selectedProgramme.name}</td>
                    <td>
                      <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '5px', padding: '3px 8px' }}>
                        {batch.name}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const selectedValue = batchCoordinatorSelections[batch.id] ?? '';
                        const hasSavedCoordinatorOnly = selectedValue.startsWith('existing:');
                        const savedCoordinatorLabel = batch.coordinatorName || batch.coordinator || batch.coordinatorEmail;
                        return (
                      <select
                        value={selectedValue}
                        onChange={(event) => {
                          setAssignmentSaveState('idle');
                          setBatchCoordinatorSelections((current) => ({ ...current, [batch.id]: event.target.value }));
                        }}
                        style={{ ...inputStyle, height: '34px', fontSize: '12px', cursor: 'pointer', color: accent, fontWeight: '600' }}
                      >
                        <option value="">Select Programme Coordinator</option>
                        {hasSavedCoordinatorOnly && (
                          <option value={selectedValue}>{savedCoordinatorLabel}</option>
                        )}
                        {coordinatorOptions.map((coordinator) => (
                          <option key={coordinatorValue(coordinator)} value={coordinatorValue(coordinator)}>
                            {coordinatorLabel(coordinator)}
                          </option>
                        ))}
                      </select>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {standaloneCoordinatorAllocation && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleBulkSaveCoordinatorAssignments}
                disabled={assignmentSaveState === 'saving' || assignmentsAreSaved || programmeBatches.length === 0}
                className="btn btn-primary"
                style={{ height: '38px', padding: '0 18px', fontSize: '12.5px', fontWeight: '800', opacity: assignmentSaveState === 'saving' || assignmentsAreSaved || programmeBatches.length === 0 ? 0.6 : 1, cursor: assignmentSaveState === 'saving' || assignmentsAreSaved || programmeBatches.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                <Save size={14} /> {assignmentSaveState === 'saving' ? 'Saving Assignment…' : assignmentsAreSaved ? 'Saved' : 'Save Assignment'}
              </button>
            </div>
          )}

          {!standaloneCoordinatorAllocation && assignmentSaveState === 'saved' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginTop: '16px' }}>
              <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>Programme Coordinator assignments saved successfully.</span>
            </div>
          )}
          {!standaloneCoordinatorAllocation && assignmentSaveState === 'empty' && (
            <div style={{ fontSize: '12px', color: '#b45309', marginTop: '12px', fontWeight: '600' }}>Select at least one Programme Coordinator before saving.</div>
          )}
          {!standaloneCoordinatorAllocation && assignmentSaveState === 'error' && (
            <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '12px', fontWeight: '600' }}>Unable to save the assignments. Please try again.</div>
          )}
        </div>
      )}

      {/* ── STEP 4: PO / PSO / PEO OUTCOME FRAMEWORK ───────────────────────── */}
      {currentStep === 4 && (
        <div style={{ ...surface, padding: '24px' }}>
          {/* Header & Sub-tabs */}
          <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: ink }}>
                  Step 4: Outcome Framework Configuration (PO / PSO / PEO)
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
                  Define outcome statements and competency breakdowns for a specific Programme Batch under {selectedProgramme.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveBatchOutcomes}
                disabled={!selectedOutcomesBatch || outcomesSaveState === 'saving' || outcomesAreSaved}
                className="btn btn-primary"
                style={{ height: '38px', padding: '0 18px', fontSize: '12.5px', fontWeight: '800', whiteSpace: 'nowrap', opacity: !selectedOutcomesBatch || outcomesSaveState === 'saving' || outcomesAreSaved ? 0.6 : 1, cursor: !selectedOutcomesBatch || outcomesSaveState === 'saving' || outcomesAreSaved ? 'not-allowed' : 'pointer' }}
              >
                <Save size={14} /> {outcomesSaveState === 'saving' ? 'Saving…' : outcomesAreSaved ? 'Saved' : 'Save Outcomes'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginTop: '18px' }}>
              <div style={{ position: 'relative' }}>
                <select
                  value={outcomesBatchId}
                  onChange={(event) => setOutcomesBatchId(event.target.value)}
                  disabled={programmeBatches.length === 0}
                  style={{ height: '38px', minWidth: '200px', padding: '0 32px 0 12px', fontSize: '12.5px', fontWeight: '700', color: '#0369a1', border: '1.5px solid #bae6fd', borderRadius: '8px', background: '#f0f9ff', cursor: programmeBatches.length === 0 ? 'not-allowed' : 'pointer', outline: 'none', appearance: 'none', fontFamily: 'inherit' }}
                >
                  <option value="">Select Programme Batch</option>
                  {programmeBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                  ))}
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#0284c7', pointerEvents: 'none' }} />
              </div>

              {/* Tab strip */}
              <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '9px' }}>
                {[
                  ['PO',  `POs (${activePOs.length})`],
                  ['PSO', `PSOs (${normalisedPSOs.length})`],
                  ['PEO', `PEOs (${activePEOs.length})`],
                ].map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setOutcomeTab(tab)}
                    style={{
                      padding: '7px 18px',
                      borderRadius: '7px',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: outcomeTab === tab ? '#ffffff' : 'transparent',
                      color: outcomeTab === tab ? accent : muted,
                      boxShadow: outcomeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      fontFamily: 'inherit',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!selectedOutcomesBatch && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', color: '#92400e', fontSize: '12.5px', fontWeight: '600' }}>
              {programmeBatches.length === 0
                ? 'Create a Programme Batch in Step 2 before defining PO, PSO, and PEO.'
                : 'Select a Programme Batch to load and manage its PO, PSO, and PEO definitions.'}
            </div>
          )}

          {/* TAB: PO */}
          {outcomeTab === 'PO' && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {activePOs.map((po, idx) => (
                <div key={idx} style={{ ...surface, padding: '16px', borderLeft: `3px solid ${accent}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: po.competencies?.length ? '12px' : 0, flexWrap: 'nowrap' }}>
                    <input
                      type="text"
                      placeholder="Code"
                      value={po.code || ''}
                      onChange={(e) => handleUpdatePOCode(idx, e.target.value)}
                      style={{ ...inputStyle, width: '82px', flexShrink: 0, fontWeight: '800', color: accent, textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      placeholder="Outcome name"
                      value={po.statement || ''}
                      onChange={(e) => handleUpdatePOStatement(idx, e.target.value)}
                      style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPOCompetency(idx)}
                      style={{ height: '36px', padding: '0 12px', fontSize: '12px', fontWeight: '700', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                    >
                      <Plus size={13} /> Competency
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePO(idx)}
                      style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {(po.competencies || []).length > 0 && (
                    <div style={{ marginLeft: '8px', paddingLeft: '14px', borderLeft: '2px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        Competencies ({(po.competencies || []).length})
                      </div>
                      <table className="audit-data-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px', textAlign: 'center' }}>No.</th>
                            <th>Statement</th>
                            <th style={{ width: '50px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(po.competencies || []).map((comp, ci) => (
                            <tr key={comp.id || ci}>
                              <td style={{ textAlign: 'center', fontWeight: '700', color: accent, fontSize: '11.5px' }}>
                                {po.code}.{ci + 1}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={comp.statement || ''}
                                  onChange={(e) => handleUpdatePOCompetency(idx, ci, e.target.value)}
                                  style={{ ...inputStyle, height: '34px', fontSize: '12px' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePOCompetency(idx, ci)}
                                  style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                                >
                                  <X size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddPO}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1.5px dashed #c7d2fe', background: '#fafafa', color: accent, fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                <Plus size={15} /> Add Programme Outcome (PO{activePOs.length + 1})
              </button>
            </div>
          )}

          {/* TAB: PSO */}
          {outcomeTab === 'PSO' && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {normalisedPSOs.map((pso, idx) => (
                <div key={idx} style={{ ...surface, padding: '16px', borderLeft: '3px solid #059669' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: pso.competencies.length ? '12px' : 0, flexWrap: 'nowrap' }}>
                    <input
                      type="text"
                      placeholder="Code"
                      value={pso.code || ''}
                      onChange={(e) => handleUpdatePSOCode(idx, e.target.value)}
                      style={{ ...inputStyle, width: '82px', flexShrink: 0, fontWeight: '800', color: '#059669', textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      placeholder="Outcome name"
                      value={pso.statement || ''}
                      onChange={(e) => handleUpdatePSOStatement(idx, e.target.value)}
                      style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPSOCompetency(idx)}
                      style={{ height: '36px', padding: '0 12px', fontSize: '12px', fontWeight: '700', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                    >
                      <Plus size={13} /> Competency
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePSO(idx)}
                      style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {pso.competencies.length > 0 && (
                    <div style={{ marginLeft: '8px', paddingLeft: '14px', borderLeft: '2px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        Competencies ({pso.competencies.length})
                      </div>
                      <table className="audit-data-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px', textAlign: 'center' }}>No.</th>
                            <th>Statement</th>
                            <th style={{ width: '50px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {pso.competencies.map((comp, ci) => (
                            <tr key={comp.id || ci}>
                              <td style={{ textAlign: 'center', fontWeight: '700', color: '#059669', fontSize: '11.5px' }}>
                                {pso.code}.{ci + 1}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={comp.statement || ''}
                                  onChange={(e) => handleUpdatePSOCompetency(idx, ci, e.target.value)}
                                  style={{ ...inputStyle, height: '34px', fontSize: '12px' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePSOCompetency(idx, ci)}
                                  style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                                >
                                  <X size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddPSO}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1.5px dashed #a7f3d0', background: '#fafafa', color: '#059669', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                <Plus size={15} /> Add Programme Specific Outcome (PSO{normalisedPSOs.length + 1})
              </button>
            </div>
          )}

          {/* TAB: PEO */}
          {outcomeTab === 'PEO' && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {activePEOs.map((peo, idx) => (
                <div key={idx} style={{ ...surface, padding: '16px', borderLeft: '3px solid #0284c7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
                    <input
                      type="text"
                      placeholder="Code"
                      value={peo.code || ''}
                      onChange={(e) => handleUpdatePEOField(idx, 'code', e.target.value)}
                      style={{ ...inputStyle, width: '82px', flexShrink: 0, fontWeight: '800', color: '#0284c7', textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      placeholder="Objective statement"
                      value={peo.statement ?? peo.description ?? peo.name ?? ''}
                      onChange={(e) => handleUpdatePEOStatement(idx, e.target.value)}
                      style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeletePEO(idx)}
                      style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddPEO}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1.5px dashed #7dd3fc', background: '#fafafa', color: '#0284c7', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                <Plus size={15} /> Add Programme Educational Objective (PEO{activePEOs.length + 1})
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 5: REVIEW & CONFIRM (RELEVANT INFO FROM PREVIOUS TABS) ────── */}
      {currentStep === 5 && (
        <div style={{ ...surface, padding: '24px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: ink }}>
              Step 5: Review &amp; Confirm Setup
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
              Summary of all configurations from previous setup tabs for {selectedProgramme.name}.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Step 1 Summary */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: muted, textTransform: 'uppercase', marginBottom: '6px' }}>Step 1: Master Courses</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{selectedProgramme.name} ({selectedProgramme.code})</div>
              <div style={{ fontSize: '13px', color: accent, fontWeight: '700', marginTop: '6px' }}>
                Catalogue Courses: <span style={{ background: '#eef2ff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #c7d2fe' }}>{masterCourses.length}</span>
              </div>
            </div>

            {/* Step 2 Summary */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: muted, textTransform: 'uppercase', marginBottom: '6px' }}>Step 2: Active Student Batch</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{activeBatchObj?.name || '—'}</div>
              <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '700', marginTop: '6px' }}>
                Lifecycle Status: <span style={{ background: '#dcfce7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>{activeBatchObj?.status || '—'}</span>
              </div>
            </div>

            {/* Step 3 Summary */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: muted, textTransform: 'uppercase', marginBottom: '6px' }}>Step 3: Coordinator Allocation</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{programmeBatches.filter((batch) => batch.coordinatorId || batchCoordinatorSelections[batch.id]).length} of {programmeBatches.length} batches assigned</div>
              <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '700', marginTop: '6px' }}>
                Assignment Status: <span style={{ background: '#dcfce7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>Ready for review</span>
              </div>
            </div>

            {/* Step 4 Summary */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: muted, textTransform: 'uppercase', marginBottom: '6px' }}>Step 4: Outcome Framework</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{activePOs.length} POs · {normalisedPSOs.length} PSOs · {activePEOs.length} PEOs</div>
              <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '700', marginTop: '6px' }}>
                Competencies: <span style={{ background: '#dcfce7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>✓ Verified &amp; Mapped</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </ErrorBoundary>

      {/* ── STEPPER BOTTOM FOOTER NAV ─────────────────────────────────────── */}
      {!standaloneCoordinatorAllocation && <div style={{
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
      </div>}

      {/* ── DELETE CONFIRM MODAL ──────────────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title={deleteModalConfig.title}
        itemName={deleteModalConfig.itemName}
        description={deleteModalConfig.description}
        confirmText="Delete"
        onConfirm={deleteModalConfig.onConfirm}
        onClose={() => setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
