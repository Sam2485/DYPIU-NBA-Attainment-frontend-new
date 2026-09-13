import React from 'react';
import { Filter, RotateCcw, Building2, Landmark, GraduationCap, Calendar, Check } from 'lucide-react';

const selectStyle = {
  width: '100%',
  padding: '7px 10px',
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
  gap: 5,
  fontSize: 10.5,
  fontWeight: 700,
  color: '#475569',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  marginBottom: 5,
};

export default function AnalyticsFilterBar({
  schools = [],
  departments = [],
  programmes = [],
  batches = [],
  selectedSchoolId = null,
  selectedDepartmentId = null,
  selectedMasterProgrammeId = null,
  selectedProgrammeBatchId = null,
  onSelectSchool = () => {},
  onSelectDepartment = () => {},
  onSelectProgramme = () => {},
  onSelectBatch = () => {},
  onReset = () => {},
  isLoadingMetadata = false,
}) {
  const hasActiveFilters = Boolean(
    selectedSchoolId || selectedDepartmentId || selectedMasterProgrammeId || selectedProgrammeBatchId
  );

  const activeFilterCount = [
    selectedSchoolId,
    selectedDepartmentId,
    selectedMasterProgrammeId,
    selectedProgrammeBatchId,
  ].filter(Boolean).length;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '14px 18px',
        marginBottom: 16,
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eef2ff', color: '#4f46e5', display: 'grid', placeItems: 'center' }}>
            <Filter size={15} />
          </div>
          <div>
            <strong style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>Institutional Scope Filters</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {hasActiveFilters && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 999,
                background: '#e0e7ff',
                color: '#3730a3',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Check size={12} />
              {activeFilterCount} {activeFilterCount === 1 ? 'Filter' : 'Filters'} Active
            </span>
          )}

          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters || isLoadingMetadata}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
              opacity: hasActiveFilters ? 1 : 0.45,
              background: '#ffffff',
              color: hasActiveFilters ? '#4f46e5' : '#94a3b8',
              border: '1px solid #cbd5e1',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={13} />
            Reset Filters
          </button>
        </div>
      </div>

      {/* 4 Cascading Dropdown Selectors */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {/* 1. School Selector */}
        <div>
          <label style={labelStyle}>
            <Landmark size={12} color="#0284c7" />
            <span>1. School</span>
          </label>
          <select
            id="analytics-filter-school"
            aria-label="1. Filter by School"
            value={selectedSchoolId || ''}
            onChange={(e) => onSelectSchool(e.target.value || null)}
            disabled={isLoadingMetadata}
            style={selectStyle}
          >
            <option value="">All Schools (Institutional)</option>
            {schools.map((school) => (
              <option key={school.id || school.schoolId} value={school.id || school.schoolId}>
                {school.name || school.code || `School #${school.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Department Selector */}
        <div>
          <label style={labelStyle}>
            <Building2 size={12} color="#059669" />
            <span>2. Department</span>
          </label>
          <select
            id="analytics-filter-department"
            aria-label="2. Filter by Department"
            value={selectedDepartmentId || ''}
            onChange={(e) => onSelectDepartment(e.target.value || null)}
            disabled={isLoadingMetadata}
            style={selectStyle}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id || dept.departmentId} value={dept.id || dept.departmentId}>
                {dept.name || dept.code || `Department #${dept.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Programme Selector */}
        <div>
          <label style={labelStyle}>
            <GraduationCap size={12} color="#d97706" />
            <span>3. Master Programme</span>
          </label>
          <select
            id="analytics-filter-programme"
            aria-label="3. Filter by Master Programme"
            value={selectedMasterProgrammeId || ''}
            onChange={(e) => onSelectProgramme(e.target.value || null)}
            disabled={isLoadingMetadata}
            style={selectStyle}
          >
            <option value="">All Programmes</option>
            {programmes.map((prog) => (
              <option key={prog.id || prog.masterProgrammeId} value={prog.id || prog.masterProgrammeId}>
                {prog.name} {prog.degreeAwarded ? `(${prog.degreeAwarded})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Batch / Cohort Selector */}
        <div>
          <label style={labelStyle}>
            <Calendar size={12} color="#7c3aed" />
            <span>4. Cohort Batch</span>
          </label>
          <select
            id="analytics-filter-batch"
            aria-label="4. Filter by Cohort Batch"
            value={selectedProgrammeBatchId || ''}
            onChange={(e) => onSelectBatch(e.target.value || null)}
            disabled={isLoadingMetadata || !selectedMasterProgrammeId}
            style={{
              ...selectStyle,
              background: !selectedMasterProgrammeId ? '#f8fafc' : '#ffffff',
              cursor: !selectedMasterProgrammeId ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="">
              {!selectedMasterProgrammeId
                ? 'Select a Programme first'
                : 'All Batches (Cumulative)'}
            </option>
            {batches.map((batch) => (
              <option key={batch.id || batch.programmeBatchId} value={batch.id || batch.programmeBatchId}>
                {batch.name || `Batch ${batch.startYear}-${batch.endYear}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
