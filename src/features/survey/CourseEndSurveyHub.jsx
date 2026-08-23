import { useState, useEffect } from 'react';
import { ClipboardList, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
    loading: attainmentLoading,
  } = useAttainment();

  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (courseOfferingId) {
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
        `Survey file "${file.name}" processed successfully! Evaluated for ${result?.totalResponses ?? 0} student responses.`
      );
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

  const level1Counts = surveyData?.level1Counts || {};
  const level2Counts = surveyData?.level2Counts || {};
  const level3Counts = surveyData?.level3Counts || {};
  const level1Percentages = surveyData?.level1Percentages || {};
  const level2Percentages = surveyData?.level2Percentages || {};
  const level3Percentages = surveyData?.level3Percentages || {};
  const overallIndirectPercentages = surveyData?.overallIndirectPercentages || {};
  const coAttainmentLevels = surveyData?.coAttainmentLevels || {};
  const indirectAttainmentScores = surveyData?.indirectAttainmentScores || {};
  const surveyResponses = Array.isArray(surveyData?.surveyResponses) ? surveyData.surveyResponses : [];
  const totalResponses = surveyData?.totalStudents ?? surveyData?.totalResponses ?? surveyResponses.length;
  const overallIndirectCoAttainment = surveyData?.overallIndirectCoAttainment ?? surveyData?.averageAttainmentLevel ?? 0;

  const coList = [...new Set([
    ...activeCOs.map((co) => co.code).filter(Boolean),
    ...Object.keys(level1Counts),
    ...Object.keys(overallIndirectPercentages),
    ...surveyResponses.flatMap((response) => Object.keys(response?.coFeedbacks || response?.coRatings || {})),
  ])];
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
          <span>{errorMessage}</span>
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
              <label
                htmlFor="survey-file-input"
                className={`btn btn-primary ${!courseOfferingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ cursor: courseOfferingId ? 'pointer' : 'not-allowed' }}
              >
                <Upload size={15} /> Select Survey Excel
              </label>
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
          {totalResponses > 0 && (
            <span className="badge badge-active" style={{ fontSize: '13px', padding: '6px 12px' }}>
              Overall Indirect CO Attainment: {Number(overallIndirectCoAttainment).toFixed(2)}
            </span>
          )}
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th colSpan={2}>Indirect Attainment Metric</th>
                {coList.map((coCode) => <th key={coCode} style={{ textAlign: 'center' }}>{coCode}</th>)}
              </tr>
            </thead>
            <tbody>
              {coList.length === 0 ? (
                <tr>
                  <td colSpan={2 + Math.max(coList.length, 1)} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No Course Outcomes or Survey responses available. Upload a survey file above to calculate indirect attainment.
                  </td>
                </tr>
              ) : (
                <>
                  {[
                    ['Count of each level', 'Level 1', level1Counts],
                    ['Count of each level', 'Level 2', level2Counts],
                    ['Count of each level', 'Level 3', level3Counts],
                    ['% of students', 'Level 1', level1Percentages],
                    ['% of students', 'Level 2', level2Percentages],
                    ['% of students', 'Level 3', level3Percentages],
                  ].map(([group, label, values], index) => (
                    <tr key={`${group}-${label}`} style={index === 3 ? { borderTop: '2px solid #cbd5e1' } : undefined}>
                      <td style={{ fontWeight: '700', color: '#334155' }}>{group}</td>
                      <td style={{ fontWeight: '700', textAlign: 'center' }}>{label}</td>
                      {coList.map((coCode) => (
                        <td key={coCode} style={{ textAlign: 'center', fontWeight: '600' }}>
                          {group.startsWith('%') ? formatPercentage(values[coCode]) : values[coCode] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr style={{ background: '#0ea5e9', color: '#082f49', fontWeight: '800', borderTop: '2px solid #0284c7' }}>
                    <td colSpan={2} style={{ fontSize: '14px' }}>Overall Indirect %</td>
                    {coList.map((coCode) => (
                      <td key={coCode} style={{ textAlign: 'center', fontSize: '14px' }}>{formatPercentage(overallIndirectPercentages[coCode])}</td>
                    ))}
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan={2} style={{ fontWeight: '700' }}>Indirect Attainment Score / Level</td>
                    {coList.map((coCode) => (
                      <td key={coCode} style={{ textAlign: 'center', fontWeight: '700' }}>
                        {indirectAttainmentScores[coCode] != null ? Number(indirectAttainmentScores[coCode]).toFixed(2) : '—'}
                        {coAttainmentLevels[coCode] != null ? ` / L${coAttainmentLevels[coCode]}` : ''}
                      </td>
                    ))}
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
                <th>PRN No.</th>
                <th>Student Name</th>
                {coList.map((coCode) => <th key={coCode} style={{ textAlign: 'center' }}>{coCode}</th>)}
              </tr>
            </thead>
            <tbody>
              {surveyResponses.length === 0 ? (
                <tr>
                  <td colSpan={3 + Math.max(coList.length, 1)} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No uploaded survey responses available.
                  </td>
                </tr>
              ) : surveyResponses.map((response, index) => (
                <tr key={`${response.prn ?? 'response'}-${response.srNo ?? index}`}>
                  <td style={{ textAlign: 'center', fontWeight: '600' }}>{response.srNo ?? index + 1}</td>
                  <td style={{ fontWeight: '600' }}>{response.prn ?? '—'}</td>
                  <td>{response.studentName ?? '—'}</td>
                  {coList.map((coCode) => (
                    <td key={coCode} style={{ textAlign: 'center' }}>
                      {response.coFeedbacks?.[coCode] ?? response.coRatings?.[coCode] ?? '—'}
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
