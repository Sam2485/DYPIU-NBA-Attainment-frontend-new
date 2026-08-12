import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Target, Map, Upload, ClipboardList,
  BarChart2, FileText, Layers, Check, ArrowRight, ArrowLeft, X, ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

// ── Inline step components ─────────────────────────────────────────────────────
import OutcomesManagement from '../outcomes/OutcomesManagement';
import COTargetSettingHub from '../outcomes/COTargetSettingHub';
import COMappingMatrix from '../mapping/COMappingMatrix';
import EndSemMarksHub from '../marks/EndSemMarksHub';
import CourseEndSurveyHub from '../survey/CourseEndSurveyHub';
import COAttainmentEngine from '../coAttainment/COAttainmentEngine';
import CourseATR from '../atr/CourseATR';
import ProgrammeATR from '../atr/ProgrammeATR';

// ── Style tokens ───────────────────────────────────────────────────────────────
const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink     = '#0f172a';
const muted   = '#64748b';
const accent  = '#4f46e5';

// ── Step definitions ───────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, title: 'Add COs',            desc: 'Define Course Outcomes',          path: '/outcomes',      icon: BookOpen,     color: '#4f46e5', bg: '#eef2ff' },
  { number: 2, title: 'CO Targets',         desc: 'Set attainment benchmarks',       path: '/co-targets',    icon: Target,       color: '#0284c7', bg: '#f0f9ff' },
  { number: 3, title: 'CO–PO/PSO Mapping',  desc: 'Map COs to programme outcomes',   path: '/co-mapping',    icon: Map,          color: '#7c3aed', bg: '#f5f3ff' },
  { number: 4, title: 'Direct Assessment',  desc: 'Upload end-semester marks',       path: '/marks-upload',  icon: Upload,       color: '#0369a1', bg: '#e0f2fe' },
  { number: 5, title: 'Indirect Assessment',desc: 'Upload course-end survey',        path: '/survey-upload', icon: ClipboardList,color: '#059669', bg: '#f0fdf4' },
  { number: 6, title: 'CO Attainment',      desc: 'Compute & review attainment',     path: '/co-attainment', icon: BarChart2,    color: '#d97706', bg: '#fffbeb' },
  { number: 7, title: 'Course ATR',         desc: 'Fill Course Action Taken Report', path: '/course-atr',    icon: FileText,     color: '#dc2626', bg: '#fef2f2' },
  { number: 8, title: 'Programme ATR',      desc: 'Fill PO/PSO Action Taken Report', path: '/programme-atr', icon: Layers,       color: '#059669', bg: '#f0fdf4' },
];

export default function CourseCoordinatorWorkflow() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const course     = selectedCourse || availableCourses[0];
  const config     = course?.id ? (attainmentConfigs[course.id] || {}) : {};
  const courseCOs  = course?.courseOutcomes || activeCOs || [];
  const courseProgress = workflowProgressStore[course?.id || 'crs-1'] || {};

  // ── URL ↔ state sync ────────────────────────────────────────────────────────
  const initialStep = parseInt(searchParams.get('step'), 10);
  const [currentStep, setCurrentStep] = useState(
    initialStep >= 1 && initialStep <= 8 ? initialStep : 1
  );

  useEffect(() => {
    const s = parseInt(searchParams.get('step'), 10);
    if (!s || isNaN(s) || s < 1 || s > 8) {
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
    if (idx === 1) return courseCOs.some((c) => c.target);
    if (idx === 2) return courseCOs.some((c) => c.mappings);
    if (idx === 3) return !!config.directUploaded;
    if (idx === 4) return !!config.indirectUploaded;
    if (idx === 5) return !!config.attainmentRun;
    if (idx === 6) return !!config.atrSubmitted;
    if (idx === 7) return !!config.progAtrSubmitted;
    return false;
  });

  const completedCount = stepDone.filter(Boolean).length;
  const progressPct    = Math.round((completedCount / STEPS.length) * 100);

  // ── Save & Next ──────────────────────────────────────────────────────────────
  const handleSaveAndNext = () => {
    markWorkflowStepComplete(course?.id, STEPS[currentStep - 1].path);
    if (currentStep < STEPS.length) goToStep(currentStep + 1);
  };

  const handleFinish = () => {
    markWorkflowStepComplete(course?.id, STEPS[STEPS.length - 1].path);
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
              value={course?.id || ''}
              onChange={(e) => {
                setCourseId(e.target.value);
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
              {(availableCourses.length > 0 ? availableCourses : courses).map((c) => (
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

      {/* ── STEP CONTENT ──────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '0', marginBottom: '20px', overflow: 'hidden' }}>
        {currentStep === 1 && <OutcomesManagement hideFooter />}
        {currentStep === 2 && <COTargetSettingHub hideFooter />}
        {currentStep === 3 && <COMappingMatrix hideFooter />}
        {currentStep === 4 && <EndSemMarksHub hideFooter />}
        {currentStep === 5 && <CourseEndSurveyHub hideFooter />}
        {currentStep === 6 && <COAttainmentEngine hideFooter />}
        {currentStep === 7 && (
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
        {currentStep === 8 && (
          <div>
            <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Programme ATR
              </h3>
            </div>
            <div style={{ padding: '20px' }}>
              <ProgrammeATR hideFooter hideHeader />
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
