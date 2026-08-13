import { useState, useEffect } from 'react';
import { Save, History, Printer, CheckCircle2, ChevronDown, Layers, FileText, AlertCircle, Clock, Lock } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import CourseATR from './CourseATR';

// Course-specific baseline seeds for Programme ATR
const COURSE_PROG_SEEDS = {
  'crs-1': {
    PO1: { target: 2.0, actual: 2.45, met: true },
    PO2: { target: 2.0, actual: 1.85, met: false },
    PO3: { target: 2.0, actual: 2.60, met: true },
    PO4: { target: 2.0, actual: 2.10, met: true },
    PSO1: { target: 2.0, actual: 2.15, met: true },
    PSO2: { target: 2.0, actual: 1.70, met: false },
  },
  'crs-2': {
    PO1: { target: 2.0, actual: 1.75, met: false },
    PO2: { target: 2.0, actual: 2.70, met: true },
    PO3: { target: 2.0, actual: 2.10, met: true },
    PO4: { target: 2.0, actual: 1.80, met: false },
    PSO1: { target: 2.0, actual: 1.80, met: false },
    PSO2: { target: 2.0, actual: 2.50, met: true },
  },
  'crs-3': {
    PO1: { target: 2.0, actual: 2.80, met: true },
    PO2: { target: 2.0, actual: 2.40, met: true },
    PO3: { target: 2.0, actual: 1.90, met: false },
    PO4: { target: 2.0, actual: 2.30, met: true },
    PSO1: { target: 2.0, actual: 2.65, met: true },
    PSO2: { target: 2.0, actual: 2.30, met: true },
  },
  'crs-4': {
    PO1: { target: 2.0, actual: 1.95, met: false },
    PO2: { target: 2.0, actual: 2.35, met: true },
    PO3: { target: 2.0, actual: 2.75, met: true },
    PO4: { target: 2.0, actual: 1.70, met: false },
    PSO1: { target: 2.0, actual: 1.88, met: false },
    PSO2: { target: 2.0, actual: 2.42, met: true },
  },
};

