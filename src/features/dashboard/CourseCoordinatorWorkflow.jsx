import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Map, Upload, ClipboardList,
  BarChart2, FileText, Check, ArrowRight, ArrowLeft, X, ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/dashboard';
import ErrorBoundary from '../../components/common/ErrorBoundary';

// ── Inline step components ─────────────────────────────────────────────────────
import OutcomesManagement from '../outcomes/OutcomesManagement';
import COMappingMatrix from '../mapping/COMappingMatrix';
import EndSemMarksHub from '../marks/EndSemMarksHub';
import CourseEndSurveyHub from '../survey/CourseEndSurveyHub';
import COAttainmentEngine from '../coAttainment/COAttainmentEngine';
import CourseATR from '../atr/CourseATR';

// ── Style tokens ───────────────────────────────────────────────────────────────
const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink     = '#0f172a';
const muted   = '#64748b';
const accent  = '#4f46e5';

// ── Step definitions ───────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, title: 'Add COs',            desc: 'Define Course Outcomes & Targets', path: '/outcomes',      icon: BookOpen,     color: '#4f46e5', bg: '#eef2ff' },
  { number: 2, title: 'CO–PO/PSO Mapping',  desc: 'Map COs to programme outcomes',   path: '/co-mapping',    icon: Map,          color: '#7c3aed', bg: '#f5f3ff' },
  { number: 3, title: 'Direct Assessment',  desc: 'Upload end-semester marks',       path: '/marks-upload',  icon: Upload,       color: '#0369a1', bg: '#e0f2fe' },
  { number: 4, title: 'Indirect Assessment',desc: 'Upload course-end survey',        path: '/survey-upload', icon: ClipboardList,color: '#059669', bg: '#f0fdf4' },
  { number: 5, title: 'CO Attainment',      desc: 'Compute & review attainment',     path: '/co-attainment', icon: BarChart2,    color: '#d97706', bg: '#fffbeb' },
  { number: 6, title: 'Course ATR',         desc: 'Fill Course Action Taken Report', path: '/course-atr',    icon: FileText,     color: '#dc2626', bg: '#fef2f2' },
];

