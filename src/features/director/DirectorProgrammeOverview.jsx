import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, Building2, Check, ChevronDown, Edit2, Trash2, X, Plus, LoaderCircle } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

export default function DirectorProgrammeOverview() {
  const {
    masterProgrammes = [],
    departments = [],
    selectedSchoolId,
    loadSchools = () => Promise.resolve([]),
    loadDepartments = () => Promise.resolve([]),
    loadMasterProgrammes = () => Promise.resolve([]),
    createMasterProgramme = () => Promise.resolve(null),
    updateMasterProgramme = () => {},
    deleteMasterProgramme = () => {},
  } = useAcademic();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [deletingProg, setDeletingProg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newProgrammeDeptId, setNewProgrammeDeptId] = useState('');
  const [newProgrammeLevel, setNewProgrammeLevel] = useState('UG');
  const [newProgrammeDegreeAwarded, setNewProgrammeDegreeAwarded] = useState('');
  const [newProgrammeName, setNewProgrammeName] = useState('');
  const [newProgrammeDuration, setNewProgrammeDuration] = useState(4);
  const [isSavingProgramme, setIsSavingProgramme] = useState(false);
  const [addProgrammeError, setAddProgrammeError] = useState('');

  const [editName, setEditName] = useState('');
  const [editDegreeAwarded, setEditDegreeAwarded] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editDuration, setEditDuration] = useState(4);

  useEffect(() => {
    const loadDirectorProgrammeData = async () => {
      const schools = await loadSchools();
      const schoolId = selectedSchoolId ?? schools[0]?.id;
      await Promise.allSettled([
        loadDepartments(schoolId),
        loadMasterProgrammes(),
      ]);
    };

    loadDirectorProgrammeData().catch(() => {});
  }, [loadDepartments, loadMasterProgrammes, loadSchools, selectedSchoolId]);

  useEffect(() => {
    setNewProgrammeDeptId((current) => current || departments[0]?.id || '');
  }, [departments]);

  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';
  const inputStyle = { height: '38px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', background: '#ffffff', color: ink, width: '100%', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '5px' };

  const filteredProgrammes = masterProgrammes.filter((prog) => {
    if (selectedDeptFilter === 'ALL') return true;
    return prog.departmentId === selectedDeptFilter;
  });

  const handleOpenEdit = (prog) => {
    setEditingProg(prog);
    setEditName(prog.name);
    setEditDegreeAwarded(prog.degreeAwarded ?? prog.code ?? '');
    setEditDeptId(prog.departmentId || departments[0]?.id || '');
    setEditDuration(prog.durationYears || 4);
    setShowEditModal(true);
  };

  const handleAddProgramme = async (event) => {
    event.preventDefault();
    const department = departments.find((item) => item.id === newProgrammeDeptId);
    const name = newProgrammeName.trim();

    if (!department || !newProgrammeDegreeAwarded.trim() || !name) {
      setAddProgrammeError('Select a department, degree awarded, and programme name.');
      return;
    }

    setIsSavingProgramme(true);
    setAddProgrammeError('');
    try {
      await createMasterProgramme({
        departmentId: department.id,
        degreeAwarded: newProgrammeDegreeAwarded.trim(),
        name,
        durationYears: Number(newProgrammeDuration),
        level: newProgrammeLevel,
      });
      setNewProgrammeName('');
      setNewProgrammeDegreeAwarded('');
      setNewProgrammeLevel('UG');
      setNewProgrammeDuration(4);
      setShowAddCard(false);
    } catch (error) {
      console.error('Failed to create programme:', error);
      setAddProgrammeError(error?.response?.data?.message || 'Unable to add the programme. Please try again.');
    } finally {
      setIsSavingProgramme(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProg || !editName || !editDegreeAwarded) return;
    const deptObj = departments.find((d) => d.id === editDeptId);

    if (!deptObj) return;

    try {
      await updateMasterProgramme(editingProg.id, {
      name: editName.trim(),
      degreeAwarded: editDegreeAwarded.trim(),
      departmentId: deptObj.id,
      level: editingProg.level ?? 'UG',
      degree: editingProg.degree ?? '',
      durationYears: parseInt(editDuration, 10) || 4,
      coordinator: editingProg.coordinator ?? '',
      coordinatorEmail: editingProg.coordinatorEmail ?? '',
      status: editingProg.status ?? 'ACTIVE',
    });
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update programme:', error);
    }
  };

  const handleOpenDelete = (prog) => {
    setDeletingProg(prog);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProg) {
      deleteMasterProgramme(deletingProg.id);
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
        <button
          type="button"
          onClick={() => { setAddProgrammeError(''); setShowAddCard((visible) => !visible); }}
          style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', color: '#ffffff', background: accent, border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {showAddCard ? <X size={15} /> : <Plus size={15} />}
          {showAddCard ? 'Close' : 'Add Programme'}
        </button>
      </div>

      {/* ── ADD PROGRAMME CARD ─────────────────────────────────────────────── */}
      {showAddCard && (
        <form onSubmit={handleAddProgramme} style={{ ...surface, padding: '18px 20px', marginBottom: '14px', borderColor: '#c7d2fe', boxShadow: '0 5px 18px rgba(79,70,229,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '15px' }}>
            <div>
              <div style={{ fontSize: '14px', color: ink, fontWeight: '800' }}>Add Programme</div>
              <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>Create a degree programme under one of this school’s departments.</div>
            </div>
            <GraduationCap size={19} style={{ color: accent }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(90px, 0.55fr) minmax(150px, 0.8fr) minmax(220px, 1.55fr) minmax(140px, 0.7fr) auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Department *</label>
              <select required value={newProgrammeDeptId} onChange={(e) => setNewProgrammeDeptId(e.target.value)} style={inputStyle}>
                <option value="" disabled>Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.code} – {department.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Level *</label>
              <select value={newProgrammeLevel} onChange={(e) => setNewProgrammeLevel(e.target.value)} style={inputStyle}>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Degree Awarded *</label>
              <input required type="text" value={newProgrammeDegreeAwarded} onChange={(e) => setNewProgrammeDegreeAwarded(e.target.value)} placeholder="B.Tech" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Programme Name *</label>
              <input required type="text" value={newProgrammeName} onChange={(e) => setNewProgrammeName(e.target.value)} placeholder="B.Tech Artificial Intelligence & ML" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Duration (Years) *</label>
              <select value={newProgrammeDuration} onChange={(e) => setNewProgrammeDuration(e.target.value)} style={inputStyle}>
                <option value={1}>1 Year</option>
                <option value={2}>2 Years</option>
                <option value={3}>3 Years</option>
                <option value={4}>4 Years</option>
                <option value={5}>5 Years</option>
              </select>
            </div>
            <button type="submit" disabled={isSavingProgramme || !newProgrammeDeptId || !newProgrammeDegreeAwarded.trim() || !newProgrammeName.trim()} style={{ height: '38px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', color: '#ffffff', background: accent, border: 'none', borderRadius: '8px', cursor: isSavingProgramme ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: isSavingProgramme || !newProgrammeDeptId || !newProgrammeDegreeAwarded.trim() || !newProgrammeName.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }}>
              {isSavingProgramme ? <LoaderCircle size={14} className="spin" /> : <Plus size={14} />}
              {isSavingProgramme ? 'Adding…' : 'Add Programme'}
            </button>
          </div>
          {addProgrammeError && <div style={{ marginTop: '12px', fontSize: '12px', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', padding: '8px 10px' }}>{addProgrammeError}</div>}
        </form>
      )}

      {/* ── PROGRAMME FILTER ───────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '11px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={14} style={{ color: muted }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: ink }}>Sort by department</span>
          <div style={{ position: 'relative' }}>
            <select value={selectedDeptFilter} onChange={(e) => setSelectedDeptFilter(e.target.value)} style={{ height: '34px', paddingLeft: '10px', paddingRight: '30px', fontSize: '12px', fontWeight: '600', border: '1px solid #e2e8f0', borderRadius: '7px', background: '#ffffff', color: ink, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none' }}>
              <option value="ALL">All Departments</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.code} – {department.name}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>
        </div>
        <span style={{ fontSize: '12px', color: muted, whiteSpace: 'nowrap' }}>{filteredProgrammes.length} programme{filteredProgrammes.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── PROGRAMMES GRID ──────────────────────────────────────────────────── */}
      {filteredProgrammes.length === 0 ? (
        <div style={{ ...surface, padding: '48px', textAlign: 'center', color: muted, fontSize: '13px' }}>
          No programmes found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {filteredProgrammes.map((prog) => {
            const deptObj = departments.find((d) => d.id === prog.departmentId);

            return (
              <div key={prog.id} style={{ ...surface, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: accent, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '5px', padding: '2px 9px' }}>
                    {prog.code}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16a34a', fontWeight: '600', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                    <Check size={11} /> {prog.status ?? '—'}
                  </span>
                </div>

                {/* Name */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: ink, lineHeight: '1.3', marginBottom: '3px' }}>{prog.name}</div>
                  <div style={{ fontSize: '11.5px', color: muted }}>{deptObj?.name || prog.department}</div>
                </div>

                {/* Details */}
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', border: '1px solid #f1f5f9', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: muted }}>Supervising HOD</span>
                    <span style={{ fontWeight: '700', color: ink, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      {deptObj?.hod || '—'}
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
                    <span style={{ fontWeight: '600', color: ink }}>{prog.durationYears ?? '—'} Years</span>
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

      {/* ── EDIT PROGRAMME MODAL ────────────────────────────────────────────── */}
      {showEditModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '480px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: ink }}>Edit Programme</div>
                <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>{editingProg?.code} · {editingProg?.name}</div>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center', color: muted }}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Department *</label>
                  <select value={editDeptId} onChange={(e) => setEditDeptId(e.target.value)} style={inputStyle}>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Degree Awarded *</label>
                  <input type="text" required value={editDegreeAwarded} onChange={(e) => setEditDegreeAwarded(e.target.value)} placeholder="B.Tech" style={{ ...inputStyle, fontWeight: '700', color: accent }} />
                </div>
                <div>
                  <label style={labelStyle}>Programme Name *</label>
                  <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Duration (Years) *</label>
                  <select value={editDuration} onChange={(e) => setEditDuration(e.target.value)} style={inputStyle}>
                    <option value={2}>2 Years (Master Degree)</option>
                    <option value={3}>3 Years (Diploma / Bachelor)</option>
                    <option value={4}>4 Years (B.Tech / B.E.)</option>
                    <option value={5}>5 Years (Dual Degree)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: muted, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 20px', fontSize: '13px', fontWeight: '800' }}>
                  Save Changes
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
