import React from 'react';
import { UserCheck, ShieldCheck, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export default function OperationalWorkloadBreakdown({
  workloadItems = [], // [{ role: 'HOD', label: 'Department Approvals', pendingCount: 4, totalCount: 12, description: 'PO/PSO targets & ATRs awaiting HOD review' }, ...]
}) {
  const roleIcons = {
    DIRECTOR: ShieldCheck,
    HOD: UserCheck,
    PROGRAMME_COORDINATOR: Layers,
    COURSE_COORDINATOR: BookOpen,
    FACULTY: BookOpen,
    IQAC: CheckCircle2,
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '20px 22px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 750, color: '#0f172a' }}>
          Operational Workload Concentration
        </h4>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Breakdown of pending submissions and reviews by responsible role
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {workloadItems.map((item) => {
          const Icon = roleIcons[item.role] || UserCheck;
          const isClear = Number(item.pendingCount) === 0;

          return (
            <div
              key={item.label}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '14px 16px',
                background: isClear ? '#f8fafc' : '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 750,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748b',
                  }}
                >
                  {item.roleLabel || item.role}
                </span>

                <Icon size={16} color={isClear ? '#10b981' : '#6366f1'} />
              </div>

              <div>
                <div style={{ fontSize: 13.5, fontWeight: 750, color: '#0f172a', marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
                  {item.description}
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  paddingTop: 8,
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 11, color: '#64748b' }}>Pending Action:</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: isClear ? '#059669' : '#d97706',
                  }}
                >
                  {isClear ? '0 Pending' : `${item.pendingCount} Pending`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
