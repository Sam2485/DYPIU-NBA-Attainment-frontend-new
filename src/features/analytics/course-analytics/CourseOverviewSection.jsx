import React from 'react';
import { Target, Layers, PieChart, CheckCircle2, AlertCircle } from 'lucide-react';

function formatVal(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

export default function CourseOverviewSection({
  overallCourseAttainment,
  directAttainment,
  indirectAttainment,
  directWeight = 80,
  indirectWeight = 20,
  directThreshold,
  indirectThreshold,
  attainmentStatus,
}) {
  const directWeightVal = Number(directWeight != null ? directWeight : 80);
  const indirectWeightVal = Number(indirectWeight != null ? indirectWeight : 20);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: '#4f46e5',
                display: 'inline-block',
              }}
            />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              Course Attainment Overview
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Overall weighted attainment of the course calculated from Direct Examinations and Indirect Course-End Survey.
          </span>
        </div>

        {/* Weighting Formula Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px',
            borderRadius: 8,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: 11.5,
            fontWeight: 700,
            color: '#475569',
          }}
        >
          <span>Weight Distribution:</span>
          <span style={{ color: '#0284c7' }}>{directWeightVal}% Direct</span>
          <span>+</span>
          <span style={{ color: '#16a34a' }}>{indirectWeightVal}% Indirect</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {/* 1. Overall Course Attainment */}
        <div
          style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Overall Course Attainment
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#ede9fe',
                color: '#6d28d9',
              }}
            >
              {attainmentStatus || 'Evaluated'}
            </span>
          </div>

          <div style={{ margin: '12px 0 6px' }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#581c87', letterSpacing: '-0.02em' }}>
              {formatVal(overallCourseAttainment)}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#9333ea', marginLeft: 6 }}>/ 3.00</span>
          </div>

          <span style={{ fontSize: 11.5, color: '#7e22ce', fontWeight: 600 }}>
            Formula: ({directWeightVal}% × Direct) + ({indirectWeightVal}% × Indirect)
          </span>
        </div>

        {/* 2. Direct Attainment */}
        <div
          style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Direct Attainment
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#e0f2fe',
                color: '#0284c7',
              }}
            >
              Weight: {directWeightVal}%
            </span>
          </div>

          <div style={{ margin: '12px 0 6px' }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#0369a1', letterSpacing: '-0.02em' }}>
              {formatVal(directAttainment)}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginLeft: 6 }}>/ 3.00</span>
          </div>

          <span style={{ fontSize: 11.5, color: '#0369a1', fontWeight: 600 }}>
            Based on student end-sem & internal examination marks
          </span>
        </div>

        {/* 3. Indirect Attainment */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Indirect Attainment
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#dcfce7',
                color: '#16a34a',
              }}
            >
              Weight: {indirectWeightVal}%
            </span>
          </div>

          <div style={{ margin: '12px 0 6px' }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#15803d', letterSpacing: '-0.02em' }}>
              {formatVal(indirectAttainment)}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', marginLeft: 6 }}>/ 3.00</span>
          </div>

          <span style={{ fontSize: 11.5, color: '#15803d', fontWeight: 600 }}>
            Based on student Course-End Survey feedback
          </span>
        </div>
      </div>
    </div>
  );
}
