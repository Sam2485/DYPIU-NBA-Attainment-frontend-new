import { useNavigate, useLocation } from 'react-router-dom';
import { useAcademic } from '../../context/AcademicContext';

/**
 * SectionSaveFooter — matches Faculty Appraisal Form 2.0 save footer:
 *  • EXTREME LEFT:  "Previous" button
 *  • CENTER:        Status text
 *  • EXTREME RIGHT: "Save as Draft" + "Save & Next →" / "Finish Attainment"
 */
export default function SectionSaveFooter({
  label = 'Section',
  prevPath,
  nextPath,
  nextLabel = 'Save & Next',
  onSave,
  onFinish,
  saving = false,
  saved = false,
  locked = false,
  hidden = false,
}) {
  if (hidden) return null;
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCourse, markWorkflowStepComplete = () => {} } = useAcademic();

  const handleSaveDraft = () => {
    if (onSave) onSave(false);
  };

  const handleSaveNext = () => {
    markWorkflowStepComplete(selectedCourse?.id, location.pathname);
    if (onFinish) {
      onFinish();
      return;
    }
    if (onSave && !saved) onSave(true);
    if (nextPath) navigate(nextPath);
  };

  const handlePrevious = () => {
    if (prevPath) navigate(prevPath);
  };

  const isFinish = nextLabel.toLowerCase().includes('finish');

  return (
    <div
      style={{
        marginTop: 22,
        paddingTop: 18,
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        width: '100%',
        boxSizing: 'border-box',
        flexWrap: 'wrap',
      }}
    >
      {/* ── EXTREME LEFT: Previous Button ─────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {prevPath ? (
          <button
            type="button"
            onClick={handlePrevious}
            disabled={saving || locked}
            style={{
              minHeight: 40,
              padding: '9px 18px',
              background: '#fff',
              color: '#475569',
              border: '1.5px solid #cbd5e1',
              borderRadius: 10,
              cursor: saving || locked ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: 13,
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: saving || locked ? 0.6 : 1,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving && !locked) e.currentTarget.style.background = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            {/* left arrow */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Previous
          </button>
        ) : (
          <div style={{ width: 1 }} />
        )}
      </div>

      {/* ── CENTER: Status Text ───────────────────────────── */}
      <div
        style={{
          color: locked ? '#9ca3af' : saved ? '#047857' : '#64748b',
          fontSize: 13.5,
          fontWeight: 700,
          textAlign: 'center',
        }}
      >
        {locked
          ? 'Section locked.'
          : saved
          ? `${label} saved successfully.`
          : isFinish
          ? 'Complete and finalize course attainment.'
          : `Save ${label} and proceed.`}
      </div>

      {/* ── EXTREME RIGHT: Save as Draft + Save & Next / Finish Attainment ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Save as Draft — blue outline */}
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={saving || locked || saved}
          style={{
            minHeight: 40,
            padding: '10px 20px',
            background: '#fff',
            color: locked || saved ? '#9ca3af' : '#2563eb',
            border: `1.5px solid ${locked || saved ? '#d1d5db' : '#2563eb'}`,
            borderRadius: 10,
            cursor: saving || locked || saved ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: 14,
            fontFamily: 'inherit',
            opacity: saving ? 0.75 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!saving && !locked && !saved) e.currentTarget.style.background = '#eff6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          {/* save icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
            <path d="M17 21v-8H7v8" />
            <path d="M7 3v5h8" />
          </svg>
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save as Draft'}
        </button>

        {/* Save & Next / Finish Attainment — solid blue/green gradient button with shadow */}
        {(nextPath || onFinish) && (
          <button
            type="button"
            onClick={handleSaveNext}
            disabled={saving || locked}
            style={{
              minHeight: 40,
              padding: '10px 24px',
              background: locked
                ? '#9ca3af'
                : isFinish
                ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              cursor: saving || locked ? 'not-allowed' : 'pointer',
              fontWeight: 800,
              fontSize: 14,
              fontFamily: 'inherit',
              opacity: saving ? 0.75 : 1,
              boxShadow: locked
                ? 'none'
                : isFinish
                ? '0 10px 20px rgba(16,185,129,0.28)'
                : '0 10px 20px rgba(37,99,235,0.22)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving && !locked) {
                if (isFinish) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #047857 0%, #059669 100%)';
                  e.currentTarget.style.boxShadow = '0 14px 28px rgba(16,185,129,0.36)';
                } else {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.boxShadow = '0 14px 28px rgba(37,99,235,0.30)';
                }
              }
            }}
            onMouseLeave={(e) => {
              if (isFinish) {
                e.currentTarget.style.background = locked ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
                e.currentTarget.style.boxShadow = locked ? 'none' : '0 10px 20px rgba(16,185,129,0.28)';
              } else {
                e.currentTarget.style.background = locked ? '#9ca3af' : '#2563eb';
                e.currentTarget.style.boxShadow = locked ? 'none' : '0 10px 20px rgba(37,99,235,0.22)';
              }
            }}
          >
            {saving ? 'Saving...' : nextLabel}
            {!saving && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {isFinish ? (
                  <path d="M20 6 9 17l-5-5" />
                ) : (
                  <path d="m9 18 6-6-6-6" />
                )}
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
