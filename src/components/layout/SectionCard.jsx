/**
 * SectionCard — matches the Faculty Appraisal Form 2.0 section card design.
 *
 * Props:
 *   title      — section title (e.g. "CO Attainment — Direct Assessment")
 *   subtitle   — optional muted subtext below title
 *   accent     — hex color for icon bg & title (default indigo #4f46e5)
 *   scoreBadge — optional JSX/string shown in the top-right badge slot
 *   children   — card body content
 */
export default function SectionCard({
  title,
  subtitle,
  accent = '#4f46e5',
  scoreBadge,
  children,
}) {
  // accent with opacity channels for bg & border
  const accentBg  = `${accent}1A`; // ~10% opacity
  const accentBdr = `${accent}2A`; // ~16% opacity

  return (
    <div
      className="nba-section-card"
      style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        marginBottom: 20,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* ── Card header ───────────────────────────────────────────── */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: '#fbfcfd',
        }}
      >
        {/* icon + title block */}
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* accent icon box */}
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: accentBg,
              color: accent,
              border: `1px solid ${accentBdr}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {/* generic section icon — same as appraisal */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3 3 7l9 4 9-4-9-4Z" />
              <path d="M5 10v5c2 2 12 2 14 0v-5" />
              <path d="M12 11v8" />
            </svg>
          </span>

          {/* text */}
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: accent,
                letterSpacing: 0,
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  color: '#64748b',
                  fontSize: 12.5,
                  marginTop: 4,
                  lineHeight: 1.45,
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* optional score badge */}
        {scoreBadge && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '6px 14px',
            }}
          >
            <span style={{ color: '#475569', fontSize: 12, fontWeight: 700 }}>Score</span>
            <span
              style={{
                background: '#eef2ff',
                color: '#4f46e5',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {scoreBadge}
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ─────────────────────────────────────────────── */}
      <div
        style={{
          padding: '20px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {children}
      </div>
    </div>
  );
}
