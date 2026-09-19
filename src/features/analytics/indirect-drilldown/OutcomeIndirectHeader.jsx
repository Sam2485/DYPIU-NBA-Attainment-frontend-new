import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

export default function OutcomeIndirectHeader({
  programmeBatchId,
  batchName,
  programmeName,
  schoolName,
  departmentName,
  coordinatorName,
  outcomeCode,
  outcomeType,
  outcomeStatement,
  availableOutcomes = [],
  onSelectOutcome,
}) {
  const navigate = useNavigate();
  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  // Normalise dropdown options: ensure current outcome exists even if list is loading
  const options = React.useMemo(() => {
    const list = [...availableOutcomes];
    const exists = list.some(
      (o) => (o.code || o.poCode || o.psoCode) === outcomeCode
    );
    if (!exists && outcomeCode) {
      list.unshift({ code: outcomeCode, type: outcomeType });
    }
    return list;
  }, [availableOutcomes, outcomeCode, outcomeType]);

  const sortedPo = options.filter((o) => (o.type || 'PO') === 'PO');
  const sortedPso = options.filter((o) => (o.type || 'PO') === 'PSO');

  const handleDropdownChange = (e) => {
    const selectedVal = e.target.value;
    if (!selectedVal) return;
    const [type, code] = selectedVal.split(':');
    if (code && onSelectOutcome) {
      onSelectOutcome(code, type || 'PO');
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
      {/* 1. Compact Breadcrumb & Back Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate(`/analytics/batch/${programmeBatchId}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <ArrowLeft size={14} />
            <span>Batch Analytics</span>
          </button>

          <span
            style={{
              fontSize: 12,
              color: '#94a3b8',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>/</span>
            <span>Analytics</span>
            <span>/</span>
            <span>Batch ({batchName || '...'})</span>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: 700 }}>Programme Indirect</span>
          </span>
        </div>

        {/* Compact Metadata Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {schoolName && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: '3px 9px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                color: '#475569',
              }}
            >
              {schoolName}
            </span>
          )}
          {departmentName && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: '3px 9px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                color: '#475569',
              }}
            >
              {departmentName}
            </span>
          )}
          {programmeName && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: '3px 9px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                color: '#0f172a',
              }}
            >
              {programmeName}
            </span>
          )}
          {batchName && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: '3px 9px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                color: '#0f172a',
              }}
            >
              Batch: {batchName}
            </span>
          )}
          {coordinatorName && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: '3px 9px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                color: '#64748b',
              }}
            >
              Coord: {coordinatorName}
            </span>
          )}
        </div>
      </div>

      {/* 2. Main Title and Subtitle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Programme Indirect Attainment
            </h1>
            <span
              style={{
                padding: '2px 9px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 800,
                background: isPo ? '#f0f9ff' : '#f0fdf4',
                color: themeColor,
                border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
                letterSpacing: '0.03em',
              }}
            >
              {outcomeType} • {outcomeCode}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>
            Evidence-oriented investigation of {outcomeCode} through programme events, stakeholder surveys, and the exit survey.
          </p>
        </div>

        {/* 3. Mandatory Outcome Dropdown Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label
            htmlFor="outcome-indirect-select"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0f172a',
              whiteSpace: 'nowrap',
            }}
          >
            Investigate Outcome:
          </label>
          <div style={{ position: 'relative', minWidth: 260 }}>
            <select
              id="outcome-indirect-select"
              value={`${outcomeType}:${outcomeCode}`}
              onChange={handleDropdownChange}
              style={{
                width: '100%',
                padding: '8px 32px 8px 12px',
                borderRadius: 8,
                border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
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
                  {sortedPo.map((item) => {
                    const code = item.code || item.poCode;
                    return (
                      <option key={`PO:${code}`} value={`PO:${code}`}>
                        {code}
                      </option>
                    );
                  })}
                </optgroup>
              )}
              {sortedPso.length > 0 && (
                <optgroup label="Program Specific Outcomes (PSO)">
                  {sortedPso.map((item) => {
                    const code = item.code || item.psoCode;
                    return (
                      <option key={`PSO:${code}`} value={`PSO:${code}`}>
                        {code}
                      </option>
                    );
                  })}
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
        </div>
      </div>

      {/* 4. Selected Outcome Statement Box */}
      {outcomeStatement && (
        <div
          style={{
            background: isPo ? '#f8fafc' : '#fcfdfa',
            border: `1px solid ${isPo ? '#e2e8f0' : '#e6f4ea'}`,
            borderLeft: `4px solid ${themeColor}`,
            borderRadius: 8,
            padding: '12px 16px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: themeColor,
              marginBottom: 3,
            }}
          >
            {isPo ? 'Programme Outcome Statement' : 'Programme Specific Outcome Statement'}
          </div>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
            {outcomeStatement}
          </div>
        </div>
      )}
    </div>
  );
}
