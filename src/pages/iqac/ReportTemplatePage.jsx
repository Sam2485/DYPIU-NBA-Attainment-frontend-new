import { useEffect, useMemo, useState } from 'react';
import { Check, Eye, FileText, Lock, Save, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import { reportAssetsApi, reportsApi } from '../../api';

const STORAGE_KEY = 'obe_report_template';
const sections = ['Header', 'Branding', 'Metadata', 'Body', 'Footer'];
const initialTemplate = {
  headerStyle: 'Formal Academic',
  logoSize: 'Auto',
  reportId: true,
  pageNumbers: true,
  confidentiality: true,
  footerText: 'This document is an official academic record of D. Y. Patil International University.',
  institutionName: 'D. Y. PATIL INTERNATIONAL UNIVERSITY, PUNE',
  subHeader: '',
  accreditationText: '',
  showLogo: true,
};
const panel = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14 };
const field = { width: '100%', height: 38, boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', font: 'inherit', color: '#0f172a', background: '#fff' };

function Toggle({ checked, onChange, label }) {
  return <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: 13, fontWeight: 700 }}>
    {label}
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} style={{ width: 16, height: 16, accentColor: '#4f46e5' }} />
  </label>;
}

function LogoSlot({ title, description, asset, onSelect, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const accept = (file) => { if (file) onSelect(file); };
  return <div>
    <div style={{ color: '#334155', fontSize: 12, fontWeight: 800 }}>{title}</div>
    <div style={{ color: '#64748b', fontSize: 11, margin: '3px 0 8px' }}>{description}</div>
    <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files?.[0]); }} style={{ minHeight: 132, border: `1.5px dashed ${dragging ? '#4f46e5' : '#cbd5e1'}`, borderRadius: 10, background: dragging ? '#eef2ff' : '#f8fafc', display: 'grid', placeItems: 'center', padding: 12, textAlign: 'center' }}>
      {asset?.url ? <img src={asset.url} alt={`${title} preview`} style={{ maxWidth: '100%', width: 120, height: 85, objectFit: 'contain' }} /> : <div style={{ color: '#64748b' }}><Upload size={22} color="#4f46e5" /><div style={{ fontSize: 12, fontWeight: 800, marginTop: 5 }}>Upload Logo</div><div style={{ fontSize: 10, marginTop: 3 }}>PNG / JPG / SVG</div></div>}
    </div>
    {asset?.url ? <div style={{ marginTop: 8, color: '#64748b', fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Filename: {asset.name || 'Uploaded logo'}{asset.uploadedAt ? ` · Uploaded: ${asset.uploadedAt}` : ''}</div> : null}
    <div style={{ display: 'flex', gap: 10, marginTop: 9 }}><label style={{ color: '#4338ca', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Upload size={14} /> {asset?.url ? 'Replace Logo' : 'Choose File'}<input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(event) => accept(event.target.files?.[0])} hidden /></label>{asset?.url && <button type="button" onClick={onRemove} style={{ padding: 0, border: 0, background: 'transparent', color: '#b91c1c', font: 'inherit', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Trash2 size={13} /> Remove</button>}</div>
  </div>;
}

function UploadDialog({ pending, uploading, error, onCancel, onUpload, onChange }) {
  if (!pending) return null;
  return <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,.48)', display: 'grid', placeItems: 'center', padding: 20 }}><section style={{ width: 'min(100%, 460px)', background: '#fff', borderRadius: 14, boxShadow: '0 24px 60px rgba(15,23,42,.28)' }}><header style={{ padding: '16px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><strong style={{ color: '#0f172a' }}>Upload {pending.slot === 'left' ? 'Left' : 'Right'} Logo</strong><div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>PNG, JPG, or SVG · maximum 5 MB</div></div><button type="button" onClick={onCancel} disabled={uploading} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><X size={18} /></button></header><div style={{ padding: 18 }}><div style={{ minHeight: 190, border: '1.5px dashed #a5b4fc', borderRadius: 10, background: '#f8fafc', display: 'grid', placeItems: 'center', padding: 14 }}><img src={pending.previewUrl} alt="Selected logo preview" style={{ maxWidth: '100%', maxHeight: 165, objectFit: 'contain' }} /></div><p style={{ margin: '11px 0 0', color: '#334155', fontSize: 13, fontWeight: 700 }}>{pending.file.name}</p>{error && <p style={{ margin: '7px 0 0', color: '#b91c1c', fontSize: 12 }}>{error}</p>}<label style={{ display: 'inline-block', marginTop: 12, color: '#4338ca', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Change file<input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(event) => onChange(event.target.files?.[0])} hidden /></label></div><footer style={{ padding: '14px 18px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button type="button" onClick={onCancel} disabled={uploading} style={{ height: 37, padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: 7, background: '#fff', fontWeight: 800, cursor: 'pointer' }}>Cancel</button><button type="button" onClick={onUpload} disabled={uploading} style={{ height: 37, padding: '0 12px', border: 0, borderRadius: 7, background: '#4f46e5', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>{uploading ? 'Uploading…' : 'Upload'}</button></footer></section></div>;
}

export default function ReportTemplatePage() {
  const [activeSection, setActiveSection] = useState('Header');
  const [template, setTemplate] = useState(initialTemplate);
  const [saved, setSaved] = useState(false);
  const [logoAssets, setLogoAssets] = useState({ left: null, right: null });
  const [pendingLogo, setPendingLogo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateError, setTemplateError] = useState('');

  useEffect(() => {
    let active = true;
    const loadLogo = async (assetId, slot) => {
      if (!assetId) return;
      try {
        const response = await reportAssetsApi.getRaw(assetId);
        if (active) setLogoAssets((current) => ({ ...current, [slot]: { assetId, url: URL.createObjectURL(response.data), name: `${slot} logo` } }));
      } catch {
        if (active) setLogoAssets((current) => ({ ...current, [slot]: { assetId, url: null, name: `${slot} logo` } }));
      }
    };
    reportsApi.getInstitutionTemplate().then((response) => {
      const data = response?.data?.data ?? response?.data;
      if (!active || !data) return;
      const header = data.headerConfig ?? {};
      const footer = data.footerConfig ?? {};
      setTemplate((current) => ({ ...current, id: data.id, templateName: data.templateName, templateVersion: data.templateVersion, institutionId: data.institutionId ?? 'DYPIU', institutionName: header.institutionName ?? current.institutionName, subHeader: header.subHeader ?? '', accreditationText: header.accreditationText ?? '', showLogo: header.showLogo ?? true, leftLogoAssetId: header.leftLogoAssetId ?? null, rightLogoAssetId: header.rightLogoAssetId ?? null, footerText: footer.standardFooterText ?? current.footerText, pageNumbers: footer.showPageNumbers ?? current.pageNumbers, showGeneratedTimestamp: footer.showGeneratedTimestamp ?? true, showVerificationHash: footer.showVerificationHash ?? true }));
      loadLogo(header.leftLogoAssetId, 'left');
      loadLogo(header.rightLogoAssetId, 'right');
    }).catch((error) => { if (active) setTemplateError(error?.response?.data?.message || 'Unable to load the institutional report template.'); }).finally(() => { if (active) setTemplateLoading(false); });
    return () => { active = false; };
  }, []);

  const metadata = useMemo(() => [
    'School Name', 'Report Title', 'Academic Year', 'Programme / Course', 'Revision', 'Date of Preparation',
  ], []);
  const update = (key, value) => { setTemplate((current) => ({ ...current, [key]: value })); setSaved(false); };
  const selectLogo = (slot, file) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) { setUploadError('Choose a PNG, JPG, or SVG file no larger than 5 MB.'); return; }
    setUploadError('');
    setPendingLogo({ slot, file, previewUrl: URL.createObjectURL(file) });
  };
  const uploadLogo = async () => {
    if (!pendingLogo) return;
    setUploading(true); setUploadError('');
    try {
      const response = await reportAssetsApi.upload(pendingLogo.file, pendingLogo.slot === 'left' ? 'LEFT_LOGO' : 'RIGHT_LOGO');
      const asset = response?.data?.data ?? response?.data?.asset ?? response?.data ?? {};
      const assetId = asset.assetId ?? asset.id;
      if (!assetId) throw new Error('The server did not return a report asset ID.');
      const logo = { assetId, url: pendingLogo.previewUrl, name: asset.originalFilename ?? pendingLogo.file.name, uploadedAt: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(asset.createdAt ?? Date.now())) };
      setLogoAssets((current) => ({ ...current, [pendingLogo.slot]: logo }));
      update(pendingLogo.slot === 'left' ? 'leftLogoAssetId' : 'rightLogoAssetId', assetId);
      setPendingLogo(null);
    } catch (error) { setUploadError(error?.response?.data?.message || error?.message || 'Logo upload failed. Please try again.'); } finally { setUploading(false); }
  };
  const removeLogo = async (slot) => {
    const assetId = logoAssets[slot]?.assetId;
    if (!assetId) return;
    try { await reportAssetsApi.delete(assetId); setLogoAssets((current) => ({ ...current, [slot]: null })); update(slot === 'left' ? 'leftLogoAssetId' : 'rightLogoAssetId', null); }
    catch (error) { setTemplateError(error?.response?.data?.message || 'Unable to remove the logo.'); }
  };
  const saveChanges = async () => {
    setSaved(false); setTemplateError('');
    const payload = { id: template.id, templateName: template.templateName, templateVersion: template.templateVersion, institutionId: template.institutionId ?? 'DYPIU', headerConfig: { institutionName: template.institutionName, subHeader: template.subHeader, accreditationText: template.accreditationText, leftLogoAssetId: template.leftLogoAssetId ?? null, rightLogoAssetId: template.rightLogoAssetId ?? null, showLogo: template.showLogo }, footerConfig: { standardFooterText: template.footerText, showPageNumbers: template.pageNumbers, showGeneratedTimestamp: template.showGeneratedTimestamp ?? true, showVerificationHash: template.showVerificationHash ?? true } };
    try { await reportsApi.saveInstitutionTemplate(payload); setSaved(true); }
    catch (error) { setTemplateError(error?.response?.data?.message || 'Unable to save the institutional template.'); }
  };
  const preview = () => window.print();

  return <div style={{ display: 'flex', minHeight: '100vh' }}>
    <AppSidebar />
    <main className="nba-layout-main" style={{ flex: 1, minWidth: 0 }}>
      <AppHeader />
      <div className="page-container">
        <section style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, color: '#4f46e5', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>IQAC · Institutional Template</p>
            <h2 style={{ margin: '5px 0 6px', color: '#0f172a', fontSize: 26 }}>Report Template</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Configure the official presentation of OBE reports without changing academic content.</p>
          </div>
          <div style={{ ...panel, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}><FileText size={18} color="#4f46e5" /><div><strong style={{ color: '#0f172a', fontSize: 13 }}>{template.templateName || 'Default Institutional Report'}</strong><div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>Version {template.templateVersion ?? '—'} · <span style={{ color: '#059669', fontWeight: 800 }}>Active</span></div></div></div>
        </section>

        <section style={{ ...panel, padding: 14, marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-start', background: '#fffbeb', borderColor: '#fde68a' }}>
          <Lock size={18} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} /><div><strong style={{ color: '#92400e', fontSize: 13 }}>Fixed report structure</strong><p style={{ margin: '3px 0 0', color: '#a16207', fontSize: 12.5 }}>Academic calculations, tables, and the report body are locked to protect official reporting logic.</p></div>
        </section>
        {templateLoading && <p style={{ color: '#64748b', fontSize: 13 }}>Loading institutional template…</p>}
        {templateError && <p style={{ color: '#b91c1c', fontSize: 13 }}>{templateError}</p>}

        <section style={{ display: 'grid', gridTemplateColumns: '180px minmax(280px, .95fr) minmax(320px, 1.2fr)', gap: 16, alignItems: 'start' }}>
          <aside style={{ ...panel, padding: 10 }}>
            <div style={{ padding: '5px 8px 10px', color: '#64748b', fontWeight: 800, fontSize: 10, letterSpacing: '.08em' }}>SECTIONS</div>
            {sections.map((section) => <button key={section} type="button" onClick={() => setActiveSection(section)} style={{ width: '100%', minHeight: 38, border: 0, borderRadius: 8, background: activeSection === section ? '#eef2ff' : 'transparent', color: activeSection === section ? '#4338ca' : '#475569', display: 'flex', alignItems: 'center', gap: 8, padding: '0 9px', font: 'inherit', fontSize: 13, fontWeight: 750, cursor: 'pointer', textAlign: 'left' }}>{['Body', 'Metadata'].includes(section) ? <Lock size={13} /> : <Check size={13} />}{section}</button>)}
          </aside>

          <section style={{ ...panel, padding: 20 }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: 16 }}>{activeSection}</h3>
            <p style={{ color: '#64748b', fontSize: 12, margin: '4px 0 14px' }}>{activeSection === 'Branding' ? 'Apply approved institutional branding.' : activeSection === 'Footer' ? 'Choose the information shown on every report page.' : activeSection === 'Header' ? 'Configure the institutional header presentation.' : 'These report fields are generated dynamically and cannot be edited.'}</p>
            {activeSection === 'Branding' && <div style={{ display: 'grid', gap: 15 }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>These fixed left and right logo positions appear on every institutional report.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}><LogoSlot title="LEFT LOGO" description="University Logo" asset={logoAssets.left} onSelect={(file) => selectLogo('left', file)} onRemove={() => removeLogo('left')} /><LogoSlot title="RIGHT LOGO" description="Accreditation / Institute Logo" asset={logoAssets.right} onSelect={(file) => selectLogo('right', file)} onRemove={() => removeLogo('right')} /></div>
              <label style={{ color: '#334155', fontSize: 12, fontWeight: 800 }}>Logo sizing<select value={template.logoSize} onChange={(event) => update('logoSize', event.target.value)} style={{ ...field, marginTop: 7 }}><option>Auto</option><option>Small</option><option>Medium</option></select></label>
            </div>}
            {activeSection === 'Header' && <div style={{ display: 'grid', gap: 13 }}><label style={{ color: '#334155', fontSize: 12, fontWeight: 800 }}>Institution name<input value={template.institutionName} onChange={(event) => update('institutionName', event.target.value)} style={{ ...field, marginTop: 7 }} /></label><label style={{ color: '#334155', fontSize: 12, fontWeight: 800 }}>Subheader / address<input value={template.subHeader} onChange={(event) => update('subHeader', event.target.value)} style={{ ...field, marginTop: 7 }} /></label><label style={{ color: '#334155', fontSize: 12, fontWeight: 800 }}>Accreditation text<input value={template.accreditationText} onChange={(event) => update('accreditationText', event.target.value)} style={{ ...field, marginTop: 7 }} /></label><Toggle label="Show logos in report header" checked={template.showLogo} onChange={(value) => update('showLogo', value)} /></div>}
            {activeSection === 'Footer' && <div><Toggle label="Report ID" checked={template.reportId} onChange={(value) => update('reportId', value)} /><Toggle label="Page X of Y" checked={template.pageNumbers} onChange={(value) => update('pageNumbers', value)} /><Toggle label="Confidentiality text" checked={template.confidentiality} onChange={(value) => update('confidentiality', value)} /><label style={{ display: 'block', marginTop: 14, color: '#334155', fontSize: 12, fontWeight: 800 }}>Footer text<textarea value={template.footerText} onChange={(event) => update('footerText', event.target.value)} style={{ ...field, height: 78, padding: 10, resize: 'vertical', marginTop: 7 }} /></label></div>}
            {['Metadata', 'Body'].includes(activeSection) && <div>{activeSection === 'Metadata' ? metadata.map((item) => <div key={item} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', gap: 10, color: '#334155', fontSize: 13, fontWeight: 700 }}><span>{item}</span><span style={{ color: '#4f46e5', fontSize: 11 }}>DYNAMIC</span></div>) : <div style={{ display: 'grid', gap: 10 }}>{['Institutional Header', 'Academic Metadata', 'Programme Information', 'Attainment Tables & Calculations', 'Report Footer'].map((item) => <div key={item} style={{ padding: 10, borderRadius: 8, background: '#f8fafc', color: '#475569', fontSize: 12.5, fontWeight: 700 }}><Lock size={13} style={{ verticalAlign: '-2px', marginRight: 7 }} />{item}</div>)}</div>}</div>}
          </section>

          <section style={{ ...panel, padding: 16, background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}><strong style={{ color: '#0f172a', fontSize: 14 }}>Live Preview</strong><span style={{ color: '#64748b', fontSize: 11 }}>Representative report</span></div>
            <article style={{ background: '#fff', minHeight: 465, padding: '25px 28px', boxShadow: '0 4px 16px rgba(15,23,42,.12)', color: '#1e293b' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '65px 1fr 65px', gap: 10, alignItems: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: 12 }}><div>{template.showLogo && logoAssets.left?.url && <img src={logoAssets.left.url} alt="Left logo" style={{ height: 48, width: 60, objectFit: 'contain' }} />}</div><div style={{ textAlign: 'center' }}><strong style={{ display: 'block', fontSize: 12 }}>{template.institutionName}</strong><span style={{ fontSize: 9, color: '#475569' }}>{template.subHeader || template.accreditationText || 'Outcome-Based Education Attainment System'}</span></div><div>{template.showLogo && logoAssets.right?.url && <img src={logoAssets.right.url} alt="Right logo" style={{ height: 48, width: 60, objectFit: 'contain' }} />}</div></div>
              <div style={{ textAlign: 'center', padding: '20px 0 12px' }}><strong style={{ fontSize: 14 }}>PROGRAMME ATTAINMENT REPORT</strong><div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>School of Engineering & Technology · Academic Year 2025–26</div><div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>B.Tech Computer Science & Engineering</div></div>
              <div style={{ border: '1px solid #cbd5e1', borderRadius: 3, overflow: 'hidden', fontSize: 9 }}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#e2e8f0', fontWeight: 800 }}><span style={{ padding: 7 }}>Outcome</span><span style={{ padding: 7 }}>Target</span><span style={{ padding: 7 }}>Attainment</span></div>{['PO1', 'PO2', 'PSO1'].map((outcome, index) => <div key={outcome} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #e2e8f0' }}><span style={{ padding: 7 }}>{outcome}</span><span style={{ padding: 7 }}>60%</span><span style={{ padding: 7 }}>{68 + index * 4}%</span></div>)}</div>
              <div style={{ marginTop: 22, borderTop: '1px solid #cbd5e1', paddingTop: 8, display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 8, color: '#64748b' }}><span>{template.confidentiality ? template.footerText : ''}</span><span>{template.pageNumbers ? 'Page 1 of 4' : ''}</span></div>
            </article>
          </section>
        </section>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}><button type="button" onClick={preview} style={{ height: 40, border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', color: '#334155', padding: '0 14px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}><Eye size={15} /> Preview Report</button><button type="button" onClick={saveChanges} style={{ height: 40, border: 0, borderRadius: 8, background: '#4f46e5', color: '#fff', padding: '0 14px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}><Save size={15} /> {saved ? 'Saved' : 'Save Changes'}</button></div>
        {saved && <p style={{ color: '#059669', textAlign: 'right', fontSize: 12, fontWeight: 700, margin: '8px 0 0' }}><ShieldCheck size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />Institutional template saved.</p>}
        <UploadDialog pending={pendingLogo} uploading={uploading} error={uploadError} onCancel={() => { if (!uploading) { setPendingLogo(null); setUploadError(''); } }} onUpload={uploadLogo} onChange={(file) => selectLogo(pendingLogo?.slot, file)} />
      </div>
    </main>
  </div>;
}
