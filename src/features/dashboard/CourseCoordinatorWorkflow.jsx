import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Target, Map, Upload, ClipboardList,
  BarChart2, FileText, Check, ArrowRight, ArrowLeft, X,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

// ── Inline step components ────────────────────────────────────────────────────
import OutcomesManagement from '../outcomes/OutcomesManagement';
import COTargetSettingHub from '../outcomes/COTargetSettingHub';
import COMappingMatrix from '../mapping/COMappingMatrix';
import EndSemMarksHub from '../marks/EndSemMarksHub';
import CourseEndSurveyHub from '../survey/CourseEndSurveyHub';
import COAttainmentEngine from '../coAttainment/COAttainmentEngine';
import CourseATR from '../atr/CourseATR';

// ── Style tokens ─────────────────────────────────────────────────────────────
const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink     = '#0f172a';
const muted   = '#64748b';
const accent  = '#4f46e5';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  {
    number: 1,
    title:  'Add COs',
    desc:   'Define Course Outcomes',
    path:   '/outcomes',
    icon:   BookOpen,
    color:  '#4f46e5',
    bg:     '#eef2ff',
  },
  {
    number: 2,
    title:  'CO Targets',
    desc:   'Set attainment benchmarks',
    path:   '/co-targets',
    icon:   Target,
    color:  '#0284c7',
    bg:     '#f0f9ff',
  },
  {
    number: 3,
    title:  'CO–PO/PSO Mapping',
    desc:   'Map COs to programme outcomes',
    path:   '/co-mapping',
    icon:   Map,
    color:  '#7c3aed',
    bg:     '#f5f3ff',
  },
  {
    number: 4,
    title:  'Direct Assessment',
    desc:   'Upload end-semester marks',
    path:   '/marks-upload',
    icon:   Upload,
    color:  '#0369a1',
    bg:     '#e0f2fe',
  },
  {
    number: 5,
    title:  'Indirect Assessment',
    desc:   'Upload course-end survey',
    path:   '/survey-upload',
    icon:   ClipboardList,
    color:  '#059669',
    bg:     '#f0fdf4',
  },
  {
    number: 6,
    title:  'CO Attainment',
    desc:   'Compute & review attainment',
    path:   '/co-attainment',
    icon:   BarChart2,
    color:  '#d97706',
    bg:     '#fffbeb',
  },
  {
    number: 7,
    title:  'Course ATR',
    desc:   'Fill Course Action Taken Report',
    path:   '/course-atr',
    icon:   FileText,
    color:  '#dc2626',
    bg:     '#fef2f2',
  },
];

