import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

// ── SVG icon map ──────────────────────────────────────────────────────────────
function Icon({ name, active = false, size = 16 }) {
  const col = active ? '#f8fafc' : '#cbd5e1';
  const p = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: col, strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };
  if (name === 'dashboard')  return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
  if (name === 'users')      return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M19 8v5"/><path d="M21.5 10.5h-5"/></svg>;
  if (name === 'config')     return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>;
  if (name === 'academic')   return <svg {...p}><path d="M4 21V9l8-5 8 5v12"/><path d="M9 21v-6h6v6"/></svg>;
  if (name === 'outcomes')   return <svg {...p}><path d="M12 2 3 7l9 4 9-4-9-4Z"/><path d="M5 10v5c2 2 12 2 14 0v-5"/><path d="M12 11v8"/></svg>;
  if (name === 'mapping')    return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>;
  if (name === 'marks')      return <svg {...p}><path d="M9 11 11 13 15 9"/><path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v4h4"/></svg>;
  if (name === 'survey')     return <svg {...p}><path d="M7 3h7l3 3v15H7V3Z"/><path d="M14 3v4h4"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>;
  if (name === 'coa')        return <svg {...p}><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>;
  if (name === 'poa')        return <svg {...p}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
  if (name === 'reports')    return <svg {...p}><path d="M4 19.5V5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-1.5Z"/><path d="M13 3h5a2 2 0 0 1 2 2v14.5A2 2 0 0 0 18 18h-5V3Z"/></svg>;
  if (name === 'chevron')    return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>;
  if (name === 'profile')    return <svg {...p}><path d="M19 21a7 7 0 0 0-14 0"/><circle cx="12" cy="8" r="4"/></svg>;
  if (name === 'mail')       return <svg {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
  if (name === 'logout')     return <svg {...{ ...p, stroke: '#f87171' }}><path d="M10 17 15 12 10 7"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/></svg>;
  if (name === 'nav')        return <svg {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M5 10v5c2 2 12 2 14 0v-5"/><path d="M12 11v8"/></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="9"/></svg>;
}

// ── Full nav item list with 4 Roles: IQAC, DIRECTOR, PROGRAMME_COORDINATOR, FACULTY
// For Course Coordinator role: Exactly 5 items (Dashboard, Attainment Config, Attainment Overview, ATR Reports, Reports & Downloads)
const ALL_NAV = [
  { id: 'dashboard',           path: '/dashboard',           icon: 'dashboard', label: 'Dashboard',             sub: 'Start Attainment Process',     roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR','FACULTY'] },
  { id: 'users',               path: '/users',               icon: 'users',     label: 'User & Access',          sub: 'Accounts & Roles',             roles: ['IQAC','DIRECTOR'] },
  { id: 'configurations',      path: '/configurations',      icon: 'config',    label: 'Attainment Config',      sub: 'Weightages & Thresholds Settings', roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR','FACULTY'] },
  { id: 'academic',            path: '/academic',            icon: 'academic',  label: 'Academic Setup',         sub: 'Depts, Programmes, Courses',   roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR'] },
  { id: 'outcomes',            path: '/outcomes',            icon: 'outcomes',  label: 'Outcome Management',     sub: 'POs, PSOs, CO Approvals',      roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR'] },
  { id: 'co-mapping',          path: '/co-mapping',          icon: 'mapping',   label: 'CO Mapping Matrix',      sub: 'CO → PO/PSO Grids',            roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR'] },
  { id: 'marks-upload',        path: '/marks-upload',        icon: 'marks',     label: 'End Sem Marks',          sub: 'Upload & Marks Grid',          roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR'] },
  { id: 'survey-upload',       path: '/survey-upload',       icon: 'survey',    label: 'Course End Survey',      sub: 'Survey Feedback',              roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR'] },
  { id: 'co-attainment',       path: '/co-attainment',       icon: 'coa',       label: 'CO Attainment Engine',   sub: 'Direct, Indirect & Overall',   roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR'] },
  { id: 'attainment-overview', path: '/attainment-overview', icon: 'coa',       label: 'Attainment Overview',    sub: 'CO & PO/PSO Attainments',      roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR','FACULTY'] },
  { id: 'course-atr',          path: '/atr-reports',         icon: 'survey',    label: 'ATR Reports',            sub: 'Carry-Forward & Current ATR',  roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR','FACULTY'] },
  { id: 'coordinator-review',  path: '/coordinator-review',  icon: 'nav',       label: 'Course Submissions Review', sub: 'Inspect & Approve Courses', roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR'] },
  { id: 'po-pso-attainment',   path: '/po-pso-attainment',   icon: 'poa',       label: 'CO to PO & PSO Attainment', sub: 'Outcome Aggregations',         roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR'] },
  { id: 'programme-atr',       path: '/programme-atr',       icon: 'poa',       label: 'Programme ATR',          sub: 'Batch Continuous Improvement', roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR'] },
  { id: 'reports',             path: '/reports',             icon: 'reports',   label: 'Reports & Downloads',    sub: 'PDF & Excel Exports',          roles: ['IQAC','DIRECTOR','PROGRAMME_COORDINATOR','FACULTY'] },
];

export default function AppSidebar() {
  const { user, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [navOpen, setNavOpen] = useState(false);

  const visibleNav = ALL_NAV.filter(item => item.roles.includes(role));
  const activePage = visibleNav.find(item => item.path === location.pathname);

  const roleText = {
    IQAC: 'IQAC Admin',
    DIRECTOR: 'Director / HOD',
    PROGRAMME_COORDINATOR: 'Programme Coordinator',
    FACULTY: 'Course Coordinator',
  }[role] || role;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : 'DY';

  return (
    <aside
      className="nba-sidebar-nav"
      style={{
        width: 280, flexShrink: 0,
        height: '100vh', position: 'sticky', top: 0, zIndex: 40,
        background: '#111827',
        borderRight: '1px solid rgba(148,163,184,0.14)',
        display: 'flex', flexDirection: 'column', gap: 14,
        padding: '16px 14px 14px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Brand Header ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', flexShrink: 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
          boxShadow: '0 8px 22px rgba(37,99,235,0.35)',
          color: '#fff', fontWeight: 900, fontSize: 13,
          display: 'grid', placeItems: 'center', letterSpacing: '0.04em',
        }}>
          NBA
        </div>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <strong style={{ color: '#fff', fontSize: 13.5, fontWeight: 800, lineHeight: 1.2 }}>
            NBA Attainment System
          </strong>
          <span style={{ color: '#8292ad', fontSize: 10.5, lineHeight: 1.2 }}>
            D. Y. Patil International University
          </span>
        </div>
      </div>

      {/* ── Role Switcher ──────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(51, 65, 85, 0.45)',
        border: '1px solid rgba(148,163,184,0.16)',
        borderRadius: 14, padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 4,
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 9.5, color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Active User Role
        </div>
        <select
          value={role}
          onChange={(e) => switchRole(e.target.value)}
          style={{
            width: '100%',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '12px',
            fontWeight: '800',
            padding: '0 8px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="FACULTY" style={{ color: '#0f172a', background: '#ffffff' }}>Course Coordinator</option>
          <option value="PROGRAMME_COORDINATOR" style={{ color: '#0f172a', background: '#ffffff' }}>Programme Coordinator</option>
          <option value="DIRECTOR" style={{ color: '#0f172a', background: '#ffffff' }}>Director / HOD</option>
          <option value="IQAC" style={{ color: '#0f172a', background: '#ffffff' }}>IQAC Admin</option>
        </select>
      </div>

      {/* ── Collapsible Navigation Dropdown Menu ───────────────────── */}
      <nav style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          aria-expanded={navOpen}
          onClick={() => setNavOpen(prev => !prev)}
          style={{
            width: '100%', minHeight: 44,
            border: navOpen ? '1px solid rgba(165,180,252,0.45)' : '1px solid rgba(148,163,184,0.20)',
            borderRadius: 13,
            background: 'rgba(30,41,59,0.72)',
            color: '#f8fafc',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 12px',
            transition: 'border 0.15s ease, background 0.15s ease',
          }}
        >
          <span style={{
            width: 26, height: 26, borderRadius: 8,
            background: 'rgba(99,102,241,0.18)',
            border: '1px solid rgba(165,180,252,0.22)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {activePage
              ? <Icon name={activePage.icon} active size={14} />
              : <Icon name="nav" active size={14} />
            }
          </span>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 12.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activePage ? activePage.label : 'Select Navigation Page'}
          </span>
          <span style={{ display: 'inline-flex', transition: 'transform 0.2s', transform: navOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: '#64748b' }}>
            <Icon name="chevron" size={15} />
          </span>
        </button>

        {/* Dropdown Options List */}
        {navOpen && (
          <div
            role="listbox"
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              marginTop: 6, padding: 5,
              background: '#1f2937',
              border: '1px solid rgba(148,163,184,0.22)',
              borderRadius: 12,
              boxShadow: '0 18px 34px rgba(2,6,23,0.32)',
              display: 'grid', gap: 2,
              maxHeight: '340px',
              overflowY: 'auto',
              zIndex: 50,
            }}
          >
            {visibleNav.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    navigate(item.path);
                    setNavOpen(false);
                  }}
                  className="nba-nav-item"
                  style={{
                    position: 'relative',
                    minHeight: 42,
                    border: isActive ? '1px solid rgba(165,180,252,0.24)' : '1px solid transparent',
                    borderRadius: 10,
                    background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px',
                    textAlign: 'left',
                    boxShadow: isActive ? 'inset 3px 0 0 #818cf8' : 'none',
                    overflow: 'hidden',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <span style={{
                    position: 'relative',
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: isActive ? 'rgba(99,102,241,0.16)' : 'rgba(148,163,184,0.08)',
                    border: isActive ? '1px solid rgba(165,180,252,0.24)' : '1px solid rgba(148,163,184,0.08)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={item.icon} active={isActive} size={14} />
                  </span>
                  <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 12, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#f8fafc' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 9.5, marginTop: 2, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? '#c7d2fe' : '#64748b' }}>
                      {item.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* ── Spacer ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Profile card ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.055)',
        border: '1px solid rgba(148,163,184,0.16)',
        borderRadius: 16, padding: 10,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg,#475569,#47556999)',
          color: '#fff', fontWeight: 800, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#f9fafb', fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {(user?.name || 'Dr. Raj Shaikh').split(' ').slice(0, 3).join(' ')}
          </div>
          <div style={{ color: '#9ca3af', fontSize: 10.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {roleText}
          </div>
        </div>
        <span style={{
          width: 28, height: 28, borderRadius: 10,
          background: 'rgba(148,163,184,0.10)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="profile" size={14} />
        </span>
      </div>

      {/* ── Need Help card ─────────────────────────────────────────── */}
      <div style={{
        padding: '11px 12px',
        background: 'rgba(30,41,59,0.62)',
        border: '1px solid rgba(148,163,184,0.18)',
        borderRadius: 16,
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <span style={{
          width: 30, height: 30, borderRadius: 10,
          background: 'rgba(148,163,184,0.12)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="mail" size={15} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#f9fafb', fontWeight: 900, fontSize: 12, marginBottom: 3 }}>Need Help?</div>
          <a href="mailto:nba@dypiu.ac.in" style={{ color: '#c7d2fe', fontWeight: 800, fontSize: 10.5, wordBreak: 'break-all', textDecoration: 'none' }}>
            nba@dypiu.ac.in
          </a>
        </div>
      </div>

      {/* ── Logout Button ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={logout}
        style={{
          width: '100%', minHeight: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'rgba(127,29,29,0.02)',
          border: '1px solid rgba(248,113,113,0.42)',
          borderRadius: 14, padding: '10px 13px',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.15s ease', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(127,29,29,0.18)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(127,29,29,0.02)'; }}
      >
        <Icon name="logout" size={17} />
        <span style={{ color: '#f87171', fontWeight: 900, fontSize: 12 }}>Logout</span>
      </button>
    </aside>
  );
}
