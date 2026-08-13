import { useState, useEffect } from 'react';
import { Building2, Users, GraduationCap, ChevronRight, Layers, Check, UserCheck } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { getSchools, getDirectorSchoolSummary } from '../../api/academic';

export default function DirectorSchoolStructure() {
  const {
    selectedSchool = { id: 'sch-1', name: 'School of Engineering & Technology', code: 'SET', dean: 'Dr. R. K. Deshmukh', estYear: '2019' },
    departments = [],
    masterProgrammes = [],
    updateSchoolInfo = () => {},
  } = useAcademic();

  const [summaryStats, setSummaryStats] = useState(null);

  useEffect(() => {
    getSchools()
      .then((res) => {
        const schools = res?.data || res || [];
        if (Array.isArray(schools) && schools.length > 0) {
          const sch = schools[0];
          updateSchoolInfo(sch.id || 'sch-1', sch);
        }
      })
      .catch((err) => console.warn('Backend schools API offline fallback:', err));

    getDirectorSchoolSummary(selectedSchool.id || 'sch-1')
      .then((res) => {
        const summary = res?.data || res;
        if (summary) setSummaryStats(summary);
      })
      .catch((err) => console.warn('Backend school summary API offline fallback:', err));
  }, []);

  const [expandedDeptId, setExpandedDeptId] = useState(departments[0]?.id || 'dept-1');

  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';

  const totalDeptCount = summaryStats?.totalDepartments ?? departments.length;
  const assignedHodCount = summaryStats?.assignedHODsCount ?? departments.filter((d) => d.hod && d.hod !== 'Unassigned').length;
  const totalProgCount = summaryStats?.totalProgrammes ?? masterProgrammes.length;

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Director View
        </div>
        <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
          School Structure & Hierarchy
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
          {summaryStats?.schoolName || selectedSchool.name} ({summaryStats?.schoolCode || selectedSchool.code})
        </p>
      </div>

      {/* ── SCHOOL INFO CARD ─────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '18px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eef2ff', color: accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{summaryStats?.schoolName || selectedSchool.name}</div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
              Dean: <strong style={{ color: ink }}>{summaryStats?.deanName || selectedSchool.dean}</strong>
              &nbsp;·&nbsp; Est. {summaryStats?.estYear || selectedSchool.estYear}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ ...surface, padding: '10px 18px', textAlign: 'center', minWidth: '80px' }}>
            <div style={{ fontSize: '11px', color: muted, fontWeight: '600', marginBottom: '2px' }}>Departments</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: ink }}>{totalDeptCount}</div>
          </div>
          <div style={{ ...surface, padding: '10px 18px', textAlign: 'center', minWidth: '80px' }}>
            <div style={{ fontSize: '11px', color: muted, fontWeight: '600', marginBottom: '2px' }}>HODs Assigned</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>{assignedHodCount}</div>
          </div>
          <div style={{ ...surface, padding: '10px 18px', textAlign: 'center', minWidth: '80px' }}>
            <div style={{ fontSize: '11px', color: muted, fontWeight: '600', marginBottom: '2px' }}>Programmes</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: accent }}>{totalProgCount}</div>
          </div>
        </div>
      </div>

      {/* ── SECTION LABEL ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
        <Layers size={15} style={{ color: accent }} />
        <span style={{ fontSize: '12px', fontWeight: '700', color: muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Department & Programme Tree
        </span>
      </div>

      {/* ── HIERARCHY TREE ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {departments.map((dept) => {
          const deptProgrammes = masterProgrammes.filter(
            (p) => p.departmentId === dept.id || p.department === dept.name || dept.id === 'dept-1'
          );
          const isExpanded = expandedDeptId === dept.id;
          const isAssigned = dept.hod && dept.hod !== 'Unassigned';

          return (
            <div key={dept.id} style={{ ...surface, overflow: 'hidden' }}>
              {/* Dept row */}
              <div
                onClick={() => setExpandedDeptId(isExpanded ? null : dept.id)}
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none', background: isExpanded ? '#fafafa' : '#ffffff', transition: 'background .15s' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eef2ff', color: accent, display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '11px', flexShrink: 0 }}>
                  {dept.code}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: ink }}>{dept.name}</div>
                  <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>
                    HOD: <span style={{ color: isAssigned ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{dept.hod}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: muted, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '2px 8px', fontWeight: '600' }}>
                    {deptProgrammes.length} prog.
                  </span>
                  <ChevronRight size={15} style={{ color: '#94a3b8', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
                </div>
              </div>

              {/* Expanded programmes */}
              {isExpanded && (
                <div style={{ padding: '14px 18px', background: '#fafafa' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    Programmes under {dept.name}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                    {deptProgrammes.map((prog) => (
                      <div key={prog.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '9px', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: '700', color: accent, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '4px', padding: '1px 7px' }}>
                            {prog.code}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', color: '#16a34a', fontWeight: '600' }}>
                            <Check size={11} /> Active
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: ink, lineHeight: '1.3', marginBottom: '4px' }}>{prog.name}</div>
                        <div style={{ fontSize: '11.5px', color: muted }}>
                          Coordinator: {prog.coordinator && prog.coordinator !== 'No coordinator assigned yet' && prog.coordinator !== 'Pending HOD Assignment' ? (
                            <span style={{ color: accent, fontWeight: '700', background: '#eef2ff', padding: '1px 6px', borderRadius: '4px' }}>
                              {prog.coordinator}
                            </span>
                          ) : (
                            <span style={{ color: '#d97706', fontWeight: '700', background: '#fffbeb', padding: '1px 6px', borderRadius: '4px' }}>
                              No coordinator assigned yet
                            </span>
                          )}
                        </div>
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
