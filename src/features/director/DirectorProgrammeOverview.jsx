import { useState } from 'react';
import { GraduationCap, Layers, CheckCircle2, Clock, Eye, Building2, User } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function DirectorProgrammeOverview() {
  const {
    masterProgrammes = [],
    departments = [],
    masterBatches = [],
  } = useAcademic();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  const filteredProgrammes = masterProgrammes.filter((prog) => {
    if (selectedDeptFilter === 'ALL') return true;
    return prog.departmentId === selectedDeptFilter || prog.department === selectedDeptFilter;
  });

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fef08a', fontWeight: '800', fontSize: '11px' }}>
                DIRECTOR VIEW • PROGRAMME OVERVIEW
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              School Degree Programmes & HOD Allocation Summary
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Read-only visibility into degree programmes, managing HODs, coordinators, and batch setup statuses.
            </p>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ────────────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={16} style={{ color: '#4f46e5' }} />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Filter by Department:</span>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="form-input"
              style={{ height: '36px', fontSize: '12.5px', fontWeight: '700', color: '#4f46e5', minWidth: '240px' }}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>
            Total Programmes: <strong>{filteredProgrammes.length}</strong>
          </div>
        </div>
      </div>

      {/* ── PROGRAMMES GRID ───────────────────────────────────────────────────────── */}
      <div className="grid-cards-2" style={{ gap: '16px' }}>
        {filteredProgrammes.map((prog) => {
          const deptObj = departments.find((d) => d.id === prog.departmentId || d.name === prog.department) || departments[0];

          return (
            <div
              key={prog.id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1.5px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px' }}>
                    {prog.code}
                  </span>
                  <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '11px' }}>
                    Read-Only Visibility
                  </span>
                </div>

                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                  {prog.name}
                </h4>

                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                  Department: <strong style={{ color: '#0f172a' }}>{deptObj?.name || prog.department}</strong>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e2e8f0', display: 'grid', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Supervising HOD:</span>
                    <strong style={{ color: '#059669' }}>{deptObj?.hod || 'Dr. Raj Shaikh'}</strong>
                  </div>

                  <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Programme Coordinator:</span>
                    <strong style={{ color: '#4f46e5' }}>{prog.coordinator || 'Dr. A. K. Sharma'}</strong>
                  </div>

                  <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Active Batch Cycle:</span>
                    <strong style={{ color: '#0f172a' }}>Batch 2025-29 (AY 2025-26)</strong>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} style={{ color: '#10b981' }} /> PO & PSO Framework Configured
                </div>

                <span style={{ fontSize: '11.5px', color: '#4f46e5', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={13} /> View Status
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
