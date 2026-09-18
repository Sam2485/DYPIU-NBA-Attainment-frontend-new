import React from 'react';
import BatchAttentionCard from './BatchAttentionCard';

export default function BatchAttentionList({
  batches = [],
  onSelectBatch = () => {},
}) {
  const attentionBatches = (batches || []).filter((b) => (b.gapCount || 0) > 0);

  if (attentionBatches.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: 0,
          }}
        >
          LIVE BATCHES REQUIRING ATTENTION
        </h3>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#475569',
          }}
        >
          {attentionBatches.length} {attentionBatches.length === 1 ? 'Batch' : 'Batches'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 16,
        }}
      >
        {attentionBatches.map((batch) => (
          <BatchAttentionCard
            key={batch.programmeBatchId || batch.id}
            batch={batch}
            onSelectBatch={onSelectBatch}
          />
        ))}
      </div>
    </div>
  );
}
