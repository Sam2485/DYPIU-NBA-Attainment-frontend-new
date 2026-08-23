import { useState, useEffect } from 'react';
import { FileCheck, Upload, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { useAcademic } from '../../context/academic';
import { useAttainment } from '../../context/attainment';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function EndSemMarksHub({ hideFooter = false }) {
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

  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [showAllStudents, setShowAllStudents] = useState(false);

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
      });
      setUploadedFileName(file.name);
      setShowAllStudents(false);
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

  const coLevels = examinationData?.coAttainmentLevels || examinationData?.coAttainmentScores || {};
  const coPercentages = examinationData?.percentageAboveThreshold || {};
  const coMaxMarks = examinationData?.coMaxMarks || {};
  const coThresholdMarks = examinationData?.coThresholdMarks || {};
  const studentsAboveThreshold = examinationData?.studentsAboveThreshold || {};
  const totalStudents = examinationData?.totalStudents ?? 0;
  const overallDirectCoAttainment = examinationData?.overallDirectCoAttainment ?? examinationData?.averageAttainmentLevel ?? 0;
  const thresholdPercentage = examinationData?.thresholdPercentage ?? 60;
  const studentMarks = Array.isArray(examinationData?.studentMarks) ? examinationData.studentMarks : [];

  const coList = [...new Set([
    ...activeCOs.map((co) => co.code).filter(Boolean),
    ...Object.keys(coLevels),
    ...Object.keys(coMaxMarks),
    ...studentMarks.flatMap((student) => Object.keys(student?.coMarks || {})),
  ])];
  const visibleStudentMarks = showAllStudents ? studentMarks : studentMarks.slice(0, 10);

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
              {uploadedFileName ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '13px', fontWeight: '700' }}>
                  <FileCheck size={16} />
                  <span>{uploadedFileName}</span>
                  <button
                    type="button"
                    aria-label="Remove selected examination file"
                    title="Remove file"
                    onClick={() => {
                      setUploadedFileName(null);
                      setStatusMessage(null);
                    }}
                    style={{ display: 'inline-grid', placeItems: 'center', padding: 0, border: 'none', background: 'transparent', color: '#b91c1c', cursor: 'pointer' }}
                  >
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="marks-file-input"
                  className={`btn btn-primary ${!courseOfferingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ cursor: courseOfferingId ? 'pointer' : 'not-allowed' }}
                >
                  <Upload size={15} /> Select Excel File
                </label>
              )}
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
              Overall Direct CO Attainment: {Number(overallDirectCoAttainment).toFixed(2)}
            </span>
          )}
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>CO Code</th>
                <th style={{ textAlign: 'center' }}>Students Attempted</th>
                <th style={{ textAlign: 'center' }}>Students ≥ Threshold</th>
                <th style={{ textAlign: 'center' }}>% Scoring &ge; Threshold ({thresholdPercentage}%)</th>
                <th style={{ textAlign: 'center' }}>Max / Threshold Marks</th>
                <th style={{ textAlign: 'center' }}>Attainment Level</th>
              </tr>
            </thead>
            <tbody>
              {coList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No Course Outcomes or Examination Marks available. Upload a marks sheet above to calculate direct attainment.
                  </td>
                </tr>
              ) : (
                coList.map((coCode) => {
                  const level = coLevels[coCode] != null ? Number(coLevels[coCode]) : null;
                  const pct = coPercentages[coCode] != null ? Number(coPercentages[coCode]) : null;
                  const maxMarks = coMaxMarks[coCode];
                  const thresholdMarks = coThresholdMarks[coCode];

                  return (
                    <tr key={coCode}>
                      <td style={{ fontWeight: '700', color: '#2563eb' }}>{coCode}</td>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{totalStudents}</td>
                      <td style={{ textAlign: 'center', fontWeight: '700' }}>{studentsAboveThreshold[coCode] ?? '—'}</td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                        {pct != null ? `${pct.toFixed(2)}%` : '—'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: '#4f46e5' }}>
                        {maxMarks != null || thresholdMarks != null
                          ? `${maxMarks ?? '—'} / ${thresholdMarks ?? '—'}`
                          : '—'}
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

      {/* Uploaded Student Marks */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Uploaded Student Marks</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {studentMarks.length > 0
                ? `Showing ${visibleStudentMarks.length} of ${studentMarks.length} students`
                : 'Student-level marks will appear after an Excel sheet is uploaded.'}
            </span>
          </div>
          {studentMarks.length > 10 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAllStudents((current) => !current)}
            >
              {showAllStudents ? 'Show first 10' : 'Show all'}
            </button>
          )}
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
              {studentMarks.length === 0 ? (
                <tr>
                  <td colSpan={3 + Math.max(coList.length, 1)} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No uploaded student marks available.
                  </td>
                </tr>
              ) : (
                visibleStudentMarks.map((student, index) => (
                  <tr key={`${student.prn ?? 'student'}-${student.srNo ?? index}`}>
                    <td style={{ textAlign: 'center', fontWeight: '600' }}>{student.srNo ?? index + 1}</td>
                    <td style={{ fontWeight: '600' }}>{student.prn ?? '—'}</td>
                    <td>{student.studentName ?? '—'}</td>
                    {coList.map((coCode) => (
                      <td key={coCode} style={{ textAlign: 'center', fontWeight: '600' }}>
                        {student.coMarks?.[coCode] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
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
