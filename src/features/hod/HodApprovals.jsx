import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ClipboardCheck, FileText, Layers, RefreshCw, Send, Target, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import ProgrammeCoordinatorSetupWorkflow from '../programme-coordinator/ProgrammeCoordinatorSetupWorkflow';

const surface = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 4px rgba(15, 23, 42, .04)' };
const ink = '#0f172a'; const muted = '#64748b'; const accent = '#4f46e5';
const TYPE_META = { COURSE_ALLOCATION: { label: 'Course Allocations', icon: Users }, PO_TARGETS: { label: 'PO / PSO Targets', icon: Target }, PO_PSO_TARGETS: { label: 'PO / PSO Targets', icon: Target }, PROGRAMME_ATR: { label: 'Programme ATR', icon: FileText } };
const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? null;
const asList = (response) => { const value = unwrap(response); return Array.isArray(value) ? value : []; };
const approvalIdOf = (item) => item?.approvalRequestId ?? item?.approvalId ?? item?.id ?? null;
const batchIdOf = (item) => item?.programmeBatchId ?? item?.batchId ?? null;
const semesterOf = (item) => {
  if (Number(item?.semester)) return Number(item.semester);
  const match = String(item?.resourceId ?? '').match(/-sem-(\d+)$/i);
  return match ? Number(match[1]) : null;
};
const programmeIdOf = (item) => item?.masterProgrammeId ?? item?.programmeId ?? null;
const isPendingApproval = (item) => ['PENDING', 'SUBMITTED', 'SUBMITTED_FOR_VERIFICATION', 'PENDING_APPROVAL'].includes(item?.status ?? 'PENDING');
const prettyType = (type) => TYPE_META[type]?.label ?? String(type ?? '').replaceAll('_', ' ');
const dateText = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
const batchLabelOf = (items, fallback) => {
  const title = items?.find((item) => item?.title)?.title ?? '';
  const match = title.match(/\bfor\s+(.+)$/i);
  return match?.[1] ?? fallback;
};

function EmptyState({ children }) { return <div style={{ ...surface, padding: '54px 24px', color: muted, textAlign: 'center', fontSize: '14px' }}>{children}</div>; }

function AllocationView({ review }) {
  const items = review?.courses ?? [];
  const status = String(review?.allocationStatus ?? '—').replaceAll('_', ' ');
  return <div style={{ ...surface, overflow: 'hidden' }}><div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}><div><div style={{ fontWeight: 800, color: ink }}>Course & Coordinator Allocations</div><div style={{ fontSize: '12px', color: muted, marginTop: 3 }}>{review?.programmeBatchName ?? 'Programme Batch'} · Semester {review?.semester ?? '—'} · {review?.courseCount ?? items.length} course(s)</div><div style={{ fontSize: '12px', color: muted, marginTop: 3 }}>Submitted by {review?.submittedBy ?? 'Programme Coordinator'}{review?.submittedAt ? ` · ${dateText(review.submittedAt)}` : ''}</div></div><span style={{ color: review?.canApprove ? '#a16207' : '#15803d', background: review?.canApprove ? '#fffbeb' : '#f0fdf4', border: `1px solid ${review?.canApprove ? '#fde68a' : '#bbf7d0'}`, borderRadius: 999, padding: '5px 9px', fontSize: 11, fontWeight: 800 }}>{status}</span></div>{review?.remarks && <div style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: muted, fontSize: 12 }}>{review.remarks}</div>}<div style={{ overflowX: 'auto' }}><table className="audit-data-table" style={{ margin: 0, border: 0, minWidth: 860 }}><thead><tr><th>Course Code</th><th>Course Name</th><th>Credits</th><th>Type</th><th>Semester</th><th>Course Coordinator</th><th>Assigned Faculty</th></tr></thead><tbody>{items.length ? items.map((course) => <tr key={course.programmeBatchCourseId ?? course.id}><td style={{ fontWeight: 800, color: accent }}>{course.courseCode ?? course.code ?? '—'}</td><td style={{ fontWeight: 650, color: ink }}>{course.courseName ?? course.name ?? '—'}</td><td>{course.credits ?? '—'}</td><td>{course.courseType ?? '—'}</td><td>Sem {course.semester ?? '—'}</td><td>{course.courseCoordinatorName ?? course.courseCoordinatorEmail ?? 'Unassigned'}</td><td>{course.assignedFaculty ?? course.courseCoordinatorEmail ?? '—'}</td></tr>) : <tr><td colSpan="7" style={{ textAlign: 'center', color: muted, padding: 28 }}>No submitted course allocations were returned.</td></tr>}</tbody></table></div></div>;
}