export default function ATRReportsNavHub({ initialTab = 'course-atr' }) {
  const { role } = useAuth();
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';

  const {
    availableCourses = [],
    courses = [],
    selectedCourse,
    selectedProgramme,
    setCourseId = () => {},
    academicYear = '2025-26',
    availableYears = ['2025-26', '2024-25', '2023-24'],
    activePOs = [],
    activePSOs = [],
    poPsoTargets = {},
    programmeId = 'prog-1',
    courseVerificationStore = {},
    updateCourseVerificationStatus = () => {},
  } = useAcademic();

  const [activeAtrTab, setActiveAtrTab] = useState(initialTab);
  const [selectedYear, setSelectedYear] = useState(academicYear || '2025-26');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isPreviousYear = selectedYear !== (academicYear || '2025-26');

  const courseId = selectedCourse?.id || 'crs-1';
  const vRecord = courseVerificationStore[courseId] || {};
  const progStatus = vRecord.programmeAtrStatus || 'DRAFT';
  const progRemarks = vRecord.programmeAtrRemarks || '';
  const verifierName = vRecord.verifiedBy || 'Programme Coordinator';
  const isProgLocked = isPreviousYear || progStatus === 'VERIFIED' || progStatus === 'APPROVED';

  // Derive Programme ATR Rows dynamically per selected course
  const buildProgEntries = () => {
    const seeds = COURSE_PROG_SEEDS[courseId] || COURSE_PROG_SEEDS['crs-1'];
    const normPSOs = activePSOs.map((p) => ({ ...p, competencies: p.competencies ?? [] }));
    const rawRows = [
      ...activePOs.map((po) => {
        const seed = seeds[po.code] || { target: 2.0, actual: 2.20, met: true };
        return {
          code: po.code, type: 'PO', statement: po.statement,
          target: seed.target, actual: seed.actual, met: seed.met,
        };
      }),
      ...normPSOs.map((pso) => {
        const seed = seeds[pso.code] || { target: 2.0, actual: 2.10, met: true };
        return {
          code: pso.code, type: 'PSO', statement: pso.statement,
          target: seed.target, actual: seed.actual, met: seed.met,
        };
      }),
    ];

    return rawRows.map((r) => ({
      ...r,
      remark: r.met ? `Target achieved for ${r.code} in ${selectedCourse?.code || 'Course'}. Maintain current teaching strategy.` : '',
      actions: r.met ? [] : [
        `Conduct targeted remedial interventions for ${r.code} (${selectedCourse?.code || 'Course'}).`,
        'Review assessment methodology and increase practice problem frequency.'
      ],
    }));
  };

  const [progEntries, setProgEntries] = useState(buildProgEntries);

  useEffect(() => {
    setProgEntries(buildProgEntries());
  }, [courseId, selectedCourse, activePOs, activePSOs, poPsoTargets]);

  const handleAddProgAction = (idx) => {
    setProgEntries((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, actions: [...item.actions, 'New corrective action plan...'] } : item
      )
    );
  };

  const handleUpdateProgAction = (idx, actionIdx, val) => {
    setProgEntries((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updatedActions = [...item.actions];
        updatedActions[actionIdx] = val;
        return { ...item, actions: updatedActions };
      })
    );
  };

  const handleDeleteProgAction = (idx, actionIdx) => {
    setProgEntries((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        return { ...item, actions: item.actions.filter((_, ai) => ai !== actionIdx) };
      })
    );
  };

  const handleUpdateProgRemark = (idx, val) => {
    setProgEntries((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, remark: val } : item))
    );
  };

  const handleSaveSubmitATR = () => {
    setIsSubmitted(true);
    updateCourseVerificationStatus(courseId, 'atrStatus', 'SUBMITTED');
    updateCourseVerificationStatus(courseId, 'programmeAtrStatus', 'SUBMITTED');
    alert(`🎉 Course ATR & Programme ATR for ${selectedCourse?.code || 'Course'} saved and submitted successfully to ${verifierName}!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animated-page">
      {/* Top Banner Header with Space-Between Action Bar */}
      <div className="banner-dark-gradient print:hidden" style={{ marginBottom: '20px' }}>
        {/* TITLE BLOCK */}
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
            Action Taken Report (ATR) Hub
          </h2>
        </div>

        {/* SPACE BETWEEN ACTION BAR: First two options on left, Course Selector & Save option on extreme right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* FIRST TWO OPTIONS (LEFT) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowHistory(!showHistory)}
              style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            >
              <History size={15} /> {showHistory ? 'Hide Previous Batch ATR' : 'View Carry-Forward ATR'}
            </button>

            <button
              className="btn btn-secondary"
              onClick={handlePrint}
              style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            >
              <Printer size={15} /> Print ATR Report
            </button>
          </div>

          {/* ACADEMIC YEAR & COURSE SELECTOR & SAVE OPTION (EXTREME RIGHT) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Academic Year Selector Dropdown */}
            <div style={{ position: 'relative', width: '150px' }}>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  height: '38px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  color: selectedYear === academicYear ? '#4f46e5' : '#1e40af',
                  border: selectedYear === academicYear ? '1.5px solid #cbd5e1' : '1.5px solid #93c5fd',
                  borderRadius: '8px',
                  padding: '0 28px 0 10px',
                  background: selectedYear === academicYear ? '#ffffff' : '#eff6ff',
                  width: '100%',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    AY {yr} {yr === academicYear ? '(Active)' : '(Archived)'}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>

            {/* Course Selector Dropdown */}
            <div style={{ position: 'relative', width: '240px' }}>
              <select
                value={selectedCourse?.id || ''}
                onChange={(e) => setCourseId(e.target.value)}
                style={{
                  height: '38px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#4f46e5',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 30px 0 12px',
                  background: '#ffffff',
                  width: '100%',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {(availableCourses.length > 0 ? availableCourses : courses).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>

            {isPreviousYear ? (
              <span className="badge" style={{ height: '38px', boxSizing: 'border-box', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0 14px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> AY {selectedYear} ARCHIVED (READ-ONLY)
              </span>
            ) : (progStatus === 'VERIFIED' || progStatus === 'APPROVED') ? (
              <span className="badge badge-active" style={{ height: '38px', boxSizing: 'border-box', background: '#dcfce7', color: '#15803d', padding: '0 14px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center' }}>
                ✓ VERIFIED BY {verifierName.toUpperCase()}
              </span>
            ) : progStatus === 'REVISION_REQUESTED' ? (
              <span className="badge badge-rejected" style={{ height: '38px', boxSizing: 'border-box', background: '#fee2e2', color: '#dc2626', padding: '0 14px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center' }}>
                ⚠ REVISION REQUESTED
              </span>
            ) : (progStatus === 'SUBMITTED' || isSubmitted) ? (
              <span className="badge badge-active" style={{ height: '38px', boxSizing: 'border-box', background: '#fef3c7', color: '#b45309', padding: '0 14px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center' }}>
                ✓ SUBMITTED TO PROGRAMME COORDINATOR
              </span>
            ) : null}

            {!isProgLocked && (
              <button
                className="btn btn-primary"
                onClick={handleSaveSubmitATR}
                style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '800', gap: '8px', display: 'inline-flex', alignItems: 'center' }}
              >
                <Save size={16} /> Save &amp; Submit ATR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Archived Year Lock Banner */}
      {isPreviousYear && (
        <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Lock size={20} style={{ color: '#1d4ed8', flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '13.5px', color: '#1e40af', display: 'block' }}>
              🔒 Archived Academic Year ({selectedYear}) — Read Only
            </strong>
            <span style={{ fontSize: '12px', color: '#1e3a8a', display: 'block', marginTop: '2px' }}>
              This Action Taken Report is an archived historical record from AY {selectedYear}. Previous year ATR reports are locked for audit reference and cannot be edited.
            </span>
          </div>
        </div>
      )}

      {/* TABS STRIP */}
      {!isCourseCoordinator ? (
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '10px', marginBottom: '20px', width: 'fit-content' }}>
          <button
            type="button"
            onClick={() => setActiveAtrTab('course-atr')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              background: activeAtrTab === 'course-atr' ? '#ffffff' : 'transparent',
              color: activeAtrTab === 'course-atr' ? '#4f46e5' : '#64748b',
              boxShadow: activeAtrTab === 'course-atr' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FileText size={15} /> 1. Course ATR
          </button>

          <button
            type="button"
            onClick={() => setActiveAtrTab('programme-atr')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              background: activeAtrTab === 'programme-atr' ? '#ffffff' : 'transparent',
              color: activeAtrTab === 'programme-atr' ? '#4f46e5' : '#64748b',
              boxShadow: activeAtrTab === 'programme-atr' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Layers size={15} /> 2. Programme ATR
          </button>
        </div>
      ) : null}

      {/* TAB 1: COURSE ATR */}
      {(isCourseCoordinator || activeAtrTab === 'course-atr') && (
        <div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', color: '#4f46e5', display: 'grid', placeItems: 'center' }}>
                <FileText size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                  Course ATR
                </h3>
              </div>
            </div>
          </div>
          <CourseATR hideFooter={true} hideHeader={true} showHistoryProp={showHistory} />
        </div>
      )}

      {/* TAB 2: PROGRAMME ATR (HOD / Programme Coordinator / Director only) */}
      {!isCourseCoordinator && activeAtrTab === 'programme-atr' && (
        <div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', color: '#4f46e5', display: 'grid', placeItems: 'center' }}>
                <Layers size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                  Programme ATR
                </h3>
              </div>
            </div>
          </div>

          {/* VERIFICATION ALERT BANNERS */}
          {isProgLocked && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#15803d' }}>
                  ✓ Verified &amp; Approved by {verifierName}
                </span>
                <span style={{ fontSize: '12px', color: '#166534', display: 'block', marginTop: '2px' }}>
                  Programme ATR has been verified and locked for this academic cycle.
                </span>
              </div>
            </div>
          )}

          {progStatus === 'REVISION_REQUESTED' && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#991b1b' }}>
                  ⚠ Revision Requested by {verifierName}
                </span>
                {progRemarks && (
                  <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#7f1d1d', fontStyle: 'italic' }}>
                    "{progRemarks}"
                  </p>
                )}
              </div>
            </div>
          )}

          {progStatus === 'SUBMITTED' && !isProgLocked && (
            <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#92400e' }}>
                  Submitted — Pending Verification
                </span>
                <span style={{ fontSize: '12px', color: '#b45309', display: 'block', marginTop: '2px' }}>
                  Submitted for Programme Coordinator verification.
                </span>
              </div>
            </div>
          )}

          {/* Editable / Read-Only PO & PSO Cards List */}
          <div style={{ display: 'grid', gap: '14px' }}>
            {progEntries.map((entry, idx) => {
              const pct = Number(((entry.actual / entry.target) * 100).toFixed(1));
              const accentCol = entry.type === 'PO' ? '#4f46e5' : '#059669';

              return (
                <div key={entry.code} style={{ background: '#ffffff', border: `1px solid ${entry.met ? '#bbf7d0' : '#fecaca'}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ background: entry.met ? '#f0fdf4' : '#fef2f2', borderBottom: `1px solid ${entry.met ? '#bbf7d0' : '#fecaca'}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                      <span style={{ color: accentCol, fontWeight: '900', marginRight: '6px' }}>{entry.code}:</span>
                      {entry.statement}
                    </span>
                  </div>

                  <table className="audit-data-table" style={{ margin: 0, border: 'none' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ width: '70px', textAlign: 'center' }}>Outcome</th>
                        <th style={{ width: '100px', textAlign: 'center' }}>Target</th>
                        <th style={{ width: '110px', textAlign: 'center' }}>Attainment</th>
                        <th style={{ width: '130px', textAlign: 'center' }}>Observation</th>
                        <th>{entry.met ? 'Remark (Target Met)' : 'Corrective Actions for Improvement'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: 'center', fontWeight: '800', color: accentCol, verticalAlign: 'top', paddingTop: '12px' }}>{entry.code}</td>
                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b', verticalAlign: 'top', paddingTop: '12px' }}>{entry.target.toFixed(2)}</td>
                        <td style={{ textAlign: 'center', fontWeight: '800', color: entry.met ? '#16a34a' : '#dc2626', verticalAlign: 'top', paddingTop: '12px' }}>{entry.actual.toFixed(2)}</td>
                        <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '700', background: entry.met ? '#dcfce7' : '#fee2e2', color: entry.met ? '#15803d' : '#991b1b', borderRadius: '5px', padding: '3px 8px' }}>
                            {pct}% {entry.met ? 'Achieved' : 'Gap'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                          {entry.met ? (
                            isProgLocked ? (
                              <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '12.5px' }}>
                                {entry.remark || 'Target achieved. Maintain current teaching strategy.'}
                              </div>
                            ) : (
                              <textarea
                                rows={2}
                                value={entry.remark}
                                onChange={(e) => handleUpdateProgRemark(idx, e.target.value)}
                                placeholder="Enter remark for this outcome..."
                                style={{ width: '100%', fontSize: '12.5px', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '8px 10px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: '#0f172a', background: '#ffffff' }}
                              />
                            )
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {entry.actions.map((act, aIdx) => (
                                <div key={aIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <span style={{ fontWeight: '800', color: '#3b82f6', minWidth: '68px', fontSize: '12px', paddingTop: '9px' }}>Action {aIdx + 1}:</span>
                                  {isProgLocked ? (
                                    <div style={{ flex: 1, background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '12px' }}>
                                      {act}
                                    </div>
                                  ) : (
                                    <textarea
                                      rows={2}
                                      value={act}
                                      onChange={(e) => handleUpdateProgAction(idx, aIdx, e.target.value)}
                                      style={{ flex: 1, fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '6px 10px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: '#0f172a', background: '#ffffff' }}
                                    />
                                  )}
                                  {!isProgLocked && entry.actions.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProgAction(idx, aIdx)}
                                      style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: '4px' }}
                                    >
                                      <span style={{ fontSize: '15px', lineHeight: 1 }}>×</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                              {!isProgLocked && (
                                <button
                                  type="button"
                                  onClick={() => handleAddProgAction(idx)}
                                  style={{ alignSelf: 'flex-start', height: '28px', padding: '0 12px', fontSize: '11.5px', fontWeight: '700', background: '#f8fafc', color: '#4f46e5', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}
                                >
                                  + Add Action
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
