import { useState, useEffect } from 'react';
import { FileCheck, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAcademic } from '../../context/academic';
import { useAttainment } from '../../context/attainment';
import { useAuth } from '../../context/auth';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function EndSemMarksHub({ hideFooter = false }) {
  const { user } = useAuth();
  const {
    courseOfferingId,
    selectedCourse,
    selectedCourseOffering,
    activeCOs = [],
  } = useAcademic();

  const {
    examinationData,
    loadExaminationData,
    uploadEndSemMarks,
    loading: attainmentLoading,
  } = useAttainment();

  const [thresholdPercentage, setThresholdPercentage] = useState(60.0);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (courseOfferingId) {
      loadExaminationData(courseOfferingId).catch(() => {});
    }
  }, [courseOfferingId, loadExaminationData]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!courseOfferingId) {
      setErrorMessage('Please select a Course Offering before uploading marks.');
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const result = await uploadEndSemMarks({
        offeringId: courseOfferingId,
        file,
        thresholdPercentage,
        uploadedBy: user?.name || user?.email || 'Course Coordinator',
      });
      setStatusMessage(
        `File "${file.name}" uploaded and processed successfully! Processed for ${result?.totalStudents ?? 0} students.`
      );
    } catch (err) {
      console.error('Marks upload failed:', err);
      setErrorMessage(
        err?.customMessage || err?.message || 'Failed to upload examination marks sheet.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const coScores = examinationData?.coAttainmentScores || {};
  const coPercentages = examinationData?.percentageAboveThreshold || {};
  const totalStudents = examinationData?.totalStudents ?? 0;
  const avgLevel = examinationData?.averageAttainmentLevel ?? 0;

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
              <FileCheck size={24} style={{ color: '#4f46e5' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
                Direct Assessment (Internal / End Sem Examination)
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {selectedCourse?.code || selectedCourseOffering?.courseCode || 'Course'} — {selectedCourse?.name || selectedCourseOffering?.courseName || 'Selected Offering'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              Target Threshold (%):
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={thresholdPercentage}
              onChange={(e) => setThresholdPercentage(Number(e.target.value))}
              style={{
                width: '70px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontWeight: '700',
                textAlign: 'center',
              }}
            />
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
              <strong style={{ color: '#0f172a' }}>Uploading and calculating attainment...</strong>
            </div>
          ) : (
            <>
              <Upload size={36} style={{ color: '#4f46e5', marginBottom: '8px' }} />
              <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
                Upload Direct Examination Marks Sheet (.xlsx, .xls)
              </strong>
              <p style={{ margin: '4px 0 14px', fontSize: '12px', color: '#64748b' }}>
                Excel sheet with student PRN, student name, and marks scored per CO.
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                id="marks-file-input"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={uploading || !courseOfferingId}
              />
              <label
                htmlFor="marks-file-input"
                className={`btn btn-primary ${!courseOfferingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ cursor: courseOfferingId ? 'pointer' : 'not-allowed' }}
              >
                <Upload size={15} /> Select Excel File
              </label>
            </>
          )}
        </div>
      </div>

      {/* Direct Assessment Results */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Direct Examination Attainment Summary</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {totalStudents > 0 ? `${totalStudents} Students Evaluated` : 'No marks uploaded yet'}
            </span>
          </div>
          {totalStudents > 0 && (
            <span className="badge badge-active" style={{ fontSize: '13px', padding: '6px 12px' }}>
              Average Attainment Level: {Number(avgLevel).toFixed(2)}
            </span>
          )}
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>CO Code</th>
                <th style={{ textAlign: 'center' }}>Students Attempted</th>
                <th style={{ textAlign: 'center' }}>% Scoring &ge; Threshold ({thresholdPercentage}%)</th>
                <th style={{ textAlign: 'center' }}>Attainment Score (Scale 0-3)</th>
                <th style={{ textAlign: 'center' }}>Attainment Level</th>
              </tr>
            </thead>
            <tbody>
              {coList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No Course Outcomes or Examination Marks available. Upload a marks sheet above to calculate direct attainment.
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
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{totalStudents}</td>
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
        label="End Semester Marks"
        prevPath="/co-mapping"
        nextPath="/survey-upload"
        nextLabel="Save & Proceed to Indirect Assessment →"
        hidden={hideFooter}
      />
    </div>
  );
}
