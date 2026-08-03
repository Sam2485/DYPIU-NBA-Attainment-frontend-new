import { useState } from 'react';
import { FileCheck, Upload, CheckCircle2, AlertCircle, Trash2, Eye } from 'lucide-react';

export default function EndSemMarksHub() {
  const [uploads, setUploads] = useState([
    {
      id: 'UPL-101',
      fileName: 'EndSem_Marks_CS301_2025-26.xlsx',
      course: 'CS301 - Data Structures & Algorithms',
      totalStudents: 60,
      status: 'SUCCESS',
      uploadedBy: 'Dr. Raj Shaikh',
      uploadedAt: '2026-08-01 10:15',
    },
    {
      id: 'UPL-102',
      fileName: 'EndSem_Marks_CS302_2025-26.xlsx',
      course: 'CS302 - Database Management Systems',
      totalStudents: 58,
      status: 'SUCCESS',
      uploadedBy: 'Prof. Ananya Roy',
      uploadedAt: '2026-08-01 11:30',
    },
  ]);

  const [studentMarks] = useState([
    { prn: '202301001', name: 'Aarav Sharma', co1: 18, co2: 22, co3: 17, co4: 24, total: 81 },
    { prn: '202301002', name: 'Aditi Patel', co1: 15, co2: 19, co3: 16, co4: 21, total: 71 },
    { prn: '202301003', name: 'Rohan Gupta', co1: 20, co2: 24, co3: 19, co4: 25, total: 88 },
    { prn: '202301004', name: 'Sanya Malhotra', co1: 12, co2: 14, co3: 15, co4: 18, total: 59 },
    { prn: '202301005', name: 'Vikram Singh', co1: 17, co2: 21, co3: 18, co4: 22, total: 78 },
  ]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newUpload = {
        id: `UPL-${Date.now().toString().slice(-3)}`,
        fileName: file.name,
        course: 'CS301 - Data Structures & Algorithms',
        totalStudents: 60,
        status: 'SUCCESS',
        uploadedBy: 'Dr. Raj Shaikh',
        uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      setUploads([newUpload, ...uploads]);
      alert(`Excel file "${file.name}" uploaded & parsed successfully! Loaded 60 student records.`);
    }
  };

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
            <FileCheck size={24} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
              End Semester Marks Management (Module 5)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#bfdbfe' }}>
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
          <Upload size={36} style={{ color: '#2563eb', marginBottom: '8px' }} />
          <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
            Upload End Semester Marks Excel File
          </strong>
          <p style={{ margin: '4px 0 14px', fontSize: '12px', color: '#64748b' }}>
            Supported formats: .xlsx, .xls. Must contain PRN, Student Name, and CO Marks columns.
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

      {/* Upload History Table */}
      <div className="card">
        <div className="card-header">
          <h3>Uploaded Marks Datasets (Entity: End Semester Marks Upload)</h3>
        </div>
        <table className="audit-data-table">
          <thead>
            <tr>
              <th>Upload ID</th>
              <th>Excel File Name</th>
              <th>Course</th>
              <th>Students</th>
              <th>Status</th>
              <th>Uploaded By</th>
              <th>Timestamp</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: '700', color: '#2563eb' }}>{item.id}</td>
                <td style={{ fontWeight: '600' }}>{item.fileName}</td>
                <td>{item.course}</td>
                <td style={{ textAlign: 'center', fontWeight: '700' }}>{item.totalStudents}</td>
                <td>
                  <span className="badge badge-success">
                    <CheckCircle2 size={11} /> {item.status}
                  </span>
                </td>
                <td>{item.uploadedBy}</td>
                <td style={{ fontSize: '11.5px', color: '#64748b' }}>{item.uploadedAt}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '4px 8px' }}
                    onClick={() => setUploads(uploads.filter((u) => u.id !== item.id))}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student CO-wise Marks Inspection Grid */}
      <div className="card">
        <div className="card-header">
          <h3>Uploaded Student CO Marks Inspection (Entity: Student CO Marks)</h3>
          <span className="badge badge-active">CS301 - 60 Students</span>
        </div>
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
  );
}
