import { useState } from 'react';
import { BookOpen, Users, UserCheck, CheckCircle2, Search } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';

export default function HodCourseManagement() {
  const {
    courses = [],
    assignCourseCoordinator = () => {},
  } = useAcademic();

  const [searchQuery, setSearchQuery] = useState('');

  const handleCoordinatorChange = (courseId, facultyName) => {
    assignCourseCoordinator(courseId, facultyName);
    alert(`✓ Course Coordinator for ${courseId} assigned to ${facultyName}`);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.faculty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fef08a', fontWeight: '800', fontSize: '11px' }}>
                HOD PORTAL • COURSE MANAGEMENT
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              Course Management & Faculty Coordinator Allocation
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Verify courses under the programme and assign senior faculty members as Course Coordinators.
            </p>
          </div>
        </div>
      </div>

      {/* ── SEARCH BAR ────────────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by course name, code, or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '12.5px' }}
            />
          </div>

          <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>
            Total Courses: <strong>{filteredCourses.length}</strong>
          </div>
        </div>
      </div>

      {/* ── COURSES TABLE ─────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="audit-data-table">
          <thead>
            <tr>
              <th style={{ width: '90px', textAlign: 'center' }}>Code</th>
              <th>Course Name</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Semester</th>
              <th style={{ width: '280px' }}>Assign Course Coordinator</th>
              <th style={{ width: '140px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((c) => {
              const assignedCoord = c.coordinator || c.faculty.split('/')[0].trim();

              return (
                <tr key={c.id}>
                  <td style={{ textAlign: 'center', fontWeight: '900', color: '#4f46e5' }}>
                    {c.code}
                  </td>
                  <td style={{ fontWeight: '700', color: '#0f172a', fontSize: '13.5px' }}>
                    {c.name}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>
                    {c.semester}
                  </td>
                  <td>
                    <select
                      value={assignedCoord}
                      onChange={(e) => handleCoordinatorChange(c.id, e.target.value)}
                      className="form-input"
                      style={{ height: '36px', fontSize: '12.5px', fontWeight: '700', color: '#4f46e5' }}
                    >
                      {MASTER_FACULTY_LIST.map((fac) => (
                        <option key={fac} value={fac}>{fac}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '11px' }}>
                      ✓ Allocated
                    </span>
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
