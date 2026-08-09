import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Clock, Check, Sliders, FileText, BarChart3, Layers, XCircle } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function CoordinatorReviewHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { role, user } = useAuth();
  const {
    availableCourses = [],
    selectedProgramme,
    academicYear,
    attainmentConfigs = {},
    updateCourseAttainmentConfig,
    courseVerificationStore = {},
    updateCourseVerificationStatus,
    courseAtrStore = {},
    updateCourseCOs,
    yearMetrics = {},
  } = useAcademic();

  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';

  // Selected Course State
  const [reviewCourseId, setReviewCourseId] = useState(availableCourses[0]?.id || 'crs-1');
  const selectedReviewCourse = availableCourses.find((c) => c.id === reviewCourseId) || availableCourses[0];

  // Active Review Tab read from URL query param ?tab=config|cos|atr|attainment
  const currentTabParam = searchParams.get('tab') || 'config';
  const [activeReviewTab, setActiveReviewTab] = useState(currentTabParam);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['config', 'cos', 'atr', 'attainment'].includes(tabFromUrl)) {
      setActiveReviewTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveReviewTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // Verification status for the currently selected course
  const currentCourseReview = courseVerificationStore[reviewCourseId] || {
    configStatus: 'DRAFT',
    coStatus: 'PENDING_APPROVAL',
    atrStatus: 'DRAFT',
    verifiedBy: null,
  };

  // 1. Attainment Configuration for selected course
  const currentAttainmentConfig = attainmentConfigs[reviewCourseId] || {
    directWeight: 80,
    indirectWeight: 20,
    directThreshold: 60,
    thresholdPct: '60%',
    status: 'DRAFT',
    directLevels: [
      { level: 1, minPercentage: 0, maxPercentage: 50 },
      { level: 2, minPercentage: 50, maxPercentage: 70 },
      { level: 3, minPercentage: 70, maxPercentage: 100 },
    ],
    indirectLevels: [
      { level: 1, minPercentage: 0, maxPercentage: 50 },
      { level: 2, minPercentage: 50, maxPercentage: 70 },
      { level: 3, minPercentage: 70, maxPercentage: 100 },
    ],
  };

  // 2. Course Outcomes for selected course
  const courseCOs = selectedReviewCourse?.courseOutcomes || [];

  // 3. Course ATR Data for selected course dynamically mapped from actual Course Outcomes
  const rawAtrData = courseAtrStore[reviewCourseId] || [];
  const courseAtrData = (() => {
    if (courseCOs.length === 0) return rawAtrData;
    const rawMap = new Map(rawAtrData.map((item) => [item.code, item]));
    return courseCOs.map((co, idx) => {
      const existing = rawMap.get(co.code);
      const target = existing?.target || 2.50;
      const actual = existing?.actual || (idx % 2 === 0 ? 2.80 - idx * 0.1 : 2.10);
      const pctAchieved = Number(((actual / target) * 100).toFixed(2));
      const status = actual >= target ? 'Target Achieved' : 'Target Gap Identified';
      const defaultActions = actual >= target
        ? ['Maintain current teaching methodology and continuous assessment structure.']
        : [`Conduct extra tutorial sessions on ${co.statement.slice(0, 45)}...`, 'Provide additional practice numericals and interactive assignment problem sets.'];
      return {
        code: co.code,
        statement: co.statement,
        title: `${co.code}: ${co.statement}`,
        target,
        actual,
        pctAchieved,
        status,
        actions: existing?.actions || defaultActions,
      };
    });
  })();

  // Handlers for Programme Coordinator Verification Actions
  const handleVerifyConfig = () => {
    updateCourseVerificationStatus(reviewCourseId, 'configStatus', 'VERIFIED');
    updateCourseAttainmentConfig(reviewCourseId, { status: 'VERIFIED' });
    alert(`✓ Attainment Configuration for ${selectedReviewCourse?.code} - ${selectedReviewCourse?.name} verified and approved by Programme Coordinator!`);
  };

  const handleApproveCOs = () => {
    const approvedCOs = courseCOs.map((co) => ({
      ...co,
      status: 'APPROVED',
      approvedBy: user?.name || 'Programme Coordinator',
      approvedAt: new Date().toISOString().split('T')[0],
    }));
    updateCourseCOs(reviewCourseId, approvedCOs);
    updateCourseVerificationStatus(reviewCourseId, 'coStatus', 'APPROVED');
    alert(`✓ All Course Outcomes (COs) for ${selectedReviewCourse?.code} approved successfully!`);
  };

  const handleApproveSingleCO = (targetCoCode) => {
    const updatedCOs = courseCOs.map((co) =>
      co.code === targetCoCode
        ? {
            ...co,
            status: 'APPROVED',
            approvedBy: user?.name || 'Programme Coordinator',
            approvedAt: new Date().toISOString().split('T')[0],
          }
        : co
    );
    updateCourseCOs(reviewCourseId, updatedCOs);
    const allApproved = updatedCOs.every((co) => co.status === 'APPROVED');
    if (allApproved) {
      updateCourseVerificationStatus(reviewCourseId, 'coStatus', 'APPROVED');
    }
    alert(`✓ Course Outcome ${targetCoCode} approved by Programme Coordinator!`);
  };

  const handleRejectSingleCO = (targetCoCode) => {
    const updatedCOs = courseCOs.map((co) =>
      co.code === targetCoCode
        ? {
            ...co,
            status: 'REJECTED',
            approvedBy: null,
            approvedAt: null,
          }
        : co
    );
    updateCourseCOs(reviewCourseId, updatedCOs);
    updateCourseVerificationStatus(reviewCourseId, 'coStatus', 'PENDING_APPROVAL');
    alert(`Course Outcome ${targetCoCode} marked as needing revision.`);
  };

  const handleVerifyATR = () => {
    updateCourseVerificationStatus(reviewCourseId, 'atrStatus', 'VERIFIED');
    alert(`✓ Course Action Taken Report (ATR) for ${selectedReviewCourse?.code} verified and approved!`);
  };

  // Dynamic Attainment Overview Calculation for Tab 4
  const directLevel = yearMetrics?.directExamAttainment || 2.80;
  const indirectLevel = yearMetrics?.indirectSurveyAttainment || 2.50;
  const directW = currentAttainmentConfig.directWeight || 80;
  const indirectW = currentAttainmentConfig.indirectWeight || 20;
  const overallCOAttainment = ((directLevel * directW + indirectLevel * indirectW) / 100).toFixed(2);

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
              Review, verify and approve course submissions from Course Coordinators for {selectedProgramme?.code} ({academicYear})
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

          <div style={{ minWidth: '300px' }}>
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
                  {c.code} - {c.name} ({c.faculty || 'Course Coordinator'})
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
          onClick={() => handleTabChange('config')}
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
          onClick={() => handleTabChange('cos')}
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
          onClick={() => handleTabChange('atr')}
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
          onClick={() => handleTabChange('attainment')}
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
              <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', fontSize: '12px', fontWeight: '800' }}>
                ✓ VERIFIED & APPROVED BY PROGRAMME COORDINATOR
              </span>
            )}
          </div>

          <div className="grid-cards-2" style={{ gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Direct Assessment Weightage</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#4f46e5', margin: '4px 0' }}>
                {currentAttainmentConfig.directWeight}%
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Indirect Survey Weightage: <strong style={{ color: '#0284c7' }}>{currentAttainmentConfig.indirectWeight}%</strong>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>CO Target Threshold Marks (%)</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#059669', margin: '4px 0' }}>
                {currentAttainmentConfig.directThreshold}%
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Benchmark: Students scoring <strong style={{ color: '#059669' }}>≥ {currentAttainmentConfig.directThreshold}%</strong> total exam marks are counted.
              </div>
            </div>
          </div>

          {/* Level 1-3 Mapping Bands summary (Both Direct & Indirect) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Direct Assessment Attainment Level Bands Table */}
            <div style={{ border: '1.5px solid #6366f1', borderRadius: '12px', padding: '16px', background: '#faf5ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} style={{ color: '#4f46e5' }} />
                  <h4 style={{ margin: 0, fontSize: '14.5px', color: '#3730a3', fontWeight: '800' }}>
                    Submitted Direct Assessment Attainment Level Bands (Levels 1–3)
                  </h4>
                </div>
                <span style={{ fontSize: '11.5px', color: '#6366f1', fontWeight: '700' }}>
                  Direct Exam Benchmark Thresholds
                </span>
              </div>

              <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #e0e7ff' }}>
                <table className="audit-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '90px', textAlign: 'center' }}>Level</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>Min % Benchmark</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>Max % Benchmark</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Assigned Score</th>
                      <th>Attainment Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentAttainmentConfig.directLevels || [
                      { level: 1, minPercentage: 0, maxPercentage: 50 },
                      { level: 2, minPercentage: 50, maxPercentage: 70 },
                      { level: 3, minPercentage: 70, maxPercentage: 100 },
                    ]).map((lvl) => (
                      <tr key={lvl.level}>
                        <td style={{ textAlign: 'center', fontWeight: '900', color: '#4f46e5' }}>Level {lvl.level}</td>
                        <td style={{ textAlign: 'center', fontWeight: '800' }}>{lvl.minPercentage}%</td>
                        <td style={{ textAlign: 'center', fontWeight: '800' }}>{lvl.maxPercentage}%</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '900', fontSize: '12px' }}>
                            {lvl.level}.0 / 3.0
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                          {lvl.level === 1 ? 'Low Attainment (< benchmark threshold)' : lvl.level === 2 ? 'Moderate Attainment (meets benchmark)' : 'High Attainment (exceeds benchmark)'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Indirect Assessment Attainment Level Bands Table */}
            <div style={{ border: '1.5px solid #0284c7', borderRadius: '12px', padding: '16px', background: '#f0f9ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} style={{ color: '#0284c7' }} />
                  <h4 style={{ margin: 0, fontSize: '14.5px', color: '#0369a1', fontWeight: '800' }}>
                    Submitted Indirect Assessment Attainment Level Bands (Levels 1–3)
                  </h4>
                </div>
                <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: '700' }}>
                  Indirect Course Survey Feedback Thresholds
                </span>
              </div>

              <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                <table className="audit-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '90px', textAlign: 'center' }}>Level</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>Min % Survey</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>Max % Survey</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Assigned Score</th>
                      <th>Attainment Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentAttainmentConfig.indirectLevels || [
                      { level: 1, minPercentage: 0, maxPercentage: 50 },
                      { level: 2, minPercentage: 50, maxPercentage: 70 },
                      { level: 3, minPercentage: 70, maxPercentage: 100 },
                    ]).map((lvl) => (
                      <tr key={lvl.level}>
                        <td style={{ textAlign: 'center', fontWeight: '900', color: '#0284c7' }}>Level {lvl.level}</td>
                        <td style={{ textAlign: 'center', fontWeight: '800' }}>{lvl.minPercentage}%</td>
                        <td style={{ textAlign: 'center', fontWeight: '800' }}>{lvl.maxPercentage}%</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-active" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: '900', fontSize: '12px' }}>
                            {lvl.level}.0 / 3.0
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                          {lvl.level === 1 ? 'Low Survey Rating' : lvl.level === 2 ? 'Moderate Survey Rating' : 'High Survey Rating'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                Submitted by Course Coordinator ({selectedReviewCourse?.faculty || 'Assigned Faculty'}) for approval.
              </p>
            </div>

            {currentCourseReview.coStatus !== 'APPROVED' ? (
              <button className="btn btn-primary" onClick={handleApproveCOs}>
                <Check size={15} /> Approve CO Statements
              </button>
            ) : (
              <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', fontSize: '12px', fontWeight: '800' }}>
                ✓ COs APPROVED BY PROGRAMME COORDINATOR
              </span>
            )}
          </div>

          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '90px', textAlign: 'center' }}>CO Code</th>
                <th>Course Outcome Statement</th>
                <th style={{ width: '160px' }}>Submitted By</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Approval Status</th>
                <th style={{ width: '170px', textAlign: 'center' }}>Programme Coordinator Actions</th>
              </tr>
            </thead>
            <tbody>
              {courseCOs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No Course Outcomes submitted for this course yet.
                  </td>
                </tr>
              ) : (
                courseCOs.map((co) => {
                  const isApproved = co.status === 'APPROVED' || currentCourseReview.coStatus === 'APPROVED';
                  const isRejected = co.status === 'REJECTED';
                  return (
                    <tr key={co.code}>
                      <td style={{ fontWeight: '800', color: '#4f46e5', textAlign: 'center' }}>{co.code}</td>
                      <td style={{ fontSize: '12.5px', color: '#0f172a' }}>{co.statement}</td>
                      <td style={{ fontSize: '11.5px', color: '#475569' }}>
                        <strong>{co.submittedBy || selectedReviewCourse?.faculty || 'Course Coordinator'}</strong>
                        {co.submittedAt && <div style={{ fontSize: '10px', color: '#94a3b8' }}>{co.submittedAt}</div>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isApproved ? (
                          <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '800' }}>
                            ✓ Approved
                          </span>
                        ) : isRejected ? (
                          <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: '800' }}>
                            ✗ Needs Revision
                          </span>
                        ) : (
                          <span className="badge badge-pending" style={{ background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: '800' }}>
                            ⏳ Pending Review
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {!isApproved && (
                            <button
                              className="btn btn-success"
                              style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
                              onClick={() => handleApproveSingleCO(co.code)}
                            >
                              <CheckCircle2 size={13} /> Approve
                            </button>
                          )}
                          {!isRejected && (
                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
                              onClick={() => handleRejectSingleCO(co.code)}
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
                Course Action Taken Report (ATR) Review ({selectedReviewCourse?.code} - {selectedReviewCourse?.name})
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
              <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', fontSize: '12px', fontWeight: '800' }}>
                ✓ ATR VERIFIED & APPROVED BY PROGRAMME COORDINATOR
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {courseAtrData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                No Action Taken Report submitted for this course yet.
              </div>
            ) : (
              courseAtrData.map((atr) => (
                <div
                  key={atr.code}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    background: atr.pctAchieved < 100 ? '#fffafb' : '#f8fafc',
                    borderLeft: atr.pctAchieved < 100 ? '4px solid #e11d48' : '4px solid #10b981',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontWeight: '800', color: atr.pctAchieved < 100 ? '#e11d48' : '#0f172a', fontSize: '13.5px' }}>
                      {atr.code}: {atr.statement || atr.title}
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: atr.pctAchieved >= 100 ? '#dcfce7' : '#fee2e2',
                        color: atr.pctAchieved >= 100 ? '#15803d' : '#991b1b',
                        fontWeight: '800',
                        fontSize: '11.5px',
                      }}
                    >
                      Target: {atr.target?.toFixed(2)} | Actual: {atr.actual?.toFixed(2)} ({atr.pctAchieved?.toFixed(1)}% {atr.status})
                    </span>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <strong style={{ fontSize: '12px', color: '#334155' }}>Corrective Action Plans Submitted by Coordinator:</strong>
                    <ul style={{ margin: '6px 0 0', paddingLeft: '20px', fontSize: '12px', color: '#1e293b' }}>
                      {(atr.actions || []).map((act, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: ATTAINMENT REVIEW (CO, PO & PSO) ─────────────────────────── */}
      {activeReviewTab === 'attainment' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                Course Attainment & PO/PSO Mapping Review ({selectedReviewCourse?.code} - {selectedReviewCourse?.name})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Direct ({directW}%), Indirect ({indirectW}%), Overall CO Attainments ({overallCOAttainment}) and calculated PO/PSO mapping levels.
              </p>
            </div>
          </div>

          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>CO Code</th>
                <th>Course Outcome Statement</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Direct Att.</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Indirect Att.</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Overall CO</th>
                <th style={{ width: '80px', textAlign: 'center' }}>PO1</th>
                <th style={{ width: '80px', textAlign: 'center' }}>PO2</th>
                <th style={{ width: '80px', textAlign: 'center' }}>PSO1</th>
              </tr>
            </thead>
            <tbody>
              {courseCOs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No Course Outcomes defined yet for attainment review.
                  </td>
                </tr>
              ) : (
                courseCOs.map((co) => (
                  <tr key={co.code}>
                    <td style={{ fontWeight: '800', color: '#4f46e5', textAlign: 'center' }}>{co.code}</td>
                    <td style={{ fontSize: '12.5px', color: '#0f172a' }}>{co.statement}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>{directLevel.toFixed(2)}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>{indirectLevel.toFixed(2)}</td>
                    <td style={{ textAlign: 'center', fontWeight: '900', color: '#059669', background: '#f0fdf4' }}>
                      {overallCOAttainment}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>
                      {((2.7 * parseFloat(overallCOAttainment)) / 3).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>
                      {((2.5 * parseFloat(overallCOAttainment)) / 3).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#0284c7' }}>
                      {((2.7 * parseFloat(overallCOAttainment)) / 3).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
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
