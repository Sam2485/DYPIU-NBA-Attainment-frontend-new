import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, GraduationCap, CheckCircle2, Clock, ArrowRight, ShieldCheck, Layers, FileText, Sparkles, AlertCircle, ChevronRight, Calendar } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

export default function HodDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    batches = [],
    selectedBatch,
    masterProgrammes = [],
    courses = [],
    hodApprovals = [],
  } = useAcademic();

  const totalProgrammes = masterProgrammes.length || 3;
  const totalCourses = courses.length || 6;
  const pendingApprovalsCount = hodApprovals.filter((a) => a.status === 'PENDING').length || 2;

  // Quick Action Navigation Items for HOD
  const quickActions = [
    {
      id: 'batches',
      title: 'Batch Management & Initialization',
      desc: 'Initialize 4-year batch cycles (e.g. AY 2025-26 to AY 2028-29) and manage active batches.',
      path: '/hod/batch-management',
      icon: Calendar,
      color: '#4f46e5',
      bg: '#e0e7ff',
    },
    {
      id: 'outcomes',
      title: 'Programme Outcomes (PO, PSO & PEO)',
      desc: 'Define, edit, and review Program Outcomes, PSOs, and Program Educational Objectives.',
      path: '/hod/programme-outcomes',
      icon: Layers,
      color: '#059669',
      bg: '#dcfce7',
    },
    {
      id: 'courses',
      title: 'Course Management & Coordinator Allocation',
      desc: 'Verify department courses and assign Course Coordinators from faculty roster.',
      path: '/hod/course-management',
      icon: Users,
      color: '#0284c7',
      bg: '#e0f2fe',
    },
    {
      id: 'approvals',
      title: 'Approvals & Verification Panel',
      desc: 'Verify submissions from Programme Coordinators with Approve or Send Back actions.',
      path: '/hod/approvals',
      icon: ShieldCheck,
      color: '#d97706',
      bg: '#fef3c7',
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending Verification` : '✓ All Clear',
      badgeColor: pendingApprovalsCount > 0 ? '#2563eb' : '#15803d',
      badgeBg: pendingApprovalsCount > 0 ? '#eff6ff' : '#dcfce7',
    },
    {
      id: 'atr',
      title: 'Programme ATR & Continuous Improvement',
      desc: 'Review and approve final Programme Action Taken Reports and gap action plans.',
      path: '/hod/programme-atr',
      icon: FileText,
      color: '#7c3aed',
      bg: '#f3e8ff',
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
              Welcome, {user?.name || 'Head of Department'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
              Department of Computer Science & Engineering • HOD Control Portal
            </p>
          </div>

          {/* RIGHT-ALIGNED PRIMARY ACTION BUTTON */}
          <div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/hod/setup-workflow')}
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
              <span style={{ color: '#ffffff' }}>Start / Continue Programme Setup</span>
              <ArrowRight size={16} style={{ color: '#ffffff' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── BATCH & PROGRAMME SUMMARY CARDS ───────────────────────────────────────── */}
      <div className="grid-cards-4" style={{ gap: '16px', marginBottom: '24px' }}>
        {/* Card 1: Active Batch */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Active Batch Cycle</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#e0e7ff', display: 'grid', placeItems: 'center', color: '#4f46e5' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
            {selectedBatch?.name.split(' ')[1] || '2025-29'}
          </div>
          <div style={{ fontSize: '11.5px', color: '#15803d', marginTop: '4px', fontWeight: '700' }}>
            ✓ Active Academic Cycle
          </div>
        </div>

        {/* Card 2: Degree Programmes */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Degree Programmes</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#e0f2fe', display: 'grid', placeItems: 'center', color: '#0284c7' }}>
              <GraduationCap size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{totalProgrammes}</div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            B.Tech CSE, AI & DS, M.Tech
          </div>
        </div>

        {/* Card 3: Courses Under Dept */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Courses Managed</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#dcfce7', display: 'grid', placeItems: 'center', color: '#15803d' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{totalCourses}</div>
          <div style={{ fontSize: '11.5px', color: '#15803d', marginTop: '4px', fontWeight: '700' }}>
            ✓ Coordinators Assigned
          </div>
        </div>

        {/* Card 4: Approvals Tracker */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Pending Approvals</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fef3c7', display: 'grid', placeItems: 'center', color: '#d97706' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: pendingApprovalsCount > 0 ? '#2563eb' : '#15803d' }}>
            {pendingApprovalsCount}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Submissions Pending HOD Review
          </div>
        </div>
      </div>

      {/* ── HOD QUICK ACTIONS GRID ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
          Department Management Quick Actions
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
    </div>
  );
}
