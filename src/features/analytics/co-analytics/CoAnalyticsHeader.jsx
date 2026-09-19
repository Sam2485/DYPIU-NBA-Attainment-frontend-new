import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, User, Target } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

function sortCosAscending(cos = []) {
  return [...cos].sort((a, b) => {
    const codeA = a.coCode || a.code || '';
    const codeB = b.coCode || b.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function sortOutcomesAscending(outcomes = []) {
  const poList = [];
  const psoList = [];
  const otherList = [];

  outcomes.forEach((item) => {
    const code = (item.code || item.outcomeCode || item.poCode || item.psoCode || '').toUpperCase();
    const type = (item.type || item.outcomeType || (code.startsWith('PSO') ? 'PSO' : 'PO')).toUpperCase();
    if (type === 'PO' || (code.startsWith('PO') && !code.startsWith('PSO'))) {
      poList.push(item);
    } else if (type === 'PSO' || code.startsWith('PSO')) {
      psoList.push(item);
    } else {
      otherList.push(item);
    }
  });

  const naturalSort = (a, b) => {
    const codeA = a.code || a.outcomeCode || a.poCode || a.psoCode || '';
    const codeB = b.code || b.outcomeCode || b.poCode || b.psoCode || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  };

  poList.sort(naturalSort);
  psoList.sort(naturalSort);
  otherList.sort(naturalSort);

  return [...poList, ...psoList, ...otherList];
}

export default function CoAnalyticsHeader({
  programmeBatchId,
  programmeBatchCourseId,
  batchName,
  programmeName,
  courseCode,
  courseName,
  semester,
  courseCoordinator,
  coCode,
  coStatement,
  coScope = 'SELECTED', // 'SELECTED' | 'ALL'
  onCoScopeChange,
  onSelectCo,
  availableCos = [],
  outcomeCode,
  outcomeType = 'PO',
  outcomeScope = 'ALL', // 'SELECTED' | 'ALL' | 'PO' | 'PSO'
  onOutcomeScopeChange,
  onSelectOutcome,
  availableOutcomes = [],
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';

  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  // Sorted list of COs: CO1, CO2, CO3...
  const sortedCos = React.useMemo(() => {
    const list = [...availableCos];
    if (coCode && !list.some((c) => (c.coCode || c.code) === coCode)) {
      list.push({ coCode, statement: coStatement });
    }
    return sortCosAscending(list);
  }, [availableCos, coCode, coStatement]);

  // Sorted list of Outcomes: PO1..PO12, then PSO1..PSO4
  const sortedOutcomes = React.useMemo(() => {
    const list = [...availableOutcomes];
    if (outcomeCode && !list.some((o) => (o.code || o.poCode || o.psoCode || o.outcomeCode) === outcomeCode)) {
      list.push({ code: outcomeCode, type: outcomeType });
    }
    return sortOutcomesAscending(list);
  }, [availableOutcomes, outcomeCode, outcomeType]);

  const handleBackToCourse = () => {
    const query = outcomeCode ? `?outcomeType=${outcomeType}&outcomeCode=${outcomeCode}` : '';
    navigate(
      `${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}${query}`
    );
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
      {/* 1. Breadcrumbs & Back Navigation */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleBackToCourse}
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
            <span>Back to Course Analytics</span>
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
              flexWrap: 'wrap',
            }}
          >
            <span>ANALYTICS</span>
            <span>/</span>
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`${basePath}/analytics/batch/${programmeBatchId}`)}
            >
              BATCH ANALYTICS
            </span>
            {outcomeCode && (
              <>
                <span>/</span>
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    navigate(`${basePath}/analytics/batch/${programmeBatchId}/direct/${outcomeType}/${outcomeCode}`)
                  }
                >
                  DIRECT ATTAINMENT ({outcomeCode})
                </span>
              </>
            )}
            <span>/</span>
            <span style={{ cursor: 'pointer' }} onClick={handleBackToCourse}>
              {courseCode || 'COURSE'}
            </span>
            <span>/</span>
            <span style={{ color: '#7c3aed', fontWeight: 800 }}>
              {coScope === 'ALL' ? 'ALL COs ANALYTICS' : `${coCode} ANALYTICS`}
            </span>
          </span>
        </div>
      </div>

      {/* 2. Course & CO Identity + Selectors Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                background: '#7c3aed',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              {coScope === 'ALL' ? 'ALL COs' : coCode}
            </span>
            <h1 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {courseCode} — {courseName}
            </h1>
            {semester && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                }}
              >
                Semester {semester}
              </span>
            )}
          </div>

          {/* CO Statement (when in single CO mode) */}
          {coScope === 'SELECTED' && coStatement && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: '#334155',
                lineHeight: 1.5,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              <strong style={{ color: '#0f172a' }}>CO Statement:</strong> {coStatement}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#64748b', marginTop: 6 }}>
            {programmeName && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <GraduationCap size={14} color="#64748b" />
                <span>{programmeName}</span>
              </span>
            )}
            {batchName && (
              <span>
                <strong style={{ color: '#0f172a' }}>Batch:</strong> {batchName}
              </span>
            )}
            {courseCoordinator && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <User size={13} color="#64748b" />
                <span>Coordinator: {courseCoordinator}</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Controls: CO Selectors & PO/PSO Selectors */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '8px 12px',
          }}
        >
          {/* CO Scope Dropdown: "All CO" or "Selected CO" */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              CO Scope
            </label>
            <select
              value={coScope}
              onChange={(e) => onCoScopeChange && onCoScopeChange(e.target.value)}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#0f172a',
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value="SELECTED">Selected CO</option>
              <option value="ALL">All CO</option>
            </select>
          </div>

          {/* Select CO Dropdown (active when coScope === 'SELECTED') */}
          {coScope === 'SELECTED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                Select CO
              </label>
              <select
                value={coCode}
                onChange={(e) => onSelectCo && onSelectCo(e.target.value)}
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#7c3aed',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #ddd6fe',
                  background: '#faf5ff',
                  cursor: 'pointer',
                }}
              >
                {sortedCos.map((c) => {
                  const code = c.coCode || c.code;
                  return (
                    <option key={code} value={code}>
                      {code} {c.statement ? `— ${c.statement.slice(0, 26)}...` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Outcome Scope Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Outcome Scope
            </label>
            <select
              value={outcomeScope}
              onChange={(e) => onOutcomeScopeChange && onOutcomeScopeChange(e.target.value)}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#0f172a',
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All PO / PSO</option>
              <option value="PO">All PO</option>
              <option value="PSO">All PSO</option>
              <option value="SELECTED">Selected PO / PSO</option>
            </select>
          </div>

          {/* Select Outcome Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Select PO / PSO
            </label>
            <select
              value={outcomeCode ? `${outcomeType}:${outcomeCode}` : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const [type, code] = val.split(':');
                if (onSelectOutcome) onSelectOutcome(code, type);
              }}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: themeColor,
                padding: '6px 10px',
                borderRadius: 6,
                border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
                background: isPo ? '#f0f9ff' : '#f0fdf4',
                cursor: 'pointer',
              }}
            >
              <option value="">None Selected</option>
              {sortedOutcomes.map((o) => {
                const code = o.code || o.poCode || o.psoCode || o.outcomeCode;
                const type = o.type || o.outcomeType || (code.startsWith('PSO') ? 'PSO' : 'PO');
                return (
                  <option key={`${type}:${code}`} value={`${type}:${code}`}>
                    {code} {o.statement ? `— ${o.statement.slice(0, 26)}...` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
