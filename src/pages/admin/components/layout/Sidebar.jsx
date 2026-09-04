import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Shield,
  Upload,
  Building2,
  GitFork,
  GraduationCap,
  Calendar,
  BookOpen,
  Layers,
  UserCheck,
  Award,
  BookMarked,
  CheckSquare,
  ShieldCheck,
  RotateCcw,
  FileText,
  History,
  Activity,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navGroups = [
    {
      title: null,
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'Users',
      items: [
        { label: 'All Users', path: '/admin/users', icon: Users, exact: true },
        { label: 'Add User', path: '/admin/users/new', icon: UserPlus },
        { label: 'Roles & Permissions', path: '/admin/roles', icon: Shield },
        { label: 'Import Users', path: '/admin/users/import', icon: Upload },
      ],
    },
    {
      title: 'Academic Structure',
      items: [
        { label: 'Schools', path: '/admin/academic/schools', icon: Building2 },
        { label: 'Departments', path: '/admin/academic/departments', icon: GitFork },
        { label: 'Programmes', path: '/admin/academic/programmes', icon: GraduationCap },
        { label: 'Batches', path: '/admin/academic/batches', icon: Calendar },
        { label: 'Courses', path: '/admin/academic/courses', icon: BookOpen },
        { label: 'Course Offerings', path: '/admin/academic/course-offerings', icon: Layers },
      ],
    },
    {
      title: 'Assignments',
      items: [
        { label: 'HOD Assignments', path: '/admin/assignments/hods', icon: UserCheck },
        { label: 'Programme Coordinators', path: '/admin/assignments/programme-coordinators', icon: Award },
        { label: 'Faculty Assignments', path: '/admin/assignments/faculty', icon: BookMarked },
      ],
    },
    {
      title: 'Workflow',
      items: [
        { label: 'Approvals', path: '/admin/workflow/approvals', icon: CheckSquare },
        { label: 'Verification', path: '/admin/workflow/verification', icon: ShieldCheck },
        { label: 'Revisions', path: '/admin/workflow/revisions', icon: RotateCcw },
      ],
    },
    {
      title: 'Reports & Logs',
      items: [
        { label: 'Reports', path: '/admin/reports', icon: FileText },
        { label: 'Audit Logs', path: '/admin/audit', icon: History },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Settings', path: '/admin/settings', icon: Settings },
        { label: 'System Health', path: '/admin/system/health', icon: Activity },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 40,
          }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        style={{
          width: '260px',
          height: '100vh',
          backgroundColor: 'var(--bg-sidebar)',
          color: '#cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transform: isMobileOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.2s ease',
          borderRight: '1px solid #1e293b',
        }}
        className="admin-sidebar"
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '20px 20px 16px 20px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '15px',
              letterSpacing: '-0.02em',
            }}
          >
            D
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.04em' }}>
              DYPIU NBA
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              IQAC Portal
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              {group.title && (
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#64748b',
                    padding: '0 8px 6px 8px',
                  }}
                >
                  {group.title}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                    }}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12.5px',
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                      transition: 'all 0.15s ease',
                      textDecoration: 'none',
                    })}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Profile & Logout */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid #1e293b',
            backgroundColor: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div
            onClick={() => navigate('/admin/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                flexShrink: 0,
              }}
            >
              <User size={16} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || user?.username || 'Administrator'}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
                {user?.role || 'IQAC'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