function TargetsView({ data }) {
  const pos = data?.pos ?? [];
  const psos = data?.psos ?? [];
  const readOnlyTarget = (value, color) => <span style={{ display: 'inline-flex', width: 90, height: 36, alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color, fontSize: 13.5, fontWeight: 750 }}>{Number(value ?? 0).toFixed(1)}</span>;
  const table = (items, kind, color, heading) => <div style={{ marginBottom: 20 }}><div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>{heading} ({items.length} {kind}s)</div><div style={{ ...surface, overflow: 'hidden', padding: 0 }}><table className="audit-data-table" style={{ margin: 0, border: 0 }}><thead><tr><th style={{ width: 80, textAlign: 'center' }}>{kind}</th><th>Statement</th><th style={{ width: 160, textAlign: 'center' }}>Target Level (1.0 – 3.0)</th></tr></thead><tbody>{items.map((item) => <tr key={item.id ?? item.code}><td style={{ textAlign: 'center', fontWeight: 800, color }}>{item.code}</td><td style={{ fontSize: 12.5, color: ink }}>{item.statement ?? '—'}</td><td style={{ textAlign: 'center' }}>{readOnlyTarget(item.target ?? (kind === 'PO' ? data?.poTargets?.[item.code] : data?.psoTargets?.[item.code]), color)}</td></tr>)}</tbody></table></div></div>;
  if (!pos.length && !psos.length) return <EmptyState>No submitted PO / PSO targets were returned.</EmptyState>;
  return <div><div style={{ ...surface, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><div style={{ fontWeight: 800, color: ink }}>PO / PSO Target Levels</div><div style={{ fontSize: 12, color: muted, marginTop: 3 }}>Submitted programme-batch benchmark targets — read-only HOD review</div></div><span style={{ color: data?.canApprove ? '#a16207' : '#15803d', background: data?.canApprove ? '#fffbeb' : '#f0fdf4', border: `1px solid ${data?.canApprove ? '#fde68a' : '#bbf7d0'}`, borderRadius: 999, padding: '5px 9px', fontSize: 11, fontWeight: 800 }}>{String(data?.status ?? '—').replaceAll('_', ' ')}</span></div>{pos.length > 0 && table(pos, 'PO', accent, 'Programme Outcomes — Target Levels')}{psos.length > 0 && table(psos, 'PSO', '#059669', 'Programme Specific Outcomes — Target Levels')}</div>;
}

function AtrView({ data }) {
  const outcomes = [...(data?.poOutcomes ?? []).map((item) => ({ ...item, kind: 'PO' })), ...(data?.psoOutcomes ?? []).map((item) => ({ ...item, kind: 'PSO' }))];
  const outcomeCard = (item) => { const target = Number(item.targetLevel ?? 0); const attained = Number(item.attainmentLevel ?? 0); const met = attained >= target; const tone = item.kind === 'PO' ? accent : '#059669'; const actions = Array.isArray(item.actions) ? item.actions.filter(Boolean) : []; return <div key={`${item.kind}-${item.outcomeCode}`} style={{ border: `1px solid ${met ? '#bbf7d0' : '#fecaca'}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.03)' }}><div style={{ background: met ? '#f0fdf4' : '#fef2f2', borderBottom: `1px solid ${met ? '#bbf7d0' : '#fecaca'}`, padding: '10px 16px', color: ink, fontSize: 13, fontWeight: 700 }}><span style={{ color: tone, fontWeight: 900, marginRight: 6 }}>{item.outcomeCode}</span>{item.outcomeStatement ?? '—'}</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', borderBottom: '1px solid #f1f5f9' }}>{[['Target', target], ['Attainment', attained], ['Achievement', item.achievementPercentage != null ? `${Number(item.achievementPercentage).toFixed(1)}%` : '—']].map(([label, value]) => <div key={label} style={{ padding: '11px 14px', borderRight: '1px solid #f1f5f9' }}><div style={{ color: muted, fontSize: 10.5, fontWeight: 750, textTransform: 'uppercase' }}>{label}</div><div style={{ marginTop: 3, color: ink, fontSize: 15, fontWeight: 800 }}>{value}</div></div>)}</div><div style={{ padding: '12px 16px' }}><div style={{ color: muted, fontSize: 10.5, fontWeight: 750, textTransform: 'uppercase', marginBottom: 6 }}>Corrective actions</div>{actions.length ? <ul style={{ margin: 0, paddingLeft: 18, color: ink, fontSize: 12.5, lineHeight: 1.5 }}>{actions.map((action, index) => <li key={index}>{action}</li>)}</ul> : <span style={{ color: muted, fontSize: 12 }}>No corrective action recorded.</span>}</div></div>; };
  if (!outcomes.length) return <EmptyState>No submitted Programme ATR data was returned.</EmptyState>;
  return <div><div style={{ ...surface, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><div style={{ fontWeight: 800, color: ink }}>Programme Action Taken Report</div><div style={{ fontSize: 12, color: muted, marginTop: 3 }}>{data?.programme?.code ? `${data.programme.code} · ` : ''}{data?.programme?.name ?? 'Programme Batch'} · {data?.batch?.name ?? '—'}</div><div style={{ fontSize: 12, color: muted, marginTop: 3 }}>Submitted Programme ATR — read-only HOD review</div></div><span style={{ color: data?.canApprove ? '#a16207' : '#15803d', background: data?.canApprove ? '#fffbeb' : '#f0fdf4', border: `1px solid ${data?.canApprove ? '#fde68a' : '#bbf7d0'}`, borderRadius: 999, padding: '5px 9px', fontSize: 11, fontWeight: 800 }}>{String(data?.status ?? '—').replaceAll('_', ' ')}</span></div>{['PO', 'PSO'].map((kind) => { const rows = outcomes.filter((item) => item.kind === kind); if (!rows.length) return null; const tone = kind === 'PO' ? accent : '#059669'; return <div key={kind} style={{ marginBottom: 20 }}><div style={{ color: tone, fontSize: 11, fontWeight: 750, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>{kind === 'PO' ? 'Programme Outcomes' : 'Programme Specific Outcomes'}</div><div style={{ display: 'grid', gap: 12 }}>{rows.map(outcomeCard)}</div></div>; })}</div>;
}

export default function HodApprovals() {
  const { user } = useAuth();
  const { masterProgrammes = [], programmeId, setProgrammeId = () => {}, batchId, setBatchId = () => {}, selectedDepartmentId, loadProgrammes = async () => [] } = useAcademic();
  const [searchParams, setSearchParams] = useSearchParams();
  const storageKey = `nba_hod_approvals_programme:${user?.email ?? 'default'}`;
  const [selectedProgrammeId, setSelectedProgrammeId] = useState(() => programmeId ?? sessionStorage.getItem(storageKey) ?? '');
  const [approvals, setApprovals] = useState([]); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [tab, setTab] = useState(''); const [queueTab, setQueueTab] = useState('PENDING');
  const [detail, setDetail] = useState({ loading: false, error: '', allocationReview: null, targets: null, atr: null }); const [revisionReason, setRevisionReason] = useState(''); const [actionLoading, setActionLoading] = useState(false);
  const loadedQueueScopeRef = useRef('');
  const loadedProgrammesDepartmentRef = useRef('');
  useEffect(() => {
    if (!selectedDepartmentId || loadedProgrammesDepartmentRef.current === String(selectedDepartmentId)) return;
    loadedProgrammesDepartmentRef.current = String(selectedDepartmentId);
    loadProgrammes(selectedDepartmentId).catch(() => {});
  }, [loadProgrammes, selectedDepartmentId]);
  const departmentProgrammes = useMemo(() => masterProgrammes.filter((programme) => !selectedDepartmentId || String(programme.departmentId) === String(selectedDepartmentId)), [masterProgrammes, selectedDepartmentId]);
  const programmes = selectedDepartmentId ? departmentProgrammes : [];
  useEffect(() => { if (programmes.length) setSelectedProgrammeId((current) => programmes.some((programme) => String(programme.id) === String(programmeId ?? current)) ? (programmeId ?? current) : programmes[0].id); }, [programmes, programmeId]);
  useEffect(() => { if (selectedProgrammeId) sessionStorage.setItem(storageKey, selectedProgrammeId); }, [selectedProgrammeId, storageKey]);
  useEffect(() => { if (selectedProgrammeId && String(selectedProgrammeId) !== String(programmeId)) setProgrammeId(selectedProgrammeId); }, [programmeId, selectedProgrammeId, setProgrammeId]);
  const loadQueue = useCallback(async ({ force = false, queue = queueTab } = {}) => {
    if (!selectedDepartmentId || !selectedProgrammeId) return;
    const scope = `${selectedDepartmentId}:${selectedProgrammeId}:${queue}`;
    if (!force && loadedQueueScopeRef.current === scope) return;
    loadedQueueScopeRef.current = scope;
    setLoading(true); setError('');
    try {
      const approvalResponse = queue === 'REVIEWED'
        ? await apiClient.get('/approvals/hod/reviewed', { params: { masterProgrammeId: selectedProgrammeId } })
        : await apiClient.get('/approvals/pending');
      setApprovals(asList(approvalResponse).filter((item) => !programmeIdOf(item) || String(programmeIdOf(item)) === String(selectedProgrammeId)));
    } catch (requestError) { setError(requestError?.response?.data?.message ?? 'Unable to load HOD approvals.'); setApprovals([]); } finally { setLoading(false); }
  }, [queueTab, selectedDepartmentId, selectedProgrammeId]);
  useEffect(() => { loadQueue(); }, [loadQueue]);
  const groupedBatches = useMemo(() => { const groups = new Map(); approvals.filter((item) => queueTab === 'PENDING' ? isPendingApproval(item) : !isPendingApproval(item)).forEach((item) => { const id = batchIdOf(item); if (!id) return; if (!groups.has(id)) groups.set(id, []); groups.get(id).push(item); }); return [...groups.entries()].map(([id, items]) => ({ id, items, label: batchLabelOf(items, id) })).sort((a, b) => a.label.localeCompare(b.label)); }, [approvals, queueTab]);
  const selectedBatchId = searchParams.get('batchId'); const selectedApprovalId = searchParams.get('approvalId'); const selectedGroup = groupedBatches.find((group) => String(group.id) === String(selectedBatchId)) ?? null; const selectedApproval = selectedGroup?.items.find((item) => String(approvalIdOf(item)) === String(selectedApprovalId)) ?? selectedGroup?.items.find((item) => item.type === tab) ?? null;
  useEffect(() => { if (selectedGroup?.id && String(selectedGroup.id) !== String(batchId)) setBatchId(selectedGroup.id); }, [batchId, selectedGroup?.id, setBatchId]);
  useEffect(() => { if (!selectedGroup) { setTab(''); return; } setTab(selectedApproval?.type ?? selectedGroup.items[0]?.type ?? ''); }, [selectedApproval?.type, selectedGroup]);
  useEffect(() => {
    if (!selectedApproval) {
      setDetail({ loading: false, error: '', allocationReview: null, targets: null, atr: null });
      return;
    }
    const targetBatchId = batchIdOf(selectedApproval);
    if (!targetBatchId) {
      setDetail({ loading: false, error: 'This approval request is missing its programme-batch scope.', allocationReview: null, targets: null, atr: null });
      return;
    }
    const semester = semesterOf(selectedApproval);
    const type = selectedApproval.type;
    const request = type === 'COURSE_ALLOCATION'
      ? semester
        ? apiClient.get(`/academic/programme-batches/${targetBatchId}/semesters/${semester}/review-courses`)
        : Promise.reject(new Error('This semester allocation request is missing its semester scope.'))
      : type === 'PO_TARGETS' || type === 'PO_PSO_TARGETS'
        ? apiClient.get(`/outcomes/programme-batches/${targetBatchId}/review`)
        : type === 'PROGRAMME_ATR'
          ? apiClient.get(`/academic/programme-batches/${targetBatchId}/atr/review`)
          : Promise.resolve(null);
    let current = true;
    setDetail({ loading: true, error: '', allocationReview: null, targets: null, atr: null });
    request
      .then((response) => {
        if (!current) return;
        const content = unwrap(response);
        const targets = type === 'PO_TARGETS' || type === 'PO_PSO_TARGETS' ? content : null;
        setDetail({ loading: false, error: '', allocationReview: type === 'COURSE_ALLOCATION' ? content : null, targets, atr: type === 'PROGRAMME_ATR' ? content : null });
      })
      .catch((requestError) => {
        if (current) setDetail({ loading: false, error: requestError?.response?.data?.message ?? 'Unable to load submitted semester allocations.', allocationReview: null, targets: null, atr: null });
      });
    return () => { current = false; };
  }, [selectedApproval]);
  const handleAction = async (action) => { const approvalId = approvalIdOf(selectedApproval); const status = selectedApproval?.status; const canApprove = isPendingApproval(selectedApproval) || ['REVISION_REQUESTED', 'REJECTED'].includes(status); const canRequestRevision = isPendingApproval(selectedApproval) || ['APPROVED', 'VERIFIED'].includes(status); if (!approvalId || (action === 'approve' && !canApprove) || (action === 'revision' && !canRequestRevision)) return; if (action === 'revision' && !revisionReason.trim()) { setError('Enter revision feedback before sending the request.'); return; } setActionLoading(true); setError(''); try { const actor = { actorName: user?.name ?? user?.username ?? user?.email ?? 'Head of Department', actorRole: 'HOD' }; if (action === 'approve') await apiClient.post(`/approvals/${approvalId}/approve`, { ...actor, remarks: revisionReason.trim() || 'Reviewed and approved.' }); else await apiClient.post(`/approvals/${approvalId}/request-revision`, { ...actor, reason: revisionReason.trim() }); setRevisionReason(''); await loadQueue({ force: true }); } catch (requestError) { setError(requestError?.response?.data?.message ?? 'Unable to complete the review action.'); } finally { setActionLoading(false); } };
  const activeProgramme = programmes.find((programme) => String(programme.id) === String(selectedProgrammeId));
  const handleProgrammeChange = (nextProgrammeId) => {
    setSelectedProgrammeId(nextProgrammeId);
    setProgrammeId(nextProgrammeId);
    setSearchParams({});
  };
  if (selectedGroup) {
    const status = selectedApproval?.status ?? 'PENDING';
    const approved = status === 'APPROVED' || status === 'VERIFIED';
    const revisionRequested = status === 'REVISION_REQUESTED' || status === 'REJECTED';
    const canRequestRevision = isPendingApproval(selectedApproval) || approved;
    const canApprove = isPendingApproval(selectedApproval) || revisionRequested;
    const statusTone = approved ? { background: '#dcfce7', color: '#15803d', border: '#bbf7d0' } : revisionRequested ? { background: '#fef2f2', color: '#b91c1c', border: '#fecaca' } : { background: '#fffbeb', color: '#92400e', border: '#fde68a' };
    return <div className="animated-page" style={{ display: 'grid', gap: 18, paddingBottom: 48 }}>
      <div style={{ ...surface, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div><button onClick={() => setSearchParams({})} style={{ border: 0, background: 'transparent', color: accent, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 13 }}><ChevronLeft size={16} /> {queueTab === 'REVIEWED' ? 'Reviewed approvals' : 'Pending approvals'}</button><div style={{ color: ink, fontSize: 19, fontWeight: 800, marginTop: 6 }}>{selectedGroup.label}</div><div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{activeProgramme?.code ? `${activeProgramme.code} · ` : ''}{activeProgramme?.name ?? 'Master Programme'}</div></div>
        <span style={{ fontSize: 12, color: statusTone.color, background: statusTone.background, border: `1px solid ${statusTone.border}`, padding: '5px 10px', borderRadius: 999, fontWeight: 700 }}>{status.replaceAll('_', ' ')}</span>
      </div>
      <div style={{ ...surface, padding: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{selectedGroup.items.map((item) => { const meta = TYPE_META[item.type] ?? { label: prettyType(item.type), icon: Layers }; const Icon = meta.icon; const active = String(approvalIdOf(item)) === String(approvalIdOf(selectedApproval)); const semester = semesterOf(item); return <button key={approvalIdOf(item)} onClick={() => setSearchParams({ batchId: selectedGroup.id, approvalId: approvalIdOf(item) })} style={{ border: active ? '1px solid #c7d2fe' : '1px solid transparent', color: active ? accent : muted, background: active ? '#eef2ff' : 'transparent', borderRadius: 8, cursor: 'pointer', padding: '9px 12px', display: 'inline-flex', gap: 7, alignItems: 'center', fontFamily: 'inherit', fontSize: 13, fontWeight: 750 }}><Icon size={16} />{meta.label}{semester ? ` · Sem ${semester}` : ''}</button>; })}</div>
      {error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>{error}</div>}
      {detail.loading ? <EmptyState>Loading submitted {prettyType(tab).toLowerCase()}…</EmptyState> : detail.error ? <EmptyState>{detail.error}</EmptyState> : tab === 'COURSE_ALLOCATION' ? <AllocationView review={detail.allocationReview} /> : tab === 'PO_TARGETS' || tab === 'PO_PSO_TARGETS' ? <TargetsView data={detail.targets} /> : tab === 'PROGRAMME_ATR' ? <AtrView data={detail.atr} /> : <EmptyState>No dedicated review data is available for this approval type.</EmptyState>}
      {(canRequestRevision || canApprove) && <div style={{ ...surface, padding: 18, display: 'grid', gap: 12 }}><div style={{ fontWeight: 800, color: ink }}>{approved ? 'Approved item review' : revisionRequested ? 'Revision review decision' : 'HOD review decision'}</div>{canRequestRevision && <textarea value={revisionReason} onChange={(event) => setRevisionReason(event.target.value)} placeholder="Revision feedback (required when requesting revision)" rows={3} style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 8, padding: 10, fontFamily: 'inherit', fontSize: 13, color: ink }} />}<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>{canRequestRevision && <button disabled={actionLoading} onClick={() => handleAction('revision')} style={{ border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', borderRadius: 8, padding: '9px 13px', cursor: 'pointer', fontWeight: 750, fontFamily: 'inherit' }}><Send size={15} style={{ verticalAlign: -3, marginRight: 5 }} />Request revision</button>}{canApprove && <button disabled={actionLoading} onClick={() => handleAction('approve')} style={{ border: 0, background: '#16a34a', color: '#fff', borderRadius: 8, padding: '9px 13px', cursor: 'pointer', fontWeight: 750, fontFamily: 'inherit' }}><Check size={15} style={{ verticalAlign: -3, marginRight: 5 }} />{revisionRequested ? 'Approve' : 'Approve'}</button>}</div></div>}
    </div>;
  }
  if (selectedGroup) {
    return <div className="animated-page" style={{ display: 'grid', gap: 18, paddingBottom: 48 }}><div style={{ ...surface, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}><div><button onClick={() => setSearchParams({})} style={{ border: 0, background: 'transparent', color: accent, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 13 }}><ChevronLeft size={16} /> Pending approvals</button><div style={{ color: ink, fontSize: 19, fontWeight: 800, marginTop: 6 }}>{selectedGroup.label}</div><div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{activeProgramme?.code ? `${activeProgramme.code} · ` : ''}{activeProgramme?.name ?? 'Master Programme'}</div></div><span style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', padding: '5px 10px', borderRadius: 999, fontWeight: 700 }}>Pending HOD review</span></div><div style={{ ...surface, padding: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{selectedGroup.items.map((item) => { const meta = TYPE_META[item.type] ?? { label: prettyType(item.type), icon: Layers }; const Icon = meta.icon; const active = tab === item.type; return <button key={item.type} onClick={() => setTab(item.type)} style={{ border: active ? '1px solid #c7d2fe' : '1px solid transparent', color: active ? accent : muted, background: active ? '#eef2ff' : 'transparent', borderRadius: 8, cursor: 'pointer', padding: '9px 12px', display: 'inline-flex', gap: 7, alignItems: 'center', fontFamily: 'inherit', fontSize: 13, fontWeight: 750 }}><Icon size={16} />{meta.label}</button>; })}</div>{error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>{error}</div>}{detail.loading ? <EmptyState>Loading submitted {prettyType(tab).toLowerCase()}…</EmptyState> : detail.error ? <EmptyState>{detail.error}</EmptyState> : tab === 'COURSE_ALLOCATION' ? <ProgrammeCoordinatorSetupWorkflow approvalViewStep={1} approvalReadOnly /> : tab === 'PO_TARGETS' || tab === 'PO_PSO_TARGETS' ? <ProgrammeCoordinatorSetupWorkflow approvalViewStep={2} approvalReadOnly /> : <ProgrammeCoordinatorSetupWorkflow approvalViewStep={4} approvalReadOnly />}<div style={{ ...surface, padding: 18, display: 'grid', gap: 12 }}><div style={{ fontWeight: 800, color: ink }}>HOD review decision</div><textarea value={revisionReason} onChange={(event) => setRevisionReason(event.target.value)} placeholder="Revision feedback (required only when requesting revision)" rows={3} style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 8, padding: 10, fontFamily: 'inherit', fontSize: 13, color: ink }} /><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}><button disabled={actionLoading} onClick={() => handleAction('revision')} style={{ border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', borderRadius: 8, padding: '9px 13px', cursor: 'pointer', fontWeight: 750, fontFamily: 'inherit' }}><Send size={15} style={{ verticalAlign: -3, marginRight: 5 }} />Request revision</button><button disabled={actionLoading} onClick={() => handleAction('approve')} style={{ border: 0, background: '#16a34a', color: '#fff', borderRadius: 8, padding: '9px 13px', cursor: 'pointer', fontWeight: 750, fontFamily: 'inherit' }}><Check size={15} style={{ verticalAlign: -3, marginRight: 5 }} />Approve</button></div></div></div>;
  }
  return <div className="animated-page" style={{ display: 'grid', gap: 18, paddingBottom: 48 }}><div style={{ ...surface, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}><div><div style={{ display: 'flex', gap: 8, alignItems: 'center', color: accent }}><ClipboardCheck size={20} /><span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>HOD approval queue</span></div><h2 style={{ margin: '7px 0 3px', fontSize: 21, color: ink }}>{queueTab === 'PENDING' ? 'Pending Programme Batch Reviews' : 'Reviewed Programme Batch Submissions'}</h2><div style={{ fontSize: 13, color: muted }}>Review Programme Coordinator submissions for the selected Master Programme.</div></div><div style={{ display: 'flex', gap: 9, alignItems: 'end', flexWrap: 'wrap' }}><label style={{ display: 'grid', gap: 4, fontSize: 11, fontWeight: 700, color: muted }}>Master Programme<select aria-label="Master programme" value={selectedProgrammeId} onChange={(event) => handleProgrammeChange(event.target.value)} disabled={programmes.length === 0} style={{ height: 40, minWidth: 250, border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', background: '#fff', color: ink, fontFamily: 'inherit', fontSize: 13, fontWeight: 650, cursor: programmes.length ? 'pointer' : 'not-allowed' }}>{programmes.length === 0 ? <option value="">No master programmes available</option> : programmes.map((programme) => <option key={programme.id} value={programme.id}>{programme.code || programme.id} — {programme.name}</option>)}</select></label><div style={{ display: 'flex', gap: 5 }}>{['PENDING', 'REVIEWED'].map((item) => <button key={item} type="button" onClick={() => { setQueueTab(item); setSearchParams({}); }} style={{ height: 40, padding: '0 11px', border: `1px solid ${queueTab === item ? '#4f46e5' : '#cbd5e1'}`, borderRadius: 8, background: queueTab === item ? '#eef2ff' : '#fff', color: queueTab === item ? accent : muted, fontWeight: 750, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>{item === 'PENDING' ? 'Pending' : 'Reviewed'}</button>)}</div><button onClick={() => loadQueue({ force: true })} title="Refresh approvals" style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, color: accent, cursor: 'pointer' }}><RefreshCw size={17} /></button></div></div>{error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>{error}</div>}{loading ? <EmptyState>Loading {queueTab.toLowerCase()} approvals…</EmptyState> : !selectedProgrammeId ? <EmptyState>Select a Master Programme above to view approvals.</EmptyState> : !groupedBatches.length ? <EmptyState>No {queueTab.toLowerCase()} approvals for this Master Programme.</EmptyState> : <div style={{ display: 'grid', gap: 12 }}>{groupedBatches.map((group) => <button key={group.id} onClick={() => setSearchParams({ batchId: group.id })} style={{ ...surface, padding: 18, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}><div><div style={{ fontWeight: 800, color: ink, fontSize: 15 }}>{group.label}</div><div style={{ fontSize: 12, color: muted, marginTop: 4 }}>Submitted by {group.items[0]?.submittedBy ?? 'Programme Coordinator'} · {dateText(group.items[0]?.submittedAt)}</div><div style={{ display: 'flex', gap: 6, marginTop: 11, flexWrap: 'wrap' }}>{group.items.map((item) => <span key={item.type} style={{ background: item.status === 'APPROVED' || item.status === 'VERIFIED' ? '#dcfce7' : item.status === 'REVISION_REQUESTED' ? '#fef2f2' : '#eef2ff', color: item.status === 'APPROVED' || item.status === 'VERIFIED' ? '#15803d' : item.status === 'REVISION_REQUESTED' ? '#b91c1c' : accent, borderRadius: 999, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{prettyType(item.type)} · {item.status}</span>)}</div></div><span style={{ color: accent, fontWeight: 750, fontSize: 13 }}>{queueTab === 'PENDING' ? 'Review' : 'View'} {group.items.length} item{group.items.length === 1 ? '' : 's'} →</span></button>)}</div>}</div>;
}
