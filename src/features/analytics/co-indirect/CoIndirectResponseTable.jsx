import React, { useState, useMemo } from 'react';
import { Table, Search, Filter, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

const LEVEL_COLORS = {
  1: { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', label: 'Level 1 — Slight' },
  2: { text: '#15803d', bg: '#f0fdf4', border: '#86efac', label: 'Level 2 — Moderate' },
  3: { text: '#14532d', bg: '#f0fdf4', border: '#4ade80', label: 'Level 3 — Substantial' },
};

export default function CoIndirectResponseTable({
  responseRecords = [],
  coCode = 'CO',
  validResponseCount = 0,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter records
  const filteredRecords = useMemo(() => {
    return responseRecords.filter((record) => {
      // Level filter
      if (levelFilter !== 'ALL' && String(record.ratingLevel) !== String(levelFilter)) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const ident = (record.responseIdentifier || '').toLowerCase();
        const prn = (record.maskedPrn || '').toLowerCase();
        const fb = (record.feedback || '').toLowerCase();
        const num = String(record.responseNumber || '');

        return ident.includes(query) || prn.includes(query) || fb.includes(query) || num.includes(query);
      }

      return true;
    });
  }, [responseRecords, levelFilter, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safeCurrentPage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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
      {/* Header */}
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
            <Table size={16} style={{ color: '#16a34a' }} />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Survey Response Evidence ({coCode})
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Individual course-end survey responses with privacy-safe masked identifiers.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              background: '#f1f5f9',
              padding: '4px 10px',
              borderRadius: 6,
              color: '#475569',
            }}
          >
            Total Valid Responses: <strong>{validResponseCount || responseRecords.length}</strong>
          </span>
        </div>
      </div>

      {/* Controls: Search, Level Filter, Page Size */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            padding: '6px 12px',
            flex: '1 1 240px',
            maxWidth: 320,
          }}
        >
          <Search size={14} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search response, masked PRN..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 12,
              width: '100%',
              color: '#0f172a',
            }}
          />
        </div>

        {/* Level Filter & Page Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Level:</span>
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '6px 10px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Levels</option>
              <option value="1">Level 1 — Slight</option>
              <option value="2">Level 2 — Moderate</option>
              <option value="3">Level 3 — Substantial</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '6px 10px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 13,
            background: '#f8fafc',
            borderRadius: 10,
          }}
        >
          {responseRecords.length === 0
            ? `No response records available for ${coCode}.`
            : 'No responses match the current search / filter criteria.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', width: 50 }}>#</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Response</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Masked PRN</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Rating</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Level</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((r, idx) => {
                const lvlInfo = LEVEL_COLORS[r.ratingLevel] || LEVEL_COLORS[1];
                const seq = (safeCurrentPage - 1) * pageSize + idx + 1;

                return (
                  <tr
                    key={r.responseIdentifier || r.responseNumber || idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    <td style={{ padding: '10px 14px', color: '#94a3b8', fontWeight: 700 }}>
                      {r.responseNumber ?? seq}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {r.responseIdentifier || `Response ${seq}`}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: '#334155' }}>
                      {r.maskedPrn || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      {r.rating != null ? Number(r.rating).toFixed(2) : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: lvlInfo.bg,
                          color: lvlInfo.text,
                          border: `1px solid ${lvlInfo.border}`,
                          fontWeight: 800,
                          fontSize: 11,
                        }}
                      >
                        Level {r.ratingLevel ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>
                      {r.feedback || lvlInfo.label.split('—')[1]?.trim() || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredRecords.length > pageSize && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid #f1f5f9',
            fontSize: 12,
            color: '#64748b',
          }}
        >
          <div>
            Showing <strong>{(safeCurrentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(safeCurrentPage * pageSize, filteredRecords.length)}</strong> of{' '}
            <strong>{filteredRecords.length}</strong> responses
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: safeCurrentPage <= 1 ? '#f8fafc' : '#ffffff',
                color: safeCurrentPage <= 1 ? '#94a3b8' : '#0f172a',
                cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 11.5,
              }}
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>

            <span style={{ padding: '0 8px', fontWeight: 700, color: '#0f172a' }}>
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: safeCurrentPage >= totalPages ? '#f8fafc' : '#ffffff',
                color: safeCurrentPage >= totalPages ? '#94a3b8' : '#0f172a',
                cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 11.5,
              }}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
