import { useState, useEffect } from 'react';
import AuditTable from '../../components/tables/AuditTable';
import { Shield, Plus } from 'lucide-react';
import { getUsers, extractUserList } from '../../api/academic';

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getUsers()
      .then((res) => {
        const list = extractUserList(res);
        if (isMounted && Array.isArray(list) && list.length > 0) {
          setUsers(list);
        }
      })
      .catch((err) => console.warn('Could not fetch users in UserManagement:', err));

    return () => {
      isMounted = false;
    };
  }, []);

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
      <div className="banner-dark-gradient">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#f5f3ff',
              border: '1.5px solid #6366f1',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Shield size={24} style={{ color: '#4f46e5' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              User & Access Management
            </h2>
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
