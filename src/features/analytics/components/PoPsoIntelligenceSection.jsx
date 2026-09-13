import React from 'react';
import { Target, Award, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

const PO_DEFINITIONS = [
  { code: 'PO1', title: 'Engineering Knowledge', desc: 'Apply knowledge of mathematics, science, and engineering fundamentals' },
  { code: 'PO2', title: 'Problem Analysis', desc: 'Identify, formulate, and analyze complex engineering problems' },
  { code: 'PO3', title: 'Design/Development of Solutions', desc: 'Design solutions for complex engineering problems and systems' },
  { code: 'PO4', title: 'Conduct Investigations', desc: 'Use research-based knowledge and methods to provide valid conclusions' },
  { code: 'PO5', title: 'Modern Tool Usage', desc: 'Create, select, and apply appropriate techniques, resources, and IT tools' },
  { code: 'PO6', title: 'The Engineer and Society', desc: 'Apply reasoning informed by contextual knowledge to assess societal issues' },
  { code: 'PO7', title: 'Environment & Sustainability', desc: 'Understand the impact of engineering solutions in societal and environmental contexts' },
  { code: 'PO8', title: 'Ethics', desc: 'Apply ethical principles and commit to professional ethics and responsibilities' },
  { code: 'PO9', title: 'Individual and Team Work', desc: 'Function effectively as an individual and as a member or leader in diverse teams' },
  { code: 'PO10', title: 'Communication', desc: 'Communicate effectively on complex engineering activities with the engineering community' },
  { code: 'PO11', title: 'Project Management & Finance', desc: 'Demonstrate knowledge and understanding of engineering and management principles' },
  { code: 'PO12', title: 'Life-long Learning', desc: 'Recognize the need for and have the ability to engage in independent and life-long learning' },
];

export default function PoPsoIntelligenceSection({ isLoading = false }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Program Outcomes (PO) & Program Specific Outcomes (PSO) Intelligence
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
            Authoritative outcome attainment analysis, target vs actual comparisons, and deficit indicators across 12 standard NBA POs and specialized PSOs.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 18,
        }}
      >
        {/* Left Column: PO Matrix (PO1 - PO12) */}
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
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2ff', color: '#4f46e5', display: 'grid', placeItems: 'center' }}>
                <Target size={16} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>Standard NBA Program Outcomes (PO1 – PO12)</strong>
                <div style={{ fontSize: 11, color: '#64748b' }}>Attainment vs Target Comparison Matrix</div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '3px 8px', borderRadius: 6 }}>
              12 Outcomes
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
            {PO_DEFINITIONS.map((po) => (
              <div
                key={po.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: 42,
                      padding: '3px 6px',
                      borderRadius: 6,
                      background: '#4f46e5',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 800,
                      textAlign: 'center',
                    }}
                  >
                    {po.code}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {po.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {po.desc}
                    </div>
                  </div>
                </div>

                {/* Placeholder Attainment Bar / Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
                  <div style={{ width: 90, height: 8, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '70%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                        borderRadius: 99,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    STATUS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: PSO Breakdown */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                  <Award size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>Program Specific Outcomes (PSO) Intelligence</strong>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Specialized departmental outcome attainment</div>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 6 }}>
                Curriculum Focus
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>PSO1 — Domain Specialization & Core Technologies</strong>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>Target: 2.0 / 3.0</span>
                </div>
                <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>
                  Design and execute domain-specific solutions using advanced architectural frameworks and modern industry paradigms.
                </p>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ width: '75%', height: '100%', background: '#059669', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Attainment</span>
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>PSO2 — Applied Systems & Industry Practice</strong>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>Target: 2.0 / 3.0</span>
                </div>
                <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>
                  Demonstrate proficiency in deploying enterprise solutions, cloud platforms, and collaborative engineering environments.
                </p>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ width: '80%', height: '100%', background: '#059669', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Attainment</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#64748b' }}>
            <Info size={13} color="#059669" />
            <span>PSO definitions and targets are configured per Master Programme by Department Coordinators.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
