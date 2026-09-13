import React from 'react';
import { Target, Award, Layers, Activity, Info } from 'lucide-react';

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

export default function KpiSummarySection({ isLoading = false }) {
  const kpiItems = [
    {
      id: 'po-attainment',
      label: 'PO Target Achievement Rate',
      description: 'Evaluated Program Outcomes (PO1–PO12) meeting or exceeding attainment targets',
      icon: Target,
      iconColor: '#4f46e5',
      iconBg: '#eef2ff',
      borderColor: '#c7d2fe',
      targetNote: 'Authoritative calculation from finalized cohort assessments',
    },
    {
      id: 'pso-attainment',
      label: 'PSO Target Achievement Rate',
      description: 'Program Specific Outcomes meeting specialized departmental attainment targets',
      icon: Award,
      iconColor: '#059669',
      iconBg: '#ecfdf5',
      borderColor: '#a7f3d0',
      targetNote: 'Domain-specific outcome compliance across active curricula',
    },
    {
      id: 'programme-health',
      label: 'Programme Cohort Health',
      description: 'Active programme cohort batches maintaining clean outcome attainment profiles',
      icon: Layers,
      iconColor: '#d97706',
      iconBg: '#fffbeb',
      borderColor: '#fde68a',
      targetNote: 'Evaluated cohort compliance without unresolved gap concentrations',
    },
    {
      id: 'atr-resolution',
      label: 'ATR Operational Governance',
      description: 'Continuous Improvement Action Taken Reports with defined and verified resolutions',
      icon: Activity,
      iconColor: '#0284c7',
      iconBg: '#f0f9ff',
      borderColor: '#bae6fd',
      targetNote: 'Closed-loop CQI remediation tracking across departments',
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
          Institutional Quality Key Performance Indicators
        </h3>
        <span style={{ fontSize: 11.5, color: '#64748b' }}>
          Real-time aggregated metrics based on finalized OBE data
        </span>
      </div>

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

                {/* Metric Value Slot (Phase 1 Placeholder Skeleton) */}
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
              </div>

              <div>
                <p style={{ margin: '6px 0 0', fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
                  {kpi.description}
                </p>
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: '#94a3b8' }}>
                  <Info size={11} />
                  <span>{kpi.targetNote}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
