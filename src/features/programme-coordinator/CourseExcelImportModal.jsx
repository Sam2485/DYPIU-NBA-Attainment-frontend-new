import { useState, useRef } from 'react';
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
  Info
} from 'lucide-react';
import { useAcademic } from '../../context/academic';

const ink = '#0f172a';
const muted = '#64748b';
const accent = '#4f46e5';

export default function CourseExcelImportModal({
  isOpen,
  onClose,
  batchId,
  batchName,
  programmeName,
  maxSemesters = 8,
  onImportSuccess
}) {
  const { downloadCourseTemplate, previewCourseExcel, importCourseExcel } = useAcademic();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [previewData, setPreviewData] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedSemesterTab, setSelectedSemesterTab] = useState('ALL');

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    setErrorMessage(null);
    setSelectedSemesterTab('ALL');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      setErrorMessage(null);
      await downloadCourseTemplate(batchId);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to download template.');
    } finally {
      setIsDownloadingTemplate(false);
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
      const preview = await previewCourseExcel(batchId, selectedFile);
      setPreviewData(preview);
      setSelectedSemesterTab('ALL');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to parse Excel workbook.';
      setErrorMessage(msg);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleCommitImport = async () => {
    if (!selectedFile) return;

    try {
      setIsImporting(true);
      setErrorMessage(null);
      const result = await importCourseExcel(batchId, selectedFile);
      setImportResult(result);
      if (onImportSuccess) {
        onImportSuccess(result);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Import failed. No courses were saved (atomic rollback).';
      setErrorMessage(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const semestersPresent = previewData?.coursesBySemester
    ? Object.keys(previewData.coursesBySemester).map(Number).sort((a, b) => a - b)
    : [];

  const displayedCourses = () => {
    if (!previewData?.coursesBySemester) return [];
    if (selectedSemesterTab === 'ALL') {
      const all = [];
      semestersPresent.forEach((sem) => {
        const list = previewData.coursesBySemester[sem] || [];
        all.push(...list);
      });
      return all;
    }
    return previewData.coursesBySemester[Number(selectedSemesterTab)] || [];
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isImporting && !isPreviewing) handleClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#eef2ff',
                color: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: ink }}>
                Import Courses from Excel
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: muted }}>
                {batchName ? `${batchName} • ` : ''}{programmeName ? `${programmeName} • ` : ''}Up to {maxSemesters} Semesters
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
              style={{
                height: '34px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: '600',
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: isDownloadingTemplate ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit',
              }}
              title="Download pre-configured Excel template for this batch"
            >
              {isDownloadingTemplate ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} color={accent} />
              )}
              Download Sample Template
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isImporting || isPreviewing}
              style={{
                background: 'none',
                border: 'none',
                color: muted,
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '12.5px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{errorMessage}</div>
            </div>
          )}

          {/* Import Success State */}
          {importResult && (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '2px solid #bbf7d0',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '800', color: ink }}>
                Courses Imported Successfully!
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: muted }}>
                All course entries have been atomically saved to the database.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  maxWidth: '520px',
                  margin: '0 auto 24px',
                }}
              >
                <div style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: accent }}>
                    {importResult.totalCoursesImported ?? importResult.totalImported ?? 0}
                  </div>
                  <div style={{ fontSize: '11px', color: muted, fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                    Courses Added
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d' }}>
                    {importResult.coordinatorsMatched ?? importResult.matchedCoordinators ?? 0}
                  </div>
                  <div style={{ fontSize: '11px', color: muted, fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                    Coordinators Assigned
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#b45309' }}>
                    {importResult.coordinatorsUnmatched ?? importResult.unmatchedCoordinators ?? 0}
                  </div>
                  <div style={{ fontSize: '11px', color: muted, fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                    Unmatched CCs
                  </div>
                </div>
              </div>

              {importResult.warnings && importResult.warnings.length > 0 && (
                <div
                  style={{
                    maxWidth: '640px',
                    margin: '0 auto 20px',
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    fontSize: '12px',
                    color: '#92400e',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Import Notes &amp; Warnings:</strong>
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {importResult.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClose}
                style={{
                  height: '38px',
                  padding: '0 24px',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Close &amp; View Courses
              </button>
            </div>
          )}

          {/* Upload & Preview Step */}
          {!importResult && (
            <>
              {/* File Dropzone Area */}
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  background: selectedFile ? '#f8fafc' : '#ffffff',
                  marginBottom: '18px',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: '#eef2ff',
                    color: accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                  }}
                >
                  <Upload size={22} />
                </div>

                {selectedFile ? (
                  <div>
                    <strong style={{ fontSize: '14px', color: ink }}>{selectedFile.name}</strong>
                    <div style={{ fontSize: '11.5px', color: muted, marginTop: '3px' }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for preview
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: '#ffffff',
                          color: ink,
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Change File
                      </button>
                      <button
                        type="button"
                        onClick={handlePreview}
                        disabled={isPreviewing}
                        style={{
                          height: '32px',
                          padding: '0 16px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: accent,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: isPreviewing ? 'wait' : 'pointer',
                          fontFamily: 'inherit',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isPreviewing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                        {previewData ? 'Re-Parse & Preview' : 'Parse & Preview'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <strong style={{ fontSize: '14px', color: ink }}>
                      Click to upload or drag and drop your course workbook
                    </strong>
                    <p style={{ margin: '4px 0 12px', fontSize: '12px', color: muted }}>
                      Multi-sheet Excel workbook where each sheet represents one semester (e.g. Sem1, Sem2)
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        height: '34px',
                        padding: '0 18px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        background: accent,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Upload size={14} /> Select Excel File
                    </button>
                  </div>
                )}
              </div>

              {/* Preview Results Section */}
              {previewData && (
                <div>
                  {/* Summary Bar */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '10px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: ink }}>
                        {previewData.totalCourses ?? previewData.totalCoursesFound ?? 0}
                      </div>
                      <div style={{ fontSize: '10.5px', color: muted, fontWeight: '700', textTransform: 'uppercase' }}>
                        Total Parsed
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#15803d' }}>
                        {previewData.validCount ?? previewData.validCoursesCount ?? 0}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>
                        Valid
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#b45309' }}>
                        {previewData.warningCount ?? 0}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#b45309', fontWeight: '700', textTransform: 'uppercase' }}>
                        Warnings
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px', borderRadius: '8px', background: (previewData.errorCount ?? 0) > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${(previewData.errorCount ?? 0) > 0 ? '#fecaca' : '#e2e8f0'}` }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: (previewData.errorCount ?? 0) > 0 ? '#dc2626' : muted }}>
                        {previewData.errorCount ?? 0}
                      </div>
                      <div style={{ fontSize: '10.5px', color: (previewData.errorCount ?? 0) > 0 ? '#dc2626' : muted, fontWeight: '700', textTransform: 'uppercase' }}>
                        Errors
                      </div>
                    </div>
                  </div>

                  {/* Errors Block */}
                  {(previewData.errors ?? previewData.globalErrors ?? []).length > 0 && (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        fontSize: '12px',
                        marginBottom: '14px',
                      }}
                    >
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <AlertCircle size={15} /> Validation Errors (Must be resolved before import):
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {(previewData.errors ?? previewData.globalErrors ?? []).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings Block */}
                  {(previewData.warnings ?? previewData.globalWarnings ?? []).length > 0 && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        fontSize: '11.5px',
                        marginBottom: '14px',
                      }}
                    >
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <AlertTriangle size={14} /> Warnings:
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '18px' }}>
                        {(previewData.warnings ?? previewData.globalWarnings ?? []).map((warn, i) => (
                          <li key={i}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Semester Filter Tabs */}
                  {semestersPresent.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedSemesterTab('ALL')}
                        style={{
                          height: '28px',
                          padding: '0 12px',
                          borderRadius: '6px',
                          border: `1px solid ${selectedSemesterTab === 'ALL' ? accent : '#e2e8f0'}`,
                          background: selectedSemesterTab === 'ALL' ? '#eef2ff' : '#ffffff',
                          color: selectedSemesterTab === 'ALL' ? accent : ink,
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        All Semesters ({previewData.totalCourses ?? previewData.totalCoursesFound ?? 0})
                      </button>
                      {semestersPresent.map((sem) => {
                        const count = (previewData.coursesBySemester[sem] || []).length;
                        const active = selectedSemesterTab === String(sem);
                        return (
                          <button
                            key={sem}
                            type="button"
                            onClick={() => setSelectedSemesterTab(String(sem))}
                            style={{
                              height: '28px',
                              padding: '0 12px',
                              borderRadius: '6px',
                              border: `1px solid ${active ? accent : '#e2e8f0'}`,
                              background: active ? '#eef2ff' : '#ffffff',
                              color: active ? accent : ink,
                              fontSize: '11.5px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Sem {sem} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Courses Preview Table */}
                  <div
                    style={{
                      maxHeight: '320px',
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#ffffff',
                    }}
                  >
                    <table className="audit-data-table" style={{ margin: 0, fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                          <th style={{ width: '70px', textAlign: 'center' }}>Sem</th>
                          <th style={{ width: '95px' }}>Code</th>
                          <th>Course Name</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Cr</th>
                          <th style={{ width: '80px' }}>Type</th>
                          <th style={{ width: '180px' }}>Coordinator</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedCourses().length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: muted }}>
                              No courses to display for this semester.
                            </td>
                          </tr>
                        ) : (
                          displayedCourses().map((course, idx) => {
                            const isErr = course.status === 'INVALID' || course.status === 'DUPLICATE';
                            const isWarn = course.status === 'WARNING';
                            const bg = isErr ? '#fef2f2' : isWarn ? '#fffbeb' : '#ffffff';
                            return (
                              <tr key={`${course.sheetName}-${course.rowIndex}-${idx}`} style={{ background: bg }}>
                                <td style={{ textAlign: 'center', color: muted }}>{idx + 1}</td>
                                <td style={{ textAlign: 'center', fontWeight: '700' }}>
                                  Sem {course.semester ?? '—'}
                                </td>
                                <td style={{ fontWeight: '700', color: accent }}>{course.courseCode ?? '—'}</td>
                                <td style={{ fontWeight: '600', color: ink }}>{course.courseName ?? '—'}</td>
                                <td style={{ textAlign: 'center' }}>{course.credits ?? '—'}</td>
                                <td>
                                  <span style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: '700' }}>
                                    {course.courseType ?? 'THEORY'}
                                  </span>
                                </td>
                                <td>
                                  {course.coordinatorMatched ? (
                                    <span style={{ color: '#15803d', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Check size={12} /> {course.coordinatorName || course.coordinatorRaw}
                                    </span>
                                  ) : course.coordinatorRaw ? (
                                    <span style={{ color: '#b45309', fontSize: '11px' }} title={course.issues?.join('; ')}>
                                      ⚠️ {course.coordinatorRaw} (unmatched)
                                    </span>
                                  ) : (
                                    <span style={{ color: muted, fontStyle: 'italic', fontSize: '11px' }}>Unassigned</span>
                                  )}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span
                                    style={{
                                      fontSize: '10.5px',
                                      fontWeight: '800',
                                      padding: '2px 7px',
                                      borderRadius: '4px',
                                      background: isErr ? '#fee2e2' : isWarn ? '#fef3c7' : '#dcfce7',
                                      color: isErr ? '#991b1b' : isWarn ? '#92400e' : '#166534',
                                    }}
                                  >
                                    {course.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #f1f5f9',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '11.5px', color: muted, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Info size={14} />
            <span>Manual course creation remains available at all times.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isImporting}
              style={{
                height: '36px',
                padding: '0 16px',
                fontSize: '12.5px',
                fontWeight: '600',
                background: '#ffffff',
                color: muted,
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {importResult ? 'Close' : 'Cancel'}
            </button>

            {!importResult && (
              <button
                type="button"
                onClick={handleCommitImport}
                disabled={
                  isImporting ||
                  !previewData ||
                  !(previewData.valid ?? previewData.canImport) ||
                  (previewData.validCount ?? previewData.validCoursesCount ?? 0) === 0
                }
                style={{
                  height: '36px',
                  padding: '0 20px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  background:
                    !previewData || !(previewData.valid ?? previewData.canImport) || (previewData.validCount ?? previewData.validCoursesCount ?? 0) === 0
                      ? '#cbd5e1'
                      : accent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor:
                    isImporting || !previewData || !(previewData.valid ?? previewData.canImport) || (previewData.validCount ?? previewData.validCoursesCount ?? 0) === 0
                      ? 'not-allowed'
                      : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'inherit',
                  boxShadow:
                    (previewData?.valid ?? previewData?.canImport) && (previewData?.validCount ?? previewData?.validCoursesCount ?? 0) > 0
                      ? '0 2px 6px rgba(79, 70, 229, 0.25)'
                      : 'none',
                }}
              >
                {isImporting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Importing Courses...
                  </>
                ) : (
                  <>
                    <Check size={14} /> Confirm &amp; Import{' '}
                    {(previewData?.validCount ?? previewData?.validCoursesCount) ? `(${previewData.validCount ?? previewData.validCoursesCount})` : ''}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
