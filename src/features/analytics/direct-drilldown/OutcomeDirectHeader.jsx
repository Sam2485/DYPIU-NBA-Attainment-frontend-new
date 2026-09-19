import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

export default function OutcomeDirectHeader({
  programmeBatchId,
  batchName,
  programmeName,
  schoolName,
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
              fontSize: 11,
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>ANALYTICS</span>
            <span>/</span>
            <span>BATCH ANALYTICS</span>
            <span>/</span>
            <span style={{ color: '#0f172a' }}>DIRECT ATTAINMENT</span>
            <span>/</span>
            <span style={{ color: themeColor, fontWeight: 800 }}>{outcomeCode}</span>
          </span>
        </div>

        {/* PO/PSO Dropdown Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label
            htmlFor="outcome-dropdown-select"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
              whiteSpace: 'nowrap',
            }}
          >
            Selected Outcome:
          </label>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
              id="outcome-dropdown-select"
              value={`${outcomeType}:${outcomeCode}`}
              onChange={handleDropdownChange}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                background: '#ffffff',
                border: `1.5px solid ${themeColor}`,
                borderRadius: 8,
                padding: '6px 32px 6px 12px',
                fontSize: 13,
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {options.map((item) => {
                const code = item.code || item.poCode || item.psoCode || '';
                const type = item.type || (code.startsWith('PSO') ? 'PSO' : 'PO');
                const label = item.statement || item.poStatement || item.psoStatement
                  ? `${code} — ${(item.statement || item.poStatement || item.psoStatement).slice(0, 40)}…`
                  : code;
                return (
                  <option key={`${type}:${code}`} value={`${type}:${code}`}>
                    {type === 'PSO' ? `[PSO] ${label}` : `[PO] ${label}`}
                  </option>
                );
              })}
            </select>
            <ChevronDown
              size={14}
              color={themeColor}
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

      {/* 2. Title & Programme Context */}
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
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: themeColor,
                display: 'inline-block',
              }}
            />
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Programme Direct Attainment
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: themeColor,
                background: isPo ? '#f0f9ff' : '#f0fdf4',
                border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
                padding: '2px 8px',
                borderRadius: 999,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {isPo ? 'Programme Outcome' : 'Programme Specific Outcome'}
            </span>
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {programmeName && (
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{programmeName}</span>
            )}
            {programmeName && batchName && <span>•</span>}
            {batchName && <span>{batchName}</span>}
            {schoolName && <span>•</span>}
            {schoolName && <span>{schoolName}</span>}
          </div>
        </div>
      </div>

      {/* 3. Selected Outcome Statement Box */}
      <div
        style={{
          background: isPo ? '#f0f9ff' : '#f0fdf4',
          border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
          borderRadius: 10,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: themeColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {outcomeCode}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: themeColor,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 2,
            }}
          >
            {outcomeCode} Definition & Statement
          </div>
          <div
            style={{
              fontSize: 13,
              color: '#1e293b',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {outcomeStatement || 'No outcome statement provided by the curriculum repository.'}
          </div>
        </div>
      </div>
    </div>
  );
}