export default function CourseCoordinatorWorkflow() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const {
    courseOfferings           = [],
    selectedCourseOffering    = null,
    selectCourseOffering      = () => {},
    loadAssignedCourseOfferings = () => Promise.resolve([]),
    loadCourseOutcomes        = () => Promise.resolve([]),
    loadCourseMapping         = () => Promise.resolve(null),
    courseOfferingId          = null,
  } = useAcademic();
  const {
    ccWorkflowProgress = null,
    markWorkflowStepComplete = () => Promise.resolve(null),
    loadCcSetupProgress = () => Promise.resolve(null),
  } = useDashboard();

  const course = selectedCourseOffering || courseOfferings[0] || null;
  const courseId = course?.id || null;
  const courseProgress = ccWorkflowProgress || {};

  // ── Per-step completion flags ──
  const stepDone = STEPS.map((s, idx) => {
    if (Array.isArray(courseProgress?.stepStatus)) {
      return !!courseProgress.stepStatus[idx];
    }
    if (Array.isArray(courseProgress?.completedSteps)) {
      return courseProgress.completedSteps.includes(s.number);
    }
    return !!courseProgress?.[s.path] || !!courseProgress?.[s.number];
  });

  const completedCount = stepDone.filter(Boolean).length;

  // Compute the current in-progress step (first incomplete step)
  const firstIncompleteIdx = stepDone.findIndex((done) => !done);
  const firstIncompleteStep = firstIncompleteIdx !== -1 ? firstIncompleteIdx + 1 : 1;

  // ── URL ↔ state sync ────────────────────────────────────────────────────────
  const rawStepParam = searchParams.get('step');
  const parsedStep = parseInt(rawStepParam, 10);
  const hasValidParam = parsedStep >= 1 && parsedStep <= STEPS.length;

  const [currentStep, setCurrentStep] = useState(
    hasValidParam ? parsedStep : firstIncompleteStep
  );

  useEffect(() => {
    let isCurrent = true;
    loadAssignedCourseOfferings(user).then((offerings) => {
      if (!isCurrent || offerings.length === 0) return;
      const selected = offerings.find((offering) => offering.id === courseOfferingId) || offerings[0];
      selectCourseOffering(selected);
    }).catch(() => {});
    return () => { isCurrent = false; };
  }, [loadAssignedCourseOfferings, selectCourseOffering, user]);

  useEffect(() => {
    if (currentStep !== 1 || !courseOfferingId) return;
    loadCourseOutcomes(courseOfferingId).catch(() => {});
  }, [courseOfferingId, currentStep, loadCourseOutcomes]);

  useEffect(() => {
    if (currentStep !== 2 || !courseOfferingId) return;
    loadCourseMapping(courseOfferingId).catch(() => {});
  }, [courseOfferingId, currentStep, loadCourseMapping]);

  useEffect(() => {
    if (courseOfferingId) loadCcSetupProgress(courseOfferingId).catch(() => {});
  }, [courseOfferingId, loadCcSetupProgress]);

  useEffect(() => {
    const s = parseInt(searchParams.get('step'), 10);
    if (!s || isNaN(s) || s < 1 || s > STEPS.length) {
      setSearchParams({ step: firstIncompleteStep }, { replace: true });
      setCurrentStep(firstIncompleteStep);
    } else if (s !== currentStep) {
      setCurrentStep(s);
    }
  }, [searchParams, firstIncompleteStep]);

  const goToStep = (n) => {
    setCurrentStep(n);
    setSearchParams({ step: n });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Save & Next ──────────────────────────────────────────────────────────────
  const handleSaveAndNext = async () => {
    if (courseId) {
      await markWorkflowStepComplete(courseOfferingId || courseId, STEPS[currentStep - 1].path);
    }
    if (currentStep < STEPS.length) {
      goToStep(currentStep + 1);
    }
  };

  const handleFinish = async () => {
    if (courseId) {
      await markWorkflowStepComplete(courseOfferingId || courseId, STEPS[STEPS.length - 1].path);
    }
    navigate('/dashboard');
  };

  const currentStepMeta = STEPS[currentStep - 1] || STEPS[0];

  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>

      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <div style={{
        ...surface,
        padding: '20px 24px',
        marginBottom: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderRadius: '12px 12px 0 0',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            {currentStepMeta.title}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Course Selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={course?.id || ''}
              onChange={(e) => {
                const nextOffering = courseOfferings.find((offering) => offering.id === e.target.value);
                if (!nextOffering) return;
                selectCourseOffering(nextOffering);
                const nextProg = workflowProgressStore[nextOffering.id] || {};
                const nextIncompleteIdx = STEPS.findIndex((s, idx) => {
                  if (Array.isArray(nextProg?.stepStatus)) return !nextProg.stepStatus[idx];
                  return !nextProg[s.path];
                });
                const nextStepNum = nextIncompleteIdx !== -1 ? nextIncompleteIdx + 1 : 1;
                goToStep(nextStepNum);
              }}
              style={{
                height: '38px', fontSize: '13px', fontWeight: '700', color: accent,
                border: '1.5px solid #c7d2fe', borderRadius: '8px',
                padding: '0 32px 0 12px', background: '#f5f3ff',
                minWidth: '240px', outline: 'none', appearance: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {courseOfferings.map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {offering.courseCode || 'Course'} — {offering.courseName || 'Programme Batch Course'} · Sem {offering.semester ?? '—'}
                </option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: accent, pointerEvents: 'none' }} />
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '600',
              background: '#f8fafc', color: ink, border: '1px solid #e2e8f0',
              borderRadius: '8px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
            }}
          >
            <X size={14} /> Exit
          </button>
        </div>
      </div>

      {/* ── STEP STEPPER (icon circles) ───────────────────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          {/* connector line */}
          <div style={{
            position: 'absolute', top: '18px',
            left: `${100 / (STEPS.length * 2)}%`,
            right: `${100 / (STEPS.length * 2)}%`,
            height: '1px', background: '#e2e8f0', zIndex: 0,
          }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
            gap: '4px', position: 'relative', zIndex: 1,
          }}>
            {STEPS.map((s) => {
              const done   = stepDone[s.number - 1];
              const active = currentStep === s.number;
              const Icon   = s.icon;
              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => goToStep(s.number)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                    opacity: active || done ? 1 : 0.55, transition: 'opacity .2s',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: done ? '#f0fdf4' : active ? s.bg : '#f8fafc',
                    border: `2px solid ${done ? '#86efac' : active ? s.color : '#e2e8f0'}`,
                    color: done ? '#16a34a' : active ? s.color : muted,
                    display: 'grid', placeItems: 'center', transition: 'all .2s',
                    boxShadow: active ? `0 4px 12px ${s.color}33` : 'none',
                  }}>
                    {done ? <Check size={14} style={{ color: '#16a34a' }} /> : <Icon size={14} />}
                  </div>
                  <div style={{
                    fontSize: '10px', fontWeight: active ? '800' : done ? '700' : '600',
                    color: done ? '#16a34a' : active ? ink : muted,
                    textAlign: 'center', lineHeight: 1.3, maxWidth: '64px',
                  }}>
                    {s.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── STEP CONTENT WITH STEP-LEVEL ERROR BOUNDARY ───────────────────────── */}
      <div style={{ ...surface, padding: '0', marginBottom: '20px', overflow: 'hidden' }}>
        <ErrorBoundary
          fallbackTitle={`Step ${currentStep} Error (${currentStepMeta.title})`}
          fallbackMessage={`An error occurred while loading ${currentStepMeta.title}. Other workflow steps and navigation remain available.`}
        >
          {currentStep === 1 && <OutcomesManagement hideFooter />}
          {currentStep === 2 && <COMappingMatrix hideFooter />}
          {currentStep === 3 && <EndSemMarksHub hideFooter />}
          {currentStep === 4 && <CourseEndSurveyHub hideFooter />}
          {currentStep === 5 && <COAttainmentEngine hideFooter />}
          {currentStep === 6 && (
            <div>
              <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                  Course ATR
                </h3>
              </div>
              <div style={{ padding: '20px' }}>
                <CourseATR hideFooter hideHeader />
              </div>
            </div>
          )}
        </ErrorBoundary>
      </div>

      {/* ── FOOTER NAV ────────────────────────────────────────────────────────── */}
      <div style={{
        ...surface,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: '20px',
      }}>
        {/* Extreme Left: Previous */}
        <div style={{ minWidth: '160px', display: 'flex', justifyContent: 'flex-start' }}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => goToStep(currentStep - 1)}
              style={{
                height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '600',
                background: '#f8fafc', color: ink, border: '1px solid #e2e8f0',
                borderRadius: '8px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
              }}
            >
              <ArrowLeft size={14} /> Previous Step
            </button>
          )}
        </div>

        {/* Middle: Step dots & steps remaining */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {STEPS.map((s) => (
              <div
                key={s.number}
                onClick={() => goToStep(s.number)}
                style={{
                  width: currentStep === s.number ? '20px' : '6px',
                  height: '6px', borderRadius: '3px',
                  background: stepDone[s.number - 1] ? '#16a34a' : currentStep === s.number ? accent : '#e2e8f0',
                  transition: 'all .2s', cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {completedCount === STEPS.length ? (
            <span style={{
              fontSize: '11px', fontWeight: '700', background: '#f0fdf4',
              color: '#16a34a', border: '1px solid #bbf7d0',
              borderRadius: '6px', padding: '3px 10px',
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}>
              <Check size={11} /> All complete
            </span>
          ) : (
            <span style={{
              fontSize: '11.5px', fontWeight: '600', color: muted,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '6px', padding: '3px 10px',
            }}>
              {STEPS.length - completedCount} step{STEPS.length - completedCount !== 1 ? 's' : ''} remaining
            </span>
          )}
        </div>

        {/* Extreme Right: Save & Next / Finish */}
        <div style={{ minWidth: '160px', display: 'flex', justifyContent: 'flex-end' }}>
          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleSaveAndNext}
              style={{
                height: '40px', padding: '0 22px', fontSize: '13.5px', fontWeight: '800',
                background: `linear-gradient(135deg, ${accent} 0%, #6366f1 100%)`,
                color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(79,70,229,0.28)',
              }}
            >
              Save &amp; Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              style={{
                height: '40px', padding: '0 22px', fontSize: '13.5px', fontWeight: '800',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              }}
            >
              <CheckCircle2 size={15} /> Finish Attainment
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
