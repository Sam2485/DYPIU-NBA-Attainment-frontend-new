import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileCheck,
} from 'lucide-react';

export default function OperationalActionQueue({
  actions = [], // [{ id, title, description, count, type: 'urgent' | 'pending' | 'warning' | 'info', path, buttonLabel }]
  emptyMessage = 'No pending actions required for your role and selected scope.',
}) {
  const navigate = useNavigate();

  const typeConfig = {
    urgent: {
      border: '#fecaca',
      bg: '#fff5f5',
      iconBg: '#fee2e2',
      color: '#991b1b',
      badgeBg: '#dc2626',
      badgeColor: '#ffffff',
      icon: ShieldAlert,
    },
    warning: {
      border: '#fde68a',
      bg: '#fffdf5',
      iconBg: '#fef3c7',
      color: '#92400e',
      badgeBg: '#d97706',
      badgeColor: '#ffffff',
      icon: AlertTriangle,
    },
    pending: {
      border: '#fed7aa',
      bg: '#fffaf5',
      iconBg: '#ffedd5',
      color: '#9a3412',
      badgeBg: '#ea580c',
      badgeColor: '#ffffff',
      icon: Clock,
    },
    info: {
      border: '#c7d2fe',
      bg: '#f8faff',
      iconBg: '#e0e7ff',
      color: '#3730a3',
      badgeBg: '#4f46e5',
      badgeColor: '#ffffff',
      icon: FileCheck,
    },
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
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 750, color: '#0f172a' }}>
            Action Required
          </h4>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Operational tasks requiring your direct attention or review
          </span>
        </div>

        {actions.length > 0 && (
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 999,
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            }}
          >
            {actions.length} {actions.length === 1 ? 'Action Pending' : 'Actions Pending'}
          </span>
        )}
      </div>

      {actions.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '24px 20px',
            background: '#f0fdf4',
            borderRadius: 10,
            border: '1px solid #bbf7d0',
            color: '#166534',
          }}
        >
          <CheckCircle2 size={24} color="#16a34a" />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>All Operational Tasks Completed</div>
            <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>{emptyMessage}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {actions.map((action) => {
            const cfg = typeConfig[action.type] || typeConfig.info;
            const Icon = cfg.icon;

            return (
              <div
                key={action.id || action.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  gap: 14,
                  flexWrap: 'wrap',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 240, flex: 1 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: cfg.iconBg,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color={cfg.color} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 750, color: cfg.color }}>
                        {action.title}
                      </span>
                      {Number(action.count) > 0 && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: cfg.badgeBg,
                            color: cfg.badgeColor,
                          }}
                        >
                          {action.count}
                        </span>
                      )}
                    </div>
                    {action.description && (
                      <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                        {action.description}
                      </div>
                    )}
                  </div>
                </div>

                {action.path && (
                  <button
                    type="button"
                    onClick={() => navigate(action.path)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      borderRadius: 7,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0f172a';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.color = '#0f172a';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    <span>{action.buttonLabel || 'Take Action'}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
