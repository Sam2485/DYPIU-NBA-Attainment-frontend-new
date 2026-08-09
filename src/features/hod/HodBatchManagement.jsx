import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Calendar, Archive, AlertCircle, ToggleLeft, ToggleRight, Check, Edit2, Trash2, Save, X, ChevronDown } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

// ── Style tokens (identical to HodSetupWorkflow) ─────────────────────────────
const surface    = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink        = '#0f172a';
const muted      = '#64748b';
const accent     = '#4f46e5';
const inputStyle = {
  height: '40px',
  fontSize: '13px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '0 12px',
  background: '#ffffff',
  color: ink,
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
};
const labelStyle = {
  display: 'block',
  fontSize: '11.5px',
  fontWeight: '600',
  color: muted,
  marginBottom: '5px',
};

const YEAR_LEVELS = [
  'Year 1 (Freshmen)',
  'Year 2 (Sophomores)',
  'Year 3 (Juniors)',
  'Year 4 (Seniors / Final Year)',
  'Upcoming Batch',
  'Graduated Alumni',
];

export default function HodBatchManagement() {
  const {
    masterProgrammes = [],
    batches = [],
    batchId,
    setBatchId,
    addBatch              = () => {},
    updateBatch           = () => {},
    deleteBatch           = () => {},
    toggleBatchActiveStatus = () => {},
  } = useAcademic();

  const [selectedProgrammeId, setSelectedProgrammeId] = useState(masterProgrammes[0]?.id || 'prog-1');

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === selectedProgrammeId) ||
    masterProgrammes[0] ||
    { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP', durationYears: 4 };

  const durationYears = selectedProgramme.durationYears || 4;

  // ── Add-form state ────────────────────────────────────────────────────────
  const [startYearInput, setStartYearInput] = useState('2025');
  const [endYearInput,   setEndYearInput]   = useState(String(2025 + durationYears));
  const [batchError,     setBatchError]     = useState('');

  // ── Inline edit state ────────────────────────────────────────────────────
  const [editingId,       setEditingId]       = useState(null);
  const [editName,        setEditName]        = useState('');
  const [editStartYear,   setEditStartYear]   = useState('');
  const [editEndYear,     setEditEndYear]     = useState('');
  const [editYearLevel,   setEditYearLevel]   = useState('');
  const [editStatus,      setEditStatus]      = useState('ACTIVE');

  // Auto-recalc end year when programme or start year changes
  useEffect(() => {
    const n = parseInt(startYearInput, 10);
    if (!isNaN(n) && n > 2020) setEndYearInput(String(n + durationYears));
  }, [selectedProgrammeId, durationYears]);

  const programmeBatches   = batches.filter((b) => !b.programmeId || b.programmeId === selectedProgrammeId);
  const activeBatchesCount = programmeBatches.filter((b) => b.status === 'ACTIVE').length;

  // ── Add-form handlers ─────────────────────────────────────────────────────
  const handleStartYearChange = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    setStartYearInput(v);
    if (v.length === 4) {
      const n = parseInt(v, 10);
      if (n <= 2020) { setBatchError('Start year must be greater than 2020.'); return; }
      setBatchError('');
      setEndYearInput(String(n + durationYears));
    } else { setBatchError(''); }
  };

  const handleEndYearChange = (val) => setEndYearInput(val.replace(/\D/g, '').slice(0, 4));

  const handleAddBatch = (e) => {
    e.preventDefault();
    const s = parseInt(startYearInput, 10), en = parseInt(endYearInput, 10);
    if (!s || s <= 2020 || !en || en <= s) return;

    const startAY = `${s}-${String(s + 1).slice(-2)}`;
    const endAY   = `${en - 1}-${String(en).slice(-2)}`;

    const nb = {
      id:           `batch-${selectedProgramme.code.toLowerCase()}-${s}-${String(en).slice(-2)}`,
      programmeId:  selectedProgrammeId,
      programmeName: selectedProgramme.name,
      programmeCode: selectedProgramme.code,
      durationYears,
      name:         `Batch ${s}-${String(en).slice(-2)} (${selectedProgramme.code}) — AY ${startAY} to ${endAY}`,
      startYear:    startAY,
      endYear:      endAY,
      yearLevel:    'Year 1 (Freshmen)',
      status:       'ACTIVE',
    };
    addBatch(nb);
    setBatchId(nb.id);
  };

  // ── Inline edit handlers ──────────────────────────────────────────────────
  const handleStartEdit = (batch) => {
    setEditingId(batch.id);
    setEditName(batch.name);
    setEditStartYear(batch.startYear || '');
    setEditEndYear(batch.endYear || '');
    setEditYearLevel(batch.yearLevel || 'Year 1 (Freshmen)');
    setEditStatus(batch.status || 'ACTIVE');
  };

  const handleSaveEdit = (batchId) => {
    updateBatch(batchId, {
      name:      editName,
      startYear: editStartYear,
      endYear:   editEndYear,
      yearLevel: editYearLevel,
      status:    editStatus,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleDelete = (batch) => {
    if (batch.status === 'ACTIVE') {
      alert('Active batches cannot be deleted. Deactivate first.');
      return;
    }
    if (window.confirm(`Delete "${batch.name}"? This cannot be undone.`))
      deleteBatch(batch.id);
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            HOD Portal &nbsp;·&nbsp; Batch Management
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Batch Setup
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            Initialize a {durationYears}-year academic batch for <strong>{selectedProgramme.name}</strong>. Start year must be after 2020.
          </p>
        </div>

        {/* Programme selector */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedProgrammeId}
            onChange={(e) => setSelectedProgrammeId(e.target.value)}
            style={{
              height: '38px',
              paddingLeft: '12px',
              paddingRight: '32px',
              fontSize: '12.5px',
              fontWeight: '600',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#ffffff',
              color: ink,
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit',
              appearance: 'none',
              maxWidth: '300px',
            }}
          >
            {masterProgrammes.map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
        </div>
      </div>

      {/* ── STATS ROW ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Programme Duration', value: `${durationYears} Years`,            color: accent },
          { label: 'Total Batches',       value: programmeBatches.length,             color: ink   },
          { label: 'Active Batches',      value: `${activeBatchesCount} / ${durationYears}`, color: '#16a34a' },
        ].map((s) => (
          <div key={s.label} style={{ ...surface, padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── ADD BATCH FORM ────────────────────────────────────────────────────── */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '12px' }}>Add Batch Year</div>
        <form onSubmit={handleAddBatch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label style={labelStyle}>Start Year *</label>
              <input
                type="text"
                placeholder="e.g. 2025"
                value={startYearInput}
                onChange={(e) => handleStartYearChange(e.target.value)}
                style={{ ...inputStyle, fontWeight: '700' }}
              />
            </div>
            <div>
              <label style={labelStyle}>End Year *</label>
              <input
                type="text"
                placeholder={`e.g. ${2025 + durationYears}`}
                value={endYearInput}
                onChange={(e) => handleEndYearChange(e.target.value)}
                style={{ ...inputStyle, fontWeight: '700' }}
              />
            </div>
            <button
              type="submit"
              style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
            >
              <Plus size={14} /> Add Batch
            </button>
          </div>
          {batchError && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
              <AlertCircle size={14} /> {batchError}
            </div>
          )}
        </form>
      </div>

      {/* ── BATCH CARDS ───────────────────────────────────────────────────────── */}
      {programmeBatches.length === 0 ? (
        <div style={{ ...surface, padding: '40px', textAlign: 'center' }}>
          <Calendar size={32} style={{ color: '#94a3b8', marginBottom: '10px' }} />
          <div style={{ fontSize: '14px', fontWeight: '700', color: ink, marginBottom: '4px' }}>No batches yet</div>
          <div style={{ fontSize: '12.5px', color: muted }}>Use the form above to add the first {durationYears}-year batch for {selectedProgramme.name}.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {programmeBatches.map((batch) => {
            const isActive     = batch.status === 'ACTIVE';
            const isGraduated  = batch.status === 'GRADUATED';
            const isContext    = batch.id === batchId;
            const isEditing    = editingId === batch.id;

            return (
              <div
                key={batch.id}
                style={{
                  ...surface,
                  padding: '16px',
                  borderLeft: `3px solid ${isContext ? accent : isActive ? '#16a34a' : '#e2e8f0'}`,
                  opacity: isGraduated ? 0.8 : 1,
                }}
              >
                {isEditing ? (
                  /* ── EDIT MODE ───────────────────────────────────────────── */
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Batch Display Name</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={labelStyle}>Start AY</label>
                        <input type="text" value={editStartYear} onChange={(e) => setEditStartYear(e.target.value)} style={{ ...inputStyle, fontWeight: '700' }} />
                      </div>
                      <div>
                        <label style={labelStyle}>End AY</label>
                        <input type="text" value={editEndYear} onChange={(e) => setEditEndYear(e.target.value)} style={{ ...inputStyle, fontWeight: '700' }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Year Level</label>
                        <select value={editYearLevel} onChange={(e) => setEditYearLevel(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                          {YEAR_LEVELS.map((y) => <option key={y}>{y}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Status</label>
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INITIALIZED">INITIALIZED</option>
                          <option value="GRADUATED">GRADUATED</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(batch.id)}
                        style={{ height: '34px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit' }}
                      >
                        <Save size={13} /> Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{ height: '34px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f8fafc', color: muted, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit' }}
                      >
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── VIEW MODE ───────────────────────────────────────────── */
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      {/* Title row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: ink }}>{batch.name}</span>
                        {isContext && (
                          <span style={{ fontSize: '10px', fontWeight: '700', background: '#eef2ff', color: accent, border: '1px solid #c7d2fe', borderRadius: '4px', padding: '1px 6px' }}>
                            Current Context
                          </span>
                        )}
                      </div>
                      {/* Meta */}
                      <div style={{ fontSize: '12px', color: muted }}>
                        <span>AY <strong style={{ color: ink }}>{batch.startYear}</strong> → <strong style={{ color: ink }}>{batch.endYear}</strong></span>
                        <span style={{ margin: '0 8px', color: '#cbd5e1' }}>·</span>
                        <span>{batch.yearLevel || '—'}</span>
                        <span style={{ margin: '0 8px', color: '#cbd5e1' }}>·</span>
                        <span>{batch.programmeName || selectedProgramme.name}</span>
                      </div>
                    </div>

                    {/* Right side: status + actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {/* Status badge */}
                      {isActive ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                          <Check size={11} /> Active
                        </span>
                      ) : isGraduated ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#475569', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '2px 8px' }}>
                          <Archive size={11} /> Graduated
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '5px', padding: '2px 8px' }}>
                          Initialized
                        </span>
                      )}

                      {/* Toggle active */}
                      <button
                        type="button"
                        onClick={() => toggleBatchActiveStatus(batch.id)}
                        style={{
                          height: '30px',
                          padding: '0 10px',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          border: isActive ? '1px solid #fca5a5' : '1px solid #a7f3d0',
                          background: isActive ? '#fef2f2' : '#f0fdf4',
                          color: isActive ? '#dc2626' : '#16a34a',
                          borderRadius: '7px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontFamily: 'inherit',
                        }}
                      >
                        {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      {/* Set context */}
                      {!isContext && isActive && (
                        <button
                          type="button"
                          onClick={() => setBatchId(batch.id)}
                          style={{ height: '30px', padding: '0 10px', fontSize: '11.5px', fontWeight: '600', background: accent, color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          Set Context
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(batch)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: accent, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(batch)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: isActive ? '1px solid #e2e8f0' : '1px solid #fecaca', background: isActive ? '#f8fafc' : '#fef2f2', color: isActive ? '#94a3b8' : '#dc2626', cursor: isActive ? 'not-allowed' : 'pointer', display: 'grid', placeItems: 'center', opacity: isActive ? 0.5 : 1 }}
                        title={isActive ? 'Deactivate before deleting' : 'Delete batch'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Inline dashed add prompt */}
          <button
            type="button"
            onClick={() => document.querySelector('input[placeholder="e.g. 2025"]')?.focus()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: `1.5px dashed #c7d2fe`, background: '#fafafa', color: accent, fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background .15s', fontFamily: 'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#eef2ff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fafafa'; }}
          >
            <Plus size={15} /> Add Another Batch
          </button>
        </div>
      )}
    </div>
  );
}
