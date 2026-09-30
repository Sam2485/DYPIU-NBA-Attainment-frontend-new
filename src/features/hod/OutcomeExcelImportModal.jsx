import { useState, useRef, useMemo, useEffect } from 'react';
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

export default function OutcomeExcelImportModal({
  isOpen,
  onClose,
  batchId,
  batchName,
  programmeId,
  programmeName,
  initialScope = 'ALL', // 'ALL', 'PO', or 'PSO'
  onImportSuccess,
}) {
  const { downloadOutcomeTemplate, previewOutcomeExcel, importOutcomeExcel } = useAcademic();
  const fileInputRef = useRef(null);

  const [importScope, setImportScope] = useState(initialScope || 'ALL');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [previewData, setPreviewData] = useState(null);
  const [editableItems, setEditableItems] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedFilterTab, setSelectedFilterTab] = useState('ALL'); // ALL, PO, PSO
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Sync initialScope when modal opens or initialScope prop changes
  useEffect(() => {
    if (isOpen) {
      setImportScope(initialScope || 'ALL');
    }
  }, [isOpen, initialScope]);

  const filteredItems = useMemo(() => {
    if (selectedFilterTab === 'PO') {
      return editableItems.filter((i) => i.category === 'PO');
    }
    if (selectedFilterTab === 'PSO') {
      return editableItems.filter((i) => i.category === 'PSO');
    }
    return editableItems;
  }, [editableItems, selectedFilterTab]);

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setEditableItems([]);
    setImportResult(null);
    setErrorMessage(null);
    setSelectedFilterTab('ALL');
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

  const handleDownloadScopeTemplate = async (scope = importScope) => {
    try {
      setIsDownloadingTemplate(true);
      setErrorMessage(null);
      await downloadOutcomeTemplate(batchId, scope);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to download template.');
    } finally {
      setIsDownloadingTemplate(false);
      setIsTemplateMenuOpen(false);
    }
  };

  const handleDownloadTemplate = () => handleDownloadScopeTemplate(importScope);

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
    setEditableItems([]);
    setImportResult(null);
    setErrorMessage(null);
  };

  const recomputeCodes = (items, currentScope = importScope) => {
    let poIndex = 1;
    let psoIndex = 1;
    return items.map((item) => {
      let isPSO;
      if (currentScope === 'PO') {
        isPSO = false;
      } else if (currentScope === 'PSO') {
        isPSO = true;
      } else {
        isPSO = item.category === 'PSO';
      }

      const category = isPSO ? 'PSO' : 'PO';
      const code = isPSO ? `PSO${psoIndex++}` : `PO${poIndex++}`;
      const renumberedCompetencies = (item.competencies || []).map((comp, cIdx) => ({
        ...comp,
        code: `${code}.${cIdx + 1}`,
        order: cIdx + 1,
      }));

      const issues = [];
      if (!item.statement || item.statement.trim() === '') {
        issues.push('Outcome statement cannot be blank.');
      }
      if (!renumberedCompetencies.length) {
        issues.push(`No competencies defined for ${code}.`);
      }

      const status = issues.some((iss) => iss.includes('blank')) ? 'INVALID' : (issues.length > 0 ? 'WARNING' : 'VALID');

      return {
        ...item,
        category,
        code,
        competencies: renumberedCompetencies,
        issues,
        status,
      };
    });
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select an Excel workbook to import.');
      return;
    }

    try {
      setIsPreviewing(true);
      setErrorMessage(null);
      const preview = await previewOutcomeExcel(batchId, selectedFile, importScope);
      setPreviewData(preview);
      const items = recomputeCodes(preview?.items || [], importScope);
      setEditableItems(items);
      setSelectedFilterTab(importScope === 'PO' ? 'PO' : importScope === 'PSO' ? 'PSO' : 'ALL');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to parse Excel workbook.';
      setErrorMessage(msg);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleToggleCategory = (index, newCategory) => {
    if (importScope !== 'ALL') return; // Locked to the selected scope in single-sheet mode
    setEditableItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        category: newCategory,
      };
      return recomputeCodes(updated, importScope);
    });
  };

  const handleUpdateStatement = (index, newStatement) => {
    setEditableItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        statement: newStatement,
      };
      return recomputeCodes(updated, importScope);
    });
  };

  const handleCommitImport = async () => {
    if (!editableItems.length) return;

    try {
      setIsImporting(true);
      setErrorMessage(null);
      const payload = {
        scope: importScope,
        items: editableItems,
      };
      const result = await importOutcomeExcel(batchId, payload, programmeId, importScope);
      setImportResult(result);
      if (onImportSuccess) {
        onImportSuccess(result, importScope);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Import failed. No outcomes were modified.';
      setErrorMessage(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const poCount = editableItems.filter((i) => i.category === 'PO').length;
  const psoCount = editableItems.filter((i) => i.category === 'PSO').length;
  const totalCompetencies = editableItems.reduce((acc, curr) => acc + (curr.competencies?.length || 0), 0);
  const errorCount = editableItems.filter((i) => i.status === 'INVALID').length;
  const warningCount = editableItems.filter((i) => i.status === 'WARNING').length;

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
                  ? 'Import Programme Outcomes (PO) & Competencies'
                  : importScope === 'PSO'
                  ? 'Import Programme Specific Outcomes (PSO) & Competencies'
                  : 'Import PO / PSO & Competencies from Excel'}
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
                Programme Batch: <strong>{batchName || batchId}</strong> {programmeName ? `· ${programmeName}` : ''}
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
                  ? 'POs & Competencies Imported Successfully!'
                  : importScope === 'PSO'
                  ? 'PSOs & Competencies Imported Successfully!'
                  : 'Outcomes Imported Successfully!'}
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: muted, maxWidth: '540px', marginInline: 'auto' }}>
                All target outcome definitions and competencies have been saved cleanly for batch <strong>{batchName || batchId}</strong>.
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
                      {importResult.totalPOsImported || 0}
                    </div>
                    <div style={{ fontSize: '11.5px', color: muted, fontWeight: '600' }}>POs Imported</div>
                  </div>
                )}

                {importScope === 'ALL' && <div style={{ width: '1px', background: '#cbd5e1' }} />}

                {(importScope === 'ALL' || importScope === 'PSO') && (
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#0891b2' }}>
                      {importResult.totalPSOsImported || 0}
                    </div>
                    <div style={{ fontSize: '11.5px', color: muted, fontWeight: '600' }}>PSOs Imported</div>
                  </div>
                )}

                <div style={{ width: '1px', background: '#cbd5e1' }} />
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>
                    {importResult.totalCompetenciesImported || 0}
                  </div>
                  <div style={{ fontSize: '11.5px', color: muted, fontWeight: '600' }}>Competencies</div>
                </div>
              </div>

              {/* Scope Isolation Callout */}
              {importScope === 'PO' && (
                <div style={{ maxWidth: '480px', margin: '0 auto 24px', padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '12px', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                  <span>Existing <strong>Programme Specific Outcomes (PSOs)</strong> in this batch were preserved without change.</span>
                </div>
              )}
              {importScope === 'PSO' && (
                <div style={{ maxWidth: '480px', margin: '0 auto 24px', padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '12px', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                  <span>Existing <strong>Programme Outcomes (POs)</strong> in this batch were preserved without change.</span>
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
                      id="outcome-excel-upload"
                    />
                    <label
                      htmlFor="outcome-excel-upload"
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setIsTemplateMenuOpen((v) => !v)}
                        disabled={isDownloadingTemplate}
                        style={{
                          height: '38px',
                          padding: '0 14px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: '#ffffff',
                          color: accent,
                          border: '1px solid #c7d2fe',
                          borderRadius: '8px',
                          cursor: isDownloadingTemplate ? 'wait' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        title="Download PO/PSO & Competencies Excel template (.xlsx)"
                      >
                        {isDownloadingTemplate ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
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
                            minWidth: '250px',
                            padding: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleDownloadScopeTemplate('ALL')}
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
                              <div style={{ fontWeight: '700' }}>PO &amp; PSO Template</div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>Combined (PO:PSO and Competancies.xlsx)</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadScopeTemplate('PO')}
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
                            <CheckCircle2 size={14} color="#4338ca" />
                            <div>
                              <div style={{ fontWeight: '700' }}>PO Template Only</div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>Single Sheet (PO and Competency.xlsx)</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadScopeTemplate('PSO')}
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
                              <div style={{ fontWeight: '700' }}>PSO Template Only</div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>Single Sheet (PSO and Competency.xlsx)</div>
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
                      Inspect &amp; Preview
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '11.5px', color: muted, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={13} />
                  <span>
                    {importScope === 'ALL' && (
                      <>
                        Workbook format: <strong>2 Sheets</strong> — Sheet 1: <strong>PO and Competency</strong>, Sheet 2: <strong>PSO and Competency</strong>. Each sheet has 2 columns: <strong>Outcome Statement</strong> and <strong>Competency</strong>.
                      </>
                    )}
                    {importScope === 'PO' && (
                      <>
                        Workbook format: <strong>1 Sheet</strong> for <strong>Programme Outcomes (PO) &amp; Competencies</strong>. Existing PSOs in batch will be safely preserved.
                      </>
                    )}
                    {importScope === 'PSO' && (
                      <>
                        Workbook format: <strong>1 Sheet</strong> for <strong>Programme Specific Outcomes (PSO) &amp; Competencies</strong>. Existing POs in batch will be safely preserved.
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Step 2: Inspection Preview Results */}
              {previewData && editableItems.length > 0 && (
                <div>
                  {/* Summary Bar */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>
                        Total: {editableItems.length} {importScope === 'PO' ? 'POs' : importScope === 'PSO' ? 'PSOs' : 'Outcomes'}
                      </span>
                      {(importScope === 'ALL' || importScope === 'PO') && (
                        <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4338ca', padding: '3px 9px', borderRadius: '12px', fontWeight: '700' }}>
                          {poCount} POs
                        </span>
                      )}
                      {(importScope === 'ALL' || importScope === 'PSO') && (
                        <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '3px 9px', borderRadius: '12px', fontWeight: '700' }}>
                          {psoCount} PSOs
                        </span>
                      )}
                      <span style={{ fontSize: '12px', background: '#f0fdf4', color: '#15803d', padding: '3px 9px', borderRadius: '12px', fontWeight: '700' }}>
                        {totalCompetencies} Competencies
                      </span>
                      {warningCount > 0 && (
                        <span style={{ fontSize: '12px', background: '#fef3c7', color: '#b45309', padding: '3px 9px', borderRadius: '12px', fontWeight: '700' }}>
                          {warningCount} Warnings
                        </span>
                      )}
                      {errorCount > 0 && (
                        <span style={{ fontSize: '12px', background: '#fee2e2', color: '#b91c1c', padding: '3px 9px', borderRadius: '12px', fontWeight: '700' }}>
                          {errorCount} Errors
                        </span>
                      )}
                    </div>

                    {/* Filter tabs (Only relevant in ALL mode) */}
                    {importScope === 'ALL' && (
                      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                        {[
                          ['ALL', `All (${editableItems.length})`],
                          ['PO', `POs (${poCount})`],
                          ['PSO', `PSOs (${psoCount})`],
                        ].map(([tabKey, label]) => (
                          <button
                            key={tabKey}
                            type="button"
                            onClick={() => setSelectedFilterTab(tabKey)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              background: selectedFilterTab === tabKey ? '#ffffff' : 'transparent',
                              color: selectedFilterTab === tabKey ? accent : muted,
                              boxShadow: selectedFilterTab === tabKey ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Classification note banner */}
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fef3c7',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Info size={14} />
                    <span>
                      {importScope === 'ALL' ? (
                        <>
                          Review the detected classification below. You can change any item between <strong>[PO]</strong> and <strong>[PSO]</strong> using the selector — codes will re-sequence automatically.
                        </>
                      ) : importScope === 'PO' ? (
                        <>
                          Importing in <strong>PO Only</strong> mode. All items below will be created/updated as Programme Outcomes (PO1, PO2, …). Existing PSOs are safe.
                        </>
                      ) : (
                        <>
                          Importing in <strong>PSO Only</strong> mode. All items below will be created/updated as Programme Specific Outcomes (PSO1, PSO2, …). Existing POs are safe.
                        </>
                      )}
                    </span>
                  </div>

                  {/* Outcomes List Table */}
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}
                  >
                    {filteredItems.map((item) => {
                      const actualIndex = editableItems.findIndex((i) => i.id === item.id);
                      const isPSO = item.category === 'PSO';

                      return (
                        <div
                          key={item.id}
                          style={{
                            padding: '14px 18px',
                            borderBottom: '1px solid #f1f5f9',
                            background: isPSO ? '#fcfaff' : '#ffffff',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {/* Row Top: Category selector + Code + Sheet/Row info + Competency Count */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '8px',
                              flexWrap: 'wrap',
                              gap: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {importScope === 'ALL' ? (
                                <div style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCategory(actualIndex, 'PO')}
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '11px',
                                      fontWeight: '800',
                                      border: 'none',
                                      cursor: 'pointer',
                                      background: !isPSO ? accent : '#f8fafc',
                                      color: !isPSO ? '#ffffff' : muted,
                                    }}
                                  >
                                    PO
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCategory(actualIndex, 'PSO')}
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '11px',
                                      fontWeight: '800',
                                      border: 'none',
                                      cursor: 'pointer',
                                      background: isPSO ? '#0891b2' : '#f8fafc',
                                      color: isPSO ? '#ffffff' : muted,
                                    }}
                                  >
                                    PSO
                                  </button>
                                </div>
                              ) : (
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    borderRadius: '6px',
                                    background: isPSO ? '#ecfeff' : '#eef2ff',
                                    color: isPSO ? '#0891b2' : accent,
                                    border: `1px solid ${isPSO ? '#a5f3fc' : '#c7d2fe'}`,
                                  }}
                                >
                                  {item.category}
                                </span>
                              )}

                              <span
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '800',
                                  color: isPSO ? '#0891b2' : accent,
                                  fontFamily: 'monospace',
                                  background: isPSO ? '#ecfeff' : '#eef2ff',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  border: `1px solid ${isPSO ? '#a5f3fc' : '#c7d2fe'}`,
                                }}
                              >
                                {item.code}
                              </span>

                              <span style={{ fontSize: '11px', color: muted }}>
                                {item.sheetName ? `[${item.sheetName}] ` : ''}Row {item.rowNumber}
                              </span>

                              {item.detectionRule && (
                                <span
                                  style={{
                                    fontSize: '10.5px',
                                    color: '#6b7280',
                                    background: '#f3f4f6',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '600',
                                  }}
                                >
                                  Rule: {item.detectionRule}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  fontSize: '11.5px',
                                  color: (item.competencies?.length || 0) > 0 ? '#15803d' : '#b45309',
                                  background: (item.competencies?.length || 0) > 0 ? '#f0fdf4' : '#fef3c7',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontWeight: '700',
                                  border: `1px solid ${(item.competencies?.length || 0) > 0 ? '#bbf7d0' : '#fde68a'}`,
                                }}
                              >
                                {item.competencies?.length || 0} Competencies
                              </span>

                              {item.status === 'INVALID' && (
                                <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '700' }}>
                                  Invalid
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Outcome Statement Textarea / Display */}
                          <div style={{ marginBottom: '8px' }}>
                            <textarea
                              rows={2}
                              value={item.statement || ''}
                              onChange={(e) => handleUpdateStatement(actualIndex, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: '12.5px',
                                color: ink,
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                outline: 'none',
                                resize: 'vertical',
                                background: '#ffffff',
                                fontFamily: 'inherit',
                                lineHeight: '1.4',
                              }}
                              placeholder="Enter outcome statement..."
                            />
                          </div>

                          {/* Competency tags/accordion */}
                          {item.competencies && item.competencies.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '12px', borderLeft: `2px solid ${isPSO ? '#a5f3fc' : '#c7d2fe'}` }}>
                              {item.competencies.map((comp, cIdx) => (
                                <div
                                  key={comp.id || cIdx}
                                  style={{
                                    fontSize: '12px',
                                    color: '#334155',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '6px',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  <span style={{ fontWeight: '700', color: isPSO ? '#0891b2' : accent, fontFamily: 'monospace', minWidth: '45px' }}>
                                    {comp.code}:
                                  </span>
                                  <span>{comp.statement}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Item issues if any */}
                          {item.issues && item.issues.length > 0 && (
                            <div style={{ marginTop: '6px', fontSize: '11.5px', color: item.status === 'INVALID' ? '#dc2626' : '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={12} />
                              <span>{item.issues.join(' | ')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
            <div>
              {editableItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isImporting}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: 'transparent',
                    color: muted,
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: isImporting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={13} />
                  Reset
                </button>
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
                  fontSize: '12.5px',
                  fontWeight: '700',
                  background: '#ffffff',
                  color: muted,
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: isImporting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={!editableItems.length || isImporting || errorCount > 0}
                style={{
                  height: '38px',
                  padding: '0 20px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  background: !editableItems.length || errorCount > 0 ? '#cbd5e1' : accent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !editableItems.length || isImporting || errorCount > 0 ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: editableItems.length && errorCount === 0 ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
                }}
              >
                {isImporting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Importing Outcomes...
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    {importScope === 'PO'
                      ? `Confirm & Save POs (${editableItems.length})`
                      : importScope === 'PSO'
                      ? `Confirm & Save PSOs (${editableItems.length})`
                      : `Confirm & Save Outcomes (${editableItems.length})`}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
