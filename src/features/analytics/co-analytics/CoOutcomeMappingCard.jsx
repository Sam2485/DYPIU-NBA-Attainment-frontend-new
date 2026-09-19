import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Network, ArrowRight } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

export default function CoOutcomeMappingCard({
  coCode,
  poMappings = {},
  psoMappings = {},
  programmeBatchId,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';

  const poEntries = Object.entries(poMappings || {}).filter(([_, lvl]) => lvl > 0);
  const psoEntries = Object.entries(psoMappings || {}).filter(([_, lvl]) => lvl > 0);

  const hasMappings = poEntries.length > 0 || psoEntries.length > 0;

  const handleNavigateToOutcome = (code, type) => {
    navigate(`${basePath}/analytics/batch/${programmeBatchId}/direct/${type}/${code}`);
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
          This Course Outcome has no active mappings to POs or PSOs.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* PO Mappings */}
          {poEntries.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: PO_COLOR, marginBottom: 8, textTransform: 'uppercase' }}>
                Programme Outcomes (POs)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {poEntries.map(([code, level]) => (
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
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      color: '#0369a1',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e0f2fe';
                      e.currentTarget.style.borderColor = '#0284c7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f0f9ff';
                      e.currentTarget.style.borderColor = '#bae6fd';
                    }}
                  >
                    <span>{code}</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: '#0284c7',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      L{level}
                    </span>
                    <ArrowRight size={11} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PSO Mappings */}
          {psoEntries.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: PSO_COLOR, marginBottom: 8, textTransform: 'uppercase' }}>
                Programme Specific Outcomes (PSOs)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {psoEntries.map(([code, level]) => (
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
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#dcfce7';
                      e.currentTarget.style.borderColor = '#16a34a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#bbf7d0';
                    }}
                  >
                    <span>{code}</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: '#16a34a',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      L{level}
                    </span>
                    <ArrowRight size={11} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
