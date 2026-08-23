import { useState, useEffect } from 'react';
import { Building2, Layers, ChevronRight } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { ScreenLoadingState, ScreenErrorState, ScreenEmptyState } from '../../components/common/ScreenState';

export default function DirectorSchoolStructure() {
  const {
    selectedSchool = null,
    selectedSchoolId,
    departments = [],
    masterProgrammes = [],
    loadSchools,
    loadDepartments,
    loadMasterProgrammes,
  } = useAcademic();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDeptId, setExpandedDeptId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const schools = await (loadSchools ? loadSchools() : Promise.resolve([]));
      const schoolId =
        selectedSchoolId ??
        selectedSchool?.id ??
        schools[0]?.id ??
        null;

      await Promise.allSettled([
        loadDepartments ? loadDepartments(schoolId) : Promise.resolve(),
        loadMasterProgrammes ? loadMasterProgrammes() : Promise.resolve(),
      ]);
    } catch (err) {
      console.warn('DirectorSchoolStructure fetch failed:', err);
      setError(err?.customMessage || err?.message || 'Failed to load school structure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [loadDepartments, loadMasterProgrammes, loadSchools, selectedSchool?.id, selectedSchoolId]);

  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';

  if (loading && departments.length === 0 && !selectedSchool) {
    return <ScreenLoadingState message="Loading School Structure..." />;
  }

  if (error && departments.length === 0 && !selectedSchool) {
    return <ScreenErrorState title="Failed to load School Structure" message={error} onRetry={fetchData} />;
  }

  const schoolDisplayName = selectedSchool?.name ?? '—';
  const schoolDisplayCode = selectedSchool?.code ?? '—';
  const schoolDeanName = selectedSchool?.dean ?? '—';
  const schoolEstYear = selectedSchool?.estYear ?? '—';

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '22px 26px', marginBottom: '24px' }}>
        <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Director View
        </div>
        <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
          School Structure & Hierarchy
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
          {schoolDisplayName} ({schoolDisplayCode})
        </p>
      </div>

      {/* ── SCHOOL INFO CARD ─────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '22px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eef2ff', color: accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{schoolDisplayName}</div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
              Dean: <strong style={{ color: ink }}>{schoolDeanName}</strong>
              &nbsp;·&nbsp; Est. {schoolEstYear}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ ...surface, padding: '12px 18px', textAlign: 'center', minWidth: '88px' }}>
            <div style={{ fontSize: '11px', color: muted, fontWeight: '600', marginBottom: '2px' }}>Departments</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: ink }}>{departments?.length ?? 0}</div>
          </div>
          <div style={{ ...surface, padding: '12px 18px', textAlign: 'center', minWidth: '88px' }}>
            <div style={{ fontSize: '11px', color: muted, fontWeight: '600', marginBottom: '2px' }}>Programmes</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: accent }}>{masterProgrammes?.length ?? 0}</div>
          </div>
        </div>
      </div>

      {/* ── SECTION LABEL ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Layers size={15} style={{ color: accent }} />
        <span style={{ fontSize: '12px', fontWeight: '700', color: muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Department & Programme Tree
        </span>
      </div>

      {/* ── HIERARCHY TREE ───────────────────────────────────────────────────── */}
      {departments.length === 0 ? (
        <div style={{ ...surface, padding: '24px' }}>
          <ScreenEmptyState title="No Departments Found" description="No departments are registered under this school structure." />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {departments.map((dept) => {
            const deptProgrammes = masterProgrammes.filter(
              (p) => p.departmentId === dept.id
            );
            const isExpanded = expandedDeptId === dept.id;
            const isAssigned = dept.hod && dept.hod !== 'Unassigned';

            return (
              <div key={dept.id} style={{ ...surface, overflow: 'hidden' }}>
                {/* Dept row */}
                <div
                  onClick={() => setExpandedDeptId(isExpanded ? null : dept.id)}
                  style={{ padding: '17px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none', background: isExpanded ? '#fafafa' : '#ffffff', transition: 'background .15s' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eef2ff', color: accent, display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '11px', flexShrink: 0 }}>
                    {dept.code}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: ink }}>{dept.name}</div>
                    <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>
                      HOD: <span style={{ color: isAssigned ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{dept.hod || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: muted, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '2px 8px', fontWeight: '600' }}>
                      {deptProgrammes.length} prog.
                    </span>
                    <ChevronRight size={15} style={{ color: '#94a3b8', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
                  </div>
                </div>

                {/* Programmes list */}
                {isExpanded && (
                  <div style={{ padding: '16px 20px 18px 56px', background: '#f8fafc' }}>
                    {deptProgrammes.length === 0 ? (
                      <div style={{ fontSize: '12px', color: muted, fontStyle: 'italic' }}>No programmes added to this department.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {deptProgrammes.map((p) => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: ink }}>{p.name}</div>
                              <div style={{ fontSize: '11.5px', color: muted }}>
                                Code: <strong>{p.code}</strong> &nbsp;·&nbsp; Duration: {p.durationYears ?? '—'} Years &nbsp;·&nbsp; Coordinator: <span style={{ color: p.coordinator ? '#4f46e5' : '#94a3b8', fontWeight: '600' }}>{p.coordinator || 'Unassigned'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
