import { useState } from 'react';
import { ShieldCheck, CheckCircle2, Clock, Check, Eye, Sliders, FileText, Award, BarChart3 } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function CoordinatorReviewHub() {
  const { role, user } = useAuth();
  const {
    availableCourses = [],
    selectedProgramme,
    academicYear,
    attainmentConfigs,
    updateCourseAttainmentConfig,
  } = useAcademic();

  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';

  // Selected Course State
  const [reviewCourseId, setReviewCourseId] = useState(availableCourses[0]?.id || 'crs-1');
  const selectedReviewCourse = availableCourses.find((c) => c.id === reviewCourseId) || availableCourses[0];

  // Review Tabs
  const [activeReviewTab, setActiveReviewTab] = useState('config'); // 'config', 'cos', 'atr', 'attainment'

  // Sample State for Reviews
  const [reviewStatusMap, setReviewStatusMap] = useState({
    'crs-1': {
      configStatus: 'VERIFIED',
      coStatus: 'APPROVED',
      atrStatus: 'SUBMITTED', // 'SUBMITTED', 'VERIFIED'
    },
    'crs-2': {
      configStatus: 'WAITING_FOR_COORDINATOR_VERIFICATION',
      coStatus: 'PENDING_APPROVAL',
      atrStatus: 'DRAFT',
    },
  });

  const currentCourseReview = reviewStatusMap[reviewCourseId] || {
    configStatus: 'WAITING_FOR_COORDINATOR_VERIFICATION',
    coStatus: 'PENDING_APPROVAL',
    atrStatus: 'DRAFT',
  };

  const handleVerifyConfig = () => {
    setReviewStatusMap((prev) => ({
      ...prev,
      [reviewCourseId]: { ...prev[reviewCourseId], configStatus: 'VERIFIED' },
    }));
    updateCourseAttainmentConfig(reviewCourseId, { status: 'VERIFIED' });
    alert(`Attainment Configuration for ${selectedReviewCourse?.code} verified and approved!`);
  };

  const handleApproveCOs = () => {
    setReviewStatusMap((prev) => ({
      ...prev,
      [reviewCourseId]: { ...prev[reviewCourseId], coStatus: 'APPROVED' },
    }));
    alert(`Course Outcomes for ${selectedReviewCourse?.code} approved successfully!`);
  };

  const handleVerifyATR = () => {
    setReviewStatusMap((prev) => ({
      ...prev,
      [reviewCourseId]: { ...prev[reviewCourseId], atrStatus: 'VERIFIED' },
    }));
    alert(`Course Action Taken Report (ATR) for ${selectedReviewCourse?.code} verified successfully!`);
  };

  // Sample CO to PO/PSO Attainment Matrix for chosen course
  const coAttainmentData = [
    { code: 'C321.1', statement: 'Interpret fundamental concepts of Computer Networks', direct: 2.80, indirect: 2.70, overall: 2.78, po1: 2.78, po2: 2.50, po3: '-', pso1: 2.78, pso2: '-' },
    { code: 'C321.2', statement: 'Demonstrate working of data link layer for flow/error control', direct: 2.70, indirect: 2.60, overall: 2.68, po1: 2.68, po2: 2.68, po3: 2.40, pso1: 2.68, pso2: 2.50 },
    { code: 'C321.3', statement: 'Analyze working of routing protocols and data transmission', direct: 2.10, indirect: 2.40, overall: 2.16, po1: 2.16, po2: 2.16, po3: 2.16, pso1: 2.16, pso2: 2.00 },
    { code: 'C321.4', statement: 'Implement client-server applications using sockets', direct: 2.90, indirect: 2.85, overall: 2.89, po1: 2.89, po2: 2.80, po3: 2.89, pso1: 2.89, pso2: 2.80 },
    { code: 'C321.5', statement: 'Analyze role of application layer protocols', direct: 2.20, indirect: 2.30, overall: 2.22, po1: 2.22, po2: 2.22, po3: '-', pso1: 2.22, pso2: '-' },
    { code: 'C321.6', statement: 'Interpret basics of Network Security for secured communication', direct: 2.75, indirect: 2.70, overall: 2.74, po1: 2.74, po2: 2.70, po3: 2.60, pso1: 2.74, pso2: 2.60 },
  ];

  return (
    <div className="animated-page">
      {/* Top Banner Header */}
      <div className="banner-dark-gradient">
        <div className="banner-content-row">
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Programme Coordinator Review Hub
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
              Review submissions from Course Coordinators (Faculty) for {selectedProgramme?.code} ({academicYear})
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: CHOOSE COURSE DROPDOWN BANNER */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          background: '#ffffff',
          border: '1.5px solid #6366f1',
          padding: '16px 24px',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'grid',
                placeItems: 'center',
                fontWeight: '900',
              }}
            >
              1
            </span>
            <div>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                Select Course for Review:
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Choose a course under {selectedProgramme?.name} to inspect submitted configurations, COs, ATR, and attainments.
              </p>
            </div>
          </div>

          <div style={{ minWidth: '280px' }}>
            <select
              value={reviewCourseId}
              onChange={(e) => setReviewCourseId(e.target.value)}
              className="form-input"
              style={{
                height: '40px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#4f46e5',
                border: '2px solid #6366f1',
                borderRadius: '10px',
                background: '#ffffff',
              }}
            >
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.faculty || 'Assigned Faculty'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STEP 2: REVIEW CATEGORY TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeReviewTab === 'config' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReviewTab('config')}
          style={{ gap: '8px', padding: '10px 16px', fontSize: '12.5px', fontWeight: '700' }}
        >
          <Sliders size={15} /> 1. Attainment Config Review
          {currentCourseReview.configStatus === 'VERIFIED' ? (
            <CheckCircle2 size={14} style={{ color: '#10b981' }} />
          ) : (
            <Clock size={14} style={{ color: '#eab308' }} />
          )}
        </button>

        <button
          className={`btn ${activeReviewTab === 'cos' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReviewTab('cos')}
          style={{ gap: '8px', padding: '10px 16px', fontSize: '12.5px', fontWeight: '700' }}
        >
          <CheckCircle2 size={15} /> 2. CO Approvals Review
          {currentCourseReview.coStatus === 'APPROVED' ? (
            <CheckCircle2 size={14} style={{ color: '#10b981' }} />
          ) : (
            <Clock size={14} style={{ color: '#eab308' }} />
          )}
        </button>

        <button
          className={`btn ${activeReviewTab === 'atr' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReviewTab('atr')}
          style={{ gap: '8px', padding: '10px 16px', fontSize: '12.5px', fontWeight: '700' }}
        >
          <FileText size={15} /> 3. Course ATR Review
          {currentCourseReview.atrStatus === 'VERIFIED' ? (
            <CheckCircle2 size={14} style={{ color: '#10b981' }} />
          ) : (
            <Clock size={14} style={{ color: '#eab308' }} />
          )}
        </button>

        <button
          className={`btn ${activeReviewTab === 'attainment' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReviewTab('attainment')}
          style={{ gap: '8px', padding: '10px 16px', fontSize: '12.5px', fontWeight: '700' }}
        >
          <BarChart3 size={15} /> 4. Attainment Review (CO, PO & PSO)
        </button>
      </div>

      {/* ── TAB 1: ATTAINMENT CONFIG REVIEW ────────────────────────────────────────── */}
      {activeReviewTab === 'config' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                Attainment Configuration Review ({selectedReviewCourse?.code} - {selectedReviewCourse?.name})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Submitted by Course Coordinator ({selectedReviewCourse?.faculty || 'Dr. Raj Shaikh'}).
              </p>
            </div>

            {currentCourseReview.configStatus !== 'VERIFIED' ? (
              <button className="btn btn-primary" onClick={handleVerifyConfig}>
                <ShieldCheck size={15} /> Verify & Approve Configuration
              </button>
            ) : (
              <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', fontSize: '12px' }}>
                ✓ VERIFIED & APPROVED
              </span>
            )}
          </div>

          <div className="grid-cards-2">
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Direct Assessment Weightage</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#4f46e5', margin: '4px 0' }}>80%</div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>Indirect Survey Weightage: 20%</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>CO Target Threshold (% Students Achieving Benchmark)</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#059669', margin: '4px 0' }}>60%</div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>Target Benchmark Marks: ≥ 60% Student Score</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CO APPROVALS REVIEW ────────────────────────────────────────────── */}
      {activeReviewTab === 'cos' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                Course Outcomes (CO) Approvals ({selectedReviewCourse?.code} - {selectedReviewCourse?.name})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Submitted by Course Coordinator for approval.
              </p>
            </div>

            {currentCourseReview.coStatus !== 'APPROVED' ? (
              <button className="btn btn-primary" onClick={handleApproveCOs}>
                <Check size={15} /> Approve CO Statements
              </button>
            ) : (
              <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', fontSize: '12px' }}>
                ✓ COs APPROVED
              </span>
            )}
          </div>

          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>CO Code</th>
                <th>Course Outcome Statement</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Approval Status</th>
              </tr>
            </thead>
            <tbody>
              {coAttainmentData.map((co) => (
                <tr key={co.code}>
                  <td style={{ fontWeight: '800', color: '#4f46e5' }}>{co.code}</td>
                  <td style={{ fontSize: '12.5px' }}>{co.statement}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px' }}>
                      Approved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 3: COURSE ATR REVIEW ──────────────────────────────────────────────── */}
      {activeReviewTab === 'atr' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                Course Action Taken Report (ATR) Review ({selectedReviewCourse?.code})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Inspect Course Coordinator's target gap analysis & corrective action plans.
              </p>
            </div>

            {currentCourseReview.atrStatus !== 'VERIFIED' ? (
              <button className="btn btn-primary" onClick={handleVerifyATR}>
                <ShieldCheck size={15} /> Verify & Approve Course ATR
              </button>
            ) : (
              <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', fontSize: '12px' }}>
                ✓ ATR VERIFIED & APPROVED
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#fffafb' }}>
              <div style={{ fontWeight: '800', color: '#e11d48', fontSize: '13px' }}>C321.3 - Target Gap Identified (-0.40)</div>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#334155' }}>
                <strong>Observation:</strong> Students found link-state routing protocol algorithm implementation difficult.
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#1e40af', fontWeight: '700' }}>
                <strong>Corrective Action Plan:</strong> Introduce Cisco Packet Tracer lab simulation tutorials and extra problem-solving sessions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: ATTAINMENT REVIEW (CO & CO to PO/PSO) ─────────────────────────── */}
      {activeReviewTab === 'attainment' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                Course Attainment & PO/PSO Mapping Review ({selectedReviewCourse?.code} - {selectedReviewCourse?.name})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Direct, Indirect, Overall CO Attainments and calculated PO/PSO mapping levels.
              </p>
            </div>
          </div>

          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>CO Code</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Direct Att.</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Indirect Att.</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Overall CO</th>
                <th style={{ width: '80px', textAlign: 'center' }}>PO1</th>
                <th style={{ width: '80px', textAlign: 'center' }}>PO2</th>
                <th style={{ width: '80px', textAlign: 'center' }}>PO3</th>
                <th style={{ width: '80px', textAlign: 'center' }}>PSO1</th>
                <th style={{ width: '80px', textAlign: 'center' }}>PSO2</th>
              </tr>
            </thead>
            <tbody>
              {coAttainmentData.map((row) => (
                <tr key={row.code}>
                  <td style={{ fontWeight: '800', color: '#4f46e5' }}>{row.code}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700' }}>{row.direct.toFixed(2)}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700' }}>{row.indirect.toFixed(2)}</td>
                  <td style={{ textAlign: 'center', fontWeight: '900', color: '#059669', background: '#f0fdf4' }}>{row.overall.toFixed(2)}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700' }}>{row.po1}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700' }}>{row.po2}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700' }}>{row.po3}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#0284c7' }}>{row.pso1}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#0284c7' }}>{row.pso2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <SectionSaveFooter
        label="Coordinator Review Hub"
        prevPath="/outcomes"
        nextPath="/po-pso-attainment"
      />
    </div>
  );
}
