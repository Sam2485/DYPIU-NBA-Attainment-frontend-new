import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, GraduationCap, ChevronRight, Layers, Check, Plus, AlertCircle } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { getDirectorSchoolSummary, getDepartmentSummary, getProgrammes } from '../../api/academic';

export default function DirectorSchoolStructure() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedSchool = { id: 'sch-1', name: 'School of Engineering & Technology', code: 'SET', dean: 'Dr. R. K. Deshmukh', estYear: '2019' },
    departments = [],
    masterProgrammes = [],
    updateSchoolInfo = () => {},
  } = useAcademic();

  const [schoolSummary, setSchoolSummary] = useState(null);
  const [deptSummaryList, setDeptSummaryList] = useState([]);
  const [programmeList, setProgrammeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDeptId, setExpandedDeptId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // 1. Fetch Director School Summary
    getDirectorSchoolSummary('', user?.email || '', user?.name || '')
      .then((res) => {
        const data = res?.data?.data || res?.data || res;
        console.log('[DirectorSchoolStructure] loaded school summary:', data);
        if (data && isMounted) {
          setSchoolSummary(data);
          if (data.schoolId) {
            updateSchoolInfo(data.schoolId, data);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch director school summary:', err));

    // 2. Fetch Department Summary (with programme counts)
    getDepartmentSummary('', user?.email || '')
      .then((res) => {
        const list = res?.data?.data || res?.data || res;
        console.log('[DirectorSchoolStructure] loaded department summary:', list);
        if (Array.isArray(list) && isMounted) {
          setDeptSummaryList(list);
          if (list.length > 0) setExpandedDeptId(list[0].deptId);
        }
      })
      .catch((err) => console.warn('Could not fetch department summary:', err));

    // 3. Fetch Programmes for Director's School
    getProgrammes('')
      .then((res) => {
        const list = res?.data?.data || res?.data || res;
        console.log('[DirectorSchoolStructure] loaded programmes:', list);
        if (Array.isArray(list) && isMounted) {
          setProgrammeList(list);
        }
      })
      .catch((err) => console.warn('Could not fetch programmes:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';

  const hasNoSchool = schoolSummary && !schoolSummary.schoolId;

  const displaySchoolName = schoolSummary?.schoolName || selectedSchool.name;
  const displaySchoolCode = schoolSummary?.schoolCode || selectedSchool.code;
  const displayDirector = schoolSummary?.directorName || selectedSchool.director || selectedSchool.dean || user?.name;
  const displayEstYear = schoolSummary?.estYear || selectedSchool.estYear || '2024';

  const totalDeptCount = schoolSummary?.totalDepartments ?? deptSummaryList.length;
  const assignedHodCount = schoolSummary?.assignedHODsCount ?? deptSummaryList.filter((d) => d.hodAssignedStatus).length;
  const totalProgCount = schoolSummary?.totalProgrammes ?? programmeList.length;

  const displayDepts = deptSummaryList.length > 0
    ? deptSummaryList
    : departments.map((d) => ({
        deptId: d.id,
        deptCode: d.code,
        deptName: d.name,
        deptHodName: d.hod,
        deptHodEmail: d.hodEmail,
        hodAssignedStatus: d.hod && d.hod !== 'Unassigned',
        programmesCount: masterProgrammes.filter((p) => p.departmentId === d.id || p.department === d.name).length,
      }));

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
          {hasNoSchool ? 'No School Configured Yet' : `${displaySchoolName} (${displaySchoolCode})`}
        </p>
      </div>

      {/* ── NO SCHOOL WARNING BANNER ─────────────────────────────────────────── */}
      {hasNoSchool ? (
        <div style={{ ...surface, padding: '24px', textAlign: 'center', background: '#fffbeb', border: '1px solid #fde68a', marginBottom: '20px' }}>
          <AlertCircle size={32} style={{ color: '#d97706', marginBottom: '8px' }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#92400e' }}>School Not Added Yet</h3>
          <p style={{ margin: '4px 0 16px', fontSize: '13px', color: '#b45309' }}>
            No school is currently assigned under your email ({user?.email}). Please add your school details using the setup workflow.
          </p>
          <button
            type="button"
            onClick={() => navigate('/director/setup')}
            style={{ height: '38px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: accent, color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> Add School in Setup Workflow
          </button>
        </div>
      ) : (
        /* ── SCHOOL INFO CARD (Without setup progress bar) ───────────────────── */
        <div style={{ ...surface, padding: '18px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eef2ff', color: accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>{displaySchoolName}</div>
              <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
                Director: <strong style={{ color: ink }}>{displayDirector}</strong>
                &nbsp;·&nbsp; Est. {displayEstYear}
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
      )}

      {/* ── SECTION LABEL ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
        <Layers size={15} style={{ color: accent }} />
        <span style={{ fontSize: '12px', fontWeight: '700', color: muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Department & Programme Tree
        </span>
      </div>

      {/* ── HIERARCHY TREE ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {displayDepts.map((dept) => {
          const deptId = dept.deptId || dept.id;
          const deptCode = dept.deptCode || dept.code;
          const deptName = dept.deptName || dept.name;
          const hodName = dept.deptHodName || dept.hod || 'Unassigned';
          const isAssigned = dept.hodAssignedStatus ?? (hodName && hodName !== 'Unassigned');
          const deptProgrammes = programmeList.filter(
            (p) => p.departmentId === deptId || p.departmentName === deptName || p.department === deptName
          );
          const programmesCount = deptProgrammes.length > 0 ? deptProgrammes.length : (dept.programmesCount ?? 0);

          const isExpanded = expandedDeptId === deptId;

          return (
            <div key={deptId} style={{ ...surface, overflow: 'hidden' }}>
              {/* Dept row */}
              <div
                onClick={() => setExpandedDeptId(isExpanded ? null : deptId)}
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none', background: isExpanded ? '#fafafa' : '#ffffff', transition: 'background .15s' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eef2ff', color: accent, display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '11px', flexShrink: 0 }}>
                  {deptCode}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: ink }}>{deptName}</div>
                  <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>
                    HOD: <span style={{ color: isAssigned ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{hodName}</span>
                    {dept.deptHodEmail && (
                      <span style={{ fontSize: '11px', color: muted, marginLeft: '6px' }}>({dept.deptHodEmail})</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: muted, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '2px 8px', fontWeight: '600' }}>
                    {programmesCount} prog.
                  </span>
                  <ChevronRight size={15} style={{ color: '#94a3b8', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
                </div>
              </div>

              {/* Expanded programmes */}
              {isExpanded && (
                <div style={{ padding: '14px 18px', background: '#fafafa' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    Programmes under {deptName} ({deptProgrammes.length})
                  </div>
                  {deptProgrammes.length === 0 ? (
                    <div style={{ fontSize: '12px', color: muted, fontStyle: 'italic', padding: '8px 0' }}>
                      No programmes configured under this department yet.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                      {deptProgrammes.map((prog) => (
                        <div key={prog.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '9px', padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: '700', color: accent, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '4px', padding: '1px 7px' }}>
                              {prog.code}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', color: '#16a34a', fontWeight: '600' }}>
                              <Check size={11} /> {prog.status || 'Active'}
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
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
