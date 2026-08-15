import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Target, Map, Upload, ClipboardList,
  BarChart2, FileText, Layers, Check, ArrowRight, ArrowLeft, X, ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import {
  getCourseCoordinatorSummary,
  getCourseCoordinatorSetupProgress,
  updateCourseCoordinatorSetupProgress,
  completeCourseCoordinatorSetup,
} from '../../api/academic';

// ── Inline step components ─────────────────────────────────────────────────────
import OutcomesManagement from '../outcomes/OutcomesManagement';
import COTargetSettingHub from '../outcomes/COTargetSettingHub';
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
  { number: 1, title: 'Add COs & Targets',  desc: 'Define Outcomes & Targets',       path: '/outcomes',      icon: BookOpen,     color: '#4f46e5', bg: '#eef2ff' },
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
    availableCourses          = [],
    courses                   = [],
    setCourseId               = () => {},
    selectedCourse,
    academicYear,
    attainmentConfigs         = {},
    activeCOs                 = [],
    workflowProgressStore     = {},
    markWorkflowStepComplete  = () => {},
  } = useAcademic();

  const [coordinatorCourses, setCoordinatorCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (user?.email) {
      getCourseCoordinatorSummary(user.email)
        .then((res) => {
          if (isMounted) {
            const data = res?.data?.data || res?.data;
            const fetched = data?.assignedCourses;
            if (Array.isArray(fetched) && fetched.length > 0) {
              setCoordinatorCourses(fetched);
              setSelectedCourseId((prev) => prev || fetched[0].id);
              setCourseId(fetched[0].id);
            }
          }
        })
        .catch((err) => console.warn('Failed to fetch coordinator summary in workflow:', err));
    }
    return () => { isMounted = false; };
  }, [user?.email]);

  const displayCourses = coordinatorCourses.length > 0
    ? coordinatorCourses
    : (availableCourses.length > 0 ? availableCourses : courses);

  const activeCourseId = selectedCourseId || selectedCourse?.id || displayCourses[0]?.id || 'crs-1';
  const course         = displayCourses.find((c) => c.id === activeCourseId) || selectedCourse || displayCourses[0];
  const config         = course?.id ? (attainmentConfigs[course.id] || {}) : {};
  const courseCOs      = course?.courseOutcomes || activeCOs || [];
  const courseProgress = workflowProgressStore[course?.id || 'crs-1'] || {};

  // ── URL ↔ state sync ────────────────────────────────────────────────────────
  const initialStep = parseInt(searchParams.get('step'), 10);
  const [currentStep, setCurrentStep] = useState(
    initialStep >= 1 && initialStep <= 6 ? initialStep : 1
  );

  useEffect(() => {
    let isMounted = true;
    if (user?.email && course?.id) {
      getCourseCoordinatorSetupProgress(user.email, course.id)
        .then((res) => {
          if (isMounted) {
            const data = res?.data?.data || res?.data;
            if (data?.currentStep && data.currentStep >= 1 && data.currentStep <= 6 && !searchParams.get('step')) {
              setCurrentStep(data.currentStep);
            }
          }
        })
        .catch((err) => console.warn('Failed to load course coordinator setup progress:', err));
    }
    return () => { isMounted = false; };
  }, [user?.email, course?.id]);

  useEffect(() => {
    const s = parseInt(searchParams.get('step'), 10);
    if (!s || isNaN(s) || s < 1 || s > 6) {
      setSearchParams({ step: 1 }, { replace: true });
      setCurrentStep(1);
    } else if (s !== currentStep) {
      setCurrentStep(s);
    }
  }, [searchParams]);

  const goToStep = (n) => {
    setCurrentStep(n);
    setSearchParams({ step: n });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Per-step completion flags ────────────────────────────────────────────────
  const stepDone = STEPS.map((s, idx) => {
    if (courseProgress[s.path]) return true;
    if (idx === 0) return courseCOs.length > 0;
    if (idx === 1) return courseCOs.some((c) => c.mappings);
    if (idx === 2) return !!config.directUploaded;
    if (idx === 3) return !!config.indirectUploaded;
    if (idx === 4) return !!config.attainmentRun;
    if (idx === 5) return !!config.atrSubmitted;
    return false;
  });

  const completedCount = stepDone.filter(Boolean).length;
  const progressPct    = Math.round((completedCount / STEPS.length) * 100);

  // ── Save & Next ──────────────────────────────────────────────────────────────
  const handleSaveAndNext = async () => {
    markWorkflowStepComplete(course?.id, STEPS[currentStep - 1].path);
    const nextStep = currentStep < STEPS.length ? currentStep + 1 : currentStep;
    try {
      if (course?.id) {
        await updateCourseCoordinatorSetupProgress(user?.email, course.id, nextStep);
      }
    } catch (err) {
      console.warn('Failed to update course coordinator progress:', err);
    }
    if (currentStep < STEPS.length) goToStep(nextStep);
  };

  const handleFinish = async () => {
    markWorkflowStepComplete(course?.id, STEPS[STEPS.length - 1].path);
    try {
      if (course?.id) {
        await completeCourseCoordinatorSetup(user?.email, course.id);
      }
    } catch (err) {
      console.warn('Failed to mark course coordinator setup completed:', err);
    }
    navigate('/dashboard');
  };

  const currentStepMeta = STEPS[currentStep - 1];

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
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Course Coordinator &nbsp;·&nbsp; Guided Attainment Workflow &nbsp;·&nbsp; Step {currentStep} of {STEPS.length}
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            {currentStepMeta.title}
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            {currentStepMeta.desc}
            {course && (
              <span style={{ color: '#94a3b8' }}>
                &nbsp;·&nbsp; <strong style={{ color: accent }}>{course.code}</strong>
                {academicYear && ` · ${academicYear}`}
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Course Selector */}
          <div style={{ position: 'relative' }}>
            <select
              aria-label="Select Course"
              value={activeCourseId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedCourseId(newId);
                setCourseId(newId);
                goToStep(1);
              }}
              style={{
                height: '38px', fontSize: '13px', fontWeight: '700', color: accent,
                border: '1.5px solid #c7d2fe', borderRadius: '8px',
                padding: '0 32px 0 12px', background: '#f5f3ff',
                minWidth: '240px', outline: 'none', appearance: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {displayCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
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

      {/* Top Banner Header with Course Selector */}

      {/* ── STEP STEPPER (icon circles) ───────────────────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          {/* connector line */}
          <div style={{
            position: 'absolute', top: '18px',
            left: `${100 / (STEPS.length * 2)}%`,
            right: `${100 / (STEPS.length * 2)}%`,
            height: '1px', background: '#cbd5e1', zIndex: 0,
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
                    opacity: 1, transition: 'opacity .2s',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: done ? '#f0fdf4' : active ? s.bg : '#f8fafc',
                    border: `2px solid ${done ? '#4ade80' : active ? s.color : '#cbd5e1'}`,
                    color: done ? '#15803d' : active ? s.color : '#475569',
                    display: 'grid', placeItems: 'center', transition: 'all .2s',
                    boxShadow: active ? `0 4px 12px ${s.color}33` : 'none',
                  }}>
                    {done ? <Check size={14} style={{ color: '#15803d' }} /> : <Icon size={14} />}
                  </div>
                  <div style={{
                    fontSize: '10.5px', fontWeight: active ? '800' : done ? '700' : '600',
                    color: done ? '#15803d' : active ? ink : '#334155',
                    textAlign: 'center', lineHeight: 1.3, maxWidth: '68px',
                  }}>
                    {s.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── STEP CONTENT ──────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '0', marginBottom: '20px', overflow: 'hidden' }}>
        {currentStep === 1 && <OutcomesManagement hideFooter isWorkflow />}
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
      </div>

      {/* ── FOOTER NAV ────────────────────────────────────────────────────────── */}
      <div style={{
        ...surface,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Previous */}
        <div>
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

        {/* Centre: step dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

          {/* Save & Next / Finish */}
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

        {/* Right: completion badge */}
        <div style={{ minWidth: '120px', textAlign: 'right' }}>
          {completedCount === STEPS.length ? (
            <span style={{
              fontSize: '11px', fontWeight: '700', background: '#f0fdf4',
              color: '#16a34a', border: '1px solid #bbf7d0',
              borderRadius: '6px', padding: '4px 10px',
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}>
              <Check size={11} /> All complete
            </span>
          ) : (
            <span style={{ fontSize: '11.5px', color: muted }}>
              {STEPS.length - completedCount} step{STEPS.length - completedCount !== 1 ? 's' : ''} remaining
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
