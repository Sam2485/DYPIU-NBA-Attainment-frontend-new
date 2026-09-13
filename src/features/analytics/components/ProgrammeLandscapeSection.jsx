import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyticsApi } from '../../../api';
import {
  Layers,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';

const selectStyle = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 12.5,
  fontWeight: 600,
  outline: 'none',
};

export default function ProgrammeLandscapeSection({
  selectedSchoolId = null,
  selectedDepartmentId = null,
  selectedMasterProgrammeId = null,
  selectedProgrammeBatchId = null,
  onSelectProgrammeCohort = () => {},
}) {
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('programmeName');
  const [direction, setDirection] = useState('ASC');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input by 300ms
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(val);
      setPage(0);
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setPage(0);
  };

  // Reset page to 0 when statusFilter, sortBy, direction, or parent scope changes
  useEffect(() => {
    setPage(0);
  }, [selectedSchoolId, selectedDepartmentId, selectedMasterProgrammeId, selectedProgrammeBatchId, statusFilter, sortBy, direction]);

  const loadProgrammeData = useCallback(async () => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    const params = {
      page,
      size,
      statusFilter,
      sortBy,
      direction,
    };
    if (selectedSchoolId) params.schoolId = selectedSchoolId;
    if (selectedDepartmentId) params.departmentId = selectedDepartmentId;
    if (selectedMasterProgrammeId) params.masterProgrammeId = selectedMasterProgrammeId;
    if (selectedProgrammeBatchId) params.programmeBatchId = selectedProgrammeBatchId;
    if (debouncedQuery && debouncedQuery.trim()) params.query = debouncedQuery.trim();

    try {
      const res = await analyticsApi.getProgrammes(params);
      if (!isCurrent) return;
      const data = res?.data?.data ?? res?.data ?? {};
      setRows(Array.isArray(data.content) ? data.content : []);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      if (!isCurrent) return;
      console.error('Failed to load programme landscape:', err);
      setError('Unable to load programme landscape data. Please try again.');
    } finally {
      if (isCurrent) {
        setIsLoading(false);
      }
    }

    return () => {
      isCurrent = false;
    };
  }, [page, size, statusFilter, sortBy, direction, selectedSchoolId, selectedDepartmentId, selectedMasterProgrammeId, selectedProgrammeBatchId, debouncedQuery]);

  useEffect(() => {
    loadProgrammeData();
  }, [loadProgrammeData]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setDirection('ASC');
    }
  };

  const fromIndex = totalElements > 0 ? page * size + 1 : 0;
  const toIndex = Math.min((page + 1) * size, totalElements);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Programme Cohort Attainment Landscape
          </h3>
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
        {/* Controls Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* Left: Search Box */}
          <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search programme, batch, dept..."
              aria-label="Search programme, batch, or department"
              style={{
                width: '100%',
                padding: '7px 32px 7px 32px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 12.5,
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search input"
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'grid',
                  placeItems: 'center',
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right: Status Filter & Sort Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>Status:</span>
              <select
                aria-label="Filter cohort attainment status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="ALL">All Cohort Statuses</option>
                <option value="ALL_TARGETS_MET">All Targets Met</option>
                <option value="HAS_GAPS">Has Deficits / Gaps</option>
                <option value="NO_FINALIZED_REPORT">No Finalized Report</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>Sort:</span>
              <select
                aria-label="Sort by column"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={selectStyle}
              >
                <option value="programmeName">Programme Name</option>
                <option value="posMet">POs Met</option>
                <option value="gapCount">Deficit Count</option>
                <option value="departmentName">Department</option>
                <option value="startYear">Cohort Year</option>
              </select>
              <button
                type="button"
                onClick={() => setDirection((d) => (d === 'ASC' ? 'DESC' : 'ASC'))}
                title={`Sort direction: ${direction}`}
                aria-label={`Sort direction ${direction === 'ASC' ? 'ascending' : 'descending'}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#4f46e5',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <ArrowUpDown size={13} />
                <span>{direction}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: 12.5,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color="#dc2626" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadProgrammeData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 6,
                background: '#ffffff',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        {/* Table Container */}
        <div className="report-table-scroll">
          <table className="audit-data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th
                  onClick={() => handleSort('programmeName')}
                  style={{ minWidth: 220, cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Programme & Degree
                    {sortBy === 'programmeName' && <span style={{ color: '#4f46e5' }}>{direction === 'ASC' ? '▲' : '▼'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('departmentName')}
                  style={{ minWidth: 180, cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Department / School
                    {sortBy === 'departmentName' && <span style={{ color: '#4f46e5' }}>{direction === 'ASC' ? '▲' : '▼'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('startYear')}
                  style={{ minWidth: 120, cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Cohort Batch
                    {sortBy === 'startYear' && <span style={{ color: '#4f46e5' }}>{direction === 'ASC' ? '▲' : '▼'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('posMet')}
                  style={{ minWidth: 140, textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    PO Health
                    {sortBy === 'posMet' && <span style={{ color: '#4f46e5' }}>{direction === 'ASC' ? '▲' : '▼'}</span>}
                  </div>
                </th>
                <th style={{ minWidth: 130, textAlign: 'center' }}>PSO Health</th>
                <th
                  onClick={() => handleSort('gapCount')}
                  style={{ minWidth: 120, textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Target Deficits
                    {sortBy === 'gapCount' && <span style={{ color: '#4f46e5' }}>{direction === 'ASC' ? '▲' : '▼'}</span>}
                  </div>
                </th>
                <th style={{ minWidth: 130, textAlign: 'center' }}>Report Status</th>
                <th style={{ minWidth: 130, textAlign: 'center' }}>ATR Status</th>
                <th style={{ minWidth: 110, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={9} style={{ padding: 12 }}>
                      <div
                        style={{
                          height: 32,
                          borderRadius: 6,
                          background: 'linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%)',
                          backgroundSize: '200% 100%',
                          animation: 'pulse 1.8s infinite',
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : rows.length > 0 ? (
                rows.map((row) => {
                  const isFinalized = row.reportAvailabilityStatus === 'FINALIZED_REPORT_AVAILABLE';
                  const rowKey = `${row.masterProgrammeId || ''}-${row.programmeBatchId || ''}`;

                  return (
                    <tr key={rowKey}>
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: 13 }}>{row.programmeName}</strong>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {row.degreeAwarded && (
                            <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                              {row.degreeAwarded}
                            </span>
                          )}
                          {row.programmeCode && <span>{row.programmeCode}</span>}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12.5, color: '#334155', fontWeight: 600 }}>
                          {row.departmentName || 'Department'}
                        </div>
                        {row.schoolName && (
                          <div style={{ fontSize: 11, color: '#64748b' }}>{row.schoolName}</div>
                        )}
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#0f172a',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {row.batchName || (row.startYear ? `Batch ${row.startYear}-${row.endYear || ''}` : 'Cohort')}
                        </span>
                      </td>

                      {/* PO Health */}
                      <td style={{ textAlign: 'center' }}>
                        {isFinalized ? (
                          <div>
                            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a' }}>
                              {row.posMet} / {row.posTotal} Met
                            </span>
                            <div style={{ fontSize: 10.5, color: '#64748b' }}>
                              {row.posEvaluated} evaluated
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                            No finalized report
                          </span>
                        )}
                      </td>

                      {/* PSO Health */}
                      <td style={{ textAlign: 'center' }}>
                        {isFinalized ? (
                          <div>
                            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a' }}>
                              {row.psosMet} / {row.psosTotal} Met
                            </span>
                            <div style={{ fontSize: 10.5, color: '#64748b' }}>
                              {row.psosEvaluated} evaluated
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>--</span>
                        )}
                      </td>

                      {/* Target Deficits */}
                      <td style={{ textAlign: 'center' }}>
                        {isFinalized ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: row.hasGaps ? '#fffbeb' : '#ecfdf5',
                              color: row.hasGaps ? '#b45309' : '#059669',
                              border: `1px solid ${row.hasGaps ? '#fde68a' : '#a7f3d0'}`,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {row.hasGaps ? `${row.gapCount} Deficit${row.gapCount > 1 ? 's' : ''}` : 'No Gaps'}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>--</span>
                        )}
                      </td>

                      {/* Report Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: 10.5,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            background: isFinalized ? '#ecfdf5' : '#f8fafc',
                            color: isFinalized ? '#059669' : '#64748b',
                            border: `1px solid ${isFinalized ? '#a7f3d0' : '#e2e8f0'}`,
                          }}
                        >
                          {row.underlyingReportStatus || (isFinalized ? 'FINALIZED' : 'NO REPORT')}
                        </span>
                      </td>

                      {/* ATR Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: 10.5,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            background: row.atrStatus === 'APPROVED' ? '#ecfdf5' : row.atrStatus === 'SUBMITTED' || row.atrStatus === 'SUBMITTED_FOR_VERIFICATION' ? '#f0f9ff' : row.atrStatus === 'DRAFT' ? '#fffbeb' : '#f8fafc',
                            color: row.atrStatus === 'APPROVED' ? '#059669' : row.atrStatus === 'SUBMITTED' || row.atrStatus === 'SUBMITTED_FOR_VERIFICATION' ? '#0284c7' : row.atrStatus === 'DRAFT' ? '#d97706' : '#64748b',
                            border: '1px solid transparent',
                          }}
                        >
                          {row.atrStatus || 'NOT_RECORDED'}
                        </span>
                      </td>

                      {/* Action Button: Scope Transition */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => onSelectProgrammeCohort({
                            schoolId: row.schoolId,
                            departmentId: row.departmentId,
                            masterProgrammeId: row.masterProgrammeId,
                            programmeBatchId: row.programmeBatchId,
                          })}
                          title="Open Programme-scoped Analytics"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: '#4f46e5',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <ExternalLink size={12} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Layers size={28} color="#94a3b8" />
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>No Programme Cohorts Found</strong>
                      <span style={{ fontSize: 12, maxWidth: 360 }}>
                        {debouncedQuery || statusFilter !== 'ALL'
                          ? 'Try changing or resetting your search query or status filter.'
                          : 'No programme cohort records are currently available for this academic scope.'}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary Footer */}
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12,
            color: '#64748b',
          }}
        >
          <div>
            Showing <strong style={{ color: '#0f172a' }}>{fromIndex}</strong> to <strong style={{ color: '#0f172a' }}>{toIndex}</strong> of <strong style={{ color: '#0f172a' }}>{totalElements}</strong> cohorts
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Rows per page:</span>
              <select
                aria-label="Rows per page"
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                style={{ ...selectStyle, padding: '4px 8px' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Page {totalPages > 0 ? page + 1 : 1} of {Math.max(1, totalPages)}</span>
              <div style={{ display: 'inline-flex', gap: 4 }}>
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={page === 0 || isLoading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: page === 0 ? '#f8fafc' : '#ffffff',
                    color: page === 0 ? '#94a3b8' : '#0f172a',
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={page >= totalPages - 1 || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: page >= totalPages - 1 ? '#f8fafc' : '#ffffff',
                    color: page >= totalPages - 1 ? '#94a3b8' : '#0f172a',
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
