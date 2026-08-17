import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, GraduationCap, CheckCircle2, ArrowRight, ArrowLeft, Save, Check, Plus, X, Trash2, Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import {
  saveSchoolInfo,
  getSchools,
  getDirectorSchoolSummary,
  getDirectorSetupProgress,
  updateDirectorSetupProgress,
  getDepartments,
  saveDepartment,
  deleteDepartment as deleteDepartmentApi,
  getProgrammes,
  saveProgramme,
  deleteProgramme as deleteProgrammeApi,
  getUsersByRole,
} from '../../api/academic';

export default function DirectorSetupWorkflow() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    onConfirm: () => {},
  });

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

  // Step 1 State — Pre-filled from database on mount
  const [schoolId, setSchoolId] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [directorName, setDirectorName] = useState(user?.name || '');
  const [directorEmail, setDirectorEmail] = useState(user?.email || '');
  const [estYear, setEstYear] = useState('2024');

  // Step 2 State
  const [deptList, setDeptList] = useState([]);
  const [hodUsers, setHodUsers] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [selectedHod, setSelectedHod] = useState('');

  // Step 2 Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptCode, setEditDeptCode] = useState('');
  const [editSelectedHod, setEditSelectedHod] = useState('');
  const [editHodEmail, setEditHodEmail] = useState('');

  // Step 3 State
  const [progList, setProgList] = useState([]);
  const [selectedDeptIdForProg, setSelectedDeptIdForProg] = useState('');
  const [newProgName, setNewProgName] = useState('');
  const [newProgCode, setNewProgCode] = useState('');
  const [newProgDuration, setNewProgDuration] = useState(4);

  // ── 1. COMPREHENSIVE INITIAL DATA LOADING ON MOUNT ────────────────────────
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadAllWorkflowData = async () => {
      let resolvedSchoolId = '';

      // A. Load School Entity from DB using director email
      try {
        const directorEmailParam = user?.email || '';
        console.log('[DirectorSetupWorkflow] Fetching existing school records from backend using email:', directorEmailParam);
        const schoolsRes = await getSchools(directorEmailParam);
        const schoolsList = schoolsRes?.data?.schools || schoolsRes?.schools || schoolsRes?.data?.data || schoolsRes?.data || schoolsRes;
        if (Array.isArray(schoolsList) && schoolsList.length > 0) {
          const sch = schoolsList[0];
          console.log('[DirectorSetupWorkflow] Loaded school from getSchools:', sch);
          if (isMounted) {
            resolvedSchoolId = sch.id || sch.schoolId || '';
            setSchoolId(resolvedSchoolId);
            if (sch.name || sch.schoolName) setSchoolName(sch.name || sch.schoolName);
            if (sch.code || sch.schoolCode) setSchoolCode(sch.code || sch.schoolCode);
            if (sch.director || sch.directorName || sch.deanName) {
              setDirectorName(sch.director || sch.directorName || sch.deanName);
            }
            if (sch.directorEmail || sch.deanEmail) {
              setDirectorEmail(sch.directorEmail || sch.deanEmail);
            }
            if (sch.estYear || sch.establishmentYear) {
              setEstYear(sch.estYear || sch.establishmentYear);
            }
          }
        }
      } catch (err) {
        console.warn('[DirectorSetupWorkflow] Could not load getSchools:', err);
      }

      // Fallback/Augment with Director School Summary
      try {
        const summaryRes = await getDirectorSchoolSummary(user?.email || '');
        const sch = summaryRes?.data?.data || summaryRes?.data || summaryRes;
        if (sch && isMounted) {
          console.log('[DirectorSetupWorkflow] Loaded school from getDirectorSchoolSummary:', sch);
          if (!resolvedSchoolId && (sch.schoolId || sch.id)) {
            resolvedSchoolId = sch.schoolId || sch.id;
            setSchoolId(resolvedSchoolId);
          }
          if (sch.schoolName || sch.name) setSchoolName((prev) => prev || sch.schoolName || sch.name);
          if (sch.schoolCode || sch.code) setSchoolCode((prev) => prev || sch.schoolCode || sch.code);
          if (sch.directorName || sch.director) setDirectorName((prev) => prev || sch.directorName || sch.director);
          if (sch.directorEmail || sch.email) setDirectorEmail((prev) => prev || sch.directorEmail || sch.email);
          if (sch.estYear) setEstYear((prev) => prev || sch.estYear);
        }
      } catch (err) {
        console.warn('[DirectorSetupWorkflow] Could not fetch school summary:', err);
      }

      // B. Load Setup Progress
      try {
        const progressRes = await getDirectorSetupProgress(resolvedSchoolId, user?.email || '');
        const progressData = progressRes?.data?.data || progressRes?.data || progressRes;
        if (progressData && isMounted) {
          console.log('[DirectorSetupWorkflow] Loaded setup progress from backend:', progressData);
          if (progressData.currentStep) setCurrentStep(progressData.currentStep);
          if (Array.isArray(progressData.completedSteps)) {
            setCompletedSteps(progressData.completedSteps);
          }
        }
      } catch (err) {
        console.warn('[DirectorSetupWorkflow] Could not fetch setup progress:', err);
      }

      // C. Load HOD Users
      try {
        const list = await getUsersByRole('HOD');
        console.log('[DirectorSetupWorkflow] Loaded HOD users for assignment:', list);
        if (Array.isArray(list) && list.length > 0 && isMounted) {
          setHodUsers(list);
          if (!selectedHod) {
            const first = list[0];
            setSelectedHod(first.name || first.fullName || first.username || '');
            setSelectedHodEmail(first.email || '');
          }
        }
      } catch (err) {
        console.warn('[DirectorSetupWorkflow] Could not fetch HOD role users:', err);
      }

      // D. Load Departments under this School
      try {
        const deptsRes = await getDepartments(resolvedSchoolId);
        const dList = deptsRes?.data?.departments || deptsRes?.departments || deptsRes?.data?.data || deptsRes?.data || deptsRes;
        if (Array.isArray(dList) && isMounted) {
          console.log('[DirectorSetupWorkflow] Loaded departments from backend:', dList);
          setDeptList(dList);
          if (dList.length > 0) {
            setSelectedDeptIdForProg(dList[0].id || dList[0].deptId);
          }
        }
      } catch (err) {
        console.warn('[DirectorSetupWorkflow] Could not fetch departments:', err);
      }

      // E. Load Programmes under this School / Departments
      try {
        const progsRes = await getProgrammes(resolvedSchoolId);
        const pList = progsRes?.data?.programmes || progsRes?.programmes || progsRes?.data?.data || progsRes?.data || progsRes;
        if (Array.isArray(pList) && isMounted) {
          console.log('[DirectorSetupWorkflow] Loaded degree programmes from backend:', pList);
          setProgList(pList);
        }
      } catch (err) {
        console.warn('[DirectorSetupWorkflow] Could not fetch programmes:', err);
      }

      if (isMounted) setIsLoading(false);
    };

    loadAllWorkflowData();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // ── 2. RELOAD DEPARTMENTS WHEN STEP 2 BECOMES ACTIVE ───────────────────────
  useEffect(() => {
    let isMounted = true;
    if (currentStep === 2) {
      getDepartments(schoolId)
        .then((res) => {
          const list = res?.data?.data || res?.data || res;
          if (Array.isArray(list) && isMounted) {
            console.log('[DirectorSetupWorkflow] Step 2 refreshed departments:', list);
            setDeptList(list);
            if (list.length > 0) setSelectedDeptIdForProg(list[0].id || list[0].deptId);
          }
        })
        .catch((err) => console.warn('Could not refresh departments for step 2:', err));
    }
    return () => { isMounted = false; };
  }, [currentStep, schoolId]);

  // ── 3. RELOAD PROGRAMMES & DEPARTMENTS WHEN STEP 3 BECOMES ACTIVE ──────────
  useEffect(() => {
    let isMounted = true;
    if (currentStep === 3) {
      getDepartments(schoolId)
        .then((res) => {
          const list = res?.data?.data || res?.data || res;
          if (Array.isArray(list) && isMounted && list.length > 0) {
            setDeptList(list);
            if (!selectedDeptIdForProg) setSelectedDeptIdForProg(list[0].id || list[0].deptId);
          }
        })
        .catch(() => {});

      getProgrammes(schoolId)
        .then((res) => {
          const list = res?.data?.data || res?.data || res;
          if (Array.isArray(list) && isMounted) {
            console.log('[DirectorSetupWorkflow] Step 3 refreshed programmes:', list);
            setProgList(list);
          }
        })
        .catch((err) => console.warn('Could not refresh programmes for step 3:', err));
    }
    return () => { isMounted = false; };
  }, [currentStep, schoolId]);

  const changeStep = (targetStep) => {
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const syncProgress = async (newStep) => {
    try {
      const targetId = schoolId;
      const res = await updateDirectorSetupProgress(targetId, newStep, user?.email || '');
      const data = res?.data?.data || res?.data || res;
      if (Array.isArray(data?.completedSteps)) {
        setCompletedSteps(data.completedSteps);
      }
    } catch (err) {
      console.warn('Failed to sync setup progress to backend:', err);
    }
  };

  const handleOpenEditDept = (dept) => {
    setEditingDept(dept);
    const rawHod = dept.hod || dept.deptHodName;
    const hName = (rawHod && rawHod !== 'Unassigned' && rawHod !== 'No HOD Added Yet') ? rawHod : '';
    setEditDeptName(dept.name || dept.deptName || '');
    setEditDeptCode(dept.code || dept.deptCode || '');
    setEditSelectedHod(hName);
    const matched = hodUsers.find((u) => u.name === hName);
    setEditHodEmail(matched?.email || dept.hodEmail || dept.deptHodEmail || '');
    setShowEditModal(true);
  };

  const handleSaveEditDept = async (e) => {
    e.preventDefault();
    if (!editingDept || !editDeptName || !editDeptCode) return;
    const targetSchoolId = schoolId || 'sch-1';
    const targetDeptId = editingDept.id || editingDept.deptId;
    const matchedUser = hodUsers.find((u) => u.name === editSelectedHod);
    const hodNamePayload = editSelectedHod || '';
    const hodEmailPayload = matchedUser ? matchedUser.email : (editSelectedHod ? editHodEmail : '');

    const payload = {
      id: targetDeptId,
      schoolId: targetSchoolId,
      name: editDeptName,
      code: editDeptCode.toUpperCase(),
      hod: hodNamePayload,
      hodEmail: hodEmailPayload,
      status: 'ACTIVE',
    };

    try {
      console.log('[DirectorSetupWorkflow] Saving department edit via POST endpoint:', payload);
      const res = await saveDepartment(payload);
      const savedDept = res?.data?.data || res?.data || payload;
      setDeptList((prev) =>
        prev.map((d) => ((d.id || d.deptId) === targetDeptId ? savedDept : d))
      );
      setShowEditModal(false);
      setEditingDept(null);
    } catch (err) {
      console.error('Failed to save department edit:', err);
      alert('Failed to save department edit. Please verify backend connection.');
    }
  };

  const isSchoolDone = completedSteps.includes('school') || Boolean(schoolName && schoolCode);
  const isDeptDone = completedSteps.includes('department') || deptList.length > 0;
  const isProgDone = completedSteps.includes('programme') || progList.length > 0;
  const isLocalStorageDone = Boolean(localStorage.getItem(`director_setup_completed_${schoolId}`)) ||
                             Boolean(localStorage.getItem(`director_setup_completed_${user?.email}`));
  const isReviewDone = completedSteps.includes('review') || isLocalStorageDone || currentStep === 4 || (isSchoolDone && isDeptDone && isProgDone);

  const steps = [
    { number: 1, key: 'school', title: 'School Info', desc: isSchoolDone ? `${schoolCode || 'Configured'}` : 'Metadata & Director', icon: Building2, isDone: isSchoolDone },
    { number: 2, key: 'department', title: 'Departments & HODs', desc: isDeptDone ? `${deptList.length} Dept${deptList.length !== 1 ? 's' : ''}` : 'Depts & HODs', icon: Users, isDone: isDeptDone },
    { number: 3, key: 'programme', title: 'Programmes', desc: isProgDone ? `${progList.length} Prog${progList.length !== 1 ? 's' : ''}` : 'Degree mapping', icon: GraduationCap, isDone: isProgDone },
    { number: 4, key: 'review', title: 'Review & Activate', desc: isReviewDone ? 'Ready to finish' : 'Verify & finish', icon: CheckCircle2, isDone: isReviewDone },
  ];

  const completedCount = steps.filter((s) => s.isDone).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  const handleAddDeptInline = async () => {
    if (!newDeptName || !newDeptCode) return;
    const targetSchoolId = schoolId || 'sch-1';
    const matchedUser = hodUsers.find((u) => u.name === selectedHod);
    const hodNamePayload = selectedHod || '';
    const hodEmailPayload = matchedUser ? matchedUser.email : '';
    const deptPayload = {
      schoolId: targetSchoolId,
      name: newDeptName,
      code: newDeptCode.toUpperCase(),
      hod: hodNamePayload,
      hodEmail: hodEmailPayload,
      status: 'ACTIVE',
    };

    try {
      console.log('[DirectorSetupWorkflow] Saving department via POST endpoint:', deptPayload);
      const res = await saveDepartment(deptPayload);
      const savedDept = res?.data?.data || res?.data || deptPayload;
      setDeptList((prev) => [...prev, savedDept]);
      setNewDeptName('');
      setNewDeptCode('');
    } catch (err) {
      console.error('Failed to save department to backend:', err);
      const fallbackDept = { id: `dept-${Date.now()}`, ...deptPayload };
      setDeptList((prev) => [...prev, fallbackDept]);
      setNewDeptName('');
      setNewDeptCode('');
    }
  };

  const handleHodChange = (deptId, hodName) => {
    const matchedUser = hodUsers.find((u) => u.name === hodName);
    const matchedEmail = matchedUser ? matchedUser.email : `${hodName.toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in`;
    const updated = deptList.map((d) =>
      d.id === deptId
        ? { ...d, hod: hodName, hodEmail: matchedEmail }
        : d
    );
    setDeptList(updated);
  };

  const handleDeleteDeptInline = (deptId) => {
    const d = deptList.find((item) => item.id === deptId);
    triggerDeleteConfirm({
      title: 'Delete Department?',
      itemName: d ? `${d.name} (${d.code})` : '',
      description: 'This action cannot be undone. All data associated with this department will be removed.',
      onConfirm: async () => {
        try {
          await deleteDepartmentApi(deptId);
        } catch (err) {
          console.warn('Could not delete department from backend:', err);
        }
        const updated = deptList.filter((item) => item.id !== deptId);
        setDeptList(updated);
      },
    });
  };

  const handleDeleteProgInline = (progId) => {
    const p = progList.find((item) => item.id === progId);
    triggerDeleteConfirm({
      title: 'Delete Programme?',
      itemName: p ? `${p.name} (${p.code})` : '',
      description: 'This action cannot be undone. All data associated with this programme will be removed.',
      onConfirm: async () => {
        try {
          await deleteProgrammeApi(progId);
        } catch (err) {
          console.warn('Could not delete programme from backend:', err);
        }
        const updated = progList.filter((item) => item.id !== progId);
        setProgList(updated);
      },
    });
  };

  const handleAddProgrammeInline = async () => {
    if (!newProgName || !newProgCode) return;
    const deptObj = deptList.find((d) => d.id === selectedDeptIdForProg) || deptList[0];
    const progPayload = {
      departmentId: selectedDeptIdForProg || deptList[0]?.id || 'dept-1',
      departmentName: deptObj?.name || 'Department of Computer Science',
      code: newProgCode,
      name: newProgName,
      durationYears: parseInt(newProgDuration, 10) || 4,
      coordinator: '',
      coordinatorEmail: '',
      status: 'ACTIVE',
    };

    try {
      console.log('[DirectorSetupWorkflow] Saving programme via POST endpoint:', progPayload);
      const res = await saveProgramme(progPayload);
      const savedProg = res?.data?.data || res?.data || progPayload;
      setProgList((prev) => [...prev, savedProg]);
      setNewProgName('');
      setNewProgCode('');
    } catch (err) {
      console.error('Failed to save programme to backend:', err);
      const fallbackProg = { id: `prog-${Date.now()}`, ...progPayload };
      setProgList((prev) => [...prev, fallbackProg]);
      setNewProgName('');
      setNewProgCode('');
    }
  };

  const handleSaveSchoolStep = async () => {
    if (!schoolName.trim() || !schoolCode.trim()) {
      alert('Please fill in both School Name and School Code before continuing.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...(schoolId ? { id: schoolId } : {}),
        name: schoolName.trim(),
        code: schoolCode.trim().toUpperCase(),
        director: directorName.trim(),
        directorName: directorName.trim(),
        deanName: directorName.trim(),
        directorEmail: (directorEmail || user?.email || '').trim(),
        deanEmail: (directorEmail || user?.email || '').trim(),
        estYear: estYear,
        establishmentYear: estYear,
        status: 'ACTIVE',
      };
      console.log('[DirectorSetupWorkflow] Saving school info payload to backend:', payload);
      const response = await saveSchoolInfo(payload);
      const savedSchool = response?.data?.data || response?.data || payload;
      const finalSchoolId = savedSchool.id || schoolId || '';
      if (finalSchoolId) setSchoolId(finalSchoolId);

      // Save step & advance progress in backend database
      console.log('[DirectorSetupWorkflow] Advancing setup progress to step 2 for schoolId:', finalSchoolId);
      const progressRes = await updateDirectorSetupProgress(finalSchoolId, 2);
      const progressData = progressRes?.data?.data || progressRes?.data || progressRes;
      console.log('[DirectorSetupWorkflow] Progress response:', progressData);
      if (Array.isArray(progressData?.completedSteps)) {
        setCompletedSteps(progressData.completedSteps);
      } else {
        setCompletedSteps(['school']);
      }

      setSuccessMsg('School information saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to save school info to backend:', err);
      setCompletedSteps((prev) => [...new Set([...prev, 'school'])]);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDepartmentStep = async () => {
    try {
      setIsSaving(true);
      const targetId = schoolId || '';
      console.log('[DirectorSetupWorkflow] Advancing setup progress to step 3 for schoolId:', targetId);
      const progressRes = await updateDirectorSetupProgress(targetId, 3);
      const progressData = progressRes?.data?.data || progressRes?.data || progressRes;
      if (Array.isArray(progressData?.completedSteps)) {
        setCompletedSteps(progressData.completedSteps);
      } else {
        setCompletedSteps((prev) => [...new Set([...prev, 'school', 'department'])]);
      }
      setSuccessMsg('Department hierarchy and HOD allocations verified!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to update setup progress for department step:', err);
      setCompletedSteps((prev) => [...new Set([...prev, 'school', 'department'])]);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProgrammeStep = async () => {
    try {
      setIsSaving(true);
      const targetId = schoolId || '';
      console.log('[DirectorSetupWorkflow] Advancing setup progress to step 4 for schoolId:', targetId);
      const progressRes = await updateDirectorSetupProgress(targetId, 4);
      const progressData = progressRes?.data?.data || progressRes?.data || progressRes;
      if (Array.isArray(progressData?.completedSteps)) {
        setCompletedSteps(progressData.completedSteps);
      } else {
        setCompletedSteps((prev) => [...new Set([...prev, 'school', 'department', 'programme'])]);
      }
      setSuccessMsg('Degree programmes verified!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to update setup progress for programme step:', err);
      setCompletedSteps((prev) => [...new Set([...prev, 'school', 'department', 'programme'])]);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      await handleSaveSchoolStep();
    } else if (currentStep === 2) {
      await handleSaveDepartmentStep();
    } else if (currentStep === 3) {
      await handleSaveProgrammeStep();
    } else if (currentStep < 4) {
      changeStep(currentStep + 1);
    }
  };
  const handlePrevStep = () => {
    if (currentStep > 1) { changeStep(currentStep - 1); }
  };
  const handleFinishWorkflow = async () => {
    setCompletedSteps(['school', 'department', 'programme', 'review']);
    const targetId = schoolId || '';
    if (targetId) {
      localStorage.setItem(`director_setup_completed_${targetId}`, 'true');
    }
    if (user?.email) {
      localStorage.setItem(`director_setup_completed_${user.email}`, 'true');
    }
    try {
      setIsSaving(true);
      await updateDirectorSetupProgress(targetId, 4, user?.email || '');
      setSuccessMsg('🎉 Director Setup Workflow completed successfully! All school structure, departments, HODs, and programmes are saved.');
      setTimeout(() => navigate('/director/dashboard'), 600);
    } catch (err) {
      console.warn('Failed to finalise workflow progress:', err);
      navigate('/director/dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Shared style tokens ──────────────────────────────────────────────────
  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const muted = '#64748b';
  const ink = '#0f172a';
  const accent = '#4f46e5';
  const inputStyle = {
    height: '40px', fontSize: '13px', fontWeight: '500',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '0 12px', background: '#ffffff', color: ink,
    width: '100%', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color .15s ease',
  };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '5px', letterSpacing: '0.02em' };

  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>

      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Guided Workflow &nbsp;·&nbsp; Step {currentStep} of 4
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            School Structure Setup
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            {schoolName || '—'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentStep < 4 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNextStep}
              disabled={isSaving}
              style={{ fontSize: '12.5px', height: '36px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              {isSaving ? 'Saving...' : 'Save Step Changes'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFinishWorkflow}
              disabled={isSaving}
              style={{ fontSize: '12.5px', height: '36px', padding: '0 16px', background: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={14} /> Finish Workflow
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/director/dashboard')}
            style={{ fontSize: '12.5px', height: '36px', padding: '0 14px' }}
          >
            <X size={14} /> Exit
          </button>
        </div>
      </div>

      {/* ── STEPPER ───────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
          {/* connector line */}
          <div style={{ position: 'absolute', top: '18px', left: '12.5%', right: '12.5%', height: '1px', background: '#e2e8f0', zIndex: 0 }} />

          {steps.map((s) => {
            const done = s.isDone;
            const active = currentStep === s.number;
            const Icon = s.icon;
            return (
              <div
                key={s.number}
                onClick={() => changeStep(s.number)}
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


      {/* ── STEP CONTENT ──────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '24px', marginBottom: '20px' }}>

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>School Information</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>Set the school name, code, and Dean/Director details.</p>
            </div>

            {successMsg && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#16a34a', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                {successMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '700px' }}>
              <div>
                <label style={labelStyle}>School Name *</label>
                <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>School Code *</label>
                <input type="text" value={schoolCode} onChange={(e) => setSchoolCode(e.target.value)} style={{ ...inputStyle, fontWeight: '700', color: accent }} />
              </div>
              <div>
                <label style={labelStyle}>School Director Name *</label>
                <input type="text" value={directorName} onChange={(e) => setDirectorName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Director Email Address *</label>
                <input type="email" value={directorEmail} onChange={(e) => setDirectorEmail(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Establishment Year</label>
                <input type="text" value={estYear} onChange={(e) => setEstYear(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Departments & HOD Allocation</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>Create departments under <strong>{schoolCode}</strong> and assign Heads of Department.</p>
            </div>

            {/* Add dept row */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '10px' }}>Add Department</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ width: '120px' }}>
                  <label style={labelStyle}>Code *</label>
                  <input type="text" placeholder="e.g. CSE" value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <label style={labelStyle}>Department Name *</label>
                  <input type="text" placeholder="Dept of Computer Science" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ width: '210px' }}>
                  <label style={labelStyle}>Assign HOD</label>
                  <select
                    value={selectedHod}
                    onChange={(e) => {
                      const sel = e.target.value;
                      setSelectedHod(sel);
                      const matched = hodUsers.find((u) => (u.name || u.fullName || u.username) === sel);
                      if (matched?.email) setSelectedHodEmail(matched.email);
                    }}
                    style={selectStyle}
                  >
                    <option value="">-- Select HOD (Optional) --</option>
                    {hodUsers.length > 0
                      ? hodUsers.map((u) => {
                          const uId = u.id || u.email;
                          const uName = u.name || u.fullName || u.username || u.email;
                          const uEmail = u.email ? ` (${u.email})` : '';
                          return <option key={uId} value={uName}>{uName}{uEmail}</option>;
                        })
                      : <option value="" disabled>No HOD Users Found</option>}
                  </select>
                </div>
                <button
                  type="button" onClick={handleAddDeptInline}
                  disabled={!newDeptName || !newDeptCode}
                  style={{ height: '40px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: (!newDeptName || !newDeptCode) ? 0.5 : 1 }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '72px' }}>Code</th>
                  <th>Department Name</th>
                  <th style={{ width: '220px' }}>Head of Department</th>
                  <th style={{ width: '200px' }}>Email</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deptList.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: muted, padding: '24px', fontSize: '12.5px' }}>No departments yet — add one above.</td></tr>
                ) : (
                  deptList.map((dept) => {
                    const deptId = dept.id || dept.deptId;
                    const deptCode = dept.code || dept.deptCode;
                    const deptName = dept.name || dept.deptName;
                    const rawHod = dept.hod || dept.deptHodName;
                    const isAssigned = rawHod && rawHod !== 'Unassigned' && rawHod !== 'No HOD Added Yet';
                    const hodName = isAssigned ? rawHod : 'No HOD Added Yet';
                    const hodEmail = isAssigned ? (dept.hodEmail || dept.deptHodEmail || '—') : '—';
                    const initials = isAssigned ? rawHod.split(' ').map((n) => n[0]).join('').slice(0, 2) : '—';

                    return (
                      <tr key={deptId}>
                        <td style={{ fontWeight: '700', color: accent }}>{deptCode}</td>
                        <td style={{ fontWeight: '600', color: ink }}>{deptName}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: isAssigned ? '#eef2ff' : '#f1f5f9', color: isAssigned ? accent : '#64748b', display: 'grid', placeItems: 'center', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>
                              {initials}
                            </div>
                            <span style={{ fontSize: '12.5px', fontWeight: '600', color: isAssigned ? ink : '#64748b' }}>{hodName}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '12px', color: muted }}>
                          {hodEmail}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isAssigned ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                              <Check size={11} /> Assigned
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#64748b', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '2px 8px' }}>
                              <AlertCircle size={11} /> No HOD Added Yet
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditDept(dept)}
                              style={{ height: '32px', padding: '0 10px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #cbd5e1', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <UserCheck size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDeptInline(deptId)}
                              style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                              title="Delete Department"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}


        {/* STEP 3 */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Degree Programmes</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>Add degree programmes under a department. Programme Coordinators are assigned by the HOD.</p>
            </div>

            {/* Add programme row */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '10px' }}>Add Programme</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.6fr 0.8fr auto', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={labelStyle}>Department *</label>
                  <select value={selectedDeptIdForProg} onChange={(e) => setSelectedDeptIdForProg(e.target.value)} style={selectStyle}>
                    {deptList.map((d) => <option key={d.id} value={d.id}>{d.code} – {d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Code *</label>
                  <input type="text" placeholder="BE-AIML" value={newProgCode} onChange={(e) => setNewProgCode(e.target.value)} style={{ ...inputStyle, fontWeight: '600' }} />
                </div>
                <div>
                  <label style={labelStyle}>Programme Name *</label>
                  <input type="text" placeholder="B.Tech Artificial Intelligence & ML" value={newProgName} onChange={(e) => setNewProgName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Duration *</label>
                  <select value={newProgDuration} onChange={(e) => setNewProgDuration(e.target.value)} style={selectStyle}>
                    <option value={4}>4 Years</option>
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={1}>1 Year</option>
                  </select>
                </div>
                <button
                  type="button" onClick={handleAddProgrammeInline}
                  disabled={!newProgName || !newProgCode}
                  style={{ height: '40px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', opacity: (!newProgName || !newProgCode) ? 0.5 : 1 }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Programme cards */}
            {progList.length === 0 ? (
              <div style={{ textAlign: 'center', color: muted, fontSize: '12.5px', padding: '32px 0' }}>No programmes yet — add one above.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {progList.map((prog) => {
                  const deptObj = deptList.find((d) => d.id === prog.departmentId || d.name === prog.department) || deptList[0];
                  return (
                    <div key={prog.id} style={{ ...surface, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: accent, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '5px', padding: '2px 8px' }}>
                          {prog.code}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10.5px', color: muted }}>{deptObj?.code || '—'}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteProgInline(prog.id)}
                            style={{ width: '24px', height: '24px', borderRadius: '5px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                            title="Delete Programme"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: ink, marginBottom: '6px', lineHeight: '1.3' }}>{prog.name}</div>
                      <div style={{ fontSize: '11.5px', color: muted }}>{deptObj?.name || prog.department}</div>
                      <div style={{ fontSize: '11.5px', color: muted, marginTop: '4px' }}>
                        Coordinator: {prog.coordinator && prog.coordinator !== 'No coordinator assigned yet' && prog.coordinator !== 'Pending HOD Assignment' ? (
                          <span style={{ color: accent, fontWeight: '700', background: '#eef2ff', padding: '1px 6px', borderRadius: '4px' }}>
                            {prog.coordinator}
                          </span>
                        ) : (
                          <span style={{ color: '#d97706', fontWeight: '700', background: '#fffbeb', padding: '1px 6px', borderRadius: '4px' }}>
                            No coordinator assigned yet
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Review & Confirm</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>Verify the structure before saving and returning to the dashboard.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
              <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#15803d' }}>Setup Complete</div>
                <div style={{ fontSize: '12px', color: '#166534', marginTop: '2px' }}>
                  {deptList.length} department{deptList.length !== 1 ? 's' : ''} and {progList.length} programme{progList.length !== 1 ? 's' : ''} configured under {schoolName} ({schoolCode}).
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ ...surface, padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>School</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{schoolName}</div>
                <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>Code: <strong style={{ color: ink }}>{schoolCode}</strong></div>
                <div style={{ fontSize: '12px', color: muted, marginTop: '1px' }}>Director: <strong style={{ color: ink }}>{directorName}</strong></div>
                <div style={{ fontSize: '12px', color: muted, marginTop: '1px' }}>Email: <strong style={{ color: ink }}>{directorEmail}</strong></div>
                <div style={{ fontSize: '12px', color: muted, marginTop: '1px' }}>Est. {estYear}</div>
              </div>
              <div style={{ ...surface, padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Summary</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: ink }}>{deptList.length} <span style={{ fontSize: '13px', fontWeight: '600', color: muted }}>Departments</span></div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: ink, marginTop: '4px' }}>{progList.length} <span style={{ fontSize: '13px', fontWeight: '600', color: muted }}>Programmes</span></div>
                <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '6px', fontWeight: '600' }}>All HODs assigned · Coordinators pending HOD</div>
              </div>
            </div>
          </div>
        )}

      </div>{/* end step content */}


      {/* ── FOOTER NAV ────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              style={{ height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={14} /> Previous
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {steps.map((s) => (
              <div key={s.number} style={{ width: currentStep === s.number ? '16px' : '6px', height: '6px', borderRadius: '3px', background: currentStep === s.number ? accent : '#e2e8f0', transition: 'all .2s ease' }} />
            ))}
          </div>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSaving}
              style={{ height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: accent, color: '#ffffff', border: 'none', borderRadius: '8px', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', opacity: isSaving ? 0.7 : 1 }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save & Continue <ArrowRight size={14} />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishWorkflow}
              style={{ height: '40px', padding: '0 22px', fontSize: '13px', fontWeight: '700', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
            >
              <CheckCircle2 size={14} /> Finish & Go to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* ── EDIT DEPARTMENT MODAL ────────────────────────────────────────────── */}
      {showEditModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '480px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden', boxSizing: 'border-box' }}>

            {/* Modal header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: ink }}>
                  Edit Department
                </div>
                {editingDept && <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>{(editingDept.code || editingDept.deptCode)} · {(editingDept.name || editingDept.deptName)}</div>}
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center', color: muted }}>
                <X size={14} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSaveEditDept} style={{ padding: '20px', display: 'grid', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Department Name *</label>
                <input type="text" required placeholder="e.g. Dept of Computer Science" value={editDeptName} onChange={(e) => setEditDeptName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Department Code *</label>
                <input type="text" required placeholder="e.g. CSE" value={editDeptCode} onChange={(e) => setEditDeptCode(e.target.value)} style={{ ...inputStyle, fontWeight: '700', color: accent }} />
              </div>
              <div>
                <label style={labelStyle}>Assign HOD *</label>
                <select
                  value={editSelectedHod}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    setEditSelectedHod(selectedName);
                    const matchedUser = hodUsers.find((u) => (u.name || u.fullName || u.username) === selectedName);
                    if (matchedUser?.email) {
                      setEditHodEmail(matchedUser.email);
                    }
                  }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">-- Select HOD (Optional) --</option>
                  {hodUsers.length > 0
                    ? hodUsers.map((u) => {
                        const uId = u.id || u.email;
                        const uName = u.name || u.fullName || u.username || u.email;
                        const uEmail = u.email ? ` (${u.email})` : '';
                        return <option key={uId} value={uName}>{uName}{uEmail}</option>;
                      })
                    : <option value="" disabled>No HOD Users Found</option>}
                </select>
              </div>
              <div>
                <label style={labelStyle}>HOD Email</label>
                <input type="email" placeholder="hod@dypiu.ac.in" value={editHodEmail} onChange={(e) => setEditHodEmail(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ height: '38px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

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
