import React from 'react';
import { Info, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CoIndirectInterpretationPanel() {
  return (
    <div
      style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            padding: 8,
            borderRadius: 10,
            background: '#dcfce7',
            color: '#16a34a',
            flexShrink: 0,
          }}
        >
          <Info size={20} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#166534', margin: 0 }}>
            How Indirect Evidence Is Interpreted
          </h4>

          <p style={{ fontSize: 12.5, color: '#14532d', lineHeight: 1.5, margin: 0 }}>
            Course-end survey responses are converted into the configured indirect attainment scale by the
            backend calculation engine. Student evaluations are mapped using standard NBA rating levels:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginTop: 4,
            }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dcfce7',
                borderRadius: 8,
                padding: '10px 14px',
              }}
            >
              <span style={{ fontWeight: 800, color: '#166534', fontSize: 12 }}>
                Slight (Rating 1)
              </span>
              <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                Maps to NBA Level 1 baseline feedback.
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dcfce7',
                borderRadius: 8,
                padding: '10px 14px',
              }}
            >
              <span style={{ fontWeight: 800, color: '#15803d', fontSize: 12 }}>
                Moderate (Rating 2)
              </span>
              <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                Maps to NBA Level 2 expected competency.
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dcfce7',
                borderRadius: 8,
                padding: '10px 14px',
              }}
            >
              <span style={{ fontWeight: 800, color: '#14532d', fontSize: 12 }}>
                Substantial (Rating 3)
              </span>
              <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                Maps to NBA Level 3 mastery competency.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#166534',
              fontWeight: 600,
              marginTop: 6,
              paddingTop: 8,
              borderTop: '1px solid #dcfce7',
            }}
          >
            <ShieldCheck size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
            <span>
              <strong>Confidentiality Rule:</strong> Indirect evidence is aggregate-only. Individual student
              survey identities are not recorded or displayed to ensure anonymous student evaluation.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
