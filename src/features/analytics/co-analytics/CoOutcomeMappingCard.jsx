import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Network, ArrowRight } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

function sortOutcomeEntries(entries = []) {
  return [...entries].sort(([codeA], [codeB]) => {
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

export default function CoOutcomeMappingCard({
  coCode,
  poMappings = {},
  psoMappings = {},
  programmeBatchId,
  outcomeScope = 'ALL', // 'SELECTED' | 'ALL' | 'PO' | 'PSO'
  selectedOutcomeCode = null,
  onSelectOutcome,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';

  const rawPoEntries = Object.entries(poMappings || {}).filter(([_, lvl]) => lvl > 0);
  const rawPsoEntries = Object.entries(psoMappings || {}).filter(([_, lvl]) => lvl > 0);

  const poEntries = sortOutcomeEntries(rawPoEntries);
  const psoEntries = sortOutcomeEntries(rawPsoEntries);

  const showPo = outcomeScope === 'ALL' || outcomeScope === 'PO' || (outcomeScope === 'SELECTED' && (!selectedOutcomeCode || selectedOutcomeCode.startsWith('PO')));
  const showPso = outcomeScope === 'ALL' || outcomeScope === 'PSO' || (outcomeScope === 'SELECTED' && (!selectedOutcomeCode || selectedOutcomeCode.startsWith('PSO')));

  const hasMappings = (showPo && poEntries.length > 0) || (showPso && psoEntries.length > 0);

  const handleNavigateToOutcome = (code, type) => {
    if (onSelectOutcome) {
      onSelectOutcome(code, type);
    } else {
      navigate(`${basePath}/analytics/batch/${programmeBatchId}/direct/${type}/${code}`);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Network size={18} color="#7c3aed" />
          <h3
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            {coCode} Programme Outcome Correlation Matrix
          </h3>
        </div>

        <div style={{ fontSize: 11.5, color: '#64748b' }}>
          Correlation Scale: <strong>1</strong> (Low) • <strong>2</strong> (Medium) • <strong>3</strong> (High)
        </div>
      </div>

      {!hasMappings ? (
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          This Course Outcome has no active mappings matching the current filter scope.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* PO Mappings */}
          {showPo && poEntries.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: PO_COLOR, marginBottom: 8, textTransform: 'uppercase' }}>
                Programme Outcomes (POs)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {poEntries.map(([code, level]) => {
                  const isSelected = selectedOutcomeCode === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleNavigateToOutcome(code, 'PO')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: isSelected ? '#0284c7' : '#f0f9ff',
                        border: `1px solid ${isSelected ? '#0284c7' : '#bae6fd'}`,
                        color: isSelected ? '#ffffff' : '#0369a1',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#e0f2fe';
                          e.currentTarget.style.borderColor = '#0284c7';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#f0f9ff';
                          e.currentTarget.style.borderColor = '#bae6fd';
                        }
                      }}
                    >
                      <span>{code}</span>
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: isSelected ? '#ffffff' : '#0284c7',
                          color: isSelected ? '#0284c7' : '#ffffff',
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        L{level}
                      </span>
                      <ArrowRight size={11} color={isSelected ? '#ffffff' : '#0369a1'} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PSO Mappings */}
          {showPso && psoEntries.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: PSO_COLOR, marginBottom: 8, textTransform: 'uppercase' }}>
                Programme Specific Outcomes (PSOs)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {psoEntries.map(([code, level]) => {
                  const isSelected = selectedOutcomeCode === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleNavigateToOutcome(code, 'PSO')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: isSelected ? '#16a34a' : '#f0fdf4',
                        border: `1px solid ${isSelected ? '#16a34a' : '#bbf7d0'}`,
                        color: isSelected ? '#ffffff' : '#15803d',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 8px rgba(22, 163, 74, 0.25)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#dcfce7';
                          e.currentTarget.style.borderColor = '#16a34a';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#f0fdf4';
                          e.currentTarget.style.borderColor = '#bbf7d0';
                        }
                      }}
                    >
                      <span>{code}</span>
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: isSelected ? '#ffffff' : '#16a34a',
                          color: isSelected ? '#16a34a' : '#ffffff',
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        L{level}
                      </span>
                      <ArrowRight size={11} color={isSelected ? '#ffffff' : '#15803d'} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
