import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Clock, FileText, History, RefreshCw, Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import apiClient from '../../api/client';

const surface = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const list = (response) => Array.isArray(unwrap(response)) ? unwrap(response) : [];
const statusColor = (status) => {
  if (status === 'APPROVED') return ['#f0fdf4', '#15803d'];
  if (status === 'REVISION_REQUESTED' || status === 'REJECTED') return ['#fef2f2', '#b91c1c'];
  return ['#fffbeb', '#a16207'];
};

export default function ProgrammeCoordinatorApprovals() {
  const { user } = useAuth();
  const { programmeId, masterProgrammes = [], loadCoordinatorProgrammeBatches = () => Promise.resolve([]) } = useAcademic();
  const [programmeBatchCourses, setProgrammeBatchCourses] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState('');
  const requestedScope = useRef(null);
  const programme = masterProgrammes.find((item) => item.id === programmeId);

  const loadQueue = useCallback(async ({ reloadCourses = false } = {}) => {
    if (!programmeId || !user?.email) return;
    setLoading(true);
    setError('');
    try {
      let courses = programmeBatchCourses;
      if (reloadCourses || courses.length === 0) {
        const batches = await loadCoordinatorProgrammeBatches(user.email, programmeId);
        const courseGroups = await Promise.all((batches || []).map(async (batch) => {
          const programmeBatchId = batch.programmeBatchId ?? batch.id;
          if (!programmeBatchId) return [];
          const response = await apiClient.get('/programme-batch-courses', {
            params: { programmeBatchId, coordinatorEmail: user.email },
          });
          return list(response).map((course) => ({ ...course, programmeBatchId: course.programmeBatchId ?? programmeBatchId, batchName: batch.name }));
        }));
        courses = courseGroups.flat();
        setProgrammeBatchCourses(courses);
      }

      // Both queues are fetched: pending drives the action count and the full
      // programme list retains approved/revision history for this screen.
      const [pendingResponse, allResponse] = await Promise.all([
        apiClient.get('/approvals/pending', { params: { programmeId } }),
        apiClient.get('/approvals', { params: { programmeId, role: 'PROGRAMME_COORDINATOR' } }),
      ]);
      const merged = [...list(pendingResponse), ...list(allResponse)];
      const unique = [...new Map(merged.filter((item) => item?.id).map((item) => [item.id, item])).values()];
      const allowedCourseIds = new Set(courses.map((course) => course.programmeBatchCourseId ?? course.id));
      setApprovals(unique.filter((item) => !item.programmeBatchCourseId || allowedCourseIds.has(item.programmeBatchCourseId)));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load approval requests.');
    } finally {
      setLoading(false);
    }
  }, [loadCoordinatorProgrammeBatches, programmeBatchCourses, programmeId, user?.email]);

  useEffect(() => {
    const scope = `${programmeId ?? ''}:${user?.email ?? ''}`;
    if (!programmeId || !user?.email || requestedScope.current === scope) return;
    requestedScope.current = scope;
    setProgrammeBatchCourses([]);
    setSelectedId(null);
    setDetails(null);
    setHistory([]);
    loadQueue({ reloadCourses: true });
  }, [loadQueue, programmeId, user?.email]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    Promise.all([
      apiClient.get(`/approvals/${selectedId}`),
      apiClient.get(`/approvals/${selectedId}/history`),
    ]).then(async ([detailResponse, historyResponse]) => {
      if (!active) return;
      const approval = unwrap(detailResponse);
      const verificationResponse = approval?.programmeBatchCourseId
        ? await apiClient.get('/approvals/verification-status', { params: { key: `co-${approval.programmeBatchCourseId}` } }).catch(() => null)
        : null;
      if (!active) return;
      setDetails({ ...approval, verificationStatus: unwrap(verificationResponse) });
      setHistory(list(historyResponse));
      setRemarks('');
    }).catch((err) => active && setError(err?.response?.data?.message || 'Unable to load approval details.'));
    return () => { active = false; };
  }, [selectedId]);

  const applyAction = async (action) => {
    if (!details?.id) return;
    if ((action === 'REJECT' || action === 'REQUEST_REVISION') && !remarks.trim()) {
      setError('Enter remarks before rejecting or requesting a revision.');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const actor = { actorName: user?.name || user?.email || '', actorRole: 'PROGRAMME_COORDINATOR' };
      if (action === 'APPROVE') {
        await apiClient.post(`/approvals/${details.id}/approve`, actor);
      } else if (action === 'REJECT') {
        await apiClient.post(`/approvals/${details.id}/reject`, { ...actor, remarks });
      } else {
        await apiClient.post(`/approvals/${details.id}/request-revision`, { ...actor, remarks });
      }
      // Synchronize the course-level inline verification badge using the
      // contract's direct verification endpoint.
      if (details.programmeBatchCourseId) {
        await apiClient.post('/approvals/verify', {
          key: `co-${details.programmeBatchCourseId}`,
          statusType: details.type === 'COURSE_ATR' ? 'atrStatus' : 'coStatus',
          statusValue: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'REVISION_REQUESTED',
          verifierName: actor.actorName,
          remarksValue: remarks,
        });
      }
      await loadQueue();
      const [detailResponse, historyResponse] = await Promise.all([
        apiClient.get(`/approvals/${details.id}`), apiClient.get(`/approvals/${details.id}/history`),
      ]);
      setDetails(unwrap(detailResponse));
      setHistory(list(historyResponse));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to update this approval.');
    } finally {
      setActionLoading(false);
    }
  };

  const selected = details ?? approvals.find((item) => item.id === selectedId);
  const pendingCount = approvals.filter((item) => item.status === 'PENDING' || item.status === 'SUBMITTED').length;

  return <div className="animated-page" style={{ paddingBottom: '48px' }}>
    <div style={{ ...surface, padding: '20px 24px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '.08em', textTransform: 'uppercase' }}>Programme Coordinator · Approvals</div>
        <h2 style={{ margin: '4px 0 0', fontSize: '20px', color: '#0f172a' }}>Course Submission Approvals</h2>
        <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>{programme?.name || 'Selected master programme'} · {programmeBatchCourses.length} programme-batch course(s) loaded</p>
      </div>
      <button type="button" onClick={() => loadQueue({ reloadCourses: true })} disabled={loading} style={{ height: '38px', padding: '0 13px', border: '1px solid #c7d2fe', borderRadius: '8px', background: '#fff', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><RefreshCw size={14} /> Refresh</button>
    </div>
    {error && <div style={{ marginBottom: '14px', padding: '10px 14px', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, .8fr)', gap: '16px' }}>
      <div style={{ ...surface, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}><Clock size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />{pendingCount} pending request(s)</div>
        {loading ? <div style={{ padding: 28, color: '#64748b' }}>Loading programme-batch courses and approval requests…</div> : approvals.length === 0 ? <div style={{ padding: 28, color: '#64748b' }}>No approval requests for the selected programme.</div> : approvals.map((item) => { const [bg, color] = statusColor(item.status); return <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} style={{ width: '100%', textAlign: 'left', padding: '14px 18px', border: 'none', borderBottom: '1px solid #f1f5f9', background: selectedId === item.id ? '#f5f3ff' : '#fff', cursor: 'pointer' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><strong style={{ fontSize: '13px', color: '#0f172a' }}>{item.title || item.type}</strong><span style={{ fontSize: '10.5px', fontWeight: 800, color, background: bg, padding: '3px 7px', borderRadius: 5 }}>{item.status}</span></div><div style={{ marginTop: 5, fontSize: '12px', color: '#64748b' }}>{item.details || item.programmeBatchCourseId} · {item.submittedBy || 'Course Coordinator'}</div></button>; })}
      </div>
      <div style={{ ...surface, padding: '18px' }}>
        {!selected ? <div style={{ padding: '28px 8px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}><FileText size={24} style={{ marginBottom: 8 }} /><br />Select an approval request to review it.</div> : <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><strong style={{ color: '#0f172a' }}>{selected.title || selected.type}</strong><button type="button" onClick={() => setSelectedId(null)} style={{ border: 0, background: 'none', cursor: 'pointer' }}><X size={16} /></button></div>
          <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>{selected.details || 'No submission details provided.'}</p>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: 12 }}>Course: {selected.programmeBatchCourseId || '—'}<br />Submitted by: {selected.submittedBy || '—'}</div>
          {selected.status === 'PENDING' || selected.status === 'SUBMITTED' ? <><textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Remarks required for rejection or revision" style={{ width: '100%', minHeight: 72, padding: 9, border: '1px solid #cbd5e1', borderRadius: 7, boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 12 }} /><div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}><button type="button" disabled={actionLoading} onClick={() => applyAction('APPROVE')} style={{ padding: '8px 10px', background: '#16a34a', color: '#fff', border: 0, borderRadius: 6, fontWeight: 700 }}><Check size={13} /> Approve</button><button type="button" disabled={actionLoading} onClick={() => applyAction('REQUEST_REVISION')} style={{ padding: '8px 10px', background: '#fff', color: '#b45309', border: '1px solid #f59e0b', borderRadius: 6, fontWeight: 700 }}><Send size={13} /> Revision</button><button type="button" disabled={actionLoading} onClick={() => applyAction('REJECT')} style={{ padding: '8px 10px', background: '#fff', color: '#b91c1c', border: '1px solid #ef4444', borderRadius: 6, fontWeight: 700 }}>Reject</button></div></> : null}
          <div style={{ marginTop: 18, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}><strong style={{ fontSize: 12, color: '#475569' }}><History size={13} style={{ verticalAlign: '-2px' }} /> History</strong>{history.length === 0 ? <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>No history available.</div> : history.map((entry) => <div key={entry.id} style={{ marginTop: 8, fontSize: 12, color: '#475569' }}><b>{entry.action}</b> · {entry.actorName || entry.actorRole}<br /><span style={{ color: '#64748b' }}>{entry.comments || entry.timestamp}</span></div>)}</div>
        </>}
      </div>
    </div>
  </div>;
}
