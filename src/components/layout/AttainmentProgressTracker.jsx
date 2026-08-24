import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen, Map, Upload, ClipboardList, BarChart2, FileText,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

// Exact 6-Step Course Coordinator Workflow Sequence
export const WORKFLOW_STEPS = [
  { step: 1, label: 'Add COs',             path: '/outcomes',      icon: BookOpen      },
  { step: 2, label: 'CO Mapping',          path: '/co-mapping',    icon: Map           },
  { step: 3, label: 'Direct Assessment',   path: '/marks-upload',  icon: Upload        },
  { step: 4, label: 'Indirect Assessment', path: '/survey-upload', icon: ClipboardList  },
  { step: 5, label: 'CO Attainment',       path: '/co-attainment', icon: BarChart2     },
  { step: 6, label: 'Course ATR',          path: '/course-atr',    icon: FileText      },
];

const accent = '#4f46e5';
const ink    = '#0f172a';
const muted  = '#64748b';

export default function AttainmentProgressTracker() {
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    selectedCourse = null,
    academicYear = null,
    workflowProgressStore = {},
    ccWorkflowProgress = null,
    courseOfferingId = null,
  } = useAcademic();

  const courseId = selectedCourse?.id || null;
  const courseProgress =
    (courseOfferingId && workflowProgressStore[courseOfferingId]) ||
    (courseId && workflowProgressStore[courseId]) ||
    ccWorkflowProgress ||
    {};

  // Only Course Coordinator role sees this tracker
  if (role !== 'FACULTY' && role !== 'COURSE_COORDINATOR') return null;

  const currentPath       = location.pathname;
  const currentStepIndex  = WORKFLOW_STEPS.findIndex((s) => s.path === currentPath);

  // ── On non-workflow pages (like /dashboard), return null ──
  if (currentStepIndex === -1) {
    return null;
  }

  // ── On a workflow step page: show the inline stepper bar ─────────────────
  const activeStep = WORKFLOW_STEPS[currentStepIndex];

  return (
    <div style={{ padding: '16px 28px 0', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', width: '100%', boxSizing: 'border-box' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#eef2ff', color: accent, fontWeight: '800', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '1px solid #c7d2fe', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
              Step {activeStep.step} of {WORKFLOW_STEPS.length} &nbsp;·&nbsp; {activeStep.label}
            </span>
            <span style={{ fontSize: '12px', color: ink, fontWeight: '700' }}>
              {selectedCourse?.code} — {selectedCourse?.name}
              {academicYear ? <span style={{ color: muted }}> ({academicYear})</span> : null}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => navigate(`/course-coordinator/workflow?step=${activeStep.step}`)}
              style={{ height: '30px', padding: '0 12px', fontSize: '11.5px', fontWeight: '700', background: '#eef2ff', color: accent, border: '1px solid #c7d2fe', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit' }}
            >
              View All Steps <ChevronRight size={12} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{ height: '30px', padding: '0 12px', fontSize: '11.5px', fontWeight: '600', background: '#f8fafc', color: muted, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Exit Workflow
            </button>
          </div>
        </div>

        {/* 6-step stepper strip */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${WORKFLOW_STEPS.length}, 1fr)`, gap: '4px' }}>
          {WORKFLOW_STEPS.map((stepItem, idx) => {
            const isCompleted = Array.isArray(courseProgress?.stepStatus)
              ? !!courseProgress.stepStatus[idx]
              : Array.isArray(courseProgress?.completedSteps)
              ? courseProgress.completedSteps.includes(stepItem.step)
              : !!courseProgress?.[stepItem.path] || !!courseProgress?.[stepItem.step];
            const isCurrent   = idx === currentStepIndex;
            const StepIcon    = stepItem.icon;
            return (
              <button
                key={stepItem.step}
                type="button"
                onClick={() => navigate(stepItem.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '7px',
                  border: `1px solid ${isCurrent ? '#c7d2fe' : isCompleted ? '#bbf7d0' : '#e2e8f0'}`,
                  background: isCurrent ? '#eef2ff' : isCompleted ? '#f0fdf4' : '#f8fafc',
                  color: isCurrent ? accent : isCompleted ? '#16a34a' : muted,
                  cursor: 'pointer',
                  fontSize: '11.5px',
                  fontWeight: isCurrent ? '800' : isCompleted ? '700' : '600',
                  fontFamily: 'inherit',
                  transition: 'all .15s ease',
                }}
              >
                <StepIcon size={13} style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stepItem.step}. {stepItem.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
