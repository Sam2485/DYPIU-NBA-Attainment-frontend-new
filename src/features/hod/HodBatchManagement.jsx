import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, CheckCircle2, Calendar, Archive, AlertCircle, ToggleLeft, ToggleRight, Check, Edit2, Trash2, Save, X, ChevronDown, Layers, Activity } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

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

  // ── Edit modal state ─────────────────────────────────────────────────────
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editingBatch,    setEditingBatch]    = useState(null);
  const [editingId,       setEditingId]       = useState(null);
  const [editName,        setEditName]        = useState('');
  const [editStartYear,   setEditStartYear]   = useState('');
  const [editEndYear,     setEditEndYear]     = useState('');
  const [editYearLevel,   setEditYearLevel]   = useState('');
  const [editStatus,      setEditStatus]      = useState('ACTIVE');

  // ── Delete confirm modal state ───────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBatch,   setDeletingBatch]   = useState(null);

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

  // ── Edit modal handlers ───────────────────────────────────────────────────
  const handleStartEdit = (batch) => {
    setEditingBatch(batch);
    setEditingId(batch.id);
    setEditName(batch.name);
    setEditStartYear(batch.startYear || '');
    setEditEndYear(batch.endYear || '');
    setEditYearLevel(batch.yearLevel || 'Year 1 (Freshmen)');
    setEditStatus(batch.status || 'ACTIVE');
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateBatch(editingId, {
      name:      editName,
      startYear: editStartYear,
      endYear:   editEndYear,
      yearLevel: editYearLevel,
      status:    editStatus,
    });
    setShowEditModal(false);
    setEditingBatch(null);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingBatch(null);
    setEditingId(null);
  };

  const handleDelete = (batch) => {
    if (batch.status === 'ACTIVE') {
      alert('Active batches cannot be deleted. Deactivate first.');
      return;
    }
    setDeletingBatch(batch);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletingBatch) deleteBatch(deletingBatch.id);
    setShowDeleteModal(false);
    setDeletingBatch(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingBatch(null);
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER BANNER ────────────────────────────────────────────────── */}
      <div className="banner-dark-gradient" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {/* Left: title block */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: '#eef2ff', color: accent,
                fontWeight: '800', fontSize: '10px', borderRadius: '5px',
                padding: '2px 9px', letterSpacing: '0.07em', textTransform: 'uppercase',
                border: '1px solid #c7d2fe',
              }}>
                HOD Portal · Batch Management
              </span>
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.01em' }}>
              Batch Setup
            </h2>
            <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: '#64748b' }}>
              Initialize a {durationYears}-year academic batch for <strong style={{ color: accent }}>{selectedProgramme.name}</strong>. Start year must be after 2020.
            </p>
            {/* Inline stat chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: 'Duration',       value: `${durationYears} Years`,                         bg: '#f1f5f9', color: '#475569' },
                { label: 'Total Batches',  value: String(programmeBatches.length),                  bg: '#f1f5f9', color: '#475569' },
                { label: 'Active Batches', value: `${activeBatchesCount} / ${programmeBatches.length}`, bg: '#dcfce7',  color: '#15803d' },
              ].map((chip) => (
                <span key={chip.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: chip.bg, color: chip.color,
                  fontSize: '11px', fontWeight: '700', borderRadius: '20px',
                  padding: '3px 10px', border: '1px solid #cbd5e1',
                  letterSpacing: '0.02em',
                }}>
                  {chip.label}: <strong style={{ color: '#0f172a' }}>{chip.value}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Right: Programme selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '260px', maxWidth: '360px', flex: '1 1 260px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Programme
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedProgrammeId}
                onChange={(e) => setSelectedProgrammeId(e.target.value)}
                style={{
                  width: '100%', height: '40px', fontSize: '13px',
                  fontWeight: '700', color: '#1e293b',
                  background: '#ffffff', border: '1.5px solid rgba(255,255,255,0.8)',
                  borderRadius: '9px', padding: '0 34px 0 12px',
                  outline: 'none', appearance: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                }}
              >
                {masterProgrammes.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                ))}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
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

            return (
              <div
                key={batch.id}
                style={{
                  ...surface,
                  padding: '16px 20px',
                  borderLeft: `4px solid ${isActive ? '#16a34a' : '#e2e8f0'}`,
                  opacity: isGraduated ? 0.8 : 1,
                  transition: 'box-shadow 0.15s',
                }}
              >
                {/* ── VIEW MODE ─────────────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: ink, letterSpacing: '-0.01em' }}>{batch.name}</span>
                    </div>
                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: muted, flexWrap: 'wrap' }}>
                      <span><Calendar size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />AY <strong style={{ color: ink }}>{batch.startYear}</strong> → <strong style={{ color: ink }}>{batch.endYear}</strong></span>
                      <span style={{ color: '#cbd5e1' }}>·</span>
                      <span>{batch.yearLevel || '—'}</span>
                      <span style={{ color: '#cbd5e1' }}>·</span>
                      <span>{batch.programmeName || selectedProgramme.name}</span>
                    </div>
                  </div>

                  {/* Right side: status badge + action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                    {/* Status badge */}
                    {isActive ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#15803d', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '6px', padding: '3px 10px' }}>
                        <Check size={11} /> Active
                      </span>
                    ) : isGraduated ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#475569', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '3px 10px' }}>
                        <Archive size={11} /> Graduated
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#b45309', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '6px', padding: '3px 10px' }}>
                        Initialized
                      </span>
                    )}

                    {/* Toggle active */}
                    <button
                      type="button"
                      onClick={() => toggleBatchActiveStatus(batch.id)}
                      style={{
                        height: '32px', padding: '0 12px', fontSize: '12px', fontWeight: '600',
                        border: isActive ? '1px solid #fca5a5' : '1px solid #a7f3d0',
                        background: isActive ? '#fef2f2' : '#f0fdf4',
                        color: isActive ? '#dc2626' : '#16a34a',
                        borderRadius: '7px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit',
                      }}
                    >
                      {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>



                    {/* Edit — opens modal */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(batch)}
                      style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #c7d2fe', background: '#eef2ff', color: accent, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                      title="Edit batch"
                    >
                      <Edit2 size={13} />
                    </button>

                    {/* Delete — opens confirm modal */}
                    <button
                      type="button"
                      onClick={() => handleDelete(batch)}
                      style={{ width: '32px', height: '32px', borderRadius: '7px', border: isActive ? '1px solid #e2e8f0' : '1px solid #fecaca', background: isActive ? '#f8fafc' : '#fef2f2', color: isActive ? '#94a3b8' : '#dc2626', cursor: isActive ? 'not-allowed' : 'pointer', display: 'grid', placeItems: 'center', opacity: isActive ? 0.45 : 1 }}
                      title={isActive ? 'Deactivate before deleting' : 'Delete batch'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
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

      {/* ── EDIT BATCH MODAL ──────────────────────────────────────────────────── */}
      {showEditModal && editingBatch && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCancelEdit(); }}
        >
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden', boxSizing: 'border-box' }}>
            {/* Modal header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>Edit Batch</div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: ink }}>Update Batch Details</h3>
              </div>
              <button type="button" onClick={handleCancelEdit} style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', color: muted, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={14} />
              </button>
            </div>
            {/* Modal body */}
            <div style={{ padding: '20px 22px', display: 'grid', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Batch Display Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} placeholder="Batch display name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Start AY</label>
                  <input type="text" value={editStartYear} onChange={(e) => setEditStartYear(e.target.value)} style={{ ...inputStyle, fontWeight: '700' }} placeholder="e.g. 2025-26" />
                </div>
                <div>
                  <label style={labelStyle}>End AY</label>
                  <input type="text" value={editEndYear} onChange={(e) => setEditEndYear(e.target.value)} style={{ ...inputStyle, fontWeight: '700' }} placeholder="e.g. 2028-29" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Year Level</label>
                  <input type="text" value={editYearLevel} onChange={(e) => setEditYearLevel(e.target.value)} style={inputStyle} placeholder="e.g. Year 1 (Freshmen)" />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ ...inputStyle, fontWeight: '700' }}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INITIALIZED">INITIALIZED</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="GRADUATED">GRADUATED</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Modal footer */}
            <div style={{ padding: '14px 22px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={handleCancelEdit} style={{ height: '36px', padding: '0 16px', fontSize: '13px', fontWeight: '600', background: '#ffffff', color: muted, border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleSaveEdit} style={{ height: '36px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: accent, color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Save size={13} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ──────────────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={showDeleteModal && !!deletingBatch}
        title="Delete Batch?"
        itemName={deletingBatch?.name}
        description="This action cannot be undone. All data associated with this batch will be permanently removed."
        confirmText="Delete Batch"
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />
    </div>
  );
}
