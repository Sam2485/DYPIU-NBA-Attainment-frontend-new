import { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Clock, Layers, Sparkles, GraduationCap, Building2, AlertCircle } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function HodBatchManagement() {
  const {
    masterProgrammes = [],
    batches = [],
    batchId,
    setBatchId,
    addBatch = () => {},
  } = useAcademic();

  // Programme Selection State (Programmes fetched from Director)
  const [selectedProgrammeId, setSelectedProgrammeId] = useState(masterProgrammes[0]?.id || 'prog-1');
  const selectedProgramme = masterProgrammes.find((p) => p.id === selectedProgrammeId) || masterProgrammes[0] || { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  // Add Batch Modal & Form State (Typed Numeric Inputs > 2020)
  const [showAddModal, setShowAddModal] = useState(false);
  const [startYearInput, setStartYearInput] = useState('2025');
  const [endYearInput, setEndYearInput] = useState('2029');
  const [validationError, setValidationError] = useState('');

  // Filter batches by selected programme allocated by Director
  const programmeBatches = batches.filter(
    (b) => !b.programmeId || b.programmeId === selectedProgrammeId
  );

  const handleStartYearChange = (val) => {
    const numericOnly = val.replace(/\D/g, '').slice(0, 4);
    setStartYearInput(numericOnly);

    if (numericOnly.length === 4) {
      const num = parseInt(numericOnly, 10);
      if (num <= 2020) {
        setValidationError('⚠️ Academic start year must be greater than AY 2020 (e.g. 2021 or later).');
      } else {
        setValidationError('');
        setEndYearInput(String(num + 4));
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
      alert('Please enter a valid 4-digit numeric End Academic Year (e.g. 2029).');
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
      name: `Batch ${startNum}-${String(endNum).slice(-2)} (${selectedProgramme.code}) — AY ${startAY} to ${endAY}`,
      startYear: startAY,
      endYear: endAY,
      status: 'INITIALIZED',
    };

    addBatch(newBatch);
    setBatchId(newBatch.id);
    alert(`🎉 New Academic Batch initialized under ${selectedProgramme.name}: ${newBatch.name}!`);
    setShowAddModal(false);
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fef08a', fontWeight: '800', fontSize: '11px' }}>
                HOD PORTAL • BATCH INITIALIZATION
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              Programme-Wise Batch Initialization & Control
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Select a degree programme allocated by the Director, then type the numeric 4-year batch start/end years (&gt; 2020).
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ height: '40px', padding: '0 20px', fontSize: '12.5px', fontWeight: '800', gap: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <Plus size={16} /> + Type & Create Batch Year
          </button>
        </div>
      </div>

      {/* ── STEP 1: SELECT PROGRAMME ALLOCATED BY DIRECTOR ───────────────────────── */}
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
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── STEP 2: BATCHES LIST FOR SELECTED PROGRAMME ───────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
          2. Initialized 4-Year Batches under {selectedProgramme.code}
        </h3>

        <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>
          Total Batches: <strong>{programmeBatches.length}</strong>
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
              Click the button below to type and add the first 4-year academic batch cycle under this programme.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ padding: '0 20px', height: '38px', fontSize: '12.5px', fontWeight: '800' }}
            >
              + Type & Add Batch Year for {selectedProgramme.code}
            </button>
          </div>
        ) : (
          programmeBatches.map((batch) => {
            const isActive = batch.id === batchId;

            return (
              <div
                key={batch.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: isActive ? '2px solid #4f46e5' : '1.5px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: isActive ? '0 8px 24px rgba(79,70,229,0.12)' : '0 4px 12px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px' }}>
                      {batch.programmeCode || selectedProgramme.code} • 4-YEAR CYCLE
                    </span>

                    {isActive ? (
                      <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '11.5px' }}>
                        ✓ CURRENT ACTIVE BATCH
                      </span>
                    ) : (
                      <span className="badge badge-pending" style={{ background: '#f1f5f9', color: '#64748b', fontWeight: '700', fontSize: '11.5px' }}>
                        INACTIVE
                      </span>
                    )}
                  </div>

                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15.5px', color: '#0f172a', fontWeight: '800' }}>
                    {batch.name}
                  </h4>

                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                    Programme: <strong style={{ color: '#0f172a' }}>{batch.programmeName || selectedProgramme.name}</strong>
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Duration: <strong>AY {batch.startYear || '2025-26'}</strong> to <strong>AY {batch.endYear || '2028-29'}</strong>
                  </p>
                </div>

                <div style={{ paddingTop: '14px', marginTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Status: <strong style={{ color: '#0f172a' }}>{batch.status || 'ACTIVE'}</strong>
                  </span>

                  {!isActive && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setBatchId(batch.id)}
                      style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '800', gap: '4px' }}
                    >
                      Set as Active Batch
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── INITIALIZE BATCH UNDER PROGRAMME MODAL (TYPED NUMERIC INPUTS > 2020) ───── */}
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
                Type & Create Batch Year for {selectedProgramme.code}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '18px', fontWeight: '800' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBatch} style={{ padding: '24px', display: 'grid', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  Target Degree Programme (Allocated by Director)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedProgramme.code} — ${selectedProgramme.name}`}
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
                  Type End Academic Year (Numeric, &gt; Start Year) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2029"
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
    </div>
  );
}
