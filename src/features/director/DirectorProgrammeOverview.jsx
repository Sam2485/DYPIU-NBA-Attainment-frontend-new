import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, Building2, Check, ChevronDown, Edit2, Trash2, X, Plus, Loader2 } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { getDirectorSchoolSummary, getDepartments, getProgrammes, saveProgramme, deleteProgramme as deleteProgrammeApi } from '../../api/academic';

export default function DirectorProgrammeOverview() {
  const { user } = useAuth();
  const {
    updateProgramme = () => {},
    deleteProgramme = () => {},
  } = useAcademic();

  const [schoolId, setSchoolId] = useState('');
  const [deptList, setDeptList] = useState([]);
  const [progList, setProgList] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgId, setCurrentProgId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDeptId, setFormDeptId] = useState('');
  const [formDuration, setFormDuration] = useState(4);
  const [formCoordinator, setFormCoordinator] = useState('');
  const [formCoordinatorEmail, setFormCoordinatorEmail] = useState('');

  // Delete State
  const [deletingProg, setDeletingProg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, deptsRes, progsRes] = await Promise.allSettled([
        getDirectorSchoolSummary(user?.email || ''),
        getDepartments(),
        getProgrammes(),
      ]);

      if (summaryRes.status === 'fulfilled') {
        const sch = summaryRes.value?.data?.data || summaryRes.value?.data || summaryRes.value;
        if (sch?.schoolId) setSchoolId(sch.schoolId);
      }

      if (deptsRes.status === 'fulfilled') {
        const dList = deptsRes.value?.data?.departments || deptsRes.value?.departments || deptsRes.value?.data?.data || deptsRes.value?.data || deptsRes.value;
        if (Array.isArray(dList)) {
          setDeptList(dList);
        }
      }

      if (progsRes.status === 'fulfilled') {
        const pList = progsRes.value?.data?.programmes || progsRes.value?.programmes || progsRes.value?.data?.data || progsRes.value?.data || progsRes.value;
        console.log('[DirectorProgrammeOverview] Loaded programmes from backend:', pList);
        if (Array.isArray(pList)) {
          setProgList(pList);
        }
      }
    } catch (err) {
      console.warn('[DirectorProgrammeOverview] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.email]);

  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';
  const inputStyle = { height: '38px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', background: '#ffffff', color: ink, width: '100%', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '5px' };

  const activeDepts = deptList;
  const activeProgs = progList;

  const filteredProgrammes = activeProgs.filter((prog) => {
    if (selectedDeptFilter === 'ALL') return true;
    const pDeptId = prog.departmentId || prog.department;
    return (
      pDeptId === selectedDeptFilter ||
      prog.departmentName === selectedDeptFilter ||
      prog.department === selectedDeptFilter
    );
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentProgId(null);
    setFormName('');
    setFormCode('');
    setFormDeptId(activeDepts[0]?.id || activeDepts[0]?.deptId || '');
    setFormDuration(4);
    setFormCoordinator('');
    setFormCoordinatorEmail('');
    setShowModal(true);
  };

  const handleOpenEdit = (prog) => {
    setIsEditing(true);
    setCurrentProgId(prog.id);
    setFormName(prog.name || '');
    setFormCode(prog.code || '');
    const initialDeptId = prog.departmentId || activeDepts[0]?.id || activeDepts[0]?.deptId || '';
    setFormDeptId(initialDeptId);
    setFormDuration(prog.durationYears || prog.duration || 4);
    setFormCoordinator(prog.coordinator || '');
    setFormCoordinatorEmail(prog.coordinatorEmail || '');
    setShowModal(true);
  };

  const handleSaveProgramme = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    const targetDept = activeDepts.find((d) => (d.id || d.deptId) === formDeptId) || activeDepts[0];
    const targetDeptId = targetDept?.id || targetDept?.deptId || formDeptId;
    const targetDeptName = targetDept?.name || targetDept?.deptName || 'Department of Engineering';

    const progPayload = {
      ...(isEditing && currentProgId ? { id: currentProgId } : {}),
      schoolId: schoolId || '',
      departmentId: targetDeptId,
      departmentName: targetDeptName,
      department: targetDeptName,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      durationYears: parseInt(formDuration, 10) || 4,
      duration: parseInt(formDuration, 10) || 4,
      totalSemesters: (parseInt(formDuration, 10) || 4) * 2,
      coordinator: formCoordinator || '',
      coordinatorName: formCoordinator || '',
      coordinatorEmail: formCoordinatorEmail || '',
      status: 'ACTIVE',
    };

    try {
      setIsSaving(true);
      console.log('[DirectorProgrammeOverview] Persisting programme payload:', progPayload);
      const res = await saveProgramme(progPayload);
      const savedProg = res?.data?.data || res?.data || progPayload;

      setProgList((prev) => {
        const exists = prev.some((p) => p.id === savedProg.id);
        if (exists) return prev.map((p) => (p.id === savedProg.id ? savedProg : p));
        return [...prev, savedProg];
      });

      if (isEditing && currentProgId) {
        updateProgramme(currentProgId, progPayload);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save programme to backend:', err);
      alert('Failed to save programme. Please check your backend connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (prog) => {
    setDeletingProg(prog);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingProg) {
      const targetId = deletingProg.id;
      try {
        await deleteProgrammeApi(targetId);
      } catch (err) {
        console.warn('Could not delete programme from backend:', err);
      }
      setProgList((prev) => prev.filter((p) => p.id !== targetId));
      deleteProgramme(targetId);
      setShowDeleteModal(false);
      setDeletingProg(null);
    }
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Director View</div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>Programme Overview &amp; Governance</h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>Manage degree programmes, coordinators, and duration settings across all departments.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={14} style={{ color: muted }} />
            <div style={{ position: 'relative' }}>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                style={{ height: '38px', paddingLeft: '12px', paddingRight: '32px', fontSize: '12.5px', fontWeight: '600', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', color: ink, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none' }}
              >
                <option value="ALL">All Departments</option>
                {activeDepts.map((d) => {
                  const dId = d.id || d.deptId;
                  const dCode = d.code || d.deptCode;
                  const dName = d.name || d.deptName;
                  return (
                    <option key={dId} value={dId}>{dCode} – {dName}</option>
                  );
                })}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{ height: '38px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> Add Programme
          </button>
        </div>
      </div>

      {/* ── PROGRAMMES GRID ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ ...surface, padding: '48px', textAlign: 'center', color: muted, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading degree programmes...
        </div>
      ) : filteredProgrammes.length === 0 ? (
        <div style={{ ...surface, padding: '48px', textAlign: 'center', color: muted, fontSize: '13px' }}>
          No programmes found. Click <strong>Add Programme</strong> above to configure degree programmes.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {filteredProgrammes.map((prog) => {
            const deptObj = activeDepts.find(
              (d) => (d.id || d.deptId) === prog.departmentId || (d.name || d.deptName) === prog.departmentName || (d.name || d.deptName) === prog.department
            ) || activeDepts[0];

            const deptDisplayName = deptObj?.deptName || deptObj?.name || prog.departmentName || prog.department || '—';
            const hodDisplayName = deptObj?.deptHodName || deptObj?.hod || '—';

            return (
              <div key={prog.id} style={{ ...surface, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: accent, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '5px', padding: '2px 9px' }}>
                    {prog.code}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16a34a', fontWeight: '600', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                    <Check size={11} /> {prog.status || 'Active'}
                  </span>
                </div>

                {/* Name */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: ink, lineHeight: '1.3', marginBottom: '3px' }}>{prog.name}</div>
                  <div style={{ fontSize: '11.5px', color: muted }}>{deptDisplayName}</div>
                </div>

                {/* Details */}
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', border: '1px solid #f1f5f9', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: muted }}>Supervising HOD</span>
                    <span style={{ fontWeight: '700', color: ink, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      {hodDisplayName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: muted }}>Programme Coordinator</span>
                    {prog.coordinator && prog.coordinator !== 'No coordinator assigned yet' && prog.coordinator !== 'Pending HOD Assignment' ? (
                      <span style={{ fontWeight: '700', color: accent, background: '#eef2ff', border: '1px solid #c7d2fe', padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px' }}>
                        {prog.coordinator}
                      </span>
                    ) : (
                      <span style={{ fontWeight: '700', color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px' }}>
                        No coordinator assigned yet
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: muted }}>Duration</span>
                    <span style={{ fontWeight: '600', color: ink }}>{prog.durationYears || prog.duration || 4} Years</span>
                  </div>
                </div>

                {/* Footer with Edit & Delete */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GraduationCap size={13} style={{ color: '#16a34a' }} />
                    <span style={{ fontSize: '11.5px', color: muted }}>Framework Configured</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(prog)}
                      style={{ height: '28px', padding: '0 10px', fontSize: '11.5px', fontWeight: '700', background: '#eef2ff', color: accent, border: '1px solid #c7d2fe', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Edit Programme"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(prog)}
                      style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                      title="Delete Programme"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD / EDIT PROGRAMME MODAL ────────────────────────────────────────────── */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '480px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>
                  {isEditing ? 'Edit Programme' : 'Add New Programme'}
                </div>
                <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>
                  {isEditing ? `${formCode} · ${formName}` : 'Configure degree programme under department'}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center', color: muted }}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSaveProgramme} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Department *</label>
                  <select value={formDeptId} onChange={(e) => setFormDeptId(e.target.value)} style={inputStyle}>
                    {activeDepts.map((d) => {
                      const dId = d.id || d.deptId;
                      const dCode = d.code || d.deptCode;
                      const dName = d.name || d.deptName;
                      return (
                        <option key={dId} value={dId}>{dName} ({dCode})</option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Programme Code *</label>
                  <input type="text" required placeholder="e.g. BTECH-CSE" value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} style={{ ...inputStyle, fontWeight: '700', color: accent }} />
                </div>
                <div>
                  <label style={labelStyle}>Programme Name *</label>
                  <input type="text" required placeholder="e.g. B.Tech Computer Science & Engineering" value={formName} onChange={(e) => setFormName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Duration (Years) *</label>
                  <select value={formDuration} onChange={(e) => setFormDuration(e.target.value)} style={inputStyle}>
                    <option value={4}>4 Years (B.Tech / B.E.)</option>
                    <option value={2}>2 Years (Master Degree)</option>
                    <option value={3}>3 Years (Diploma / Bachelor)</option>
                    <option value={5}>5 Years (Dual Degree)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: muted, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ height: '38px', padding: '0 20px', fontSize: '13px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                  {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Programme')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── DELETE CONFIRM MODAL ──────────────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={showDeleteModal && !!deletingProg}
        title="Delete Programme?"
        itemName={deletingProg ? `${deletingProg.name} (${deletingProg.code})` : ''}
        description="This action cannot be undone. All data, courses, and batches under this programme will be permanently removed."
        confirmText="Delete Programme"
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
