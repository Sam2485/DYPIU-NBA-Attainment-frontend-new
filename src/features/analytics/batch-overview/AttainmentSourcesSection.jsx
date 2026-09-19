import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, ArrowRight, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

function sortOutcomesAscending(outcomes = []) {
  return [...outcomes].sort((a, b) => {
    const codeA = a.poCode || a.psoCode || '';
    const codeB = b.poCode || b.psoCode || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

export default function AttainmentSourcesSection({
  poHealth = [],
  psoHealth = [],
  directIndirect = {},
  selectedOutcomeCode = '',
  selectedOutcomeType = 'PO',
  onSelectOutcome = () => {},
  programmeBatchId = '',
}) {
  const navigate = useNavigate();

  const sortedPo = sortOutcomesAscending(poHealth);
  const sortedPso = sortOutcomesAscending(psoHealth);

  // Configured programme weights (authoritative backend metadata)
  const directWeight = directIndirect.programmeDirectWeight != null
    ? (Number(directIndirect.programmeDirectWeight) * 100).toFixed(0)
    : '80';
  const indirectWeight = directIndirect.programmeIndirectWeight != null
    ? (Number(directIndirect.programmeIndirectWeight) * 100).toFixed(0)
    : '20';

  // Find the authoritative data object for the currently selected outcome
  const activeList = selectedOutcomeType === 'PSO' ? sortedPso : sortedPo;
  let selectedItem = activeList.find(
    (item) => (item.poCode || item.psoCode) === selectedOutcomeCode
  );

  // Fallback if not found in active list
  if (!selectedItem) {
    selectedItem = sortedPo[0] || sortedPso[0] || null;
  }

  const currentCode = selectedItem
    ? selectedItem.poCode || selectedItem.psoCode || selectedOutcomeCode
    : selectedOutcomeCode;
  const isPo = selectedItem ? Boolean(selectedItem.poCode) : selectedOutcomeType === 'PO';
  const statement = selectedItem?.poStatement || selectedItem?.psoStatement || '';
  const isTargetMet = selectedItem ? Boolean(selectedItem.targetMet) : null;
  const overallAttainment = selectedItem?.attainment != null ? Number(selectedItem.attainment).toFixed(2) : '—';
  const configuredTarget = selectedItem?.target != null ? Number(selectedItem.target).toFixed(2) : '—';

  // Authoritative outcome-specific direct and indirect attainment values
  const directAttainmentVal = selectedItem?.directAttainment != null
    ? Number(selectedItem.directAttainment).toFixed(2)
    : '—';
  const indirectAttainmentVal = selectedItem?.indirectAttainment != null
    ? Number(selectedItem.indirectAttainment).toFixed(2)
    : '—';

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: 22,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 28,
      }}
    >
      {/* Section Header */}
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 4px 0',
          }}
        >
          PROGRAMME ATTAINMENT SOURCES
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
          Select an outcome to inspect its specific Programme Direct and Programme Indirect evaluation branches
        </p>
      </div>

      {/* Outcome Dropdown Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 16,
          padding: '12px 16px',
          background: '#f8fafc',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <label
            htmlFor="outcome-dropdown-selector"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0f172a',
              whiteSpace: 'nowrap',
            }}
          >
            Select Outcome:
          </label>
          <div style={{ position: 'relative', minWidth: 260 }}>
            <select
              id="outcome-dropdown-selector"
              value={`${isPo ? 'PO' : 'PSO'}:${currentCode}`}
              onChange={(e) => {
                const [type, code] = e.target.value.split(':');
                if (code && type) {
                  onSelectOutcome(code, type);
                }
              }}
              style={{
                width: '100%',
                padding: '8px 32px 8px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
              }}
            >
              {sortedPo.length > 0 && (
                <optgroup label="Programme Outcomes (PO)">
                  {sortedPo.map((item) => (
                    <option key={`PO:${item.poCode}`} value={`PO:${item.poCode}`}>
                      {item.poCode} {item.attainment != null ? `— Attainment: ${Number(item.attainment).toFixed(2)}` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              {sortedPso.length > 0 && (
                <optgroup label="Program Specific Outcomes (PSO)">
                  {sortedPso.map((item) => (
                    <option key={`PSO:${item.psoCode}`} value={`PSO:${item.psoCode}`}>
                      {item.psoCode} {item.attainment != null ? `— Attainment: ${Number(item.attainment).toFixed(2)}` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <ChevronDown
              size={16}
              color="#64748b"
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          <span
            style={{
              padding: '3px 9px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 800,
              background: isPo ? '#f0f9ff' : '#f0fdf4',
              color: isPo ? PO_COLOR : PSO_COLOR,
              border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
            }}
          >
            {isPo ? 'PO' : 'PSO'} • {currentCode}
          </span>
        </div>

        {/* Selected Outcome Statement / Summary */}
        {statement ? (
          <div
            style={{
              fontSize: 12,
              color: '#475569',
              maxWidth: 420,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={statement}
          >
            {statement}
          </div>
        ) : null}

        {/* Overall Outcome Status */}
        {selectedItem && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
            <span style={{ color: '#64748b' }}>Overall:</span>
            <strong style={{ color: '#0f172a' }}>{overallAttainment}</strong>
            <span style={{ color: '#94a3b8' }}>/ {configuredTarget}</span>
            {isTargetMet ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  color: '#16a34a',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={13} />
                Target Met
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  color: '#dc2626',
                  fontWeight: 700,
                }}
              >
                <AlertCircle size={13} />
                Below Target
              </span>
            )}
          </div>
        )}
      </div>

      {/* Two Direct vs Indirect Attainment Cards for the Selected Outcome */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 18,
        }}
      >
        {/* CARD 1: PROGRAMME DIRECT */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={17} color={PO_COLOR} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                    PROGRAMME DIRECT
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Course Attainment for {currentCode}
                  </div>
                </div>
              </div>

              {/* Weight Metadata Pill (clearly separated from attainment score) */}
              <div
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  color: '#0369a1',
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                Weight: {directWeight}%
              </div>
            </div>

            {/* Authoritative Outcome-Specific Direct Attainment Score */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                Direct Attainment ({currentCode})
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: 4 }}>
                {directAttainmentVal}
                <span style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginLeft: 4 }}>
                  / 3.00
                </span>
              </div>
            </div>

            <p style={{ margin: '0 0 18px', fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
              Aggregated from course-level continuous assessments, lab performances, and examinations mapped to {currentCode} across programme semesters.
            </p>
          </div>

          {/* Drill-down CTA for Selected Outcome */}
          <button
            type="button"
            onClick={() =>
              navigate(
                `/analytics/batch/${programmeBatchId}/direct/${isPo ? 'PO' : 'PSO'}/${currentCode}`
              )
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0f9ff';
              e.currentTarget.style.borderColor = PO_COLOR;
              e.currentTarget.style.color = PO_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#0f172a';
            }}
          >
            <span>Explore Direct ({currentCode})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* CARD 2: PROGRAMME INDIRECT */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={17} color={PSO_COLOR} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                    PROGRAMME INDIRECT
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Events & Surveys for {currentCode}
                  </div>
                </div>
              </div>

              {/* Weight Metadata Pill (clearly separated from attainment score) */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                Weight: {indirectWeight}%
              </div>
            </div>

            {/* Authoritative Outcome-Specific Indirect Attainment Score */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                Indirect Attainment ({currentCode})
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: 4 }}>
                {indirectAttainmentVal}
                <span style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginLeft: 4 }}>
                  / 3.00
                </span>
              </div>
            </div>

            <p style={{ margin: '0 0 18px', fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
              Derived from programme-level co-curricular events, technical activities, stakeholder evaluations, and graduating batch exit surveys for {currentCode}.
            </p>
          </div>

          {/* Drill-down CTA for Selected Outcome */}
          <button
            type="button"
            onClick={() =>
              navigate(
                `/analytics/batch/${programmeBatchId}/indirect/${isPo ? 'PO' : 'PSO'}/${currentCode}`
              )
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0fdf4';
              e.currentTarget.style.borderColor = PSO_COLOR;
              e.currentTarget.style.color = PSO_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#0f172a';
            }}
          >
            <span>Explore Indirect ({currentCode})</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
