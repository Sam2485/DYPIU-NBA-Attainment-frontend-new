import React from 'react';
import { ArrowRight, AlertTriangle, Target } from 'lucide-react';

export default function BatchAttentionCard({
  batch,
  onSelectBatch = () => {},
}) {
  const programmeName = batch.programmeName || 'Programme';
  const batchName = batch.batchName || `Batch ${batch.startYear}-${batch.endYear}`;
  const deptName = batch.departmentName ? `${batch.departmentName} • ` : '';

  const totalEvaluated = (batch.posEvaluated || 0) + (batch.psosEvaluated || 0);
  const gapCount = batch.gapCount || 0;
  const poBelow = batch.poBelowTarget !== undefined ? batch.poBelowTarget : Math.max(0, (batch.posEvaluated || 0) - (batch.posMet || 0));
  const psoBelow = batch.psoBelowTarget !== undefined ? batch.psoBelowTarget : Math.max(0, (batch.psosEvaluated || 0) - (batch.psosMet || 0));

  return (
    <div
      onClick={() => onSelectBatch(batch.programmeBatchId)}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '18px 20px',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#cbd5e1';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.03)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              marginBottom: 4,
            }}
          >
            {deptName}{programmeName}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#0f172a',
            }}
          >
            {batchName}
          </div>
        </div>

        {/* Attention Summary Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          <AlertTriangle size={14} />
          <span>
            {gapCount} {totalEvaluated > 0 ? `/ ${totalEvaluated}` : ''} below target
          </span>
        </div>
      </div>

      {/* PO / PSO Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          background: '#f8fafc',
          borderRadius: 8,
          padding: '10px 14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={16} color="#ef4444" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
              PO
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>
              {poBelow} / {batch.posEvaluated || 0} below target
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
              PSO
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>
              {psoBelow} / {batch.psosEvaluated || 0} below target
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingTop: 4,
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectBatch(batch.programmeBatchId);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            color: '#2563eb',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span>View Batch Analytics</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
