import React from 'react';
import { Layers, ArrowUpRight, CheckCircle2, AlertTriangle, Clock, Eye, Info } from 'lucide-react';

export default function ProgrammeLandscapeSection({
  programmes = [],
  batches = [],
  isLoading = false,
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Programme Cohort Attainment Landscape
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
            Multi-programme comparative matrix tracking outcome compliance, target deficits, and CQI Action Taken Report status across schools.
          </p>
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 20,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div className="report-table-scroll">
          <table className="audit-data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Programme & Degree</th>
                <th style={{ minWidth: 180 }}>Department / School</th>
                <th style={{ minWidth: 130 }}>Cohort Batch</th>
                <th style={{ minWidth: 140, textAlign: 'center' }}>Overall Attainment</th>
                <th style={{ minWidth: 140, textAlign: 'center' }}>POs Met / Evaluated</th>
                <th style={{ minWidth: 120, textAlign: 'center' }}>Target Deficits</th>
                <th style={{ minWidth: 140, textAlign: 'center' }}>ATR Status</th>
                <th style={{ minWidth: 100, textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {programmes.length > 0 ? (
                programmes.slice(0, 6).map((prog, idx) => (
                  <tr key={prog.id || prog.masterProgrammeId || idx}>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: 13 }}>{prog.name}</strong>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {prog.degreeAwarded || prog.degree || 'Degree Programme'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, color: '#334155' }}>
                        {prog.department || 'Academic Department'}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        All Batches
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 48, height: 6, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                          <div style={{ width: '70%', height: '100%', background: '#4f46e5' }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#64748b' }}>--</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>-- / 12</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: '#f8fafc',
                          color: '#64748b',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        -- Deficits
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: '#ecfdf5',
                          color: '#059669',
                          fontSize: 10.5,
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Active
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#4f46e5',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Layers size={28} color="#94a3b8" />
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>No Programme Records Loaded</strong>
                      <span style={{ fontSize: 12 }}>
                        Programme landscape data will populate automatically from the backend.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: 11.5, color: '#64748b' }}>
          <span>Showing institutional landscape across active accredited curricula</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Target Met
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Target Deficit
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b' }} /> Not Evaluated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
