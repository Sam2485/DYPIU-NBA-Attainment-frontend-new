import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Users } from 'lucide-react';

function formatNumber(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

export default function CoDirectStudentTable({
  students = [],
  coCode = 'CO',
  thresholdPercentage = 60,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'MET' | 'BELOW'
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Client-side filtering
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Status Filter
      if (statusFilter === 'MET' && !s.thresholdMet) return false;
      if (statusFilter === 'BELOW' && s.thresholdMet) return false;

      // 2. Search Query (PRN, studentName, or identifier)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const prnMatch = (s.prn || s.maskedPrn || '').toLowerCase().includes(q);
        const nameMatch = (s.studentName || s.studentIdentifier || '').toLowerCase().includes(q);
        if (!prnMatch && !nameMatch) return false;
      }

      return true;
    });
  }, [students, statusFilter, searchQuery]);

  // Pagination calculation
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedStudents = useMemo(() => {
    const startIndex = (effectivePage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, effectivePage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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
      {/* Header & Description */}
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
            <Users size={16} style={{ color: '#0284c7' }} />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
              }}
            >
              Student Evidence ({coCode})
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Individual student marks contributing to the selected CO's direct evidence.
          </span>
        </div>

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
          Total Students: <strong>{students.length}</strong>
        </span>
      </div>

      {/* Controls Bar: Search & Status Filter & Page Size */}
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
            minWidth: 260,
            flex: '1 1 260px',
            maxWidth: 380,
          }}
        >
          <Search size={14} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by PRN or Student Name..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 12.5,
              color: '#0f172a',
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 11,
                padding: 0,
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter & Page Size Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Status Segmented Filter */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '2px 4px',
              fontSize: 12,
            }}
          >
            <button
              type="button"
              onClick={() => handleFilterChange('ALL')}
              style={{
                border: 'none',
                background: statusFilter === 'ALL' ? '#0284c7' : 'transparent',
                color: statusFilter === 'ALL' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: 11.5,
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All ({students.length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('MET')}
              style={{
                border: 'none',
                background: statusFilter === 'MET' ? '#16a34a' : 'transparent',
                color: statusFilter === 'MET' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: 11.5,
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Meeting Threshold
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('BELOW')}
              style={{
                border: 'none',
                background: statusFilter === 'BELOW' ? '#d97706' : 'transparent',
                color: statusFilter === 'BELOW' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: 11.5,
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Below Threshold
            </button>
          </div>

          {/* Rows per page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 12,
                color: '#334155',
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

      {/* Table Section */}
      {paginatedStudents.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 13,
            background: '#f8fafc',
            borderRadius: 10,
          }}
        >
          {students.length === 0
            ? 'No student marks available for this Course Outcome.'
            : 'No students match the selected filter criteria.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', width: 60 }}>#</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>PRN</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Student Name</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Marks</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Max Marks</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Percentage</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Threshold</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((s, idx) => {
                const globalIndex = (effectivePage - 1) * pageSize + idx + 1;
                const isMeeting = s.thresholdMet === true;
                const prnDisplay = s.prn || s.maskedPrn || '—';
                const nameDisplay = s.studentName || s.studentIdentifier || `Student ${globalIndex}`;

                return (
                  <tr
                    key={s.id || s.prn || `std-${globalIndex}`}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    <td style={{ padding: '10px 14px', color: '#94a3b8', fontWeight: 600 }}>
                      {globalIndex}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', fontSize: 12 }}>
                      {prnDisplay}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#334155', fontWeight: 600 }}>
                      {nameDisplay}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>
                      {formatNumber(s.marksObtained)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>
                      {formatNumber(s.maxMarks)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: isMeeting ? '#15803d' : '#b45309' }}>
                      {formatNumber(s.percentage)}%
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b', fontSize: 11.5 }}>
                      {s.thresholdMarks != null
                        ? `${formatNumber(thresholdPercentage, 0)}% (${formatNumber(s.thresholdMarks, 1)})`
                        : `${formatNumber(thresholdPercentage, 0)}%`}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: isMeeting ? '#ecfdf5' : '#fffbeb',
                          color: isMeeting ? '#059669' : '#b45309',
                          border: `1px solid ${isMeeting ? '#a7f3d0' : '#fde68a'}`,
                        }}
                      >
                        {isMeeting ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {isMeeting ? 'Meeting Threshold' : 'Below Threshold'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
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
            Showing <strong>{(effectivePage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(effectivePage * pageSize, totalItems)}</strong> of{' '}
            <strong>{totalItems}</strong> students
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={() => handlePageChange(effectivePage - 1)}
              disabled={effectivePage <= 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: effectivePage <= 1 ? '#f1f5f9' : '#ffffff',
                color: effectivePage <= 1 ? '#94a3b8' : '#334155',
                cursor: effectivePage <= 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <span style={{ padding: '0 8px', fontWeight: 700, color: '#0f172a' }}>
              Page {effectivePage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => handlePageChange(effectivePage + 1)}
              disabled={effectivePage >= totalPages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: effectivePage >= totalPages ? '#f1f5f9' : '#ffffff',
                color: effectivePage >= totalPages ? '#94a3b8' : '#334155',
                cursor: effectivePage >= totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
