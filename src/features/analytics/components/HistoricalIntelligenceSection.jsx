import React from 'react';
import { TrendingUp, Calendar, BarChart2, Info } from 'lucide-react';

export default function HistoricalIntelligenceSection({ isLoading = false }) {
  const cohortTrends = [
    { year: '2020 – 2024', label: 'Graduated Cohort', status: 'Finalized Attainment', targetStatus: 'Compliant' },
    { year: '2021 – 2025', label: 'Senior Cohort', status: 'Assessment Complete', targetStatus: 'Compliant' },
    { year: '2022 – 2026', label: 'Intermediate Cohort', status: 'Ongoing Cycles', targetStatus: 'Active' },
    { year: '2023 – 2027', label: 'Junior Cohort', status: 'Direct Assessment', targetStatus: 'Active' },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Historical Multi-Cohort Longitudinal Intelligence
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
            Longitudinal multi-year attainment progression across consecutive graduating batches to monitor continuous improvement trends.
          </p>
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 20,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}>
              <TrendingUp size={16} />
            </div>
            <div>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>Cohort Progression & Attainment Trajectory</strong>
              <div style={{ fontSize: 11, color: '#64748b' }}>Multi-year baseline vs target comparison</div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: 6 }}>
            Longitudinal Track
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          {cohortTrends.map((cohort, index) => (
            <div
              key={cohort.year}
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5' }}>
                    Cohort {index + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: cohort.targetStatus === 'Compliant' ? '#dcfce7' : '#e0f2fe',
                      color: cohort.targetStatus === 'Compliant' ? '#15803d' : '#0369a1',
                    }}
                  >
                    {cohort.targetStatus}
                  </span>
                </div>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>{cohort.year}</strong>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{cohort.label}</div>
              </div>

              {/* Progress Placeholder */}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                  <span>Attainment Index</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>--</span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: `${(index + 1) * 22}%`, height: '100%', background: '#2563eb', borderRadius: 99 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#64748b' }}>
          <Info size={13} color="#2563eb" />
          <span>Historical trends are computed from finalized batch attainment archives stored across institutional evaluation cycles.</span>
        </div>
      </div>
    </div>
  );
}
