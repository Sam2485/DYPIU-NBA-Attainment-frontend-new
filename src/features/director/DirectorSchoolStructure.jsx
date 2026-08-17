import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, GraduationCap, ChevronRight, Layers, Check, Plus, AlertCircle, Edit2, X, Loader2, Save } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import {
  getDirectorSchoolSummary,
  getSchools,
  saveSchoolInfo,
  getDepartments,
  getDepartmentSummary,
  getProgrammes,
  saveDepartment,
  getUsersByRole,
} from '../../api/academic';

export default function DirectorSchoolStructure() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    updateSchoolInfo = () => {},
  } = useAcademic();

  const [schoolData, setSchoolData] = useState(null);
  const [deptList, setDeptList] = useState([]);
  const [programmeList, setProgrammeList] = useState([]);
  const [hodUsers, setHodUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedDeptId, setExpandedDeptId] = useState(null);

  // Edit School Modal State
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [directorEmail, setDirectorEmail] = useState('');
  const [estYear, setEstYear] = useState('2024');

  // Add Dept Modal State
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [selectedHod, setSelectedHod] = useState('');
  const [selectedHodEmail, setSelectedHodEmail] = useState('');

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const email = user?.email || '';
      console.log('[DirectorSchoolStructure] Loading school hierarchy for:', email);

      const [sumRes, schRes, deptRes, deptSumRes, progRes, hodRes] = await Promise.allSettled([
        getDirectorSchoolSummary(email),
        getSchools(email),
        getDepartments(),
        getDepartmentSummary('', email),
        getProgrammes(),
        getUsersByRole('HOD'),
      ]);

      let resolvedSchool = null;

      if (schRes.status === 'fulfilled') {
        const schList = schRes.value?.data?.schools || schRes.value?.schools || schRes.value?.data?.data || schRes.value?.data || schRes.value;
        if (Array.isArray(schList) && schList.length > 0) {
          resolvedSchool = schList[0];
        }
      }

      if (sumRes.status === 'fulfilled') {
        const sumData = sumRes.value?.data?.data || sumRes.value?.data || sumRes.value;
        if (sumData && (sumData.schoolName || sumData.schoolId || sumData.name || sumData.id)) {
          resolvedSchool = {
            id: sumData.schoolId || sumData.id || resolvedSchool?.id || 'school-1',
            name: sumData.schoolName || sumData.name || resolvedSchool?.name || 'School of Engineering',
            code: sumData.schoolCode || sumData.code || resolvedSchool?.code || 'SOE',
            director: sumData.directorName || sumData.director || resolvedSchool?.director || user?.name || '',
            directorEmail: sumData.directorEmail || sumData.email || resolvedSchool?.directorEmail || email,
            estYear: sumData.estYear || resolvedSchool?.estYear || '2010',
          };
        }
      }

      if (resolvedSchool) {
        setSchoolData(resolvedSchool);
        setSchoolName(resolvedSchool.name || '');
        setSchoolCode(resolvedSchool.code || '');
        setDirectorName(resolvedSchool.director || resolvedSchool.directorName || user?.name || '');
        setDirectorEmail(resolvedSchool.directorEmail || email);
        setEstYear(resolvedSchool.estYear || '2010');
      }

      let allDepts = [];
      if (deptRes.status === 'fulfilled') {
        const d = deptRes.value?.data?.departments || deptRes.value?.departments || deptRes.value?.data?.data || deptRes.value?.data || deptRes.value;
        if (Array.isArray(d) && d.length > 0) allDepts = d;
      }
      if (deptSumRes.status === 'fulfilled') {
        const dSum = deptSumRes.value?.data?.departments || deptSumRes.value?.departments || deptSumRes.value?.data?.data || deptSumRes.value?.data || deptSumRes.value;
        if (Array.isArray(dSum) && dSum.length > 0 && allDepts.length === 0) allDepts = dSum;
      }
      setDeptList(allDepts);
      if (allDepts.length > 0) setExpandedDeptId(allDepts[0].id || allDepts[0].deptId);

      if (progRes.status === 'fulfilled') {
        const p = progRes.value?.data?.programmes || progRes.value?.programmes || progRes.value?.data?.data || progRes.value?.data || progRes.value;
        if (Array.isArray(p)) setProgrammeList(p);
      }

      if (hodRes.status === 'fulfilled') {
        const h = hodRes.value?.data?.users || hodRes.value?.users || hodRes.value;
        if (Array.isArray(h)) setHodUsers(h);
      }
    } catch (err) {
      console.warn('[DirectorSchoolStructure] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user?.email]);

  const handleOpenEditSchool = () => {
    if (schoolData) {
      setSchoolName(schoolData.name || '');
      setSchoolCode(schoolData.code || '');
      setDirectorName(schoolData.director || schoolData.directorName || user?.name || '');
      setDirectorEmail(schoolData.directorEmail || user?.email || '');
      setEstYear(schoolData.estYear || '2024');
    }
    setShowEditSchoolModal(true);
  };

  const handleSaveSchoolInfo = async (e) => {
    e.preventDefault();
    if (!schoolName.trim() || !schoolCode.trim()) return;

    const payload = {
      ...(schoolData?.id ? { id: schoolData.id } : {}),
      name: schoolName.trim(),
      code: schoolCode.trim().toUpperCase(),
      director: directorName.trim(),
      directorName: directorName.trim(),
      dean: directorName.trim(),
      deanName: directorName.trim(),
      directorEmail: directorEmail.trim() || user?.email || '',
      email: directorEmail.trim() || user?.email || '',
      estYear: estYear || '2024',
      status: 'ACTIVE',
    };

    try {
      setIsSaving(true);
      console.log('[DirectorSchoolStructure] Persisting school metadata:', payload);
      const res = await saveSchoolInfo(payload);
      const savedSchool = res?.data?.data || res?.data || payload;

      setSchoolData(savedSchool);
      updateSchoolInfo(savedSchool.id || payload.id, savedSchool);
      setShowEditSchoolModal(false);
    } catch (err) {
      console.error('Failed to save school info:', err);
      alert('Failed to save school details to backend.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) return;

    const payload = {
      schoolId: schoolData?.id || 'sch-1',
      name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase(),
      hod: selectedHod || 'Unassigned',
      hodEmail: selectedHodEmail || (selectedHod ? `${selectedHod.toLowerCase().replace(/[^a-z0-9]/g, '')}@dypiu.ac.in` : ''),
      status: 'ACTIVE',
    };

    try {
      setIsSaving(true);
      const res = await saveDepartment(payload);
      const savedDept = res?.data?.data || res?.data || payload;
      setDeptList((prev) => [...prev, savedDept]);
      setShowAddDeptModal(false);
      setNewDeptName('');
      setNewDeptCode('');
      setSelectedHod('');
      setSelectedHodEmail('');
    } catch (err) {
      console.error('Failed to add department:', err);
      alert('Failed to create department on backend.');
    } finally {
      setIsSaving(false);
    }
  };

  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';
  const inputStyle = { height: '38px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', background: '#ffffff', color: ink, width: '100%', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '5px' };

  const displaySchoolName = schoolData?.name || 'School Not Added Yet';
  const displaySchoolCode = schoolData?.code || '—';
  const displayDirector = schoolData?.director || schoolData?.directorName || user?.name || 'School Director';
  const displayEstYear = schoolData?.estYear || '2024';

  const totalDeptCount = deptList.length;
  const assignedHodCount = deptList.filter((d) => {
    const raw = d.hod || d.deptHodName;
    return raw && raw !== 'Unassigned' && raw !== 'No HOD Added Yet';
  }).length;
  const totalProgCount = programmeList.length;
  const displayDepts = deptList;

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Director View
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            School Structure & Hierarchy
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            {displaySchoolName} ({displaySchoolCode})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleOpenEditSchool}
            style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit2 size={14} /> Edit School Info
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddDeptModal(true)}
            style={{ height: '38px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> Add Department
          </button>
        </div>
      </div>

      {/* ── SCHOOL INFO CARD ─────────────────────────────────────────────────── */}
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
              {schoolData?.directorEmail && (
                <span style={{ marginLeft: '8px', color: muted }}>({schoolData.directorEmail})</span>
              )}
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Layers size={15} style={{ color: accent }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Department &amp; Programme Tree
          </span>
        </div>
        <span style={{ fontSize: '12px', color: muted, fontWeight: '500' }}>
          {displayDepts.length} department{displayDepts.length !== 1 ? 's' : ''} configured
        </span>
      </div>

      {/* ── HIERARCHY TREE ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ ...surface, padding: '48px', textAlign: 'center', color: muted, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading school hierarchy...
        </div>
      ) : displayDepts.length === 0 ? (
        <div style={{ ...surface, padding: '48px', textAlign: 'center', color: muted, fontSize: '13px' }}>
          No departments configured under this school yet. Click <strong>Add Department</strong> above to create one.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {displayDepts.map((dept) => {
            const deptId = dept.deptId || dept.id;
            const deptCode = dept.deptCode || dept.code;
            const deptName = dept.deptName || dept.name;
            const hodName = dept.deptHodName || dept.hod || 'Unassigned';
            const isAssigned = (hodName && hodName !== 'Unassigned' && hodName !== 'No HOD Added Yet');
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
                      {(dept.deptHodEmail || dept.hodEmail) && (
                        <span style={{ fontSize: '11px', color: muted, marginLeft: '6px' }}>({dept.deptHodEmail || dept.hodEmail})</span>
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
      )}

      {/* ── EDIT SCHOOL INFO MODAL ────────────────────────────────────────────── */}
      {showEditSchoolModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '480px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>Edit School Information</div>
                <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>Update institutional metadata and Dean/Director profile</div>
              </div>
              <button onClick={() => setShowEditSchoolModal(false)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center', color: muted }}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSaveSchoolInfo} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>School Name *</label>
                  <input type="text" required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} style={inputStyle} placeholder="e.g. School of Engineering & Technology" />
                </div>
                <div>
                  <label style={labelStyle}>School Code *</label>
                  <input type="text" required value={schoolCode} onChange={(e) => setSchoolCode(e.target.value.toUpperCase())} style={{ ...inputStyle, fontWeight: '700', color: accent }} placeholder="e.g. SOET" />
                </div>
                <div>
                  <label style={labelStyle}>Director / Dean Name *</label>
                  <input type="text" required value={directorName} onChange={(e) => setDirectorName(e.target.value)} style={inputStyle} placeholder="e.g. Dr. R. K. Deshmukh" />
                </div>
                <div>
                  <label style={labelStyle}>Director Email</label>
                  <input type="email" value={directorEmail} onChange={(e) => setDirectorEmail(e.target.value)} style={inputStyle} placeholder="director@dypiu.ac.in" />
                </div>
                <div>
                  <label style={labelStyle}>Established Year</label>
                  <input type="number" value={estYear} onChange={(e) => setEstYear(e.target.value)} style={inputStyle} placeholder="2024" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowEditSchoolModal(false)} style={{ height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: muted, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ height: '38px', padding: '0 20px', fontSize: '13px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── ADD DEPARTMENT MODAL ────────────────────────────────────────────── */}
      {showAddDeptModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '480px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>Add Department</div>
                <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>Create department under {displaySchoolCode}</div>
              </div>
              <button onClick={() => setShowAddDeptModal(false)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center', color: muted }}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleAddDepartment} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Department Code *</label>
                  <input type="text" required placeholder="e.g. CSE" value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())} style={{ ...inputStyle, fontWeight: '700', color: accent }} />
                </div>
                <div>
                  <label style={labelStyle}>Department Name *</label>
                  <input type="text" required placeholder="e.g. Dept of Computer Science & Engineering" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Assign HOD</label>
                  <select
                    value={selectedHod}
                    onChange={(e) => {
                      const sel = e.target.value;
                      setSelectedHod(sel);
                      const matched = hodUsers.find((u) => (u.name || u.fullName || u.username) === sel);
                      if (matched?.email) setSelectedHodEmail(matched.email);
                    }}
                    style={inputStyle}
                  >
                    <option value="">-- Select HOD (Optional) --</option>
                    {hodUsers.length > 0
                      ? hodUsers.map((u) => {
                          const uId = u.id || u.email;
                          const uName = u.name || u.fullName || u.username || u.email;
                          const uEmail = u.email ? ` (${u.email})` : '';
                          return <option key={uId} value={uName}>{uName}{uEmail}</option>;
                        })
                      : <option value="" disabled>No HOD Users Found</option>}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddDeptModal(false)} style={{ height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: muted, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ height: '38px', padding: '0 20px', fontSize: '13px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                  {isSaving ? 'Saving...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
