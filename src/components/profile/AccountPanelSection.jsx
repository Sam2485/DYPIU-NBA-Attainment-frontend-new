import { memo, useEffect, useMemo, useState } from 'react';
import { Bell, Building2, Check, ChevronRight, Clock3, Eye, LockKeyhole, Monitor, Moon, ShieldCheck, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const tabs = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
];

const cardStyle = { background: '#f8fafc', border: '1px solid #e7edf5', borderRadius: 12, padding: '13px 14px' };

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      style={{
        width: 40,
        height: 22,
        padding: 2,
        border: 0,
        borderRadius: 99,
        cursor: 'pointer',
        background: checked ? '#4f46e5' : '#cbd5e1',
        transition: 'background .18s',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transform: `translateX(${checked ? 18 : 0}px)`,
          transition: 'transform .18s',
          boxShadow: '0 1px 3px rgba(15,23,42,.2)',
        }}
      />
    </button>
  );
}

function Detail({ label, value }) {
  return (
    <div style={cardStyle}>
      <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 5, color: '#172033', fontSize: 13, fontWeight: 750, overflowWrap: 'anywhere' }}>
        {value || 'Not available'}
      </div>
    </div>
  );
}

function AccountPanelSection({
  accountPanelRef,
  tab,
  setTab,
  preferences,
  setPreferences,
  onTogglePreference,
  onClose,
  user,
  roleLabel,
  courseCount = 0,
  batchName,
  enableProfileSwitching = false,
  className = '',
  style = {},
}) {
  const { role, availableProfiles = [], isLoadingProfiles, loadAvailableProfiles, switchProfile } = useAuth();
  const [profileSwitchError, setProfileSwitchError] = useState('');
  const [switchingProfileKey, setSwitchingProfileKey] = useState(null);
  const [switchingSchoolId, setSwitchingSchoolId] = useState(null);
  const toggle = onTogglePreference || ((key) => setPreferences?.((prev) => ({ ...prev, [key]: !prev[key] })));
  const userName = user?.name || user?.username || 'Academic User';
  const initials = userName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const department = user?.department?.name || user?.departmentName || 'Not assigned';
  const school = user?.school?.name || user?.schoolName || 'Not assigned';
  const about = `${roleLabel || 'Academic user'} in the Outcome-Based Education Attainment System, responsible for assigned academic workflow and attainment activities.`;
  const profileRoleName = (profileRole) => String(profileRole || 'Profile')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  useEffect(() => {
    if (enableProfileSwitching) void loadAvailableProfiles();
  }, [enableProfileSwitching, loadAvailableProfiles]);

  const schoolList = useMemo(() => {
    const map = new Map();
    if (Array.isArray(user?.schools)) {
      user.schools.forEach((s) => {
        if (s?.id) {
          const id = String(s.id);
          map.set(id, {
            id,
            name: s.name || s.schoolName || s.code || `School ${id}`,
            code: s.code || '',
          });
        }
      });
    }
    if (Array.isArray(user?.assignments)) {
      user.assignments.forEach((a) => {
        if (a?.schoolId) {
          const id = String(a.schoolId);
          if (!map.has(id)) {
            map.set(id, {
              id,
              name: a.schoolName || `School ${id}`,
              code: '',
            });
          }
        }
      });
    }
    if (Array.isArray(availableProfiles)) {
      availableProfiles.forEach((p) => {
        if (p?.schoolId) {
          const id = String(p.schoolId);
          if (!map.has(id)) {
            map.set(id, {
              id,
              name: p.schoolName || id,
              code: '',
            });
          } else if (p.schoolName && map.get(id).name.startsWith('School ')) {
            map.get(id).name = p.schoolName;
          }
        }
      });
    }
    if (user?.schoolId && !map.has(String(user.schoolId))) {
      const id = String(user.schoolId);
      map.set(id, {
        id,
        name: user.schoolName || (typeof user.school === 'object' ? user.school?.name : null) || `School ${id}`,
        code: (typeof user.school === 'object' ? user.school?.code : '') || '',
      });
    }
    return Array.from(map.values());
  }, [user?.schools, user?.assignments, user?.schoolId, user?.schoolName, user?.school, availableProfiles]);

  const rolesForCurrentSchool = useMemo(() => {
    if (!Array.isArray(availableProfiles) || availableProfiles.length === 0) return [];
    const currentSchoolId = user?.schoolId ? String(user.schoolId) : null;

    const filtered = availableProfiles.filter((p) => {
      if (p.role === 'IQAC') return true;
      if (currentSchoolId && p.schoolId) {
        return String(p.schoolId) === currentSchoolId;
      }
      if (!p.schoolId) return true;
      if (!currentSchoolId) return true;
      return false;
    });

    return filtered.length > 0 ? filtered : availableProfiles;
  }, [availableProfiles, user?.schoolId]);

  const isProfileCurrent = (profile) => {
    if (Boolean(profile.isCurrent)) return true;
    const roleMatches = profile.role === role;
    if (!roleMatches) return false;
    if (profile.schoolId) {
      return String(profile.schoolId) === String(user?.schoolId);
    }
    if (profile.departmentId && user?.departmentId) {
      return String(profile.departmentId) === String(user.departmentId);
    }
    return true;
  };

  const executeSwitch = async (profile, profileKey) => {
    setProfileSwitchError('');
    setSwitchingProfileKey(profileKey);
    const result = await switchProfile(profile);
    if (!result.success) {
      setProfileSwitchError(result.error || 'Unable to switch profile.');
      setSwitchingProfileKey(null);
      setSwitchingSchoolId(null);
      return;
    }

    const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    window.location.assign(`${basePath}${result.targetPath}`);
  };

  const handleSwitchProfile = async (profile, profileKey) => {
    if (isProfileCurrent(profile)) return;
    await executeSwitch(profile, profileKey);
  };

  const handleSwitchSchool = async (targetSchoolId) => {
    const currentSchoolId = user?.schoolId ? String(user.schoolId) : null;
    if (currentSchoolId && String(targetSchoolId) === currentSchoolId) return;

    setProfileSwitchError('');
    setSwitchingSchoolId(targetSchoolId);

    let targetProfile = availableProfiles.find(
      (p) => String(p.schoolId) === String(targetSchoolId) && p.role === role
    );

    if (!targetProfile) {
      targetProfile = availableProfiles.find(
        (p) => String(p.schoolId) === String(targetSchoolId)
      );
    }

    if (!targetProfile) {
      targetProfile = {
        role: role || 'DIRECTOR',
        schoolId: targetSchoolId,
      };
    }

    const profileKey = `school-${targetSchoolId}-${targetProfile.role}`;
    await executeSwitch(targetProfile, profileKey);
  };

  const notificationItems = useMemo(
    () => [
      { title: 'Workflow updates', key: 'workflow', description: 'Submissions, revisions and workflow steps' },
      { title: 'Course updates', key: 'course', description: 'Course assignments, outcomes and mappings' },
      { title: 'ATR alerts', key: 'atr', description: 'Attainment gaps and corrective actions' },
      { title: 'Approval updates', key: 'approval', description: 'Approval decisions and requests' },
      { title: 'Email notifications', key: 'email', description: 'Send selected updates to your email' },
      { title: 'In-app notifications', key: 'inApp', description: 'Show updates in the application' },
    ],
    []
  );

  return (
    <section
      className={className}
      ref={accountPanelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Account profile"
      onMouseDown={(event) => event.stopPropagation()}
      style={{
        width: 'min(85%, 867px)',
        height: 'min(646px, calc(100vh - 40px))',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 28px 90px rgba(2,6,23,.42)',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <header
        style={{
          minHeight: 68,
          padding: '14px 20px 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e7edf5',
        }}
      >
        <div>
          <h2 style={{ margin: 2, color: '#172033', fontSize: 19 }}>Account</h2>
          <p style={{ margin: '4px 0 13px', color: '#64748b', fontSize: 12.5 }}>
            Your account, security and application preferences
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close account panel"
          style={{
            width: 34,
            height: 34,
            display: 'grid',
            placeItems: 'center',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            color: '#64748b',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px 22px' }}>
        <nav
          aria-label="Account sections"
          style={{
            display: 'flex',
            gap: 5,
            overflowX: 'auto',
            paddingBottom: 14,
            borderBottom: '1px solid #e7edf5',
          }}
        >
          {tabs.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab?.(id)}
              style={{
                flex: '0 0 auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                height: 36,
                padding: '0 12px',
                border: 0,
                borderRadius: 8,
                background: tab === id ? '#eef2ff' : 'transparent',
                color: tab === id ? '#4f46e5' : '#64748b',
                fontWeight: 800,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              <TabIcon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* TAB 1: Profile */}
        {tab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '228px minmax(0, 1fr)', gap: 22, paddingTop: 20 }}>
            <aside style={{ textAlign: 'center', borderRight: '1px solid #e7edf5', padding: '10px 18px 10px 2px' }}>
              <div
                style={{
                  width: 84,
                  height: 84,
                  margin: '0 auto 12px',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  color: '#fff',
                  fontSize: 29,
                  fontWeight: 850,
                  background: 'linear-gradient(135deg,#818cf8,#4338ca)',
                  boxShadow: '0 8px 22px rgba(79,70,229,.24)',
                }}
              >
                {initials}
              </div>
              <div style={{ color: '#172033', fontSize: 16, fontWeight: 850 }}>{userName}</div>
              <div style={{ marginTop: 4, color: '#64748b', fontSize: 12 }}>{roleLabel || 'Academic User'}</div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 13,
                  padding: '5px 9px',
                  borderRadius: 99,
                  color: '#047857',
                  background: '#ecfdf5',
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                <Check size={12} />
                Active
              </span>

              {enableProfileSwitching && (schoolList.length > 1 || rolesForCurrentSchool.length > 1) && (
                <div style={{ marginTop: 18, paddingTop: 15, borderTop: '1px solid #e7edf5', textAlign: 'left' }}>
                  {/* TIER 1: SCHOOL SWITCHER (if >1 school assigned) */}
                  {schoolList.length > 1 && (
                    <div style={{ marginBottom: rolesForCurrentSchool.length > 1 ? 16 : 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#475569',
                          fontSize: 10,
                          fontWeight: 850,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}
                      >
                        <Building2 size={13} style={{ color: '#4f46e5' }} />
                        <span>Switch School</span>
                      </div>
                      <div style={{ display: 'grid', gap: 6, maxHeight: 150, overflowY: 'auto', paddingRight: 2 }}>
                        {schoolList.map((s) => {
                          const isCurrent = user?.schoolId && String(s.id) === String(user.schoolId);
                          const isSwitching = switchingSchoolId === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSwitchSchool(s.id)}
                              disabled={isCurrent || isLoadingProfiles || Boolean(switchingProfileKey)}
                              title={s.name}
                              style={{
                                width: '100%',
                                minHeight: 32,
                                padding: '6px 8px',
                                borderRadius: 8,
                                border: isCurrent ? '1.5px solid #818cf8' : '1px solid #e2e8f0',
                                background: isCurrent ? '#eef2ff' : '#fff',
                                color: isCurrent ? '#3730a3' : '#334155',
                                textAlign: 'left',
                                cursor: isCurrent || isLoadingProfiles || Boolean(switchingProfileKey) ? 'default' : 'pointer',
                                fontSize: 11,
                                fontWeight: isCurrent ? 800 : 600,
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 6,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                {isSwitching ? 'Switching…' : s.name}
                              </span>
                              {isCurrent && <Check size={12} style={{ color: '#4f46e5', flexShrink: 0 }} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TIER 2: ROLE SWITCHER (filtered to current school, if >1 role available) */}
                  {rolesForCurrentSchool.length > 1 && (
                    <div style={{ marginTop: schoolList.length > 1 ? 14 : 0, paddingTop: schoolList.length > 1 ? 14 : 0, borderTop: schoolList.length > 1 ? '1px dashed #e2e8f0' : 'none' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#475569',
                          fontSize: 10,
                          fontWeight: 850,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}
                      >
                        <ShieldCheck size={13} style={{ color: '#4f46e5' }} />
                        <span>Switch Role</span>
                      </div>
                      <div style={{ display: 'grid', gap: 6, maxHeight: 150, overflowY: 'auto', paddingRight: 2 }}>
                        {rolesForCurrentSchool.map((profile, index) => {
                          const profileKey = `${profile.role}-${profile.schoolId ?? ''}-${profile.departmentId ?? profile.programmeBatchId ?? index}`;
                          const isCurrent = isProfileCurrent(profile);
                          const isSwitching = switchingProfileKey === profileKey;
                          return (
                            <button
                              key={profileKey}
                              type="button"
                              onClick={() => handleSwitchProfile(profile, profileKey)}
                              disabled={isCurrent || isLoadingProfiles || Boolean(switchingProfileKey)}
                              title={profile.displayName || profileRoleName(profile.role)}
                              style={{
                                width: '100%',
                                minHeight: 32,
                                padding: '6px 8px',
                                borderRadius: 8,
                                border: isCurrent ? '1.5px solid #818cf8' : '1px solid #e2e8f0',
                                background: isCurrent ? '#eef2ff' : '#fff',
                                color: isCurrent ? '#3730a3' : '#334155',
                                textAlign: 'left',
                                cursor: isCurrent || isLoadingProfiles || Boolean(switchingProfileKey) ? 'default' : 'pointer',
                                fontSize: 11,
                                fontWeight: isCurrent ? 800 : 600,
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 6,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                <div>{isSwitching ? 'Switching…' : profileRoleName(profile.role)}</div>
                                {profile.departmentName && (
                                  <div style={{ fontSize: 9.5, color: '#64748b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {profile.departmentName}
                                  </div>
                                )}
                              </div>
                              {isCurrent && <Check size={12} style={{ color: '#4f46e5', flexShrink: 0 }} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {profileSwitchError && <div style={{ marginTop: 8, color: '#b91c1c', fontSize: 10.5, fontWeight: 700 }}>{profileSwitchError}</div>}
                </div>
              )}
            </aside>
            <div>
              <h3 style={{ margin: '0 0 11px', fontSize: 15, color: '#172033' }}>Personal information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <Detail label="Full name" value={userName} />
                <Detail label="Role" value={roleLabel} />
                <Detail label="Email address" value={user?.email} />
                <Detail label="Department" value={department} />
                <Detail label="School" value={school} />
                <Detail label="Employee ID" value={user?.employeeId || user?.id} />
              </div>
              <h3 style={{ margin: '22px 0 9px', fontSize: 15, color: '#172033' }}>About</h3>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.65, fontSize: 13 }}>{about}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 20 }}>
                <Detail label="Courses assigned" value={String(courseCount)} />
                <Detail label="Current batch" value={batchName || 'Not selected'} />
                <Detail label="Account status" value="Active" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Security */}
        {tab === 'security' && (
          <div style={{ paddingTop: 20, display: 'grid', gap: 12 }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <LockKeyhole size={18} color="#4f46e5" />
                <div>
                  <strong style={{ color: '#172033', fontSize: 14 }}>Password & credentials</strong>
                  <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: 12 }}>
                    Password and recovery options are managed by your institution.
                  </p>
                </div>
              </div>
            </div>
            <div style={cardStyle}>
              <strong style={{ color: '#172033', fontSize: 14 }}>Two-factor authentication</strong>
              <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 12 }}>
                Two-factor authentication controls will appear here when enabled by the backend.
              </p>
            </div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Monitor size={18} color="#4f46e5" />
                <div>
                  <strong style={{ color: '#172033', fontSize: 14 }}>Current session</strong>
                  <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: 12 }}>
                    This browser is currently signed in.
                  </p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#047857', fontSize: 11, fontWeight: 800 }}>ACTIVE NOW</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Notifications */}
        {tab === 'notifications' && (
          <div style={{ paddingTop: 20 }}>
            <h3 style={{ margin: '0 0 5px', color: '#172033', fontSize: 15 }}>Notification preferences</h3>
            <p style={{ margin: '0 0 13px', color: '#64748b', fontSize: 12.5 }}>
              Choose which updates you want to see. These preferences are stored only in this browser for now.
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {notificationItems.map((item) => (
                <div key={item.key} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Bell size={16} color="#6366f1" />
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#172033', fontSize: 13 }}>{item.title}</strong>
                    <div style={{ marginTop: 2, color: '#64748b', fontSize: 11.5 }}>{item.description}</div>
                  </div>
                  <Toggle
                    checked={preferences[item.key]}
                    onChange={() => toggle(item.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Settings */}
        {tab === 'settings' && (
          <div style={{ paddingTop: 20, display: 'grid', gap: 12 }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Moon size={17} color="#6366f1" />
                <div>
                  <strong style={{ color: '#172033', fontSize: 13 }}>Appearance</strong>
                  <div style={{ marginTop: 2, color: '#64748b', fontSize: 11.5 }}>
                    The application currently follows its standard light interface.
                  </div>
                </div>
              </div>
            </div>
            {[
              ['Compact interface', 'Use a denser layout where supported', 'compact'],
              ['Reduced motion', 'Limit non-essential transitions and animation', 'reducedMotion'],
            ].map(([title, description, key]) => (
              <div key={key} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Eye size={16} color="#6366f1" />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#172033', fontSize: 13 }}>{title}</strong>
                  <div style={{ marginTop: 2, color: '#64748b', fontSize: 11.5 }}>{description}</div>
                </div>
                <Toggle
                  checked={preferences[key]}
                  onChange={() => toggle(key)}
                />
              </div>
            ))}
            <div
              style={{
                ...cardStyle,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 12,
              }}
            >
              <Clock3 size={16} />
              <span>Additional saved settings will be available when a preferences API is added.</span>
              <ChevronRight size={15} style={{ marginLeft: 'auto' }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(AccountPanelSection);
