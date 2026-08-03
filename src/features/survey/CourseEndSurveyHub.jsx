import { useState } from 'react';
import { ClipboardList, Upload, CheckCircle2, Star } from 'lucide-react';

export default function CourseEndSurveyHub() {
  const [surveys] = useState([
    {
      id: 'SRV-201',
      fileName: 'Survey_CS301_2025-26.xlsx',
      course: 'CS301 - Data Structures & Algorithms',
      totalResponses: 55,
      status: 'SUCCESS',
      uploadedBy: 'Dr. Raj Shaikh',
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
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)',
          color: '#fff',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ClipboardList size={24} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
              Course End Survey Management (Module 6)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#bfdbfe' }}>
              Indirect CO Attainment feedback parser (Slight = 0.33, Moderate = 0.66, Substantial = 1.00).
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '28px', background: '#f8fafc' }}>
          <Upload size={36} style={{ color: '#2563eb', marginBottom: '8px' }} />
          <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
            Upload Course End Survey Excel File
          </strong>
          <p style={{ margin: '4px 0 14px', fontSize: '12px', color: '#64748b' }}>
            Parses student survey ratings for indirect CO attainment calculations.
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
          <h3>Course End Survey CO Feedback Ratings & Weighted Scores</h3>
          <span className="badge badge-active">55 Responses Processed</span>
        </div>

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
  );
}
