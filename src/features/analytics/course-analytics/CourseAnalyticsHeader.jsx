import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, User, GraduationCap, ChevronDown, Award } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

export default function CourseAnalyticsHeader({
  programmeBatchId,
  programmeBatchCourseId,
  batchName,
  programmeName,
  schoolName,
  courseCode,
  courseName,
  semester,
  courseCoordinator,
  courseCoordinatorEmail,
  outcomeCode,
  outcomeType = 'PO',
  outcomeScope = 'SELECTED', // 'SELECTED' | 'ALL' | 'PO' | 'PSO'
  onScopeChange,
  onSelectOutcome,
  availableOutcomes = [],
  availableCourses = [],
  onSelectCourse,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';

  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  // Natural ascending sorting for outcomes: PO1..PO12, then PSO1..PSO4
  const sortedOutcomes = React.useMemo(() => {
    const list = [...availableOutcomes];
    if (outcomeCode) {
      const exists = list.some(
        (o) => (o.code || o.poCode || o.psoCode || o.outcomeCode) === outcomeCode
      );
      if (!exists) {
        list.push({ code: outcomeCode, type: outcomeType });
      }
    }

    const poList = [];
    const psoList = [];
    const otherList = [];

    list.forEach((item) => {
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
  }, [availableOutcomes, outcomeCode, outcomeType]);

  const sortedCourses = React.useMemo(() => {
    return [...availableCourses].sort((a, b) => {
      if (a.semester !== b.semester) {
        return (a.semester || 0) - (b.semester || 0);
      }
      return (a.courseCode || '').localeCompare(b.courseCode || '');
    });
  }, [availableCourses]);

  // Back button destination: back to direct drilldown if outcome was specified, else back to batch
  const handleBack = () => {
    if (outcomeCode) {
      navigate(`${basePath}/analytics/batch/${programmeBatchId}/direct/${outcomeType}/${outcomeCode}`);
    } else {
      navigate(`${basePath}/analytics/batch/${programmeBatchId}`);
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
            onClick={handleBack}
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
            <span>{outcomeCode ? `Back to ${outcomeCode}` : 'Back to Batch'}</span>
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
            <span style={{ color: '#0f172a', fontWeight: 800 }}>COURSE ANALYTICS</span>
          </span>
        </div>

        {/* Course Offering Dropdown Selector (if multiple courses available in batch) */}
        {availableCourses && availableCourses.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Switch Course:</span>
            <select
              value={programmeBatchCourseId}
              onChange={(e) => {
                if (onSelectCourse) onSelectCourse(e.target.value);
              }}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#0f172a',
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              {sortedCourses.map((c) => (
                <option key={c.programmeBatchCourseId || c.id} value={c.programmeBatchCourseId || c.id}>
                  {c.courseCode} - {c.courseName} {c.semester ? `(Sem ${c.semester})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Course Identity & Context Badges */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 6,
                background: '#0f172a',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              {courseCode || 'COURSE'}
            </span>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {courseName || 'Course Analytics'}
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

          {/* Context Line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: '#64748b' }}>
            {programmeName && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <GraduationCap size={14} color="#64748b" />
                <span>{programmeName}</span>
              </span>
            )}
            {batchName && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <strong style={{ color: '#0f172a' }}>Batch:</strong> {batchName}
              </span>
            )}
            {schoolName && <span>• {schoolName}</span>}
            {courseCoordinator && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <User size={13} color="#64748b" />
                <span>Coordinator: <strong>{courseCoordinator}</strong> {courseCoordinatorEmail ? `(${courseCoordinatorEmail})` : ''}</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Dropdowns for Scope & Selected Outcome (SINGLE DROPDOWNS ONLY - NO TABS) */}
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
          {/* Outcome Scope Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Outcome Scope
            </label>
            <select
              value={outcomeScope}
              onChange={(e) => onScopeChange && onScopeChange(e.target.value)}
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
              <option value="SELECTED">Selected PO / PSO</option>
              <option value="ALL">All PO / PSO</option>
              <option value="PO">All PO</option>
              <option value="PSO">All PSO</option>
            </select>
          </div>

          {/* Selected Outcome Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Selected Outcome
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
              {sortedOutcomes.map((o) => {
                const code = o.code || o.poCode || o.psoCode || o.outcomeCode;
                const type = o.type || o.outcomeType || (code.startsWith('PSO') ? 'PSO' : 'PO');
                return (
                  <option key={`${type}:${code}`} value={`${type}:${code}`}>
                    {code} {o.statement ? `— ${o.statement.slice(0, 30)}...` : ''}
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
