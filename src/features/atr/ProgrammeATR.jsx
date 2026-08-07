import { useState } from 'react';
import { Award, Save, CheckCircle2, Clock, ShieldCheck, Plus, Trash2, Printer } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function ProgrammeATR() {
  const { role, user } = useAuth();
  const {
    selectedProgramme,
    academicYear,
    selectedBatch,
    availableYears,
  } = useAcademic();

  const isCoordinator = role === 'PROGRAMME_COORDINATOR';
  const isDirector = role === 'DIRECTOR' || role === 'IQAC' || role === 'SUPER_ADMIN';

  const [selectedYear, setSelectedYear] = useState(academicYear || '2025-26');

  // Programme POs Action Taken Report Data (Matching DOCX layout)
  const [poAtrList, setPoAtrList] = useState([
    {
      code: 'PO1',
      title: 'PO1: Engineering knowledge',
      statement: 'Apply the knowledge of mathematics, science, engineering fundamentals and engineering specialization to the solution of complex computer engineering problems.',
      target: 1.80,
      actual: 1.79,
      pctAchieved: 99.44,
      status: 'Target Achieved',
      actions: [
        'Expert Sessions on recent trends like Data Mining for Research Applications and Demonstration of Cyber Security Attacks were conducted for better understanding of the concepts.',
        'Technical Sessions on Coding, Networking, Data Structures were conducted to provide student-centric learning environment.',
      ],
    },
    {
      code: 'PO2',
      title: 'PO2: Problem analysis',
      statement: 'Identify, formulate, review research literature, and analyze complex computer engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.',
      target: 1.80,
      actual: 1.74,
      pctAchieved: 96.66,
      status: 'Target Achieved',
      actions: [
        'Webinars on latest technology to enhance problem analysis ability are planned.',
        'Students learning is enhanced by providing complex numerical problems in the field of science and engineering.',
      ],
    },
    {
      code: 'PO3',
      title: 'PO3: Design/development of solutions',
      statement: 'Design solutions for complex computer engineering problems and design system components or processes that meet the specified needs with appropriate consideration for public health and safety.',
      target: 1.80,
      actual: 1.60,
      pctAchieved: 88.88,
      status: 'Target Achieved',
      actions: [
        'To explore safety and societal issues among the students, expert lecture is planned.',
        'Students are encouraged to do industrial training and internships to enhance the ability to identify and formulate complex engineering problems.',
      ],
    },
    {
      code: 'PO4',
      title: 'PO4: Conduct investigations of complex problems',
      statement: 'Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.',
      target: 1.80,
      actual: 1.62,
      pctAchieved: 90.00,
      status: 'Target Achieved',
      actions: [
        'Students are encouraged to do industry sponsored projects to enhance skills to investigate / analyze real life complex problem.',
      ],
    },
    {
      code: 'PO5',
      title: 'PO5: Modern tool usage',
      statement: 'Create, select and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex computer engineering activities.',
      target: 1.80,
      actual: 1.58,
      pctAchieved: 87.77,
      status: 'Target Achieved',
      actions: [
        'Students will be encouraged to do industrial training / internship.',
        'Extra sessions are arranged to make students aware of latest tools, techniques and trends.',
        'Students are motivated to write seminar/project reports using LATEX.',
      ],
    },
    {
      code: 'PO6',
      title: 'PO6: The engineer and society',
      statement: 'Apply reasoning informed by contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to professional engineering practice.',
      target: 1.80,
      actual: 1.47,
      pctAchieved: 81.66,
      status: 'Target Achieved',
      actions: [
        'To enhance professional engineering practices students are motivated to take part in Professional society chapter activities.',
      ],
    },
    {
      code: 'PO7',
      title: 'PO7: Environment and sustainability',
      statement: 'Understand the impact of professional engineering solutions in societal and environmental contexts and demonstrate the knowledge of, and need for sustainable development.',
      target: 1.80,
      actual: 1.69,
      pctAchieved: 93.88,
      status: 'Target Achieved',
      actions: [
        'Students are encouraged to develop mini project to address social issues.',
        'More number of expert lectures to be organized to address environmental and sustainability issues in engineering.',
        'Techno-social visits are planned for students.',
      ],
    },
    {
      code: 'PO8',
      title: 'PO8: Ethics',
      statement: 'Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.',
      target: 1.80,
      actual: 1.66,
      pctAchieved: 92.22,
      status: 'Target Achieved',
      actions: [
        'Personality Development Classes conducted.',
        'Cultivation of ethics in classroom interactions.',
      ],
    },
    {
      code: 'PO9',
      title: 'PO9: Individual and team work',
      statement: 'Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.',
      target: 1.80,
      actual: 1.73,
      pctAchieved: 96.11,
      status: 'Target Achieved',
      actions: [
        'More motivation to involve as volunteer/participant in Tech Fest, National level sports meet, technical and cultural activities to generate leadership and teamwork.',
        'Final year project groups give students opportunities for team collaborations.',
      ],
    },
    {
      code: 'PO10',
      title: 'PO10: Communication',
      statement: 'Communicate effectively on complex engineering activities with the engineering community and with society at large, such as being able to comprehend and write effective reports.',
      target: 1.80,
      actual: 1.88,
      pctAchieved: 104.44,
      status: 'Target Achieved',
      actions: [
        'Student presentations like seminar and project dissertation.',
        'Regular communication should be in English even in break timings to improve communication.',
      ],
    },
    {
      code: 'PO11',
      title: 'PO11: Project management and finance',
      statement: 'Demonstrate knowledge and understanding of engineering and management principles and apply these to one’s own work, as a member and leader in a team.',
      target: 1.80,
      actual: 1.72,
      pctAchieved: 95.55,
      status: 'Target Achieved',
      actions: [
        'Awareness program for students regarding management principles in projects.',
        'More industrial visits organized for real-world managerial exposure.',
      ],
    },
    {
      code: 'PO12',
      title: 'PO12: Life-long learning',
      statement: 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.',
      target: 1.80,
      actual: 1.64,
      pctAchieved: 91.11,
      status: 'Target Achieved',
      actions: [
        'Students are encouraged to enroll for training / certification courses.',
        'For conduction of practicals, use of virtual labs increased for independent learning.',
      ],
    },
  ]);

  // Programme PSOs Action Taken Report Data (Matching DOCX layout)
  const [psoAtrList, setPsoAtrList] = useState([
    {
      code: 'PSO1',
      title: 'PSO1: Computer Systems Hardware & Software Principles',
      statement: 'Graduate of programme should be able to demonstrate the principles and working of the hardware and software aspects of computer systems.',
      target: 1.80,
      actual: 1.80,
      pctAchieved: 100.00,
      status: 'Target Achieved',
      actions: [
        'Practical approach of teaching programming to be adapted.',
      ],
    },
    {
      code: 'PSO2',
      title: 'PSO2: Software Development & Engineering Practices',
      statement: 'Graduate of programme should be able to use professional engineering practices, strategies and tactics for the development, maintenance and testing of software solutions.',
      target: 1.80,
      actual: 1.65,
      pctAchieved: 91.66,
      status: 'Target Achieved',
      actions: [
        'Students are encouraged to enroll for training / certification courses.',
      ],
    },
    {
      code: 'PSO3',
      title: 'PSO3: IT Domain Real-Time Solutions',
      statement: 'Graduate of programme should be able to provide effective and efficient real time solutions using practical knowledge in IT domain.',
      target: 1.80,
      actual: 1.50,
      pctAchieved: 83.33,
      status: 'Target Achieved',
      actions: [
        'More industrial visits will be organized.',
        'Industrial Training or Hands-on Real-time Project experience to reduce gap between industry and students.',
      ],
    },
  ]);

  // Overall Verification State
  const [reportStatus, setReportStatus] = useState('SUBMITTED'); // 'DRAFT', 'SUBMITTED', 'VERIFIED'
  const [verifiedBy, setVerifiedBy] = useState('Director / HOD');
  const [verifiedAt, setVerifiedAt] = useState('2026-08-05');

  // Action Items Management Functions
  const handleAddPoAction = (poIndex) => {
    const updated = [...poAtrList];
    updated[poIndex].actions.push('New corrective action plan...');
    setPoAtrList(updated);
  };

  const handleUpdatePoAction = (poIndex, actionIndex, val) => {
    const updated = [...poAtrList];
    updated[poIndex].actions[actionIndex] = val;
    setPoAtrList(updated);
  };

  const handleDeletePoAction = (poIndex, actionIndex) => {
    const updated = [...poAtrList];
    updated[poIndex].actions.splice(actionIndex, 1);
    setPoAtrList(updated);
  };

  const handleAddPsoAction = (psoIndex) => {
    const updated = [...psoAtrList];
    updated[psoIndex].actions.push('New corrective action plan...');
    setPsoAtrList(updated);
  };

  const handleUpdatePsoAction = (psoIndex, actionIndex, val) => {
    const updated = [...psoAtrList];
    updated[psoIndex].actions[actionIndex] = val;
    setPsoAtrList(updated);
  };

  const handleDeletePsoAction = (psoIndex, actionIndex) => {
    const updated = [...psoAtrList];
    updated[psoIndex].actions.splice(actionIndex, 1);
    setPsoAtrList(updated);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Top Banner Header */}
      <div className="banner-dark-gradient print:hidden">
        <div className="banner-content-row">
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Programme Action Taken Report (ATR) — NBA Section 7.1 Format
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
              Actions taken based on results of evaluation of POs & PSOs ({selectedProgramme?.code} • {selectedBatch?.name})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handlePrintReport}>
              <Printer size={15} /> Print / Export ATR Document
            </button>
            {isCoordinator && reportStatus !== 'VERIFIED' && (
              <button className="btn btn-primary" onClick={() => { setReportStatus('SUBMITTED'); alert('Programme ATR submitted for Director approval!'); }}>
                <Save size={15} /> Save & Submit ATR
              </button>
            )}
            {isDirector && reportStatus === 'SUBMITTED' && (
              <button className="btn btn-primary" onClick={() => { setReportStatus('VERIFIED'); setVerifiedBy(user?.name || 'Director / HOD'); alert('Programme ATR Approved!'); }} style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                <ShieldCheck size={15} /> Approve & Lock ATR
              </button>
            )}
          </div>
        </div>
      </div>

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
                ATR Verification Status: {reportStatus === 'VERIFIED' ? 'VERIFIED & LOCKED BY DIRECTOR / HOD ✓' : 'SUBMITTED — PENDING DIRECTOR FINAL APPROVAL'}
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                {selectedProgramme?.name} ({selectedProgramme?.code}) • {selectedBatch?.name}
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
        {/* Document Title Header */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a', lineHeight: 1.3 }}>
            Actions Taken Based on Results of Evaluation of Each of the POs & PSOs
          </h1>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', marginTop: '6px' }}>
            Department of Computer Engineering • {selectedProgramme?.name} ({selectedProgramme?.code})
          </div>
        </div>

        {/* Introductory Preamble Paragraphs (Exact copy from DOCX) */}
        <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.6, marginBottom: '24px' }}>
          <p style={{ margin: '0 0 10px 0' }}>
            Department identifies the areas of weaknesses in the program based on the analysis of evaluation of POs & PSOs attainment levels. Measures identified and implemented to improve POs & PSOs attainment levels for the assessment years.
          </p>
          <p style={{ margin: 0 }}>
            The actual CO-PO attainment is compared with the targeted CO-PO mapping. If the final PO/PSO attainment is more than or equal to targeted CO-PO mapping, then it is considered that the particular PO/PSO is attained. The corrective actions are decided to attain that particular PO/PSO in the next academic year. Even though POs and PSOs are attained, it is ensured that the level of attainment is maintained or improved further by planning improvised action plans.
          </p>
        </div>

        {/* Section Heading */}
        <div style={{ background: '#f1f5f9', borderLeft: '4px solid #4f46e5', padding: '10px 16px', marginBottom: '20px', borderRadius: '0 8px 8px 0' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
            Table 7.1.1 : POs Attainment Levels and Actions for Improvement — ({selectedYear})
          </h3>
        </div>

        {/* ── PROGRAMME OUTCOMES (POs) ATR TABLES ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '36px' }}>
          {poAtrList.map((po, poIdx) => (
            <div
              key={po.code}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              {/* Full PO Statement Banner */}
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
                <span style={{ color: '#4f46e5', fontWeight: '900', marginRight: '6px' }}>{po.code}:</span>
                <span>{po.statement}</span>
              </div>

              {/* Data Table per PO (Exact DOCX format) */}
              <table className="audit-data-table" style={{ margin: 0, border: 'none' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ width: '80px', textAlign: 'center' }}>PO</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Target Level</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Attainment Level</th>
                    <th style={{ width: '170px', textAlign: 'center' }}>Observations</th>
                    <th>Actions Taken for Continuous Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center', fontWeight: '900', color: '#4f46e5', verticalAlign: 'top', paddingTop: '12px' }}>
                      {po.code}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '800', color: '#475569', verticalAlign: 'top', paddingTop: '12px' }}>
                      {po.target.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '800', color: '#059669', verticalAlign: 'top', paddingTop: '12px' }}>
                      {po.actual.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                      <span
                        className="badge"
                        style={{
                          background: po.pctAchieved >= 100 ? '#dcfce7' : '#fef9c3',
                          color: po.pctAchieved >= 100 ? '#15803d' : '#a16207',
                          fontWeight: '800',
                          fontSize: '11.5px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                        }}
                      >
                        {po.pctAchieved > 0 ? `${po.pctAchieved.toFixed(2)}% ` : ''}{po.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {po.actions.map((act, actIdx) => (
                          <div key={actIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ fontWeight: '800', color: '#3b82f6', minWidth: '60px', fontSize: '12px' }}>
                              Action {actIdx + 1}:
                            </span>
                            <textarea
                              rows={2}
                              value={act}
                              onChange={(e) => handleUpdatePoAction(poIdx, actIdx, e.target.value)}
                              className="form-input"
                              style={{ flex: 1, fontSize: '12px', padding: '4px 8px', lineHeight: 1.4 }}
                              disabled={reportStatus === 'VERIFIED'}
                            />
                            {reportStatus !== 'VERIFIED' && po.actions.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '4px 6px', color: '#ef4444' }}
                                onClick={() => handleDeletePoAction(poIdx, actIdx)}
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
                            onClick={() => handleAddPoAction(poIdx)}
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

        {/* ── PROGRAMME SPECIFIC OUTCOMES (PSOs) ATR TABLES ────────────────────────────────── */}
        <div style={{ background: '#f1f5f9', borderLeft: '4px solid #0284c7', padding: '10px 16px', marginBottom: '20px', borderRadius: '0 8px 8px 0' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
            PSOs Attainment Levels and Actions for Improvement — ({selectedYear})
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {psoAtrList.map((pso, psoIdx) => (
            <div
              key={pso.code}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              {/* Full PSO Statement Banner */}
              <div
                style={{
                  background: '#f0f9ff',
                  borderBottom: '1px solid #cbd5e1',
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#0f172a',
                  lineHeight: 1.4,
                }}
              >
                <span style={{ color: '#0284c7', fontWeight: '900', marginRight: '6px' }}>{pso.code}:</span>
                <span>{pso.statement}</span>
              </div>

              {/* Data Table per PSO */}
              <table className="audit-data-table" style={{ margin: 0, border: 'none' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ width: '80px', textAlign: 'center' }}>PSO</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Target Level</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Attainment Level</th>
                    <th style={{ width: '170px', textAlign: 'center' }}>Observations</th>
                    <th>Actions Taken for Continuous Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center', fontWeight: '900', color: '#0284c7', verticalAlign: 'top', paddingTop: '12px' }}>
                      {pso.code}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '800', color: '#475569', verticalAlign: 'top', paddingTop: '12px' }}>
                      {pso.target.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '800', color: '#059669', verticalAlign: 'top', paddingTop: '12px' }}>
                      {pso.actual.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                      <span
                        className="badge"
                        style={{
                          background: pso.pctAchieved >= 100 ? '#dcfce7' : '#fef9c3',
                          color: pso.pctAchieved >= 100 ? '#15803d' : '#a16207',
                          fontWeight: '800',
                          fontSize: '11.5px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                        }}
                      >
                        {pso.pctAchieved > 0 ? `${pso.pctAchieved.toFixed(2)}% ` : ''}{pso.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pso.actions.map((act, actIdx) => (
                          <div key={actIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ fontWeight: '800', color: '#0284c7', minWidth: '60px', fontSize: '12px' }}>
                              Action {actIdx + 1}:
                            </span>
                            <textarea
                              rows={2}
                              value={act}
                              onChange={(e) => handleUpdatePsoAction(psoIdx, actIdx, e.target.value)}
                              className="form-input"
                              style={{ flex: 1, fontSize: '12px', padding: '4px 8px', lineHeight: 1.4 }}
                              disabled={reportStatus === 'VERIFIED'}
                            />
                            {reportStatus !== 'VERIFIED' && pso.actions.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '4px 6px', color: '#ef4444' }}
                                onClick={() => handleDeletePsoAction(psoIdx, actIdx)}
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
                            onClick={() => handleAddPsoAction(psoIdx)}
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

      {/* Save, Previous & Next Footer */}
      <SectionSaveFooter
        label="Programme ATR"
        prevPath="/course-atr"
        nextPath="/reports"
        onSave={() => alert('Programme ATR Saved!')}
      />
    </div>
  );
}
