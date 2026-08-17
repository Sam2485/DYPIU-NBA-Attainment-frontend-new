import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, BookX, ChevronRight,
  BookOpen, Target, Map, Upload, ClipboardList, BarChart2, FileText, Layers,
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
  const { selectedCourse, availableCourses = [], academicYear, workflowProgressStore = {} } = useAcademic();
  const courseProgress = workflowProgressStore[selectedCourse?.id || 'crs-1'] || {};

  // Only Course Coordinator role sees this tracker
  if (role !== 'FACULTY') return null;

  // No course assigned
  if (availableCourses.length === 0) {
    return (
      <div style={{ padding: '16px 28px 0', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderLeft: '6px solid #e11d48', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
          <BookX size={28} style={{ color: '#e11d48', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '14px', color: '#9f1239', fontWeight: '800', marginBottom: '2px' }}>No Course Assigned Yet</div>
            <p style={{ margin: 0, fontSize: '12px', color: '#be123c' }}>
              You have no courses allocated. Contact your Programme Coordinator for course allocation.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

        {/* 8-step stepper strip */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${WORKFLOW_STEPS.length}, 1fr)`, gap: '4px' }}>
          {WORKFLOW_STEPS.map((stepItem, idx) => {
            const isCompleted = !!courseProgress[stepItem.path];
            const isCurrent   = idx === currentStepIndex;
            const StepIcon    = stepItem.icon;
            return (
              <button
                key={stepItem.step}
                type="button"
                onClick={() => navigate(stepItem.path)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  border: isCompleted ? '1.5px solid #86efac' : isCurrent ? '1.5px solid #a5b4fc' : '1px solid #e2e8f0',
                  background: isCompleted ? '#f0fdf4' : isCurrent ? '#eef2ff' : '#f8fafc',
                  color: isCompleted ? '#16a34a' : isCurrent ? accent : muted,
                  borderRadius: '8px', padding: '6px 6px', fontSize: '11px',
                  fontWeight: isCompleted ? '800' : isCurrent ? '800' : '600',
                  cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  transition: 'all 0.15s ease', fontFamily: 'inherit',
                }}
              >
                {isCompleted
                  ? <CheckCircle2 size={12} style={{ flexShrink: 0, color: '#16a34a' }} />
                  : isCurrent
                  ? <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: accent, flexShrink: 0, display: 'inline-block' }} />
                  : <StepIcon size={11} style={{ flexShrink: 0, opacity: 0.5 }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{stepItem.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
