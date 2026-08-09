import { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle2, Clock, Layers, Sparkles, GraduationCap, Building2, AlertCircle, Archive, ToggleLeft, ToggleRight, Check, Edit2, Trash2, Save, X } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function HodBatchManagement() {
  const {
    masterProgrammes = [],
    batches = [],
    batchId,
    setBatchId,
    addBatch = () => {},
    updateBatch = () => {},
    deleteBatch = () => {},
    toggleBatchActiveStatus = () => {},
  } = useAcademic();

  // Programme Selection State (Programmes fetched from Director)
  const [selectedProgrammeId, setSelectedProgrammeId] = useState(masterProgrammes[0]?.id || 'prog-1');
  const selectedProgramme = masterProgrammes.find((p) => p.id === selectedProgrammeId) || masterProgrammes[0] || { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP', durationYears: 4 };

  const durationYears = selectedProgramme.durationYears || 4;

  // Add Batch Modal & Form State (Typed Numeric Inputs > 2020)
  const [showAddModal, setShowAddModal] = useState(false);
  const [startYearInput, setStartYearInput] = useState('2025');
  const [endYearInput, setEndYearInput] = useState(String(2025 + durationYears));
  const [validationError, setValidationError] = useState('');

  // Edit Batch Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStartYear, setEditStartYear] = useState('');
  const [editEndYear, setEditEndYear] = useState('');
  const [editYearLevel, setEditYearLevel] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  // Update End Year whenever selected programme changes or start year changes
  useEffect(() => {
    const num = parseInt(startYearInput, 10);
    if (!isNaN(num)) {
      setEndYearInput(String(num + durationYears));
    }
  }, [selectedProgrammeId, durationYears]);

  // Filter batches by selected programme allocated by Director
  const programmeBatches = batches.filter(
    (b) => !b.programmeId || b.programmeId === selectedProgrammeId
  );

  const activeBatchesCount = programmeBatches.filter((b) => b.status === 'ACTIVE').length;

  const handleStartYearChange = (val) => {
    const numericOnly = val.replace(/\D/g, '').slice(0, 4);
    setStartYearInput(numericOnly);

    if (numericOnly.length === 4) {
      const num = parseInt(numericOnly, 10);
      if (num <= 2020) {
        setValidationError('⚠️ Academic start year must be greater than AY 2020 (e.g. 2021 or later).');
      } else {
        setValidationError('');
        setEndYearInput(String(num + durationYears));
      }
    } else {
      setValidationError('');
    }
  };

  const handleEndYearChange = (val) => {
    const numericOnly = val.replace(/\D/g, '').slice(0, 4);
    setEndYearInput(numericOnly);
  };

  const handleAddBatch = (e) => {
    e.preventDefault();
    const startNum = parseInt(startYearInput, 10);
    const endNum = parseInt(endYearInput, 10);

    if (!startYearInput || isNaN(startNum)) {
      alert('Please enter a valid 4-digit numeric Start Academic Year (e.g. 2025).');
      return;
    }
    if (startNum <= 2020) {
      alert('⚠️ Academic start year must be greater than AY 2020 (e.g. 2021 or later).');
      return;
    }
    if (!endYearInput || isNaN(endNum)) {
      alert(`Please enter a valid 4-digit numeric End Academic Year (e.g. ${startNum + durationYears}).`);
      return;
    }
    if (endNum <= startNum) {
      alert('⚠️ End Academic Year must be greater than Start Academic Year.');
      return;
    }

    const startAY = `${startNum}-${String(startNum + 1).slice(-2)}`;
    const endAY = `${endNum - 1}-${String(endNum).slice(-2)}`;

    const newBatch = {
      id: `batch-${selectedProgramme.code.toLowerCase()}-${startNum}-${String(endNum).slice(-2)}`,
      programmeId: selectedProgrammeId,
      programmeName: selectedProgramme.name,
      programmeCode: selectedProgramme.code,
      durationYears,
      name: `Batch ${startNum}-${String(endNum).slice(-2)} (${selectedProgramme.code}) — AY ${startAY} to ${endAY}`,
      startYear: startAY,
      endYear: endAY,
      yearLevel: `Year 1 (Freshmen)`,
      status: 'ACTIVE',
    };

    addBatch(newBatch);
    setBatchId(newBatch.id);
    alert(`🎉 New ${durationYears}-Year Academic Batch initialized and set ACTIVE: ${newBatch.name}!`);
    setShowAddModal(false);
  };

  // Open Edit Modal
  const handleOpenEditModal = (batch) => {
    setEditingBatch(batch);
    setEditName(batch.name);
    setEditStartYear(batch.startYear || '');
    setEditEndYear(batch.endYear || '');
    setEditYearLevel(batch.yearLevel || 'Year 1');
    setEditStatus(batch.status || 'ACTIVE');
    setShowEditModal(true);
  };

  // Save Edit Batch
  const handleSaveEditBatch = (e) => {
    e.preventDefault();
    if (!editingBatch) return;

    updateBatch(editingBatch.id, {
      name: editName,
      startYear: editStartYear,
      endYear: editEndYear,
      yearLevel: editYearLevel,
      status: editStatus,
    });

    alert(`🎉 Batch ${editName} updated successfully!`);
    setShowEditModal(false);
    setEditingBatch(null);
  };

  // Delete Batch
  const handleDeleteBatch = (batch) => {
    if (batch.status === 'ACTIVE') {
      alert('⚠️ Active batches cannot be deleted! Please deactivate the batch first before attempting to delete it.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${batch.name}"? This action will remove this batch from the database.`)) {
      deleteBatch(batch.id);
      alert(`🗑️ Batch "${batch.name}" deleted from database.`);
    }
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fef08a', fontWeight: '800', fontSize: '11px' }}>
                HOD PORTAL • MULTI-BATCH CONCURRENT CONTROL
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              Programme Multi-Batch Management ({durationYears} Concurrently Active Batches Allowed)
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Create, edit, activate, and manage all running and archived academic batches for {selectedProgramme.code}.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ height: '40px', padding: '0 20px', fontSize: '12.5px', fontWeight: '800', gap: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <Plus size={16} /> + Type & Create {durationYears}-Year Batch
          </button>
        </div>
      </div>

      {/* ── STEP 1: SELECT PROGRAMME ALLOCATED BY DIRECTOR & VIEW CONCURRENT CAPACITY ── */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1.5px solid #cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <GraduationCap size={18} style={{ color: '#4f46e5' }} />
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                1. Select Allocated Programme (Created by Director)
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '900' }}>
              {selectedProgramme.name} ({selectedProgramme.code})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <span className="badge" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', fontSize: '12px' }}>
                Programme Duration: {durationYears} Years
              </span>
              <span className="badge" style={{ background: activeBatchesCount <= durationYears ? '#dcfce7' : '#fef3c7', color: activeBatchesCount <= durationYears ? '#15803d' : '#b45309', fontWeight: '800', fontSize: '12px' }}>
                ⚡ {activeBatchesCount} Concurrently Active Batches Running
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Choose Programme:</span>
            <select
              value={selectedProgrammeId}
              onChange={(e) => setSelectedProgrammeId(e.target.value)}
              className="form-input"
              style={{ height: '40px', fontSize: '13px', fontWeight: '800', color: '#4f46e5', minWidth: '300px' }}
            >
              {masterProgrammes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name} ({p.durationYears || 4} Years)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── STEP 2: MULTIPLE BATCHES LIST FOR SELECTED PROGRAMME ──────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
          2. Batch Roster under {selectedProgramme.code} (Edit, Activate & Delete Control)
        </h3>

        <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>
          Total Batches in DB: <strong>{programmeBatches.length}</strong> • Active Batches: <strong style={{ color: '#10b981' }}>{activeBatchesCount} / {durationYears}</strong>
        </div>
      </div>

      <div className="grid-cards-2" style={{ gap: '16px' }}>
        {programmeBatches.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', background: '#ffffff', borderRadius: '14px', border: '1.5px dashed #cbd5e1', padding: '32px', textAlign: 'center' }}>
            <Calendar size={32} style={{ color: '#94a3b8', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '800' }}>
              No Batches Initialized Yet for {selectedProgramme.name}
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#64748b' }}>
              Click the button below to type and add the first {durationYears}-year academic batch cycle under this programme.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ padding: '0 20px', height: '38px', fontSize: '12.5px', fontWeight: '800' }}
            >
              + Type & Add {durationYears}-Year Batch for {selectedProgramme.code}
            </button>
          </div>
        ) : (
          programmeBatches.map((batch) => {
            const isActive = batch.status === 'ACTIVE';
            const isGraduated = batch.status === 'GRADUATED';
            const isCurrentContextBatch = batch.id === batchId;

            return (
              <div
                key={batch.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: isCurrentContextBatch ? '2.5px solid #4f46e5' : isActive ? '2px solid #10b981' : '1.5px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: isActive ? '0 8px 24px rgba(16,185,129,0.08)' : '0 4px 12px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  opacity: isGraduated ? 0.85 : 1,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px' }}>
                      {batch.programmeCode || selectedProgramme.code} • {batch.durationYears || durationYears}-YEAR CYCLE
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isActive ? (
                        <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '11.5px', gap: '4px' }}>
                          <Check size={13} /> ACTIVE ({batch.yearLevel || 'Running'})
                        </span>
                      ) : isGraduated ? (
                        <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontWeight: '700', fontSize: '11.5px', gap: '4px' }}>
                          <Archive size={12} /> GRADUATED (ALUMNI)
                        </span>
                      ) : (
                        <span className="badge badge-pending" style={{ background: '#fef3c7', color: '#b45309', fontWeight: '700', fontSize: '11.5px' }}>
                          INITIALIZED / UPCOMING
                        </span>
                      )}

                      {/* EDIT BATCH BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(batch)}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#4f46e5', display: 'grid', placeItems: 'center' }}
                        title="Edit Batch Details"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* DELETE BATCH BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleDeleteBatch(batch)}
                        style={{
                          background: isActive ? '#f8fafc' : '#fee2e2',
                          border: isActive ? '1px solid #e2e8f0' : '1px solid #fca5a5',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: isActive ? 'not-allowed' : 'pointer',
                          color: isActive ? '#94a3b8' : '#dc2626',
                          display: 'grid',
                          placeItems: 'center',
                          opacity: isActive ? 0.6 : 1,
                        }}
                        title={isActive ? 'Active batches cannot be deleted. Deactivate first.' : 'Delete Batch from Database'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15.5px', color: '#0f172a', fontWeight: '800' }}>
                    {batch.name}
                  </h4>

                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                    Programme: <strong style={{ color: '#0f172a' }}>{batch.programmeName || selectedProgramme.name}</strong>
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Academic Span: <strong>AY {batch.startYear || '2025-26'}</strong> to <strong>AY {batch.endYear || '2028-29'}</strong>
                  </p>
                </div>

                <div style={{ paddingTop: '14px', marginTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => toggleBatchActiveStatus(batch.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      gap: '6px',
                      background: isActive ? '#fef2f2' : '#f0fdf4',
                      color: isActive ? '#dc2626' : '#15803d',
                      border: isActive ? '1px solid #fca5a5' : '1px solid #a7f3d0',
                    }}
                  >
                    {isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {isActive ? 'Deactivate Batch' : 'Mark as Active Batch'}
                  </button>

                  {!isCurrentContextBatch && isActive && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setBatchId(batch.id)}
                      style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '800', background: '#4f46e5' }}
                    >
                      Select Context
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── INITIALIZE BATCH MODAL ─────────────────────────────────────────────────── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '520px', maxWidth: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', padding: '18px 24px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                Type & Create {durationYears}-Year Batch for {selectedProgramme.code}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '18px', fontWeight: '800' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBatch} style={{ padding: '24px', display: 'grid', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  Target Degree Programme (Duration: {durationYears} Years)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedProgramme.code} — ${selectedProgramme.name} (${durationYears} Years)`}
                  className="form-input"
                  style={{ height: '40px', fontSize: '13px', fontWeight: '800', color: '#4f46e5', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  Type Start Academic Year (Numeric, &gt; 2020) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025"
                  value={startYearInput}
                  onChange={(e) => handleStartYearChange(e.target.value)}
                  className="form-input"
                  style={{ height: '40px', fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  End Academic Year (Auto-Calculated based on {durationYears}-Year Duration) *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${parseInt(startYearInput || '2025', 10) + durationYears}`}
                  value={endYearInput}
                  onChange={(e) => handleEndYearChange(e.target.value)}
                  className="form-input"
                  style={{ height: '40px', fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}
                />
              </div>

              {validationError && (
                <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} /> {validationError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5' }}>
                  Create & Set Active Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT BATCH MODAL ──────────────────────────────────────────────────────── */}
      {showEditModal && editingBatch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '540px', maxWidth: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', padding: '18px 24px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} style={{ color: '#818cf8' }} /> Edit Batch Details ({editingBatch.programmeCode})
              </h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '18px', fontWeight: '800' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditBatch} style={{ padding: '24px', display: 'grid', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  Batch Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="form-input"
                  style={{ height: '40px', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                    Start Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStartYear}
                    onChange={(e) => setEditStartYear(e.target.value)}
                    className="form-input"
                    style={{ height: '40px', fontSize: '13px', fontWeight: '700' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                    End Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={editEndYear}
                    onChange={(e) => setEditEndYear(e.target.value)}
                    className="form-input"
                    style={{ height: '40px', fontSize: '13px', fontWeight: '700' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                    Academic Year Level *
                  </label>
                  <select
                    value={editYearLevel}
                    onChange={(e) => setEditYearLevel(e.target.value)}
                    className="form-input"
                    style={{ height: '40px', fontSize: '12.5px', fontWeight: '700' }}
                  >
                    <option value="Year 1 (Freshmen)">Year 1 (Freshmen)</option>
                    <option value="Year 2 (Sophomores)">Year 2 (Sophomores)</option>
                    <option value="Year 3 (Juniors)">Year 3 (Juniors)</option>
                    <option value="Year 4 (Seniors / Final Year)">Year 4 (Seniors / Final Year)</option>
                    <option value="Upcoming Batch">Upcoming Batch</option>
                    <option value="Graduated Alumni">Graduated Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                    Status *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="form-input"
                    style={{ height: '40px', fontSize: '12.5px', fontWeight: '700' }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INITIALIZED">INITIALIZED</option>
                    <option value="GRADUATED">GRADUATED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5', gap: '6px' }}>
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
