import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Layers, Users, CheckCircle2, ArrowRight, ArrowLeft, Save, Check, Plus, BookOpen, Trash2, X, AlertCircle, ChevronDown } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';

export default function HodSetupWorkflow() {
  const navigate = useNavigate();
  const {
    masterProgrammes = [],
    programmeId,
    setProgrammeId,
    batches = [],
    batchId,
    setBatchId,
    addBatch = () => {},
    activePOs = [],
    activePSOs = [],
    activePEOs = [],
    updateProgrammePOs = () => {},
    updateProgrammePSOs = () => {},
    updateProgrammePEOs = () => {},
    courses = [],
    assignCourseCoordinator = () => {},
    addCourse = () => {},
    deleteCourse = () => {},
  } = useAcademic();

  const [currentStep, setCurrentStep] = useState(1);
  const selectedProgramme = masterProgrammes.find((p) => p.id === programmeId) || masterProgrammes[0] || { id: 'prog-1', name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  // Step 1
  const [startYearInput, setStartYearInput] = useState('2025');
  const [endYearInput, setEndYearInput] = useState('2029');
  const [batchValidationError, setBatchValidationError] = useState('');

  // Step 2
  const [outcomeTab, setOutcomeTab] = useState('PO');
  const [poList, setPoList] = useState(() => activePOs.map((po) => ({ ...po, competencies: po.competencies || [{ id: `comp-${po.code}-1`, order: 1, statement: `Demonstrate fundamental competence for ${po.code}` }] })));
  const [psoList, setPsoList] = useState(() => activePSOs.map((pso) => ({ ...pso, competencies: pso.competencies || [{ id: `psocomp-${pso.code}-1`, order: 1, statement: `Demonstrate specialized competency for ${pso.code}` }] })));
  const [peoList, setPeoList] = useState(() => activePEOs.map((peo) => ({ ...peo })));

  // Step 3
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSem, setNewCourseSem] = useState('Sem V');

  const steps = [
    { number: 1, title: 'Batch Setup',       desc: 'Initialize batch year',          icon: Calendar },
    { number: 2, title: 'PO / PSO / PEO',    desc: 'Outcomes & competencies',        icon: Layers },
    { number: 3, title: 'Courses',            desc: 'Add courses & coordinators',     icon: BookOpen },
    { number: 4, title: 'Review',             desc: 'Verify & finish',                icon: CheckCircle2 },
  ];

  const durationYears = selectedProgramme?.durationYears || 4;

  // ── Handlers (logic unchanged) ───────────────────────────────────────────────
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

  const handleCreateBatch = (e) => {
    e.preventDefault();
    const s = parseInt(startYearInput, 10), en = parseInt(endYearInput, 10);
    if (!s || s <= 2020 || !en || en <= s) return;
    const startAY = `${s}-${String(s + 1).slice(-2)}`, endAY = `${en - 1}-${String(en).slice(-2)}`;
    const nb = { id: `batch-${selectedProgramme.code.toLowerCase()}-${s}-${String(en).slice(-2)}`, programmeId, programmeName: selectedProgramme.name, programmeCode: selectedProgramme.code, name: `Batch ${s}-${String(en).slice(-2)} (${selectedProgramme.code}) — AY ${startAY} to ${endAY}`, startYear: startAY, endYear: endAY, status: 'INITIALIZED' };
    addBatch(nb); setBatchId(nb.id);
  };

  const handleAddPO = () => { const n = poList.length + 1; const np = { code: `PO${n}`, statement: `New Programme Outcome ${n}...`, status: 'VERIFIED', competencies: [{ id: `comp-PO${n}-1`, order: 1, statement: `Competency 1 for PO${n}` }] }; const u = [...poList, np]; setPoList(u); updateProgrammePOs(programmeId, u); };
  const handleUpdatePOCode = (i, v) => { const u = poList.map((p, idx) => idx === i ? { ...p, code: v } : p); setPoList(u); updateProgrammePOs(programmeId, u); };
  const handleUpdatePOStatement = (i, v) => { const u = poList.map((p, idx) => idx === i ? { ...p, statement: v } : p); setPoList(u); updateProgrammePOs(programmeId, u); };
  const handleDeletePO = (i) => { const u = poList.filter((_, idx) => idx !== i); setPoList(u); updateProgrammePOs(programmeId, u); };
  const handleAddPOCompetency = (pi) => { const u = poList.map((p, i) => { if (i !== pi) return p; const comps = p.competencies || []; const n = comps.length + 1; return { ...p, competencies: [...comps, { id: `comp-${p.code}-${n}`, order: n, statement: `Competency ${n} for ${p.code}` }] }; }); setPoList(u); updateProgrammePOs(programmeId, u); };
  const handleUpdatePOCompetency = (pi, ci, v) => { const u = poList.map((p, i) => { if (i !== pi) return p; const comps = [...(p.competencies || [])]; comps[ci] = { ...comps[ci], statement: v }; return { ...p, competencies: comps }; }); setPoList(u); updateProgrammePOs(programmeId, u); };
  const handleDeletePOCompetency = (pi, ci) => { const u = poList.map((p, i) => { if (i !== pi) return p; const comps = (p.competencies || []).filter((_, c) => c !== ci).map((c, idx) => ({ ...c, order: idx + 1 })); return { ...p, competencies: comps }; }); setPoList(u); updateProgrammePOs(programmeId, u); };

  const handleAddPSO = () => { const n = psoList.length + 1; const np = { code: `PSO${n}`, statement: `New Programme Specific Outcome ${n}...`, competencies: [{ id: `psocomp-PSO${n}-1`, order: 1, statement: `Competency 1 for PSO${n}` }] }; const u = [...psoList, np]; setPsoList(u); updateProgrammePSOs(programmeId, u); };
  const handleUpdatePSOCode = (i, v) => { const u = psoList.map((p, idx) => idx === i ? { ...p, code: v } : p); setPsoList(u); updateProgrammePSOs(programmeId, u); };
  const handleUpdatePSOStatement = (i, v) => { const u = psoList.map((p, idx) => idx === i ? { ...p, statement: v } : p); setPsoList(u); updateProgrammePSOs(programmeId, u); };
  const handleDeletePSO = (i) => { const u = psoList.filter((_, idx) => idx !== i); setPsoList(u); updateProgrammePSOs(programmeId, u); };
  const handleAddPSOCompetency = (pi) => { const u = psoList.map((p, i) => { if (i !== pi) return p; const comps = p.competencies || []; const n = comps.length + 1; return { ...p, competencies: [...comps, { id: `psocomp-${p.code}-${n}`, order: n, statement: `Competency ${n} for ${p.code}` }] }; }); setPsoList(u); updateProgrammePSOs(programmeId, u); };
  const handleUpdatePSOCompetency = (pi, ci, v) => { const u = psoList.map((p, i) => { if (i !== pi) return p; const comps = [...(p.competencies || [])]; comps[ci] = { ...comps[ci], statement: v }; return { ...p, competencies: comps }; }); setPsoList(u); updateProgrammePSOs(programmeId, u); };
  const handleDeletePSOCompetency = (pi, ci) => { const u = psoList.map((p, i) => { if (i !== pi) return p; const comps = (p.competencies || []).filter((_, c) => c !== ci).map((c, idx) => ({ ...c, order: idx + 1 })); return { ...p, competencies: comps }; }); setPsoList(u); updateProgrammePSOs(programmeId, u); };

  const handleAddPEO = () => { const n = peoList.length + 1; const np = { code: `PEO${n}`, statement: `New Programme Educational Objective ${n}...` }; const u = [...peoList, np]; setPeoList(u); updateProgrammePEOs(programmeId, u); };
  const handleDeletePEO = (i) => { const u = peoList.filter((_, idx) => idx !== i); setPeoList(u); updateProgrammePEOs(programmeId, u); };
  const handleUpdatePEOStatement = (i, v) => { const u = peoList.map((p, idx) => idx === i ? { ...p, statement: v } : p); setPeoList(u); updateProgrammePEOs(programmeId, u); };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;
    addCourse({ id: `crs-${Date.now()}`, programmeId, code: newCourseCode, name: newCourseName, semester: newCourseSem, coordinator: 'Dr. Raj Shaikh', faculty: 'Dr. Raj Shaikh' });
    setNewCourseCode(''); setNewCourseName('');
  };

  const handleDeleteCourse = (c) => {
    if (window.confirm(`Are you sure you want to delete course "${c.code} - ${c.name}"?`)) {
      deleteCourse(c.id);
    }
  };

  const handleNext = () => { if (currentStep < 4) { setCurrentStep((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const handlePrev = () => { if (currentStep > 1) { setCurrentStep((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const handleFinish = () => navigate('/hod/dashboard');

  const activeBatchObj = batches.find((b) => b.id === batchId) || batches[0];

  // ── Style tokens ──────────────────────────────────────────────────────────────
  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';
  const inputStyle = { height: '40px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', background: '#ffffff', color: ink, width: '100%', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '5px' };


  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            HOD Guided Workflow &nbsp;·&nbsp; Step {currentStep} of 4
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Programme Setup
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>{selectedProgramme.name}</p>
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
          <button onClick={() => navigate('/hod/dashboard')} style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <X size={14} /> Exit
          </button>
        </div>
      </div>

      {/* ── STEPPER ─────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '18px', left: '12.5%', right: '12.5%', height: '1px', background: '#e2e8f0', zIndex: 0 }} />
          {steps.map((s) => {
            const done = currentStep > s.number, active = currentStep === s.number;
            const Icon = s.icon;
            return (
              <div key={s.number} onClick={() => setCurrentStep(s.number)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative', zIndex: 1, opacity: currentStep >= s.number ? 1 : 0.45, transition: 'opacity .2s' }}>
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

      {/* ── STEP CONTENT ────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '24px', marginBottom: '20px' }}>


        {/* STEP 1: BATCH SETUP */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Batch Setup</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>Initialize a 4-year academic batch for <strong>{selectedProgramme.name}</strong>. Start year must be after 2020.</p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', maxWidth: '680px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '12px' }}>Add Batch Year</div>
              <form onSubmit={handleCreateBatch}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={labelStyle}>Start Year *</label>
                    <input type="text" placeholder="e.g. 2025" value={startYearInput} onChange={(e) => handleStartYearChange(e.target.value)} style={{ ...inputStyle, fontWeight: '700' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Year *</label>
                    <input type="text" placeholder="e.g. 2029" value={endYearInput} onChange={(e) => handleEndYearChange(e.target.value)} style={{ ...inputStyle, fontWeight: '700' }} />
                  </div>
                  <button type="submit" style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    + Add Batch
                  </button>
                </div>
                {batchValidationError && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
                    <AlertCircle size={14} /> {batchValidationError}
                  </div>
                )}
              </form>
            </div>

            {activeBatchObj && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', maxWidth: '680px' }}>
                <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803d' }}>{activeBatchObj.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '1px' }}>{selectedProgramme.name} ({selectedProgramme.code})</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: OUTCOMES */}
        {currentStep === 2 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>PO / PSO / PEO & Competencies</h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>Define outcomes and add competency statements for <strong>{selectedProgramme.name}</strong>.</p>
              </div>
              {outcomeTab === 'PO' && <button onClick={handleAddPO} style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Plus size={14} /> Add PO</button>}
              {outcomeTab === 'PSO' && <button onClick={handleAddPSO} style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Plus size={14} /> Add PSO</button>}
              {outcomeTab === 'PEO' && <button onClick={handleAddPEO} style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Plus size={14} /> Add PEO</button>}
            </div>

            {/* Tab strip */}
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '9px', width: 'fit-content', marginBottom: '18px' }}>
              {[['PO', `POs (${poList.length})`], ['PSO', `PSOs (${psoList.length})`], ['PEO', `PEOs (${peoList.length})`]].map(([tab, label]) => (
                <button key={tab} type="button" onClick={() => setOutcomeTab(tab)} style={{ padding: '7px 16px', borderRadius: '7px', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', background: outcomeTab === tab ? '#ffffff' : 'transparent', color: outcomeTab === tab ? accent : muted, boxShadow: outcomeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* PO tab */}
            {outcomeTab === 'PO' && (
              <div style={{ display: 'grid', gap: '12px' }}>
                {poList.length === 0 && <div style={{ textAlign: 'center', padding: '24px', color: muted, fontSize: '12.5px' }}>No POs yet — click below to add the first one.</div>}
                {poList.map((po, idx) => (
                  <div key={idx} style={{ ...surface, padding: '16px', borderLeft: `3px solid ${accent}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <input type="text" value={po.code} onChange={(e) => handleUpdatePOCode(idx, e.target.value)} style={{ ...inputStyle, width: '80px', fontWeight: '700', color: accent, textAlign: 'center' }} />
                      <input type="text" value={po.statement} onChange={(e) => handleUpdatePOStatement(idx, e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '200px' }} />
                      <button onClick={() => handleAddPOCompetency(idx)} style={{ height: '36px', padding: '0 12px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}><Plus size={13} /> Competency</button>
                      <button onClick={() => handleDeletePO(idx)} style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={13} /></button>
                    </div>
                    {(po.competencies || []).length > 0 && (
                      <div style={{ marginLeft: '8px', paddingLeft: '14px', borderLeft: '2px solid #e2e8f0' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Competencies ({(po.competencies || []).length})</div>
                        <table className="audit-data-table">
                          <thead><tr><th style={{ width: '60px', textAlign: 'center' }}>No.</th><th>Statement</th><th style={{ width: '50px' }}></th></tr></thead>
                          <tbody>
                            {(po.competencies || []).map((comp, ci) => (
                              <tr key={comp.id || ci}>
                                <td style={{ textAlign: 'center', fontWeight: '700', color: accent, fontSize: '11.5px' }}>{po.code}.{ci + 1}</td>
                                <td><input type="text" value={comp.statement} onChange={(e) => handleUpdatePOCompetency(idx, ci, e.target.value)} style={{ ...inputStyle, height: '34px', fontSize: '12px' }} /></td>
                                <td style={{ textAlign: 'center' }}><button onClick={() => handleDeletePOCompetency(idx, ci)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={12} /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
                {/* Add PO — inline after last card */}
                <button onClick={handleAddPO} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: `1.5px dashed #c7d2fe`, background: '#fafafa', color: accent, fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background .15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#eef2ff'} onMouseLeave={(e) => e.currentTarget.style.background = '#fafafa'}>
                  <Plus size={15} /> Add Programme Outcome (PO{poList.length + 1})
                </button>
              </div>
            )}

            {/* PSO tab */}
            {outcomeTab === 'PSO' && (
              <div style={{ display: 'grid', gap: '12px' }}>
                {psoList.length === 0 && <div style={{ textAlign: 'center', padding: '24px', color: muted, fontSize: '12.5px' }}>No PSOs yet — click below to add the first one.</div>}
                {psoList.map((pso, idx) => (
                  <div key={idx} style={{ ...surface, padding: '16px', borderLeft: '3px solid #059669' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <input type="text" value={pso.code} onChange={(e) => handleUpdatePSOCode(idx, e.target.value)} style={{ ...inputStyle, width: '80px', fontWeight: '700', color: '#059669', textAlign: 'center' }} />
                      <input type="text" value={pso.statement} onChange={(e) => handleUpdatePSOStatement(idx, e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '200px' }} />
                      <button onClick={() => handleAddPSOCompetency(idx)} style={{ height: '36px', padding: '0 12px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}><Plus size={13} /> Competency</button>
                      <button onClick={() => handleDeletePSO(idx)} style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={13} /></button>
                    </div>
                    {(pso.competencies || []).length > 0 && (
                      <div style={{ marginLeft: '8px', paddingLeft: '14px', borderLeft: '2px solid #e2e8f0' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Competencies ({(pso.competencies || []).length})</div>
                        <table className="audit-data-table">
                          <thead><tr><th style={{ width: '60px', textAlign: 'center' }}>No.</th><th>Statement</th><th style={{ width: '50px' }}></th></tr></thead>
                          <tbody>
                            {(pso.competencies || []).map((comp, ci) => (
                              <tr key={comp.id || ci}>
                                <td style={{ textAlign: 'center', fontWeight: '700', color: '#059669', fontSize: '11.5px' }}>{pso.code}.{ci + 1}</td>
                                <td><input type="text" value={comp.statement} onChange={(e) => handleUpdatePSOCompetency(idx, ci, e.target.value)} style={{ ...inputStyle, height: '34px', fontSize: '12px' }} /></td>
                                <td style={{ textAlign: 'center' }}><button onClick={() => handleDeletePSOCompetency(idx, ci)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={12} /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
                {/* Add PSO — inline after last card */}
                <button onClick={handleAddPSO} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1.5px dashed #6ee7b7', background: '#fafafa', color: '#059669', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background .15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'} onMouseLeave={(e) => e.currentTarget.style.background = '#fafafa'}>
                  <Plus size={15} /> Add Programme Specific Outcome (PSO{psoList.length + 1})
                </button>
              </div>
            )}

            {/* PEO tab */}
            {outcomeTab === 'PEO' && (
              <div style={{ display: 'grid', gap: '10px' }}>
                {peoList.length === 0 && <div style={{ textAlign: 'center', padding: '24px', color: muted, fontSize: '12.5px' }}>No PEOs yet — click below to add the first one.</div>}
                {peoList.map((peo, idx) => (
                  <div key={idx} style={{ ...surface, padding: '14px 16px', borderLeft: '3px solid #0284c7', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', width: '52px', flexShrink: 0 }}>{peo.code}</span>
                    <input type="text" value={peo.statement} onChange={(e) => handleUpdatePEOStatement(idx, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={() => handleDeletePEO(idx)} style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Trash2 size={13} /></button>
                  </div>
                ))}
                {/* Add PEO — inline after last row */}
                <button onClick={handleAddPEO} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1.5px dashed #7dd3fc', background: '#fafafa', color: '#0284c7', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background .15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'} onMouseLeave={(e) => e.currentTarget.style.background = '#fafafa'}>
                  <Plus size={15} /> Add Programme Educational Objective (PEO{peoList.length + 1})
                </button>
              </div>
            )}
          </div>
        )}


        {/* STEP 3: COURSES */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Courses & Coordinator Allocation</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>Add courses under <strong>{selectedProgramme.name}</strong> and assign Course Coordinators.</p>
            </div>

            {/* Add course form */}
            <form onSubmit={handleAddCourse} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '10px' }}>Add Course for {selectedProgramme.code}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 140px auto', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={labelStyle}>Code *</label>
                  <input type="text" required placeholder="CS305" value={newCourseCode} onChange={(e) => setNewCourseCode(e.target.value)} style={{ ...inputStyle, fontWeight: '700', color: accent }} />
                </div>
                <div>
                  <label style={labelStyle}>Course Name *</label>
                  <input type="text" required placeholder="e.g. Compiler Design" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Semester ({((selectedProgramme?.durationYears || 4) * 2)} Total) *</label>
                  <select value={newCourseSem} onChange={(e) => setNewCourseSem(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', fontWeight: '700', color: accent }}>
                    {Array.from({ length: (selectedProgramme?.durationYears || 4) * 2 }, (_, i) => `Sem ${['I','II','III','IV','V','VI','VII','VIII','IX','X'][i] || i + 1}`).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" style={{ height: '40px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add</button>
              </div>
            </form>

            {/* Courses table */}
            <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
              <table className="audit-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Code</th>
                    <th>Course Name</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Semester</th>
                    <th style={{ width: '240px' }}>Course Coordinator</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: muted, fontSize: '12.5px' }}>No courses yet — add one above.</td></tr>}
                  {courses.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '700', color: accent }}>{c.code}</td>
                      <td style={{ fontWeight: '600', color: ink }}>{c.name}</td>
                      <td style={{ textAlign: 'center', color: muted, fontSize: '12px' }}>{c.semester}</td>
                      <td>
                        <select value={c.coordinator || c.faculty} onChange={(e) => assignCourseCoordinator(c.id, e.target.value)} style={{ ...inputStyle, height: '34px', fontSize: '12px', cursor: 'pointer' }}>
                          {MASTER_FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                          <Check size={11} /> Allocated
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(c)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                          title="Delete Course"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {currentStep === 4 && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: ink }}>Review & Confirm</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: muted }}>Verify the setup for <strong>{selectedProgramme.name}</strong> before finishing.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
              <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#15803d' }}>Department Setup Complete</div>
                <div style={{ fontSize: '12px', color: '#166534', marginTop: '1px' }}>
                  Batch, outcomes, and course coordinators fully configured for {selectedProgramme.name}.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Active Batch', value: activeBatchObj?.startYear ? `${activeBatchObj.startYear} – ${activeBatchObj.endYear}` : '—', color: accent },
                { label: 'Program Outcomes', value: `${poList.length} POs`, color: accent },
                { label: 'Specific Outcomes', value: `${psoList.length} PSOs`, color: '#059669' },
                { label: 'Educ. Objectives', value: `${peoList.length} PEOs`, color: '#0284c7' },
                { label: 'Courses', value: `${courses.length} courses`, color: ink },
              ].map((item) => (
                <div key={item.label} style={{ ...surface, padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>{/* end step content */}

      {/* ── FOOTER NAV ────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {currentStep > 1 && (
            <button type="button" onClick={handlePrev} style={{ height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Previous
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {steps.map((s) => (
              <div key={s.number} style={{ width: currentStep === s.number ? '16px' : '6px', height: '6px', borderRadius: '3px', background: currentStep === s.number ? accent : '#e2e8f0', transition: 'all .2s' }} />
            ))}
          </div>
          {currentStep < 4 ? (
            <button type="button" onClick={handleNext} style={{ height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <Save size={14} /> Save & Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button type="button" onClick={handleFinish} style={{ height: '40px', padding: '0 22px', fontSize: '13px', fontWeight: '700', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <CheckCircle2 size={14} /> Finish & Go to Dashboard
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
