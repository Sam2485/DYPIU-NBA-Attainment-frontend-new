import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Calendar, Layers, CheckCircle2, ArrowRight, ArrowLeft, Save, Check, Plus, Trash2, Edit3, X, AlertCircle, ChevronDown, GraduationCap } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

export default function HodSetupWorkflow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    masterProgrammes = [],
    programmeId,
    setProgrammeId,
    updateProgramme = () => {},
    departments = [],
    batches = [],
    batchId,
    setBatchId,
    addBatch = () => {},
    updateBatch = () => {},
    deleteBatch = () => {},
    activePOs = [],
    activePSOs = [],
    activePEOs = [],
    updateProgrammePOs = () => {},
    updateProgrammePSOs = () => {},
    updateProgrammePEOs = () => {},
  } = useAcademic();

  const [currentStep, setCurrentStep] = useState(1);
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

  const selectedProgramme = masterProgrammes.find((p) => p.id === programmeId) || masterProgrammes[0] || { id: 'prog-1', name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  const currentDept = departments.find((d) => d.id === selectedProgramme.departmentId || d.name === selectedProgramme.department) || departments[0];
  const assignedHods = departments.map((d) => d.hod).filter(Boolean);

  // Step 1: Coordinator State
  const [selectedCoordinator, setSelectedCoordinator] = useState(() => selectedProgramme?.coordinator || MASTER_FACULTY_LIST[0] || '');

  // Step 2: Batch State
  const [startYearInput, setStartYearInput] = useState('2025');
  const [endYearInput, setEndYearInput] = useState('2029');
  const [batchValidationError, setBatchValidationError] = useState('');

  // Step 2: Batch Edit State
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editBatchName, setEditBatchName] = useState('');
  const [editStartYear, setEditStartYear] = useState('');
  const [editEndYear, setEditEndYear] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  const handleStartEditBatch = (b) => {
    setEditingBatchId(b.id);
    setEditBatchName(b.name);
    setEditStartYear(b.startYear || '');
    setEditEndYear(b.endYear || '');
    setEditStatus(b.status || 'ACTIVE');
  };

  const handleSaveEditBatch = (bId) => {
    updateBatch(bId, {
      name: editBatchName,
      startYear: editStartYear,
      endYear: editEndYear,
      status: editStatus,
    });
    setEditingBatchId(null);
  };

  const handleDeleteBatchItem = (b) => {
    triggerDeleteConfirm({
      title: 'Delete Batch?',
      itemName: b.name,
      description: 'This action cannot be undone. All data associated with this batch will be permanently removed.',
      onConfirm: () => deleteBatch(b.id),
    });
  };

  const programmeBatches = batches.filter(
    (b) =>
      b.programmeId === programmeId ||
      b.programmeCode === selectedProgramme.code ||
      b.name.includes(selectedProgramme.code) ||
      b.programmeName === selectedProgramme.name
  );

  // Step 3: Outcomes State
  const [outcomeTab, setOutcomeTab] = useState('PO');

  const steps = [
    { number: 1, title: 'Programme Coordinator', desc: 'Assign coordinator for programme', icon: UserCheck },
    { number: 2, title: 'Batch Setup',          desc: 'Initialize student batch year',     icon: Calendar },
    { number: 3, title: 'PO / PSO / PEO',       desc: 'Outcomes & competencies',          icon: Layers },
    { number: 4, title: 'Review & Confirm',     desc: 'Verify setup summary & finish',     icon: CheckCircle2 },
  ];

  const durationYears = selectedProgramme?.durationYears || 4;

  const handleSaveCoordinator = () => {
    updateProgramme(selectedProgramme.id, { coordinator: selectedCoordinator });
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

  const handleCreateBatch = (e) => {
    e.preventDefault();
    const s = parseInt(startYearInput, 10), en = parseInt(endYearInput, 10);
    if (!s || s <= 2020 || !en || en <= s) return;
    const startAY = `${s}-${String(s + 1).slice(-2)}`, endAY = `${en - 1}-${String(en).slice(-2)}`;
    const nb = { id: `batch-${selectedProgramme.code.toLowerCase()}-${s}-${String(en).slice(-2)}`, programmeId, programmeName: selectedProgramme.name, programmeCode: selectedProgramme.code, name: `Batch ${s}-${String(en).slice(-2)} (${selectedProgramme.code}) — AY ${startAY} to ${endAY}`, startYear: startAY, endYear: endAY, status: 'INITIALIZED' };
    addBatch(nb); setBatchId(nb.id);
  };

  // ── PO HANDLERS ─────────────────────────────────────────────────────────────
  const handleAddPO = () => {
    const n = activePOs.length + 1;
    const newPo = {
      code: `PO${n}`,
      statement: `New Programme Outcome ${n}...`,
      status: 'VERIFIED',
      competencies: [{ id: `comp-PO${n}-1`, order: 1, statement: `Competency 1 for PO${n}` }],
    };
    updateProgrammePOs(programmeId, [...activePOs, newPo]);
  };
  const handleUpdatePOCode = (i, v) => {
    updateProgrammePOs(programmeId, activePOs.map((p, idx) => (idx === i ? { ...p, code: v } : p)));
  };
  const handleUpdatePOStatement = (i, v) => {
    updateProgrammePOs(programmeId, activePOs.map((p, idx) => (idx === i ? { ...p, statement: v } : p)));
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
        const n = comps.length + 1;
        return { ...p, competencies: [...comps, { id: `comp-${p.code}-${n}`, order: n, statement: `Competency ${n} for ${p.code}` }] };
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
    competencies: pso.competencies || [
      { id: `psocomp-${pso.code}-1`, order: 1, statement: `Demonstrate specialized competency for ${pso.code}` },
    ],
  }));

  const handleAddPSO = () => {
    const n = normalisedPSOs.length + 1;
    const newPso = {
      code: `PSO${n}`,
      statement: `New Programme Specific Outcome ${n}...`,
      competencies: [{ id: `psocomp-PSO${n}-1`, order: 1, statement: `Competency 1 for PSO${n}` }],
    };
    updateProgrammePSOs(programmeId, [...normalisedPSOs, newPso]);
  };
  const handleUpdatePSOCode = (i, v) => {
    updateProgrammePSOs(programmeId, normalisedPSOs.map((p, idx) => (idx === i ? { ...p, code: v } : p)));
  };
  const handleUpdatePSOStatement = (i, v) => {
    updateProgrammePSOs(programmeId, normalisedPSOs.map((p, idx) => (idx === i ? { ...p, statement: v } : p)));
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
        const n = comps.length + 1;
        return { ...p, competencies: [...comps, { id: `psocomp-${p.code}-${n}`, order: n, statement: `Competency ${n} for ${p.code}` }] };
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
    const n = activePEOs.length + 1;
    updateProgrammePEOs(programmeId, [...activePEOs, { code: `PEO${n}`, statement: `New Programme Educational Objective ${n}...` }]);
  };
  const handleUpdatePEOStatement = (i, v) => {
    updateProgrammePEOs(programmeId, activePEOs.map((p, idx) => (idx === i ? { ...p, statement: v } : p)));
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

  const handleNext = () => { if (currentStep < 4) { setCurrentStep((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const handlePrev = () => { if (currentStep > 1) { setCurrentStep((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const handleFinish = () => navigate('/hod/dashboard');

  const activeBatchObj = batches.find((b) => b.id === batchId) || batches[0];

  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';
  const inputStyle = { height: '38px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff', color: ink, width: '100%', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '4px' };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="banner-dark-gradient" style={{ padding: '22px 28px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderRadius: '14px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>HOD Portal &nbsp;·&nbsp; Setup Wizard</div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#ffffff', fontWeight: '800', letterSpacing: '-0.01em' }}>Programme Setup</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
            {selectedProgramme.code} &nbsp;—&nbsp; {selectedProgramme.name}
          </p>
        </div>

        {/* Target Programme Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GraduationCap size={18} style={{ color: 'rgba(255,255,255,0.75)' }} />
          <select
            value={programmeId}
            onChange={(e) => setProgrammeId(e.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: '280px', fontWeight: '800', color: accent, cursor: 'pointer' }}
          >
            {masterProgrammes.map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── STEPPER PROGRESS BAR ─────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '18px', left: '12.5%', right: '12.5%', height: '1px', background: '#e2e8f0', zIndex: 0 }} />
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

      {/* ── STEP 1: PROGRAMME COORDINATOR SETUP ─────────────────────────────── */}
      {currentStep === 1 && (
        <div style={{ ...surface, padding: '24px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: ink }}>
              Step 1: Programme Coordinator Setup
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
              Assign the Programme Coordinator for the selected programme before configuring student batches.
            </p>
          </div>

          {/* Chosen Programme Info Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 18px', maxWidth: '680px', marginBottom: '18px' }}>
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

          {/* Programme Coordinator Selector */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', maxWidth: '680px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: ink, marginBottom: '12px' }}>Assign Programme Coordinator</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={labelStyle}>Choose Programme Coordinator *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedCoordinator}
                    onChange={(e) => setSelectedCoordinator(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer', fontWeight: '700', paddingRight: '32px', appearance: 'none', border: '1.5px solid #4f46e5', color: accent }}
                  >
                    {MASTER_FACULTY_LIST.map((fac) => {
                      const isHod = assignedHods.includes(fac);
                      return (
                        <option key={fac} value={fac} disabled={isHod} style={{ color: isHod ? '#94a3b8' : '#0f172a' }}>
                          {fac} {isHod ? '(Disabled — Is HOD)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: accent, pointerEvents: 'none' }} />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveCoordinator}
                className="btn btn-primary"
                style={{ height: '38px', padding: '0 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Save Assignment
              </button>
            </div>
          </div>

          {/* Current Assigned Status Confirmation */}
          {selectedProgramme.coordinator && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', maxWidth: '680px', marginTop: '16px' }}>
              <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div style={{ fontSize: '13px', color: '#166534' }}>
                Active Programme Coordinator: <strong style={{ color: '#15803d', fontWeight: '800' }}>{selectedProgramme.coordinator}</strong>
              </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={labelStyle}>Start Academic Year *</label>
                <input type="text" placeholder="2025" value={startYearInput} onChange={(e) => handleStartYearChange(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Graduation Year *</label>
                <input type="text" placeholder="2029" value={endYearInput} onChange={(e) => handleEndYearChange(e.target.value)} style={inputStyle} />
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
                <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programmeBatches.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: muted, fontSize: '12.5px' }}>
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
                    <td style={{ textAlign: 'center' }}>
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{ ...inputStyle, height: '34px', fontSize: '11.5px', padding: '0 6px' }}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="COMPLETED">COMPLETED</option>
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
                            onClick={() => handleSaveEditBatch(b.id)}
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

      {/* ── STEP 3: PO / PSO / PEO OUTCOME FRAMEWORK ───────────────────────── */}
      {currentStep === 3 && (
        <div style={{ ...surface, padding: '24px' }}>
          {/* Header & Sub-tabs */}
          <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: ink }}>
                Step 3: Outcome Framework Configuration (PO / PSO / PEO)
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
                Define outcome statements and competency breakdowns for {selectedProgramme.name}.
              </p>
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

          {/* TAB: PO */}
          {outcomeTab === 'PO' && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {activePOs.map((po, idx) => (
                <div key={idx} style={{ ...surface, padding: '16px', borderLeft: `3px solid ${accent}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: po.competencies?.length ? '12px' : 0, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={po.code}
                      onChange={(e) => handleUpdatePOCode(idx, e.target.value)}
                      style={{ ...inputStyle, width: '80px', fontWeight: '800', color: accent, textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      value={po.statement}
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
                                  value={comp.statement}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: pso.competencies.length ? '12px' : 0, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={pso.code}
                      onChange={(e) => handleUpdatePSOCode(idx, e.target.value)}
                      style={{ ...inputStyle, width: '80px', fontWeight: '800', color: '#059669', textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      value={pso.statement}
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
                                  value={comp.statement}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={peo.code}
                      readOnly
                      style={{ ...inputStyle, width: '80px', fontWeight: '800', color: '#0284c7', textAlign: 'center', background: '#f8fafc' }}
                    />
                    <input
                      type="text"
                      value={peo.statement}
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

      {/* ── STEP 4: REVIEW & CONFIRM (RELEVANT INFO FROM PREVIOUS TABS) ────── */}
      {currentStep === 4 && (
        <div style={{ ...surface, padding: '24px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: ink }}>
              Step 4: Review &amp; Confirm Setup
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
              Summary of all configurations from previous setup tabs for {selectedProgramme.name}.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Tab 1 Summary */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: muted, textTransform: 'uppercase', marginBottom: '6px' }}>Tab 1: Programme Coordinator</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{selectedProgramme.name} ({selectedProgramme.code})</div>
              <div style={{ fontSize: '13px', color: accent, fontWeight: '700', marginTop: '6px' }}>
                Assigned Coordinator: <span style={{ background: '#eef2ff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #c7d2fe' }}>{selectedProgramme.coordinator || selectedCoordinator || 'Dr. A. K. Sharma'}</span>
              </div>
            </div>

            {/* Tab 2 Summary */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: muted, textTransform: 'uppercase', marginBottom: '6px' }}>Tab 2: Active Student Batch</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{activeBatchObj?.name || 'Batch 2025-29'}</div>
              <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '700', marginTop: '6px' }}>
                Lifecycle Status: <span style={{ background: '#dcfce7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>{activeBatchObj?.status || 'INITIALIZED'}</span>
              </div>
            </div>

            {/* Tab 3 Summary */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: muted, textTransform: 'uppercase', marginBottom: '6px' }}>Tab 3: Outcome Framework</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{activePOs.length} POs · {normalisedPSOs.length} PSOs · {activePEOs.length} PEOs</div>
              <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '700', marginTop: '6px' }}>
                Competencies: <span style={{ background: '#dcfce7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>✓ Verified &amp; Mapped</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEPPER BOTTOM FOOTER NAV ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          style={{ height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: '#ffffff', color: currentStep === 1 ? '#94a3b8' : ink, border: '1px solid #cbd5e1', borderRadius: '8px', cursor: currentStep === 1 ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={15} /> Previous Step
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            style={{ height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '800', gap: '8px', display: 'inline-flex', alignItems: 'center' }}
          >
            Next Step <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            style={{ background: '#22c55e', color: '#ffffff', border: 'none', height: '40px', padding: '0 22px', fontSize: '13.5px', fontWeight: '800', gap: '8px', display: 'inline-flex', alignItems: 'center', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(34,197,94,0.3)' }}
          >
            <Check size={16} /> Finish Setup &amp; Go to Dashboard
          </button>
        )}
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
