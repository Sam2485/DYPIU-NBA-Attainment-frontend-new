import { useState, useEffect } from 'react';
import AuditTable from '../../components/tables/AuditTable';
import { Save, Building2, BookOpen, Layers, UserCheck, Plus, Trash2 } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function AcademicSetup() {
  const { role } = useAuth();
  const {
    programmes: globalProgrammes,
    programmeId,
    selectedProgramme,
    courses: globalCourses,
    updateCourseFacultyAllocation,
  } = useAcademic();

  const initialTab = role === 'SUPER_ADMIN' ? 'programmes' : 'courses';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [programmes, setProgrammes] = useState(globalProgrammes);

  const [departments, setDepartments] = useState([
    { id: 'dept-1', code: 'CSE', name: 'School of Computer Science & Engineering', programmeId: 'prog-1', status: 'ACTIVE' },
    { id: 'dept-2', code: 'ECE', name: 'School of Electronics & Communication', programmeId: 'prog-1', status: 'ACTIVE' },
    { id: 'dept-3', code: 'SOM', name: 'School of Management Studies', programmeId: 'prog-3', status: 'ACTIVE' },
  ]);

  const [courses, setCourses] = useState(globalCourses);

  useEffect(() => {
    setCourses(globalCourses);
  }, [globalCourses]);

  const filteredDepartments = departments.filter((d) => d.programmeId === programmeId);
  const filteredCourses = courses.filter((c) => c.programmeId === programmeId);

  // Add Handlers
  const handleAddProgramme = () => {
    const newProg = {
      id: `prog-${Date.now()}`,
      code: `PROG-${programmes.length + 1}`,
      name: 'New Degree Programme',
      shortName: 'NEW',
      durationYears: 4,
      department: 'School of Computer Science',
      status: 'ACTIVE',
    };
    setProgrammes([...programmes, newProg]);
  };

  const handleAddDepartment = () => {
    const newDept = {
      id: `dept-${Date.now()}`,
      code: `DEPT-${departments.length + 1}`,
      name: 'New Academic Department',
      programmeId: programmeId,
      status: 'ACTIVE',
    };
    setDepartments([...departments, newDept]);
  };

  const handleAddCourse = () => {
    const newCourse = {
      id: `crs-${Date.now()}`,
      code: `CS${courses.length + 101}`,
      name: 'New Course Title',
      credits: 3,
      type: 'THEORY',
      programmeId: programmeId,
      semester: 'Sem 1',
      status: 'ACTIVE',
      assignedFaculty: ['Dr. Raj Shaikh'],
      faculty: 'Dr. Raj Shaikh',
    };
    setCourses([...courses, newCourse]);
  };

  // Cell Change Handlers
  const handleProgrammeChangeCell = (index, field, value) => {
    const updated = [...programmes];
    updated[index][field] = value;
    setProgrammes(updated);
  };

  const handleDepartmentChangeCell = (filteredIndex, field, value) => {
    const targetId = filteredDepartments[filteredIndex].id;
    const updated = departments.map((d) => (d.id === targetId ? { ...d, [field]: value } : d));
    setDepartments(updated);
  };

  const handleCourseChangeCell = (filteredIndex, field, value) => {
    const targetId = filteredCourses[filteredIndex].id;
    const updated = courses.map((c) => (c.id === targetId ? { ...c, [field]: value } : c));
    setCourses(updated);
  };

  // Delete Handlers
  const handleDeleteProgramme = (index) => {
    const targetId = programmes[index].id;
    setProgrammes(programmes.filter((p) => p.id !== targetId));
  };

  const handleDeleteDepartment = (filteredIndex) => {
    const targetId = filteredDepartments[filteredIndex].id;
    setDepartments(departments.filter((d) => d.id !== targetId));
  };

  const handleDeleteCourse = (filteredIndex) => {
    const targetId = filteredCourses[filteredIndex].id;
    setCourses(courses.filter((c) => c.id !== targetId));
  };

  // Faculty Allocation Handlers (Programme Coordinators allocate multiple faculty members to courses)
  const handleToggleFacultyAllocation = (courseId, facultyName) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetCourse) return;

    const currentAssigned = targetCourse.assignedFaculty || ['Dr. Raj Shaikh'];
    let updatedAssigned = [];
    if (currentAssigned.includes(facultyName)) {
      if (currentAssigned.length === 1) {
        alert('Each course must have at least one assigned faculty member!');
        return;
      }
      updatedAssigned = currentAssigned.filter((f) => f !== facultyName);
    } else {
      updatedAssigned = [...currentAssigned, facultyName];
    }

    updateCourseFacultyAllocation(courseId, updatedAssigned);
  };

  const handleSaveChanges = (entityName) => {
    alert(`Changes to ${entityName} saved successfully!`);
  };

  return (
    <div className="animated-page">
      {/* Top Banner */}
      <div className="banner-dark-gradient">
        <div className="banner-content-row">
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Academic Setup & Faculty Course Allocation
            </h2>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {role === 'SUPER_ADMIN' && (
          <button
            className={`btn ${activeTab === 'programmes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('programmes')}
          >
            <Layers size={15} /> 1. Degree Programmes ({programmes.length})
          </button>
        )}

        <button
          className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={15} /> 1. Courses ({filteredCourses.length})
        </button>

        <button
          className={`btn ${activeTab === 'allocations' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('allocations')}
        >
          <UserCheck size={15} /> 2. Faculty Course Allocations ({filteredCourses.length})
        </button>

        <button
          className={`btn ${activeTab === 'departments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('departments')}
        >
          <Building2 size={15} /> 3. Departments ({filteredDepartments.length})
        </button>
      </div>

      {/* TAB 1: Degree Programmes */}
      {activeTab === 'programmes' && role === 'SUPER_ADMIN' && (
        <AuditTable
          title="Degree Programmes"
          subtitle="Configure degree programmes, duration, and default department."
          columns={[
            { key: 'code', label: 'Programme Code', width: '150px' },
            { key: 'name', label: 'Programme Name', width: '320px' },
            { key: 'shortName', label: 'Abbr', width: '100px' },
            { key: 'durationYears', label: 'Duration (Yrs)', width: '120px', type: 'number', align: 'center' },
            { key: 'department', label: 'Default Department', width: '220px' },
            {
              key: 'status',
              label: 'Status',
              width: '120px',
              type: 'select',
              options: [
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ],
            },
          ]}
          data={programmes}
          onAddRow={handleAddProgramme}
          onDeleteRow={handleDeleteProgramme}
          onChangeCell={handleProgrammeChangeCell}
          actions={
            <button className="btn btn-primary" onClick={() => handleSaveChanges('Programmes')}>
              <Save size={14} /> Save Changes
            </button>
          }
        />
      )}

      {/* TAB 2: Courses */}
      {activeTab === 'courses' && (
        <AuditTable
          title={`Courses for ${selectedProgramme?.name} (${selectedProgramme?.code})`}
          subtitle="Add and configure academic courses for the selected programme."
          columns={[
            { key: 'code', label: 'Course Code', width: '140px' },
            { key: 'name', label: 'Course Title', width: '320px' },
            { key: 'credits', label: 'Credits', width: '90px', type: 'number', align: 'center' },
            {
              key: 'type',
              label: 'Course Type',
              width: '180px',
              type: 'select',
              options: [
                { value: 'THEORY', label: 'THEORY' },
                { value: 'PRACTICAL', label: 'PRACTICAL' },
                { value: 'THEORY_PRACTICAL', label: 'THEORY_PRACTICAL' },
                { value: 'PROJECT', label: 'PROJECT' },
                { value: 'AUDIT', label: 'AUDIT' },
              ],
            },
            {
              key: 'semester',
              label: 'Semester',
              width: '120px',
              type: 'select',
              options: [
                { value: 'Sem 1', label: 'Sem 1' },
                { value: 'Sem 2', label: 'Sem 2' },
                { value: 'Sem 3', label: 'Sem 3' },
                { value: 'Sem 4', label: 'Sem 4' },
                { value: 'Sem 5', label: 'Sem 5' },
                { value: 'Sem 6', label: 'Sem 6' },
                { value: 'Sem 7', label: 'Sem 7' },
                { value: 'Sem 8', label: 'Sem 8' },
              ],
            },
            {
              key: 'status',
              label: 'Status',
              width: '120px',
              type: 'select',
              options: [
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ],
            },
          ]}
          data={filteredCourses}
          onAddRow={handleAddCourse}
          onDeleteRow={handleDeleteCourse}
          onChangeCell={handleCourseChangeCell}
          actions={
            <button className="btn btn-primary" onClick={() => handleSaveChanges('Courses')}>
              <Save size={14} /> Save Changes
            </button>
          }
        />
      )}

      {/* TAB 3: Faculty Course Allocations (Programme Coordinator Assigns 1 or More Faculty Per Course) */}
      {activeTab === 'allocations' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                Faculty Course Allocation Management ({selectedProgramme?.code})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Programme Coordinators can assign 1 or more faculty members to each course. Faculty will work on their assigned courses.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => handleSaveChanges('Faculty Allocations')}>
              <Save size={14} /> Save Allocations
            </button>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                  <th style={{ width: '130px' }}>Course Code</th>
                  <th style={{ width: '260px' }}>Course Title</th>
                  <th style={{ width: '100px' }}>Semester</th>
                  <th>Allocated Faculty Members (Multiple Allowed)</th>
                  <th style={{ width: '220px' }}>Assign / Allocate Faculty</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course, idx) => {
                  const assigned = course.assignedFaculty || ['Dr. Raj Shaikh'];

                  return (
                    <tr key={course.id}>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ fontWeight: '800', color: '#4f46e5' }}>{course.code}</td>
                      <td style={{ fontWeight: '600' }}>{course.name}</td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>{course.semester}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {assigned.map((f) => (
                            <span
                              key={f}
                              className="badge badge-active"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#eef2ff',
                                color: '#4f46e5',
                                border: '1px solid #c7d2fe',
                                padding: '4px 9px',
                                borderRadius: '16px',
                                fontSize: '11.5px',
                                fontWeight: '700',
                              }}
                            >
                              👤 {f}
                              <button
                                type="button"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: 0,
                                  fontSize: '11px',
                                  fontWeight: '800',
                                }}
                                title="Remove Faculty Allocation"
                                onClick={() => handleToggleFacultyAllocation(course.id, f)}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{
                            width: '100%',
                            fontSize: '12px',
                            padding: '4px 8px',
                            height: '32px',
                            fontWeight: '700',
                            borderColor: '#cbd5e1',
                          }}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleToggleFacultyAllocation(course.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">+ Allocate Faculty...</option>
                          {MASTER_FACULTY_LIST.map((fac) => (
                            <option key={fac} value={fac} disabled={assigned.includes(fac)}>
                              {assigned.includes(fac) ? `✓ ${fac} (Allocated)` : `+ ${fac}`}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Departments */}
      {activeTab === 'departments' && (
        <AuditTable
          title={`Departments for ${selectedProgramme?.name} (${selectedProgramme?.code})`}
          subtitle="Add and configure departments associated with the selected programme."
          columns={[
            { key: 'code', label: 'Department Code', width: '160px' },
            { key: 'name', label: 'Department Name', width: '400px' },
            {
              key: 'status',
              label: 'Status',
              width: '140px',
              type: 'select',
              options: [
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ],
            },
          ]}
          data={filteredDepartments}
          onAddRow={handleAddDepartment}
          onDeleteRow={handleDeleteDepartment}
          onChangeCell={handleDepartmentChangeCell}
          actions={
            <button className="btn btn-primary" onClick={() => handleSaveChanges('Departments')}>
              <Save size={14} /> Save Changes
            </button>
          }
        />
      )}

      {/* Save, Previous & Save & Next Footer */}
      <SectionSaveFooter
        label="Academic Setup"
        prevPath="/dashboard"
        nextPath="/outcomes"
        onSave={() => handleSaveChanges('Academic Setup')}
      />
    </div>
  );
}
