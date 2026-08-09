import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, GraduationCap, CheckCircle2, Clock, ArrowRight, ShieldCheck, Layers, FileText, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    departments = [],
    selectedSchool = { name: 'School of Engineering & Technology', code: 'SET', dean: 'Dr. R. K. Deshmukh' },
    masterProgrammes = [],
    directorApprovals = [],
  } = useAcademic();

  const totalDepts = departments.length || 4;
  const assignedHODs = departments.filter((d) => d.hod && d.hod !== 'Unassigned').length || 3;
  const pendingHODs = totalDepts - assignedHODs;
  const totalProgrammes = masterProgrammes.length || 8;
  const pendingApprovalsCount = directorApprovals.filter((a) => a.status === 'PENDING').length || 2;

  // Setup Progress Steps
  const setupSteps = [
    { title: 'School Information Configured', done: true, desc: 'School metadata & Dean allocation verified' },
    { title: 'Department Hierarchy Created', done: totalDepts > 0, desc: `${totalDepts} academic departments established` },
    { title: 'HODs Assigned to Departments', done: pendingHODs === 0, desc: `${assignedHODs} of ${totalDepts} HODs assigned` },
    { title: 'Programmes Allocated under Depts', done: totalProgrammes > 0, desc: `${totalProgrammes} degree programmes mapped` },
    { title: 'Final Approvals & Visibility', done: pendingApprovalsCount === 0, desc: `${pendingApprovalsCount} approvals pending review` },
  ];

  const completedStepsCount = setupSteps.filter((s) => s.done).length;
  const progressPct = Math.round((completedStepsCount / setupSteps.length) * 100);

  // Quick Action Navigation Items for Director
  const quickActions = [
    {
      id: 'structure',
      title: 'School Structure & Hierarchy',
      desc: 'Inspect school metadata, departments, and degree programmes tree.',
      path: '/director/school-structure',
      icon: Layers,
      color: '#4f46e5',
      bg: '#e0e7ff',
    },
    {
      id: 'departments',
      title: 'Department Management & HOD Allocation',
      desc: 'Add academic departments and assign Heads of Departments (HODs).',
      path: '/director/department-management',
      icon: Users,
      color: '#059669',
      bg: '#dcfce7',
      badge: pendingHODs > 0 ? `⚠️ ${pendingHODs} HOD Pending` : '✓ Complete',
      badgeColor: pendingHODs > 0 ? '#d97706' : '#15803d',
      badgeBg: pendingHODs > 0 ? '#fef3c7' : '#dcfce7',
    },
    {
      id: 'programmes',
      title: 'Programme Overview & Read-Only Status',
      desc: 'View all degree programmes, assigned coordinators, and setup progress.',
      path: '/director/programme-overview',
      icon: GraduationCap,
      color: '#0284c7',
      bg: '#e0f2fe',
    },
    {
      id: 'approvals',
      title: 'Director Approvals & Submission Visibility',
      desc: 'Review HOD outcome frameworks and annual Programme ATR submissions.',
      path: '/director/approvals',
      icon: ShieldCheck,
      color: '#d97706',
      bg: '#fef3c7',
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending Review` : '✓ Up to Date',
      badgeColor: pendingApprovalsCount > 0 ? '#2563eb' : '#15803d',
      badgeBg: pendingApprovalsCount > 0 ? '#eff6ff' : '#dcfce7',
    },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* ── TOP WELCOME HEADER BANNER (WHITE BACKGROUND WITH RIGHT-ALIGNED ACTION BUTTON) ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          border: '1.5px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.3px' }}>
              Welcome, {user?.name || 'School Director'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
              {selectedSchool.name} ({selectedSchool.code}) • Director Dashboard
            </p>
          </div>

          {/* RIGHT-ALIGNED PRIMARY ACTION BUTTON */}
          <div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/director/setup-workflow')}
              style={{
                height: '46px',
                padding: '0 24px',
                fontSize: '13.5px',
                fontWeight: '800',
                gap: '10px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 8px 20px rgba(79,70,229,0.3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <Sparkles size={18} style={{ color: '#fef08a' }} />
              <span>{pendingHODs > 0 ? 'Create School Structure & Assign HODs' : 'Manage School Structure'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── SUMMARY STAT CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid-cards-4" style={{ gap: '16px', marginBottom: '24px' }}>
        {/* Card 1: Total Departments */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Total Departments</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#e0e7ff', display: 'grid', placeItems: 'center', color: '#4f46e5' }}>
              <Building2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{totalDepts}</div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Academic Departments in {selectedSchool.code}
          </div>
        </div>

        {/* Card 2: HODs Assigned */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>HODs Assigned</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fef3c7', display: 'grid', placeItems: 'center', color: '#d97706' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>
            {assignedHODs} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>/ {totalDepts}</span>
          </div>
          <div style={{ fontSize: '11.5px', color: pendingHODs > 0 ? '#d97706' : '#16a34a', marginTop: '4px', fontWeight: '700' }}>
            {pendingHODs > 0 ? `⚠️ ${pendingHODs} HOD Assignment Pending` : '✓ All Departments Assigned'}
          </div>
        </div>

        {/* Card 3: Total Programmes */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Degree Programmes</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#e0f2fe', display: 'grid', placeItems: 'center', color: '#0284c7' }}>
              <GraduationCap size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{totalProgrammes}</div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            B.Tech, M.Tech, MBA Programmes
          </div>
        </div>

        {/* Card 4: Approvals Pending */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Pending Approvals</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#dcfce7', display: 'grid', placeItems: 'center', color: '#15803d' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: pendingApprovalsCount > 0 ? '#2563eb' : '#15803d' }}>
            {pendingApprovalsCount}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Director Level Verification Items
          </div>
        </div>
      </div>

      {/* ── DIRECTOR QUICK ACTIONS GRID ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
          School Management Quick Actions
        </h3>

        <div className="grid-cards-2" style={{ gap: '16px' }}>
          {quickActions.map((action) => {
            const IconComp = action.icon;

            return (
              <div
                key={action.id}
                onClick={() => navigate(action.path)}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justify: 'space-between',
                  gap: '16px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: action.bg,
                      color: action.color,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={22} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
                        {action.title}
                      </h4>
                      {action.badge && (
                        <span
                          className="badge"
                          style={{
                            background: action.badgeBg,
                            color: action.badgeColor,
                            fontSize: '10.5px',
                            fontWeight: '800',
                            padding: '2px 8px',
                          }}
                        >
                          {action.badge}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                      {action.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight size={20} style={{ color: '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SCHOOL SETUP PROGRESS TRACKER ───────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
              School Structure Setup Progress
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Guided setup checklist for {selectedSchool.name}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#4f46e5' }}>
              {progressPct}% Completed
            </span>
            <div style={{ width: '120px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #4f46e5)', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {setupSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '12px 16px',
                borderRadius: '10px',
                background: step.done ? '#f8fafc' : '#ffffff',
                border: step.done ? '1px solid #e2e8f0' : '1.5px dashed #cbd5e1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: step.done ? '#dcfce7' : '#f1f5f9',
                    color: step.done ? '#15803d' : '#64748b',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: '800',
                    fontSize: '12px',
                  }}
                >
                  {step.done ? '✓' : idx + 1}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: step.done ? '#0f172a' : '#64748b' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    {step.desc}
                  </div>
                </div>
              </div>

              {step.done ? (
                <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '11px' }}>
                  ✓ Completed
                </span>
              ) : (
                <span className="badge badge-pending" style={{ background: '#fef3c7', color: '#b45309', fontWeight: '800', fontSize: '11px' }}>
                  ⏳ Pending
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
