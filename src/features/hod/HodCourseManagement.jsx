import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, UserCheck, CheckCircle2, Search, Plus, Edit2, Trash2, Save, X, GraduationCap } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export default function HodCourseManagement() {
  const {
    masterProgrammes = [],
    departments = [],
    programmeId,
    setProgrammeId,
    selectedDepartmentId,
    loadProgrammes = () => Promise.resolve([]),
    loadCourses = () => Promise.resolve([]),
    loadCourseCoordinators = () => Promise.resolve([]),
    loadProgrammeCoordinators = () => Promise.resolve([]),
    programmeCoordinators = [],
    assignHodCoordinator = () => Promise.resolve(null),
    courses = [],
    batchId,
    courseOfferings = [],
    loadCourseOfferings = () => Promise.resolve([]),
    addCourseOffering = () => Promise.resolve(null),
    assignCourseCoordinator = () => {},
    addCourse = () => {},
    updateCourse = () => {},
    deleteCourse = () => {},
    courseCoordinators = [],
  } = useAcademic();

  const activeFaculties = useMemo(
    () => courseCoordinators.filter((faculty) => faculty?.id != null),
    [courseCoordinators]
  );

  const [searchQuery, setSearchQuery] = useState('');

  const assignedHods = departments.map((d) => d.hod).filter(Boolean);

  const selectedProgramme = masterProgrammes.find((p) => p.id === programmeId) ?? null;

  const durationYears = selectedProgramme?.durationYears ?? 4;
  const totalSemesters = durationYears * 2;
  const programmeSemesters = Array.from({ length: totalSemesters }, (_, i) => `Sem ${ROMAN_NUMERALS[i] || i + 1}`);

  // Inline Add Course Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSem, setNewSem] = useState('1');
  const [newCoordinator, setNewCoordinator] = useState('');

  // Inline Edit Row State
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editSem, setEditSem] = useState('');
  const [editCoordinator, setEditCoordinator] = useState('');

  useEffect(() => {
    const loadCourseData = async () => {
      const programmes = await loadProgrammes(selectedDepartmentId ?? null);
      if (!programmeId && programmes[0]?.id) setProgrammeId(programmes[0].id);
      await Promise.all([loadCourseCoordinators(), loadProgrammeCoordinators()]);
    };

    loadCourseData().catch(() => {});
  }, [loadCourseCoordinators, loadProgrammes, loadProgrammeCoordinators, programmeId, selectedDepartmentId, setProgrammeId]);

  useEffect(() => {
    if (programmeId) loadCourses(programmeId).catch(() => {});
  }, [loadCourses, programmeId]);

  useEffect(() => {
    if (batchId) loadCourseOfferings(batchId).catch(() => {});
  }, [batchId, loadCourseOfferings]);

  useEffect(() => {
    setNewSem('1');
  }, [programmeId]);

  useEffect(() => {
    setNewCoordinator((current) => current || String(activeFaculties[0]?.id ?? ''));
  }, [activeFaculties]);

  // Filter courses by selected programme & search query
  const filteredCourses = courses
    .filter((c) => c.programmeId === programmeId)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.courseCoordinatorName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCode || !newName || !programmeId) return;

    const createdCourse = {
      id: `crs-${newCode.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      programmeId,
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      semester: Number.parseInt(newSem, 10),
      credits: 4,
      status: 'ACTIVE',
    };

    const savedCourse = await addCourse(createdCourse);
    if (savedCourse) {
      const coordinator = activeFaculties.find(
        (faculty) => String(faculty.id) === String(newCoordinator)
      );
      if (batchId && coordinator) {
        await addCourseOffering({
          masterCourseId: savedCourse.masterCourseId ?? savedCourse.id,
          programmeBatchId: batchId,
          semester: savedCourse.semester,
          courseCoordinatorEmail: coordinator.email || '',
          assignedFaculty: coordinator.email || '',
        });
      }
      setNewCode('');
      setNewName('');
    }
  };

  const handleStartEdit = (course) => {
    setEditingCourseId(course.id);
    setEditCode(course.code);
    setEditName(course.name);
    setEditSem(String(course.semester ?? 1));
    setEditCoordinator(String(course.courseCoordinatorId ?? ''));
  };

  const handleSaveEdit = async (courseId) => {
    const course = courses.find((item) => item.id === courseId);
    if (!course) return;
    await updateCourse(courseId, {
      code: editCode.trim().toUpperCase(),
      name: editName.trim(),
      programmeId: course.programmeId,
      semester: Number.parseInt(editSem, 10),
      credits: course.credits ?? 4,
      status: course.status ?? 'ACTIVE',
    });
    if (batchId && editCoordinator) {
      await assignCourseCoordinator(courseId, Number(editCoordinator), batchId);
    }
    setEditingCourseId(null);
  };

  const handleProgrammeCoordinatorChange = async (coordinatorName) => {
    if (!selectedProgramme) return;
    const coordinator = programmeCoordinators.find(
      (item) => (item.name || item.username || item.email) === coordinatorName
    );
    if (!coordinator) return;
    await assignHodCoordinator({
      programmeId: selectedProgramme.id,
      coordinator: coordinator.name || coordinator.username || coordinator.email,
      coordinatorEmail: coordinator.email || '',
    });
  };

  const handleCourseCoordinatorChange = async (courseId, coordinatorId) => {
    if (!batchId || !coordinatorId) return;
    await assignCourseCoordinator(courseId, Number(coordinatorId), batchId);
  };

  const [deletingCourse, setDeletingCourse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleOpenDelete = (course) => {
    setDeletingCourse(course);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCourse) {
      deleteCourse(deletingCourse.id);
      setShowDeleteModal(false);
      setDeletingCourse(null);
    }
  };

  // Shared Style Tokens
  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';
  const inputStyle = {
    height: '38px', fontSize: '13px', fontWeight: '500',
    border: '1px solid #cbd5e1', borderRadius: '8px',
    padding: '0 12px', background: '#ffffff', color: ink,
    width: '100%', outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '4px' };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER BANNER ────────────────────────────────────────────────────── */}
      <div className="banner-dark-gradient" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {/* Left: title block */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: '#eef2ff', color: accent,
                fontWeight: '800', fontSize: '10px', borderRadius: '5px',
                padding: '2px 9px', letterSpacing: '0.07em', textTransform: 'uppercase',
                border: '1px solid #c7d2fe',
              }}>
                HOD Portal · Programme Coordinators
              </span>
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.01em' }}>
              Programme &amp; Course Allocation
            </h2>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
              Assign Programme Coordinator and manage courses for{' '}
              <strong style={{ color: accent }}>{selectedProgramme?.name ?? '—'}</strong>{' '}
              <span style={{ opacity: 0.8 }}>({durationYears} Years → {totalSemesters} Semesters)</span>
            </p>
          </div>

          {/* Right: Programme Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '280px', maxWidth: '420px', flex: '1 1 280px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Programme
            </label>
            <div style={{ position: 'relative' }}>
              <GraduationCap size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', zIndex: 1 }} />
              <select
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                style={{
                  width: '100%', height: '40px', fontSize: '13px',
                  fontWeight: '700', color: '#1e293b',
                  background: '#ffffff', border: '1.5px solid rgba(255,255,255,0.8)',
                  borderRadius: '9px', padding: '0 34px 0 32px',
                  outline: 'none', appearance: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                }}
              >
                {masterProgrammes.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} — {p.name} ({p.durationYears || 4} Yrs / {(p.durationYears || 4) * 2} Sems)</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── PROGRAMME COORDINATOR ALLOCATION CONTROL (BY HOD) ───────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Icon tile */}
          <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: '#eef2ff', color: accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: '800', color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
              Programme Coordinator — Assigned by HOD
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: '800', color: ink }}>
              {selectedProgramme?.name ?? '—'}
              <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: '600', color: accent, background: '#eef2ff', padding: '1px 8px', borderRadius: '5px', border: '1px solid #c7d2fe' }}>
                {selectedProgramme?.code ?? '—'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Avatar initial of currently assigned coordinator */}
          {selectedProgramme?.coordinator && (
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: accent, color: '#ffffff', display: 'grid', placeItems: 'center', fontSize: '13px', fontWeight: '800', flexShrink: 0, boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}>
              {(selectedProgramme.coordinator || '').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '700', color: muted, marginBottom: '4px' }}>
              Assigned Programme Coordinator
            </label>
            <select
              value={selectedProgramme?.coordinator || ''}
              onChange={(e) => handleProgrammeCoordinatorChange(e.target.value)}
              style={{
                height: '36px',
                padding: '0 12px',
                fontSize: '13px',
                fontWeight: '700',
                color: accent,
                background: '#ffffff',
                border: '1.5px solid #c7d2fe',
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                minWidth: '220px',
              }}
            >
              <option value="">Unassigned</option>
              {programmeCoordinators.map((fac) => {
                const facultyName = fac.name || fac.username || fac.email;
                const isHod = assignedHods.includes(facultyName);
                return (
                  <option key={fac.id} value={facultyName} disabled={isHod} style={{ color: isHod ? '#94a3b8' : '#0f172a' }}>
                    {facultyName} {isHod ? '(Disabled — Is HOD)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* ── INLINE ADD COURSE FORM ────────────────────────────────────────────── */}
      <form
        onSubmit={handleAddCourse}
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}
      >
        <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '10px' }}>
          Add Course for {selectedProgramme?.code ?? '—'} (Semesters: {totalSemesters} Total)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 130px 220px auto', gap: '10px', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Code *</label>
            <input
              type="text"
              required
              placeholder="CS305"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              style={{ ...inputStyle, fontWeight: '700', color: accent }}
            />
          </div>
          <div>
            <label style={labelStyle}>Course Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Compiler Design"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Semester ({totalSemesters} Sems) *</label>
            <select
              value={newSem}
              onChange={(e) => setNewSem(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', fontWeight: '700', color: accent }}
            >
              {programmeSemesters.map((s, index) => <option key={s} value={index + 1}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Course Coordinator *</label>
            <select
              value={newCoordinator}
              onChange={(e) => setNewCoordinator(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', color: accent, fontWeight: '600' }}
            >
              <option value="">Unassigned</option>
              {activeFaculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name || faculty.username || faculty.email}</option>)}
            </select>
          </div>
          <button
            type="submit"
            style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </form>

      {/* ── SEARCH + COUNT BAR ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search code, name, faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '34px', fontSize: '12.5px' }}
          />
        </div>
        <span style={{ fontSize: '12px', fontWeight: '600', color: muted }}>
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} in {selectedProgramme?.code ?? '—'}
        </span>
      </div>

      {/* ── COURSES TABLE ─────────────────────────────────────────────────────── */}
      <div style={{ ...surface, overflow: 'hidden', padding: 0, boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
        <table className="audit-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: '90px' }}>Code</th>
              <th>Course Name</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Semester ({totalSemesters} Sems)</th>
              <th style={{ width: '240px' }}>Course Coordinator</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Status</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: muted, fontSize: '12.5px' }}>
                  No courses found for <strong>{selectedProgramme?.name ?? 'the selected programme'}</strong>. Add one above.
                </td>
              </tr>
            )}

            {filteredCourses.map((c) => {
              const isEditing = editingCourseId === c.id;
              const offering = courseOfferings.find(
                (item) => item.courseId === c.id && item.batchId === batchId
              );

              return (
                <tr
                  key={c.id}
                  style={{ transition: 'background 0.12s' }}
                  onMouseEnter={(e) => { if (!isEditing) e.currentTarget.style.background = '#f8faff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                >
                  {/* Code */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        style={{ ...inputStyle, height: '34px', fontWeight: '700', color: accent, fontSize: '12px' }}
                      />
                    ) : (
                      <span style={{ fontWeight: '700', color: accent }}>{c.code}</span>
                    )}
                  </td>

                  {/* Name */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ ...inputStyle, height: '34px', fontSize: '12px' }}
                      />
                    ) : (
                      <span style={{ fontWeight: '600', color: ink }}>{c.name}</span>
                    )}
                  </td>

                  {/* Semester Dropdown dynamically bounded by 2 * durationYears */}
                  <td style={{ textAlign: 'center' }}>
                    {isEditing ? (
                      <select
                        value={editSem}
                        onChange={(e) => setEditSem(e.target.value)}
                        style={{ ...inputStyle, height: '34px', fontSize: '12px', cursor: 'pointer', fontWeight: '700', color: accent }}
                      >
                        {programmeSemesters.map((s, index) => <option key={s} value={index + 1}>{s}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontSize: '12px', color: accent, fontWeight: '800', background: '#e0e7ff', padding: '2px 8px', borderRadius: '4px' }}>
                        {c.semester}
                      </span>
                    )}
                  </td>

                  {/* Coordinator */}
                  <td>
                    {isEditing ? (
                      <select
                        value={editCoordinator}
                        onChange={(e) => setEditCoordinator(e.target.value)}
                        style={{ ...inputStyle, height: '34px', fontSize: '12px', cursor: 'pointer', color: accent, fontWeight: '600' }}
                      >
                        <option value="">Unassigned</option>
                        {activeFaculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name || faculty.username || faculty.email}</option>)}
                      </select>
                    ) : (
                      <select
                        value={offering?.courseCoordinatorId != null ? String(offering.courseCoordinatorId) : ''}
                        onChange={(e) => handleCourseCoordinatorChange(c.id, e.target.value)}
                        style={{ ...inputStyle, height: '34px', fontSize: '12px', cursor: 'pointer', color: accent, fontWeight: '600' }}
                      >
                        <option value="">Unassigned</option>
                        {activeFaculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name || faculty.username || faculty.email}</option>)}
                      </select>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                      <CheckCircle2 size={11} /> Allocated
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleSaveEdit(c.id)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                          title="Save"
                        >
                          <Save size={12} />
                        </button>
                        <button
                          onClick={() => setEditingCourseId(null)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: muted, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleStartEdit(c)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: accent, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                          title="Edit course"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(c)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                          title="Delete course"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── DELETE CONFIRM MODAL ──────────────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={showDeleteModal && !!deletingCourse}
        title="Delete Course?"
        itemName={deletingCourse ? `${deletingCourse.code} - ${deletingCourse.name}` : ''}
        description="This action cannot be undone. All data associated with this course will be permanently removed."
        confirmText="Delete Course"
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
