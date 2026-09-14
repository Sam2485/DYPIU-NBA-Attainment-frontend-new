import React, { useState } from 'react';

export default function OperationalDonutChart({
  title = 'Workflow Status Distribution',
  subtitle = 'Reports and submissions breakdown',
  data = [], // [{ label: 'Approved', count: 18, color: '#10b981' }, ...]
  totalLabel = 'Total Reports',
  onSliceClick,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const total = data.reduce((sum, item) => sum + (Number(item.count) || 0), 0);

  // SVG parameters
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedAngle = -90; // Start at 12 o'clock

  const slices = data.map((item, index) => {
    const count = Number(item.count) || 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const strokeDash = (percentage / 100) * circumference;
    const strokeOffset = circumference - strokeDash;
    const startAngle = accumulatedAngle;
    accumulatedAngle += (percentage / 100) * 360;

    return {
      ...item,
      count,
      percentage,
      strokeDash,
      strokeOffset,
      startAngle,
      index,
    };
  });

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

      {total === 0 ? (
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
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '8px dashed #e2e8f0',
              display: 'grid',
              placeItems: 'center',
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>0</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>No reports recorded</span>
          <span style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
            No submissions in the selected scope
          </span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          {/* Donut SVG */}
          <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, margin: '0 auto' }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
            >
              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />

              {/* Slices */}
              {slices.map((slice) => {
                if (slice.count === 0) return null;
                const isHovered = hoveredIndex === slice.index;
                const strokeGap = circumference - slice.strokeDash;

                return (
                  <circle
                    key={slice.label}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${slice.strokeDash} ${strokeGap}`}
                    strokeDashoffset={-((slice.startAngle + 90) / 360) * circumference}
                    style={{
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: onSliceClick ? 'pointer' : 'default',
                      opacity: hoveredIndex === null || isHovered ? 1 : 0.65,
                    }}
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onSliceClick && onSliceClick(slice)}
                  />
                );
              })}
            </svg>

            {/* Center Label */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {hoveredIndex !== null ? slices[hoveredIndex]?.count : total}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: '#64748b',
                  marginTop: 3,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {hoveredIndex !== null ? slices[hoveredIndex]?.label : totalLabel}
              </span>
            </div>
          </div>

          {/* Compact Legend */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              flex: '1 1 140px',
              minWidth: 140,
            }}
          >
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.index;
              return (
                <div
                  key={slice.label}
                  role={onSliceClick ? 'button' : undefined}
                  tabIndex={onSliceClick ? 0 : undefined}
                  onClick={() => onSliceClick && onSliceClick(slice)}
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: isHovered ? '#f8fafc' : 'transparent',
                    cursor: onSliceClick ? 'pointer' : 'default',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: slice.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: isHovered ? 700 : 500,
                        color: isHovered ? '#0f172a' : '#334155',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {slice.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                      {slice.count}
                    </span>
                    <span style={{ fontSize: 10.5, color: '#94a3b8' }}>
                      ({Math.round(slice.percentage)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
