import { useEffect, useState } from 'react';
import { Download, Eye, FileCheck2, FileSpreadsheet, FileText, Search, X } from 'lucide-react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import { reportsApi } from '../../api';
import { downloadReportBlob } from '../../utils/reportDownload';
import { ScreenEmptyState, ScreenErrorState, ScreenLoadingState } from '../../components/common/ScreenState';

const labels = { COURSE_ATR: 'Course ATR', PROGRAMME_ATR: 'Programme ATR', COURSE_ATTAINMENT: 'Course Attainment', PROGRAMME_ATTAINMENT: 'Programme Attainment' };
const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
const readableSize = (value) => value == null ? '—' : value < 1024 * 1024 ? `${Math.ceil(value / 1024)} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`;

export default function GeneratedReportsPage() {
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeReport, setActiveReport] = useState(null);
  const [downloading, setDownloading] = useState('');
  const [verification, setVerification] = useState(null);

  const loadReports = async () => {
    setLoading(true); setError('');
    try { const response = await reportsApi.listGeneratedReports(reportType ? { reportType } : {}); setReports(Array.isArray(unwrap(response)) ? unwrap(response) : []); }
    catch (requestError) { setError(requestError?.response?.data?.message || 'Unable to load generated reports.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadReports(); }, [reportType]);
  const filtered = reports.filter((report) => JSON.stringify(report).toLowerCase().includes(search.toLowerCase()));
  const download = async (artifact) => {
    setDownloading(artifact.artifactId);
    try { const response = await reportsApi.downloadArtifact(artifact.artifactId); downloadReportBlob(response, artifact.originalFilename || `report.${artifact.artifactType === 'PDF' ? 'pdf' : 'xlsx'}`); }
    catch (requestError) { setError(requestError?.response?.data?.message || 'Unable to download the report artifact.'); }
    finally { setDownloading(''); }
  };
  const showDetails = async (report) => {
    try { const response = await reportsApi.getGeneratedReport(report.reportId); setActiveReport(unwrap(response)); }
    catch (requestError) { setError(requestError?.response?.data?.message || 'Unable to load report details.'); }
  };
  const verify = async (report, artifact, file) => {
    if (!file) return;
    setVerification({ state: 'loading', artifactId: artifact.artifactId });
    try { const response = await reportsApi.verifyArtifact({ reportId: report.reportId, artifactType: artifact.artifactType, file }); const result = unwrap(response); setVerification({ state: result?.valid === false ? 'failed' : 'valid', message: result?.message || (result?.valid === false ? 'Integrity verification failed.' : 'Integrity verified.') }); }
    catch (requestError) { setVerification({ state: 'failed', message: requestError?.response?.data?.message || 'Integrity verification failed.' }); }
  };

  return <div style={{ display: 'flex', minHeight: '100vh' }}><AppSidebar /><main className="nba-layout-main" style={{ flex: 1, minWidth: 0 }}><AppHeader /><div className="page-container">
    <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}><div><p style={{ margin: 0, color: '#4f46e5', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>IQAC Reports</p><h2 style={{ margin: '5px 0', color: '#0f172a' }}>Generated Reports</h2><p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>Download or verify persisted, authoritative report artifacts.</p></div></section>
    <section style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: 14, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 16 }}><select value={reportType} onChange={(event) => setReportType(event.target.value)} style={{ height: 38, border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', font: 'inherit' }}><option value="">All report types</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label style={{ position: 'relative', flex: '1 1 240px' }}><Search size={15} style={{ position: 'absolute', top: 11, left: 10, color: '#64748b' }} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search report ID, programme, course, or user" style={{ width: '100%', height: 38, boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px 0 32px', font: 'inherit' }} /></label></section>
    {loading ? <ScreenLoadingState message="Loading generated reports…" /> : error && reports.length === 0 ? <ScreenErrorState title="Unable to load generated reports" message={error} onRetry={loadReports} /> : filtered.length === 0 ? <ScreenEmptyState title="No generated reports found" description="Generated reports will appear here once the backend has persisted their artifacts." /> : <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}><table className="audit-data-table" style={{ minWidth: 880 }}><thead><tr><th>Report</th><th>Academic Context</th><th>Generated</th><th>Artifacts</th><th>Actions</th></tr></thead><tbody>{filtered.map((report) => <tr key={report.reportId}><td><strong>{labels[report.reportType] || report.reportType || '—'}</strong><div style={{ color: '#64748b', fontSize: 11, marginTop: 3 }}>{report.reportId || '—'} · Template v{report.templateVersion ?? '—'}</div></td><td>{[report.institutionName, report.schoolName, report.programmeName, report.courseName, report.batchName].filter(Boolean).join(' · ') || '—'}</td><td>{report.generatedBy || '—'}<div style={{ color: '#64748b', fontSize: 11, marginTop: 3 }}>{report.generatedAt ? new Date(report.generatedAt).toLocaleString() : '—'}</div></td><td>{(report.artifacts || []).map((artifact) => <div key={artifact.artifactId} style={{ marginBottom: 5 }}><button type="button" disabled={downloading === artifact.artifactId} onClick={() => download(artifact)} style={{ border: 0, background: 'transparent', color: '#4338ca', fontSize: 12, fontWeight: 800, cursor: 'pointer', padding: 0 }}>{artifact.artifactType === 'PDF' ? <FileText size={13} style={{ verticalAlign: '-2px' }} /> : <FileSpreadsheet size={13} style={{ verticalAlign: '-2px' }} />} {downloading === artifact.artifactId ? 'Downloading…' : `${artifact.artifactType} · ${readableSize(artifact.fileSize)}`}</button></div>)}</td><td><button type="button" onClick={() => showDetails(report)} style={{ border: 0, background: 'transparent', color: '#2563eb', fontWeight: 800, cursor: 'pointer', padding: 0 }}><Eye size={13} style={{ verticalAlign: '-2px' }} /> View</button></td></tr>)}</tbody></table></div>}
    {error && reports.length > 0 && <p style={{ color: '#b91c1c', fontSize: 12 }}>{error}</p>}
    {activeReport && <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(15,23,42,.45)', display: 'grid', placeItems: 'center', padding: 16 }}><section style={{ width: 'min(100%, 680px)', maxHeight: '85vh', overflow: 'auto', background: '#fff', borderRadius: 14, padding: 20 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><div><h3 style={{ margin: 0 }}>Report Details</h3><p style={{ color: '#64748b', fontSize: 12 }}>{activeReport.reportId}</p></div><button type="button" onClick={() => setActiveReport(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><X /></button></div><dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 16px', fontSize: 13 }}>{[['Report type', labels[activeReport.reportType] || activeReport.reportType], ['Institution', activeReport.institutionName || activeReport.institutionId], ['Generated by', activeReport.generatedBy], ['Generated at', activeReport.generatedAt ? new Date(activeReport.generatedAt).toLocaleString() : null], ['Template version', activeReport.templateVersion]].map(([label, value]) => <div key={label} style={{ display: 'contents' }}><dt style={{ color: '#64748b' }}>{label}</dt><dd style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>{value ?? '—'}</dd></div>)}</dl><h4>Artifacts</h4>{(activeReport.artifacts || []).map((artifact) => <div key={artifact.artifactId} style={{ borderTop: '1px solid #e2e8f0', padding: '10px 0', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><span><strong>{artifact.originalFilename || artifact.artifactType}</strong><small style={{ display: 'block', color: '#64748b' }}>{readableSize(artifact.fileSize)}</small></span><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><button type="button" onClick={() => download(artifact)} style={{ border: 0, background: 'transparent', color: '#4338ca', fontWeight: 800, cursor: 'pointer' }}><Download size={13} /> Download</button><label style={{ color: '#047857', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}><FileCheck2 size={13} /> Verify<input type="file" onChange={(event) => verify(activeReport, artifact, event.target.files?.[0])} hidden /></label></div></div>)}{verification && <p style={{ color: verification.state === 'valid' ? '#047857' : verification.state === 'failed' ? '#b91c1c' : '#64748b', fontWeight: 700, fontSize: 13 }}>{verification.state === 'loading' ? 'Verifying artifact…' : verification.message}</p>}</section></div>}
  </div></main></div>;
}
