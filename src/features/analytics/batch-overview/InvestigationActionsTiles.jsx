import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Award, FileText, History, ArrowRight, AlertTriangle } from 'lucide-react';

export default function InvestigationActionsTiles({
  programmeIndirect = {},
  programmeAtr = {},
  historical = {},
  programmeBatchId = '',
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  const historicalCount = historical.batchCount ?? 0;
  const masterProgrammeId = historical.masterProgrammeId || '';

  const indirectPath = isAdmin
    ? `/admin/analytics/batch/${programmeBatchId}/indirect`
    : `/analytics/batch/${programmeBatchId}/indirect`;
  const atrPath = isAdmin
    ? `/admin/analytics/batch/${programmeBatchId}/atr`
    : `/analytics/batch/${programmeBatchId}/atr`;
  const historicalPath = programmeBatchId
    ? (isAdmin ? `/admin/analytics/batch/${programmeBatchId}/historical` : `/analytics/batch/${programmeBatchId}/historical`)
    : (masterProgrammeId
        ? (isAdmin ? `/admin/analytics/programme/${masterProgrammeId}/historical` : `/analytics/programme/${masterProgrammeId}/historical`)
        : (isAdmin ? '/admin/analytics/compare-batches' : '/analytics/compare-batches'));

  const indirectCount = programmeIndirect.assessmentCount ?? 0;
  const hasExitSurvey = Boolean(programmeIndirect.hasExitSurvey);

  const atrExists = Boolean(programmeAtr.exists);
  const atrStatus = programmeAtr.status || (atrExists ? 'RECORDED' : 'No ATR available');
  const atrRevisionRequired = Boolean(programmeAtr.revisionRequired);

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
          Batch-level evidence pathways and quality workflow navigation
        </span>
      </div>

      {/* 3 Compact Action Tiles (Programme Indirect, Programme ATR, Historical Comparison) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {/* TILE 1: PROGRAMME INDIRECT */}
        <div
          onClick={() => navigate(indirectPath)}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={17} color="#0d9488" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: hasExitSurvey ? '#dcfce7' : '#f1f5f9',
                  color: hasExitSurvey ? '#15803d' : '#64748b',
                }}
              >
                {hasExitSurvey ? 'Exit Survey Done' : 'Survey Pending'}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Programme Indirect Evidence
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {indirectCount > 0
                ? `${indirectCount} evidence source${indirectCount === 1 ? '' : 's'} recorded for this batch`
                : 'No indirect evidence recorded'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid #f1f5f9',
              fontSize: 12,
              fontWeight: 700,
              color: '#0d9488',
            }}
          >
            <span>Explore Indirect Evidence</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* TILE 2: PROGRAMME ATR */}
        <div
          onClick={() => navigate(atrPath)}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
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
                <FileText size={17} color="#0284c7" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 8px',
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
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Programme ATR
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {atrRevisionRequired ? (
                <span style={{ color: '#dc2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={13} />
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
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid #f1f5f9',
              fontSize: 12,
              fontWeight: 700,
              color: '#0284c7',
            }}
          >
            <span>View Programme ATR</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* TILE 3: HISTORICAL COMPARISON */}
        <div
          onClick={() => navigate(historicalPath)}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <History size={17} color="#8b5cf6" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: '#f5f3ff',
                  color: '#7c3aed',
                }}
              >
                Longitudinal
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Historical Comparison
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {historicalCount > 0
                ? `Compare performance across ${historicalCount} programme batches`
                : 'Compare across programme batches'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 16,
              paddingTop: 12,
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
