import { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, Clock, ShieldCheck, Target, Layers, PieChart, Award, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function AttainmentConfig() {
  const { role, user } = useAuth();
  const {
    academicYear,
    programmeId,
    selectedProgramme,
    selectedCourse,
    availableCourses = [],
    attainmentConfigs = {},
    updateCourseAttainmentConfig,
    activePOs = [],
    activePSOs = [],
    poPsoTargets = {},
    updatePoPsoTargets,
    courseVerificationStore = {},
    updateCourseVerificationStatus = () => {},
  } = useAcademic();

  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR';

  const courseList = availableCourses.length > 0 ? availableCourses : [
    { id: 'crs-1', code: '310244', name: 'Computer Network and Security' },
    { id: 'crs-2', code: 'CS301', name: 'Data Structures & Algorithms' },
  ];

  const [activeCourseId, setActiveCourseId] = useState(selectedCourse?.id || 'crs-1');

  useEffect(() => {
    if (selectedCourse?.id) {
      setActiveCourseId(selectedCourse.id);
    }
  }, [selectedCourse]);

  // Step 5: PO & PSO Target Levels state for active Programme (Scale 1.0 - 3.0)
  const currentProgTargets = poPsoTargets[programmeId] || {
    poTargets: { PO1: 2.50, PO2: 2.50, PO3: 2.20, PO4: 2.20, PO5: 2.00, PO6: 2.00, PO7: 2.00, PO8: 2.50, PO9: 2.50, PO10: 2.50, PO11: 2.00, PO12: 2.00 },
    psoTargets: { PSO1: 2.50, PSO2: 2.20, PSO3: 2.00 },
  };

  const [localPoTargets, setLocalPoTargets] = useState(currentProgTargets.poTargets || {});
  const [localPsoTargets, setLocalPsoTargets] = useState(currentProgTargets.psoTargets || {});

  useEffect(() => {
    if (poPsoTargets[programmeId]) {
      setLocalPoTargets(poPsoTargets[programmeId].poTargets || {});
      setLocalPsoTargets(poPsoTargets[programmeId].psoTargets || {});
    }
  }, [programmeId, poPsoTargets]);

  const handleSavePoPsoTargets = () => {
    updatePoPsoTargets(programmeId, localPoTargets, localPsoTargets);
    alert(`Target Attainment Levels for ${selectedProgramme?.code} saved successfully!`);
  };

  // Attainment Configuration Store (Direct/Indirect weights, Threshold, Direct/Indirect Level 1-3 Bands)
  const currentConfig = attainmentConfigs[activeCourseId] || {
    courseCode: selectedCourse?.code || '310244',
    courseName: selectedCourse?.name || 'Course Title',
    directWeight: 80,
    indirectWeight: 20,
    directThreshold: 60,
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
    status: 'DRAFT',
  };

  const handleDirectWeightChange = (val) => {
    const direct = Math.min(100, Math.max(0, Number(val)));
    const updated = {
      ...currentConfig,
      directWeight: direct,
      indirectWeight: 100 - direct,
      status: 'SUBMITTED',
      proposedBy: user?.name || 'Course Coordinator',
      proposedAt: new Date().toISOString().split('T')[0],
    };
    updateCourseAttainmentConfig(activeCourseId, updated);
  };

  const handleThresholdChange = (val) => {
    const threshold = Number(val);
    const updated = {
      ...currentConfig,
      directThreshold: threshold,
      status: 'SUBMITTED',
      proposedBy: user?.name || 'Course Coordinator',
      proposedAt: new Date().toISOString().split('T')[0],
    };
    updateCourseAttainmentConfig(activeCourseId, updated);
  };

  const handleDirectLevelChange = (levelIndex, field, val) => {
    const numVal = Math.min(100, Math.max(0, Number(val)));
    const updatedLevels = (currentConfig.directLevels || []).map((lvl, idx) => {
      if (idx === levelIndex) {
        return { ...lvl, [field]: numVal };
      }
      return lvl;
    });
    const updated = {
      ...currentConfig,
      directLevels: updatedLevels,
      status: 'SUBMITTED',
      proposedBy: user?.name || 'Course Coordinator',
      proposedAt: new Date().toISOString().split('T')[0],
    };
    updateCourseAttainmentConfig(activeCourseId, updated);
  };

  const handleIndirectLevelChange = (levelIndex, field, val) => {
    const numVal = Math.min(100, Math.max(0, Number(val)));
    const updatedLevels = (currentConfig.indirectLevels || []).map((lvl, idx) => {
      if (idx === levelIndex) {
        return { ...lvl, [field]: numVal };
      }
      return lvl;
    });
    const updated = {
      ...currentConfig,
      indirectLevels: updatedLevels,
      status: 'SUBMITTED',
      proposedBy: user?.name || 'Course Coordinator',
      proposedAt: new Date().toISOString().split('T')[0],
    };
    updateCourseAttainmentConfig(activeCourseId, updated);
  };

  const handleVerifyConfig = (cId) => {
    const targetConfig = attainmentConfigs[cId] || currentConfig;
    const updated = {
      ...targetConfig,
      status: 'VERIFIED',
      verifiedBy: user?.name || 'Programme Coordinator',
      verifiedAt: new Date().toISOString().split('T')[0],
    };
    updateCourseAttainmentConfig(cId, updated);
    updateCourseVerificationStatus(cId, 'configStatus', 'VERIFIED');
    alert(`Attainment configuration for ${targetConfig?.courseCode || 'course'} verified and approved by Programme Coordinator!`);
  };

  const currentVerificationStatus = courseVerificationStore[activeCourseId]?.configStatus || currentConfig.status || 'DRAFT';

  const handleSaveConfig = () => {
    const updatedConfig = {
      ...currentConfig,
      status: 'SUBMITTED',
      submittedBy: user?.name || 'Course Coordinator',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    updateCourseAttainmentConfig(activeCourseId, updatedConfig);
    updateCourseVerificationStatus(activeCourseId, 'configStatus', 'SUBMITTED');
    alert(`Attainment Configurations for ${currentConfig.courseCode || selectedCourse?.code || 'selected course'} submitted for Programme Coordinator review!`);
  };

  return (
    <div className="animated-page">
      {/* Standard Header Banner */}
      <div className="banner-dark-gradient">
        <div className="banner-content-row">
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Attainment Settings
            </h2>
          </div>

          <button className="btn btn-primary" onClick={handleSaveConfig}>
            <Save size={15} /> {!isCoordinator ? 'Submit Configuration Proposal for Review' : 'Save Attainment Configurations'}
          </button>
        </div>
      </div>

      {/* Verification / Rejection Status Banner */}
      {(currentVerificationStatus === 'VERIFIED' || currentVerificationStatus === 'APPROVED') && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#15803d' }}>
              ✓ Approved by Programme Coordinator
            </span>
            <span style={{ fontSize: '12px', color: '#166534', display: 'block', marginTop: '2px' }}>
              Attainment configuration has been verified and approved by {courseVerificationStore[activeCourseId]?.verifiedBy || 'Programme Coordinator'}.
            </span>
          </div>
        </div>
      )}

      {(currentVerificationStatus === 'REJECTED' || currentVerificationStatus === 'REVISION_REQUESTED' || currentVerificationStatus === 'NEEDS_REVISION') && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
          <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#991b1b' }}>
              ⚠️ Action Required — Sent Back for Revisions by Programme Coordinator
            </span>
            <span style={{ fontSize: '12.5px', color: '#b91c1c', display: 'block', marginTop: '3px', fontWeight: '600' }}>
              <strong>Remarks Forwarded:</strong> "{courseVerificationStore[activeCourseId]?.configRemarks || 'Please review threshold settings and revise target parameters before resubmission.'}"
            </span>
          </div>
        </div>
      )}

      {/* Course Selection Strip */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '16px',
        }}
      >
        {courseList.map((c) => {
          const cfg = attainmentConfigs[c.id] || {};
          const status = courseVerificationStore[c.id]?.configStatus || cfg.status;
          const isCurrent = c.id === activeCourseId;

          return (
            <button
              key={c.id}
              onClick={() => setActiveCourseId(c.id)}
              className={`btn ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '12px',
                padding: '8px 14px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>
                {c.code} - {c.name}
              </span>
              {status === 'VERIFIED' ? (
                <CheckCircle2 size={14} style={{ color: '#10b981' }} />
              ) : status === 'SUBMITTED' ? (
                <Clock size={14} style={{ color: '#f59e0b' }} />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Active Course Attainment Configuration Settings */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
              Course Attainment Settings ({currentConfig.courseCode} - {currentConfig.courseName})
            </h3>
          </div>

          {currentVerificationStatus === 'VERIFIED' ? (
            <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', fontSize: '12px', fontWeight: '800' }}>
              ✓ VERIFIED & APPROVED BY PROGRAMME COORDINATOR
            </span>
          ) : currentVerificationStatus === 'SUBMITTED' ? (
            <span className="badge badge-pending" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 14px', fontSize: '12px', fontWeight: '800' }}>
              ⏳ SUBMITTED FOR PROGRAMME COORDINATOR REVIEW
            </span>
          ) : (
            <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '6px 14px', fontSize: '12px', fontWeight: '700' }}>
              DRAFT CONFIGURATION
            </span>
          )}
        </div>

        {/* ── SIMPLE & SUBTLE FORM FIELDS FOR WEIGHTAGES AND THRESHOLD ────────────────── */}
        <div className="grid-cards-2" style={{ gap: '20px', marginBottom: '24px' }}>
          {/* Direct Weightage Field */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
              Direct Assessment Weightage (%)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                className="form-input"
                value={currentConfig.directWeight}
                onChange={(e) => handleDirectWeightChange(e.target.value)}
                min="0"
                max="100"
                style={{ width: '110px', fontWeight: '800', fontSize: '14px', color: '#4f46e5' }}
              />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>% Direct Weight</span>
            </div>
          </div>

          {/* Direct Exam Threshold Marks Field */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
              Direct Exam Threshold Marks (%)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                className="form-input"
                value={currentConfig.directThreshold}
                onChange={(e) => handleThresholdChange(e.target.value)}
                min="0"
                max="100"
                style={{ width: '110px', fontWeight: '800', fontSize: '14px', color: '#059669' }}
              />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>% Threshold Marks</span>
            </div>
          </div>
        </div>

        {/* ── DYNAMIC EDITABLE MIN-MAX LEVEL 1-3 MAPPING BANDS TABLES ─────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Direct Assessment Level 1-3 Percentage Bands Table */}
          <div style={{ border: '1.5px solid #6366f1', borderRadius: '12px', padding: '16px', background: '#faf5ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} style={{ color: '#4f46e5' }} />
                <h4 style={{ margin: 0, fontSize: '14.5px', color: '#3730a3', fontWeight: '800' }}>
                  Direct Assessment Attainment Level Bands (Levels 1 – 3)
                </h4>
              </div>
              <span style={{ fontSize: '11.5px', color: '#6366f1', fontWeight: '700' }}>
                Specify Min % & Max % threshold for each attainment level
              </span>
            </div>

            <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #e0e7ff' }}>
              <table className="audit-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px', textAlign: 'center' }}>Level</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Min % Benchmark</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Max % Benchmark</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Assigned Score</th>
                    <th>Attainment Description</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentConfig.directLevels || []).map((lvl, index) => (
                    <tr key={lvl.level}>
                      <td style={{ textAlign: 'center', fontWeight: '900', color: '#4f46e5' }}>
                        Level {lvl.level}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={lvl.minPercentage}
                            onChange={(e) => handleDirectLevelChange(index, 'minPercentage', e.target.value)}
                            className="form-input"
                            style={{ width: '70px', padding: '5px 8px', fontSize: '13px', fontWeight: '800', textAlign: 'center', border: '1px solid #c7d2fe' }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={lvl.maxPercentage}
                            onChange={(e) => handleDirectLevelChange(index, 'maxPercentage', e.target.value)}
                            className="form-input"
                            style={{ width: '70px', padding: '5px 8px', fontSize: '13px', fontWeight: '800', textAlign: 'center', border: '1px solid #c7d2fe' }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>%</span>
                        </div>
                      </td>
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

          {/* Indirect Assessment Level 1-3 Percentage Bands Table */}
          <div style={{ border: '1.5px solid #0284c7', borderRadius: '12px', padding: '16px', background: '#f0f9ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} style={{ color: '#0284c7' }} />
                <h4 style={{ margin: 0, fontSize: '14.5px', color: '#0369a1', fontWeight: '800' }}>
                  Indirect Assessment Attainment Level Bands (Levels 1 – 3)
                </h4>
              </div>
              <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: '700' }}>
                Specify Min % & Max % threshold for indirect survey feedback
              </span>
            </div>

            <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
              <table className="audit-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px', textAlign: 'center' }}>Level</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Min % Survey</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Max % Survey</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Assigned Score</th>
                    <th>Attainment Description</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentConfig.indirectLevels || []).map((lvl, index) => (
                    <tr key={lvl.level}>
                      <td style={{ textAlign: 'center', fontWeight: '900', color: '#0284c7' }}>
                        Level {lvl.level}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={lvl.minPercentage}
                            onChange={(e) => handleIndirectLevelChange(index, 'minPercentage', e.target.value)}
                            className="form-input"
                            style={{ width: '70px', padding: '5px 8px', fontSize: '13px', fontWeight: '800', textAlign: 'center', border: '1px solid #7dd3fc' }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={lvl.maxPercentage}
                            onChange={(e) => handleIndirectLevelChange(index, 'maxPercentage', e.target.value)}
                            className="form-input"
                            style={{ width: '70px', padding: '5px 8px', fontSize: '13px', fontWeight: '800', textAlign: 'center', border: '1px solid #7dd3fc' }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>%</span>
                        </div>
                      </td>
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
    </div>
  );
}
