import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Clock, FileText, History, RefreshCw, Send, X, ChevronRight } from 'lucide-react';
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
  const { loadCoordinatorProgrammeBatches = () => Promise.resolve([]) } = useAcademic();
  const [programmeBatchCourses, setProgrammeBatchCourses] = useState([]);
  const [programmeBatches, setProgrammeBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [queueTab, setQueueTab] = useState('PENDING');
  const [approvals, setApprovals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [reviewContent, setReviewContent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState('');
  const requestedScope = useRef(null);

  const loadQueue = useCallback(async ({ reloadCourses = false, programmeBatchId: requestedBatchId = null } = {}) => {
    if (!user?.email) return;
    setLoading(true);
    setError('');
    try {
      let courses = programmeBatchCourses;
      let coordinatorBatches = programmeBatches;
      if (reloadCourses || courses.length === 0) {
        const batches = await loadCoordinatorProgrammeBatches(user.email);
        coordinatorBatches = batches || [];
        setProgrammeBatches(batches || []);
        setSelectedBatchId((current) => (batches || []).some((batch) => String(batch.id) === String(current)) ? current : String(batches?.[0]?.id ?? ''));
        const courseGroups = await Promise.all((batches || []).map(async (batch) => {
          const programmeBatchId = batch.programmeBatchId ?? batch.id;
          if (!programmeBatchId) return [];
          const response = await apiClient.get('/academic/programme-batch-courses', {
            params: { programmeBatchId, coordinatorEmail: user.email },
          });
          return list(response).map((course) => ({ ...course, programmeBatchId: course.programmeBatchId ?? programmeBatchId, batchName: batch.name }));
        }));
        courses = courseGroups.flat();
        setProgrammeBatchCourses(courses);
      }

      const activeBatchId = requestedBatchId || selectedBatchId || String((coordinatorBatches || [])[0]?.id ?? '');
      if (!activeBatchId) {
        setApprovals([]);
        return;
      }

      // The selected Programme Batch is the approval scope. The backend
      // returns already grouped Programme-Batch-Course cards.
      const [pendingResponse, allResponse] = await Promise.all([
        apiClient.get('/approvals/pending', { params: { programmeBatchId: activeBatchId } }),
        apiClient.get('/approvals/reviewed', { params: { programmeBatchId: activeBatchId } }),
      ]);
      const flattenInbox = (response) => {
        const inbox = unwrap(response) ?? {};
        return (inbox.courses ?? []).flatMap((course) => (course.approvalItems ?? []).map((item) => ({
          ...item,
          id: item.approvalRequestId,
          programmeBatchCourseId: course.programmeBatchCourseId,
          programmeBatchId: inbox.programmeBatchId,
          batchName: inbox.programmeBatchName,
          courseCode: course.courseCode,
          courseName: course.courseName,
          semester: course.semester,
          submittedBy: course.submittedBy?.name ?? course.submittedBy?.email,
          submittedAt: course.latestSubmittedAt,
        })));
      };
      const requests = [...flattenInbox(pendingResponse), ...flattenInbox(allResponse)];
      setProgrammeBatchCourses((current) => {
        const fromInbox = requests.map((item) => ({ ...item, id: item.programmeBatchCourseId }));
        return [...new Map([...current, ...fromInbox].map((item) => [item.programmeBatchCourseId ?? item.id, item])).values()];
      });
      setApprovals(requests);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load approval requests.');
    } finally {
      setLoading(false);
    }
  }, [loadCoordinatorProgrammeBatches, programmeBatchCourses, programmeBatches, selectedBatchId, user?.email]);

  useEffect(() => {
    const scope = user?.email ?? '';
    if (!user?.email || requestedScope.current === scope) return;
    requestedScope.current = scope;
    setProgrammeBatchCourses([]);
    setSelectedId(null);
    setDetails(null);
    setHistory([]);
    loadQueue({ reloadCourses: true });
  }, [loadQueue, user?.email]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    const selectedRequest = approvals.find((item) => item.id === selectedId);
    if (!selectedRequest?.programmeBatchCourseId) return undefined;
    apiClient.get(`/approvals/programme-batch-courses/${selectedRequest.programmeBatchCourseId}`).then((response) => {
      if (!active) return;
      const workspace = unwrap(response) ?? {};
      const approval = (workspace.approvalItems ?? []).find((item) => item.approvalRequestId === selectedId) ?? {};
      setDetails({ ...selectedRequest, ...approval, id: approval.approvalRequestId ?? selectedId, programmeBatchCourse: workspace.programmeBatchCourse });
      setHistory([]);
      setRemarks('');
    }).catch((err) => active && setError(err?.response?.data?.message || 'Unable to load approval details.'));
    return () => { active = false; };
  }, [approvals, selectedId]);

  useEffect(() => {
    if (!details?.programmeBatchCourseId || !details?.type) return;
    setReviewContent(null);
    const courseId = details.programmeBatchCourseId;
    const request = details.type === 'ATTAINMENT_SETTINGS'
      ? apiClient.get(`/attainment/configurations/programme-batch-courses/${courseId}`)
      : details.type === 'COURSE_OUTCOMES_TARGETS'
        ? apiClient.get('/academic/course-outcomes', { params: { programmeBatchCourseId: courseId } })
        : apiClient.get(`/atr/course/${courseId}`);
    request.then((response) => setReviewContent(unwrap(response))).catch((err) => setError(err?.response?.data?.message || 'Unable to load submitted approval content.'));
  }, [details?.programmeBatchCourseId, details?.type]);

  const applyAction = async (action) => {
    if (!details?.id) return;
    if (action === 'REQUEST_REVISION' && !remarks.trim()) {
      setError('Enter a reason before requesting a revision.');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      if (action === 'APPROVE') {
        await apiClient.post(`/approvals/${details.id}/approve`, {});
      } else {
        await apiClient.post(`/approvals/${details.id}/request-revision`, { reason: remarks });
      }
      await loadQueue();
      setDetails(null);
      setSelectedId(null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to update this approval.');
    } finally {
      setActionLoading(false);
    }
  };

  const selected = details ?? approvals.find((item) => item.id === selectedId);
  const isPending = (item) => item.status === 'PENDING' || item.status === 'SUBMITTED' || item.status === 'PENDING_APPROVAL';
  const scopedApprovals = approvals.filter((item) => {
    if (!selectedBatchId) return false;
    const course = programmeBatchCourses.find((candidate) => String(candidate.programmeBatchCourseId ?? candidate.id) === String(item.programmeBatchCourseId));
    return String(course?.programmeBatchId) === String(selectedBatchId);
  });
  const visibleApprovals = scopedApprovals.filter((item) => queueTab === 'PENDING' ? isPending(item) : !isPending(item));
  const courseGroups = Object.values(visibleApprovals.reduce((groups, item) => {
    const courseId = item.programmeBatchCourseId ?? item.courseOfferingId ?? item.id;
    if (!groups[courseId]) {
      const course = programmeBatchCourses.find((candidate) => String(candidate.programmeBatchCourseId ?? candidate.id) === String(courseId)) || {};
      groups[courseId] = { id: courseId, course, requests: [] };
    }
    groups[courseId].requests.push(item);
    return groups;
  }, {}));
  const selectedGroup = selected ? courseGroups.find((group) => group.requests.some((item) => item.id === selected.id))
    || { id: selected.programmeBatchCourseId, course: programmeBatchCourses.find((course) => String(course.programmeBatchCourseId ?? course.id) === String(selected.programmeBatchCourseId)) || {}, requests: [selected] }
    : null;
  const approvalLabels = { ATTAINMENT_SETTINGS: 'Attainment Settings', COURSE_OUTCOMES_TARGETS: 'Course Outcomes & Targets', COURSE_ATR: 'Course ATR' };
  const pendingCount = scopedApprovals.filter(isPending).length;

  return <div className="animated-page" style={{ paddingBottom: '48px' }}>
    <div style={{ ...surface, padding: '20px 24px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '.08em', textTransform: 'uppercase' }}>Programme Coordinator · Approvals</div>
        <h2 style={{ margin: '4px 0 0', fontSize: '20px', color: '#0f172a' }}>Course Submission Approvals</h2>
        <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>{programmeBatchCourses.length} programme-batch course(s) in your assigned batch scope</p>
      </div>
      <button type="button" onClick={() => loadQueue({ reloadCourses: true })} disabled={loading} style={{ height: '38px', padding: '0 13px', border: '1px solid #c7d2fe', borderRadius: '8px', background: '#fff', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><RefreshCw size={14} /> Refresh</button>
    </div>
    {error && <div style={{ marginBottom: '14px', padding: '10px 14px', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}
    <div style={{ ...surface, padding: '14px 18px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>Programme Batch</label>
      <select value={selectedBatchId} onChange={(event) => { const nextBatchId = event.target.value; setSelectedBatchId(nextBatchId); setSelectedId(null); setDetails(null); loadQueue({ programmeBatchId: nextBatchId }); }} style={{ height: '38px', minWidth: '230px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 10px', color: '#0f172a', background: '#fff', fontWeight: 600 }}>
        {programmeBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
      </select>
      <div style={{ display: 'flex', marginLeft: 'auto', gap: '6px' }}>
        {['PENDING', 'REVIEWED'].map((tab) => <button key={tab} type="button" onClick={() => { setQueueTab(tab); setSelectedId(null); setDetails(null); }} style={{ height: '34px', padding: '0 12px', borderRadius: '7px', border: `1px solid ${queueTab === tab ? '#4f46e5' : '#e2e8f0'}`, background: queueTab === tab ? '#eef2ff' : '#fff', color: queueTab === tab ? '#4338ca' : '#64748b', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>{tab === 'PENDING' ? `Pending (${pendingCount})` : 'Reviewed'}</button>)}
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, .8fr)', gap: '16px' }}>
      <div style={{ ...surface, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}><Clock size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />{queueTab === 'PENDING' ? `${pendingCount} pending request(s)` : 'Reviewed submissions'}</div>
        {loading ? <div style={{ padding: 28, color: '#64748b' }}>Loading programme-batch courses and approval requests…</div> : courseGroups.length === 0 ? <div style={{ padding: 28, color: '#64748b' }}>No {queueTab.toLowerCase()} approval requests for this programme batch.</div> : courseGroups.map((group) => <button key={group.id} type="button" onClick={() => setSelectedId(group.requests[0].id)} style={{ width: '100%', textAlign: 'left', padding: '16px 18px', border: 'none', borderBottom: '1px solid #f1f5f9', background: selectedGroup?.id === group.id ? '#f5f3ff' : '#fff', cursor: 'pointer' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div><strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{group.course.courseName ?? group.course.name ?? 'Programme-Batch Course'}</strong><div style={{ marginTop: 3, fontSize: '12px', color: '#64748b' }}>{group.course.courseCode ?? '—'} · Semester {group.course.semester ?? '—'}</div></div><ChevronRight size={17} color="#4f46e5" /></div><div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{group.requests.map((item) => <span key={item.id} style={{ fontSize: '10.5px', fontWeight: 800, padding: '3px 7px', borderRadius: 5, color: '#4338ca', background: '#eef2ff' }}>{approvalLabels[item.type] ?? item.title ?? item.type}</span>)}</div></button>)}
      </div>
      <div style={{ ...surface, padding: '18px' }}>
        {!selected ? <div style={{ padding: '28px 8px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}><FileText size={24} style={{ marginBottom: 8 }} /><br />Select an approval request to review it.</div> : <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div><strong style={{ color: '#0f172a' }}>{selectedGroup?.course?.courseName ?? selectedGroup?.course?.name ?? 'Programme-Batch Course'}</strong><div style={{ marginTop: 3, fontSize: '12px', color: '#64748b' }}>{selectedGroup?.course?.courseCode ?? '—'} · Semester {selectedGroup?.course?.semester ?? '—'} · {selectedGroup?.course?.batchName ?? 'Programme Batch'}</div></div><button type="button" onClick={() => setSelectedId(null)} style={{ border: 0, background: 'none', cursor: 'pointer' }}><X size={16} /></button></div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '14px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>{selectedGroup?.requests.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} style={{ border: `1px solid ${selected.id === item.id ? '#4f46e5' : '#e2e8f0'}`, background: selected.id === item.id ? '#eef2ff' : '#fff', color: selected.id === item.id ? '#4338ca' : '#475569', borderRadius: 6, padding: '6px 8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>{approvalLabels[item.type] ?? item.title ?? item.type}</button>)}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><strong style={{ fontSize: '13px', color: '#0f172a' }}>{approvalLabels[selected.type] ?? selected.title ?? selected.type}</strong>{(() => { const [bg, color] = statusColor(selected.status); return <span style={{ fontSize: '10.5px', fontWeight: 800, color, background: bg, padding: '3px 7px', borderRadius: 5 }}>{isPending(selected) ? '● Pending Review' : selected.status}</span>; })()}</div>
          <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>{selected.details || 'Submitted information is displayed read-only for review.'}</p>
          {reviewContent && <div style={{ marginBottom: 12, padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#475569' }}>Submitted {approvalLabels[selected.type] ?? 'approval'} data loaded for read-only review.</div>}
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: 12 }}>Submitted by: {selected.submittedBy || 'Course Coordinator'}<br />Submitted on: {selected.submittedAt || selected.createdAt || '—'}</div>
          {selected.status === 'PENDING' || selected.status === 'SUBMITTED' ? <><textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Reason required when requesting a revision" style={{ width: '100%', minHeight: 72, padding: 9, border: '1px solid #cbd5e1', borderRadius: 7, boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 12 }} /><div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}><button type="button" disabled={actionLoading} onClick={() => applyAction('APPROVE')} style={{ padding: '8px 10px', background: '#16a34a', color: '#fff', border: 0, borderRadius: 6, fontWeight: 700 }}><Check size={13} /> Approve</button><button type="button" disabled={actionLoading} onClick={() => applyAction('REQUEST_REVISION')} style={{ padding: '8px 10px', background: '#fff', color: '#b45309', border: '1px solid #f59e0b', borderRadius: 6, fontWeight: 700 }}><Send size={13} /> Request Revision</button></div></> : null}
          <div style={{ marginTop: 18, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}><strong style={{ fontSize: 12, color: '#475569' }}><History size={13} style={{ verticalAlign: '-2px' }} /> History</strong>{history.length === 0 ? <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>No history available.</div> : history.map((entry) => <div key={entry.id} style={{ marginTop: 8, fontSize: 12, color: '#475569' }}><b>{entry.action}</b> · {entry.actorName || entry.actorRole}<br /><span style={{ color: '#64748b' }}>{entry.comments || entry.timestamp}</span></div>)}</div>
        </>}
      </div>
    </div>
  </div>;
}
