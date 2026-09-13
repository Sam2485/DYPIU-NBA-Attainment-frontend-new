import React from 'react';
import { FileText, CheckCircle2, Clock, CheckCircle, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export default function AtrIntelligenceSection({ isLoading = false }) {
  const workflowStages = [
    {
      id: 'identified',
      stage: 'Stage 1: Identification & Planning',
      title: 'Action Plans Formulated',
      description: 'Course and Programme Coordinators specify precise pedagogical or curricular interventions for outcomes exhibiting target deficits.',
      icon: Clock,
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
    },
    {
      id: 'in-progress',
      stage: 'Stage 2: Implementation',
      title: 'Remediation Underway',
      description: 'Interventions (e.g. extra tutorials, revised laboratory assignments, updated lecture modules) are executed during active teaching semesters.',
      icon: FileText,
      color: '#0284c7',
      bg: '#f0f9ff',
      border: '#bae6fd',
    },
    {
      id: 'closed',
      stage: 'Stage 3: Verification & Closure',
      title: 'Closed-Loop Verification',
      description: 'Subsequent cohort attainment data is compared against previous deficit benchmarks to confirm effective closure of quality gaps.',
      icon: CheckCircle2,
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Action Taken Report (ATR) Closed-Loop Governance
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
            Continuous Quality Improvement (CQI) lifecycle tracking from deficit identification to subsequent cohort validation.
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
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f9ff', color: '#0284c7', display: 'grid', placeItems: 'center' }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>NBA Continuous Improvement Cycle (Criterion 7 / Criterion 3)</strong>
              <div style={{ fontSize: 11, color: '#64748b' }}>Institutional action plan execution and verification tracking</div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', background: '#f0f9ff', padding: '3px 8px', borderRadius: 6 }}>
            CQI Lifecycle
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {workflowStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                style={{
                  padding: '16px 18px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: stage.color,
                        background: stage.bg,
                        border: `1px solid ${stage.border}`,
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {stage.stage}
                    </span>
                    <Icon size={16} color={stage.color} />
                  </div>

                  <strong style={{ fontSize: 13.5, color: '#0f172a' }}>
                    {stage.title}
                  </strong>

                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                    {stage.description}
                  </p>
                </div>

                <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Resolution Status</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>-- Records</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#64748b' }}>
          <Info size={13} color="#0284c7" />
          <span>Closed-loop ATR validation ensures every identified deficit has an actionable remediation roadmap tracked across academic cycles.</span>
        </div>
      </div>
    </div>
  );
}
