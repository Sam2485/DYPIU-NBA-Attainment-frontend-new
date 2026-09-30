import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Check,
  RefreshCw,
  Info,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

const ink = '#0f172a';
const muted = '#64748b';
const accent = '#4f46e5';

export default function CourseMappingExcelImportModal({
  isOpen,
  onClose,
  programmeBatchCourseId,
  courseCode,
  courseName,
  programmeBatchName,
  initialScope = 'ALL', // 'ALL', 'PO', or 'PSO'
  onImportSuccess,
}) {
  const {
    downloadMappingExcelTemplate,
    previewMappingExcel,
    importMappingExcel,
  } = useAcademic();

  const fileInputRef = useRef(null);

  const [importScope, setImportScope] = useState(initialScope || 'ALL');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [previewData, setPreviewData] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync initialScope when modal opens or initialScope prop changes
  useEffect(() => {
    if (isOpen) {
      setImportScope(initialScope || 'ALL');
      setIsTemplateMenuOpen(false);
    }
  }, [isOpen, initialScope]);

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    setErrorMessage(null);
    setIsTemplateMenuOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScopeChange = (newScope) => {
    if (newScope === importScope) return;
    setImportScope(newScope);
    handleReset();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleDownloadTemplate = async (sample = false) => {
    if (!programmeBatchCourseId) {
      setErrorMessage('Course offering is not selected.');
      return;
    }
    try {
      if (sample) setIsDownloadingSample(true);
      else setIsDownloadingTemplate(true);
      setErrorMessage(null);
      await downloadMappingExcelTemplate(programmeBatchCourseId, importScope, sample);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to download template.');
    } finally {
      setIsDownloadingTemplate(false);
      setIsDownloadingSample(false);
      setIsTemplateMenuOpen(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
      setErrorMessage('Please upload a valid Excel file (.xlsx or .xls).');
      return;
    }

    setSelectedFile(file);
    setPreviewData(null);
    setImportResult(null);
    setErrorMessage(null);
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select an Excel workbook to import.');
      return;
    }

    try {
      setIsPreviewing(true);
      setErrorMessage(null);
      const preview = await previewMappingExcel(programmeBatchCourseId, selectedFile, importScope);
      setPreviewData(preview);
      if (!preview.valid && preview.errors && preview.errors.length > 0) {
        setErrorMessage(preview.errors[0]);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to parse Excel workbook.';
      setErrorMessage(msg);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleCommitImport = async () => {
    if (!previewData || !previewData.valid) return;

    try {
      setIsImporting(true);
      setErrorMessage(null);
      const payload = {
        scope: importScope,
        poKeywordsStore: previewData.poKeywordsStore,
        psoKeywordsStore: previewData.psoKeywordsStore,
        poMappings: previewData.poMappings,
        psoMappings: previewData.psoMappings,
      };
      const result = await importMappingExcel(programmeBatchCourseId, payload, importScope);
      setImportResult(result);
      if (onImportSuccess) {
        onImportSuccess(result, importScope);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Import failed. No mappings were modified.';
      setErrorMessage(msg);
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isImporting) handleClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          fontFamily: 'inherit',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafbfc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#e0e7ff',
                color: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: ink, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {importScope === 'PO'
                  ? 'Import CO-PO Mapping & Keywords'
                  : importScope === 'PSO'
                  ? 'Import CO-PSO Mapping & Keywords'
                  : 'Import CO to PO/PSO Mapping & Keywords'}
                <span
                  style={{
                    fontSize: '11px',
                    background: importScope === 'ALL' ? '#ecfdf5' : '#e0e7ff',
                    color: importScope === 'ALL' ? '#047857' : '#4338ca',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    border: `1px solid ${importScope === 'ALL' ? '#a7f3d0' : '#c7d2fe'}`,
                  }}
                >
                  {importScope === 'ALL' ? 'Combined (2 Sheets)' : `${importScope} Scope`}
                </span>
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: muted }}>
                Course: <strong>{courseCode || 'Selected Course'}</strong> {courseName ? `· ${courseName}` : ''} {programmeBatchName ? `(${programmeBatchName})` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isImporting}
            style={{
              background: 'transparent',
              border: 'none',
              color: muted,
              cursor: isImporting ? 'not-allowed' : 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Mode Switcher Tabs */}
          {!importResult && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Import Workflow:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleScopeChange('ALL')}
                  disabled={isImporting || isPreviewing}
                  style={{
                    flex: '1 1 200px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: importScope === 'ALL' ? accent : '#e2e8f0',
                    background: importScope === 'ALL' ? '#eef2ff' : '#ffffff',
                    color: importScope === 'ALL' ? accent : ink,
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: isImporting || isPreviewing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: importScope === 'ALL' ? accent : '#f1f5f9',
                      color: importScope === 'ALL' ? '#ffffff' : muted,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Layers size={15} />
                  </div>
                  <div>
                    <div>PO &amp; PSO (2 Sheets)</div>
                    <div style={{ fontSize: '11px', color: muted, fontWeight: '500' }}>Both PO &amp; PSO workbook</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleScopeChange('PO')}
                  disabled={isImporting || isPreviewing}
                  style={{
                    flex: '1 1 200px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: importScope === 'PO' ? accent : '#e2e8f0',
                    background: importScope === 'PO' ? '#eef2ff' : '#ffffff',
                    color: importScope === 'PO' ? accent : ink,
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: isImporting || isPreviewing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: importScope === 'PO' ? accent : '#f1f5f9',
                      color: importScope === 'PO' ? '#ffffff' : muted,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <div>PO Only (1 Sheet)</div>
                    <div style={{ fontSize: '11px', color: muted, fontWeight: '500' }}>Only POs · Preserves PSOs</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleScopeChange('PSO')}
                  disabled={isImporting || isPreviewing}
                  style={{
                    flex: '1 1 200px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: importScope === 'PSO' ? '#0891b2' : '#e2e8f0',
                    background: importScope === 'PSO' ? '#ecfeff' : '#ffffff',
                    color: importScope === 'PSO' ? '#0891b2' : ink,
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: isImporting || isPreviewing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: importScope === 'PSO' ? '#0891b2' : '#f1f5f9',
                      color: importScope === 'PSO' ? '#ffffff' : muted,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <div>PSO Only (1 Sheet)</div>
                    <div style={{ fontSize: '11px', color: muted, fontWeight: '500' }}>Only PSOs · Preserves POs</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Global Error Banner */}
          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#991b1b',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success View */}
          {importResult && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={34} />
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '19px', fontWeight: '800', color: ink }}>
                {importScope === 'PO'
                  ? 'CO-PO Mapping & Keywords Imported Successfully!'
                  : importScope === 'PSO'
                  ? 'CO-PSO Mapping & Keywords Imported Successfully!'
                  : 'CO to PO/PSO Mapping & Keywords Imported Successfully!'}
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: muted, maxWidth: '540px', marginInline: 'auto' }}>
                All mapping strengths and competency keywords have been persisted cleanly for course <strong>{courseCode}</strong>.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '24px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  marginBottom: '20px',
                }}
              >
                {(importScope === 'ALL' || importScope === 'PO') && (
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: accent }}>
                      {importResult.savedPoMappingsCount || 0}
                    </div>
                    <div style={{ fontSize: '11.5px', color: muted, fontWeight: '600' }}>PO Mappings</div>
                  </div>
                )}

                {importScope === 'ALL' && <div style={{ width: '1px', background: '#cbd5e1' }} />}

                {(importScope === 'ALL' || importScope === 'PSO') && (
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#0891b2' }}>
                      {importResult.savedPsoMappingsCount || 0}
                    </div>
                    <div style={{ fontSize: '11.5px', color: muted, fontWeight: '600' }}>PSO Mappings</div>
                  </div>
                )}

                <div style={{ width: '1px', background: '#cbd5e1' }} />
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>
                    {(importResult.savedPoKeywordsCount || 0) + (importResult.savedPsoKeywordsCount || 0)}
                  </div>
                  <div style={{ fontSize: '11.5px', color: muted, fontWeight: '600' }}>Keyword Blocks</div>
                </div>
              </div>

              {/* Scope Isolation Callout */}
              {importScope === 'PO' && (
                <div style={{ maxWidth: '480px', margin: '0 auto 24px', padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '12px', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                  <span>Existing <strong>PSO Mappings and Keywords</strong> for this course were preserved without change.</span>
                </div>
              )}
              {importScope === 'PSO' && (
                <div style={{ maxWidth: '480px', margin: '0 auto 24px', padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '12px', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                  <span>Existing <strong>PO Mappings and Keywords</strong> for this course were preserved without change.</span>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    height: '40px',
                    padding: '0 24px',
                    fontSize: '13px',
                    fontWeight: '700',
                    background: accent,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Upload & Inspection View (before success) */}
          {!importResult && (
            <>
              {/* Step 1: Upload and Template Actions */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xlsx,.xls"
                      style={{ display: 'none' }}
                      id="mapping-excel-upload"
                    />
                    <label
                      htmlFor="mapping-excel-upload"
                      style={{
                        height: '38px',
                        padding: '0 16px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        color: ink,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    >
                      <Upload size={15} color={accent} />
                      {selectedFile
                        ? 'Change File'
                        : importScope === 'PO'
                        ? 'Choose PO Excel File (.xlsx)'
                        : importScope === 'PSO'
                        ? 'Choose PSO Excel File (.xlsx)'
                        : 'Choose PO & PSO File (.xlsx)'}
                    </label>

                    {selectedFile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>
                          {selectedFile.name}
                        </span>
                        <span style={{ fontSize: '11px', color: muted }}>
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                    {/* Sample and Blank Template Dropdown */}
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setIsTemplateMenuOpen((prev) => !prev)}
                        disabled={isDownloadingTemplate || isDownloadingSample}
                        style={{
                          height: '38px',
                          padding: '0 14px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: '#ffffff',
                          color: accent,
                          border: '1px solid #c7d2fe',
                          borderRadius: '8px',
                          cursor: isDownloadingTemplate || isDownloadingSample ? 'wait' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isDownloadingTemplate || isDownloadingSample ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Download size={13} />
                        )}
                        <span>Download Template</span>
                        <ChevronDown size={13} />
                      </button>

                      {isTemplateMenuOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '4px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            zIndex: 50,
                            minWidth: '240px',
                            padding: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleDownloadTemplate(false)}
                            style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#1e293b',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <FileSpreadsheet size={14} color="#4338ca" />
                            <div>
                              <div style={{ fontWeight: '700' }}>Blank Template</div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>With course COs &amp; competencies</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadTemplate(true)}
                            style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#1e293b',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <Sparkles size={14} color="#0891b2" />
                            <div>
                              <div style={{ fontWeight: '700' }}>Sample Input Template</div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>Pre-filled with sample keywords &amp; matrix</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handlePreview}
                      disabled={!selectedFile || isPreviewing}
                      style={{
                        height: '38px',
                        padding: '0 18px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        background: !selectedFile ? '#f1f5f9' : accent,
                        color: !selectedFile ? '#94a3b8' : '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: !selectedFile || isPreviewing ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: selectedFile ? '0 2px 6px rgba(79, 70, 229, 0.2)' : 'none',
                      }}
                    >
                      {isPreviewing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      <span>{previewData ? 'Re-Analyze File' : 'Inspect Workbook'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Verification Stats & Cards */}
              {previewData && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                    {/* Course Outcomes Card */}
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: previewData.cosMatch ? '#f0fdf4' : '#fef2f2',
                        border: `1.5px solid ${previewData.cosMatch ? '#bbf7d0' : '#fecaca'}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: previewData.cosMatch ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>
                          Course Outcomes
                        </span>
                        {previewData.cosMatch ? (
                          <CheckCircle2 size={16} color="#16a34a" />
                        ) : (
                          <AlertTriangle size={16} color="#dc2626" />
                        )}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: previewData.cosMatch ? '#15803d' : '#b91c1c' }}>
                        {previewData.sheetCoCount} / {previewData.expectedCoCount} COs
                      </div>
                      <div style={{ fontSize: '11px', color: muted, marginTop: '4px' }}>
                        {previewData.cosMatch
                          ? `All expected COs matched: ${previewData.expectedCoCodes?.join(', ')}`
                          : `Mismatch: Expected ${previewData.expectedCoCodes?.join(', ')}, found ${previewData.detectedCoCodes?.join(', ')}`}
                      </div>
                    </div>

                    {/* POs Card (if ALL or PO) */}
                    {(importScope === 'ALL' || importScope === 'PO') && (
                      <div
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          background: previewData.posMatch ? '#f0fdf4' : '#fffbeb',
                          border: `1.5px solid ${previewData.posMatch ? '#bbf7d0' : '#fde68a'}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: previewData.posMatch ? '#166534' : '#92400e', textTransform: 'uppercase' }}>
                            Programme Outcomes
                          </span>
                          {previewData.posMatch ? (
                            <CheckCircle2 size={16} color="#16a34a" />
                          ) : (
                            <AlertTriangle size={16} color="#d97706" />
                          )}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: previewData.posMatch ? '#15803d' : '#b45309' }}>
                          {previewData.sheetPoCount} / {previewData.expectedPoCount} POs
                        </div>
                        <div style={{ fontSize: '11px', color: muted, marginTop: '4px' }}>
                          {previewData.posMatch ? 'All PO statements matched' : 'PO count differed from batch targets'}
                        </div>
                      </div>
                    )}

                    {/* PSOs Card (if ALL or PSO) */}
                    {(importScope === 'ALL' || importScope === 'PSO') && (
                      <div
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          background: previewData.psosMatch ? '#f0fdf4' : '#fffbeb',
                          border: `1.5px solid ${previewData.psosMatch ? '#bbf7d0' : '#fde68a'}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: previewData.psosMatch ? '#166534' : '#92400e', textTransform: 'uppercase' }}>
                            Specific Outcomes (PSO)
                          </span>
                          {previewData.psosMatch ? (
                            <CheckCircle2 size={16} color="#16a34a" />
                          ) : (
                            <AlertTriangle size={16} color="#d97706" />
                          )}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: previewData.psosMatch ? '#15803d' : '#b45309' }}>
                          {previewData.sheetPsoCount} / {previewData.expectedPsoCount} PSOs
                        </div>
                        <div style={{ fontSize: '11px', color: muted, marginTop: '4px' }}>
                          {previewData.psosMatch ? 'All PSO statements matched' : 'PSO count differed from batch targets'}
                        </div>
                      </div>
                    )}

                    {/* Competencies & Keywords Card */}
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>
                          Keywords Extracted
                        </span>
                        <FileText size={16} color={accent} />
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: accent }}>
                        {previewData.totalKeywordsExtracted || 0} Keywords
                      </div>
                      <div style={{ fontSize: '11px', color: muted, marginTop: '4px' }}>
                        {previewData.sheetCompetencyCount} competencies mapped across COs
                      </div>
                    </div>
                  </div>

                  {/* Warnings & Errors List */}
                  {previewData.warnings && previewData.warnings.length > 0 && (
                    <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                      <div style={{ fontWeight: '700', marginBottom: '4px' }}>Notices &amp; Warnings:</div>
                      <ul style={{ margin: 0, paddingLeft: '16px' }}>
                        {previewData.warnings.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Matrix Preview Table */}
                  {previewData.matrix && Object.keys(previewData.matrix).length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: ink, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Extracted CO-PO/PSO Mapping Strengths</span>
                        <span style={{ fontSize: '11px', color: muted, fontWeight: '500' }}>
                          (Values: 3 = High, 2 = Medium, 1 = Low, - = No correlation)
                        </span>
                      </div>
                      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: ink, width: '90px' }}>
                                CO Code
                              </th>
                              {Object.keys(Object.values(previewData.matrix)[0] || {}).map((code) => (
                                <th key={code} style={{ padding: '8px 6px', fontWeight: '700', color: code.startsWith('PSO') ? '#0891b2' : accent }}>
                                  {code}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(previewData.matrix).map(([coCode, row], rIdx) => (
                              <tr key={coCode} style={{ borderBottom: '1px solid #f1f5f9', background: rIdx % 2 === 0 ? '#ffffff' : '#fafbfc' }}>
                                <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: ink }}>
                                  {coCode}
                                </td>
                                {Object.entries(row).map(([outCode, val]) => (
                                  <td
                                    key={outCode}
                                    style={{
                                      padding: '8px 6px',
                                      fontWeight: val && val !== '-' && val !== 0 && val !== '0' ? '800' : '400',
                                      color: val && val !== '-' && val !== 0 && val !== '0' ? ink : '#94a3b8',
                                      background: val === 3 || val === '3' ? '#eef2ff' : val === 2 || val === '2' ? '#f0fdf4' : 'transparent',
                                    }}
                                  >
                                    {val || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!importResult && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafbfc',
            }}
          >
            <div style={{ fontSize: '12px', color: muted }}>
              {previewData?.valid ? (
                <span style={{ color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Validation passed. Ready to import.
                </span>
              ) : selectedFile ? (
                <span>Click &quot;Inspect Workbook&quot; to validate the matrix.</span>
              ) : (
                <span>Upload an Excel workbook (.xlsx) to begin.</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={isImporting}
                style={{
                  height: '38px',
                  padding: '0 16px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: ink,
                  cursor: isImporting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={!previewData || !previewData.valid || isImporting}
                style={{
                  height: '38px',
                  padding: '0 20px',
                  background: !previewData?.valid || isImporting ? '#94a3b8' : accent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: !previewData?.valid || isImporting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: previewData?.valid && !isImporting ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
                }}
              >
                {isImporting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{isImporting ? 'Importing Matrix…' : 'Import & Apply Matrix'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
