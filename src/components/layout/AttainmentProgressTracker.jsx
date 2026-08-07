import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Rocket, BookX } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

// Exact 7-Step Course Coordinator Workflow Sequence:
export const WORKFLOW_STEPS = [
  { step: 1, label: '1. Add COs', path: '/outcomes' },
  { step: 2, label: '2. Target Setting', path: '/co-targets' },
  { step: 3, label: '3. CO Mapping', path: '/co-mapping' },
  { step: 4, label: '4. Direct Assessment', path: '/marks-upload' },
  { step: 5, label: '5. Indirect Assessment', path: '/survey-upload' },
  { step: 6, label: '6. CO Attainment', path: '/co-attainment' },
  { step: 7, label: '7. Course ATR', path: '/course-atr' },
];

export default function AttainmentProgressTracker() {
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCourse, availableCourses = [], academicYear } = useAcademic();

  // ONLY Course Coordinator role sees the Start Process banner & Progress Tracker
  if (role !== 'FACULTY') {
    return null;
  }

  // NO COURSE ASSIGNED YET SCREEN
  if (availableCourses.length === 0) {
    return (
      <div style={{ padding: '16px 28px 0', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            background: '#fff1f2',
            border: '1.5px solid #fecdd3',
            borderLeft: '6px solid #e11d48',
            borderRadius: '12px',
            padding: '18px 24px',
            boxShadow: '0 4px 14px rgba(225, 29, 72, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <BookX size={32} style={{ color: '#e11d48', flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', color: '#9f1239', fontWeight: '800' }}>
              No Course Assigned Yet
            </h4>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#be123c' }}>
              You currently do not have any courses allocated to your account by the Programme Coordinator. Please contact your Programme Coordinator for course allocation before starting the course attainment process.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentPath = location.pathname;
  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.path === currentPath);

  // If not on one of the 7 workflow steps, show Start Course Attainment row ONLY on /dashboard screen
  if (currentStepIndex === -1) {
    if (currentPath !== '/dashboard') {
      return null;
    }

    return (
      <div style={{ padding: '16px 28px 0', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #6366f1',
            borderRadius: '12px',
            padding: '14px 20px',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Rocket size={20} />
            </div>
            <div>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                Course Attainment Workflow Process ({selectedCourse?.code} • {academicYear})
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Follow the 7-step NBA Outcome-Based Education Attainment process: Add COs → Target Setting → CO Mapping → Direct Assessment → Indirect Assessment → CO Attainment → Course ATR.
              </p>
            </div>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <button
              type="button"
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '800',
                gap: '8px',
                background: '#ffffff',
                color: '#2563eb',
                border: '1.5px solid #2563eb',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
              onClick={() => navigate('/outcomes')}
            >
              <Rocket size={16} /> Start Course Attainment Process
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeStep = WORKFLOW_STEPS[currentStepIndex];

  return (
    <div style={{ padding: '16px 28px 0', width: '100%', boxSizing: 'border-box' }}>
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '14px',
          padding: '14px 18px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Header line of Progress Tracker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#eef2ff',
                color: '#4f46e5',
                fontWeight: '800',
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '20px',
                border: '1px solid #c7d2fe',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Step {activeStep.step} of 7: {activeStep.label}
            </span>
            <span style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: '700' }}>
              {selectedCourse?.code} - {selectedCourse?.name} ({academicYear})
            </span>
          </div>

          <button
            className="btn btn-secondary"
            style={{ fontSize: '11.5px', padding: '5px 12px' }}
            onClick={() => navigate('/dashboard')}
          >
            Exit Workflow
          </button>
        </div>

        {/* 7-Step Visual Stepper Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          {WORKFLOW_STEPS.map((stepItem, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={stepItem.step}
                onClick={() => navigate(stepItem.path)}
                style={{
                  border: isCurrent
                    ? '1.5px solid #4f46e5'
                    : isCompleted
                    ? '1px solid #a7f3d0'
                    : '1px solid #e2e8f0',
                  background: isCurrent
                    ? '#eef2ff'
                    : isCompleted
                    ? '#f0fdf4'
                    : '#ffffff',
                  color: isCurrent
                    ? '#3730a3'
                    : isCompleted
                    ? '#065f46'
                    : '#64748b',
                  borderRadius: '8px',
                  padding: '6px 8px',
                  fontSize: '11px',
                  fontWeight: isCurrent || isCompleted ? '800' : '600',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.15s ease',
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                ) : isCurrent ? (
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#4f46e5',
                      flexShrink: 0,
                    }}
                  />
                ) : null}
                <span>{stepItem.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
