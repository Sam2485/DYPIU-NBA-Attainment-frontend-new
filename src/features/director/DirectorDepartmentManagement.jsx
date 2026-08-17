import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, UserCheck, Search, Check, X, AlertCircle, Trash2, Edit2, Loader2, Save } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import {
  getDirectorSchoolSummary,
  getSchools,
  getDepartments,
  getDepartmentSummary,
  saveDepartment,
  deleteDepartment as deleteDepartmentApi,
  getUsersByRole,
} from '../../api/academic';

export default function DirectorDepartmentManagement() {
  const { user } = useAuth();
  const {
    departments = [],
    addDepartment = () => {},
    updateDepartment = () => {},
    deleteDepartment = () => {},
  } = useAcademic();

  const [schoolId, setSchoolId] = useState('');
  const [deptList, setDeptList] = useState([]);
  const [hodUsers, setHodUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deletingDept, setDeletingDept] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [selectedHod, setSelectedHod] = useState('');
  const [hodEmail, setHodEmail] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const email = user?.email || '';
      console.log('[DirectorDepartmentManagement] Fetching department data for:', email);

      const [sumRes, schRes, deptsRes, deptSumRes, hodRes] = await Promise.allSettled([
        getDirectorSchoolSummary(email),
        getSchools(email),
        getDepartments(),
        getDepartmentSummary('', email),
        getUsersByRole('HOD'),
      ]);

      if (schRes.status === 'fulfilled') {
        const schs = schRes.value?.data?.schools || schRes.value?.schools || schRes.value?.data?.data || schRes.value?.data || schRes.value;
        if (Array.isArray(schs) && schs.length > 0 && schs[0].id) {
          setSchoolId(schs[0].id);
        }
      }

      if (sumRes.status === 'fulfilled') {
        const data = sumRes.value?.data?.data || sumRes.value?.data || sumRes.value;
        if (data?.schoolId || data?.id) setSchoolId(data.schoolId || data.id);
      }

      let allDepts = [];
      if (deptsRes.status === 'fulfilled') {
        const d = deptsRes.value?.data?.departments || deptsRes.value?.departments || deptsRes.value?.data?.data || deptsRes.value?.data || deptsRes.value;
        if (Array.isArray(d) && d.length > 0) allDepts = d;
      }
      if (deptSumRes.status === 'fulfilled') {
        const dSum = deptSumRes.value?.data?.departments || deptSumRes.value?.departments || deptSumRes.value?.data?.data || deptSumRes.value?.data || deptSumRes.value;
        if (Array.isArray(dSum) && dSum.length > 0 && allDepts.length === 0) allDepts = dSum;
      }
      setDeptList(allDepts);

      if (hodRes.status === 'fulfilled') {
        const list = hodRes.value?.data?.users || hodRes.value?.users || hodRes.value;
        if (Array.isArray(list) && list.length > 0) {
          setHodUsers(list);
          if (!selectedHod) {
            const first = list[0];
            setSelectedHod(first.name || first.fullName || first.username || '');
            setHodEmail(first.email || '');
          }
        }
      }
    } catch (err) {
      console.warn('[DirectorDepartmentManagement] Error loading data:', err);
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
  const inputStyle = { height: '40px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', background: '#ffffff', color: ink, width: '100%', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '5px' };

  const activeDepts = deptList;

  const handleOpenAdd = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    if (hodUsers.length > 0) {
      setSelectedHod(hodUsers[0].name || '');
      setHodEmail(hodUsers[0].email || '');
    } else {
      setSelectedHod('');
      setHodEmail('');
    }
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setDeptName(dept.deptName || dept.name || '');
    setDeptCode(dept.deptCode || dept.code || '');
    const curHod = dept.deptHodName || dept.hod || '';
    setSelectedHod(curHod);
    setHodEmail(dept.deptHodEmail || dept.hodEmail || '');
    setShowModal(true);
  };

  const handleOpenDelete = (dept) => {
    setDeletingDept(dept);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingDept) {
      const targetId = deletingDept.deptId || deletingDept.id;
      try {
        await deleteDepartmentApi(targetId);
      } catch (err) {
        console.warn('Could not delete department from backend:', err);
      }
      setDeptList((prev) => prev.filter((d) => (d.deptId || d.id) !== targetId));
      deleteDepartment(targetId);
      setShowDeleteModal(false);
      setDeletingDept(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;
    const targetDeptId = editingDept?.id || editingDept?.deptId;
    const targetSchoolId = editingDept?.schoolId || schoolId || 'sch-1';
    const payload = {
      ...(targetDeptId ? { id: targetDeptId, deptId: targetDeptId } : {}),
      schoolId: targetSchoolId,
      name: deptName.trim(),
      deptName: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      deptCode: deptCode.trim().toUpperCase(),
      hod: selectedHod || 'Unassigned',
      deptHodName: selectedHod || 'Unassigned',
      hodEmail: hodEmail || (selectedHod ? `${selectedHod.toLowerCase().replace(/[^a-z0-9]/g, '')}@dypiu.ac.in` : ''),
      deptHodEmail: hodEmail || (selectedHod ? `${selectedHod.toLowerCase().replace(/[^a-z0-9]/g, '')}@dypiu.ac.in` : ''),
      status: 'ACTIVE',
    };

    try {
      setIsSaving(true);
      console.log('[DirectorDepartmentManagement] Saving department via endpoint:', payload);
      const res = await saveDepartment(payload);
      const savedDept = res?.data?.data || res?.data || payload;

      setDeptList((prev) => {
        const resolvedId = savedDept.id || savedDept.deptId || targetDeptId;
        const exists = prev.some((d) => (d.deptId || d.id) === resolvedId);
        if (exists) {
          return prev.map((d) => ((d.deptId || d.id) === resolvedId ? { ...d, ...savedDept } : d));
        }
        return [...prev, savedDept];
      });

      if (targetDeptId) {
        updateDepartment(targetDeptId, payload);
      } else {
        addDepartment(savedDept);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save department to backend:', err);
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Please verify backend connection.';
      alert(`Failed to save department: ${errMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDepts = activeDepts.filter(
    (d) =>
      (d.deptName || d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.deptCode || d.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.deptHodName || d.hod || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Director Portal</div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>Departments & HOD Allocation</h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>Create departments and assign Heads of Department.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{ height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
        >
          <Plus size={15} /> Add Department
        </button>
      </div>

      {/* ── SEARCH BAR ──────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
          <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, code or HOD…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '34px' }}
          />
        </div>
        <span style={{ fontSize: '12px', color: muted }}>
          {filteredDepts.length} of {activeDepts.length} departments
        </span>
      </div>

      {/* ── TABLE ───────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
        <table className="audit-data-table">
          <thead>
            <tr>
              <th style={{ width: '72px' }}>Code</th>
              <th>Department Name</th>
              <th style={{ width: '220px' }}>Head of Department</th>
              <th style={{ width: '200px' }}>Email</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '12.5px' }}>
                  {activeDepts.length === 0 ? 'No departments yet — add one above.' : 'No results for your search.'}
                </td>
              </tr>
            ) : (
              filteredDepts.map((dept) => {
                const deptId = dept.deptId || dept.id;
                const deptCode = dept.deptCode || dept.code;
                const deptName = dept.deptName || dept.name;
                const rawHod = dept.deptHodName || dept.hod;
                const isAssigned = rawHod && rawHod !== 'Unassigned' && rawHod !== 'No HOD Added Yet';
                const hodName = isAssigned ? rawHod : 'No HOD Added Yet';
                const hodEmail = isAssigned ? (dept.deptHodEmail || dept.hodEmail || '—') : '—';
                const initials = isAssigned ? rawHod.split(' ').map((n) => n[0]).join('').slice(0, 2) : '—';

                return (
                  <tr key={deptId}>
                    <td style={{ fontWeight: '700', color: accent }}>{deptCode}</td>
                    <td style={{ fontWeight: '600', color: ink }}>{deptName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: isAssigned ? '#eef2ff' : '#f1f5f9', color: isAssigned ? accent : '#64748b', display: 'grid', placeItems: 'center', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>
                          {initials}
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: '600', color: isAssigned ? ink : '#64748b' }}>{hodName}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: muted }}>
                      {hodEmail}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isAssigned ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                          <Check size={11} /> Assigned
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#64748b', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '2px 8px' }}>
                          <AlertCircle size={11} /> No HOD Added Yet
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(dept)}
                          style={{ height: '32px', padding: '0 10px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #cbd5e1', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <UserCheck size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleOpenDelete(dept)}
                          style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                          title="Delete Department"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── EDIT / ADD MODAL ─────────────────────────────────────────────────── */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '480px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden', boxSizing: 'border-box' }}>

            {/* Modal header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: ink }}>
                  {editingDept ? `Edit Department` : 'Add Department'}
                </div>
                {editingDept && <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>{(editingDept.deptCode || editingDept.code)} · {(editingDept.deptName || editingDept.name)}</div>}
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center', color: muted }}>
                <X size={14} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSave} style={{ padding: '20px', display: 'grid', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Department Name *</label>
                <input type="text" required placeholder="e.g. Dept of Computer Science" value={deptName} onChange={(e) => setDeptName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Department Code *</label>
                <input type="text" required placeholder="e.g. CSE" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} style={{ ...inputStyle, fontWeight: '700', color: accent }} />
              </div>
              <div>
                <label style={labelStyle}>Assign HOD *</label>
                <select
                  value={selectedHod}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    setSelectedHod(selectedName);
                    const matchedUser = hodUsers.find((u) => (u.name || u.fullName || u.username) === selectedName);
                    if (matchedUser?.email) {
                      setHodEmail(matchedUser.email);
                    }
                  }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
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
              <div>
                <label style={labelStyle}>HOD Email</label>
                <input type="email" placeholder="hod@dypiu.ac.in" value={hodEmail} onChange={(e) => setHodEmail(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} style={{ height: '38px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  {isSaving ? 'Saving...' : (editingDept ? 'Save Changes' : 'Add Department')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── DELETE CONFIRM MODAL ──────────────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={showDeleteModal && !!deletingDept}
        title="Delete Department?"
        itemName={deletingDept ? `${(deletingDept.deptName || deletingDept.name)} (${(deletingDept.deptCode || deletingDept.code)})` : ''}
        description="This action cannot be undone. All data and programmes under this department will be permanently removed."
        confirmText="Delete Department"
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
