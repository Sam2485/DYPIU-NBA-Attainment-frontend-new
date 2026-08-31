import { useState, useEffect, useMemo } from 'react';
import { Sliders, Save, CheckCircle2, Clock, ShieldCheck, Target, Layers, PieChart, Award, Zap, ChevronDown, AlertCircle, Lock, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { useAttainment } from '../../context/attainment';
import { useApproval } from '../../context/approval';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

// ── Style tokens ───────────────────────────────────────────────────────────
const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink = '#0f172a';
const muted = '#64748b';
const accent = '#4f46e5';
const configSignature = (config = {}) => JSON.stringify({
  directWeight: config.directWeight,
  indirectWeight: config.indirectWeight,
  directThreshold: config.directThreshold,
  directLevels: config.directLevels ?? [],
  indirectLevels: config.indirectLevels ?? [],
});

export default function AttainmentConfig({ hideHeader = false, readOnly = false, reviewCourseId = null, suppressPendingMessage = false }) {
  const { role, user } = useAuth();
  const {
    academicYear,
    programmeId,
    selectedProgramme,
    selectedCourse,
    selectedCourseOffering,
    courseOfferingId,
    batchId,
    courseOfferings = [],
    selectCourseOffering = () => {},
    loadAssignedCourseOfferings = () => Promise.resolve([]),
    availableCourses = [],
    attainmentConfigs = {},
    updateCourseAttainmentConfig,
    activePOs = [],
    activePSOs = [],
    poPsoTargets = {},
    updatePoPsoTargets,
    courseVerificationStore = {},
    updateCourseVerificationStatus = () => {},
    loadProgrammeBatchCourseApprovalStatus = () => Promise.resolve(null),
  } = useAcademic();
  const {
    attainmentConfigs: apiConfig = null,
    loadAttainmentConfig = () => Promise.resolve(null),
    updateCourseAttainmentConfig: saveApiConfig = () => Promise.resolve(null),
  } = useAttainment();
  const { submitApproval = () => Promise.resolve(null) } = useApproval();

  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';
  const programmeBatchCourseId = reviewCourseId ?? selectedCourseOffering?.programmeBatchCourseId ?? courseOfferingId ?? null;
  const safePoPsoTargets = poPsoTargets ?? {};
  const safeAttainmentConfigs = attainmentConfigs ?? {};
  const safeVerificationStore = courseVerificationStore ?? {};
  const assignedOfferings = useMemo(
    () => courseOfferings.filter((offering) => String(offering.batchId ?? offering.programmeBatchId) === String(batchId)),
    [batchId, courseOfferings],
  );

  const courseList = availableCourses.length > 0 ? availableCourses : [
    { id: 'crs-1', code: '310244', name: 'Computer Network and Security' },
    { id: 'crs-2', code: 'CS301', name: 'Data Structures & Algorithms' },
  ];

  const [activeCourseId, setActiveCourseId] = useState(programmeBatchCourseId || selectedCourse?.id || 'crs-1');

  useEffect(() => {
    const targetId = (isCourseCoordinator || reviewCourseId)
      ? programmeBatchCourseId
      : selectedCourse?.id;
    if (targetId) {
      setActiveCourseId(targetId);
    }
  }, [isCourseCoordinator, programmeBatchCourseId, reviewCourseId, selectedCourse]);

  useEffect(() => {
    if (!isCourseCoordinator || !user?.email || !batchId) return;
    loadAssignedCourseOfferings(user, batchId).then((offerings) => {
      const selectedId = selectedCourseOffering?.id;
      const selectedStillAssigned = (offerings ?? []).some((offering) => offering.id === selectedId);
      if (!selectedStillAssigned && offerings?.[0]) selectCourseOffering(offerings[0]);
    }).catch(() => {});
  }, [batchId, isCourseCoordinator, loadAssignedCourseOfferings, selectCourseOffering, selectedCourseOffering?.id, user]);

  // Step 5: PO & PSO Target Levels state for active Programme (Scale 1.0 - 3.0)
  const currentProgTargets = (programmeId && safePoPsoTargets[programmeId]) || {
    poTargets: {},
    psoTargets: {},
  };

  const [localPoTargets, setLocalPoTargets] = useState(currentProgTargets.poTargets || {});
  const [localPsoTargets, setLocalPsoTargets] = useState(currentProgTargets.psoTargets || {});

  useEffect(() => {
    if (safePoPsoTargets[programmeId]) {
      setLocalPoTargets(safePoPsoTargets[programmeId].poTargets || {});
      setLocalPsoTargets(safePoPsoTargets[programmeId].psoTargets || {});
    }
  }, [programmeId, safePoPsoTargets]);

  const handleSavePoPsoTargets = () => {
    updatePoPsoTargets(programmeId, localPoTargets, localPsoTargets);
    alert(`Target Attainment Levels for ${selectedProgramme?.code} saved successfully!`);
  };

  // Attainment Configuration Store (Direct/Indirect weights, Threshold, Direct/Indirect Level 1-3 Bands)
  const defaultConfig = {
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
  const [localCourseConfig, setLocalCourseConfig] = useState(defaultConfig);
  const [isSubmittingForReview, setIsSubmittingForReview] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [savedConfigSignature, setSavedConfigSignature] = useState(null);

  useEffect(() => {
    if ((isCourseCoordinator || reviewCourseId) && programmeBatchCourseId) {
      loadAttainmentConfig(programmeBatchCourseId).catch(() => {});
      loadProgrammeBatchCourseApprovalStatus(programmeBatchCourseId).catch(() => {});
    }
  }, [isCourseCoordinator, loadAttainmentConfig, loadProgrammeBatchCourseApprovalStatus, programmeBatchCourseId, reviewCourseId]);

  useEffect(() => {
    // Approval reviews use the same API response as the Course Coordinator
    // screen, but are rendered read-only. They must still populate the local
    // display state instead of falling back to default values.
    if (!isCourseCoordinator && !reviewCourseId) return;
    const config = apiConfig || defaultConfig;
    setLocalCourseConfig(config);
    setSavedConfigSignature(apiConfig ? configSignature(config) : null);
  }, [apiConfig, isCourseCoordinator, programmeBatchCourseId, reviewCourseId]);

  const currentConfig = (isCourseCoordinator || reviewCourseId)
    ? localCourseConfig
    : safeAttainmentConfigs[activeCourseId] || defaultConfig;

  const handleDirectWeightChange = (val) => {
    const direct = Math.min(100, Math.max(0, Number(val)));
    const updated = {
      ...currentConfig,
      directWeight: direct,
      indirectWeight: 100 - direct,
      status: 'DRAFT',
      proposedBy: user?.name || 'Course Coordinator',
      proposedAt: new Date().toISOString().split('T')[0],
    };
    if (isCourseCoordinator) setLocalCourseConfig(updated);
    else updateCourseAttainmentConfig(activeCourseId, updated);
  };

  const handleThresholdChange = (val) => {
    const threshold = Number(val);
    const updated = {
      ...currentConfig,
      directThreshold: threshold,
      status: 'DRAFT',
      proposedBy: user?.name || 'Course Coordinator',
      proposedAt: new Date().toISOString().split('T')[0],
    };
    if (isCourseCoordinator) setLocalCourseConfig(updated);
    else updateCourseAttainmentConfig(activeCourseId, updated);
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
      status: 'DRAFT',
      proposedBy: user?.name || 'Course Coordinator',
      proposedAt: new Date().toISOString().split('T')[0],
    };
    if (isCourseCoordinator) setLocalCourseConfig(updated);
    else updateCourseAttainmentConfig(activeCourseId, updated);
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
      status: 'DRAFT',
      proposedBy: user?.name || 'Course Coordinator',
      proposedAt: new Date().toISOString().split('T')[0],
    };
    if (isCourseCoordinator) setLocalCourseConfig(updated);
    else updateCourseAttainmentConfig(activeCourseId, updated);
  };

  const handleVerifyConfig = (cId) => {
    const targetConfig = safeAttainmentConfigs[cId] || currentConfig;
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

  const workspaceConfigStatus = safeVerificationStore[activeCourseId]?.configStatus;
  const currentVerificationStatus = workspaceConfigStatus && workspaceConfigStatus !== 'DRAFT'
    ? workspaceConfigStatus
    : (currentConfig.status || 'DRAFT');
  const isApproved = currentVerificationStatus === 'VERIFIED' || currentVerificationStatus === 'APPROVED';
  const isPendingReview = ['PENDING', 'SUBMITTED', 'PENDING_APPROVAL', 'SUBMITTED_FOR_VERIFICATION'].includes(currentVerificationStatus);
  const isLocked = readOnly || isApproved || isPendingReview;
  const isConfigSaved = savedConfigSignature !== null && savedConfigSignature === configSignature(currentConfig);

  const handleSaveConfig = async () => {
    if (isCourseCoordinator) {
      if (!programmeBatchCourseId || isSavingConfig || isConfigSaved) {
        if (!programmeBatchCourseId) alert('Select an assigned programme-batch course in the sidebar first.');
        return;
      }
      try {
        setIsSavingConfig(true);
        const saved = await saveApiConfig({ ...currentConfig, programmeBatchCourseId }, programmeBatchCourseId);
        const savedConfig = saved || currentConfig;
        setLocalCourseConfig(savedConfig);
        setSavedConfigSignature(configSignature(savedConfig));
        alert('Attainment settings saved successfully.');
      } catch (error) {
        console.error('Failed to save attainment settings:', error);
        alert('Unable to save attainment settings. Please try again.');
      } finally {
        setIsSavingConfig(false);
      }
      return;
    }
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

  const handleSubmitForReview = async () => {
    if (!programmeBatchCourseId) {
      alert('Select an assigned programme-batch course in the sidebar first.');
      return;
    }

    try {
      setIsSubmittingForReview(true);

      // Persist the current form before requesting Programme Coordinator
      // review, so the approval always refers to the saved configuration.
      const saved = await saveApiConfig(
        { ...currentConfig, programmeBatchCourseId },
        programmeBatchCourseId,
      );
      const config = saved || currentConfig;
      setSavedConfigSignature(configSignature(config));

      await submitApproval({
        courseOfferingId: programmeBatchCourseId,
        type: 'ATTAINMENT_CONFIGURATION',
        title: `Attainment Configuration for ${config.courseName || selectedCourseOffering?.courseName || selectedCourse?.name || 'Course'}`,
        programmeBatchCourseId,
        resourceId: programmeBatchCourseId,
      });

      setLocalCourseConfig({ ...config, status: 'SUBMITTED' });
      alert('Attainment settings submitted for Programme Coordinator review.');
    } catch (error) {
      console.error('Failed to submit attainment settings for review:', error);
      alert('Unable to submit attainment settings for review. Please try again.');
    } finally {
      setIsSubmittingForReview(false);
    }
  };

  return (
    <div className="animated-page">
      {/* Standard Header Banner */}
      {!hideHeader && <div className="banner-dark-gradient" style={{ marginBottom: '20px' }}>
        <div className="banner-content-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Attainment Settings
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {isCourseCoordinator && <select
              value={selectedCourseOffering?.id ?? ''}
              onChange={(event) => {
                const offering = assignedOfferings.find((item) => String(item.id) === event.target.value);
                if (offering) selectCourseOffering(offering);
              }}
              disabled={!batchId || assignedOfferings.length === 0}
              style={{ height: '38px', minWidth: '270px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', background: '#ffffff', fontWeight: 700, fontFamily: 'inherit' }}
            >
              {assignedOfferings.length === 0 ? <option value="">No assigned courses for this programme batch</option> : assignedOfferings.map((offering) => <option key={offering.id} value={offering.id}>{offering.courseCode ?? offering.code ?? 'Course'} — {offering.courseName ?? offering.name ?? 'Programme-Batch Course'} · Sem {offering.semester ?? '—'}</option>)}
            </select>}
            {/* Course Selector Dropdown */}
            {!isCourseCoordinator && <div style={{ position: 'relative' }}>
              <select
                value={activeCourseId}
                onChange={(e) => setActiveCourseId(e.target.value)}
                style={{
                  height: '38px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#4f46e5',
                  border: '1.5px solid #c7d2fe',
                  borderRadius: '8px',
                  padding: '0 34px 0 14px',
                  background: '#f5f3ff',
                  minWidth: '250px',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                {courseList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#4f46e5',
                  pointerEvents: 'none',
                }}
              />
            </div>}

            {!isLocked ? (
              isCourseCoordinator ? (
                <>
                  <button className="btn btn-primary" onClick={handleSaveConfig} disabled={isSavingConfig || isConfigSaved} style={{ height: '38px', opacity: isSavingConfig || isConfigSaved ? 0.6 : 1, cursor: isSavingConfig || isConfigSaved ? 'not-allowed' : 'pointer' }}>
                    <Save size={15} /> {isSavingConfig ? 'Saving…' : isConfigSaved ? 'Saved' : 'Save Attainment Settings'}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmitForReview}
                    disabled={isSubmittingForReview || isSavingConfig || isPendingReview}
                    style={{ height: '38px', background: '#ffffff', color: '#2563eb', border: '1px solid #2563eb', opacity: isSubmittingForReview || isSavingConfig || isPendingReview ? 0.5 : 1, cursor: isSubmittingForReview || isSavingConfig || isPendingReview ? 'not-allowed' : 'pointer' }}
                  >
                    <Send size={15} /> {isSubmittingForReview ? 'Submitting…' : isPendingReview ? 'Submitted' : 'Submit for Review'}
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={handleSaveConfig} style={{ height: '38px' }}>
                  <Save size={15} /> {!isCoordinator ? 'Submit Configuration Proposal for Review' : 'Save Attainment Configurations'}
                </button>
              )
            ) : (
              <span style={{ height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={13} /> {isApproved ? 'Settings Locked' : 'Submitted — Pending Review'}
              </span>
            )}
          </div>
        </div>
      </div>}

      {/* Verification / Rejection Status Banner */}
      {isApproved && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#15803d' }}>
              ✓ Approved & Locked by Programme Coordinator
            </span>
            <span style={{ fontSize: '12px', color: '#166534', display: 'block', marginTop: '2px' }}>
              Attainment configuration has been verified and approved by {safeVerificationStore[activeCourseId]?.configReviewer || currentConfig.reviewedBy || 'Programme Coordinator'}. Settings are now locked.
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
              <strong>Remarks Forwarded:</strong> "{safeVerificationStore[activeCourseId]?.configRemarks || currentConfig.revisionReason || 'Please review threshold settings and revise target parameters before resubmission.'}"
            </span>
          </div>
        </div>
      )}

      {!suppressPendingMessage && isPendingReview && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
          <div><span style={{ fontSize: '13.5px', fontWeight: '800', color: '#92400e' }}>Submitted — Pending Programme Coordinator Review</span><span style={{ fontSize: '12px', color: '#b45309', display: 'block', marginTop: '2px' }}>Attainment settings are awaiting review by the Programme Coordinator.</span></div>
        </div>
      )}

      {/* Active Course Attainment Configuration Settings */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
              Course Attainment Settings ({currentConfig.courseCode} - {currentConfig.courseName})
            </h3>
          </div>

          {isApproved ? (
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

        {/* ── ENHANCED FORM FIELDS FOR WEIGHTAGES AND THRESHOLD ────────────────── */}
        <div className="grid-cards-2" style={{ gap: '20px', marginBottom: '24px' }}>
          {/* Direct & Indirect Assessment Weightage Field */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={16} style={{ color: '#4f46e5' }} />
                  <label style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Direct Assessment Weightage (%)
                  </label>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '6px' }}>
                  Direct : Indirect Split
                </span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '11.5px', color: '#64748b' }}>
                Proportion of final CO attainment derived from Direct Examination vs. Indirect Course Exit Survey.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', background: isApproved ? '#f1f5f9' : '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    className="form-input"
                    value={currentConfig.directWeight}
                    onChange={(e) => handleDirectWeightChange(e.target.value)}
                    disabled={isLocked}
                    min="0"
                    max="100"
                    style={{ width: '84px', fontWeight: '900', fontSize: '16px', color: '#4f46e5', textAlign: 'center', padding: '6px 10px', border: '1.5px solid #c7d2fe', borderRadius: '8px', background: isApproved ? '#f8fafc' : '#ffffff', cursor: isApproved ? 'not-allowed' : 'text' }}
                  />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>% Direct Weight</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0284c7' }}>
                    {currentConfig.indirectWeight !== undefined ? currentConfig.indirectWeight : (100 - currentConfig.directWeight)}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Indirect Weight</div>
                </div>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: '#e2e8f0' }}>
              <div style={{ width: `${currentConfig.directWeight}%`, background: '#4f46e5', transition: 'width 0.3s' }} title={`Direct: ${currentConfig.directWeight}%`} />
              <div style={{ width: `${100 - currentConfig.directWeight}%`, background: '#38bdf8', transition: 'width 0.3s' }} title={`Indirect: ${100 - currentConfig.directWeight}%`} />
            </div>
          </div>

          {/* Direct Exam Threshold Marks Field */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={16} style={{ color: '#059669' }} />
                  <label style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Direct Exam Threshold Marks (%)
                  </label>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: '6px' }}>
                  Benchmark Criteria
                </span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '11.5px', color: '#64748b' }}>
                Minimum % score in direct assessments required for a student to be counted towards CO target attainment.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', background: isApproved ? '#f1f5f9' : '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    className="form-input"
                    value={currentConfig.directThreshold}
                    onChange={(e) => handleThresholdChange(e.target.value)}
                    disabled={isLocked}
                    min="0"
                    max="100"
                    style={{ width: '84px', fontWeight: '900', fontSize: '16px', color: '#059669', textAlign: 'center', padding: '6px 10px', border: '1.5px solid #a7f3d0', borderRadius: '8px', background: isApproved ? '#f8fafc' : '#ffffff', cursor: isApproved ? 'not-allowed' : 'text' }}
                  />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>% Threshold Marks</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                  Standard NBA: 60%
                </span>
              </div>
            </div>

            <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
              Students scoring <strong style={{ color: '#059669' }}>≥ {currentConfig.directThreshold}%</strong> marks are marked as having achieved CO competency.
            </div>
          </div>
        </div>

        {/* ── DYNAMIC EDITABLE MIN-MAX LEVEL 1-3 MAPPING BANDS TABLES ─────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Direct Assessment Level 1-3 Percentage Bands Table */}
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} style={{ color: accent }} />
                <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>Direct Assessment Level Percentage Bands (Configured by Course Coordinator)</span>
              </div>
              <span style={{ fontSize: '11.5px', color: muted, fontWeight: '600' }}>
                Specify Min % &amp; Max % benchmark for each attainment level
              </span>
            </div>

            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="audit-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px', textAlign: 'center' }}>Level</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Min % Marks</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Max % Marks</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Attainment Score</th>
                    <th>Description / Target Standard</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentConfig.directLevels || []).map((lvl, index) => (
                    <tr key={lvl.level}>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: accent }}>
                        Level {lvl.level}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={isLocked}
                            value={lvl.minPercentage}
                            onChange={(e) => handleDirectLevelChange(index, 'minPercentage', e.target.value)}
                            className="form-input"
                            style={{ width: '70px', padding: '4px 8px', fontSize: '13px', fontWeight: '800', textAlign: 'center', border: '1px solid #c7d2fe', borderRadius: '6px', background: isApproved ? '#f8fafc' : '#ffffff', cursor: isApproved ? 'not-allowed' : 'text' }}
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
                            disabled={isLocked}
                            value={lvl.maxPercentage}
                            onChange={(e) => handleDirectLevelChange(index, 'maxPercentage', e.target.value)}
                            className="form-input"
                            style={{ width: '70px', padding: '4px 8px', fontSize: '13px', fontWeight: '800', textAlign: 'center', border: '1px solid #c7d2fe', borderRadius: '6px', background: isApproved ? '#f8fafc' : '#ffffff', cursor: isApproved ? 'not-allowed' : 'text' }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: '800', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', display: 'inline-block' }}>
                          {lvl.level}.0 / 3.0
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: muted, fontWeight: '500' }}>
                        {lvl.level === 1 ? 'Low Direct Attainment (Students scoring within minimum threshold)' : lvl.level === 2 ? 'Moderate Direct Attainment (Students scoring within target threshold)' : 'High Direct Attainment (Students exceeding target benchmark)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Indirect Assessment Level 1-3 Percentage Bands Table */}
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} style={{ color: '#0284c7' }} />
                <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>Indirect Assessment Level Percentage Bands (Configured by Course Coordinator)</span>
              </div>
              <span style={{ fontSize: '11.5px', color: muted, fontWeight: '600' }}>
                Specify Min % &amp; Max % benchmark for indirect survey feedback
              </span>
            </div>

            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="audit-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px', textAlign: 'center' }}>Level</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Min % Survey Rating</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Max % Survey Rating</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Attainment Score</th>
                    <th>Description / Survey Standard</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentConfig.indirectLevels || []).map((lvl, index) => (
                    <tr key={lvl.level}>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: '#0284c7' }}>
                        Level {lvl.level}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={isLocked}
                            value={lvl.minPercentage}
                            onChange={(e) => handleIndirectLevelChange(index, 'minPercentage', e.target.value)}
                            className="form-input"
                            style={{ width: '70px', padding: '4px 8px', fontSize: '13px', fontWeight: '800', textAlign: 'center', border: '1px solid #7dd3fc', borderRadius: '6px', background: isApproved ? '#f8fafc' : '#ffffff', cursor: isApproved ? 'not-allowed' : 'text' }}
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
                            disabled={isLocked}
                            value={lvl.maxPercentage}
                            onChange={(e) => handleIndirectLevelChange(index, 'maxPercentage', e.target.value)}
                            className="form-input"
                            style={{ width: '70px', padding: '4px 8px', fontSize: '13px', fontWeight: '800', textAlign: 'center', border: '1px solid #7dd3fc', borderRadius: '6px', background: isApproved ? '#f8fafc' : '#ffffff', cursor: isApproved ? 'not-allowed' : 'text' }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: '800', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', display: 'inline-block' }}>
                          {lvl.level}.0 / 3.0
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: muted, fontWeight: '500' }}>
                        {lvl.level === 1 ? 'Low Indirect Rating (Below 50% positive survey feedback)' : lvl.level === 2 ? 'Moderate Indirect Rating (50% to 70% positive survey feedback)' : 'High Indirect Rating (Above 70% positive survey feedback)'}
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
