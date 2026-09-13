import React from 'react';
import { Target, Award, Layers, Activity, AlertCircle, RefreshCw } from 'lucide-react';

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  padding: '18px 20px',
  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: 140,
};

const formatPercent = (val) => {
  if (val === null || val === undefined) return '--';
  const num = Number(val);
  if (isNaN(num)) return '--';
  return Number.isInteger(num) ? `${num}%` : `${num.toFixed(1)}%`;
};

export default function KpiSummarySection({
  kpiData = null,
  isLoading = false,
  error = null,
  onRetry = () => {},
}) {
  const poData = kpiData?.poTargetAchievement;
  const psoData = kpiData?.psoTargetAchievement;
  const healthData = kpiData?.programmeCohortHealth;
  const atrData = kpiData?.atrOperationalSummary;

  const kpiItems = [
    {
      id: 'po-attainment',
      label: 'PO Target Achievement Rate',
      description: 'Evaluated Program Outcomes (PO1–PO12) meeting or exceeding attainment targets',
      icon: Target,
      iconColor: '#4f46e5',
      iconBg: '#eef2ff',
      hasData: Boolean(poData && poData.totalEvaluatedInstances > 0),
      mainValue: poData && poData.totalEvaluatedInstances > 0 && poData.achievementRatePercentage != null
        ? formatPercent(poData.achievementRatePercentage)
        : '--',
      subValue: poData && poData.totalEvaluatedInstances > 0
        ? `${poData.targetMetInstances} / ${poData.totalEvaluatedInstances} target met`
        : 'No evaluated POs',
    },
    {
      id: 'pso-attainment',
      label: 'PSO Target Achievement Rate',
      description: 'Program Specific Outcomes meeting attainment thresholds for selected cohort',
      icon: Award,
      iconColor: '#059669',
      iconBg: '#ecfdf5',
      hasData: Boolean(psoData && psoData.totalEvaluatedInstances > 0),
      mainValue: psoData && psoData.totalEvaluatedInstances > 0 && psoData.achievementRatePercentage != null
        ? formatPercent(psoData.achievementRatePercentage)
        : '--',
      subValue: psoData && psoData.totalEvaluatedInstances > 0
        ? `${psoData.targetMetInstances} / ${psoData.totalEvaluatedInstances} target met`
        : 'No evaluated PSOs',
    },
    {
      id: 'multi-prog-coverage',
      label: 'Cohorts Meeting Target Thresholds',
      description: 'Academic programme cohorts where all measured outcomes meet compliance thresholds',
      icon: Layers,
      iconColor: '#d97706',
      iconBg: '#fffbeb',
      hasData: Boolean(healthData && healthData.totalEvaluatedCohorts > 0),
      mainValue: healthData && healthData.totalEvaluatedCohorts > 0 && healthData.fullyMeetingTargetRatePercentage != null
        ? formatPercent(healthData.fullyMeetingTargetRatePercentage)
        : '--',
      subValue: healthData && healthData.totalEvaluatedCohorts > 0
        ? `${healthData.cohortsFullyMeetingTargets} / ${healthData.totalEvaluatedCohorts} cohorts compliant`
        : 'No evaluated cohorts',
    },
    {
      id: 'atr-progress',
      label: 'Continuous Improvement Tracking',
      description: 'Action Taken Reports currently in active resolution or validated completed cycles',
      icon: Activity,
      iconColor: '#0284c7',
      iconBg: '#f0f9ff',
      hasData: Boolean(atrData),
      mainValue: atrData != null ? String(atrData.totalRecordedProgrammeAtrs ?? 0) : '--',
      subValue: atrData != null
        ? `${atrData.approvedProgrammeAtrs ?? 0} Approved • ${atrData.submittedProgrammeAtrs ?? 0} Submitted`
        : 'No ATR records',
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
          Institutional Quality Key Performance Indicators
        </h3>
      </div>

      {error ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 10,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: 13,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} color="#dc2626" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 6,
              background: '#ffffff',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {kpiItems.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.id} style={cardStyle}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                      {kpi.label}
                    </span>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: kpi.iconBg,
                        color: kpi.iconColor,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                  </div>

                  {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '8px 0 6px' }}>
                      <div
                        style={{
                          height: 32,
                          width: '60%',
                          borderRadius: 6,
                          background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                          backgroundSize: '200% 100%',
                          animation: 'pulse 1.8s infinite',
                        }}
                      />
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>%</span>
                    </div>
                  ) : (
                    <div style={{ margin: '6px 0 4px' }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        {kpi.mainValue}
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', marginTop: 4 }}>
                        {kpi.subValue}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p style={{ margin: '6px 0 0', fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
                    {kpi.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
