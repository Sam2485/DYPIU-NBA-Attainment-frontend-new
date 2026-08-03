import { useState } from 'react';
import AuditTable from '../../components/tables/AuditTable';
import { Shield, Plus } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Dr. Raj Shaikh',
      email: 'raj.shaikh@dypiu.ac.in',
      role: 'SUPER_ADMIN',
      department: 'School of Computer Science',
      programme: 'B.Tech CSE',
      status: 'ACTIVE',
    },
    {
      id: '2',
      name: 'Prof. Ananya Roy',
      email: 'ananya.roy@dypiu.ac.in',
      role: 'HOD',
      department: 'School of Computer Science',
      programme: 'B.Tech CSE',
      status: 'ACTIVE',
    },
    {
      id: '3',
      name: 'Dr. Sameer Khan',
      email: 'sameer.khan@dypiu.ac.in',
      role: 'FACULTY',
      department: 'School of Computer Science',
      programme: 'B.Tech CSE',
      status: 'ACTIVE',
    },
  ]);

  const handleAddUser = () => {
    setUsers([
      ...users,
      {
        id: String(Date.now()),
        name: 'New Faculty Member',
        email: 'faculty@dypiu.ac.in',
        role: 'FACULTY',
        department: 'School of Computer Science',
        programme: 'B.Tech CSE',
        status: 'ACTIVE',
      },
    ]);
  };

  const handleChangeCell = (index, field, value) => {
    const updated = [...users];
    updated[index][field] = value;
    setUsers(updated);
  };

  const handleDeleteUser = (index) => {
    setUsers(users.filter((_, i) => i !== index));
  };

  return (
    <div className="animated-page">
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#fff',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Shield size={24} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
              User & Access Management (Module 2)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#bfdbfe' }}>
              Role-Based Access Control (`SUPER_ADMIN`, `HOD`, `FACULTY`).
            </p>
          </div>
        </div>
      </div>

      <AuditTable
        title="System Users & Role Assignments"
        subtitle="Manage user roles, emails, and department/programme assignments."
        columns={[
          { key: 'name', label: 'Full Name', width: '220px' },
          { key: 'email', label: 'Email Address', width: '240px' },
          {
            key: 'role',
            label: 'System Role',
            width: '180px',
            type: 'select',
            options: [
              { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN' },
              { value: 'HOD', label: 'HOD' },
              { value: 'FACULTY', label: 'FACULTY' },
            ],
            render: (val) => (
              <span
                className={`badge ${
                  val === 'SUPER_ADMIN'
                    ? 'badge-level-3'
                    : val === 'HOD'
                    ? 'badge-level-2'
                    : 'badge-active'
                }`}
              >
                {val}
              </span>
            ),
          },
          { key: 'department', label: 'Department' },
          { key: 'programme', label: 'Programme', width: '150px' },
        ]}
        data={users}
        onAddRow={handleAddUser}
        onDeleteRow={handleDeleteUser}
        onChangeCell={handleChangeCell}
      />
    </div>
  );
}
