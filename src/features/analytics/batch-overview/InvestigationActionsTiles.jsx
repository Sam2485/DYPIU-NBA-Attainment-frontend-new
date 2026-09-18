import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, FileText, CheckCircle2, History, ArrowRight, AlertTriangle } from 'lucide-react';

export default function InvestigationActionsTiles({
  programmeIndirect = {},
  programmeAtr = {},
  courseAtr = {},
  historical = {},
  programmeBatchId = '',
}) {
  const navigate = useNavigate();

  const indirectCount = programmeIndirect.assessmentCount ?? 0;
  const hasExitSurvey = Boolean(programmeIndirect.hasExitSurvey);

  const atrExists = Boolean(programmeAtr.exists);
  const atrStatus = programmeAtr.status || (atrExists ? 'RECORDED' : 'No ATR available');
  const atrRevisionRequired = Boolean(programmeAtr.revisionRequired);

  const totalCourses = courseAtr.totalCourses ?? 0;
  const coursesWithAtr = courseAtr.coursesWithAtr ?? 0;
  const verifiedCount = courseAtr.verifiedCount ?? 0;
  const revisionCount = courseAtr.needsRevisionCount ?? courseAtr.revisionRequiredCount ?? 0;

  const historicalCount = historical.batchCount ?? 0;
  const masterProgrammeId = historical.masterProgrammeId || '';

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
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
          INVESTIGATION & ACTIONS
        </h3>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Deep-dive evidence paths and workflow management for this batch
        </span>
      </div>

      {/* 4 Compact Action Tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {/* TILE 1: PROGRAMME INDIRECT */}
        <div
          onClick={() => navigate(`/programme-coordinator/indirect-attainment?programmeBatchId=${programmeBatchId}`)}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0d9488';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={16} color="#0d9488" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: hasExitSurvey ? '#dcfce7' : '#f1f5f9',
                  color: hasExitSurvey ? '#15803d' : '#64748b',
                }}
              >
                {hasExitSurvey ? 'Exit Survey Done' : 'Survey Pending'}
              </span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Programme Indirect
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {indirectCount > 0
                ? `${indirectCount} evidence source${indirectCount === 1 ? '' : 's'} recorded`
                : 'No indirect evidence recorded'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid #f1f5f9',
              fontSize: 12,
              fontWeight: 700,
              color: '#0d9488',
            }}
          >
            <span>Explore Evidence</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* TILE 2: PROGRAMME ATR */}
        <div
          onClick={() => navigate(`/programme-atr?programmeBatchId=${programmeBatchId}`)}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0284c7';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={16} color="#0284c7" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 6,
                  textTransform: 'uppercase',
                  background: atrRevisionRequired
                    ? '#fef2f2'
                    : atrExists
                    ? '#eff6ff'
                    : '#f1f5f9',
                  color: atrRevisionRequired
                    ? '#dc2626'
                    : atrExists
                    ? '#1d4ed8'
                    : '#64748b',
                  border: `1px solid ${
                    atrRevisionRequired
                      ? '#fecaca'
                      : atrExists
                      ? '#bfdbfe'
                      : '#e2e8f0'
                  }`,
                }}
              >
                {atrStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Programme ATR
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {atrRevisionRequired ? (
                <span style={{ color: '#dc2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={12} />
                  Revision Required by IQAC
                </span>
              ) : atrExists ? (
                'Action Taken Report recorded'
              ) : (
                'No ATR recorded'
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid #f1f5f9',
              fontSize: 12,
              fontWeight: 700,
              color: '#0284c7',
            }}
          >
            <span>View ATR</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* TILE 3: COURSE ATR */}
        <div
          onClick={() => navigate(`/course-atr?programmeBatchId=${programmeBatchId}`)}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#16a34a';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={16} color="#16a34a" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: '#f1f5f9',
                  color: '#475569',
                }}
              >
                {coursesWithAtr} / {totalCourses} Courses
              </span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Course ATR
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              <strong style={{ color: '#16a34a' }}>{verifiedCount}</strong> verified
              {revisionCount > 0 && (
                <span style={{ color: '#dc2626', marginLeft: 6, fontWeight: 700 }}>
                  • {revisionCount} revision
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid #f1f5f9',
              fontSize: 12,
              fontWeight: 700,
              color: '#16a34a',
            }}
          >
            <span>View Course ATR</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* TILE 4: HISTORICAL ANALYTICS */}
        <div
          onClick={() =>
            navigate(
              masterProgrammeId
                ? `/admin/dashboard?masterProgrammeId=${masterProgrammeId}&tab=trends`
                : '/admin/dashboard'
            )
          }
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#8b5cf6';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <History size={16} color="#8b5cf6" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: '#f5f3ff',
                  color: '#7c3aed',
                }}
              >
                Longitudinal
              </span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Historical Analytics
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {historicalCount > 0
                ? `${historicalCount} batch${historicalCount === 1 ? '' : 'es'} available for comparison`
                : 'Compare across programme batches'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid #f1f5f9',
              fontSize: 12,
              fontWeight: 700,
              color: '#8b5cf6',
            }}
          >
            <span>Compare Batches</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
}
