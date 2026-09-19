import React from 'react';
import { Calendar, Target, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function LatestBatchContextCard({
  latestBatch,
  latestDataPoint,
  selectedOutcomeCode,
  selectedOutcomeType = 'PO',
}) {
  if (!latestBatch || !latestDataPoint) {
    return null;
  }

  const isPo = selectedOutcomeType === 'PO';
  const themeColor = isPo ? '#0284c7' : '#16a34a';

  const batchName = latestBatch.batchName || `Batch ${latestBatch.startYear}-${latestBatch.endYear}`;
  const finalAtt = latestDataPoint.finalAttainment != null ? Number(latestDataPoint.finalAttainment) : 0;
  const target = latestDataPoint.targetLevel != null ? Number(latestDataPoint.targetLevel) : 2.50;
  const gap = latestDataPoint.gap != null ? Number(latestDataPoint.gap) : Number((finalAtt - target).toFixed(2));
  const direct = latestDataPoint.directAttainment != null ? Number(latestDataPoint.directAttainment) : 0;
  const indirect = latestDataPoint.indirectAttainment != null ? Number(latestDataPoint.indirectAttainment) : 0;
  const isTargetMet = latestDataPoint.targetMet != null ? latestDataPoint.targetMet : finalAtt >= target;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '18px 24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 2px 0' }}>
            Latest Batch Context
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Reference attainment and target status for {batchName} ({selectedOutcomeCode})
          </span>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 800,
            background: isTargetMet ? '#dcfce7' : '#fee2e2',
            color: isTargetMet ? '#15803d' : '#b91c1c',
            border: `1px solid ${isTargetMet ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {isTargetMet ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{isTargetMet ? 'Target Met' : 'Below Target'}</span>
        </span>
      </div>

      {/* Metric Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}
      >
        {/* Latest Batch */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Latest Batch</span>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{batchName}</div>
          <span style={{ fontSize: 10.5, color: '#94a3b8' }}>Status: {latestBatch.status}</span>
        </div>

        {/* Final Attainment */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Final Attainment</span>
          <div style={{ fontSize: 18, fontWeight: 800, color: themeColor, marginTop: 2 }}>
            {finalAtt.toFixed(2)}
            <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}> / 3.00</span>
          </div>
        </div>

        {/* Target */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Target Level</span>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#334155', marginTop: 2 }}>
            {target.toFixed(2)}
            <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}> / 3.00</span>
          </div>
        </div>

        {/* Gap */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Attainment Gap</span>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: gap >= 0 ? '#15803d' : '#b91c1c',
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {gap >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{gap >= 0 ? `+${gap.toFixed(2)}` : gap.toFixed(2)}</span>
          </div>
        </div>

        {/* Direct */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Direct (80%)</span>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0284c7', marginTop: 3 }}>
            {direct.toFixed(2)}
          </div>
        </div>

        {/* Indirect */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Indirect (20%)</span>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0d9488', marginTop: 3 }}>
            {indirect.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
