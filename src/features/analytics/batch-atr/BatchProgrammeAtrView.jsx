import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { academicApi } from '../../../api';
import ProgrammeATR from '../../atr/ProgrammeATR';
import { ArrowLeft, School, Layers, Calendar, RefreshCw, AlertCircle } from 'lucide-react';

export default function BatchProgrammeAtrView() {
  const { programmeBatchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const batchAnalyticsPath = isAdminRoute
    ? `/admin/analytics/batch/${programmeBatchId}`
    : `/analytics/batch/${programmeBatchId}`;

  useEffect(() => {
    if (!programmeBatchId) {
      setError('Programme batch identifier is required.');
      setLoading(false);
      return;
    }

    setLoading(true);
    academicApi
      .getBatchById(programmeBatchId)
      .then((res) => {
        const payload = res?.data ?? res;
        setBatch(payload);
      })
      .catch((err) => {
        console.error('[BatchProgrammeAtrView] Error loading batch metadata:', err);
        // Silently continue since ProgrammeATR will load its own batch ATR data
      })
      .finally(() => {
        setLoading(false);
      });
  }, [programmeBatchId]);

  const programmeName = batch?.programme?.name || batch?.masterProgramme?.name || 'Programme';
  const batchName = batch?.name || batch?.batchName || `Batch ${batch?.startYear || ''}–${batch?.endYear || ''}`;
  const status = batch?.status || 'ACTIVE';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Header & Breadcrumbs */}
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
            marginBottom: 14,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate(batchAnalyticsPath)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.color = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Batch Analytics</span>
            </button>

            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em' }}>
              ANALYTICS / BATCH / PROGRAMME ATR
            </span>
          </div>

          {/* Batch Status Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: status === 'ACTIVE' ? '#f0fdf4' : '#f8fafc',
              color: status === 'ACTIVE' ? '#166534' : '#64748b',
              border: `1px solid ${status === 'ACTIVE' ? '#bbf7d0' : '#e2e8f0'}`,
            }}
          >
            {status}
          </span>
        </div>

        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Programme Action Taken Report (ATR)
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#64748b', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#0284c7' }}>{programmeName}</span>
            <span>•</span>
            <span style={{ fontWeight: 600, color: '#334155' }}>{batchName}</span>
            <span>•</span>
            <span>Authoritative attainment analysis, gap identification &amp; corrective actions</span>
          </div>
        </div>
      </div>

      {/* Programme ATR Component in Reports Read-Only Mode (Print option and batch selectors removed) */}
      <ProgrammeATR
        readOnly
        hideFooter={true}
        hideHeader={false}
        showBatchSelector={false}
        showHeaderActions={false}
        batchId={programmeBatchId}
        programmeId={batch?.masterProgrammeId || batch?.programme?.id}
        useBatchApprovalWorkspace={true}
      />
    </div>
  );
}
