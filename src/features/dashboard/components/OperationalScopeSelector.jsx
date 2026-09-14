import React from 'react';
import { RotateCcw, Building, School, GraduationCap, Calendar } from 'lucide-react';

export default function OperationalScopeSelector({
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
  isSchoolLocked = false,
  isDepartmentLocked = false,
  isProgrammeLocked = false,
}) {
  const selectStyle = {
    height: 38,
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    padding: '0 10px',
    fontSize: 13,
    color: '#0f172a',
    fontWeight: 500,
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
  };

  const hasAnySelection =
    (!isSchoolLocked && selectedSchoolId) ||
    (!isDepartmentLocked && selectedDepartmentId) ||
    (!isProgrammeLocked && selectedMasterProgrammeId) ||
    selectedProgrammeBatchId;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '14px 18px',
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          alignItems: 'flex-end',
        }}
      >
        {/* 1. School Selector */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#475569',
              marginBottom: 6,
            }}
          >
            <School size={13} color="#6366f1" />
            School
          </label>
          <select
            value={selectedSchoolId || ''}
            onChange={(e) => onSelectSchool(e.target.value || null)}
            disabled={isSchoolLocked}
            style={{
              ...selectStyle,
              background: isSchoolLocked ? '#f8fafc' : '#ffffff',
              color: isSchoolLocked ? '#475569' : '#0f172a',
              cursor: isSchoolLocked ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="">{isSchoolLocked ? 'All Accessible Schools' : 'All Schools (Institution Scope)'}</option>
            {schools.map((s) => (
              <option key={s.id || s.schoolId} value={s.id || s.schoolId}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Department Selector */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#475569',
              marginBottom: 6,
            }}
          >
            <Building size={13} color="#0284c7" />
            Department
          </label>
          <select
            value={selectedDepartmentId || ''}
            onChange={(e) => onSelectDepartment(e.target.value || null)}
            disabled={isDepartmentLocked}
            style={{
              ...selectStyle,
              background: isDepartmentLocked ? '#f8fafc' : '#ffffff',
              color: isDepartmentLocked ? '#475569' : '#0f172a',
              cursor: isDepartmentLocked ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id || d.departmentId} value={d.id || d.departmentId}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Programme Selector */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#475569',
              marginBottom: 6,
            }}
          >
            <GraduationCap size={13} color="#7c3aed" />
            Programme
          </label>
          <select
            value={selectedMasterProgrammeId || ''}
            onChange={(e) => onSelectProgramme(e.target.value || null)}
            disabled={isProgrammeLocked}
            style={{
              ...selectStyle,
              background: isProgrammeLocked ? '#f8fafc' : '#ffffff',
              color: isProgrammeLocked ? '#475569' : '#0f172a',
              cursor: isProgrammeLocked ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="">All Programmes</option>
            {programmes.map((p) => (
              <option key={p.id || p.masterProgrammeId} value={p.id || p.masterProgrammeId}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Batch Selector */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#475569',
              marginBottom: 6,
            }}
          >
            <Calendar size={13} color="#059669" />
            Batch
          </label>
          <select
            value={selectedProgrammeBatchId || ''}
            onChange={(e) => onSelectBatch(e.target.value || null)}
            style={selectStyle}
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id || b.programmeBatchId} value={b.id || b.programmeBatchId}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Action */}
        {hasAnySelection && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onReset}
              style={{
                height: 38,
                padding: '0 14px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#475569',
                fontSize: 12.5,
                fontWeight: 650,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <RotateCcw size={13} />
              Reset Scope
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
