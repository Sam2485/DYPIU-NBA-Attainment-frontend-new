import { useState, useEffect } from 'react';
import { ClipboardList, FileCheck, Upload, Download, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { useAcademic } from '../../context/academic';
import { useAttainment } from '../../context/attainment';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function CourseEndSurveyHub({ hideFooter = false }) {
  const {
    courseOfferingId,
    selectedCourse,
    selectedCourseOffering,
    activeCOs = [],
  } = useAcademic();

  const {
    surveyData,
    loadSurveyData,
    uploadCourseSurvey,
    deleteSurveyData,
    loading: attainmentLoading,
  } = useAttainment();

  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  useEffect(() => {
    setErrorMessage(null);
    setStatusMessage(null);
    if (courseOfferingId) {
      setUploadedFileName(sessionStorage.getItem(`survey-upload:${courseOfferingId}`));
      loadSurveyData(courseOfferingId).catch(() => {});
    }
  }, [courseOfferingId, loadSurveyData]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!courseOfferingId) {
      setErrorMessage('Please select a Course Offering before uploading survey.');
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const result = await uploadCourseSurvey({
        offeringId: courseOfferingId,
        file,
      });
      setStatusMessage(
        `Survey file "${file.name}" processed successfully! Evaluated for ${result?.totalStudents ?? result?.totalResponses ?? result?.surveyResponses?.length ?? 0} student responses.`
      );
      setUploadedFileName(file.name);
      sessionStorage.setItem(`survey-upload:${courseOfferingId}`, file.name);
    } catch (err) {
      console.error('Survey upload failed:', err);
      setErrorMessage(
        err?.customMessage || err?.message || 'Failed to upload survey responses sheet.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveSurvey = async () => {
    if (!courseOfferingId || uploading) return;
    if (!window.confirm('Remove the uploaded survey sheet and all saved survey responses for this course?')) return;
    setUploading(true);
    setErrorMessage(null);
    try {
      await deleteSurveyData(courseOfferingId);
      setUploadedFileName(null);
      sessionStorage.removeItem(`survey-upload:${courseOfferingId}`);
      setStatusMessage('Uploaded survey sheet and all associated responses were removed.');
    } catch (err) {
      console.error('Survey removal failed:', err);
      setErrorMessage(err?.customMessage || err?.message || 'Failed to remove survey data.');
    } finally {
      setUploading(false);
    }
  };

  const level1Counts = surveyData?.level1Counts || {};
  const level2Counts = surveyData?.level2Counts || {};
  const level3Counts = surveyData?.level3Counts || {};
  const level1Percentages = surveyData?.level1Percentages || {};
  const level2Percentages = surveyData?.level2Percentages || {};
  const level3Percentages = surveyData?.level3Percentages || {};
  const overallIndirectPercentages = surveyData?.overallIndirectPercentages || {};
  const coAttainmentLevels = surveyData?.coAttainmentLevels || {};
  const surveyResponses = Array.isArray(surveyData?.surveyResponses) ? surveyData.surveyResponses : [];
  const totalResponses = surveyData?.totalStudents ?? surveyData?.totalResponses ?? surveyResponses.length;
  const uploadedSheetExists = Boolean(uploadedFileName || surveyData?.fileDetails?.fileName) && (
    Boolean(uploadedFileName) || surveyResponses.length > 0 || Object.keys(level1Counts).length > 0
  );

  const apiCoKeys = [...new Set([
    ...Object.keys(level1Counts),
    ...Object.keys(overallIndirectPercentages),
    ...surveyResponses.flatMap((response) => Object.keys(response?.coFeedbacks || response?.coRatings || {})),
  ])].sort((left, right) => {
    const leftNumber = Number(String(left).match(/\d+$/)?.[0]);
    const rightNumber = Number(String(right).match(/\d+$/)?.[0]);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
    return String(left).localeCompare(String(right));
  });

  // A defined CO code (such as C321.1) and the survey key (CO1) identify the
  // same ordinal outcome. Render a single paired column instead of one for
  // each label.
  const definedCOs = activeCOs.filter((co) => co?.code);
  const coColumns = definedCOs.length > 0
    ? definedCOs.map((co, index) => {
      const definitionCode = co.code;
      const apiKey = [definitionCode, `CO${index + 1}`, apiCoKeys[index]]
        .find((key) => key && apiCoKeys.includes(key)) ?? null;
      return {
        id: definitionCode,
        definitionCode,
        apiKey: apiKey ?? definitionCode,
        label: apiKey && apiKey !== definitionCode
          ? `${definitionCode} – ${apiKey}`
          : definitionCode,
      };
    })
    : apiCoKeys.map((apiKey) => ({
      id: apiKey,
      definitionCode: apiKey,
      apiKey,
      label: apiKey,
    }));
  const readCoValue = (source, column) =>
    source?.[column.apiKey] ?? source?.[column.definitionCode];
  const formatPercentage = (value) => value != null ? Number(value).toFixed(2) : '—';

  return (
    <div className="animated-page">
      {/* Top Banner */}
      <div className="banner-dark-gradient">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#f5f3ff',
                border: '1.5px solid #6366f1',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <ClipboardList size={24} style={{ color: '#4f46e5' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
                Indirect Assessment (Course End Survey)
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {selectedCourse?.code || selectedCourseOffering?.courseCode || 'Course'} — {selectedCourse?.name || selectedCourseOffering?.courseName || 'Selected Offering'}
              </span>
            </div>
          </div>
          <a
            href="/survey-template.xlsx"
            download="survey-template.xlsx"
            style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#ffffff', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <Download size={14} /> Download Template
          </a>
        </div>
      </div>

      {statusMessage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b' }}>
          <AlertCircle size={18} />
          <span style={{ lineHeight: '1.45' }}>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div className="card" style={{ padding: '24px', textAlign: 'center', background: '#ffffff' }}>
        <div
          style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '28px',
            background: '#f8fafc',
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <Loader2 size={36} className="animate-spin" style={{ color: '#4f46e5' }} />
              <strong style={{ color: '#0f172a' }}>Uploading and calculating indirect attainment...</strong>
            </div>
          ) : (
            <>
              <Upload size={36} style={{ color: '#4f46e5', marginBottom: '8px' }} />
              <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
                Upload Course End Survey Excel File (.xlsx, .xls)
              </strong>
              <p style={{ margin: '4px 0 14px', fontSize: '12px', color: '#64748b' }}>
                Excel sheet containing student survey ratings (1=Low, 2=Medium, 3=High) mapped per CO.
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                id="survey-file-input"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={uploading || !courseOfferingId}
              />
              {uploadedSheetExists ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '13px', fontWeight: '700' }}>
                  <FileCheck size={16} />
                  <span>{uploadedFileName || surveyData?.fileDetails?.fileName || surveyData?.fileName || 'Uploaded survey file'}</span>
                  <button type="button" aria-label="Remove uploaded survey sheet and responses" title="Remove uploaded survey sheet and responses" onClick={handleRemoveSurvey} disabled={uploading} style={{ display: 'inline-grid', placeItems: 'center', padding: 0, border: 'none', background: 'transparent', color: '#b91c1c', cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.55 : 1 }}><X size={17} /></button>
                </div>
              ) : (
                <label htmlFor="survey-file-input" className={`btn btn-primary ${!courseOfferingId ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ cursor: courseOfferingId ? 'pointer' : 'not-allowed' }}>
                  <Upload size={15} /> Select Survey Excel
                </label>
              )}
            </>
          )}
        </div>
      </div>

      {/* Indirect Assessment Results */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Indirect Survey Attainment Summary</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {totalResponses > 0 ? `${totalResponses} Student Responses Collected` : 'No survey data uploaded yet'}
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th colSpan={2}>Indirect Attainment Metric</th>
                {coColumns.map((column) => <th key={column.id} style={{ textAlign: 'center' }}>{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {coColumns.length === 0 ? (
                <tr>
                  <td colSpan={2 + Math.max(coColumns.length, 1)} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No Course Outcomes or Survey responses available. Upload a survey file above to calculate indirect attainment.
                  </td>
                </tr>
              ) : (
                <>
                  {[
                    ['Count of each level', '1', level1Counts],
                    ['Count of each level', '2', level2Counts],
                    ['Count of each level', '3', level3Counts],
                    ['% of students', '1', level1Percentages],
                    ['% of students', '2', level2Percentages],
                    ['% of students', '3', level3Percentages],
                  ].map(([group, label, values], index) => (
                    <tr key={`${group}-${label}`} style={index === 3 ? { borderTop: '2px solid #cbd5e1' } : undefined}>
                      <td style={{ fontWeight: '700', color: '#334155' }}>{group}</td>
                      <td style={{ fontWeight: '700', textAlign: 'center' }}>{label}</td>
                      {coColumns.map((column) => (
                        <td key={column.id} style={{ textAlign: 'center', fontWeight: '600' }}>
                          {group.startsWith('%') ? formatPercentage(readCoValue(values, column)) : readCoValue(values, column) ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr style={{ background: '#0ea5e9', color: '#082f49', fontWeight: '800', borderTop: '2px solid #0284c7' }}>
                    <td colSpan={2} style={{ fontSize: '14px' }}>Overall Indirect %</td>
                    {coColumns.map((column) => (
                      <td key={column.id} style={{ textAlign: 'center', fontSize: '14px' }}>{formatPercentage(readCoValue(overallIndirectPercentages, column))}</td>
                    ))}
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan={2} style={{ fontWeight: '700' }}>Indirect Attainment Level</td>
                    {coColumns.map((column) => {
                      const level = readCoValue(coAttainmentLevels, column);
                      return (
                      <td key={column.id} style={{ textAlign: 'center', fontWeight: '700' }}>
                        {level ?? '—'}
                      </td>
                      );
                    })}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Student Survey Feedback</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {totalResponses > 0 ? `${totalResponses} student responses` : 'No survey responses uploaded yet'}
            </span>
          </div>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '72px', textAlign: 'center' }}>Sr. No.</th>
                <th>Survey Record</th>
                {coColumns.map((column) => <th key={column.id} style={{ textAlign: 'center' }}>{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {surveyResponses.length === 0 ? (
                <tr>
                  <td colSpan={2 + Math.max(coColumns.length, 1)} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No uploaded survey responses available.
                  </td>
                </tr>
              ) : surveyResponses.map((response, index) => (
                <tr key={`${response.prn ?? 'response'}-${response.srNo ?? index}`}>
                  <td style={{ textAlign: 'center', fontWeight: '600' }}>{response.srNo ?? index + 1}</td>
                  <td style={{ fontWeight: '600' }}>{response.prn ?? response.studentName ?? `Survey ${index + 1}`}</td>
                  {coColumns.map((column) => (
                    <td key={column.id} style={{ textAlign: 'center' }}>
                      {readCoValue(response.coFeedbacks, column) ?? readCoValue(response.coRatings, column) ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save, Previous & Save & Next Footer */}
      <SectionSaveFooter
        label="Course End Survey"
        prevPath="/marks-upload"
        nextPath="/co-attainment"
        nextLabel="Save & Proceed to CO Attainment →"
        hidden={hideFooter}
      />
    </div>
  );
}
