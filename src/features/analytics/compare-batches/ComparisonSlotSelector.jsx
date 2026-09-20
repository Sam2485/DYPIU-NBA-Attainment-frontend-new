import React, { useState, useEffect } from 'react';
import { academicApi } from '../../../api';
import { GraduationCap, Layers, Plus, Trash2, GitCompare, AlertCircle } from 'lucide-react';

const selectStyle = {
  width: '100%',
  padding: '9px 14px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 13,
  fontWeight: 600,
  outline: 'none',
  cursor: 'pointer',
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 11.5,
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 6,
};

export default function ComparisonSlotSelector({
  slot1,
  slot2,
  onAddSlot,
  onRemoveSlot,
  onCompare,
  isLoading = false,
  initialProgrammeId = '',
}) {
  const [programmes, setProgrammes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState(initialProgrammeId || '');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loadingProgrammes, setLoadingProgrammes] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Sync initialProgrammeId if provided from parent (e.g. current batch)
  useEffect(() => {
    if (initialProgrammeId) {
      setSelectedProgrammeId(initialProgrammeId);
    }
  }, [initialProgrammeId]);

  // Load all Master Programmes
  useEffect(() => {
    setLoadingProgrammes(true);
    academicApi
      .getMasterProgrammes()
      .then((res) => {
        const payload = res?.data?.data ?? res?.data ?? res;
        const list = Array.isArray(payload) ? payload : (payload?.content || []);
        setProgrammes(list);
        if (list.length > 0) {
          // If initialProgrammeId matches one of the programmes, select it, else first
          const match = initialProgrammeId && list.find((p) => p.id === initialProgrammeId);
          setSelectedProgrammeId((prev) => (prev ? prev : (match ? match.id : list[0].id)));
        }
      })
      .catch((err) => {
        console.error('[ComparisonSlotSelector] Error loading programmes:', err);
      })
      .finally(() => {
        setLoadingProgrammes(false);
      });
  }, [initialProgrammeId]);

  // Load Batches whenever selectedProgrammeId changes
  useEffect(() => {
    if (!selectedProgrammeId) {
      setBatches([]);
      setSelectedBatchId('');
      return;
    }

    setLoadingBatches(true);
    setSelectedBatchId('');
    academicApi
      .getBatches({ masterProgrammeId: selectedProgrammeId, status: 'ALL' })
      .then((res) => {
        const payload = res?.data?.data ?? res?.data ?? res;
        const list = Array.isArray(payload) ? payload : (payload?.content || []);
        // Sort batches chronologically (descending start year)
        const sorted = [...list].sort((a, b) => (b.startYear || 0) - (a.startYear || 0));
        setBatches(sorted);

        // Pre-select first batch not already present in slot1 or slot2
        const available = sorted.find((b) => b.id !== slot1?.batchId && b.id !== slot2?.batchId);
        if (available) {
          setSelectedBatchId(available.id);
        } else if (sorted.length > 0) {
          setSelectedBatchId(sorted[0].id);
        }
      })
      .catch((err) => {
        console.error('[ComparisonSlotSelector] Error loading batches:', err);
        setBatches([]);
      })
      .finally(() => {
        setLoadingBatches(false);
      });
  }, [selectedProgrammeId, slot1?.batchId, slot2?.batchId]);

  const handleAddBatch = () => {
    setValidationError(null);
    if (!selectedProgrammeId || !selectedBatchId) return;

    const prog = programmes.find((p) => p.id === selectedProgrammeId);
    const batch = batches.find((b) => b.id === selectedBatchId);
    if (!prog || !batch) return;

    // Validate that this exact batch is not already in slot1 or slot2
    if ((slot1 && slot1.batchId === batch.id) || (slot2 && slot2.batchId === batch.id)) {
      setValidationError('This batch is already added to comparison. Please choose a different batch.');
      return;
    }

    onAddSlot({
      programmeId: prog.id,
      programmeName: prog.name,
      batchId: batch.id,
      batchName: batch.name || `Batch ${batch.startYear}-${batch.endYear}`,
      startYear: batch.startYear,
      endYear: batch.endYear,
      status: batch.status || 'ACTIVE',
    });
  };

  const isBothSlotsFilled = Boolean(slot1 && slot2);
  const canAddMore = !slot1 || !slot2;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '24px 28px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Compare Programme Batches
        </h2>
        <span style={{ fontSize: 12.5, color: '#64748b' }}>
          Select two programme batches to compare their PO/PSO attainment side-by-side. Supports both active and completed batches.
        </span>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12.5,
            color: '#b91c1c',
          }}
        >
          <AlertCircle size={15} color="#dc2626" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Selector Inputs Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        {/* Programme Dropdown */}
        <div>
          <label style={labelStyle}>
            <GraduationCap size={14} color="#0284c7" />
            <span>Programme</span>
          </label>
          <select
            value={selectedProgrammeId}
            onChange={(e) => setSelectedProgrammeId(e.target.value)}
            disabled={loadingProgrammes}
            style={selectStyle}
          >
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.code ? `(${p.code})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Dropdown */}
        <div>
          <label style={labelStyle}>
            <Layers size={14} color="#0284c7" />
            <span>Batch</span>
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            disabled={loadingBatches || batches.length === 0}
            style={selectStyle}
          >
            {batches.length === 0 ? (
              <option value="">{loadingBatches ? 'Loading batches...' : 'No batches found'}</option>
            ) : (
              batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name || `Batch ${b.startYear}-${b.endYear}`} [{b.status || 'ACTIVE'}]
                </option>
              ))
            )}
          </select>
        </div>

        {/* Add Batch Button */}
        <div>
          <button
            type="button"
            onClick={handleAddBatch}
            disabled={!canAddMore || !selectedBatchId}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              padding: '9px 18px',
              borderRadius: 8,
              background: canAddMore && selectedBatchId ? '#0284c7' : '#e2e8f0',
              color: canAddMore && selectedBatchId ? '#ffffff' : '#94a3b8',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: canAddMore && selectedBatchId ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s ease',
            }}
          >
            <Plus size={15} />
            <span>+ Add Batch for Comparison</span>
          </button>
        </div>
      </div>

      {/* Comparison Slots Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginTop: 10,
          paddingTop: 18,
          borderTop: '1px solid #f1f5f9',
        }}
      >
        {/* SLOT 1 */}
        <div
          style={{
            background: slot1 ? '#f8fafc' : '#ffffff',
            border: slot1 ? '1.5px solid #0284c7' : '1.5px dashed #cbd5e1',
            borderRadius: 12,
            padding: 16,
            minHeight: 110,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {slot1 ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Comparison Slot 1
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      background: slot1.status === 'ACTIVE' ? '#f0fdf4' : '#f1f5f9',
                      color: slot1.status === 'ACTIVE' ? '#166534' : '#475569',
                      border: `1px solid ${slot1.status === 'ACTIVE' ? '#bbf7d0' : '#cbd5e1'}`,
                    }}
                  >
                    {slot1.status}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {slot1.programmeName}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                  {slot1.batchName}
                </div>
              </div>

              {/* Prominent Remove Option for Slot 1 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => onRemoveSlot(1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#dc2626',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fee2e2';
                    e.currentTarget.style.borderColor = '#fca5a5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.borderColor = '#fee2e2';
                  }}
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Comparison Slot 1</div>
              <div style={{ fontSize: 11 }}>Choose programme &amp; batch above, then click Add</div>
            </div>
          )}
        </div>

        {/* SLOT 2 */}
        <div
          style={{
            background: slot2 ? '#f8fafc' : '#ffffff',
            border: slot2 ? '1.5px solid #8b5cf6' : '1.5px dashed #cbd5e1',
            borderRadius: 12,
            padding: 16,
            minHeight: 110,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {slot2 ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Comparison Slot 2
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      background: slot2.status === 'ACTIVE' ? '#f0fdf4' : '#f1f5f9',
                      color: slot2.status === 'ACTIVE' ? '#166534' : '#475569',
                      border: `1px solid ${slot2.status === 'ACTIVE' ? '#bbf7d0' : '#cbd5e1'}`,
                    }}
                  >
                    {slot2.status}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {slot2.programmeName}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                  {slot2.batchName}
                </div>
              </div>

              {/* Prominent Remove Option for Slot 2 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => onRemoveSlot(2)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#dc2626',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fee2e2';
                    e.currentTarget.style.borderColor = '#fca5a5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.borderColor = '#fee2e2';
                  }}
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Comparison Slot 2</div>
              <div style={{ fontSize: 11 }}>Choose programme &amp; batch above, then click Add</div>
            </div>
          )}
        </div>
      </div>

      {/* Compare Batches Action Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <button
          type="button"
          onClick={onCompare}
          disabled={!isBothSlotsFilled || isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 28px',
            borderRadius: 8,
            background: isBothSlotsFilled ? '#0284c7' : '#cbd5e1',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 800,
            border: 'none',
            cursor: isBothSlotsFilled && !isLoading ? 'pointer' : 'not-allowed',
            boxShadow: isBothSlotsFilled ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <GitCompare size={16} />
          <span>{isLoading ? 'Comparing...' : 'Compare Batches'}</span>
        </button>
      </div>
    </div>
  );
}
