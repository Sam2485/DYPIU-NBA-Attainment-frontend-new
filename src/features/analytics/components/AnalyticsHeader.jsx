import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AnalyticsHeader({ lastRefreshed = null }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {/* Top Tag / Eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: 999 }}>
          <ShieldCheck size={14} color="#2563eb" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Institutional Quality Assurance Cell (IQAC)
          </span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontWeight: 600 }}>OBE Attainment Intelligence Engine</span>
          {lastRefreshed && (
            <span style={{ color: '#94a3b8' }}>• Updated {lastRefreshed}</span>
          )}
        </div>
      </div>

      {/* Main Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            Outcome Attainment & Quality Assurance Intelligence
          </h1>
        </div>
      </div>
    </div>
  );
}
