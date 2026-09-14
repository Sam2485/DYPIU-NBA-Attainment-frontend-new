import React, { useState } from 'react';

export default function OperationalBarChart({
  title = 'Workload & Course Distribution',
  subtitle = 'Breakdown across units',
  data = [], // [{ label: 'CSE', value: 24, total: 30, color: '#4f46e5', secondaryText: '24 courses' }, ...]
  valueLabel = 'Courses',
  emptyMessage = 'No comparative data available for this scope',
  onBarClick,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '20px 22px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 750, color: '#0f172a' }}>{title}</h4>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>{subtitle}</p>}
      </div>

      {data.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 10px',
            color: '#94a3b8',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>No Data</span>
          <span style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{emptyMessage}</span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {data.map((item, index) => {
            const val = Number(item.value) || 0;
            const percentage = Math.min(Math.round((val / maxValue) * 100), 100);
            const isHovered = hoveredIndex === index;
            const barColor = item.color || '#4f46e5';

            return (
              <div
                key={item.label || index}
                role={onBarClick ? 'button' : undefined}
                tabIndex={onBarClick ? 0 : undefined}
                onClick={() => onBarClick && onBarClick(item)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  cursor: onBarClick ? 'pointer' : 'default',
                  padding: '4px 6px',
                  borderRadius: 6,
                  background: isHovered ? '#f8fafc' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span
                    style={{
                      fontWeight: isHovered ? 700 : 600,
                      color: isHovered ? '#0f172a' : '#334155',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '65%',
                    }}
                  >
                    {item.label}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a' }}>
                      {val} <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>{valueLabel}</span>
                    </span>
                    {item.secondaryText && (
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>({item.secondaryText})</span>
                    )}
                  </div>
                </div>

                {/* Animated Horizontal Bar */}
                <div
                  style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 999,
                    background: '#f1f5f9',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      borderRadius: 999,
                      background: barColor,
                      transition: 'width 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                      opacity: isHovered ? 1 : 0.85,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
