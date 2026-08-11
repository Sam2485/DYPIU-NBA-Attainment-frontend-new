import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, GraduationCap, CheckCircle2, ArrowRight, ArrowLeft, Save, Check, Plus, X } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';

export default function DirectorSetupWorkflow() {
  const navigate = useNavigate();
  const {
    selectedSchool = { name: 'School of Engineering & Technology', code: 'SET', dean: 'Dr. R. K. Deshmukh', estYear: '2019' },
    departments = [],
    addDepartment = () => {},
    updateDepartment = () => {},
    masterProgrammes = [],
    addProgramme = () => {},
    updateSchoolInfo = () => {},
  } = useAcademic();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1
  const [schoolName, setSchoolName] = useState(selectedSchool.name);
  const [schoolCode, setSchoolCode] = useState(selectedSchool.code);
  const [deanName, setDeanName] = useState(selectedSchool.dean);
  const [estYear, setEstYear] = useState(selectedSchool.estYear || '2019');

  // Step 2
  const [deptList, setDeptList] = useState(departments);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [selectedHod, setSelectedHod] = useState(MASTER_FACULTY_LIST[0] || 'Dr. Raj Shaikh');

  // Step 3
  const [progList, setProgList] = useState(masterProgrammes);
  const [selectedDeptIdForProg, setSelectedDeptIdForProg] = useState(departments[0]?.id || 'dept-1');
  const [newProgName, setNewProgName] = useState('');
  const [newProgCode, setNewProgCode] = useState('');

  const [newProgDuration, setNewProgDuration] = useState(4);
  // coordinator is intentionally NOT set here — HOD assigns it later

  const steps = [
    { number: 1, title: 'School Info', desc: 'Metadata & Dean', icon: Building2 },
    { number: 2, title: 'Departments', desc: 'Depts & HODs', icon: Users },
    { number: 3, title: 'Programmes', desc: 'Degree mapping', icon: GraduationCap },
    { number: 4, title: 'Review', desc: 'Verify & finish', icon: CheckCircle2 },
  ];

  const handleAddDeptInline = () => {
    if (!newDeptName || !newDeptCode) return;
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
  };

  const handleHodChange = (deptId, hodName) => {
    const updated = deptList.map((d) =>
      d.id === deptId
        ? { ...d, hod: hodName, hodEmail: `${hodName.toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in` }
        : d
    );
    setDeptList(updated);
    updateDepartment(deptId, { hod: hodName });
  };

  const handleAddProgrammeInline = () => {
    if (!newProgName || !newProgCode) return;
    const deptObj = deptList.find((d) => d.id === selectedDeptIdForProg) || deptList[0];
    const newProg = {
      id: `prog-${Date.now()}`,
      code: newProgCode,
      name: newProgName,
      durationYears: parseInt(newProgDuration, 10) || 4,
      departmentId: selectedDeptIdForProg,
      department: deptObj?.name || 'Department of Computer Science',
      coordinator: '',
    };
    setProgList([...progList, newProg]);
    addProgramme(newProg);
    setNewProgName('');
    setNewProgCode('');
  };

  const handleNextStep = () => {
    if (currentStep < 4) { setCurrentStep((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  const handlePrevStep = () => {
    if (currentStep > 1) { setCurrentStep((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  const handleFinishWorkflow = () => navigate('/director/dashboard');

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
            {schoolName || selectedSchool.name}
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/director/dashboard')}
          style={{ fontSize: '12.5px', height: '36px', padding: '0 14px' }}
        >
          <X size={14} /> Exit
        </button>
      </div>

      {/* ── STEPPER ───────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
          {/* connector line */}
          <div style={{ position: 'absolute', top: '18px', left: '12.5%', right: '12.5%', height: '1px', background: '#e2e8f0', zIndex: 0 }} />

          {steps.map((s) => {
            const done = currentStep > s.number;
            const active = currentStep === s.number;
            const Icon = s.icon;
            return (
              <div
                key={s.number}
                onClick={() => setCurrentStep(s.number)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative', zIndex: 1, opacity: currentStep >= s.number ? 1 : 0.45, transition: 'opacity .2s' }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: done ? '#f0fdf4' : active ? '#eef2ff' : '#f8fafc',
                  border: `1.5px solid ${done ? '#86efac' : active ? '#a5b4fc' : '#e2e8f0'}`,
                  color: done ? '#16a34a' : active ? accent : muted,
                  display: 'grid', placeItems: 'center', marginBottom: '8px',
                  transition: 'all .2s ease',
                }}>
                  {done ? <Check size={15} /> : <Icon size={15} />}
                </div>
                <div style={{ fontSize: '12px', fontWeight: active ? '700' : '600', color: active ? ink : muted, textAlign: 'center' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8', textAlign: 'center', marginTop: '1px' }}>
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
                    {MASTER_FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
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
                </tr>
              </thead>
              <tbody>
                {deptList.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: muted, padding: '24px', fontSize: '12.5px' }}>No departments yet — add one above.</td></tr>
                )}
                {deptList.map((dept) => (
                  <tr key={dept.id}>
                    <td style={{ fontWeight: '700', color: accent }}>{dept.code}</td>
                    <td style={{ fontWeight: '600', color: ink }}>{dept.name}</td>
                    <td>
                      <select value={dept.hod} onChange={(e) => handleHodChange(dept.id, e.target.value)} style={{ ...selectStyle, height: '34px', fontSize: '12px' }}>
                        {MASTER_FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '2px 8px' }}>
                        <Check size={11} /> Assigned
                      </span>
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
                        <span style={{ fontSize: '10.5px', color: muted }}>{deptObj?.code || '—'}</span>
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
              style={{ height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: accent, color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
            >
              <Save size={14} /> Save & Continue <ArrowRight size={14} />
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

    </div>
  );
}
