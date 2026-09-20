import React from 'react';
import { Calendar, Users, User, CheckCircle2, XCircle, Sparkles, ArrowRight } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getTypeBadgeStyle(type) {
  const t = (type || '').toUpperCase();
  switch (t) {
    case 'EXIT_SURVEY':
      return {
        background: '#ecfdf5',
        border: '1px solid #a7f3d0',
        color: '#047857',
        label: 'Programme End Exit Survey',
        isExitSurvey: true,
      };
    case 'SURVEY':
      return {
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#1d4ed8',
        label: 'Stakeholder Survey',
      };
    case 'CO_CURRICULAR':
      return {
        background: '#fffbeb',
        border: '1px solid #fde68a',
        color: '#b45309',
        label: 'Co-Curricular Activity',
      };
    case 'EVENT':
    default:
      return {
        background: '#f5f3ff',
        border: '1px solid #ddd6fe',
        color: '#6d28d9',
        label: 'Academic / Technical Event',
      };
  }
}

export default function OutcomeIndirectTimeline({
  evidence = [],
  outcomeCode,
  outcomeType,
  onViewRecord,
}) {
  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: 22,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 4px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            Programme Indirect Evidence Timeline
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Chronological sequence of programme events, stakeholder surveys, and the culminating exit survey evaluating {outcomeCode}
          </p>
        </div>
        {evidence.length > 3 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#475569',
              padding: '4px 10px',
              borderRadius: 20,
            }}
          >
            Showing all {evidence.length} events • Scroll to explore
          </span>
        )}
      </div>

      {/* Scrollable Timeline container restricted to show ~3 events at a time */}
      <div
        style={{
          maxHeight: '410px',
          overflowY: 'auto',
          paddingRight: 6,
          paddingLeft: 2,
          paddingTop: 4,
          paddingBottom: 4,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          {/* Left vertical timeline tracking line */}
          <div
            style={{
              position: 'absolute',
              left: 20,
              top: 14,
              bottom: 14,
              width: 2,
              background: '#e2e8f0',
              zIndex: 0,
            }}
          />

          {evidence.map((item, index) => {
            const typeInfo = getTypeBadgeStyle(item.type);
            const isEvaluated = Boolean(item.outcomeEvaluated);
            const valStr = isEvaluated && item.outcomeValue != null
              ? Number(item.outcomeValue).toFixed(2)
              : '—';

            return (
              <div
                key={item.assessmentId || `ev-${index}`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  zIndex: 1,
                }}
              >
                {/* Step indicator node */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: typeInfo.isExitSurvey ? '#10b981' : isEvaluated ? themeColor : '#cbd5e1',
                    border: '3px solid #ffffff',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#ffffff',
                  }}
                >
                  {typeInfo.isExitSurvey ? (
                    <Sparkles size={18} />
                  ) : isEvaluated ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                </div>

                {/* Evidence Card Container - Clickable to open record */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onViewRecord && onViewRecord(item)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && onViewRecord) {
                      e.preventDefault();
                      onViewRecord(item);
                    }
                  }}
                  style={{
                    flex: 1,
                    background: typeInfo.isExitSurvey ? '#f0fdf4' : '#ffffff',
                    border: `1px solid ${typeInfo.isExitSurvey ? '#a7f3d0' : '#e2e8f0'}`,
                    borderRadius: 12,
                    padding: 16,
                    boxShadow: typeInfo.isExitSurvey
                      ? '0 3px 10px rgba(16, 185, 129, 0.08)'
                      : '0 1px 3px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = typeInfo.isExitSurvey ? '#34d399' : themeColor;
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = typeInfo.isExitSurvey ? '#a7f3d0' : '#e2e8f0';
                    e.currentTarget.style.boxShadow = typeInfo.isExitSurvey
                      ? '0 3px 10px rgba(16, 185, 129, 0.08)'
                      : '0 1px 3px rgba(15, 23, 42, 0.03)';
                    e.currentTarget.style.transform = 'none';
                  }}
                  title={`Click to view record across all outcomes`}
                >
                {/* Top Row: Type Badge, Culminating Flag, and Date */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        background: typeInfo.background,
                        border: typeInfo.border,
                        color: typeInfo.color,
                      }}
                    >
                      {typeInfo.label}
                    </span>

                    {typeInfo.isExitSurvey && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 10.5,
                          fontWeight: 700,
                          background: '#047857',
                          color: '#ffffff',
                          letterSpacing: '0.02em',
                        }}
                      >
                        Culminating Milestone
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                    <Calendar size={13} />
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>

                {/* Middle Row: Name, Description, and Evaluated Outcome Value */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <h4
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {item.name}
                    </h4>
                    {item.description && (
                      <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Outcome Evaluation Score Display */}
                  <div
                    style={{
                      background: isEvaluated ? (isPo ? '#f0f9ff' : '#f0fdf4') : '#f8fafc',
                      border: `1px solid ${isEvaluated ? (isPo ? '#bae6fd' : '#bbf7d0') : '#e2e8f0'}`,
                      borderRadius: 10,
                      padding: '8px 16px',
                      textAlign: 'right',
                      minWidth: 140,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: isEvaluated ? themeColor : '#94a3b8' }}>
                      {outcomeCode} Evaluated
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: isEvaluated ? '#0f172a' : '#94a3b8',
                        lineHeight: 1.1,
                        marginTop: 2,
                      }}
                    >
                      {valStr}
                      {isEvaluated && (
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', marginLeft: 3 }}>
                          / 3.00
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: isEvaluated ? '#16a34a' : '#64748b', marginTop: 2 }}>
                      {isEvaluated ? 'Participating' : 'Not Evaluated'}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Metadata (Response Count, Created By, and View Record prompt) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    fontSize: 11.5,
                    color: '#64748b',
                    paddingTop: 8,
                    borderTop: `1px solid ${typeInfo.isExitSurvey ? '#d1fae5' : '#f1f5f9'}`,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {item.responseCount != null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={13} color="#475569" />
                        <strong style={{ color: '#0f172a' }}>{item.responseCount}</strong> responses
                      </div>
                    )}

                    {item.createdBy && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={13} color="#94a3b8" />
                        <span>By: {item.createdBy}</span>
                      </div>
                    )}
                  </div>

                  {/* View Record link */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      color: typeInfo.isExitSurvey ? '#047857' : themeColor,
                      fontWeight: 700,
                      fontSize: 11.5,
                      marginLeft: 'auto',
                    }}
                  >
                    <span>View Record</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
