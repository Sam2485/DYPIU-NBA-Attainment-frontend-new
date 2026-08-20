import { useState } from 'react';
import { ClipboardList, Upload } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function CourseEndSurveyHub({ hideFooter = false }) {
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
  } = useAcademic();

  const [surveys] = useState([
    {
      id: 'SRV-201',
      fileName: 'Survey_CS301_2025-26.xlsx',
      course: 'CS301 - Data Structures & Algorithms',
      totalResponses: 55,
      status: 'SUCCESS',
      uploadedBy: 'Course Coordinator',
      uploadedAt: '2026-08-01 12:10',
    },
  ]);

  const [surveyBreakdown] = useState([
    { co: 'CO1', slight: 5, moderate: 15, substantial: 35, weightedScore: 81.45, indirectLevel: 3 },
    { co: 'CO2', slight: 8, moderate: 22, substantial: 25, weightedScore: 72.80, indirectLevel: 3 },
    { co: 'CO3', slight: 12, moderate: 28, substantial: 15, weightedScore: 63.20, indirectLevel: 2 },
    { co: 'CO4', slight: 4, moderate: 18, substantial: 33, weightedScore: 79.50, indirectLevel: 3 },
  ]);

  return (
    <div className="animated-page">
      {/* Standard Header Banner */}
      <div className="banner-dark-gradient">
        <div className="banner-content-row">
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Course End Survey Management
            </h2>
          </div>

          <div>
            <input type="file" accept=".xlsx,.xls" id="survey-file-input-header" style={{ display: 'none' }} />
            <label htmlFor="survey-file-input-header" className="btn btn-primary" style={{ cursor: 'pointer' }}>
              <Upload size={15} /> Upload Survey Excel
            </label>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '28px', background: '#f8fafc' }}>
          <Upload size={36} style={{ color: '#4f46e5', marginBottom: '8px' }} />
          <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
            Upload Course End Survey Excel File
          </strong>
          <p style={{ margin: '4px 0 14px', fontSize: '12px', color: '#64748b' }}>
            Parses student survey ratings for indirect CO attainment calculations (Slight = 0.33, Moderate = 0.66, Substantial = 1.00).
          </p>
          <input type="file" accept=".xlsx,.xls" id="survey-file-input" style={{ display: 'none' }} />
          <label htmlFor="survey-file-input" className="btn btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={15} /> Upload Survey Excel
          </label>
        </div>
      </div>

      {/* Indirect CO Survey Breakdown Grid */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
            Course End Survey CO Feedback Ratings & Weighted Scores
          </h3>
          <span className="badge badge-active">55 Responses Processed</span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>CO Code</th>
                <th style={{ textAlign: 'center' }}>Slight (W = 0.33)</th>
                <th style={{ textAlign: 'center' }}>Moderate (W = 0.66)</th>
                <th style={{ textAlign: 'center' }}>Substantial (W = 1.00)</th>
                <th style={{ textAlign: 'center' }}>Weighted Score (%)</th>
                <th style={{ textAlign: 'center' }}>Indirect CO Attainment Level</th>
              </tr>
            </thead>
            <tbody>
              {surveyBreakdown.map((row) => (
                <tr key={row.co}>
                  <td style={{ fontWeight: '700', color: '#2563eb' }}>{row.co}</td>
                  <td style={{ textAlign: 'center' }}>{row.slight} students</td>
                  <td style={{ textAlign: 'center' }}>{row.moderate} students</td>
                  <td style={{ textAlign: 'center' }}>{row.substantial} students</td>
                  <td style={{ textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>
                    {row.weightedScore}%
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className={`badge ${
                        row.indirectLevel === 3 ? 'badge-level-3' : 'badge-level-2'
                      }`}
                    >
                      Level {row.indirectLevel}
                    </span>
                  </td>
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
