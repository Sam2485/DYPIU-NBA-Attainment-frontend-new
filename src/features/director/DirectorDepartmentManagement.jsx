import { useState } from 'react';
import { Building2, Plus, Edit2, UserCheck, ShieldCheck, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';

export default function DirectorDepartmentManagement() {
  const {
    departments = [],
    addDepartment = () => {},
    updateDepartment = () => {},
  } = useAcademic();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // Form State
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [selectedHod, setSelectedHod] = useState(MASTER_FACULTY_LIST[0] || 'Dr. Raj Shaikh');
  const [hodEmail, setHodEmail] = useState('');

  const handleOpenAdd = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setSelectedHod(MASTER_FACULTY_LIST[0] || 'Dr. Raj Shaikh');
    setHodEmail('raj.shaikh@dypiu.ac.in');
    setShowAddModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setSelectedHod(dept.hod || MASTER_FACULTY_LIST[0]);
    setHodEmail(dept.hodEmail || '');
    setShowAddModal(true);
  };

  const handleSaveDepartment = (e) => {
    e.preventDefault();
    if (!deptName || !deptCode) {
      alert('Please fill out Department Name and Department Code.');
      return;
    }

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: deptName,
        code: deptCode,
        hod: selectedHod,
        hodEmail: hodEmail || `${selectedHod.toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in`,
      });
      alert(`✓ Department ${deptCode} updated successfully!`);
    } else {
      addDepartment({
        name: deptName,
        code: deptCode,
        hod: selectedHod,
        hodEmail: hodEmail || `${selectedHod.toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in`,
      });
      alert(`🎉 New Department ${deptCode} created and HOD ${selectedHod} assigned!`);
    }

    setShowAddModal(false);
  };

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fef08a', fontWeight: '800', fontSize: '11px' }}>
                DIRECTOR PORTAL • DEPARTMENT MANAGEMENT
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              Department Setup & HOD Allocation
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Create academic departments, update structural information, and assign Heads of Departments (HODs).
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{
              height: '42px',
              padding: '0 20px',
              fontSize: '13px',
              fontWeight: '800',
              gap: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
          >
            <Plus size={16} /> Add New Department
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER BAR ────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by dept name, code, or HOD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '12.5px' }}
            />
          </div>

          <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>
            Showing <strong>{filteredDepts.length}</strong> of <strong>{departments.length}</strong> departments
          </div>
        </div>
      </div>

      {/* ── DEPARTMENTS TABLE ───────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="audit-data-table">
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>Code</th>
              <th>Department Name</th>
              <th style={{ width: '220px' }}>Assigned Head of Department (HOD)</th>
              <th style={{ width: '180px' }}>HOD Email Contact</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
              <th style={{ width: '160px', textAlign: 'center' }}>Director Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  No departments found matching your search query.
                </td>
              </tr>
            ) : (
              filteredDepts.map((dept) => {
                const isAssigned = dept.hod && dept.hod !== 'Unassigned';
                return (
                  <tr key={dept.id}>
                    <td style={{ textAlign: 'center', fontWeight: '900', color: '#4f46e5' }}>
                      {dept.code}
                    </td>
                    <td style={{ fontWeight: '700', color: '#0f172a', fontSize: '13.5px' }}>
                      {dept.name}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '11px' }}>
                          {dept.hod.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <strong style={{ fontSize: '12.5px', color: isAssigned ? '#0f172a' : '#dc2626' }}>
                          {dept.hod}
                        </strong>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      {dept.hodEmail || `${dept.hod.toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in`}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isAssigned ? (
                        <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '11px' }}>
                          ✓ HOD Assigned
                        </span>
                      ) : (
                        <span className="badge badge-pending" style={{ background: '#fee2e2', color: '#dc2626', fontWeight: '800', fontSize: '11px' }}>
                          ⚠️ HOD Pending
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenEdit(dept)}
                        style={{ padding: '5px 12px', fontSize: '11.5px', gap: '6px', fontWeight: '700' }}
                      >
                        <UserCheck size={13} /> Edit / Assign HOD
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── ADD / EDIT DEPARTMENT MODAL ────────────────────────────────────────────── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '520px',
              maxWidth: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{ background: '#1e293b', padding: '18px 24px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                {editingDept ? `Edit Department & HOD (${editingDept.code})` : 'Add New Department'}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '18px', fontWeight: '800' }}>
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDepartment} style={{ padding: '24px', display: 'grid', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Department of Computer Science & Engineering"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="form-input"
                  style={{ height: '40px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  Department Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE or ENTC"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="form-input"
                  style={{ height: '40px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  Assign Head of Department (HOD) *
                </label>
                <select
                  value={selectedHod}
                  onChange={(e) => {
                    setSelectedHod(e.target.value);
                    setHodEmail(`${e.target.value.toLowerCase().replace(/[^a-z]/g, '')}@dypiu.ac.in`);
                  }}
                  className="form-input"
                  style={{ height: '40px', fontSize: '13px', fontWeight: '700', color: '#4f46e5' }}
                >
                  {MASTER_FACULTY_LIST.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac} (Senior Faculty Roster)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  HOD Email Contact
                </label>
                <input
                  type="email"
                  placeholder="hod.email@dypiu.ac.in"
                  value={hodEmail}
                  onChange={(e) => setHodEmail(e.target.value)}
                  className="form-input"
                  style={{ height: '40px', fontSize: '13px' }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5' }}>
                  Save & Assign HOD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
