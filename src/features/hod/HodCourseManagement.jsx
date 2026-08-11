import { useState } from 'react';
import { BookOpen, Users, UserCheck, CheckCircle2, Search, Plus, Edit2, Trash2, Save, X, GraduationCap } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export default function HodCourseManagement() {
  const {
    masterProgrammes = [],
    departments = [],
    programmeId,
    setProgrammeId,
    updateProgramme = () => {},
    courses = [],
    assignCourseCoordinator = () => {},
    addCourse = () => {},
    updateCourse = () => {},
    deleteCourse = () => {},
  } = useAcademic();

  const [searchQuery, setSearchQuery] = useState('');

  const assignedHods = departments.map((d) => d.hod).filter(Boolean);

  const selectedProgramme = masterProgrammes.find((p) => p.id === programmeId) || masterProgrammes[0] || { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP', durationYears: 4 };

  const durationYears = selectedProgramme.durationYears || 4;
  const totalSemesters = durationYears * 2;
  const programmeSemesters = Array.from({ length: totalSemesters }, (_, i) => `Sem ${ROMAN_NUMERALS[i] || i + 1}`);

  // Inline Add Course Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSem, setNewSem] = useState(programmeSemesters[0] || 'Sem I');
  const [newCoordinator, setNewCoordinator] = useState(MASTER_FACULTY_LIST[0] || 'Dr. Raj Shaikh');

  // Inline Edit Row State
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editSem, setEditSem] = useState('');
  const [editCoordinator, setEditCoordinator] = useState('');

  // Filter courses by selected programme & search query
  const filteredCourses = courses
    .filter((c) => !c.programmeId || c.programmeId === programmeId)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.faculty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.coordinator || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    const createdCourse = {
      id: `crs-${Date.now()}`,
      programmeId,
      code: newCode,
      name: newName,
      semester: newSem,
      coordinator: newCoordinator,
      faculty: newCoordinator,
    };

    addCourse(createdCourse);
    alert(`🎉 Course ${newCode} - ${newName} added to ${selectedProgramme.name} (${newSem})!`);
    setNewCode('');
    setNewName('');
  };

  const handleStartEdit = (course) => {
    setEditingCourseId(course.id);
    setEditCode(course.code);
    setEditName(course.name);
    setEditSem(course.semester || programmeSemesters[0]);
    setEditCoordinator(course.coordinator || (course.faculty || '').split('/')[0].trim());
  };

  const handleSaveEdit = (courseId) => {
    updateCourse(courseId, {
      code: editCode,
      name: editName,
      semester: editSem,
      coordinator: editCoordinator,
      faculty: editCoordinator,
    });
    setEditingCourseId(null);
  };

  const handleDeleteCourse = (course) => {
    if (window.confirm(`Are you sure you want to delete course "${course.code} - ${course.name}"?`)) {
      deleteCourse(course.id);
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

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>HOD View</div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>Programme &amp; Course Allocation</h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            Assign Programme Coordinator and manage courses for {selectedProgramme.name} ({durationYears} Years → {totalSemesters} Semesters).
          </p>
        </div>

        {/* Programme Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GraduationCap size={18} style={{ color: accent }} />
          <select
            value={programmeId}
            onChange={(e) => setProgrammeId(e.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: '280px', fontWeight: '800', color: accent, cursor: 'pointer' }}
          >
            {masterProgrammes.map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name} ({p.durationYears || 4} Yrs / {(p.durationYears || 4) * 2} Sems)</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── PROGRAMME COORDINATOR ALLOCATION CONTROL (BY HOD) ───────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px', background: '#f8fafc', borderColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eef2ff', color: accent, display: 'grid', placeItems: 'center' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Programme Coordinator Allocation (Assigned by HOD)
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: '800', color: ink, marginTop: '2px' }}>
              {selectedProgramme.name} ({selectedProgramme.code})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: '700', color: ink }}>Assigned Programme Coordinator:</label>
          <select
            value={selectedProgramme.coordinator || 'Dr. A. K. Sharma'}
            onChange={(e) => {
              updateProgramme(selectedProgramme.id, { coordinator: e.target.value });
              alert(`✓ Assigned ${e.target.value} as Programme Coordinator for ${selectedProgramme.code}!`);
            }}
            style={{
              height: '38px',
              padding: '0 12px',
              fontSize: '13px',
              fontWeight: '800',
              color: accent,
              background: '#ffffff',
              border: '1.5px solid #4f46e5',
              borderRadius: '8px',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(79,70,229,0.1)',
            }}
          >
            {MASTER_FACULTY_LIST.map((fac) => {
              const isHod = assignedHods.includes(fac);
              return (
                <option key={fac} value={fac} disabled={isHod} style={{ color: isHod ? '#94a3b8' : '#0f172a' }}>
                  {fac} {isHod ? '(Disabled — Is HOD)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* ── INLINE ADD COURSE FORM ────────────────────────────────────────────── */}
      <form
        onSubmit={handleAddCourse}
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}
      >
        <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '10px' }}>
          Add Course for {selectedProgramme.code} (Semesters: {totalSemesters} Total)
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
              {programmeSemesters.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Course Coordinator *</label>
            <select
              value={newCoordinator}
              onChange={(e) => setNewCoordinator(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', color: accent, fontWeight: '600' }}
            >
              {MASTER_FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
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
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} in {selectedProgramme.code}
        </span>
      </div>

      {/* ── COURSES TABLE ─────────────────────────────────────────────────────── */}
      <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
        <table className="audit-data-table">
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
                  No courses found for <strong>{selectedProgramme.name}</strong>. Add one above.
                </td>
              </tr>
            )}

            {filteredCourses.map((c) => {
              const isEditing = editingCourseId === c.id;
              const coord = c.coordinator || (c.faculty || '').split('/')[0].trim();

              return (
                <tr key={c.id}>
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
                        {programmeSemesters.map((s) => <option key={s} value={s}>{s}</option>)}
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
                        {MASTER_FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    ) : (
                      <select
                        value={coord}
                        onChange={(e) => assignCourseCoordinator(c.id, e.target.value)}
                        style={{ ...inputStyle, height: '34px', fontSize: '12px', cursor: 'pointer', color: accent, fontWeight: '600' }}
                      >
                        {MASTER_FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
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
                          onClick={() => handleDeleteCourse(c)}
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
    </div>
  );
}
