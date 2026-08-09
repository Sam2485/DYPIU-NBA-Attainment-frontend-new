import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, GraduationCap, CheckCircle2, ArrowRight, ArrowLeft, Save, Sparkles, Layers, Check, Plus } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';

export default function DirectorSetupWorkflow() {
  const navigate = useNavigate();
  const {
    selectedSchool = { name: 'School of Engineering & Technology', code: 'SET', dean: 'Dr. R. K. Deshmukh', estYear: '2019' },
    departments = [],
    addDepartment = () => {},
    updateDepartment = () => {},
    masterProgrammes = [],
  } = useAcademic();

  // Active Step State (4 Steps Total)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 Form State (School Info)
  const [schoolName, setSchoolName] = useState(selectedSchool.name);
  const [schoolCode, setSchoolCode] = useState(selectedSchool.code);
  const [deanName, setDeanName] = useState(selectedSchool.dean);
  const [estYear, setEstYear] = useState(selectedSchool.estYear || '2019');

  // Step 2 Form State (Department Add / Assign HOD)
  const [deptList, setDeptList] = useState(departments);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [selectedHod, setSelectedHod] = useState(MASTER_FACULTY_LIST[0] || 'Dr. Raj Shaikh');

  // Step 3 Form State (Programme Add under Department)
  const [progList, setProgList] = useState(masterProgrammes);
  const [selectedDeptIdForProg, setSelectedDeptIdForProg] = useState(departments[0]?.id || 'dept-1');
  const [newProgName, setNewProgName] = useState('');
  const [newProgCode, setNewProgCode] = useState('');
  const [selectedProgCoordinator, setSelectedProgCoordinator] = useState(MASTER_FACULTY_LIST[0] || 'Dr. Raj Shaikh');

  // Workflow Steps Config (4 Steps - Approval & Visibility Removed as requested)
  const steps = [
    { number: 1, title: 'School Info', desc: 'School metadata & Dean' },
    { number: 2, title: 'Departments & HODs', desc: 'Add depts & assign HODs' },
    { number: 3, title: 'Programmes & Coordinators', desc: 'Add degree programmes' },
    { number: 4, title: 'Final Review & Finish', desc: 'Verify & return to dashboard' },
  ];

  // Step 2 Handler: Add Department Inline
  const handleAddDeptInline = () => {
    if (!newDeptName || !newDeptCode) {
      alert('Please enter Department Name and Department Code.');
      return;
    }
    const newDept = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      code: newDeptCode,
      hod: selectedHod,
      hodEmail: `${selectedHod.toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in`,
    };
    const updated = [...deptList, newDept];
    setDeptList(updated);
    addDepartment(newDept);
    setNewDeptName('');
    setNewDeptCode('');
    alert(`🎉 Department ${newDeptCode} created and HOD ${selectedHod} assigned!`);
  };

  const handleHodChange = (deptId, hodName) => {
    const updated = deptList.map((d) =>
      d.id === deptId
        ? {
            ...d,
            hod: hodName,
            hodEmail: `${hodName.toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in`,
          }
        : d
    );
    setDeptList(updated);
    updateDepartment(deptId, { hod: hodName });
  };

  // Step 3 Handler: Add Programme under Selected Department
  const handleAddProgrammeInline = () => {
    if (!newProgName || !newProgCode) {
      alert('Please enter Programme Name and Programme Code.');
      return;
    }
    const deptObj = deptList.find((d) => d.id === selectedDeptIdForProg) || deptList[0];
    const newProg = {
      id: `prog-${Date.now()}`,
      code: newProgCode,
      name: newProgName,
      departmentId: selectedDeptIdForProg,
      department: deptObj?.name || 'Department of Computer Science',
      coordinator: selectedProgCoordinator,
    };
    setProgList([...progList, newProg]);
    setNewProgName('');
    setNewProgCode('');
    alert(`🎉 New Degree Programme ${newProgCode} (${newProgName}) added under ${deptObj?.name || 'selected department'}!`);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinishWorkflow = () => {
    alert('🎉 School Structure & HOD Allocation Workflow completed successfully!');
    navigate('/director/dashboard');
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>
      {/* ── TOP HEADER BANNER ───────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          border: '1.5px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px' }}>
              DIRECTOR GUIDED WORKFLOW • STEP {currentStep} OF 4
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '900' }}>
            Create School Structure & Assign HODs
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
            Guided setup process for {schoolName || selectedSchool.name}
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/director/dashboard')}
          style={{ height: '38px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700' }}
        >
          Exit Workflow
        </button>
      </div>

      {/* ── STEPPER PROGRESS BAR (4 STEPS) ────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', position: 'relative' }}>
          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <div
                key={s.number}
                onClick={() => setCurrentStep(s.number)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textCenter: 'center',
                  cursor: 'pointer',
                  opacity: currentStep >= s.number ? 1 : 0.6,
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isCompleted ? '#10b981' : isCurrent ? '#4f46e5' : '#f1f5f9',
                    color: isCompleted || isCurrent ? '#ffffff' : '#64748b',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: '900',
                    fontSize: '14px',
                    marginBottom: '8px',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(79,70,229,0.2)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCompleted ? <Check size={18} /> : s.number}
                </div>

                <div style={{ fontWeight: isCurrent ? '800' : '700', fontSize: '12.5px', color: isCurrent ? '#4f46e5' : '#0f172a', textAlign: 'center' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b', textAlign: 'center', marginTop: '2px' }}>
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP CONTENT AREA ──────────────────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
        {/* STEP 1: SCHOOL INFORMATION */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Step 1: School Information & Metadata
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Configure primary school information, code, and Dean/Director leadership allocation.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '800px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                  School Name *
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="form-input"
                  style={{ height: '42px', fontSize: '13px', fontWeight: '600' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                  School Code *
                </label>
                <input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="form-input"
                  style={{ height: '42px', fontSize: '13px', fontWeight: '800', color: '#4f46e5' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                  Dean / School Director Name *
                </label>
                <input
                  type="text"
                  value={deanName}
                  onChange={(e) => setDeanName(e.target.value)}
                  className="form-input"
                  style={{ height: '42px', fontSize: '13px', fontWeight: '700' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                  Establishment Year
                </label>
                <input
                  type="text"
                  value={estYear}
                  onChange={(e) => setEstYear(e.target.value)}
                  className="form-input"
                  style={{ height: '42px', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DEPARTMENT MANAGEMENT & HOD ALLOCATION */}
        {currentStep === 2 && (
          <div>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Step 2: Department Management & HOD Allocation
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Create academic departments under {schoolCode} and assign senior faculty as Heads of Departments (HODs).
              </p>
            </div>

            {/* Quick Add Department Bar */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                + Add New Academic Department
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Dept Code (e.g. CSE)"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  className="form-input"
                  style={{ width: '140px', height: '38px', fontSize: '12.5px', fontWeight: '800' }}
                />
                <input
                  type="text"
                  placeholder="Department Name (e.g. Dept of Computer Science)"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, minWidth: '240px', height: '38px', fontSize: '12.5px' }}
                />
                <select
                  value={selectedHod}
                  onChange={(e) => setSelectedHod(e.target.value)}
                  className="form-input"
                  style={{ width: '220px', height: '38px', fontSize: '12.5px', fontWeight: '700' }}
                >
                  {MASTER_FACULTY_LIST.map((fac) => (
                    <option key={fac} value={fac}>{fac} (Assign HOD)</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddDeptInline}
                  style={{ height: '38px', padding: '0 18px', fontSize: '12.5px', fontWeight: '800' }}
                >
                  Add Department
                </button>
              </div>
            </div>

            {/* Departments Table */}
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Code</th>
                  <th>Department Name</th>
                  <th style={{ width: '280px' }}>Assign Head of Department (HOD)</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {deptList.map((dept) => (
                  <tr key={dept.id}>
                    <td style={{ textAlign: 'center', fontWeight: '900', color: '#4f46e5' }}>{dept.code}</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{dept.name}</td>
                    <td>
                      <select
                        value={dept.hod}
                        onChange={(e) => handleHodChange(dept.id, e.target.value)}
                        className="form-input"
                        style={{ height: '36px', fontSize: '12.5px', fontWeight: '700', color: '#4f46e5' }}
                      >
                        {MASTER_FACULTY_LIST.map((fac) => (
                          <option key={fac} value={fac}>{fac}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '11px' }}>
                        ✓ HOD Assigned
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STEP 3: PROGRAMME OVERVIEW & ADD PROGRAMME BY CHOOSING DEPARTMENT */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Step 3: Degree Programmes & Department Mapping
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Add degree programmes by selecting a department and assign programme coordinators.
              </p>
            </div>

            {/* INLINE FORM: ADD PROGRAMME BY CHOOSING DEPARTMENT */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} style={{ color: '#4f46e5' }} />
                Add New Degree Programme under Department
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr 1.5fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '11.5px', marginBottom: '4px', display: 'block' }}>
                    Select Department *
                  </label>
                  <select
                    value={selectedDeptIdForProg}
                    onChange={(e) => setSelectedDeptIdForProg(e.target.value)}
                    className="form-input"
                    style={{ height: '38px', fontSize: '12.5px', fontWeight: '700', color: '#4f46e5' }}
                  >
                    {deptList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '11.5px', marginBottom: '4px', display: 'block' }}>
                    Programme Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BE-AIML"
                    value={newProgCode}
                    onChange={(e) => setNewProgCode(e.target.value)}
                    className="form-input"
                    style={{ height: '38px', fontSize: '12.5px', fontWeight: '800' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '11.5px', marginBottom: '4px', display: 'block' }}>
                    Programme Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Artificial Intelligence & ML"
                    value={newProgName}
                    onChange={(e) => setNewProgName(e.target.value)}
                    className="form-input"
                    style={{ height: '38px', fontSize: '12.5px' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '11.5px', marginBottom: '4px', display: 'block' }}>
                    Programme Coordinator
                  </label>
                  <select
                    value={selectedProgCoordinator}
                    onChange={(e) => setSelectedProgCoordinator(e.target.value)}
                    className="form-input"
                    style={{ height: '38px', fontSize: '12.5px', fontWeight: '700' }}
                  >
                    {MASTER_FACULTY_LIST.map((fac) => (
                      <option key={fac} value={fac}>{fac}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddProgrammeInline}
                  style={{ height: '38px', padding: '0 18px', fontSize: '12.5px', fontWeight: '800', whiteSpace: 'nowrap' }}
                >
                  + Add Programme
                </button>
              </div>
            </div>

            {/* Mapped Programmes Cards List */}
            <div className="grid-cards-2" style={{ gap: '16px' }}>
              {progList.map((prog) => {
                const deptObj = deptList.find((d) => d.id === prog.departmentId || d.name === prog.department) || deptList[0];

                return (
                  <div key={prog.id} style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800' }}>
                        {prog.code}
                      </span>
                      <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '11px' }}>
                        ✓ Mapped under {deptObj?.code || 'Dept'}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
                      {prog.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Department: <strong style={{ color: '#0f172a' }}>{deptObj?.name || prog.department}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Programme Coordinator: <strong style={{ color: '#4f46e5' }}>{prog.coordinator || 'Dr. A. K. Sharma'}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: FINAL REVIEW & FINISH */}
        {currentStep === 4 && (
          <div>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Step 4: Final Review & Structure Verification
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Review the complete school structure configuration before saving and returning to the dashboard.
              </p>
            </div>

            <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', padding: '18px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={24} style={{ color: '#10b981' }} />
              <div>
                <strong style={{ fontSize: '14px', color: '#15803d' }}>
                  ✓ School Structure, HODs & Programmes Configured!
                </strong>
                <div style={{ fontSize: '12.5px', color: '#166534', marginTop: '2px' }}>
                  {deptList.length} departments and {progList.length} degree programmes created under {schoolName} ({schoolCode}).
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>School Information</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{schoolName} ({schoolCode})</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Dean / Director: {deanName}</div>
              </div>

              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Departments & Degree Programmes</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#4f46e5', marginTop: '4px' }}>{deptList.length} Departments • {progList.length} Programmes</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>All HODs & Coordinators Assigned</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── WORKFLOW ACTION FOOTER (PREVIOUS ON EXTREME LEFT, SAVE & CONTINUE ON RIGHT WITH WHITE TEXT) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          background: '#ffffff',
          padding: '16px 24px',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        {/* EXTREME LEFT: PREVIOUS BUTTON (RENAMED FROM BACK) */}
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevStep}
              style={{
                height: '42px',
                padding: '0 22px',
                fontSize: '13px',
                fontWeight: '700',
                gap: '8px',
                color: '#0f172a',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <ArrowLeft size={16} /> Previous
            </button>
          )}
        </div>

        {/* EXTREME RIGHT: SAVE & CONTINUE / FINISH BUTTON WITH WHITE TEXT */}
        <div>
          {currentStep < 4 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNextStep}
              style={{
                height: '44px',
                padding: '0 26px',
                fontSize: '13.5px',
                fontWeight: '800',
                gap: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 8px 20px rgba(79,70,229,0.3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Save size={16} style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>Save & Continue to Next Task</span>
              <ArrowRight size={16} style={{ color: '#ffffff' }} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFinishWorkflow}
              style={{
                height: '46px',
                padding: '0 28px',
                fontSize: '14px',
                fontWeight: '900',
                gap: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 8px 20px rgba(16,185,129,0.3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Sparkles size={18} style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>Finish & Return to Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
