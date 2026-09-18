import React from 'react';

const skeletonItem = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite ease-in-out',
  borderRadius: 8,
};

export default function AnalyticsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* KPI Skeletons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '24px',
              height: 104,
              ...skeletonItem,
            }}
          />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            height: 340,
            ...skeletonItem,
          }}
        />
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            height: 340,
            ...skeletonItem,
          }}
        />
      </div>

      {/* Batch Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 16,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              height: 160,
              ...skeletonItem,
            }}
          />
        ))}
      </div>
    </div>
  );
}