export default function CourseCoordinatorWorkflow() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user }  = useAuth();
  const {
    availableCourses       = [],
    selectedCourse,
    academicYear,
    attainmentConfigs      = {},
    activeCOs              = [],
    workflowProgressStore  = {},
    markWorkflowStepComplete = () => {},
  } = useAcademic();

  const course     = selectedCourse || availableCourses[0];
  const courseCode = course?.code || '—';
  const courseName = course?.name || 'No course selected';
  const config     = course?.id ? (attainmentConfigs[course.id] || {}) : {};
  const courseCOs  = course?.courseOutcomes || activeCOs || [];
  const courseProgress = workflowProgressStore[course?.id || 'crs-1'] || {};

  // StepParam URL synchronization
  const initialStepParam = parseInt(searchParams.get('step'), 10);
  const [currentStep, setCurrentStep] = useState(
    initialStepParam && initialStepParam >= 1 && initialStepParam <= 7 ? initialStepParam : 1
  );

  useEffect(() => {
    const s = parseInt(searchParams.get('step'), 10);
    if (s && s >= 1 && s <= 7 && s !== currentStep) {
      setCurrentStep(s);
    }
  }, [searchParams]);

  const handleStepSelect = (stepNum) => {
    setCurrentStep(stepNum);
    setSearchParams({ step: stepNum });
  };

  // Per-step completion flags
  const stepDone = STEPS.map((s, idx) => {
    if (courseProgress[s.path]) return true;
    if (idx === 0) return courseCOs.length > 0;
    if (idx === 1) return courseCOs.some((c) => c.target);
    if (idx === 2) return courseCOs.some((c) => c.mappings);
    if (idx === 3) return !!config.directUploaded;
    if (idx === 4) return !!config.indirectUploaded;
    if (idx === 5) return !!config.attainmentRun;
    if (idx === 6) return !!config.atrSubmitted;
    return false;
  });

  const completedCount = stepDone.filter(Boolean).length;
  const progressPct    = Math.round((completedCount / STEPS.length) * 100);

  const handleSaveAndNext = () => {
    const currentStepObj = STEPS[currentStep - 1];
    markWorkflowStepComplete(course?.id, currentStepObj.path);

    if (currentStep < 7) {
      const nextS = currentStep + 1;
      setCurrentStep(nextS);
      setSearchParams({ step: nextS });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevS = currentStep - 1;
      setCurrentStep(prevS);
      setSearchParams({ step: prevS });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = () => {
    const currentStepObj = STEPS[6];
    markWorkflowStepComplete(course?.id, currentStepObj.path);
    navigate('/dashboard');
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>

      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div style={{
        ...surface,
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{
            fontSize: '10.5px', fontWeight: '700', color: muted,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px',
          }}>
            Course Coordinator Guided Workflow &nbsp;·&nbsp; Step {currentStep} of 7
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Course Attainment Guided Workflow Process
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            {courseCode !== '—'
              ? <><strong style={{ color: ink }}>{courseCode}</strong> — {courseName}</>
              : 'No course selected'}
            {academicYear
              ? <span style={{ color: '#94a3b8' }}> &nbsp;·&nbsp; {academicYear}</span>
              : null}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Progress pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '8px', padding: '6px 12px',
          }}>
            <div style={{ width: '80px', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: accent, borderRadius: '3px' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: accent }}>{progressPct}%</span>
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
            <X size={14} /> Exit Workflow
          </button>
        </div>
      </div>

      {/* ── STEPPER STRIP (GREEN CIRCLES ON SAVE) ─────────────────────────── */}
      <div style={{ ...surface, padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          {/* connector line */}
          <div style={{
            position: 'absolute', top: '18px',
            left: `${100 / 14}%`, right: `${100 / 14}%`,
            height: '1px', background: '#e2e8f0', zIndex: 0,
          }} />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
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
                  onClick={() => handleStepSelect(s.number)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                    opacity: active || done ? 1 : 0.6, transition: 'opacity .2s',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: done ? '#f0fdf4' : active ? '#eef2ff' : '#f8fafc',
                    border: `2px solid ${done ? '#86efac' : active ? '#a5b4fc' : '#e2e8f0'}`,
                    color: done ? '#16a34a' : active ? accent : muted,
                    display: 'grid', placeItems: 'center', transition: 'all .2s',
                  }}>
                    {done ? <Check size={14} style={{ color: '#16a34a' }} /> : <Icon size={14} />}
                  </div>
                  <div style={{
                    fontSize: '10.5px', fontWeight: active ? '800' : done ? '700' : '600',
                    color: done ? '#16a34a' : active ? ink : muted, textAlign: 'center', lineHeight: 1.3,
                  }}>
                    {s.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── STEP CONTENT ──────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '0', marginBottom: '20px', overflow: 'hidden' }}>

        {/* Step label strip */}
        {(() => {
          const s = STEPS[currentStep - 1];
          const Icon = s.icon;
          return (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
              background: s.bg,
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: '#ffffff', color: s.color,
                display: 'grid', placeItems: 'center', flexShrink: 0,
                border: `1.5px solid ${s.color}33`,
                boxShadow: `0 2px 8px ${s.color}22`,
              }}>
                <Icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10.5px', fontWeight: '700', color: s.color,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    Step {s.number} of 7
                  </span>
                  {stepDone[currentStep - 1] && (
                    <span style={{
                      fontSize: '10.5px', fontWeight: '700',
                      background: '#f0fdf4', color: '#16a34a',
                      border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px',
                    }}>
                      ✓ Completed &amp; Saved
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: ink, marginTop: '1px' }}>
                  {s.title}
                  <span style={{ fontSize: '12.5px', fontWeight: '500', color: muted, marginLeft: '8px' }}>
                    — {s.desc}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Step 1: Add COs (OutcomesManagement) ─────────────────────── */}
        {currentStep === 1 && (
          <div style={{ padding: '0' }}>
            <OutcomesManagement hideFooter />
          </div>
        )}

        {/* ── Step 2: CO Target Setting ─────────────────────────────────── */}
        {currentStep === 2 && (
          <div style={{ padding: '0' }}>
            <COTargetSettingHub hideFooter />
          </div>
        )}

        {/* ── Step 3: CO–PO/PSO Mapping ────────────────────────────────── */}
        {currentStep === 3 && (
          <div style={{ padding: '0' }}>
            <COMappingMatrix hideFooter />
          </div>
        )}

        {/* ── Step 4: Direct Assessment (End-Sem Marks Upload) ─────────── */}
        {currentStep === 4 && (
          <div style={{ padding: '0' }}>
            <EndSemMarksHub hideFooter />
          </div>
        )}

        {/* ── Step 5: Indirect Assessment (Course End Survey) ──────────── */}
        {currentStep === 5 && (
          <div style={{ padding: '0' }}>
            <CourseEndSurveyHub hideFooter />
          </div>
        )}

        {/* ── Step 6: CO Attainment Engine ─────────────────────────────── */}
        {currentStep === 6 && (
          <div style={{ padding: '0' }}>
            <COAttainmentEngine hideFooter />
          </div>
        )}

        {/* ── Step 7: Course ATR ───────────────────────────────────────── */}
        {currentStep === 7 && (
          <div style={{ padding: '0' }}>
            <CourseATR hideFooter hideHeader />
          </div>
        )}

      </div>{/* end step content */}

      {/* ── FOOTER NAV (SAVE & NEXT) ────────────────────────────────────────── */}
      <div style={{
        ...surface, padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {STEPS.map((s) => (
              <div
                key={s.number}
                onClick={() => handleStepSelect(s.number)}
                style={{
                  width: currentStep === s.number ? '18px' : '6px',
                  height: '6px', borderRadius: '3px',
                  background: currentStep >= s.number ? accent : '#e2e8f0',
                  transition: 'all .2s', cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={handleSaveAndNext}
              style={{
                height: '40px', padding: '0 22px', fontSize: '13.5px', fontWeight: '800',
                background: '#2563eb', color: '#fff', border: 'none',
                borderRadius: '8px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
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
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', border: 'none',
                borderRadius: '8px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              }}
            >
              <Check size={15} /> Save &amp; Finish Attainment
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
