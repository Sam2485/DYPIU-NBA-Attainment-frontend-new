import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Users, GraduationCap, CheckCircle2, ArrowRight, ArrowLeft, Save, Check, Plus, X, Trash2 } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const STEPS = [
  { number: 1, title: 'School Info',     desc: 'Metadata & Dean allocation',      path: '/director/school-structure',     icon: Building2,     color: '#4f46e5', bg: '#eef2ff' },
  { number: 2, title: 'Departments',     desc: 'Department hierarchy & HODs',     path: '/director/department-management', icon: Users,         color: '#0284c7', bg: '#f0f9ff' },
  { number: 3, title: 'Programmes',      desc: 'Degree programmes & duration',    path: '/director/programme-overview',    icon: GraduationCap, color: '#7c3aed', bg: '#f5f3ff' },
  { number: 4, title: 'Review & Verify', desc: 'Audit structure & complete setup', path: '/director/reports',              icon: CheckCircle2,  color: '#059669', bg: '#f0fdf4' },
];

export default function DirectorSetupWorkflow() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    selectedSchool = null,
    selectedSchoolId = null,
    setSelectedSchoolId = () => {},
    user,
    loadSchools = async () => [],
    loadDepartments = async () => [],
    loadMasterProgrammes = async () => [],
    loadHods = async () => [],
    departments = [],
    addDepartment = () => {},
    updateDepartment = () => {},
    deleteDepartment = () => {},
    masterProgrammes = [],
    createMasterProgramme = () => {},
    deleteMasterProgramme = () => {},
    updateSchool = async () => null,
    directorWorkflowProgress = {},
    loadDirectorSetupProgress = () => Promise.resolve(null),
    markDirectorWorkflowStepComplete = () => {},
    hods = [],
  } = useAcademic();

  const activeFaculties = useMemo(
    () => hods.map((hod) => hod?.name || hod?.username || hod?.email).filter(Boolean),
    [hods]
  );

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

  // Step 1
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [deanName, setDeanName] = useState('');
  const [estYear, setEstYear] = useState('');

  // Step 2
  const [deptList, setDeptList] = useState(departments);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [selectedHod, setSelectedHod] = useState('');

  // Step 3
  const [progList, setProgList] = useState(masterProgrammes);
  const [selectedDeptIdForProg, setSelectedDeptIdForProg] = useState('');
  const [newProgName, setNewProgName] = useState('');
  const [newProgLevel, setNewProgLevel] = useState('UG');
  const [newProgDegreeAwarded, setNewProgDegreeAwarded] = useState('');
  const [newProgDuration, setNewProgDuration] = useState(4);

  useEffect(() => {
    if (!selectedSchool) return;
    setSchoolName(selectedSchool.name ?? '');
    setSchoolCode(selectedSchool.code ?? '');
    setDeanName(selectedSchool.dean ?? '');
    setEstYear(selectedSchool.estYear ?? '');
  }, [selectedSchool]);

  useEffect(() => {
    setDeptList(departments);
  }, [departments]);

  useEffect(() => {
    setProgList(masterProgrammes);
  }, [masterProgrammes]);

  useEffect(() => {
    setSelectedHod((current) => current || activeFaculties[0] || '');
  }, [activeFaculties]);

  useEffect(() => {
    setSelectedDeptIdForProg((current) => current || departments[0]?.id || '');
  }, [departments]);

  // ── Per-step completion flags ──────────────────────────────────────────────
  const safeProgress = directorWorkflowProgress ?? {};
  const stepDone = STEPS.map((s, idx) => {
    if (Array.isArray(safeProgress.stepStatus)) {
      return !!safeProgress.stepStatus[idx];
    }
    if (Array.isArray(safeProgress.completedSteps)) {
      return safeProgress.completedSteps.some((step) => Number(step) === s.number);
    }
    return !!safeProgress[s.number] || !!safeProgress[`step-${s.number}`];
  });

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

  useEffect(() => {
    loadDirectorSetupProgress(user?.schoolId).catch(() => {});
  }, [loadDirectorSetupProgress, user?.schoolId]);

  // Load only the data needed by the tab being viewed. A direct link to a
  // later step loads its required dependency data, but never preloads HODs or
  // programmes while the Director is still on School Info.
  useEffect(() => {
    let active = true;

    const loadCurrentStepData = async () => {
      let schoolId = user?.schoolId ?? selectedSchoolId;

      if (user?.schoolId && user.schoolId !== selectedSchoolId) {
        setSelectedSchoolId(user.schoolId);
      }

      if (currentStep === 1) {
        await loadSchools();
        return;
      }

      if (!schoolId) {
        const schools = await loadSchools();
        schoolId = schools[0]?.id ?? null;
        if (active && schoolId) setSelectedSchoolId(schoolId);
      }

      if (currentStep === 2) {
        await Promise.all([
          loadDepartments(schoolId),
          loadHods(),
        ]);
        return;
      }

      if (currentStep === 3) {
        await Promise.all([
          loadDepartments(schoolId),
          loadMasterProgrammes(),
        ]);
        return;
      }

      if (currentStep === 4) {
        await Promise.all([
          loadSchools(),
          loadDepartments(schoolId),
          loadMasterProgrammes(),
        ]);
      }
    };

    loadCurrentStepData().catch(() => {});
    return () => { active = false; };
  }, [
    currentStep,
    loadDepartments,
    loadHods,
    loadMasterProgrammes,
    loadSchools,
    user?.schoolId,
  ]);

  const goToStep = (n) => {
    setCurrentStep(n);
    setSearchParams({ step: n });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddDeptInline = async () => {
    if (!newDeptName || !newDeptCode || !selectedSchoolId || !selectedHod) return;
    const selectedHodUser = hods.find(
      (hod) => (hod?.name || hod?.username || hod?.email) === selectedHod
    );
    const newDept = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      code: newDeptCode.toUpperCase(),
      schoolId: selectedSchoolId,
      hod: selectedHod,
      hodEmail: selectedHodUser?.email ?? '',
      status: 'ACTIVE',
    };
    const savedDepartment = await addDepartment(newDept);
    if (savedDepartment) {
      setNewDeptName('');
      setNewDeptCode('');
    }
  };

  const handleHodChange = async (deptId, hodName) => {
    const department = deptList.find((item) => item.id === deptId);
    const selectedHodUser = hods.find(
      (hod) => (hod?.name || hod?.username || hod?.email) === hodName
    );
    if (!department || !selectedHodUser) return;

    await updateDepartment(deptId, {
      name: department.name,
      code: department.code,
      schoolId: department.schoolId,
      hod: hodName,
      hodEmail: selectedHodUser.email ?? '',
      status: department.status ?? 'ACTIVE',
    });
  };

  const handleDeleteDeptInline = (deptId) => {
    const d = deptList.find((item) => item.id === deptId);
    triggerDeleteConfirm({
      title: 'Delete Department?',
      itemName: d ? `${d.name} (${d.code})` : '',
      description: 'This action cannot be undone. All data associated with this department will be removed.',
      onConfirm: () => {
        const updated = deptList.filter((item) => item.id !== deptId);
        setDeptList(updated);
        deleteDepartment(deptId);
      },
    });
  };

  const handleDeleteProgInline = (progId) => {
    const p = progList.find((item) => item.id === progId);
    triggerDeleteConfirm({
      title: 'Delete Programme?',
      itemName: p ? `${p.name} (${p.code})` : '',
      description: 'This action cannot be undone. All data associated with this programme will be removed.',
      onConfirm: () => {
        deleteMasterProgramme(progId);
      },
    });
  };

  const handleAddProgrammeInline = async () => {
    if (!newProgName || !newProgDegreeAwarded || !selectedDeptIdForProg) return;
    const programmeName = newProgName.trim();
    const newProg = {
      degreeAwarded: newProgDegreeAwarded.trim(),
      name: programmeName,
      departmentId: selectedDeptIdForProg,
      level: newProgLevel,
      durationYears: parseInt(newProgDuration, 10) || 4,
      coordinator: '',
      coordinatorEmail: '',
      status: 'ACTIVE',
    };
    const savedProgramme = await createMasterProgramme(newProg);
    if (savedProgramme) {
      setNewProgName('');
      setNewProgDegreeAwarded('');
      setNewProgLevel('UG');
    }
  };

  const handleSaveAndNext = async () => {
    if (currentStep === 1) {
      if (!selectedSchool?.id) return;
      await updateSchool(selectedSchool.id, {
        name: schoolName,
        code: schoolCode.toUpperCase(),
        dean: deanName,
        estYear: estYear.trim(),
        deanEmail: selectedSchool.deanEmail ?? '',
        directorName: selectedSchool.director ?? '',
        directorEmail: selectedSchool.directorEmail ?? '',
        status: selectedSchool.status ?? 'ACTIVE',
      });
    }
    await markDirectorWorkflowStepComplete(currentStep);
    if (currentStep < STEPS.length) {
      goToStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleFinishWorkflow = async () => {
    await markDirectorWorkflowStepComplete(STEPS.length);
    navigate('/director/dashboard');
  };

  const currentStepMeta = STEPS[currentStep - 1] || STEPS[0];

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
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            {currentStepMeta.title}
          </h2>
        </div>
        <button
          onClick={() => navigate('/director/dashboard')}
          style={{
            height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '600',
            background: '#f8fafc', color: ink, border: '1px solid #e2e8f0',
            borderRadius: '8px', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
            flexShrink: 0, marginLeft: 'auto',
          }}
        >
          <X size={14} /> Exit
        </button>
      </div>

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


      {/* ── STEP CONTENT ──────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '24px', marginBottom: '20px' }}>
        <ErrorBoundary
          fallbackTitle={`Step ${currentStep} Error (${currentStepMeta.title})`}
          fallbackMessage={`An error occurred while rendering ${currentStepMeta.title}. You can retry or navigate to another step.`}
        >

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>School Information</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>Set the school name, code, and Dean/Director details.</p>
            </div>

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
                <label style={labelStyle}>Dean / School Director *</label>
                <input type="text" value={deanName} onChange={(e) => setDeanName(e.target.value)} style={inputStyle} />
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
                  <select value={selectedHod} onChange={(e) => setSelectedHod(e.target.value)} style={selectStyle}>
                    {activeFaculties.map((f) => <option key={f} value={f}>{f}</option>)}
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
                  <th style={{ width: '80px' }}>Code</th>
                  <th>Department Name</th>
                  <th style={{ width: '260px' }}>Head of Department</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deptList.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: muted, padding: '24px', fontSize: '12.5px' }}>No departments yet — add one above.</td></tr>
                )}
                {deptList.map((dept) => (
                  <tr key={dept.id}>
                    <td style={{ fontWeight: '700', color: accent }}>{dept.code}</td>
                    <td style={{ fontWeight: '600', color: ink }}>{dept.name}</td>
                    <td>
                      <select value={dept.hod} onChange={(e) => handleHodChange(dept.id, e.target.value)} style={{ ...selectStyle, height: '34px', fontSize: '12px' }}>
                        {activeFaculties.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '2px 8px' }}>
                        <Check size={11} /> Assigned
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteDeptInline(dept.id)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                        title="Delete Department"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.55fr 0.9fr 1.55fr 0.7fr auto', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={labelStyle}>Department *</label>
                  <select value={selectedDeptIdForProg} onChange={(e) => setSelectedDeptIdForProg(e.target.value)} style={selectStyle}>
                    {deptList.map((d) => <option key={d.id} value={d.id}>{d.code} – {d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Level *</label>
                  <select value={newProgLevel} onChange={(e) => setNewProgLevel(e.target.value)} style={selectStyle}>
                    <option value="UG">UG</option>
                    <option value="PG">PG</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Degree Awarded *</label>
                  <input type="text" placeholder="B.Tech" value={newProgDegreeAwarded} onChange={(e) => setNewProgDegreeAwarded(e.target.value)} style={inputStyle} />
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
                  disabled={!newProgName || !newProgDegreeAwarded}
                  style={{ height: '40px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', opacity: (!newProgName || !newProgDegreeAwarded) ? 0.5 : 1 }}
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
                <div style={{ fontSize: '12px', color: muted, marginTop: '1px' }}>Dean: <strong style={{ color: ink }}>{deanName}</strong></div>
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

        </ErrorBoundary>
      </div>{/* end step content */}


      {/* ── FOOTER NAV ────────────────────────────────────────────────────────── */}
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
              onClick={handleFinishWorkflow}
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
