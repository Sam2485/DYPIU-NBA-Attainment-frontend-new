import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, School, User, Calendar, Award, Sparkles } from 'lucide-react';

export default function BatchContextBlock({ batch }) {
  const navigate = useNavigate();
  if (!batch) return null;

  const programmeName = batch.programme?.name || 'Programme';
  const programmeCode = batch.programme?.code ? ` (${batch.programme.code})` : '';
  const batchName = batch.batchName || `Batch ${batch.startYear || ''}-${batch.endYear || ''}`;
  const academicYear = batch.academicYear || `${batch.startYear || ''}–${batch.endYear || ''}`;
  const schoolName = batch.school?.name || '';
  const coordinatorName = batch.coordinatorName || 'Not Assigned';
  const status = batch.status || 'ACTIVE';

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
      {/* Top Breadcrumb & Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <ArrowLeft size={14} />
            <span>Live Batches</span>
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
            ANALYTICS / PROGRAMME / BATCH
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              const progId = batch.programme?.id || '';
              const batchId = batch.programmeBatchId || '';
              const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '';
              navigate(`${basePath}/analytics/quick-analysis?programmeBatchId=${batchId}&masterProgrammeId=${progId}`);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '1px solid #bae6fd',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: '#0369a1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(2, 132, 199, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0f2fe';
              e.currentTarget.style.borderColor = '#7dd3fc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
              e.currentTarget.style.borderColor = '#bae6fd';
            }}
          >
            <Sparkles size={13} color="#0284c7" />
            <span>Quick Analysis</span>
          </button>

          {/* Status Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
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
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: status === 'ACTIVE' ? '#16a34a' : '#94a3b8',
                display: 'inline-block',
              }}
            />
            {status}
          </span>
        </div>
      </div>

      {/* Main Identity Area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          {programmeName}{programmeCode}
        </h1>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0284c7',
            margin: 0,
          }}
        >
          {batchName}
        </div>

        {/* Compact Contextual Metadata */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
            marginTop: 10,
            paddingTop: 12,
            borderTop: '1px solid #f1f5f9',
            fontSize: 12.5,
            color: '#64748b',
          }}
        >
          {schoolName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <School size={15} color="#94a3b8" />
              <span>{schoolName}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={15} color="#94a3b8" />
            <span>
              Programme Coordinator: <strong style={{ color: '#334155' }}>{coordinatorName}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={15} color="#94a3b8" />
            <span>
              Academic Year: <strong style={{ color: '#334155' }}>{academicYear}</strong>
            </span>
          </div>
          {batch.currentSemester && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={15} color="#94a3b8" />
              <span>
                Semester: <strong style={{ color: '#334155' }}>Sem {batch.currentSemester}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
