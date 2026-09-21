import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, User, Target, FileSpreadsheet } from 'lucide-react';

const INDIRECT_GREEN = '#16a34a'; // Light Green

function sortCosAscending(cos = []) {
  return [...cos].sort((a, b) => {
    const codeA = a.coCode || a.code || '';
    const codeB = b.coCode || b.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

export default function CoIndirectAttainmentHeader({
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
  outcomeCode = null,
  outcomeType = 'PO',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';

  const sortedCos = React.useMemo(() => {
    const list = [...availableCos];
    const isPseudo = !coCode || coCode === 'All COs' || coCode.toLowerCase() === 'all';
    if (!isPseudo && !list.some((c) => (c.coCode || c.code) === coCode)) {
      list.push({ coCode, statement: coStatement });
    }
    return sortCosAscending(list);
  }, [availableCos, coCode, coStatement]);

  const handleBackToCoAnalytics = () => {
    const params = new URLSearchParams();
    if (outcomeCode) {
      params.set('outcomeCode', outcomeCode);
      params.set('outcomeType', outcomeType);
    }
    params.set('coScope', coScope);
    const query = params.toString() ? `?${params.toString()}` : '';

    // Sanitize coPart so it is never a pseudo-code like 'All COs' or 'ALL' in the route param
    const isPseudo = !coCode || coCode === 'All COs' || coCode.toLowerCase() === 'all';
    const cleanCo = (!isPseudo)
      ? coCode
      : (availableCos[0]?.coCode || availableCos[0]?.code || 'CO1');

    navigate(`${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}/co/${cleanCo}${query}`);
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
            onClick={handleBackToCoAnalytics}
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
            <span>Back to CO Analytics</span>
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
              style={{ cursor: 'pointer', color: '#64748b' }}
              onClick={() => navigate(`${basePath}/analytics/programme`)}
            >
              {programmeName ? programmeName.toUpperCase() : 'PROGRAMME'}
            </span>
            <span>/</span>
            <span
              style={{ cursor: 'pointer', color: '#64748b' }}
              onClick={() => navigate(`${basePath}/analytics/batch/${programmeBatchId}`)}
            >
              {batchName ? `BATCH ${batchName}` : 'BATCH ANALYTICS'}
            </span>
            <span>/</span>
            <span
              style={{ cursor: 'pointer', color: '#64748b' }}
              onClick={() => navigate(`${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}`)}
            >
              COURSE ANALYTICS
            </span>
            <span>/</span>
            <span
              style={{ cursor: 'pointer', color: '#64748b' }}
              onClick={handleBackToCoAnalytics}
            >
              CO ANALYTICS
            </span>
            <span>/</span>
            <span style={{ color: INDIRECT_GREEN }}>CO INDIRECT ATTAINMENT</span>
          </span>
        </div>

        {/* CO Scope Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '2px 4px',
              fontSize: 12,
            }}
          >
            <button
              type="button"
              onClick={() => onCoScopeChange && onCoScopeChange('SELECTED')}
              style={{
                border: 'none',
                background: coScope === 'SELECTED' ? INDIRECT_GREEN : 'transparent',
                color: coScope === 'SELECTED' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: 11.5,
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Selected CO
            </button>
            <button
              type="button"
              onClick={() => onCoScopeChange && onCoScopeChange('ALL')}
              style={{
                border: 'none',
                background: coScope === 'ALL' ? INDIRECT_GREEN : 'transparent',
                color: coScope === 'ALL' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: 11.5,
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All CO
            </button>
          </div>

          {coScope === 'SELECTED' && sortedCos.length > 0 && (
            <select
              value={coCode || ''}
              onChange={(e) => onSelectCo && onSelectCo(e.target.value)}
              style={{
                background: '#ffffff',
                border: `1px solid ${INDIRECT_GREEN}`,
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: 12,
                fontWeight: 700,
                color: INDIRECT_GREEN,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {sortedCos.map((c) => {
                const code = c.coCode || c.code;
                return (
                  <option key={code} value={code}>
                    {code} {c.statement ? `— ${c.statement.substring(0, 30)}...` : ''}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      </div>

      {/* 2. Main Title & Compact Context Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 6,
                background: '#dcfce7',
                color: INDIRECT_GREEN,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <FileSpreadsheet size={14} />
              {coScope === 'ALL' ? 'ALL COS' : (coCode || 'CO')}
            </span>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              CO Indirect Attainment
            </h1>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 999,
                background: '#dcfce7',
                color: '#15803d',
              }}
            >
              Course-End Survey (20% Weight)
            </span>
          </div>

          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 }}>
            Course-End Survey Evidence
          </p>

          {coScope === 'SELECTED' && coStatement && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 12px',
                background: '#f8fafc',
                borderLeft: `3px solid ${INDIRECT_GREEN}`,
                borderRadius: '0 6px 6px 0',
                fontSize: 12.5,
                color: '#334155',
                lineHeight: 1.45,
                maxWidth: 820,
              }}
            >
              <strong>{coCode}:</strong> {coStatement}
            </div>
          )}
        </div>

        {/* Compact Course Metadata Pills */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 11.5,
            minWidth: 260,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
            <BookOpen size={13} style={{ color: INDIRECT_GREEN }} />
            <span style={{ fontWeight: 700 }}>
              {courseCode ? `${courseCode} — ${courseName || 'Course'}` : 'Course Offering'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
            <GraduationCap size={13} />
            <span>
              {semester ? `Semester ${semester}` : 'Semester'} • {batchName ? `Batch ${batchName}` : 'Batch'}
            </span>
          </div>
          {courseCoordinator && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
              <User size={13} />
              <span>Coordinator: {courseCoordinator}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
