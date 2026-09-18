import React from 'react';
import { Layers, AlertTriangle, Target } from 'lucide-react';

export default function AnalyticsKpiCards({
  activeBatchesCount = 0,
  poDeficitCount = 0,
  psoDeficitCount = 0,
  isLoading = false,
}) {
  const cards = [
    {
      id: 'active-batches',
      label: 'Active Batches',
      value: activeBatchesCount,
      icon: Layers,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      borderColor: '#bfdbfe',
    },
    {
      id: 'po-below-target',
      label: 'PO Below Target',
      value: poDeficitCount,
      icon: Target,
      iconBg: '#e0f2fe',
      iconColor: '#0284c7',
      borderColor: '#bae6fd',
    },
    {
      id: 'pso-below-target',
      label: 'PSO Below Target',
      value: psoDeficitCount,
      icon: AlertTriangle,
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
      borderColor: '#bbf7d0',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            style={{
              background: '#ffffff',
              border: `1px solid ${card.borderColor}`,
              borderRadius: 12,
              padding: '20px 24px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 8,
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.1,
                }}
              >
                {isLoading ? '—' : card.value}
              </div>
            </div>

            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: card.iconBg,
                color: card.iconColor,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
