import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, UserCheck, Search, Check, X, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

export default function DirectorDepartmentManagement() {
  const {
    departments = [],
    addDepartment = () => {},
    updateDepartment = () => {},
    deleteDepartment = () => {},
  } = useAcademic();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deletingDept, setDeletingDept] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [selectedHod, setSelectedHod] = useState(MASTER_FACULTY_LIST[0] || '');
  const [hodEmail, setHodEmail] = useState('');

  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';
  const inputStyle = { height: '40px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', background: '#ffffff', color: ink, width: '100%', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '5px' };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setDeptName(''); setDeptCode('');
    setSelectedHod(MASTER_FACULTY_LIST[0] || '');
    setHodEmail('');
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setDeptName(dept.name); setDeptCode(dept.code);
    setSelectedHod(dept.hod || MASTER_FACULTY_LIST[0]);
    setHodEmail(dept.hodEmail || '');
    setShowModal(true);
  };

  const handleOpenDelete = (dept) => {
    setDeletingDept(dept);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletingDept) {
      deleteDepartment(deletingDept.id);
      setShowDeleteModal(false);
      setDeletingDept(null);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;
    const payload = {
      name: deptName, code: deptCode, hod: selectedHod,
      hodEmail: hodEmail || `${selectedHod.toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in`,
    };
    if (editingDept) {
      updateDepartment(editingDept.id, payload);
    } else {
      addDepartment(payload);
    }
    setShowModal(false);
  };

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.hod || '').toLowerCase().includes(searchQuery.toLowerCase())
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
          {filteredDepts.length} of {departments.length} departments
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
                  {departments.length === 0 ? 'No departments yet — add one above.' : 'No results for your search.'}
                </td>
              </tr>
            ) : (
              filteredDepts.map((dept) => {
                const isAssigned = dept.hod && dept.hod !== 'Unassigned';
                const initials = (dept.hod || '').split(' ').map((n) => n[0]).join('').slice(0, 2);
                return (
                  <tr key={dept.id}>
                    <td style={{ fontWeight: '700', color: accent }}>{dept.code}</td>
                    <td style={{ fontWeight: '600', color: ink }}>{dept.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#eef2ff', color: accent, display: 'grid', placeItems: 'center', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>
                          {initials}
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: '600', color: isAssigned ? ink : '#dc2626' }}>{dept.hod}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: muted }}>
                      {dept.hodEmail || `${(dept.hod || '').toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in`}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isAssigned ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                          <Check size={11} /> Assigned
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '5px', padding: '2px 8px' }}>
                          <AlertCircle size={11} /> Pending
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
                {editingDept && <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>{editingDept.code} · {editingDept.name}</div>}
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
                <select value={selectedHod} onChange={(e) => { setSelectedHod(e.target.value); setHodEmail(`${e.target.value.toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in`); }} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {MASTER_FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
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
                <button type="submit" style={{ height: '38px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  {editingDept ? 'Save Changes' : 'Add Department'}
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
        itemName={deletingDept ? `${deletingDept.name} (${deletingDept.code})` : ''}
        description="This action cannot be undone. All data and programmes under this department will be permanently removed."
        confirmText="Delete Department"
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
