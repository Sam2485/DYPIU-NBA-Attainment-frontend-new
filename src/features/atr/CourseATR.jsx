import { useState, useEffect } from 'react';
import { FileText, Save, CheckCircle2, Clock, ShieldCheck, History, Plus, Trash2, Printer } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function CourseATR({ hideFooter = false, hideHeader = false, showHistoryProp }) {
  const { role, user } = useAuth();
  const {
    selectedCourse,
    academicYear = '2025-26',
    selectedBatch,
    availableYears = ['2025-26', '2024-25'],
  } = useAcademic();

  const isFaculty = role === 'FACULTY';
  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';

  const [selectedYear, setSelectedYear] = useState(academicYear || '2025-26');
  const [showHistory, setShowHistory] = useState(showHistoryProp ?? false);

  useEffect(() => {
    if (showHistoryProp !== undefined) {
      setShowHistory(showHistoryProp);
    }
  }, [showHistoryProp]);

  // Course COs Action Taken Report Data (Matching DOCX layout)
  const [coAtrList, setCoAtrList] = useState([
    {
      code: 'C321.1',
      title: 'CO1: Interpret Fundamental Computer Network Concepts',
      statement: 'Interpret fundamental concepts of Computer Networks, architectures, protocols and technologies.',
      target: 2.50,
      actual: 2.80,
      pctAchieved: 112.00,
      status: 'Target Achieved',
      actions: [
        'Hands-on Wireshark packet capture lab demonstrations conducted.',
        'Interactive quiz sessions held to reinforce OSI vs TCP/IP layer concepts.',
      ],
    },
    {
      code: 'C321.2',
      title: 'CO2: Data Link Layer Functions & Error Control',
      statement: 'Demonstrate the working and functions of data link layer for flow and error control.',
      target: 2.50,
      actual: 2.70,
      pctAchieved: 108.00,
      status: 'Target Achieved',
      actions: [
        'CRC error detection numerical problem sheets assigned to students.',
      ],
    },
    {
      code: 'C321.3',
      title: 'CO3: Routing Protocols & Data Transmission',
      statement: 'Analyze the working of different routing protocols and mechanisms for transmission of data.',
      target: 2.50,
      actual: 2.10,
      pctAchieved: 84.00,
      status: 'Target Gap Identified',
      actions: [
        'Introduce Cisco Packet Tracer lab simulations for OSPF & BGP routing protocol configuration.',
        'Conduct extra tutorial sessions on link-state and distance-vector routing algorithms.',
      ],
    },
    {
      code: 'C321.4',
      title: 'CO4: Client-Server Socket Programming',
      statement: 'Implement client-server applications using socket programming principles.',
      target: 2.50,
      actual: 2.90,
      pctAchieved: 116.00,
      status: 'Target Achieved',
      actions: [
        'Python TCP/UDP socket programming lab assignments submitted successfully.',
      ],
    },
    {
      code: 'C321.5',
      title: 'CO5: Application Layer Protocols',
      statement: 'Analyze role of application layer with its protocols and client-server architectures.',
      target: 2.50,
      actual: 2.20,
      pctAchieved: 88.00,
      status: 'Target Gap Identified',
      actions: [
        'Organize live HTTP/DNS/DHCP protocol dissection workshops before mid-term exams.',
      ],
    },
    {
      code: 'C321.6',
      title: 'CO6: Network Security Fundamentals',
      statement: 'Interpret the basics of Network Security for secured communication.',
      target: 2.50,
      actual: 2.75,
      pctAchieved: 110.00,
      status: 'Target Achieved',
      actions: [
        'Demonstration of SSL/TLS encryption and RSA public key cryptography.',
      ],
    },
  ]);

  // Course ATR Verification State
  const [reportStatus, setReportStatus] = useState('SUBMITTED'); // 'DRAFT', 'SUBMITTED', 'VERIFIED'
  const [verifiedBy, setVerifiedBy] = useState('Programme Coordinator');
  const [verifiedAt, setVerifiedAt] = useState('2026-08-05');

  // Previous Academic Year's Carry-Forward Course ATR Data
  const previousBatchATR = {
    batch: 'Batch 2024-28 (AY 2024-25)',
    course: selectedCourse?.code || '310244',
    preparedBy: 'Prof. XYZ',
    status: 'VERIFIED',
    actions: [
      {
        coCode: 'C321.3',
        observation: 'Low student performance in network layer subnetting numerical problems.',
        actionPlan: 'Conducted 2 extra remedial tutorial classes on IPv4 CIDR subnetting.',
        impact: 'Attainment improved from 1.95 to 2.10 in current batch.',
      },
    ],
  };

  const handleAddCoAction = (coIndex) => {
    const updated = [...coAtrList];
    updated[coIndex].actions.push('New corrective action plan...');
    setCoAtrList(updated);
  };

  const handleUpdateCoAction = (coIndex, actionIndex, val) => {
    const updated = [...coAtrList];
    updated[coIndex].actions[actionIndex] = val;
    setCoAtrList(updated);
  };

  const handleDeleteCoAction = (coIndex, actionIndex) => {
    const updated = [...coAtrList];
    updated[coIndex].actions.splice(actionIndex, 1);
    setCoAtrList(updated);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Top Banner Header (Hidden when embedded in ATR Hub) */}
      {!hideHeader && (
        <div className="banner-dark-gradient print:hidden">
          <div className="banner-content-row">
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
                Course Action Taken Report (Course ATR) — NBA Section Format
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                Course-level target evaluation & corrective actions for continuous improvement ({selectedCourse?.code} • {selectedBatch?.name})
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowHistory(!showHistory)}>
                <History size={15} /> {showHistory ? 'Hide Previous Batch ATR' : 'View Carry-Forward ATR'}
              </button>
              <button className="btn btn-secondary" onClick={handlePrintReport}>
                <Printer size={15} /> Print / Export ATR
              </button>
              {isFaculty && reportStatus !== 'VERIFIED' && (
                <button className="btn btn-primary" onClick={() => { setReportStatus('SUBMITTED'); alert('Course ATR submitted to Programme Coordinator!'); }}>
                  <Save size={15} /> Save & Submit Course ATR
                </button>
              )}
              {isCoordinator && reportStatus === 'SUBMITTED' && (
                <button className="btn btn-primary" onClick={() => { setReportStatus('VERIFIED'); setVerifiedBy(user?.name || 'Programme Coordinator'); alert('Course ATR Approved!'); }} style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                  <ShieldCheck size={15} /> Verify & Approve Course ATR
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Status Alert */}
      <div
        className="card print:hidden"
        style={{
          marginBottom: '20px',
          background: reportStatus === 'VERIFIED' ? '#f0fdf4' : reportStatus === 'SUBMITTED' ? '#fefce8' : '#ffffff',
          border: reportStatus === 'VERIFIED' ? '1.5px solid #a7f3d0' : reportStatus === 'SUBMITTED' ? '1.5px solid #fef08a' : '1px solid #cbd5e1',
          padding: '14px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {reportStatus === 'VERIFIED' ? (
              <CheckCircle2 size={24} style={{ color: '#10b981' }} />
            ) : (
              <Clock size={24} style={{ color: '#ca8a04' }} />
            )}
            <div>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                Course ATR Status: {reportStatus === 'VERIFIED' ? 'VERIFIED & APPROVED BY PROGRAMME COORDINATOR ✓' : 'SUBMITTED — PENDING PROGRAMME COORDINATOR VERIFICATION'}
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Course: <strong>{selectedCourse?.code} - {selectedCourse?.name}</strong> • {selectedBatch?.name}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Select Academic Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="form-input"
              style={{ width: '130px', padding: '4px 8px', fontSize: '12.5px', fontWeight: '800', color: '#4f46e5' }}
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CARRY-FORWARD RULE: Previous Batch Reference */}
      {showHistory && (
        <div className="card print:hidden" style={{ marginBottom: '24px', background: '#f8fafc', border: '1.5px solid #818cf8' }}>
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <div>
              <span className="badge badge-active" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                ATR Carry-Forward Rule (Continuity Reference)
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '15px', color: '#0f172a' }}>
                Previous Batch Course ATR ({previousBatchATR.batch})
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Prepared by: {previousBatchATR.preparedBy}</span>
          </div>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>CO Code</th>
                <th>Previous Action Taken Plan</th>
                <th>Observed Impact in Current Batch</th>
              </tr>
            </thead>
            <tbody>
              {previousBatchATR.actions.map((act) => (
                <tr key={act.coCode}>
                  <td style={{ fontWeight: '800', color: '#4f46e5' }}>{act.coCode}</td>
                  <td style={{ fontSize: '12.5px' }}>{act.actionPlan}</td>
                  <td style={{ fontSize: '12.5px', color: '#059669', fontWeight: '700' }}>{act.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📜 DOCUMENT BODY - MATCHING DOCX REPORT STRUCTURE EXACTLY */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '28px 32px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* Document Header Title */}
        {!hideHeader && (
          <>
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a', lineHeight: 1.3 }}>
                Course Action Taken Report (Course ATR) based on CO Evaluation
              </h1>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', marginTop: '6px' }}>
                Course: {selectedCourse?.code} - {selectedCourse?.name} ({selectedYear})
              </div>
            </div>

            {/* Section Heading */}
            <div style={{ background: '#f1f5f9', borderLeft: '4px solid #4f46e5', padding: '10px 16px', marginBottom: '20px', borderRadius: '0 8px 8px 0' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
                COs Attainment Levels and Actions for Improvement — ({selectedYear})
              </h3>
            </div>
          </>
        )}

        {/* ── COURSE OUTCOMES (COs) ATR TABLES ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {coAtrList.map((co, coIdx) => (
            <div
              key={co.code}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              {/* Full CO Statement Banner */}
              <div
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #cbd5e1',
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#0f172a',
                  lineHeight: 1.4,
                }}
              >
                <span style={{ color: '#4f46e5', fontWeight: '900', marginRight: '6px' }}>{co.code}:</span>
                <span>{co.statement}</span>
              </div>

              {/* Data Table per CO (Exact DOCX format) */}
              <table className="audit-data-table" style={{ margin: 0, border: 'none' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ width: '80px', textAlign: 'center' }}>CO</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Target Level</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Attainment Level</th>
                    <th style={{ width: '170px', textAlign: 'center' }}>Observations</th>
                    <th>Actions Taken for Continuous Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center', fontWeight: '900', color: '#4f46e5', verticalAlign: 'top', paddingTop: '12px' }}>
                      {co.code}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '800', color: '#475569', verticalAlign: 'top', paddingTop: '12px' }}>
                      {co.target.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '800', color: co.pctAchieved < 100 ? '#e11d48' : '#059669', verticalAlign: 'top', paddingTop: '12px' }}>
                      {co.actual.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                      <span
                        className="badge"
                        style={{
                          background: co.pctAchieved >= 100 ? '#dcfce7' : '#fee2e2',
                          color: co.pctAchieved >= 100 ? '#15803d' : '#991b1b',
                          fontWeight: '800',
                          fontSize: '11.5px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                        }}
                      >
                        {co.pctAchieved.toFixed(2)}% {co.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {co.actions.map((act, actIdx) => (
                          <div key={actIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ fontWeight: '800', color: '#3b82f6', minWidth: '60px', fontSize: '12px' }}>
                              Action {actIdx + 1}:
                            </span>
                            <textarea
                              rows={2}
                              value={act}
                              onChange={(e) => handleUpdateCoAction(coIdx, actIdx, e.target.value)}
                              className="form-input"
                              style={{ flex: 1, fontSize: '12px', padding: '4px 8px', lineHeight: 1.4 }}
                              disabled={reportStatus === 'VERIFIED'}
                            />
                            {reportStatus !== 'VERIFIED' && co.actions.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '4px 6px', color: '#ef4444' }}
                                onClick={() => handleDeleteCoAction(coIdx, actIdx)}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        ))}

                        {reportStatus !== 'VERIFIED' && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '3px 10px', alignSelf: 'flex-start', marginTop: '4px' }}
                            onClick={() => handleAddCoAction(coIdx)}
                          >
                            <Plus size={13} /> + Add Action Item
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Save, Previous & Finish Attainment Process Footer */}
      {!hideFooter && (
        <SectionSaveFooter
          label="Course ATR"
          prevPath="/co-attainment"
          nextPath="/dashboard"
          nextLabel="Finish Attainment Process ✓"
          onFinish={() => {
            alert('🎉 Course Attainment Process Completed Successfully!');
            navigate('/dashboard');
          }}
          onSave={() => alert('Course ATR Saved!')}
        />
      )}
    </div>
  );
}
