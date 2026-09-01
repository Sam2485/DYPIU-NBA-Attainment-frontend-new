import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, FileText, History, RefreshCw, Send, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import apiClient from '../../api/client';
import OutcomesManagement from '../outcomes/OutcomesManagement';
import AttainmentConfig from '../configuration/AttainmentConfig';
import CourseATR from '../atr/CourseATR';

const surface = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const list = (response) => Array.isArray(unwrap(response)) ? unwrap(response) : [];
const statusColor = (status) => {
  if (status === 'APPROVED') return ['#f0fdf4', '#15803d'];
  if (status === 'REVISION_REQUESTED' || status === 'REJECTED') return ['#fef2f2', '#b91c1c'];
  return ['#fffbeb', '#a16207'];
};

function ReadOnlySubmissionContent({ type, content }) {
  if (!content) return <div style={{ padding: '28px', color: '#64748b' }}>Loading submitted course content…</div>;

  if (['ATTAINMENT_SETTINGS', 'ATTAINMENT_CONFIGURATION'].includes(type)) {
    const directLevels = content.directLevels ?? [];
    const indirectLevels = content.indirectLevels ?? [];
    const bands = (title, levels, tone) => <div style={{ ...surface, overflow: 'hidden', padding: 0 }}><div style={{ padding: '13px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{title}</div><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}><thead><tr style={{ color: '#64748b', textAlign: 'left' }}><th style={{ padding: '10px 14px' }}>Level</th><th>Minimum %</th><th>Maximum %</th><th>Attainment Score</th></tr></thead><tbody>{levels.map((level) => <tr key={level.level} style={{ borderTop: '1px solid #f1f5f9' }}><td style={{ padding: '11px 14px', fontWeight: 800, color: tone }}>Level {level.level}</td><td>{level.minPercentage}%</td><td>{level.maxPercentage}%</td><td>{level.level}.0 / 3.0</td></tr>)}</tbody></table></div>;
    return <div style={{ display: 'grid', gap: '16px' }}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>{[['Direct Weight', `${content.directWeight ?? '—'}%`, '#4f46e5'], ['Indirect Weight', `${content.indirectWeight ?? '—'}%`, '#0284c7'], ['Direct Threshold', `${content.directThreshold ?? '—'}%`, '#059669']].map(([label, value, color]) => <div key={label} style={{ ...surface, padding: '16px 18px' }}><div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>{label}</div><div style={{ color, fontSize: '25px', fontWeight: 800, marginTop: 5 }}>{value}</div></div>)}</div>{bands('Direct Assessment Level Bands', directLevels, '#4f46e5')}{bands('Indirect Assessment Level Bands', indirectLevels, '#0284c7')}</div>;
  }

  const outcomes = Array.isArray(content) ? content : (content.outcomes ?? content.courseOutcomes ?? []);
  return <div style={{ ...surface, overflow: 'hidden', padding: 0 }}><div style={{ padding: '13px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{['COURSE_OUTCOMES_TARGETS', 'CO_DEFINITION'].includes(type) ? 'Course Outcomes & Targets' : 'Course Action Taken Report'}</div><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}><thead><tr style={{ color: '#64748b', textAlign: 'left' }}><th style={{ padding: '10px 14px' }}>CO</th><th>Outcome Statement</th><th>Target</th>{!['COURSE_OUTCOMES_TARGETS', 'CO_DEFINITION'].includes(type) && <><th>Attainment</th><th>Observation</th><th>Actions Taken</th></>}</tr></thead><tbody>{outcomes.map((item, index) => <tr key={item.id ?? item.code ?? item.outcomeCode ?? index} style={{ borderTop: '1px solid #f1f5f9', verticalAlign: 'top' }}><td style={{ padding: '12px 14px', fontWeight: 800, color: '#4f46e5' }}>{item.code ?? item.outcomeCode ?? `CO${index + 1}`}</td><td style={{ padding: '12px 8px', minWidth: 240 }}>{item.statement ?? item.outcomeStatement ?? '—'}</td><td style={{ padding: '12px 8px' }}>{item.targetLevel ?? item.target ?? '—'}</td>{!['COURSE_OUTCOMES_TARGETS', 'CO_DEFINITION'].includes(type) && <><td style={{ padding: '12px 8px' }}>{item.attainmentLevel ?? item.actual ?? '—'}</td><td style={{ padding: '12px 8px' }}>{item.observation ?? item.remark ?? '—'}</td><td style={{ padding: '12px 8px' }}>{Array.isArray(item.actions) ? item.actions.filter(Boolean).join('; ') || '—' : item.actions ?? '—'}</td></>}</tr>)}</tbody></table></div></div>;
}

export default function ProgrammeCoordinatorApprovals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, role } = useAuth();
  const { loadCoordinatorProgrammeBatches = () => Promise.resolve([]) } = useAcademic();
  const [programmeBatchCourses, setProgrammeBatchCourses] = useState([]);
  const [programmeBatches, setProgrammeBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(() => sessionStorage.getItem(`nba_pc_approvals_batch:${user?.email ?? 'current-user'}`) ?? '');
  const [queueTab, setQueueTab] = useState(() => searchParams.get('queue') === 'REVIEWED' ? 'REVIEWED' : 'PENDING');
  const [approvals, setApprovals] = useState([]);
  const [selectedId, setSelectedId] = useState(() => searchParams.get('approvalId'));
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState('');
  const requestedScope = useRef(null);

  useEffect(() => {
    if (selectedBatchId) sessionStorage.setItem(`nba_pc_approvals_batch:${user?.email ?? 'current-user'}`, selectedBatchId);
  }, [selectedBatchId, user?.email]);

  const openApproval = (approvalId, courseId = null) => {
    setDetails(null);
    if (courseId) setSelectedCourseId(courseId);
    setSelectedId(approvalId);
    setSearchParams({ approvalId, queue: queueTab });
  };

  const closeApproval = () => {
    setSelectedId(null);
    setSelectedCourseId(null);
    setDetails(null);
    setHistory([]);
    setSearchParams({ queue: queueTab });
  };

  const loadQueue = useCallback(async ({ reloadCourses = false, programmeBatchId: requestedBatchId = null, queue = queueTab } = {}) => {
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

      // Each tab uses its dedicated programme-batch approval API. The
      // reviewed endpoint returns the course cards and reviewed item metadata.
      const approvalResponse = queue === 'REVIEWED'
        ? await apiClient.get('/approvals/reviewed', { params: { programmeBatchId: activeBatchId } })
        : await apiClient.get('/approvals/pending', { params: { programmeBatchId: activeBatchId } });
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
      const requests = flattenInbox(approvalResponse);
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
  }, [loadCoordinatorProgrammeBatches, programmeBatchCourses, programmeBatches, queueTab, selectedBatchId, user?.email]);

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
    const approvalId = searchParams.get('approvalId');
    const requestedQueue = searchParams.get('queue');
    if (requestedQueue === 'PENDING' || requestedQueue === 'REVIEWED') setQueueTab(requestedQueue);
    if (approvalId && approvalId !== selectedId) setSelectedId(approvalId);
  }, [searchParams, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    const selectedRequest = approvals.find((item) => item.id === selectedId);
    const courseId = selectedRequest?.programmeBatchCourseId ?? selectedCourseId;
    if (!courseId) return undefined;
    apiClient.get(`/approvals/programme-batch-courses/${courseId}`).then((response) => {
      if (!active) return;
      const workspace = unwrap(response) ?? {};
      const approval = (workspace.approvalItems ?? []).find((item) => item.approvalRequestId === selectedId) ?? {};
      setDetails({ ...selectedRequest, ...approval, id: approval.approvalRequestId ?? selectedId, programmeBatchCourseId: courseId, programmeBatchCourse: workspace.programmeBatchCourse, workspaceApprovalItems: workspace.approvalItems ?? [] });
      setRemarks('');
    }).catch((err) => active && setError(err?.response?.data?.message || 'Unable to load approval details.'));
    return () => { active = false; };
  }, [approvals, selectedCourseId, selectedId]);

  const applyAction = async (action) => {
    if (!details?.id) return;
    if (action === 'REQUEST_REVISION' && !remarks.trim()) {
      setError('Enter a reason before requesting a revision.');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const reviewer = {
        actorName: user?.name ?? user?.username ?? user?.email ?? 'Programme Coordinator',
        actorRole: role ?? 'PROGRAMME_COORDINATOR',
      };
      if (action === 'APPROVE') {
        await apiClient.post(`/approvals/${details.id}/approve`, reviewer);
      } else {
        await apiClient.post(`/approvals/${details.id}/request-revision`, { reason: remarks, ...reviewer });
      }
      const nextStatus = action === 'APPROVE' ? 'APPROVED' : 'REVISION_REQUESTED';
      // Keep the coordinator in this course workspace so its other approval
      // tabs remain available after reviewing the current submission.
      setDetails((current) => current ? {
        ...current,
        status: nextStatus,
        workspaceApprovalItems: (current.workspaceApprovalItems ?? []).map((item) => (
          (item.approvalRequestId ?? item.id) === current.id ? { ...item, status: nextStatus } : item
        )),
      } : current);
      setRemarks('');
      await loadQueue();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to update this approval.');
    } finally {
      setActionLoading(false);
    }
  };

  const selected = details?.id === selectedId ? details : approvals.find((item) => item.id === selectedId);
  const isPending = (item) => item.status === 'PENDING' || item.status === 'SUBMITTED' || item.status === 'PENDING_APPROVAL';
  const isApproved = (item) => item?.status === 'APPROVED' || item?.status === 'VERIFIED';
  const isRevisionRequested = (item) => item?.status === 'REVISION_REQUESTED' || item?.status === 'REJECTED';
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
  const approvalLabels = {
    ATTAINMENT_SETTINGS: 'Attainment Settings',
    ATTAINMENT_CONFIGURATION: 'Attainment Settings',
    COURSE_OUTCOMES_TARGETS: 'Course Outcomes & Targets',
    CO_DEFINITION: 'Course Outcomes & Targets',
    COURSE_ATR: 'Course ATR',
  };
  const pendingCount = scopedApprovals.filter(isPending).length;
  const workspaceSource = details?.workspaceApprovalItems ?? [selected].filter(Boolean);
  // Queue tabs only control the inbox; the course workspace exposes every
  // approval type for the selected course.
  const workspaceTabs = workspaceSource;
  const visibleWorkspaceTabs = workspaceTabs.length > 0 ? workspaceTabs : [selected].filter(Boolean);

  // A URL can retain an approvalId while its pending/reviewed list is being
  // refreshed. Stay on the selected tab until the item is available instead
  // of replacing the list with a blocking workspace-loading screen.
  useEffect(() => {
    if (!selectedId || loading || selected || selectedCourseId) return;
    setSelectedId(null);
    setDetails(null);
    setSearchParams({ queue: queueTab }, { replace: true });
  }, [loading, queueTab, selected, selectedCourseId, selectedId, setSearchParams]);

  if (selectedId && selected) {
    return <div className="animated-page" style={{ paddingBottom: '48px' }}>
      <button type="button" onClick={closeApproval} style={{ marginBottom: 16, height: 36, padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={15} /> Back to approvals</button>
      <>
        <div style={{ ...surface, padding: '20px 24px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div><div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '.08em', textTransform: 'uppercase' }}>Programme Coordinator · Read-only Review</div><h2 style={{ margin: '5px 0 0', fontSize: 20, color: '#0f172a' }}>{approvalLabels[selected.type] ?? selected.title ?? 'Course Submission'}</h2><p style={{ margin: '5px 0 0', fontSize: 12.5, color: '#64748b' }}>{selected.courseCode ?? selectedGroup?.course?.courseCode ?? '—'} · {selected.courseName ?? selectedGroup?.course?.courseName ?? 'Programme-Batch Course'} · Semester {selected.semester ?? selectedGroup?.course?.semester ?? '—'}</p></div>
          {!isPending(selected) && (() => { const [bg, color] = statusColor(selected.status); return <span style={{ color, background: bg, padding: '6px 10px', borderRadius: 6, fontWeight: 800, fontSize: 12 }}>{selected.status}</span>; })()}
        </div>
        <div style={{ ...surface, padding: '8px 12px', marginBottom: 16, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {visibleWorkspaceTabs.map((item) => <button key={item.approvalRequestId ?? item.id} type="button" onClick={() => openApproval(item.approvalRequestId ?? item.id, selected.programmeBatchCourseId)} style={{ height: 34, padding: '0 12px', borderRadius: 7, border: `1px solid ${(item.approvalRequestId ?? item.id) === selectedId ? '#4f46e5' : '#e2e8f0'}`, background: (item.approvalRequestId ?? item.id) === selectedId ? '#eef2ff' : '#ffffff', color: (item.approvalRequestId ?? item.id) === selectedId ? '#4338ca' : '#475569', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>{approvalLabels[item.type] ?? item.type}</button>)}
        </div>
        {['COURSE_ATR'].includes(selected.type) && ['APPROVED', 'VERIFIED'].includes(selected.status) && <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '14px 18px', marginBottom: 16, color: '#15803d' }}><strong style={{ fontSize: 13.5 }}>✓ Course ATR Approved by {selected.reviewedBy?.name ?? selected.reviewedBy ?? 'Programme Coordinator'}</strong><div style={{ marginTop: 4, fontSize: 12.5 }}>The Programme-Batch-Course ATR has been reviewed and approved.</div></div>}
        {['COURSE_ATR'].includes(selected.type) && ['REVISION_REQUESTED', 'REJECTED'].includes(selected.status) && <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 10, padding: '14px 18px', marginBottom: 16, color: '#92400e' }}><strong style={{ fontSize: 13.5 }}>⚠ Revision Requested by {selected.reviewedBy?.name ?? selected.reviewedBy ?? 'Programme Coordinator'}</strong><div style={{ marginTop: 4, fontSize: 12.5 }}>{selected.revisionReason || 'Please revise the submitted content as per the coordinator feedback.'}</div></div>}
        <div style={{ marginBottom: 16 }}>
          {['COURSE_OUTCOMES_TARGETS', 'CO_DEFINITION'].includes(selected.type) ? <OutcomesManagement hideHeader hideFooter readOnly suppressPendingMessage reviewCourseId={selected.programmeBatchCourseId} />
            : ['ATTAINMENT_SETTINGS', 'ATTAINMENT_CONFIGURATION'].includes(selected.type) ? <AttainmentConfig hideHeader readOnly suppressPendingMessage reviewCourseId={selected.programmeBatchCourseId} />
              : <CourseATR hideHeader hideFooter readOnly suppressPendingMessage courseId={selected.programmeBatchCourseId} />}
        </div>
        <div style={{ ...surface, padding: '16px 18px', marginBottom: 16 }}><div style={{ fontSize: 12, color: '#64748b' }}>Submitted by: <strong>{selected.submittedBy || 'Course Coordinator'}</strong><br />Submitted on: {selected.submittedAt || selected.createdAt || '—'}</div>{(isPending(selected) || isApproved(selected) || isRevisionRequested(selected)) && <>{(isPending(selected) || isApproved(selected)) && <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Reason required when requesting a revision" style={{ width: '100%', minHeight: 78, padding: 10, marginTop: 14, border: '1px solid #cbd5e1', borderRadius: 8, boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 13 }} />}<div style={{ display: 'flex', gap: 8, marginTop: 10 }}>{(isPending(selected) || isRevisionRequested(selected)) && <button type="button" disabled={actionLoading} onClick={() => applyAction('APPROVE')} style={{ padding: '8px 12px', background: '#16a34a', color: '#fff', border: 0, borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}><Check size={14} /> {isRevisionRequested(selected) ? 'Approve Revision' : 'Approve'}</button>}{(isPending(selected) || isApproved(selected)) && <button type="button" disabled={actionLoading} onClick={() => applyAction('REQUEST_REVISION')} style={{ padding: '8px 12px', background: '#fff', color: '#b45309', border: '1px solid #f59e0b', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}><Send size={14} /> Request Revision</button>}</div></>}</div>
      </>
    </div>;
  }

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
      <select value={selectedBatchId} onChange={(event) => { const nextBatchId = event.target.value; setSelectedBatchId(nextBatchId); setSelectedId(null); setDetails(null); loadQueue({ programmeBatchId: nextBatchId, queue: queueTab }); }} style={{ height: '38px', minWidth: '230px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 10px', color: '#0f172a', background: '#fff', fontWeight: 600 }}>
        {programmeBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
      </select>
      <div style={{ display: 'flex', marginLeft: 'auto', gap: '6px' }}>
        {['PENDING', 'REVIEWED'].map((tab) => <button key={tab} type="button" onClick={() => { setQueueTab(tab); setSelectedId(null); setDetails(null); setSearchParams({ queue: tab }); loadQueue({ programmeBatchId: selectedBatchId, queue: tab }); }} style={{ height: '34px', padding: '0 12px', borderRadius: '7px', border: `1px solid ${queueTab === tab ? '#4f46e5' : '#e2e8f0'}`, background: queueTab === tab ? '#eef2ff' : '#fff', color: queueTab === tab ? '#4338ca' : '#64748b', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>{tab === 'PENDING' ? `Pending (${pendingCount})` : 'Reviewed'}</button>)}
      </div>
    </div>
    <div style={{ ...surface, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}><Clock size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />{queueTab === 'PENDING' ? `${pendingCount} pending request(s)` : 'Reviewed submissions'}</div>
        {loading ? <div style={{ padding: 28, color: '#64748b' }}>Loading programme-batch courses and approval requests…</div> : courseGroups.length === 0 ? <div style={{ padding: 28, color: '#64748b' }}>No {queueTab.toLowerCase()} approval requests for this programme batch.</div> : courseGroups.map((group) => <button key={group.id} type="button" onClick={() => openApproval(group.requests[0].id, group.id)} style={{ width: '100%', textAlign: 'left', padding: '16px 18px', border: 'none', borderBottom: '1px solid #f1f5f9', background: '#fff', cursor: 'pointer' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div><strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{group.course.courseName ?? group.course.name ?? 'Programme-Batch Course'}</strong><div style={{ marginTop: 3, fontSize: '12px', color: '#64748b' }}>{group.course.courseCode ?? '—'} · Semester {group.course.semester ?? '—'}</div></div><ChevronRight size={17} color="#4f46e5" /></div><div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{group.requests.map((item) => <span key={item.id} style={{ fontSize: '10.5px', fontWeight: 800, padding: '3px 7px', borderRadius: 5, color: '#4338ca', background: '#eef2ff' }}>{approvalLabels[item.type] ?? item.title ?? item.type}</span>)}</div></button>)}
    </div>
  </div>;
}
