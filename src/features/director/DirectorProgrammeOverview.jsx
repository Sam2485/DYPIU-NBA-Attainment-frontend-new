import { useState } from 'react';
import { GraduationCap, Building2, Check, ChevronDown } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function DirectorProgrammeOverview() {
  const {
    masterProgrammes = [],
    departments = [],
  } = useAcademic();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';

  const filteredProgrammes = masterProgrammes.filter((prog) => {
    if (selectedDeptFilter === 'ALL') return true;
    return prog.departmentId === selectedDeptFilter || prog.department === selectedDeptFilter;
  });

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Director View</div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>Programme Overview</h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>Degree programmes, coordinators, and batch status across all departments.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={14} style={{ color: muted }} />
          <div style={{ position: 'relative' }}>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              style={{ height: '38px', paddingLeft: '12px', paddingRight: '32px', fontSize: '12.5px', fontWeight: '600', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', color: ink, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none' }}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.code} – {d.name}</option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>
          <span style={{ fontSize: '12px', color: muted, whiteSpace: 'nowrap' }}>
            {filteredProgrammes.length} programme{filteredProgrammes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── PROGRAMMES GRID ──────────────────────────────────────────────────── */}
      {filteredProgrammes.length === 0 ? (
        <div style={{ ...surface, padding: '48px', textAlign: 'center', color: muted, fontSize: '13px' }}>
          No programmes found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {filteredProgrammes.map((prog) => {
            const deptObj = departments.find((d) => d.id === prog.departmentId || d.name === prog.department) || departments[0];

            return (
              <div key={prog.id} style={{ ...surface, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: accent, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '5px', padding: '2px 9px' }}>
                    {prog.code}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16a34a', fontWeight: '600', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                    <Check size={11} /> Active
                  </span>
                </div>

                {/* Name */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: ink, lineHeight: '1.3', marginBottom: '3px' }}>{prog.name}</div>
                  <div style={{ fontSize: '11.5px', color: muted }}>{deptObj?.name || prog.department}</div>
                </div>

                {/* Details */}
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', border: '1px solid #f1f5f9', display: 'grid', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: muted }}>Supervising HOD</span>
                    <span style={{ fontWeight: '600', color: ink }}>{deptObj?.hod || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: muted }}>Coordinator</span>
                    <span style={{ fontWeight: '600', color: accent }}>{prog.coordinator || 'Dr. A. K. Sharma'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: muted }}>Active Batch</span>
                    <span style={{ fontWeight: '600', color: ink }}>2025–29 (AY 2025-26)</span>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                  <GraduationCap size={13} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '11.5px', color: muted }}>PO & PSO framework configured</span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
