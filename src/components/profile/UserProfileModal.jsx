import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, ChevronRight, Clock3, Eye, LockKeyhole, Mail, Monitor, Moon, ShieldCheck, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const tabs = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
];

const cardStyle = { background: '#f8fafc', border: '1px solid #e7edf5', borderRadius: 12, padding: '13px 14px' };

function Toggle({ checked, onChange }) {
  return <button type="button" onClick={onChange} aria-pressed={checked} style={{ width: 40, height: 22, padding: 2, border: 0, borderRadius: 99, cursor: 'pointer', background: checked ? '#4f46e5' : '#cbd5e1', transition: 'background .18s' }}>
    <span style={{ display: 'block', width: 18, height: 18, borderRadius: '50%', background: '#fff', transform: `translateX(${checked ? 18 : 0}px)`, transition: 'transform .18s', boxShadow: '0 1px 3px rgba(15,23,42,.2)' }} />
  </button>;
}

function Detail({ label, value }) {
  return <div style={cardStyle}><div style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>{label}</div><div style={{ marginTop: 5, color: '#172033', fontSize: 13, fontWeight: 750, overflowWrap: 'anywhere' }}>{value || 'Not available'}</div></div>;
}

export default function UserProfileModal({ open, onClose, user, roleLabel, courseCount = 0, batchName }) {
  const [tab, setTab] = useState('profile');
  const [preferences, setPreferences] = useState({ workflow: true, course: true, atr: true, approval: true, email: true, inApp: true, compact: false, reducedMotion: false });
  const userName = user?.name || user?.username || 'Academic User';
  const initials = userName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const department = user?.department?.name || user?.departmentName || 'Not assigned';
  const school = user?.school?.name || user?.schoolName || 'Not assigned';
  const about = `${roleLabel || 'Academic user'} in the Outcome-Based Education Attainment System, responsible for assigned academic workflow and attainment activities.`;
  const notificationItems = useMemo(() => [
    { title: 'Workflow updates', key: 'workflow', description: 'Submissions, revisions and workflow steps' },
    { title: 'Course updates', key: 'course', description: 'Course assignments, outcomes and mappings' },
    { title: 'ATR alerts', key: 'atr', description: 'Attainment gaps and corrective actions' },
    { title: 'Approval updates', key: 'approval', description: 'Approval decisions and requests' },
    { title: 'Email notifications', key: 'email', description: 'Send selected updates to your email' },
    { title: 'In-app notifications', key: 'inApp', description: 'Show updates in the application' },
  ], []);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div role="presentation" onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, padding: 20, display: 'grid', placeItems: 'center', background: 'rgba(15,23,42,.62)', backdropFilter: 'blur(7px)' }}>
      <section role="dialog" aria-modal="true" aria-label="Account profile" onMouseDown={(event) => event.stopPropagation()} style={{ width: 'min(100%, 1020px)', height: 'min(760px, calc(100vh - 40px))', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff', borderRadius: 20, boxShadow: '0 28px 90px rgba(2,6,23,.42)' }}>
        <header style={{ minHeight: 68, padding: '14px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #e7edf5' }}>
          <div><h2 style={{ margin: 2, color: '#172033', fontSize: 19 }}>Account</h2><p style={{ margin: '4px 0 13px', color: '#64748b', fontSize: 12.5 }}>Your account, security and application preferences</p></div>
          <button type="button" onClick={onClose} aria-label="Close account panel" style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', background: '#fff', cursor: 'pointer' }}><X size={18} /></button>
        </header>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px 22px' }}>
          <nav aria-label="Account sections" style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 14, borderBottom: '1px solid #e7edf5' }}>
            {tabs.map(({ id, label, icon: TabIcon }) => <button key={id} type="button" onClick={() => setTab(id)} style={{ flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 12px', border: 0, borderRadius: 8, background: tab === id ? '#eef2ff' : 'transparent', color: tab === id ? '#4f46e5' : '#64748b', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}><TabIcon size={15} />{label}</button>)}
          </nav>
          {tab === 'profile' && <div style={{ display: 'grid', gridTemplateColumns: '210px minmax(0, 1fr)', gap: 22, paddingTop: 20 }}>
            <aside style={{ textAlign: 'center', borderRight: '1px solid #e7edf5', padding: '10px 22px 10px 2px' }}>
              <div style={{ width: 84, height: 84, margin: '0 auto 12px', display: 'grid', placeItems: 'center', borderRadius: '50%', color: '#fff', fontSize: 29, fontWeight: 850, background: 'linear-gradient(135deg,#818cf8,#4338ca)', boxShadow: '0 8px 22px rgba(79,70,229,.24)' }}>{initials}</div>
              <div style={{ color: '#172033', fontSize: 16, fontWeight: 850 }}>{userName}</div><div style={{ marginTop: 4, color: '#64748b', fontSize: 12 }}>{roleLabel || 'Academic User'}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 13, padding: '5px 9px', borderRadius: 99, color: '#047857', background: '#ecfdf5', fontWeight: 800, fontSize: 11 }}><Check size={12} />Active</span>
            </aside>
            <div>
              <h3 style={{ margin: '0 0 11px', fontSize: 15, color: '#172033' }}>Personal information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}><Detail label="Full name" value={userName} /><Detail label="Role" value={roleLabel} /><Detail label="Email address" value={user?.email} /><Detail label="Department" value={department} /><Detail label="School" value={school} /><Detail label="Employee ID" value={user?.employeeId || user?.id} /></div>
              <h3 style={{ margin: '22px 0 9px', fontSize: 15, color: '#172033' }}>About</h3><p style={{ margin: 0, color: '#475569', lineHeight: 1.65, fontSize: 13 }}>{about}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 20 }}><Detail label="Courses assigned" value={String(courseCount)} /><Detail label="Current batch" value={batchName || 'Not selected'} /><Detail label="Account status" value="Active" /></div>
            </div>
          </div>}
          {tab === 'security' && <div style={{ paddingTop: 20, display: 'grid', gap: 12 }}>
            <div style={cardStyle}><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><LockKeyhole size={18} color="#4f46e5" /><div><strong style={{ color: '#172033', fontSize: 14 }}>Password & credentials</strong><p style={{ margin: '3px 0 0', color: '#64748b', fontSize: 12 }}>Password and recovery options are managed by your institution.</p></div></div></div>
            <div style={cardStyle}><strong style={{ color: '#172033', fontSize: 14 }}>Two-factor authentication</strong><p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 12 }}>Two-factor authentication controls will appear here when enabled by the backend.</p></div>
            <div style={cardStyle}><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Monitor size={18} color="#4f46e5" /><div><strong style={{ color: '#172033', fontSize: 14 }}>Current session</strong><p style={{ margin: '3px 0 0', color: '#64748b', fontSize: 12 }}>This browser is currently signed in.</p></div><span style={{ marginLeft: 'auto', color: '#047857', fontSize: 11, fontWeight: 800 }}>ACTIVE NOW</span></div></div>
          </div>}
          {tab === 'notifications' && <div style={{ paddingTop: 20 }}><h3 style={{ margin: '0 0 5px', color: '#172033', fontSize: 15 }}>Notification preferences</h3><p style={{ margin: '0 0 13px', color: '#64748b', fontSize: 12.5 }}>Choose which updates you want to see. These preferences are stored only in this browser for now.</p><div style={{ display: 'grid', gap: 8 }}>{notificationItems.map((item) => <div key={item.key} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}><Bell size={16} color="#6366f1" /><div style={{ flex: 1 }}><strong style={{ color: '#172033', fontSize: 13 }}>{item.title}</strong><div style={{ marginTop: 2, color: '#64748b', fontSize: 11.5 }}>{item.description}</div></div><Toggle checked={preferences[item.key]} onChange={() => setPreferences((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} /></div>)}</div></div>}
          {tab === 'settings' && <div style={{ paddingTop: 20, display: 'grid', gap: 12 }}>
            <div style={cardStyle}><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Moon size={17} color="#6366f1" /><div><strong style={{ color: '#172033', fontSize: 13 }}>Appearance</strong><div style={{ marginTop: 2, color: '#64748b', fontSize: 11.5 }}>The application currently follows its standard light interface.</div></div></div></div>
            {[['Compact interface', 'Use a denser layout where supported', 'compact'], ['Reduced motion', 'Limit non-essential transitions and animation', 'reducedMotion']].map(([title, description, key]) => <div key={key} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}><Eye size={16} color="#6366f1" /><div style={{ flex: 1 }}><strong style={{ color: '#172033', fontSize: 13 }}>{title}</strong><div style={{ marginTop: 2, color: '#64748b', fontSize: 11.5 }}>{description}</div></div><Toggle checked={preferences[key]} onChange={() => setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))} /></div>)}
            <div style={{ ...cardStyle, color: '#64748b', display: 'flex', alignItems: 'center', gap: 9, fontSize: 12 }}><Clock3 size={16} /><span>Additional saved settings will be available when a preferences API is added.</span><ChevronRight size={15} style={{ marginLeft: 'auto' }} /></div>
          </div>}
        </div>
      </section>
    </div>
  );
  return createPortal(content, document.body);
}
