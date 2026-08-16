import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Search, ChevronDown, BookOpen, Layers, Loader2 } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import {
  getProgrammes,
  getCourses,
  saveCourse,
  deleteCourse as deleteCourseApi,
  getUsersByRole,
  getProgrammePOs,
  getProgrammePSOs,
  getProgrammePEOs,
} from '../../api/academic';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

// ── Style tokens ─────────────────────────────────────────────────────────────
const surface    = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink        = '#0f172a';
const muted      = '#64748b';
const accent     = '#4f46e5';
const inputStyle = {
  height: '40px', fontSize: '13px', border: '1px solid #e2e8f0',
  borderRadius: '8px', padding: '0 12px', background: '#ffffff',
  color: ink, width: '100%', outline: 'none', fontFamily: 'inherit',
};
const labelStyle = {
  display: 'block', fontSize: '11.5px', fontWeight: '600',
  color: muted, marginBottom: '5px',
};

const SEMESTERS = ['Sem I', 'Sem II', 'Sem III', 'Sem IV', 'Sem V', 'Sem VI', 'Sem VII', 'Sem VIII'];

export default function AcademicSetup() {
  const { user } = useAuth();
  const { masterProgrammes = [] } = useAcademic();

  const [programmesList, setProgrammesList] = useState([]);
  const [selectedProgId, setSelectedProgId] = useState('');
  const [coursesList, setCoursesList] = useState([]);
  const [coordinatorsList, setCoordinatorsList] = useState([]);

  const [activePOsList, setActivePOsList] = useState([]);
  const [activePSOsList, setActivePSOsList] = useState([]);
  const [activePEOsList, setActivePEOsList] = useState([]);

  const [isLoadingProgrammes, setIsLoadingProgrammes] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  const [deletingCourse, setDeletingCourse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [activeTab,   setActiveTab]   = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeTab,  setOutcomeTab]  = useState('PO');

  // Add-course form state
  const [newCode,  setNewCode]  = useState('');
  const [newName,  setNewName]  = useState('');
  const [newSem,   setNewSem]   = useState('Sem V');
  const [newCoord, setNewCoord] = useState('');

  // 1. Load Programmes & Course Coordinators on initial mount
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      setIsLoadingProgrammes(true);
      try {
        const progRes = await getProgrammes('', '', user?.email);
        const rawProgs = progRes?.data?.data || progRes?.data || [];
        if (isMounted) {
          const allProgs = Array.isArray(rawProgs) && rawProgs.length > 0 ? rawProgs : masterProgrammes;
          const userEmail = user?.email?.toLowerCase();
          const userAssigned = allProgs.filter(
            (p) =>
              (p.coordinatorEmail && p.coordinatorEmail.toLowerCase() === userEmail) ||
              (p.coordinator && p.coordinator.toLowerCase() === userEmail)
          );
          const finalProgs = userAssigned.length > 0 ? userAssigned : allProgs;
          setProgrammesList(finalProgs);

          // Select the first programme returned by default if not already set
          if (finalProgs.length > 0 && !selectedProgId) {
            setSelectedProgId(finalProgs[0].id);
          }
        }

        // Fetch Course Coordinators and Faculty members by role
        const [ccRes, facRes] = await Promise.allSettled([
          getUsersByRole('course-coordinator'),
          getUsersByRole('faculty'),
        ]);

        let combinedUsers = [];
        if (ccRes.status === 'fulfilled') {
          const ccList = ccRes.value?.data?.data || ccRes.value?.data || [];
          if (Array.isArray(ccList)) combinedUsers.push(...ccList);
        }
        if (facRes.status === 'fulfilled') {
          const facList = facRes.value?.data?.data || facRes.value?.data || [];
          if (Array.isArray(facList)) combinedUsers.push(...facList);
        }

        if (isMounted) {
          const uniqueCoordinators = Array.from(
            new Map(combinedUsers.map((u) => [u.email || u.id || u.name, u.name])).values()
          );
          const finalCoords = uniqueCoordinators.length > 0 ? uniqueCoordinators : MASTER_FACULTY_LIST;
          setCoordinatorsList(finalCoords);
          if (!newCoord && finalCoords.length > 0) {
            setNewCoord(finalCoords[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load initial data for Programme Setup:', err);
      } finally {
        if (isMounted) setIsLoadingProgrammes(false);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // 2. Load Courses, POs, PSOs, and PEOs whenever selected programme changes
  useEffect(() => {
    if (!selectedProgId) return;

    let isMounted = true;
    const fetchProgrammeDetails = async () => {
      setIsLoadingCourses(true);
      try {
        const [crsRes, poRes, psoRes, peoRes] = await Promise.allSettled([
          getCourses(selectedProgId),
          getProgrammePOs(selectedProgId),
          getProgrammePSOs(selectedProgId),
          getProgrammePEOs(selectedProgId),
        ]);

        if (isMounted) {
          if (crsRes.status === 'fulfilled') {
            const fetchedCourses = crsRes.value?.data?.data || crsRes.value?.data || [];
            setCoursesList(Array.isArray(fetchedCourses) ? fetchedCourses : []);
          }

          if (poRes.status === 'fulfilled') {
            const fetchedPOs = poRes.value?.data?.data || poRes.value?.data || [];
            setActivePOsList(Array.isArray(fetchedPOs) ? fetchedPOs : []);
          }

          if (psoRes.status === 'fulfilled') {
            const fetchedPSOs = psoRes.value?.data?.data || psoRes.value?.data || [];
            setActivePSOsList(Array.isArray(fetchedPSOs) ? fetchedPSOs : []);
          }

          if (peoRes.status === 'fulfilled') {
            const fetchedPEOs = peoRes.value?.data?.data || peoRes.value?.data || [];
            setActivePEOsList(Array.isArray(fetchedPEOs) ? fetchedPEOs : []);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch details for programme', selectedProgId, err);
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    };

    fetchProgrammeDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedProgId]);

  const selectedProgramme =
    programmesList.find((p) => p.id === selectedProgId) ||
    programmesList[0] ||
    { id: '', name: 'No Programme Selected', code: '—' };

  const normPSOs = activePSOsList.map((p) => ({ ...p, competencies: p.competencies ?? [] }));

  const filteredCourses = coursesList.filter((c) =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.coordinator || c.faculty || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    setIsSavingCourse(true);
    try {
      const coursePayload = {
        code: newCode.toUpperCase().trim(),
        name: newName.trim(),
        programmeId: selectedProgId,
        semester: newSem,
        coordinator: newCoord || coordinatorsList[0] || 'Unassigned',
        faculty: newCoord || coordinatorsList[0] || 'Unassigned',
      };

      const res = await saveCourse(coursePayload);
      const savedCourse = res?.data?.data || res?.data || coursePayload;
      setCoursesList((prev) => [...prev, savedCourse]);

      setNewCode('');
      setNewName('');
    } catch (err) {
      console.error('Failed to add course:', err);
      alert('Failed to save course to backend.');
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleAssignCourseCoordinator = async (courseObj, newFaculty) => {
    try {
      const updatedObj = {
        ...courseObj,
        coordinator: newFaculty,
        faculty: newFaculty,
      };
      const res = await saveCourse(updatedObj);
      const savedCourse = res?.data?.data || res?.data || updatedObj;
      setCoursesList((prev) => prev.map((c) => (c.id === courseObj.id ? savedCourse : c)));
    } catch (err) {
      console.error('Failed to update course coordinator:', err);
      alert('Failed to update course coordinator in backend.');
    }
  };

  const handleOpenDeleteModal = (c) => {
    setDeletingCourse(c);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingCourse) {
      try {
        await deleteCourseApi(deletingCourse.id);
        setCoursesList((prev) => prev.filter((c) => c.id !== deletingCourse.id));
      } catch (err) {
        console.error('Failed to delete course:', err);
        alert('Failed to delete course from backend.');
      } finally {
        setShowDeleteModal(false);
        setDeletingCourse(null);
      }
    }
  };

  const tabs = [
    { id: 'courses',   label: `Courses & Coordinator (${coursesList.length})`, icon: BookOpen },
    { id: 'outcomes',  label: 'View PO / PSO / PEO',                           icon: Layers   },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Programme Coordinator &nbsp;·&nbsp; Programme Setup
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Programme Setup
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            Manage courses, assign coordinators, and view outcomes for <strong>{selectedProgramme.name}</strong>.
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedProgId}
            onChange={(e) => setSelectedProgId(e.target.value)}
            disabled={isLoadingProgrammes}
            style={{ height: '38px', paddingLeft: '12px', paddingRight: '32px', fontSize: '12.5px', fontWeight: '600', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', color: ink, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none', maxWidth: '320px' }}
          >
            {programmesList.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
        </div>
      </div>

      {/* ── TAB STRIP ─────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '9px' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)}
              style={{ padding: '7px 18px', borderRadius: '7px', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', background: activeTab === id ? '#ffffff' : 'transparent', color: activeTab === id ? accent : muted, boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
        {activeTab === 'courses' && (
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '34px', fontSize: '12.5px' }} />
          </div>
        )}
      </div>

      {/* ── TAB 1: COURSES & COORDINATOR ──────────────────────────────────── */}
      {activeTab === 'courses' && (
        <div>
          {/* Inline add form */}
          <form onSubmit={handleAddCourse} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '10px' }}>Add Course</div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 130px 220px auto', gap: '10px', alignItems: 'flex-end' }}>
              <div>
                <label style={labelStyle}>Code *</label>
                <input type="text" required placeholder="CS305" value={newCode} onChange={(e) => setNewCode(e.target.value)} style={{ ...inputStyle, fontWeight: '700', color: accent }} />
              </div>
              <div>
                <label style={labelStyle}>Course Name *</label>
                <input type="text" required placeholder="e.g. Compiler Design" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Semester</label>
                <select value={newSem} onChange={(e) => setNewSem(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Course Coordinator</label>
                <select value={newCoord} onChange={(e) => setNewCoord(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', color: accent, fontWeight: '600' }}>
                  {coordinatorsList.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isSavingCourse} style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: isSavingCourse ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', opacity: isSavingCourse ? 0.7 : 1 }}>
                {isSavingCourse ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} {isSavingCourse ? 'Saving...' : 'Add'}
              </button>
            </div>
          </form>

          {/* Single combined table */}
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Code</th>
                  <th>Course Name</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Semester</th>
                  <th style={{ width: '250px' }}>Course Coordinator</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingCourses ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: muted, fontSize: '12.5px' }}>Loading courses from backend...</td></tr>
                ) : filteredCourses.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: muted, fontSize: '12.5px' }}>
                    No courses yet — add one above.
                  </td></tr>
                ) : (
                  filteredCourses.map((c) => {
                    const coord = c.coordinator || (c.faculty || '').split('/')[0].trim() || (coordinatorsList[0] || 'Unassigned');
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: '700', color: accent }}>{c.code}</td>
                        <td style={{ fontWeight: '600', color: ink }}>{c.name}</td>
                        <td style={{ textAlign: 'center', color: muted, fontSize: '12px' }}>{c.semester || 'Sem I'}</td>
                        <td>
                          <select
                            value={coord}
                            onChange={(e) => handleAssignCourseCoordinator(c, e.target.value)}
                            style={{ ...inputStyle, height: '34px', fontSize: '12px', cursor: 'pointer', color: accent, fontWeight: '600' }}
                          >
                            {coordinatorsList.map((f) => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px' }}>
                            <Check size={11} /> Active
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => handleOpenDeleteModal(c)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }} title="Delete Course">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: VIEW PO / PSO / PEO (READ-ONLY) ───────────────────────── */}
      {activeTab === 'outcomes' && (
        <div>
          {/* Outcome type sub-tabs */}
          <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '9px', width: 'fit-content', marginBottom: '18px' }}>
            {[
              ['PO',  `POs (${activePOsList.length})`],
              ['PSO', `PSOs (${normPSOs.length})`],
              ['PEO', `PEOs (${activePEOsList.length})`],
            ].map(([tab, label]) => (
              <button key={tab} type="button" onClick={() => setOutcomeTab(tab)}
                style={{ padding: '7px 18px', borderRadius: '7px', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', background: outcomeTab === tab ? '#ffffff' : 'transparent', color: outcomeTab === tab ? accent : muted, boxShadow: outcomeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Read-only notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
            <span style={{ fontSize: '11.5px', color: muted, fontWeight: '600' }}>
              📖 Read-only view. POs, PSOs and PEOs are managed by the HOD.
            </span>
          </div>

          {/* PO list */}
          {outcomeTab === 'PO' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {activePOsList.length === 0 && (
                <div style={{ ...surface, padding: '32px', textAlign: 'center', color: muted, fontSize: '12.5px' }}>
                  No Programme Outcomes defined yet. Ask your HOD to add them.
                </div>
              )}
              {activePOsList.map((po, idx) => (
                <div key={idx} style={{ ...surface, padding: '14px 18px', borderLeft: '3px solid #4f46e5' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: accent, width: '48px', flexShrink: 0, paddingTop: '1px' }}>{po.code}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: ink, lineHeight: 1.5 }}>{po.statement}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PSO list */}
          {outcomeTab === 'PSO' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {normPSOs.length === 0 && (
                <div style={{ ...surface, padding: '32px', textAlign: 'center', color: muted, fontSize: '12.5px' }}>
                  No Programme Specific Outcomes defined yet. Ask your HOD to add them.
                </div>
              )}
              {normPSOs.map((pso, idx) => (
                <div key={idx} style={{ ...surface, padding: '14px 18px', borderLeft: '3px solid #059669' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#059669', width: '48px', flexShrink: 0, paddingTop: '1px' }}>{pso.code}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: ink, lineHeight: 1.5 }}>{pso.statement}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PEO list */}
          {outcomeTab === 'PEO' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {activePEOsList.length === 0 && (
                <div style={{ ...surface, padding: '32px', textAlign: 'center', color: muted, fontSize: '12.5px' }}>
                  No Programme Educational Objectives defined yet. Ask your HOD to add them.
                </div>
              )}
              {activePEOsList.map((peo, idx) => (
                <div key={idx} style={{ ...surface, padding: '14px 18px', borderLeft: '3px solid #0284c7', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0284c7', width: '48px', flexShrink: 0 }}>{peo.code}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: ink, lineHeight: 1.5 }}>{peo.statement}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
