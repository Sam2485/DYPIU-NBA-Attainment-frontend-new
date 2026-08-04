import { useNavigate } from 'react-router-dom';

/**
 * SectionSaveFooter — matches Faculty Appraisal Form 2.0 save footer:
 *  • Status text on the left (green if saved)
 *  • "Save as Draft"  — white bg, blue border + text
 *  • "Save & Next →" — solid blue, white text, shadow
 */
export default function SectionSaveFooter({
  label = 'Section',
  prevPath,
  nextPath,
  onSave,
  saving = false,
  saved = false,
  locked = false,
}) {
  const navigate = useNavigate();

  const handleSaveDraft = () => {
    if (onSave) onSave(false);
  };

  const handleSaveNext = () => {
    if (onSave) onSave(true);
    if (nextPath) navigate(nextPath);
  };

  const handlePrevious = () => {
    if (prevPath) navigate(prevPath);
  };

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
        flexWrap: 'wrap',
      }}
    >
      {/* ── Left: status text + optional "Previous" ─────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {prevPath && (
          <button
            type="button"
            onClick={handlePrevious}
            disabled={saving || locked}
            style={{
              minHeight: 40,
              padding: '9px 16px',
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
            }}
          >
            {/* left arrow */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Previous
          </button>
        )}

        <span
          style={{
            color: locked ? '#9ca3af' : saved ? '#047857' : '#6b7280',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {locked
            ? 'Section locked.'
            : saved
            ? `${label} saved successfully.`
            : `Save ${label} and proceed.`}
        </span>
      </div>

      {/* ── Right: Save Draft + Save & Next ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Save as Draft — blue outline */}
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={saving || locked}
          style={{
            minHeight: 40,
            padding: '10px 20px',
            background: '#fff',
            color: locked ? '#9ca3af' : '#2563eb',
            border: `1.5px solid ${locked ? '#d1d5db' : '#2563eb'}`,
            borderRadius: 10,
            cursor: saving || locked ? 'not-allowed' : 'pointer',
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
            if (!saving && !locked) e.currentTarget.style.background = '#eff6ff';
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
          {saving ? 'Saving...' : 'Save as Draft'}
        </button>

        {/* Save & Next — solid blue with shadow */}
        {nextPath && (
          <button
            type="button"
            onClick={handleSaveNext}
            disabled={saving || locked}
            style={{
              minHeight: 40,
              padding: '10px 24px',
              background: locked ? '#9ca3af' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              cursor: saving || locked ? 'not-allowed' : 'pointer',
              fontWeight: 800,
              fontSize: 14,
              fontFamily: 'inherit',
              opacity: saving ? 0.75 : 1,
              boxShadow: locked ? 'none' : '0 10px 20px rgba(37,99,235,0.22)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving && !locked) {
                e.currentTarget.style.background = '#1d4ed8';
                e.currentTarget.style.boxShadow = '0 14px 28px rgba(37,99,235,0.30)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = locked ? '#9ca3af' : '#2563eb';
              e.currentTarget.style.boxShadow = locked ? 'none' : '0 10px 20px rgba(37,99,235,0.22)';
            }}
          >
            {saving ? 'Saving...' : 'Save & Next'}
            {!saving && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
