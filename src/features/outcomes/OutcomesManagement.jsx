import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Target, FileSpreadsheet, Plus, Trash2, Save, CheckCircle2, Clock, XCircle, UserCheck, ShieldCheck, Send, Lock } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import RowButtons from '../../components/common/RowButtons';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';

const EMPTY_TARGETS = {};
const outcomeSignature = (outcomes = []) => JSON.stringify(outcomes.map((outcome) => ({
  code: String(outcome.code ?? '').trim(),
  statement: String(outcome.statement ?? '').trim(),
  targetLevel: Number(outcome.targetLevel ?? outcome.target ?? 2.5),
  bloomsLevel: outcome.bloomsLevel ?? 'UNDERSTAND',
})));

export default function OutcomesManagement({ hideFooter = false, hideHeader = false, readOnly = false, reviewCourseId = null, suppressPendingMessage = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStandalone = searchParams.get('mode') === 'standalone';

  const { role, user } = useAuth();
  const {
    programmeId,
    selectedProgramme,
    courses = [],
    availableCourses = [],
    setCourseId = () => {},
    courseId,
    selectedCourse,
    selectedCourseOffering,
    courseOfferingId,
    batchId,
    courseOfferings = [],
    selectCourseOffering = () => {},
    loadAssignedCourseOfferings = () => Promise.resolve([]),
    activePOs = [],
    activePSOs = [],
    activePEOs = [],
    activeCOs = [],
    updateProgrammePOs = () => {},
    updateProgrammePSOs = () => {},
    updateProgrammePEOs = () => {},
    loadCourseOutcomes = () => Promise.resolve([]),
    updateCourseCOs = () => {},
    coTargets = {},
    updateCourseCoTargets = () => {},
    courseVerificationStore = {},
    updateCourseVerificationStatus = () => {},
    submitCourseVerification = () => Promise.resolve(null),
    loadProgrammeBatchCourseApprovalStatus = () => Promise.resolve(null),
  } = useAcademic();

  const courseScope = selectedCourseOffering ?? selectedCourse;
  const targetCourseId = reviewCourseId || courseOfferingId || courseScope?.id || courseId || null;
  const safeCoTargets = coTargets ?? EMPTY_TARGETS;
  const workspaceCoStatus = courseVerificationStore[targetCourseId]?.coStatus;
  const directCoStatus = activeCOs[0]?.status ?? 'DRAFT';
  const currentCoVerificationStatus = workspaceCoStatus && workspaceCoStatus !== 'DRAFT'
    ? workspaceCoStatus
    : directCoStatus;
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';
  const assignedOfferings = useMemo(
    () => courseOfferings.filter((offering) => String(offering.batchId ?? offering.programmeBatchId) === String(batchId)),
    [batchId, courseOfferings],
  );

  useEffect(() => {
    if (!isStandalone || !isCourseCoordinator || !user?.email || !batchId) return;
    loadAssignedCourseOfferings(user, batchId).then((offerings) => {
      const selectedId = selectedCourseOffering?.id;
      const selectedStillAssigned = (offerings ?? []).some((offering) => offering.id === selectedId);
      if (!selectedStillAssigned && offerings?.[0]) selectCourseOffering(offerings[0]);
    }).catch(() => {});
  }, [batchId, isCourseCoordinator, isStandalone, loadAssignedCourseOfferings, selectCourseOffering, selectedCourseOffering?.id, user]);

  // The workflow loads this data from its Step 1 container. The sidebar's
  // standalone Add COs screen renders this component directly, so it must
  // load the exact same Programme-Batch-Course-scoped outcomes itself.
  useEffect(() => {
    if (targetCourseId) {
      loadCourseOutcomes(targetCourseId).catch(() => {});
    }
  }, [loadCourseOutcomes, targetCourseId]);

  useEffect(() => {
    if (targetCourseId) loadProgrammeBatchCourseApprovalStatus(targetCourseId).catch(() => {});
  }, [loadProgrammeBatchCourseApprovalStatus, targetCourseId]);

  const [localCoTargets, setLocalCoTargets] = useState({});
  const [savedOutcomeSignature, setSavedOutcomeSignature] = useState(null);
  const [isSavingOutcomes, setIsSavingOutcomes] = useState(false);
  const [isSubmittingForReview, setIsSubmittingForReview] = useState(false);
  const [isSubmittedForReview, setIsSubmittedForReview] = useState(false);

  useEffect(() => {
    if (targetCourseId && safeCoTargets[targetCourseId]) {
      setLocalCoTargets(safeCoTargets[targetCourseId]);
    }
  }, [targetCourseId, safeCoTargets]);

  const handleSaveCoTargets = () => {
    if (targetCourseId) {
      updateCourseCoTargets(targetCourseId, localCoTargets);
      alert(`CO Target Levels (1.00 - 3.00 scale) for ${courseScope?.courseCode || courseScope?.code || 'the selected offering'} saved successfully!`);
    }
  };

  const [entryMode, setEntryMode] = useState('table');

  const [activeOutcomeTab, setActiveOutcomeTab] = useState('cos');

  useEffect(() => {
    if (activeOutcomeTab !== 'cos') {
      setActiveOutcomeTab('cos');
    }
  }, [role, activeOutcomeTab]);

  // Multiple Teachers for Course
  const courseTeachers = courseScope?.faculty || 'Course Coordinator';

  // ── PEOs (Programme Educational Objectives - No Verification Required) ──────
  const [peoList, setPeoList] = useState(() => activePEOs || []);

  useEffect(() => {
    setPeoList(activePEOs || []);
  }, [programmeId, activePEOs]);

  const handleAddPEO = () => {
    const newNum = peoList.length + 1;
    const updated = [...peoList, { code: `PEO${newNum}`, statement: `New Programme Educational Objective ${newNum}...` }];
    setPeoList(updated);
    updateProgrammePEOs(programmeId, updated);
  };

  const handleUpdatePEOStatement = (index, newStatement) => {
    const updated = peoList.map((p, i) => (i === index ? { ...p, statement: newStatement } : p));
    setPeoList(updated);
    updateProgrammePEOs(programmeId, updated);
  };

  const handleDeletePEO = (index) => {
    const updated = peoList.filter((_, i) => i !== index);
    setPeoList(updated);
    updateProgrammePEOs(programmeId, updated);
  };

  // ── POs with Director Verification Status ────────────────────────────────────
  const [poList, setPoList] = useState(() => {
    return activePOs.map((po) => ({
      ...po,
      status: po.status || 'DRAFT',
      submittedBy: po.submittedBy || '',
      submittedAt: po.submittedAt || '',
    }));
  });

  // ── PSOs with Director Verification Status ───────────────────────────────────
  const [psoList, setPsoList] = useState(() => {
    return activePSOs.map((pso) => ({
      ...pso,
      status: pso.status || 'DRAFT',
      submittedBy: pso.submittedBy || '',
      submittedAt: pso.submittedAt || '',
    }));
  });

  // ── COs with Coordinator Approval Status ─────────────────────────────────────
  const [coList, setCoList] = useState(() => {
    return activeCOs.map((co) => ({
      ...co,
      status: co.status || (currentCoVerificationStatus === 'APPROVED' ? 'APPROVED' : 'DRAFT'),
      submittedBy: co.submittedBy || user?.name || 'Course Coordinator',
      submittedAt: co.submittedAt || '',
    }));
  });

  useEffect(() => {
    setPoList(
      activePOs.map((po) => ({
        ...po,
        status: po.status || 'DRAFT',
        submittedBy: po.submittedBy || '',
        submittedAt: po.submittedAt || '',
      }))
    );
  }, [programmeId, activePOs]);

  useEffect(() => {
    setPsoList(
      activePSOs.map((pso) => ({
        ...pso,
        status: pso.status || 'DRAFT',
        submittedBy: pso.submittedBy || '',
        submittedAt: pso.submittedAt || '',
      }))
    );
  }, [programmeId, activePSOs]);

  useEffect(() => {
    const targetData = courseVerificationStore[targetCourseId] || {};
    const globalStatus = targetData.coStatus || currentCoVerificationStatus || 'DRAFT';
    const courseTargets = safeCoTargets[targetCourseId] || {};

    setCoList(
      activeCOs.map((co) => {
        const computedStatus =
          globalStatus === 'APPROVED' || globalStatus === 'VERIFIED'
            ? 'APPROVED'
            : globalStatus === 'REJECTED' || globalStatus === 'REVISION_REQUESTED'
            ? 'REJECTED'
            : globalStatus === 'SUBMITTED' || globalStatus === 'PENDING_APPROVAL' || globalStatus === 'WAITING_FOR_APPROVAL'
            ? 'SUBMITTED'
            : co.status || 'DRAFT';

        const tVal =
          co.targetLevel !== undefined
            ? co.targetLevel
            : courseTargets[co.code] !== undefined
            ? courseTargets[co.code]
            : co.target !== undefined
            ? co.target
            : 2.5;

        return {
          ...co,
          targetLevel: tVal,
          target: tVal,
          status: computedStatus,
          submittedBy: co.submittedBy || user?.name || 'Course Coordinator',
          submittedAt: co.submittedAt || '2026-08-04',
        };
      })
    );
    setSavedOutcomeSignature(outcomeSignature(activeCOs));
  }, [targetCourseId, selectedCourse, activeCOs, currentCoVerificationStatus, courseVerificationStore, safeCoTargets]);

  // ── PO Handlers (Programme Coordinator Proposes -> Director Verifies) ─────────
  const handleAddPO = () => {
    const newPoNum = poList.length + 1;
    const newPo = {
      code: `PO${newPoNum}`,
      statement: `New proposed Programme Outcome ${newPoNum} Statement...`,
      status: role === 'DIRECTOR' || role === 'IQAC' ? 'VERIFIED' : 'WAITING_FOR_DIRECTOR_VERIFICATION',
      submittedBy: user?.name || 'Programme Coordinator',
      submittedAt: new Date().toISOString().split('T')[0],
      competencies: [
        { id: `comp-${newPoNum}-1`, order: 1, statement: `Demonstrate competence statement 1 for PO${newPoNum}` },
      ],
    };
    const updated = [...poList, newPo];
    setPoList(updated);
    updateProgrammePOs(programmeId, updated);
  };

  const handleUpdatePOCode = (index, newCode) => {
    const updated = poList.map((p, i) =>
      i === index
        ? { ...p, code: newCode, status: role === 'PROGRAMME_COORDINATOR' ? 'WAITING_FOR_DIRECTOR_VERIFICATION' : p.status }
        : p
    );
    setPoList(updated);
    updateProgrammePOs(programmeId, updated);
  };

  const handleUpdatePOStatement = (index, newStatement) => {
    const updated = poList.map((p, i) =>
      i === index
        ? { ...p, statement: newStatement, status: role === 'PROGRAMME_COORDINATOR' ? 'WAITING_FOR_DIRECTOR_VERIFICATION' : p.status }
        : p
    );
    setPoList(updated);
    updateProgrammePOs(programmeId, updated);
  };

  const handleVerifyPO = (index) => {
    const updated = poList.map((p, i) => (i === index ? { ...p, status: 'VERIFIED' } : p));
    setPoList(updated);
    updateProgrammePOs(programmeId, updated);
    alert(`PO ${poList[index].code} VERIFIED by Director!`);
  };

  const handleRejectPO = (index) => {
    const updated = poList.map((p, i) => (i === index ? { ...p, status: 'REJECTED' } : p));
    setPoList(updated);
    updateProgrammePOs(programmeId, updated);
    alert(`PO ${poList[index].code} rejected and sent back to Coordinator for revision.`);
  };

  const handleDeletePO = (index) => {
    const updated = poList.filter((_, i) => i !== index);
    setPoList(updated);
    updateProgrammePOs(programmeId, updated);
  };

  const handleAddPOCompetency = (poIndex) => {
    const updated = poList.map((p, i) => {
      if (i === poIndex) {
        const comps = p.competencies || [];
        const nextOrder = comps.length + 1;
        const newComp = {
          id: `comp-${p.code}-${nextOrder}`,
          order: nextOrder,
          statement: `Demonstrate competency statement ${nextOrder} for ${p.code}`,
        };
        return {
          ...p,
          competencies: [...comps, newComp],
          status: role === 'PROGRAMME_COORDINATOR' ? 'WAITING_FOR_DIRECTOR_VERIFICATION' : p.status,
        };
      }
      return p;
    });
    setPoList(updated);
    updateProgrammePOs(programmeId, updated);
  };

  const handleUpdatePOCompetencyStatement = (poIndex, compIndex, statement) => {
    const updated = poList.map((p, i) => {
      if (i === poIndex) {
        const comps = [...(p.competencies || [])];
        comps[compIndex] = { ...comps[compIndex], statement };
        return {
          ...p,
          competencies: comps,
          status: role === 'PROGRAMME_COORDINATOR' ? 'WAITING_FOR_DIRECTOR_VERIFICATION' : p.status,
        };
      }
      return p;
    });
    setPoList(updated);
    updateProgrammePOs(programmeId, updated);
  };

  const handleDeletePOCompetency = (poIndex, compIndex) => {
    const updated = poList.map((p, i) => {
      if (i === poIndex) {
        const comps = (p.competencies || []).filter((_, ci) => ci !== compIndex);
        return { ...p, competencies: comps.map((c, idx) => ({ ...c, order: idx + 1 })) };
      }
      return p;
    });
    setPoList(updated);
    updateProgrammePOs(programmeId, updated);
  };

  // ── PSO Handlers (Programme Coordinator Proposes -> Director Verifies) ────────
  const handleAddPSO = () => {
    const newPsoNum = psoList.length + 1;
    const newPso = {
      code: `PSO${newPsoNum}`,
      statement: `New proposed Programme Specific Outcome ${newPsoNum} Statement...`,
      status: role === 'DIRECTOR' || role === 'IQAC' ? 'VERIFIED' : 'WAITING_FOR_DIRECTOR_VERIFICATION',
      submittedBy: user?.name || 'Programme Coordinator',
      submittedAt: new Date().toISOString().split('T')[0],
      competencies: [
        { id: `psocomp-${newPsoNum}-1`, order: 1, statement: `Demonstrate competence statement for PSO${newPsoNum}` },
      ],
    };
    const updated = [...psoList, newPso];
    setPsoList(updated);
    updateProgrammePSOs(programmeId, updated);
  };

  const handleUpdatePSOCode = (index, newCode) => {
    const updated = psoList.map((p, i) =>
      i === index
        ? { ...p, code: newCode, status: role === 'PROGRAMME_COORDINATOR' ? 'WAITING_FOR_DIRECTOR_VERIFICATION' : p.status }
        : p
    );
    setPsoList(updated);
    updateProgrammePSOs(programmeId, updated);
  };

  const handleUpdatePSOStatement = (index, newStatement) => {
    const updated = psoList.map((p, i) =>
      i === index
        ? { ...p, statement: newStatement, status: role === 'PROGRAMME_COORDINATOR' ? 'WAITING_FOR_DIRECTOR_VERIFICATION' : p.status }
        : p
    );
    setPsoList(updated);
    updateProgrammePSOs(programmeId, updated);
  };

  const handleVerifyPSO = (index) => {
    const updated = psoList.map((p, i) => (i === index ? { ...p, status: 'VERIFIED' } : p));
    setPsoList(updated);
    updateProgrammePSOs(programmeId, updated);
    alert(`PSO ${psoList[index].code} VERIFIED by Director!`);
  };

  const handleRejectPSO = (index) => {
    const updated = psoList.map((p, i) => (i === index ? { ...p, status: 'REJECTED' } : p));
    setPsoList(updated);
    updateProgrammePSOs(programmeId, updated);
    alert(`PSO ${psoList[index].code} rejected and sent back to Coordinator for revision.`);
  };

  const handleDeletePSO = (index) => {
    const updated = psoList.filter((_, i) => i !== index);
    setPsoList(updated);
    updateProgrammePSOs(programmeId, updated);
  };

  const handleAddPSOCompetency = (psoIndex) => {
    const updated = psoList.map((p, i) => {
      if (i === psoIndex) {
        const comps = p.competencies || [];
        const nextOrder = comps.length + 1;
        const newComp = {
          id: `psocomp-${p.code}-${nextOrder}`,
          order: nextOrder,
          statement: `Demonstrate PSO competency statement ${nextOrder} for ${p.code}`,
        };
        return {
          ...p,
          competencies: [...comps, newComp],
          status: role === 'PROGRAMME_COORDINATOR' ? 'WAITING_FOR_DIRECTOR_VERIFICATION' : p.status,
        };
      }
      return p;
    });
    setPsoList(updated);
    updateProgrammePSOs(programmeId, updated);
  };

  const handleUpdatePSOCompetencyStatement = (psoIndex, compIndex, statement) => {
    const updated = psoList.map((p, i) => {
      if (i === psoIndex) {
        const comps = [...(p.competencies || [])];
        comps[compIndex] = { ...comps[compIndex], statement };
        return {
          ...p,
          competencies: comps,
          status: role === 'PROGRAMME_COORDINATOR' ? 'WAITING_FOR_DIRECTOR_VERIFICATION' : p.status,
        };
      }
      return p;
    });
    setPsoList(updated);
    updateProgrammePSOs(programmeId, updated);
  };

  const handleDeletePSOCompetency = (psoIndex, compIndex) => {
    const updated = psoList.map((p, i) => {
      if (i === psoIndex) {
        const comps = (p.competencies || []).filter((_, ci) => ci !== compIndex);
        return { ...p, competencies: comps.map((c, idx) => ({ ...c, order: idx + 1 })) };
      }
      return p;
    });
    setPsoList(updated);
    updateProgrammePSOs(programmeId, updated);
  };

  // ── CO Handlers (Faculty Proposes -> Programme Coordinator Approves) ──────────
  const handleAddCO = () => {
    const newCoNum = coList.length + 1;
    const newCo = {
      code: `C321.${newCoNum}`,
      statement: `New proposed Course Outcome statement ${newCoNum}...`,
      targetLevel: 2.5,
      target: 2.5,
      status: role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC' ? 'APPROVED' : 'DRAFT',
      submittedBy: user?.name || 'Course Coordinator',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setCoList((current) => [...current, newCo]);
  };

  const handleUpdateCOCode = (index, newCode) => {
    const updated = coList.map((c, i) => (i === index ? { ...c, code: newCode } : c));
    setCoList(updated);
  };

  const handleUpdateCOTarget = (index, val) => {
    const num = parseFloat(val);
    const validVal = isNaN(num) ? val : Math.min(3.0, Math.max(1.0, num));
    const updated = coList.map((c, i) =>
      i === index ? { ...c, targetLevel: validVal, target: validVal } : c
    );
    setCoList(updated);
  };

  const handleUpdateCOStatement = (index, newStatement) => {
    const updated = coList.map((c, i) => (i === index ? { ...c, statement: newStatement } : c));
    setCoList(updated);
  };

  const handleApproveCO = (index) => {
    const updated = coList.map((c, i) => (i === index ? { ...c, status: 'APPROVED', approvedBy: user?.name || 'Programme Coordinator', approvedAt: new Date().toISOString().split('T')[0] } : c));
    setCoList(updated);
    const allApproved = updated.every((c) => c.status === 'APPROVED');
    if (allApproved) {
      updateCourseVerificationStatus(targetCourseId, 'coStatus', 'APPROVED');
    }
    alert(`CO ${coList[index].code} APPROVED by Programme Coordinator!`);
  };

  const handleRejectCO = (index) => {
    const updated = coList.map((c, i) => (i === index ? { ...c, status: 'REJECTED' } : c));
    setCoList(updated);
    updateCourseVerificationStatus(targetCourseId, 'coStatus', 'PENDING_APPROVAL');
    alert(`CO ${coList[index].code} rejected and sent back to Faculty for revision.`);
  };

  const [deletingCOIndex, setDeletingCOIndex] = useState(null);
  const [showCODeleteModal, setShowCODeleteModal] = useState(false);

  const handleOpenDeleteCO = (index) => {
    setDeletingCOIndex(index);
    setShowCODeleteModal(true);
  };

  const handleConfirmDeleteCO = () => {
    if (deletingCOIndex !== null) {
      const updated = coList.filter((_, i) => i !== deletingCOIndex);
      setCoList(updated);
      setShowCODeleteModal(false);
      setDeletingCOIndex(null);
    }
  };

  const handleSaveOutcomes = async () => {
    if (!targetCourseId) {
      alert('Select an assigned programme-batch course before saving outcomes.');
      return;
    }
    try {
      setIsSavingOutcomes(true);
      const payload = coList.map((co) => ({
        ...(co.courseOutcomeId ?? co.id ? { courseOutcomeId: co.courseOutcomeId ?? co.id } : {}),
        code: String(co.code ?? '').trim(),
        statement: String(co.statement ?? '').trim(),
        targetLevel: Number(co.targetLevel ?? co.target ?? 2.5),
        bloomsLevel: co.bloomsLevel ?? 'UNDERSTAND',
      }));
      if (payload.some((co) => !co.code || !co.statement)) {
        alert('Enter a code and statement for every Course Outcome before saving.');
        return;
      }
      await updateCourseCOs(payload, targetCourseId);
      setSavedOutcomeSignature(outcomeSignature(coList));
      alert('Course Outcomes saved successfully.');
    } catch (error) {
      console.error('Failed to save Course Outcomes:', error);
      alert('Unable to save Course Outcomes. Please try again.');
    } finally {
      setIsSavingOutcomes(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!targetCourseId || coList.length === 0) return;
    try {
      setIsSubmittingForReview(true);
      await submitCourseVerification({
        courseOfferingId: targetCourseId,
        // POST /approvals/submit accepts CO_DEFINITION for the Course Outcomes
        // and Targets review request. The local courseOfferingId is deliberately
        // omitted by ApprovalContext before the request is sent.
        type: 'CO_DEFINITION',
        resourceId: targetCourseId,
        programmeBatchCourseId: targetCourseId,
        title: `CO Submission for ${courseScope?.courseCode || courseScope?.code || 'Course'}`,
      });
      setCoList((current) => current.map((co) => ({ ...co, status: 'SUBMITTED' })));
      setIsSubmittedForReview(true);
      alert('Course Outcomes submitted for review.');
    } catch (error) {
      console.error('Failed to submit Course Outcomes for review:', error);
      alert('Unable to submit Course Outcomes for review.');
    } finally {
      setIsSubmittingForReview(false);
    }
  };

  const handleSaveChanges = (entityName) => {
    alert(`Changes to ${entityName} are ready to save.`);
  };

  // Pending Counts
  const pendingPoCount = poList.filter((p) => p.status === 'WAITING_FOR_DIRECTOR_VERIFICATION').length;
  const pendingPsoCount = psoList.filter((p) => p.status === 'WAITING_FOR_DIRECTOR_VERIFICATION').length;
  const pendingCoCount = coList.filter((c) => c.status === 'WAITING_FOR_APPROVAL' || c.status === 'SUBMITTED').length;

  const targetData = courseVerificationStore[targetCourseId] || {};
  const isCoApproved = readOnly || currentCoVerificationStatus === 'APPROVED' || currentCoVerificationStatus === 'VERIFIED' || targetData.coStatus === 'APPROVED' || targetData.coStatus === 'VERIFIED';
  const outcomesDirty = savedOutcomeSignature === null || outcomeSignature(coList) !== savedOutcomeSignature;
  const outcomesPendingReview = isSubmittedForReview
    || currentCoVerificationStatus === 'SUBMITTED'
    || currentCoVerificationStatus === 'PENDING'
    || currentCoVerificationStatus === 'PENDING_APPROVAL'
    || targetData.status === 'SUBMITTED_FOR_VERIFICATION'
    || targetData.status === 'PENDING';

  return (
    <div className="animated-page">
      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      {!hideHeader && <div className="banner-dark-gradient" style={{ marginBottom: '20px' }}>
          <div className="banner-content-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Add COs
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            {isStandalone && isCourseCoordinator && <select
              value={selectedCourseOffering?.id ?? ''}
              onChange={(event) => {
                const offering = assignedOfferings.find((item) => String(item.id) === event.target.value);
                if (offering) selectCourseOffering(offering);
              }}
              disabled={!batchId || assignedOfferings.length === 0}
              style={{ height: '38px', minWidth: '260px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', background: '#ffffff', fontWeight: '700', fontFamily: 'inherit' }}
            >
              {assignedOfferings.length === 0 ? <option value="">No assigned courses for this programme batch</option> : assignedOfferings.map((offering) => <option key={offering.id} value={offering.id}>{offering.courseCode ?? offering.code ?? 'Course'} — {offering.courseName ?? offering.name ?? 'Programme-Batch Course'} · Sem {offering.semester ?? '—'}</option>)}
            </select>}
            {!isCoApproved ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveOutcomes}
                  disabled={!outcomesDirty || isSavingOutcomes}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '38px', opacity: !outcomesDirty || isSavingOutcomes ? 0.5 : 1, cursor: !outcomesDirty || isSavingOutcomes ? 'not-allowed' : 'pointer' }}
                >
                  <Save size={15} /> {isSavingOutcomes ? 'Saving…' : outcomesDirty ? 'Save Outcomes' : 'Saved'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitForReview}
                  disabled={outcomesDirty || isSubmittingForReview || outcomesPendingReview || coList.length === 0}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '38px', background: '#ffffff', color: '#2563eb', border: '1px solid #2563eb', opacity: outcomesDirty || isSubmittingForReview || outcomesPendingReview || coList.length === 0 ? 0.5 : 1, cursor: outcomesDirty || isSubmittingForReview || outcomesPendingReview || coList.length === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <Send size={15} /> {isSubmittingForReview ? 'Submitting…' : outcomesPendingReview ? 'Submitted' : 'Submit for Review'}
                </button>
              </>
            ) : (
              <span style={{ height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={13} /> Outcomes Locked
              </span>
            )}
          </div>
        </div>
      </div>}

      {/* Director Pending Verifications Banner */}
      {(role === 'DIRECTOR' || role === 'IQAC') && (pendingPoCount > 0 || pendingPsoCount > 0) && (
        <div
          className="card"
          style={{
            background: '#fefce8',
            border: '1.5px solid #fef08a',
            borderLeft: '5px solid #ca8a04',
            padding: '16px 20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={24} style={{ color: '#ca8a04' }} />
              <div>
                <strong style={{ fontSize: '14px', color: '#854d0e' }}>
                  {pendingPoCount + pendingPsoCount} Programme Outcome Submissions Waiting for Director Verification
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#a16207' }}>
                  Programme Coordinator has proposed new PO/PSO definitions. Review and click Verify below.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {pendingPoCount > 0 && (
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => setActiveOutcomeTab('pos')}
                >
                  Verify POs ({pendingPoCount})
                </button>
              )}
              {pendingPsoCount > 0 && (
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => setActiveOutcomeTab('psos')}
                >
                  Verify PSOs ({pendingPsoCount})
                </button>
              )}
            </div>
          </div>
        </div>
      )}





      {/* TAB 0: Programme Educational Objectives (PEOs - Statements Only, No Verification Needed) */}
      {activeOutcomeTab === 'peos' && role !== 'FACULTY' && (
        <div>
          {/* STICKY Action Header Bar */}
          <div
            style={{
              position: 'sticky',
              top: '0px',
              zIndex: 30,
              background: '#ffffff',
              padding: '12px 18px',
              margin: '0 0 16px 0',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              border: '1px solid #cbd5e1',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                PEOs for {selectedProgramme?.name} ({selectedProgramme?.code})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                Programme Educational Objectives statements (Managed by Programme Coordinator).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={() => handleSaveChanges('PEO Statements')}>
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>

          <div className="card">
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="audit-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                    <th style={{ width: '130px' }}>PEO Code</th>
                    <th>Programme Educational Objective Statement</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {peoList.map((peo, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>{index + 1}</td>
                      <td style={{ fontWeight: '800', color: '#4f46e5' }}>{peo.code}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={peo.statement}
                          onChange={(e) => handleUpdatePEOStatement(index, e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn btn-danger" style={{ padding: '4px 6px' }} onClick={() => handleDeletePEO(index)}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <RowButtons
                onAdd={handleAddPEO}
                onDel={() => handleDeletePEO(peoList.length - 1)}
                canDel={peoList.length > 1}
                addLabel="+ Add PEO Row"
                deleteLabel="- Delete Last PEO Row"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Programme Outcomes (Programme Coordinator Adds -> Director Verifies) */}
      {activeOutcomeTab === 'pos' && role !== 'FACULTY' && (
        <div>
          {/* STICKY Action Header Bar */}
          <div
            style={{
              position: 'sticky',
              top: '0px',
              zIndex: 30,
              background: '#ffffff',
              padding: '12px 18px',
              margin: '0 0 16px 0',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              border: '1px solid #cbd5e1',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                POs & Competencies for {selectedProgramme?.name} ({selectedProgramme?.code})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                Programme Coordinators can add/edit POs. Submissions require Director verification.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-success" onClick={handleAddPO}>
                <Plus size={15} /> + Propose New PO
              </button>
              <button className="btn btn-primary" onClick={() => handleSaveChanges('PO & Competencies')}>
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>

          {poList.map((po, index) => {
            const isVerified = po.status === 'VERIFIED';
            const isPendingVerification = po.status === 'WAITING_FOR_DIRECTOR_VERIFICATION';
            const comps = po.competencies || [];

            return (
              <div key={index} className="card" style={{ padding: '18px', borderLeft: isVerified ? '4px solid #10b981' : '4px solid #f59e0b', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '90px', fontWeight: '800', textAlign: 'center', color: isVerified ? '#10b981' : '#d97706' }}
                      value={po.code}
                      onChange={(e) => handleUpdatePOCode(index, e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ flex: 1, minWidth: '200px', fontWeight: '600' }}
                      value={po.statement}
                      onChange={(e) => handleUpdatePOStatement(index, e.target.value)}
                    />
                  </div>

                  {/* Director Verification Status & Action Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isVerified ? (
                      <span className="badge badge-success" style={{ gap: '4px' }}>
                        <CheckCircle2 size={13} /> Verified by Director
                      </span>
                    ) : isPendingVerification ? (
                      <span className="badge badge-pending" style={{ gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                        <Clock size={13} /> Waiting for Director Verification
                      </span>
                    ) : (
                      <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', gap: '4px' }}>
                        <XCircle size={13} /> Needs Director Revision
                      </span>
                    )}

                    {(role === 'DIRECTOR' || role === 'IQAC') && !isVerified && (
                      <button
                        className="btn btn-success"
                        style={{ padding: '5px 10px', fontSize: '11.5px' }}
                        onClick={() => handleVerifyPO(index)}
                      >
                        <ShieldCheck size={14} /> Verify PO
                      </button>
                    )}

                    {(role === 'DIRECTOR' || role === 'IQAC') && isPendingVerification && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '11.5px' }}
                        onClick={() => handleRejectPO(index)}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}

                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      onClick={() => handleAddPOCompetency(index)}
                    >
                      <Plus size={13} /> Add Competency
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 8px' }}
                      onClick={() => handleDeletePO(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ marginLeft: '12px', borderLeft: '2px solid #e2e8f0', paddingLeft: '14px', overflowX: 'auto', width: '100%' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    PO Competencies ({comps.length})
                  </h4>

                  <table className="audit-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>Order</th>
                        <th>Competency Statement</th>
                        <th style={{ width: '70px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comps.map((comp, compIdx) => (
                        <tr key={comp.id || compIdx}>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>
                            {compIdx + 1}
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              style={{ width: '100%', padding: '5px 8px', fontSize: '12px' }}
                              value={comp.statement}
                              onChange={(e) => handleUpdatePOCompetencyStatement(index, compIdx, e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 6px' }}
                              onClick={() => handleDeletePOCompetency(index, compIdx)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <RowButtons
                    onAdd={() => handleAddPOCompetency(index)}
                    onDel={() => handleDeletePOCompetency(index, comps.length - 1)}
                    canDel={comps.length > 1}
                    addLabel="+ Add Competency Row"
                    deleteLabel="- Delete Last Competency Row"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Programme Specific Outcomes (Programme Coordinator Adds -> Director Verifies) */}
      {activeOutcomeTab === 'psos' && role !== 'FACULTY' && (
        <div>
          {/* STICKY Action Header Bar */}
          <div
            style={{
              position: 'sticky',
              top: '0px',
              zIndex: 30,
              background: '#ffffff',
              padding: '12px 18px',
              margin: '0 0 16px 0',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              border: '1px solid #cbd5e1',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                PSOs & Competencies for {selectedProgramme?.name} ({selectedProgramme?.code})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                Programme Coordinators can add/edit PSOs. Submissions require Director verification.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-success" onClick={handleAddPSO}>
                <Plus size={15} /> + Propose New PSO
              </button>
              <button className="btn btn-primary" onClick={() => handleSaveChanges('PSO & Competencies')}>
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>

          {psoList.map((pso, index) => {
            const isVerified = pso.status === 'VERIFIED';
            const isPendingVerification = pso.status === 'WAITING_FOR_DIRECTOR_VERIFICATION';
            const comps = pso.competencies || [];

            return (
              <div key={index} className="card" style={{ padding: '18px', borderLeft: isVerified ? '4px solid #10b981' : '4px solid #f59e0b', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '90px', fontWeight: '800', textAlign: 'center', color: isVerified ? '#10b981' : '#d97706' }}
                      value={pso.code}
                      onChange={(e) => handleUpdatePSOCode(index, e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ flex: 1, minWidth: '200px', fontWeight: '600' }}
                      value={pso.statement}
                      onChange={(e) => handleUpdatePSOStatement(index, e.target.value)}
                    />
                  </div>

                  {/* Director Verification Status & Action Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isVerified ? (
                      <span className="badge badge-success" style={{ gap: '4px' }}>
                        <CheckCircle2 size={13} /> Verified by Director
                      </span>
                    ) : isPendingVerification ? (
                      <span className="badge badge-pending" style={{ gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                        <Clock size={13} /> Waiting for Director Verification
                      </span>
                    ) : (
                      <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', gap: '4px' }}>
                        <XCircle size={13} /> Needs Director Revision
                      </span>
                    )}

                    {(role === 'DIRECTOR' || role === 'IQAC') && !isVerified && (
                      <button
                        className="btn btn-success"
                        style={{ padding: '5px 10px', fontSize: '11.5px' }}
                        onClick={() => handleVerifyPSO(index)}
                      >
                        <ShieldCheck size={14} /> Verify PSO
                      </button>
                    )}

                    {(role === 'DIRECTOR' || role === 'IQAC') && isPendingVerification && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '11.5px' }}
                        onClick={() => handleRejectPSO(index)}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}

                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      onClick={() => handleAddPSOCompetency(index)}
                    >
                      <Plus size={13} /> Add Competency
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 8px' }}
                      onClick={() => handleDeletePSO(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ marginLeft: '12px', borderLeft: '2px solid #e2e8f0', paddingLeft: '14px', overflowX: 'auto', width: '100%' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    PSO Competencies ({comps.length})
                  </h4>

                  <table className="audit-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>Order</th>
                        <th>Competency Statement</th>
                        <th style={{ width: '70px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comps.map((comp, compIdx) => (
                        <tr key={comp.id || compIdx}>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>
                            {compIdx + 1}
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              style={{ width: '100%', padding: '5px 8px', fontSize: '12px' }}
                              value={comp.statement}
                              onChange={(e) => handleUpdatePSOCompetencyStatement(index, compIdx, e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 6px' }}
                              onClick={() => handleDeletePSOCompetency(index, compIdx)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <RowButtons
                    onAdd={() => handleAddPSOCompetency(index)}
                    onDel={() => handleDeletePSOCompetency(index, comps.length - 1)}
                    canDel={comps.length > 1}
                    addLabel="+ Add Competency Row"
                    deleteLabel="- Delete Last Competency Row"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Course Outcomes (Faculty Submission & Programme Coordinator Approval) */}
      {activeOutcomeTab === 'cos' && (
        <div>

          {/* Programme Coordinator Status & Rejection Remarks Banner */}
          {(() => {
            const targetData = courseVerificationStore[targetCourseId] || {};
            const status = currentCoVerificationStatus || 'DRAFT';
            const remarks = targetData.coRemarks || activeCOs[0]?.revisionReason || '';
            const verifier = targetData.coReviewer || activeCOs[0]?.reviewedBy || targetData.verifiedBy || 'Programme Coordinator';

            const isApproved = status === 'APPROVED' || status === 'VERIFIED';
            const isRejected = status === 'REJECTED' || status === 'REVISION_REQUESTED';

            if (isApproved) {
              return (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', padding: '14px 18px', marginBottom: '18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#15803d', fontWeight: '800' }}>
                      ✓ ALL COURSE OUTCOMES VERIFIED &amp; APPROVED BY PROGRAMME COORDINATOR
                    </strong>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#166534' }}>
                      Course outcome statements for {selectedCourse?.code} — {selectedCourse?.name} have been verified and approved by <strong>{verifier}</strong>.
                    </p>
                  </div>
                </div>
              );
            }

            if (isRejected) {
              return (
                <RequestRevisionCard
                  title="Course Outcomes Revision Requested"
                  requestedBy={verifier}
                  remarks={remarks || 'Please review and update Course Outcome statements as per coordinator notes.'}
                  actionText="Modify the statements below and click 'Save COs' to re-submit for Programme Coordinator approval."
                />
              );
            }

            if (!suppressPendingMessage && ['PENDING', 'SUBMITTED', 'PENDING_APPROVAL', 'SUBMITTED_FOR_VERIFICATION'].includes(status)) {
              return <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', padding: '14px 18px', marginBottom: '18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}><Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} /><div><strong style={{ fontSize: '13.5px', color: '#92400e', fontWeight: '800' }}>Submitted — Pending Programme Coordinator Review</strong><p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b45309' }}>Course Outcomes and Targets are awaiting review by the Programme Coordinator.</p></div></div>;
            }

            return null;
          })()}

          <div className="card">
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="audit-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                    <th style={{ width: '90px', minWidth: '90px', maxWidth: '100px', textAlign: 'center' }}>CO Code</th>
                    <th style={{ width: '100%' }}>Course Outcome Statement</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Target</th>
                    <th style={{ width: '180px', textAlign: 'center' }}>Approval Status</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No Course Outcomes defined for this course yet. Click "+ Submit New CO Proposal".
                      </td>
                    </tr>
                  ) : (
                    coList.map((co, index) => {
                      const targetData = courseVerificationStore[targetCourseId] || {};
                      const globalStatus = targetData.coStatus || currentCoVerificationStatus || 'DRAFT';

                      const isApproved = co.status === 'APPROVED' || co.status === 'VERIFIED' || globalStatus === 'APPROVED' || globalStatus === 'VERIFIED';
                      const isRejected = co.status === 'REJECTED' || co.status === 'REVISION_REQUESTED' || globalStatus === 'REJECTED' || globalStatus === 'REVISION_REQUESTED';
                      const isSubmitted = co.status === 'SUBMITTED' || co.status === 'PENDING_APPROVAL' || co.status === 'WAITING_FOR_APPROVAL' || globalStatus === 'SUBMITTED' || globalStatus === 'PENDING_APPROVAL' || globalStatus === 'WAITING_FOR_APPROVAL';
                      const isDraft = !isApproved && !isRejected && !isSubmitted;

                      const targetVal = co.targetLevel !== undefined ? co.targetLevel : (co.target !== undefined ? co.target : 2.5);

                      return (
                        <tr key={index}>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>{index + 1}</td>
                          <td style={{ width: '90px', minWidth: '90px', maxWidth: '100px' }}>
                            <input
                              type="text"
                              className="form-control"
                              disabled={isApproved}
                              style={{
                                fontWeight: '800',
                                textAlign: 'center',
                                width: '80px',
                                color: isApproved ? '#10b981' : '#d97706',
                                background: isApproved ? '#f8fafc' : '#ffffff',
                                cursor: isApproved ? 'not-allowed' : 'text',
                              }}
                              value={co.code}
                              onChange={(e) => handleUpdateCOCode(index, e.target.value)}
                            />
                          </td>
                          <td style={{ width: '100%' }}>
                            <input
                              type="text"
                              className="form-control"
                              disabled={isApproved}
                              value={co.statement}
                              onChange={(e) => handleUpdateCOStatement(index, e.target.value)}
                              style={{
                                fontSize: '13px',
                                width: '100%',
                                minWidth: '500px',
                                boxSizing: 'border-box',
                                padding: '8px 12px',
                                background: isApproved ? '#f8fafc' : '#ffffff',
                                cursor: isApproved ? 'not-allowed' : 'text',
                                color: isApproved ? '#334155' : '#0f172a',
                              }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', width: '110px' }}>
                            <input
                              type="number"
                              step="0.1"
                              min="1.0"
                              max="3.0"
                              disabled={isApproved}
                              className="form-control"
                              style={{
                                width: '70px',
                                textAlign: 'center',
                                fontWeight: '800',
                                fontSize: '13px',
                                color: '#0f172a',
                                padding: '6px 8px',
                                margin: '0 auto',
                                background: isApproved ? '#f8fafc' : '#ffffff',
                                cursor: isApproved ? 'not-allowed' : 'text',
                              }}
                              value={targetVal}
                              onChange={(e) => handleUpdateCOTarget(index, e.target.value)}
                              title="Target attainment benchmark (1.0 to 3.0 scale)"
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isApproved ? (
                              <span className="badge badge-success" style={{ gap: '4px' }}>
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            ) : isSubmitted ? (
                              <span className="badge badge-pending" style={{ gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                                <Clock size={12} /> Pending Approval
                              </span>
                            ) : isRejected ? (
                              <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', gap: '4px' }}>
                                <XCircle size={12} /> Needs Revision
                              </span>
                            ) : (
                              <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', gap: '4px' }}>
                                Draft
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isApproved ? (
                              <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <CheckCircle2 size={12} /> Locked
                              </span>
                            ) : (
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                                {(role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC') && (
                                  <>
                                    {!isApproved && (
                                      <button
                                        className="btn btn-success"
                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                        onClick={() => handleApproveCO(index)}
                                        title="Approve CO"
                                      >
                                        <CheckCircle2 size={13} /> Approve
                                      </button>
                                    )}
                                    {isSubmitted && (
                                      <button
                                        className="btn btn-danger"
                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                        onClick={() => handleRejectCO(index)}
                                        title="Reject CO"
                                      >
                                        <XCircle size={13} /> Reject
                                      </button>
                                    )}
                                  </>
                                )}
                                <button
                                  type="button"
                                  style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                                  onClick={() => handleOpenDeleteCO(index)}
                                  title="Delete Course Outcome"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {!isCoApproved && (
                <RowButtons
                  onAdd={handleAddCO}
                  canDel={false}
                  addLabel="+ Add CO Row"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save, Previous & Save & Next Footer (Hidden in Standalone Nav Mode) */}
      {!isStandalone && !hideFooter && (
        <SectionSaveFooter
          label="Outcome Management"
          prevPath="/dashboard"
          nextPath="/co-mapping"
          nextLabel="Save COs & Proceed to Step 2: CO–PO/PSO Mapping →"
          onSave={handleSaveOutcomes}
        />
      )}
      {/* Delete Confirmation Modal for Course Outcomes */}
      <DeleteConfirmModal
        isOpen={showCODeleteModal && deletingCOIndex !== null}
        title="Delete Course Outcome?"
        itemName={deletingCOIndex !== null ? `${coList[deletingCOIndex]?.code}: ${coList[deletingCOIndex]?.statement?.slice(0, 50)}...` : ''}
        description="This action cannot be undone. All mapping and attainment calculations linked to this Course Outcome will be permanently removed."
        confirmText="Delete CO"
        onConfirm={handleConfirmDeleteCO}
        onClose={() => setShowCODeleteModal(false)}
      />
    </div>
  );
}
