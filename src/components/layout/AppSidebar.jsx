import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Target,
  Grid2X2,
  FileCheck,
  ClipboardList,
  Sliders,
  Calculator,
  BarChart3,
  FileSpreadsheet,
  LogOut
} from 'lucide-react';

export default function AppSidebar() {
  const { user, role, logout } = useAuth();
  const { academicYear, setAcademicYear, availableYears } = useAcademic();

  const roleText =
    role === 'SUPER_ADMIN'
      ? 'Super Administrator'
      : role === 'HOD'
      ? 'Head of Department'
      : 'Faculty / Course Instructor';

  // Navigation Items in Rearranged Order
  const navItems = [
    {
      id: 'dashboard',
      path: '/dashboard',
      label: 'Dashboard',
      subtitle: 'Overview & KPIs',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'HOD', 'FACULTY'],
    },
    {
      id: 'users',
      path: '/users',
      label: 'User & Access',
      subtitle: 'Accounts & Roles',
      icon: Users,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'configurations',
      path: '/configurations',
      label: 'Attainment Config',
      subtitle: 'Weightages, Thresholds, Levels',
      icon: Sliders,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'academic',
      path: '/academic',
      label: 'Academic Management',
      subtitle: 'Depts, Programmes, Courses',
      icon: Building2,
      roles: ['SUPER_ADMIN', 'HOD'],
    },
    {
      id: 'outcomes',
      path: '/outcomes',
      label: 'Outcome Management',
      subtitle: 'POs, PSOs, COs & Competencies',
      icon: Target,
      roles: ['SUPER_ADMIN', 'HOD', 'FACULTY'],
    },
    {
      id: 'co-mapping',
      path: '/co-mapping',
      label: 'CO Mapping Matrix',
      subtitle: 'CO to PO/PSO Grids',
      icon: Grid2X2,
      roles: ['SUPER_ADMIN', 'HOD', 'FACULTY'],
    },
    {
      id: 'marks-upload',
      path: '/marks-upload',
      label: 'End Sem Marks',
      subtitle: 'Excel Upload & Marks Grid',
      icon: FileCheck,
      roles: ['SUPER_ADMIN', 'HOD', 'FACULTY'],
    },
    {
      id: 'survey-upload',
      path: '/survey-upload',
      label: 'Course End Survey',
      subtitle: 'Survey Upload & Feedback',
      icon: ClipboardList,
      roles: ['SUPER_ADMIN', 'HOD', 'FACULTY'],
    },
    {
      id: 'co-attainment',
      path: '/co-attainment',
      label: 'CO Attainment Engine',
      subtitle: 'Direct, Indirect & Overall',
      icon: Calculator,
      roles: ['SUPER_ADMIN', 'HOD', 'FACULTY'],
    },
    {
      id: 'po-pso-attainment',
      path: '/po-pso-attainment',
      label: 'PO & PSO Attainment',
      subtitle: 'Outcome Aggregations',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'HOD', 'FACULTY'],
    },
    {
      id: 'reports',
      path: '/reports',
      label: 'Reports & Downloads',
      subtitle: 'PDF & Excel Reports',
      icon: FileSpreadsheet,
      roles: ['SUPER_ADMIN', 'HOD', 'FACULTY'],
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="app-sidebar__brand">
        <div className="app-sidebar__mark">NBA</div>
        <div className="app-sidebar__brand-copy">
          <strong>DYPIU Attainment</strong>
          <span>Outcome-Based Education</span>
        </div>
      </div>

      {/* Workspace Context & Academic Year Dropdown with White Text and No White Background */}
      <div className="app-sidebar__context">
        <div>
          <span className="app-sidebar__eyebrow">Current Role</span>
          <strong style={{ color: '#ffffff' }}>{roleText}</strong>
          <small>{user?.department || 'University Wide'}</small>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <span className="app-sidebar__eyebrow" style={{ fontSize: '9px', color: '#bfdbfe' }}>AY Year</span>
          <select
            className="app-sidebar__year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr} style={{ color: '#0f172a', background: '#ffffff' }}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sidebar Navigation Items */}
      <nav className="app-sidebar__nav-list">
        {visibleNav.map((item) => {
          const IconComp = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `app-sidebar__nav-item ${isActive ? 'is-active' : ''}`
              }
            >
              <div className="app-sidebar__nav-icon">
                <IconComp size={16} />
              </div>
              <div className="app-sidebar__nav-text">
                <strong>{item.label}</strong>
                <small>{item.subtitle}</small>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Profile & Logout Footer */}
      <div className="app-sidebar__profile">
        <div className="app-sidebar__avatar">
          {user?.name
            ? user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
            : 'DY'}
        </div>
        <div className="app-sidebar__profile-copy">
          <strong>{user?.name || 'Dr. Raj Shaikh'}</strong>
          <span>{user?.email || 'admin@dypiu.ac.in'}</span>
        </div>
        <button className="btn btn-danger" onClick={logout} title="Logout" style={{ padding: '6px' }}>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
