import { useState, useEffect } from 'react';
import AuditTable from '../../components/tables/AuditTable';
import { Save, Plus, Building2, BookOpen, Layers } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

export default function AcademicSetup() {
  const { role } = useAuth();
  const {
    programmes: globalProgrammes,
    programmeId,
    selectedProgramme,
    courses: globalCourses,
  } = useAcademic();

  // Role Restriction: HOD can only access Departments and Courses tabs (not Programmes)
  const initialTab = role === 'HOD' ? 'departments' : 'programmes';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (role === 'HOD' && activeTab === 'programmes') {
      setActiveTab('departments');
    }
  }, [role, activeTab]);

  // Local Editable States
  const [programmes, setProgrammes] = useState(globalProgrammes);

  const [departments, setDepartments] = useState([
    { id: 'dept-1', code: 'CSE', name: 'School of Computer Science & Engineering', programmeId: 'prog-1', status: 'ACTIVE' },
    { id: 'dept-2', code: 'ECE', name: 'School of Electronics & Communication', programmeId: 'prog-1', status: 'ACTIVE' },
    { id: 'dept-3', code: 'SOM', name: 'School of Management Studies', programmeId: 'prog-3', status: 'ACTIVE' },
  ]);

  const [courses, setCourses] = useState(globalCourses);

  // Filtered lists based on Centralized Selected Programme
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
    };
    setCourses([...courses, newCourse]);
  };

  // Change Cell Handlers
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

  // Save Changes Handlers
  const handleSaveChanges = (entityName) => {
    alert(`Changes to ${entityName} saved successfully!`);
  };

  return (
    <div className="animated-page">
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)',
          color: '#fff',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge badge-active" style={{ marginBottom: '6px' }}>
              Academic Management Module 1 ({role})
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#fff', fontWeight: '800' }}>
              Academic Setup & Management
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#bfdbfe' }}>
              Managing: <strong>{selectedProgramme?.code} - {selectedProgramme?.name}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs with Role-Based Visibility */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {/* Degree Programmes tab is visible ONLY to SUPER_ADMIN */}
        {role === 'SUPER_ADMIN' && (
          <button
            className={`btn ${activeTab === 'programmes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('programmes')}
          >
            <Layers size={15} /> 1. Degree Programmes ({programmes.length})
          </button>
        )}

        {/* Departments and Courses tabs accessible to both SUPER_ADMIN and HOD */}
        <button
          className={`btn ${activeTab === 'departments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('departments')}
        >
          <Building2 size={15} /> {role === 'SUPER_ADMIN' ? '2.' : '1.'} Departments for {selectedProgramme?.code} ({filteredDepartments.length})
        </button>

        <button
          className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={15} /> {role === 'SUPER_ADMIN' ? '3.' : '2.'} Courses for {selectedProgramme?.code} ({filteredCourses.length})
        </button>
      </div>

      {/* TAB 1: Degree Programmes (SUPER_ADMIN ONLY) */}
      {activeTab === 'programmes' && role === 'SUPER_ADMIN' && (
        <AuditTable
          title="Degree Programmes (Entity: Programme)"
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

      {/* TAB 2: Departments (Accessible to SUPER_ADMIN & HOD) */}
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

      {/* TAB 3: Courses (Accessible to SUPER_ADMIN & HOD) */}
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
    </div>
  );
}
