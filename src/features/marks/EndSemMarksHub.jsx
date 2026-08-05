import { useState } from 'react';
import { FileCheck, Upload, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function EndSemMarksHub() {
  const [uploads] = useState([
    {
      id: 'MARKS-101',
      fileName: 'EndSem_Marks_CS301_2025-26.xlsx',
      course: 'CS301 - Data Structures & Algorithms',
      recordsProcessed: 60,
      status: 'SUCCESS',
      uploadedBy: 'Dr. Raj Shaikh',
      uploadedAt: '2026-08-02 14:30',
    },
  ]);

  const [studentMarks] = useState([
    { prn: '20230101', name: 'Aarav Sharma', co1: 22, co2: 20, co3: 18, co4: 24, total: 84 },
    { prn: '20230102', name: 'Ananya Patel', co1: 24, co2: 23, co3: 21, co4: 25, total: 93 },
    { prn: '20230103', name: 'Rohan Gupta', co1: 15, co2: 14, co3: 16, co4: 18, total: 63 },
    { prn: '20230104', name: 'Priya Verma', co1: 20, co2: 19, co3: 22, co4: 21, total: 82 },
    { prn: '20230105', name: 'Vikram Singh', co1: 12, co2: 13, co3: 15, co4: 14, total: 54 },
  ]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`File "${file.name}" uploaded successfully! Processing CO marks...`);
    }
  };

  return (
    <div className="animated-page">
      {/* Top Banner */}
      <div className="banner-dark-gradient">
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
              End Semester Marks Management
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>
              Upload End Semester Marks Excel datasets and view dynamic CO-wise student scores.
            </p>
          </div>
        </div>
      </div>

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
          <Upload size={36} style={{ color: '#4f46e5', marginBottom: '8px' }} />
          <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
            Upload End Sem CO-wise Marks Excel File
          </strong>
          <p style={{ margin: '4px 0 14px', fontSize: '12px', color: '#64748b' }}>
            Accepts `.xlsx` and `.xls` formats containing Student PRNs & CO-wise marks.
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            id="marks-file-input"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="marks-file-input" className="btn btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={15} /> Select Excel File
          </label>
        </div>
      </div>

      {/* Upload History Audit Log */}
      <div className="card">
        <div className="card-header">
          <h3>Recent End Sem Marks Upload Logs</h3>
          <span className="badge badge-active">{uploads.length} File Uploaded</span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Batch ID</th>
                <th>File Name</th>
                <th>Course</th>
                <th style={{ textAlign: 'center' }}>Records</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th>Uploaded By</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: '700', color: '#2563eb' }}>{row.id}</td>
                  <td style={{ fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileSpreadsheet size={15} style={{ color: '#10b981' }} />
                      {row.fileName}
                    </div>
                  </td>
                  <td>{row.course}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700' }}>{row.recordsProcessed}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success" style={{ gap: '4px' }}>
                      <CheckCircle2 size={12} /> Success
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{row.uploadedBy}</td>
                  <td style={{ fontSize: '11.5px', color: '#64748b' }}>{row.uploadedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student CO-wise Marks Inspection Grid */}
      <div className="card">
        <div className="card-header">
          <h3>Uploaded Student CO Marks Inspection</h3>
          <span className="badge badge-active">CS301 - 60 Students</span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                <th style={{ width: '130px' }}>Student PRN</th>
                <th>Student Name</th>
                <th style={{ width: '90px', textAlign: 'center' }}>CO1 (Max 25)</th>
                <th style={{ width: '90px', textAlign: 'center' }}>CO2 (Max 25)</th>
                <th style={{ width: '90px', textAlign: 'center' }}>CO3 (Max 25)</th>
                <th style={{ width: '90px', textAlign: 'center' }}>CO4 (Max 25)</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Total Score</th>
              </tr>
            </thead>
            <tbody>
              {studentMarks.map((st, idx) => (
                <tr key={st.prn}>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ fontWeight: '700', color: '#2563eb' }}>{st.prn}</td>
                  <td style={{ fontWeight: '600' }}>{st.name}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>{st.co1}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>{st.co2}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>{st.co3}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>{st.co4}</td>
                  <td style={{ textAlign: 'center', fontWeight: '800', color: '#10b981' }}>{st.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save, Previous & Save & Next Footer */}
      <SectionSaveFooter
        label="End Semester Marks"
        prevPath="/co-mapping"
        nextPath="/survey-upload"
      />
    </div>
  );
}
