import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  Eye,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Activity,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Download,
} from 'lucide-react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import { auditApi } from '../../api/audit';

// ── Style Tokens ─────────────────────────────────────────────────────────────
const surfaceCard = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
};

const inputBase = {
  height: '38px',
  fontSize: '12.5px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '0 11px',
  background: '#ffffff',
  color: '#0f172a',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
};

const selectBase = {
  ...inputBase,
  cursor: 'pointer',
  appearance: 'auto',
};

// ── Resource Grouping Map ────────────────────────────────────────────────────
const DOMAIN_RESOURCES = {
  ALL: null,
  ACADEMIC: [
    'SCHOOL',
    'DEPARTMENT',
    'MASTER_PROGRAMME',
    'PROGRAMME_BATCH',
    'MASTER_COURSE',
    'PROGRAMME_BATCH_COURSE',
    'PROGRAMME_OUTCOME',
    'PROGRAMME_SPECIFIC_OUTCOME',
    'PEO_OUTCOME',
    'COURSE_OUTCOME',
    'CO_PO_MAPPING',
    'CO_PSO_MAPPING',
  ],
  ATTAINMENT: [
    'ATTAINMENT_CONFIGURATION',
    'DIRECT_ASSESSMENT',
    'INDIRECT_ASSESSMENT',
    'COURSE_ATTAINMENT',
    'PROGRAMME_ATTAINMENT',
  ],
  WORKFLOW: [
    'COURSE_ATR',
    'PROGRAMME_ATR',
    'APPROVAL_REQUEST',
  ],
  SECURITY: [
    'USER',
    'ROLE_ASSIGNMENT',
    'DELETION_REQUEST',
  ],
};

const RESOURCE_TYPES = [
  { value: '', label: 'All Resources' },
  { value: 'PROGRAMME_BATCH', label: 'Programme Batch' },
  { value: 'PROGRAMME_BATCH_COURSE', label: 'Batch Course Offering' },
  { value: 'MASTER_PROGRAMME', label: 'Master Programme' },
  { value: 'DEPARTMENT', label: 'Department' },
  { value: 'SCHOOL', label: 'School' },
  { value: 'COURSE_OUTCOME', label: 'Course Outcome (CO)' },
  { value: 'PROGRAMME_OUTCOME', label: 'Programme Outcome (PO)' },
  { value: 'PROGRAMME_SPECIFIC_OUTCOME', label: 'PSO' },
  { value: 'CO_PO_MAPPING', label: 'CO-PO Mapping Matrix' },
  { value: 'CO_PSO_MAPPING', label: 'CO-PSO Mapping Matrix' },
  { value: 'DIRECT_ASSESSMENT', label: 'Direct Assessment (Marks)' },
  { value: 'INDIRECT_ASSESSMENT', label: 'Indirect Assessment (Survey)' },
  { value: 'COURSE_ATR', label: 'Course ATR' },
  { value: 'PROGRAMME_ATR', label: 'Programme ATR' },
  { value: 'APPROVAL_REQUEST', label: 'Approval Request' },
  { value: 'DELETION_REQUEST', label: 'Deletion Request' },
  { value: 'USER', label: 'User Account' },
  { value: 'ROLE_ASSIGNMENT', label: 'Role Assignment' },
];

const ACTION_TYPES = [
  { value: '', label: 'All Operations' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'SUBMIT', label: 'Submit for Review' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REQUEST_REVISION', label: 'Request Revision' },
  { value: 'RESUBMIT', label: 'Resubmit' },
  { value: 'ASSIGN_COORDINATOR', label: 'Assign Coordinator' },
  { value: 'ALLOCATE_COURSES', label: 'Allocate Courses' },
  { value: 'UPLOAD_MARKS', label: 'Upload Marks' },
  { value: 'UPLOAD_SURVEY', label: 'Upload Survey' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
];

const ACTOR_ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'IQAC', label: 'IQAC' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'HOD', label: 'HOD' },
  { value: 'PROGRAMME_COORDINATOR', label: 'Programme Coordinator' },
  { value: 'COURSE_COORDINATOR', label: 'Course Coordinator' },
  { value: 'FACULTY', label: 'Faculty' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SYSTEM', label: 'System' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return String(isoString);
  }
};

const getRelativeTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);
    if (diffSecs < 60) return 'just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return '';
  } catch {
    return '';
  }
};

const getActionBadgeStyle = (action) => {
  switch (action) {
    case 'CREATE':
    case 'APPROVE':
    case 'DELETE_APPROVED':
      return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
    case 'UPDATE':
    case 'ASSIGN_COORDINATOR':
    case 'ALLOCATE_COURSES':
      return { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc' };
    case 'SUBMIT':
    case 'RESUBMIT':
    case 'UPLOAD_MARKS':
    case 'UPLOAD_SURVEY':
      return { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' };
    case 'REQUEST_REVISION':
    case 'DELETE_REQUESTED':
      return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
    case 'DELETE':
    case 'DELETE_REJECTED':
    case 'DELETE_EXECUTED':
      return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
    case 'LOGIN':
    case 'LOGOUT':
      return { bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' };
    default:
      return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  }
};

const getRoleBadgeStyle = (role) => {
  switch (String(role).toUpperCase()) {
    case 'IQAC':
      return { bg: '#fdf4ff', color: '#a21caf', border: '#f0abfc' };
    case 'DIRECTOR':
      return { bg: '#e0f2fe', color: '#0284c7', border: '#7dd3fc' };
    case 'HOD':
      return { bg: '#eef2ff', color: '#4f46e5', border: '#c7d2fe' };
    case 'PROGRAMME_COORDINATOR':
      return { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' };
    case 'COURSE_COORDINATOR':
    case 'FACULTY':
      return { bg: '#f8fafc', color: '#334155', border: '#cbd5e1' };
    case 'SYSTEM':
      return { bg: '#faf5ff', color: '#7e22ce', border: '#d8b4fe' };
    default:
      return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  }
};

export default function IqacAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Pagination State
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters State
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successFilter, setSuccessFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modal Inspector State
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const params = {
        page,
        size: pageSize,
      };

      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resourceType = resourceFilter;
      if (roleFilter) params.actorRole = roleFilter;
      if (successFilter !== '') params.success = successFilter === 'true';
      if (fromDate) params.from = new Date(fromDate).toISOString();
      if (toDate) params.to = new Date(toDate + 'T23:59:59').toISOString();

      const response = await auditApi.getAuditLogs(params);
      const data = response?.data?.data || response?.data || {};

      const content = Array.isArray(data.content) ? data.content : [];
      setLogs(content);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || content.length);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Unable to retrieve audit logs.');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, fromDate, page, pageSize, resourceFilter, roleFilter, successFilter, toDate]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Handle Domain Quick-Filter
  const handleDomainSelect = (domainKey) => {
    setDomainFilter(domainKey);
    setPage(0);
    if (domainKey === 'ALL') {
      setResourceFilter('');
    } else {
      const allowed = DOMAIN_RESOURCES[domainKey];
      if (allowed && allowed.length > 0) {
        // If current resourceFilter isn't in this domain, reset or set to first
        if (!allowed.includes(resourceFilter)) {
          setResourceFilter('');
        }
      }
    }
  };

  const handleResetFilters = () => {
    setDomainFilter('ALL');
    setActionFilter('');
    setResourceFilter('');
    setRoleFilter('');
    setSearchQuery('');
    setSuccessFilter('');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  // Client-side text search on current page results
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase().trim();
    return logs.filter((log) => {
      return (
        log.actorName?.toLowerCase().includes(q) ||
        log.actorEmail?.toLowerCase().includes(q) ||
        log.actorRole?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.resourceType?.toLowerCase().includes(q) ||
        log.resourceId?.toLowerCase().includes(q) ||
        log.remarks?.toLowerCase().includes(q) ||
        log.ipAddress?.toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery]);

  const handleCopyJson = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Email', 'Role', 'Action', 'Resource Type', 'Resource ID', 'Old Status', 'New Status', 'Success', 'Remarks', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.createdAt,
      `"${(l.actorName || '').replace(/"/g, '""')}"`,
      `"${(l.actorEmail || '').replace(/"/g, '""')}"`,
      l.actorRole,
      l.action,
      l.resourceType,
      `"${(l.resourceId || '').replace(/"/g, '""')}"`,
      l.oldStatus || '',
      l.newStatus || '',
      l.success ? 'TRUE' : 'FALSE',
      `"${(l.remarks || '').replace(/"/g, '""')}"`,
      l.ipAddress || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dypiu_nba_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />

        <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto' }}>

          {/* ── Header Card ────────────────────────────────────────── */}
          <div style={{ ...surfaceCard, padding: '22px 24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    IQAC Compliance Trail
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#10b981', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} /> Tamper-Evident Logs
                  </span>
                </div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>
                  Institutional Audit Logs
                </h2>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>
                  Comprehensive, real-time audit record of academic modifications, marks uploads, attainment executions, and administrative approvals.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={fetchAuditLogs}
                  disabled={isLoading}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCcw size={14} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={filteredLogs.length === 0}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    border: '1px solid #c7d2fe',
                    background: '#eef2ff',
                    color: '#4f46e5',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    cursor: filteredLogs.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: filteredLogs.length === 0 ? 0.6 : 1,
                  }}
                >
                  <Download size={14} />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Domain Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              {[
                { id: 'ALL', label: 'All Operations' },
                { id: 'ACADEMIC', label: '📚 Academic Structure & Courses' },
                { id: 'ATTAINMENT', label: '📊 Marks & Attainment' },
                { id: 'WORKFLOW', label: '⚡ Approvals & ATR' },
                { id: 'SECURITY', label: '🔒 Users & Governance' },
              ].map((pill) => {
                const isSelected = domainFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => handleDomainSelect(pill.id)}
                    style={{
                      height: '32px',
                      padding: '0 13px',
                      borderRadius: '7px',
                      border: isSelected ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                      background: isSelected ? '#4f46e5' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontSize: '12px',
                      fontWeight: isSelected ? '800' : '600',
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Filter & Search Toolbar ────────────────────────────── */}
          <div style={{ ...surfaceCard, padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', alignItems: 'center' }}>

              {/* Search Box */}
              <div style={{ minWidth: '220px', gridColumn: 'span 1' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '11px', top: '12px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search actor, remarks, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ ...inputBase, paddingLeft: '32px' }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '9px', top: '10px', border: 0, background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Filter */}
              <div>
                <select
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                  style={selectBase}
                >
                  {ACTION_TYPES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              {/* Resource Filter */}
              <div>
                <select
                  value={resourceFilter}
                  onChange={(e) => { setResourceFilter(e.target.value); setPage(0); }}
                  style={selectBase}
                >
                  {RESOURCE_TYPES.filter((r) => {
                    if (domainFilter === 'ALL' || !r.value) return true;
                    return DOMAIN_RESOURCES[domainFilter]?.includes(r.value);
                  }).map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                  style={selectBase}
                >
                  {ACTOR_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* From Date */}
              <div>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
                  style={inputBase}
                  title="From date"
                />
              </div>

              {/* To Date */}
              <div>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setPage(0); }}
                  style={inputBase}
                  title="To date"
                />
              </div>

              {/* Reset Filters */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Reset
                </button>
              </div>

            </div>
          </div>

          {/* ── Error Banner ───────────────────────────────────────── */}
          {errorMessage && (
            <div style={{ ...surfaceCard, background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 18px', marginBottom: '20px', color: '#b91c1c', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={17} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ── Audit Logs Table Card ──────────────────────────────── */}
          <div style={{ ...surfaceCard, overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="audit-data-table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actor</th>
                    <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Operation</th>
                    <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target Resource</th>
                    <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>State Change</th>
                    <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Audited Remarks</th>
                    <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <RotateCcw size={16} className="animate-spin" />
                          <span>Loading institutional audit history…</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                        <ShieldCheck size={36} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>No audit records found</div>
                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                          Try adjusting your search terms or filter criteria.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const actionStyle = getActionBadgeStyle(log.action);
                      const roleStyle = getRoleBadgeStyle(log.actorRole);
                      const relative = getRelativeTime(log.createdAt);

                      return (
                        <tr
                          key={log.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* Timestamp */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                              {formatDateTime(log.createdAt)}
                            </div>
                            {relative && (
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                {relative}
                              </div>
                            )}
                          </td>

                          {/* Actor */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: roleStyle.bg,
                                  border: `1px solid ${roleStyle.border}`,
                                  color: roleStyle.color,
                                  fontWeight: '800',
                                  fontSize: '11.5px',
                                  display: 'grid',
                                  placeItems: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {log.actorName ? log.actorName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                                  {log.actorName || log.actorEmail || 'System'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                  <span
                                    style={{
                                      fontSize: '10.5px',
                                      fontWeight: '700',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      background: roleStyle.bg,
                                      color: roleStyle.color,
                                      border: `1px solid ${roleStyle.border}`,
                                    }}
                                  >
                                    {log.actorRole || 'SYSTEM'}
                                  </span>
                                  {log.actorEmail && log.actorName && (
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                      {log.actorEmail}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Action */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: '800',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: actionStyle.bg,
                                color: actionStyle.color,
                                border: `1px solid ${actionStyle.border}`,
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                              }}
                            >
                              {log.action}
                            </span>
                          </td>

                          {/* Target Resource */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                              {String(log.resourceType || '—').replaceAll('_', ' ')}
                            </div>
                            {log.resourceId && (
                              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px', wordBreak: 'break-all', maxWidth: '220px' }}>
                                {log.resourceId}
                              </div>
                            )}
                          </td>

                          {/* State Change */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            {log.oldStatus || log.newStatus ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px' }}>
                                {log.oldStatus && (
                                  <span style={{ color: '#64748b', fontWeight: '600' }}>{log.oldStatus}</span>
                                )}
                                {log.oldStatus && log.newStatus && (
                                  <ArrowRight size={11} style={{ color: '#94a3b8' }} />
                                )}
                                {log.newStatus && (
                                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{log.newStatus}</span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                            )}
                          </td>

                          {/* Remarks */}
                          <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                            <div
                              style={{
                                fontSize: '12px',
                                color: '#475569',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={log.remarks || ''}
                            >
                              {log.remarks || '—'}
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedLog(log)}
                              style={{
                                height: '29px',
                                padding: '0 10px',
                                borderRadius: '6px',
                                border: '1px solid #c7d2fe',
                                background: '#ffffff',
                                color: '#4f46e5',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '11.5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontFamily: 'inherit',
                              }}
                            >
                              <Eye size={12} /> Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div
              style={{
                padding: '12px 20px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Showing <strong>{filteredLogs.length}</strong> of <strong>{totalElements}</strong> total audit records
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                    style={{ ...selectBase, height: '30px', padding: '0 8px', width: 'auto', fontSize: '11.5px' }}
                  >
                    {[10, 20, 50, 100].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0 || isLoading}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: page === 0 ? '#cbd5e1' : '#475569',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: page === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155', padding: '0 6px' }}>
                    Page {page + 1} of {Math.max(1, totalPages)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1 || isLoading}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: page >= totalPages - 1 ? '#cbd5e1' : '#475569',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── AUDIT RECORD INSPECTOR MODAL ───────────────────────── */}
        {selectedLog && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1001,
              display: 'grid',
              placeItems: 'center',
              padding: '20px',
              background: 'rgba(15, 23, 42, 0.58)',
              backdropFilter: 'blur(3px)',
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              style={{
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                background: '#ffffff',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0e7ff', color: '#4f46e5', display: 'grid', placeItems: 'center' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '800' }}>
                      Audit Record Details
                    </h3>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Log Event ID: #{selectedLog.id}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  style={{ border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '22px 24px', overflowY: 'auto', display: 'grid', gap: '18px' }}>

                {/* Primary Attributes Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Actor Identity</span>
                    <div style={{ marginTop: '4px', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{selectedLog.actorName || selectedLog.actorEmail || 'System'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedLog.actorEmail || '—'}</div>
                  </div>

                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Role & Status</span>
                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 7px', borderRadius: '4px', background: '#eef2ff', color: '#4f46e5' }}>
                        {selectedLog.actorRole}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 7px', borderRadius: '4px', background: selectedLog.success ? '#dcfce7' : '#fee2e2', color: selectedLog.success ? '#15803d' : '#b91c1c' }}>
                        {selectedLog.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Operation & Resource</span>
                    <div style={{ marginTop: '4px', fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                      {selectedLog.action} · {selectedLog.resourceType}
                    </div>
                    {selectedLog.resourceId && (
                      <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {selectedLog.resourceId}
                      </div>
                    )}
                  </div>
                </div>

                {/* State Transition */}
                {(selectedLog.oldStatus || selectedLog.newStatus) && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Lifecycle State Transition
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f1f5f9', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                        {selectedLog.oldStatus || 'NONE'}
                      </span>
                      <ArrowRight size={14} style={{ color: '#64748b' }} />
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                        {selectedLog.newStatus || 'NONE'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Audited Remarks */}
                {selectedLog.remarks && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Audited Remarks & Reason
                    </label>
                    <div style={{ padding: '11px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12.5px', color: '#1e293b', lineHeight: 1.5 }}>
                      {selectedLog.remarks}
                    </div>
                  </div>
                )}

                {/* Network & Provenance Context */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Network & Security Provenance
                  </label>
                  <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'grid', gap: '6px', fontSize: '12px', color: '#334155' }}>
                    <div>🌐 <strong>IP Address:</strong> {selectedLog.ipAddress || 'Internal / Proxy Resolved'}</div>
                    <div style={{ wordBreak: 'break-all' }}>💻 <strong>Client User Agent:</strong> {selectedLog.userAgent || '—'}</div>
                    <div>🕒 <strong>Created At (UTC/ISO):</strong> {selectedLog.createdAt}</div>
                  </div>
                </div>

                {/* Metadata JSON Viewer */}
                {selectedLog.metadata && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ margin: 0, fontSize: '11.5px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                        Context Metadata (Sanitized)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleCopyJson(typeof selectedLog.metadata === 'string' ? selectedLog.metadata : JSON.stringify(selectedLog.metadata, null, 2))}
                        style={{ border: 0, background: 'transparent', color: copiedKey ? '#16a34a' : '#4f46e5', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {copiedKey ? <Check size={12} /> : <Copy size={12} />}
                        {copiedKey ? 'Copied' : 'Copy JSON'}
                      </button>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '12px 14px',
                        background: '#0f172a',
                        color: '#f8fafc',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontFamily: 'monospace',
                        overflowX: 'auto',
                        maxHeight: '180px',
                      }}
                    >
                      {(() => {
                        try {
                          const parsed = typeof selectedLog.metadata === 'string' ? JSON.parse(selectedLog.metadata) : selectedLog.metadata;
                          return JSON.stringify(parsed, null, 2);
                        } catch {
                          return String(selectedLog.metadata);
                        }
                      })()}
                    </pre>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  style={{
                    height: '35px',
                    padding: '0 16px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
