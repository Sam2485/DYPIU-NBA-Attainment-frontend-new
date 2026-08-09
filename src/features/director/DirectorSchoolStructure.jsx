import { useState } from 'react';
import { Building2, Users, GraduationCap, ChevronRight, Layers, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function DirectorSchoolStructure() {
  const {
    selectedSchool = { name: 'School of Engineering & Technology', code: 'SET', dean: 'Dr. R. K. Deshmukh', estYear: '2019' },
    departments = [],
    masterProgrammes = [],
  } = useAcademic();

  const [expandedDeptId, setExpandedDeptId] = useState('dept-1');

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fef08a', fontWeight: '800', fontSize: '11px' }}>
                DIRECTOR VIEW • SCHOOL STRUCTURE & HIERARCHY
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              School Information & Organizational Hierarchy
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Structural breakdown of departments, degree programmes, and leadership allocation for {selectedSchool.name}
            </p>
          </div>
        </div>
      </div>

      {/* ── SCHOOL INFORMATION SUMMARY CARD ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1.5px solid #cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#4f46e5', color: '#ffffff', display: 'grid', placeItems: 'center', boxShadow: '0 6px 16px rgba(79,70,229,0.3)' }}>
              <Building2 size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '900' }}>
                {selectedSchool.name} ({selectedSchool.code})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Dean / Director: <strong style={{ color: '#4f46e5' }}>{selectedSchool.dean}</strong> • Established: <strong>{selectedSchool.estYear}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ background: '#ffffff', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Departments</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{departments.length || 4}</div>
            </div>
            <div style={{ background: '#ffffff', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Programmes</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#4f46e5' }}>{masterProgrammes.length || 8}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ORGANIZATIONAL HIERARCHY TREE & CARDS ───────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} style={{ color: '#4f46e5' }} />
          Department & Programme Organizational Tree
        </h3>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {departments.map((dept) => {
          const deptProgrammes = masterProgrammes.filter((p) => p.departmentId === dept.id || p.department === dept.name || dept.id === 'dept-1');
          const isExpanded = expandedDeptId === dept.id;

          return (
            <div
              key={dept.id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1.5px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              }}
            >
              {/* Dept Header Bar */}
              <div
                onClick={() => setExpandedDeptId(isExpanded ? null : dept.id)}
                style={{
                  padding: '16px 20px',
                  background: isExpanded ? '#f8fafc' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'grid', placeItems: 'center', fontWeight: '900', fontSize: '13px' }}>
                    {dept.code}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
                      {dept.name}
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      Head of Department: <strong style={{ color: dept.hod === 'Unassigned' ? '#dc2626' : '#059669' }}>{dept.hod}</strong> {dept.hodEmail && `(${dept.hodEmail})`}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-active" style={{ background: '#f1f5f9', color: '#475569', fontWeight: '800', fontSize: '11.5px' }}>
                    {deptProgrammes.length} Programmes
                  </span>
                  <ChevronRight size={18} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease', color: '#64748b' }} />
                </div>
              </div>

              {/* Dept Programmes List */}
              {isExpanded && (
                <div style={{ padding: '20px', background: '#fafafa' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '12px' }}>
                    Degree Programmes Mapped under {dept.name}:
                  </div>

                  <div className="grid-cards-2" style={{ gap: '12px' }}>
                    {deptProgrammes.map((prog) => (
                      <div
                        key={prog.id}
                        style={{
                          background: '#ffffff',
                          padding: '14px 18px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontSize: '10.5px', fontWeight: '800' }}>
                              {prog.code}
                            </span>
                            <strong style={{ fontSize: '13px', color: '#0f172a' }}>{prog.name}</strong>
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                            Programme Coordinator: <strong style={{ color: '#0f172a' }}>{prog.coordinator || 'Dr. A. K. Sharma'}</strong>
                          </div>
                        </div>

                        <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '800' }}>
                          ✓ Active Batch
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
