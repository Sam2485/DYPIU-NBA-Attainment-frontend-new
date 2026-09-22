import React from 'react';
import { Landmark, GraduationCap, Calendar, RotateCcw } from 'lucide-react';

const selectStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 13,
  fontWeight: 600,
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 11,
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 6,
};

export default function AnalyticsSelectors({
  schools = [],
  programmes = [],
  batches = [],
  selectedSchoolId = '',
  selectedMasterProgrammeId = '',
  selectedProgrammeBatchId = '',
  onSelectSchool = () => {},
  onSelectProgramme = () => {},
  onSelectBatch = () => {},
  onReset = () => {},
  isLoadingMetadata = false,
  isLoadingBatches = false,
  showSchoolSelector = true,
}) {
  const isFiltered = showSchoolSelector
    ? Boolean(selectedSchoolId || selectedMasterProgrammeId)
    : Boolean(selectedMasterProgrammeId);

  const isProgrammeDisabled = isLoadingMetadata || (showSchoolSelector && !selectedSchoolId);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          ACADEMIC SCOPE
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showSchoolSelector
            ? 'repeat(auto-fit, minmax(220px, 1fr))'
            : 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {/* 1. School Selector (Only shown if showSchoolSelector is true) */}
        {showSchoolSelector && (
          <div>
            <label style={labelStyle}>
              <Landmark size={13} color="#0284c7" />
              <span>School</span>
            </label>
            <select
              value={selectedSchoolId || ''}
              onChange={(e) => onSelectSchool(e.target.value)}
              disabled={isLoadingMetadata}
              style={selectStyle}
            >
              <option value="" disabled>
                Select School
              </option>
              {schools.map((s) => (
                <option key={s.id || s.schoolId} value={s.id || s.schoolId}>
                  {s.name || s.code}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 2. Programme Selector (Dependent on School only if showSchoolSelector is true) */}
        <div>
          <label style={labelStyle}>
            <GraduationCap size={13} color="#059669" />
            <span>Programme</span>
          </label>
          <select
            value={selectedMasterProgrammeId || ''}
            onChange={(e) => onSelectProgramme(e.target.value)}
            disabled={isProgrammeDisabled}
            style={{
              ...selectStyle,
              background: isProgrammeDisabled ? '#f8fafc' : '#ffffff',
              cursor: isProgrammeDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="" disabled>
              {showSchoolSelector && !selectedSchoolId ? 'Select School first' : 'Select Programme'}
            </option>
            {programmes.map((p) => (
              <option key={p.id || p.masterProgrammeId} value={p.id || p.masterProgrammeId}>
                {p.name} {p.degreeAwarded ? `(${p.degreeAwarded})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Batch Selector (Dependent on Programme) */}
        <div>
          <label style={labelStyle}>
            <Calendar size={13} color="#7c3aed" />
            <span>Batch</span>
          </label>
          <select
            value={selectedProgrammeBatchId || ''}
            onChange={(e) => onSelectBatch(e.target.value)}
            disabled={!selectedMasterProgrammeId || isLoadingBatches}
            style={{
              ...selectStyle,
              background: !selectedMasterProgrammeId ? '#f8fafc' : '#ffffff',
              cursor: !selectedMasterProgrammeId ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="" disabled>
              {!selectedMasterProgrammeId
                ? 'Select Programme first'
                : isLoadingBatches
                ? 'Loading batches…'
                : 'Select Batch'}
            </option>
            {batches.map((b) => (
              <option key={b.id || b.programmeBatchId} value={b.id || b.programmeBatchId}>
                {b.name || `Batch ${b.startYear}-${b.endYear}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
