import { useState, useEffect } from 'react';
import { ClipboardList, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAcademic } from '../../context/academic';
import { useAttainment } from '../../context/attainment';
import { useAuth } from '../../context/auth';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function CourseEndSurveyHub({ hideFooter = false }) {
  const { user } = useAuth();
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

  const [thresholdPercentage, setThresholdPercentage] = useState(60.0);
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
        thresholdPercentage,
        uploadedBy: user?.name || user?.email || 'Course Coordinator',
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

  const coScores = surveyData?.coAttainmentScores || {};
  const coPercentages = surveyData?.percentagePositiveResponses || {};
  const totalResponses = surveyData?.totalResponses ?? 0;
  const avgLevel = surveyData?.averageAttainmentLevel ?? 0;

  const coList = activeCOs.length > 0 
    ? activeCOs.map(c => c.code)
    : Object.keys(coScores);

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
              Average Survey Attainment: {Number(avgLevel).toFixed(2)}
            </span>
          )}
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>CO Code</th>
                <th style={{ textAlign: 'center' }}>Responses</th>
                <th style={{ textAlign: 'center' }}>% Positive Ratings</th>
                <th style={{ textAlign: 'center' }}>Attainment Score (Scale 0-3)</th>
                <th style={{ textAlign: 'center' }}>Attainment Level</th>
              </tr>
            </thead>
            <tbody>
              {coList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No Course Outcomes or Survey responses available. Upload a survey file above to calculate indirect attainment.
                  </td>
                </tr>
              ) : (
                coList.map((coCode) => {
                  const score = coScores[coCode] != null ? Number(coScores[coCode]) : null;
                  const pct = coPercentages[coCode] != null ? Number(coPercentages[coCode]) : null;
                  const level = score != null ? Math.round(score) : null;

                  return (
                    <tr key={coCode}>
                      <td style={{ fontWeight: '700', color: '#2563eb' }}>{coCode}</td>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{totalResponses}</td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                        {pct != null ? `${pct.toFixed(2)}%` : '—'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: '#4f46e5' }}>
                        {score != null ? score.toFixed(2) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {level != null ? (
                          <span
                            className={`badge ${
                              level >= 3 ? 'badge-level-3' : level === 2 ? 'badge-level-2' : 'badge-level-1'
                            }`}
                          >
                            Level {level}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
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
