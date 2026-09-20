import React, { useState } from 'react';
import { Search, Eye, CheckCircle2, XCircle, Users } from 'lucide-react';

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

function getTypeBadge(type) {
  const t = (type || '').toUpperCase();
  switch (t) {
    case 'EXIT_SURVEY':
      return {
        label: 'Exit Survey',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        color: '#047857',
        isExit: true,
      };
    case 'SURVEY':
      return {
        label: 'Survey',
        bg: '#eff6ff',
        border: '#bfdbfe',
        color: '#1d4ed8',
      };
    case 'CO_CURRICULAR':
      return {
        label: 'Co-Curricular',
        bg: '#fffbeb',
        border: '#fde68a',
        color: '#b45309',
      };
    case 'EVENT':
    default:
      return {
        label: 'Event',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        color: '#6d28d9',
      };
  }
}

export default function OutcomeIndirectEvidenceTable({
  evidence = [],
  outcomeCode,
  outcomeType,
  totalEvidenceCount = 0,
  participatingEvidenceCount = 0,
  onViewRecord,
}) {
  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'EVALUATED'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = React.useMemo(() => {
    return (evidence || []).filter((item) => {
      if (filterMode === 'EVALUATED' && !item.outcomeEvaluated) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = (item.name || '').toLowerCase().includes(query);
        const matchType = (item.type || '').toLowerCase().includes(query);
        const matchCreated = (item.createdBy || '').toLowerCase().includes(query);
        const matchDesc = (item.description || '').toLowerCase().includes(query);
        return matchName || matchType || matchCreated || matchDesc;
      }
      return true;
    });
  }, [evidence, filterMode, searchTerm]);

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
      {/* Header & Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 3px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            Indirect Evidence Register
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Detailed catalog of indirect assessments and evaluations for {outcomeCode}
          </p>
        </div>

        {/* Filter buttons & search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Toggle buttons */}
          <div
            style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              padding: 3,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => setFilterMode('ALL')}
              style={{
                border: 'none',
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: filterMode === 'ALL' ? '#ffffff' : 'transparent',
                color: filterMode === 'ALL' ? '#0f172a' : '#64748b',
                boxShadow: filterMode === 'ALL' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              All Evidence ({totalEvidenceCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('EVALUATED')}
              style={{
                border: 'none',
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: filterMode === 'EVALUATED' ? '#ffffff' : 'transparent',
                color: filterMode === 'EVALUATED' ? themeColor : '#64748b',
                boxShadow: filterMode === 'EVALUATED' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Evaluated Only ({participatingEvidenceCount})
            </button>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: 200 }}>
            <Search
              size={14}
              color="#94a3b8"
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              type="text"
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* Table container */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12.5,
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>
                Evidence Name
              </th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>
                Type
              </th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>
                Date
              </th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>
                Evaluated
              </th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                Outcome Value
              </th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                Responses
              </th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>
                Created By
              </th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: '30px 16px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: 13,
                  }}
                >
                  No evidence items found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const badge = getTypeBadge(item.type);
                const isEvaluated = Boolean(item.outcomeEvaluated);

                return (
                  <tr
                    key={item.assessmentId || `row-${index}`}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: badge.isExit
                        ? '#fafffd'
                        : isEvaluated
                        ? '#ffffff'
                        : '#fafafa',
                    }}
                  >
                    {/* Name */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                        {badge.isExit && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: 3,
                              background: '#047857',
                              color: '#ffffff',
                            }}
                          >
                            Exit Survey
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: '#64748b',
                            marginTop: 2,
                            maxWidth: 320,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={item.description}
                        >
                          {item.description}
                        </div>
                      )}
                    </td>

                    {/* Type Badge */}
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '12px 14px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {formatDate(item.date)}
                    </td>

                    {/* Evaluated Status */}
                    <td style={{ padding: '12px 14px' }}>
                      {isEvaluated ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#16a34a',
                            fontWeight: 700,
                            fontSize: 11.5,
                          }}
                        >
                          <CheckCircle2 size={14} />
                          Yes
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#94a3b8',
                            fontWeight: 600,
                            fontSize: 11.5,
                          }}
                        >
                          <XCircle size={14} />
                          Not Evaluated
                        </span>
                      )}
                    </td>

                    {/* Outcome Value: NEVER 0.00 if not evaluated */}
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {isEvaluated && item.outcomeValue != null ? (
                        <div>
                          <strong style={{ color: themeColor, fontSize: 13.5 }}>
                            {Number(item.outcomeValue).toFixed(2)}
                          </strong>
                          <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 2 }}>
                            / 3.00
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>—</span>
                      )}
                    </td>

                    {/* Responses */}
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#475569' }}>
                      {item.responseCount != null ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontWeight: 700,
                            color: '#0f172a',
                          }}
                        >
                          <Users size={12} color="#64748b" />
                          {item.responseCount}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>

                    {/* Created By */}
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>
                      {item.createdBy || '—'}
                    </td>

                    {/* Action: View Record */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => onViewRecord && onViewRecord(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '5px 12px',
                          borderRadius: 6,
                          border: `1px solid ${themeColor}40`,
                          background: '#ffffff',
                          color: themeColor,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${themeColor}12`;
                          e.currentTarget.style.borderColor = themeColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#ffffff';
                          e.currentTarget.style.borderColor = `${themeColor}40`;
                        }}
                        title={`View complete record across all outcomes`}
                      >
                        <Eye size={13} />
                        <span>View Record</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
