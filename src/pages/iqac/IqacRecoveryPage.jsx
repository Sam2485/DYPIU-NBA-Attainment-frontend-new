import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Trash2,
  RotateCcw,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Layers,
  GraduationCap,
  Users,
  ShieldCheck,
  Check,
  Sparkles,
  Info,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import { recoveryApi } from '../../api/recovery';

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

// ── Category Definitions ─────────────────────────────────────────────────────
const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Items', icon: Trash2 },
  { id: 'PROGRAMME', label: 'Programmes', icon: GraduationCap },
  { id: 'BATCH', label: 'Batches', icon: Layers },
  { id: 'COURSE', label: 'Courses', icon: FileText },
  { id: 'USER', label: 'User Accounts', icon: Users },
];

export default function IqacRecoveryPage() {
  // ── States ─────────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    totalDeleted: 0,
    programmesCount: 0,
    batchesCount: 0,
    coursesCount: 0,
    usersCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected item for inspection / restoration modal
  const [inspectItem, setInspectItem] = useState(null);
  const [restoreModalItem, setRestoreModalItem] = useState(null);
  const [restoreReason, setRestoreReason] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState(null);

  // ── Fetch Summary ──────────────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await recoveryApi.getSummary();
      if (res?.data?.data) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch recovery summary metrics:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // ── Fetch Deleted Items ────────────────────────────────────────────────────
  const fetchDeletedItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        resourceType: activeCategory === 'ALL' ? undefined : activeCategory,
        search: searchQuery || undefined,
        from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        to: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : undefined,
      };

      const res = await recoveryApi.getDeletedItems(params);
      if (res?.data?.data) {
        setItems(res.data.data);
      } else {
        setItems([]);
      }
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching deleted items:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load deleted items.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchDeletedItems();
  }, [fetchDeletedItems]);

  // Toast auto-dismiss
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // ── Restore Action ─────────────────────────────────────────────────────────
  const handleConfirmRestore = async () => {
    if (!restoreModalItem) return;
    try {
      setRestoring(true);
      setRestoreError(null);

      await recoveryApi.restoreItem(
        restoreModalItem.resourceType,
        restoreModalItem.id,
        restoreReason.trim() || 'Restored by IQAC administrator'
      );

      setSuccessToast(`Successfully restored ${restoreModalItem.category} "${restoreModalItem.name}"!`);
      setRestoreModalItem(null);
      setRestoreReason('');
      
      // Refresh items and summary
      fetchDeletedItems();
      fetchSummary();
    } catch (err) {
      console.error('Failed to restore item:', err);
      setRestoreError(err?.response?.data?.message || err?.message || 'Failed to restore item.');
    } finally {
      setRestoring(false);
    }
  };

  // ── Pagination Calculation ─────────────────────────────────────────────────
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const getResourceTypeBadge = (type) => {
    switch (type) {
      case 'PROGRAMME':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Programme' };
      case 'BATCH':
        return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Batch' };
      case 'COURSE':
        return { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', label: 'Course' };
      case 'USER':
        return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', label: 'User' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: type };
    }
  };

  const resetFilters = () => {
    setActiveCategory('ALL');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <AppSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppHeader title="Deleted Items Recovery" />

        <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* ── Success Toast ──────────────────────────────────────────────── */}
          {successToast && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 18px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13.5px',
                fontWeight: 500,
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)',
              }}
            >
              <CheckCircle2 size={18} color="#10b981" />
              <span style={{ flex: 1 }}>{successToast}</span>
              <button
                onClick={() => setSuccessToast(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* ── Header Banner ──────────────────────────────────────────────── */}
          <div
            style={{
              ...surfaceCard,
              padding: '20px 24px',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={18} color="#38bdf8" />
                  </div>
                  <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    Deleted Items Recovery Hub
                  </h1>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    IQAC Super Admin
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', maxWidth: '780px', lineHeight: 1.5 }}>
                  Safely inspect and restore soft-deleted academic entities (programmes, batches, course offerings) and deactivated user accounts.
                  Restoration automatically verifies entity hierarchy relationships and generates cryptographic audit logs.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    fetchSummary();
                    fetchDeletedItems();
                  }}
                  disabled={loading || summaryLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: (loading || summaryLoading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <RefreshCw size={14} className={(loading || summaryLoading) ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* ── Metric Cards ───────────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginBottom: '20px',
            }}
          >
            {/* Total Trash */}
            <div
              onClick={() => setActiveCategory('ALL')}
              style={{
                ...surfaceCard,
                padding: '16px',
                cursor: 'pointer',
                borderColor: activeCategory === 'ALL' ? '#6366f1' : '#e2e8f0',
                background: activeCategory === 'ALL' ? '#f8faff' : '#ffffff',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Deleted</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#f1f5f9', color: '#475569' }}>
                  <Trash2 size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {summaryLoading ? '—' : summary.totalDeleted}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Across all categories</span>
            </div>

            {/* Programmes */}
            <div
              onClick={() => setActiveCategory('PROGRAMME')}
              style={{
                ...surfaceCard,
                padding: '16px',
                cursor: 'pointer',
                borderColor: activeCategory === 'PROGRAMME' ? '#3b82f6' : '#e2e8f0',
                background: activeCategory === 'PROGRAMME' ? '#eff6ff' : '#ffffff',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1d4ed8' }}>Programmes</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#dbeafe', color: '#1d4ed8' }}>
                  <GraduationCap size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e3a8a' }}>
                {summaryLoading ? '—' : summary.programmesCount}
              </div>
              <span style={{ fontSize: '11px', color: '#60a5fa' }}>Soft-deleted programmes</span>
            </div>

            {/* Batches */}
            <div
              onClick={() => setActiveCategory('BATCH')}
              style={{
                ...surfaceCard,
                padding: '16px',
                cursor: 'pointer',
                borderColor: activeCategory === 'BATCH' ? '#10b981' : '#e2e8f0',
                background: activeCategory === 'BATCH' ? '#f0fdf4' : '#ffffff',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>Batches</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#dcfce7', color: '#15803d' }}>
                  <Layers size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#14532d' }}>
                {summaryLoading ? '—' : summary.batchesCount}
              </div>
              <span style={{ fontSize: '11px', color: '#4ade80' }}>Academic batches</span>
            </div>

            {/* Courses */}
            <div
              onClick={() => setActiveCategory('COURSE')}
              style={{
                ...surfaceCard,
                padding: '16px',
                cursor: 'pointer',
                borderColor: activeCategory === 'COURSE' ? '#8b5cf6' : '#e2e8f0',
                background: activeCategory === 'COURSE' ? '#faf5ff' : '#ffffff',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#7e22ce' }}>Courses</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#f3e8ff', color: '#7e22ce' }}>
                  <FileText size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#581c87' }}>
                {summaryLoading ? '—' : summary.coursesCount}
              </div>
              <span style={{ fontSize: '11px', color: '#a855f7' }}>Batch course offerings</span>
            </div>

            {/* Users */}
            <div
              onClick={() => setActiveCategory('USER')}
              style={{
                ...surfaceCard,
                padding: '16px',
                cursor: 'pointer',
                borderColor: activeCategory === 'USER' ? '#f59e0b' : '#e2e8f0',
                background: activeCategory === 'USER' ? '#fffbeb' : '#ffffff',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#b45309' }}>Deactivated Users</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#fef3c7', color: '#b45309' }}>
                  <Users size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#78350f' }}>
                {summaryLoading ? '—' : summary.usersCount}
              </div>
              <span style={{ fontSize: '11px', color: '#fbbf24' }}>Inactive faculty/coordinators</span>
            </div>
          </div>

          {/* ── Main Filter & Data Section ─────────────────────────────────── */}
          <div style={{ ...surfaceCard, padding: '20px', marginBottom: '20px' }}>
            
            {/* Category Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '14px',
                marginBottom: '16px',
                overflowX: 'auto',
              }}
            >
              {CATEGORY_TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#4f46e5' : '#64748b',
                      background: isActive ? '#eef2ff' : 'transparent',
                      border: isActive ? '1px solid #c7d2fe' : '1px solid transparent',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                  >
                    <IconComponent size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter Toolbar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Search by name, code, ID, parent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ ...inputBase, paddingLeft: '34px' }}
                />
              </div>

              {/* Date From */}
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  title="Deleted From Date"
                  style={inputBase}
                />
              </div>

              {/* Date To */}
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  title="Deleted To Date"
                  style={inputBase}
                />
              </div>

              {/* Reset Button */}
              <div>
                <button
                  onClick={resetFilters}
                  style={{
                    ...inputBase,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    color: '#64748b',
                    borderColor: '#cbd5e1',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  <RotateCcw size={14} />
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#991b1b',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* ── Data Table ──────────────────────────────────────────────── */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>Entity / Item</th>
                    <th style={{ padding: '12px 16px' }}>Category</th>
                    <th style={{ padding: '12px 16px' }}>Hierarchy / Parent</th>
                    <th style={{ padding: '12px 16px' }}>Deleted At & By</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Loading deleted items...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <Trash2 size={32} strokeWidth={1.5} color="#cbd5e1" />
                          <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>
                            No deleted items found
                          </span>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {searchQuery || activeCategory !== 'ALL' || dateFrom || dateTo
                              ? 'Try adjusting your search criteria or category filter.'
                              : 'The recycle bin is currently empty. No items are pending recovery.'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => {
                      const badge = getResourceTypeBadge(item.resourceType);
                      return (
                        <tr
                          key={`${item.resourceType}-${item.id}`}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* Item / Name */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontFamily: 'monospace',
                                    background: '#f1f5f9',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    color: '#475569',
                                  }}
                                >
                                  {item.code || item.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                              }}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* Hierarchy / Parent */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '12.5px', color: '#334155' }}>
                                {item.parentInfo || '—'}
                              </span>
                              {!item.canRestore && item.warningMessage && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    color: '#b91c1c',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <AlertTriangle size={12} />
                                  {item.warningMessage}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Deleted At & By */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} color="#94a3b8" />
                                {formatDateTime(item.deletedAt)}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                By: {item.deletedBy || 'Admin'}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={() => setInspectItem(item)}
                                title="Inspect Details"
                                style={{
                                  padding: '6px 10px',
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  color: '#334155',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                }}
                              >
                                <Eye size={13} />
                                View
                              </button>

                              <button
                                onClick={() => {
                                  setRestoreModalItem(item);
                                  setRestoreReason('');
                                  setRestoreError(null);
                                }}
                                disabled={!item.canRestore}
                                title={item.canRestore ? 'Restore this item' : item.warningMessage}
                                style={{
                                  padding: '6px 12px',
                                  background: item.canRestore ? '#4f46e5' : '#f1f5f9',
                                  border: item.canRestore ? '1px solid #4338ca' : '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  color: item.canRestore ? '#ffffff' : '#94a3b8',
                                  cursor: item.canRestore ? 'pointer' : 'not-allowed',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  transition: 'all 0.15s',
                                }}
                              >
                                <RotateCcw size={13} />
                                Restore
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Footer ────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '12.5px',
                  color: '#64748b',
                }}
              >
                <span>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
                </span>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '5px 10px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      color: currentPage === 1 ? '#cbd5e1' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <span style={{ padding: '0 8px', fontWeight: 600, color: '#0f172a' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '5px 10px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      color: currentPage === totalPages ? '#cbd5e1' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── Restore Confirmation Modal ───────────────────────────────────── */}
        {restoreModalItem && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                ...surfaceCard,
                width: '100%',
                maxWidth: '520px',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setRestoreModalItem(null)}
                disabled={restoring}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#eef2ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4f46e5',
                  }}
                >
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Confirm Item Restoration
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Recover {restoreModalItem.category} back to Active state
                  </span>
                </div>
              </div>

              {/* Item Details Box */}
              <div
                style={{
                  padding: '14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '12.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Item Name:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{restoreModalItem.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Type & Code:</span>
                  <span style={{ fontWeight: 500, color: '#334155' }}>
                    {restoreModalItem.category} ({restoreModalItem.code || restoreModalItem.id})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Parent Context:</span>
                  <span style={{ fontWeight: 500, color: '#334155' }}>{restoreModalItem.parentInfo}</span>
                </div>
              </div>

              {/* Restore Reason Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Restoration Justification / Reason (Audited)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Restored by IQAC admin per department request..."
                  value={restoreReason}
                  onChange={(e) => setRestoreReason(e.target.value)}
                  style={{
                    ...inputBase,
                    height: 'auto',
                    padding: '8px 11px',
                    resize: 'vertical',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                  This reason will be recorded immutably in the system Audit Logs.
                </span>
              </div>

              {/* Modal Error */}
              {restoreError && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontSize: '12.5px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={15} />
                  <span>{restoreError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setRestoreModalItem(null)}
                  disabled={restoring}
                  style={{
                    padding: '8px 16px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: restoring ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmRestore}
                  disabled={restoring}
                  style={{
                    padding: '8px 18px',
                    background: '#4f46e5',
                    border: '1px solid #4338ca',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: restoring ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {restoring && <RefreshCw size={14} className="animate-spin" />}
                  Confirm & Restore
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Detail Inspector Modal ───────────────────────────────────────── */}
        {inspectItem && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                ...surfaceCard,
                width: '100%',
                maxWidth: '600px',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '24px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setInspectItem(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: '#f1f5f9', color: '#334155' }}>
                  <Eye size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Deleted Item Details
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {inspectItem.category} • ID: {inspectItem.id}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Name</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{inspectItem.name}</span>
                </div>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Code / Identifier</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{inspectItem.code || inspectItem.id}</span>
                </div>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Deleted At</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{formatDateTime(inspectItem.deletedAt)}</span>
                </div>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Deleted By</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{inspectItem.deletedBy}</span>
                </div>
              </div>

              {/* Parent Context */}
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Hierarchy Association
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#0f172a' }}>
                  {inspectItem.parentInfo}
                </p>
              </div>

              {/* Extra Details JSON */}
              {inspectItem.details && Object.keys(inspectItem.details).length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Entity Metadata & Attributes
                  </span>
                  <pre
                    style={{
                      marginTop: '6px',
                      padding: '12px',
                      background: '#0f172a',
                      color: '#38bdf8',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      overflowX: 'auto',
                    }}
                  >
                    {JSON.stringify(inspectItem.details, null, 2)}
                  </pre>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => setInspectItem(null)}
                  style={{
                    padding: '8px 16px',
                    background: '#4f46e5',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
