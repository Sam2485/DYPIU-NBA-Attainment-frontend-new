import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Layers, Users, CheckCircle2, ArrowRight, ArrowLeft, Save, Sparkles, Check, Plus, GraduationCap, AlertCircle } from 'lucide-react';
import { useAcademic, MASTER_FACULTY_LIST } from '../../context/AcademicContext';

export default function HodSetupWorkflow() {
  const navigate = useNavigate();
  const {
    masterProgrammes = [],
    programmeId,
    setProgrammeId,
    batches = [],
    batchId,
    setBatchId,
    addBatch = () => {},
    activePOs = [],
    activePSOs = [],
    activePEOs = [],
    courses = [],
    assignCourseCoordinator = () => {},
  } = useAcademic();

  const [currentStep, setCurrentStep] = useState(1);

  // Selected Programme details
  const selectedProgramme = masterProgrammes.find((p) => p.id === programmeId) || masterProgrammes[0] || { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  // Step 1 Create Batch Form State (Numeric Typed Inputs with Validation > 2020)
  const [startYearInput, setStartYearInput] = useState('2025');
  const [endYearInput, setEndYearInput] = useState('2029');
  const [validationError, setValidationError] = useState('');

  // Workflow Steps Config (4 Guided Steps for HOD)
  const steps = [
    { number: 1, title: 'Batch Setup', desc: 'Select prog & type batch year' },
    { number: 2, title: 'PO / PSO / PEO', desc: 'Verify outcome framework' },
    { number: 3, title: 'Course Allocation', desc: 'Assign Course Coordinators' },
    { number: 4, title: 'Final Review & Finish', desc: 'Verify & return to dashboard' },
  ];

  const handleStartYearChange = (val) => {
    const numericOnly = val.replace(/\D/g, '').slice(0, 4);
    setStartYearInput(numericOnly);

    if (numericOnly.length === 4) {
      const num = parseInt(numericOnly, 10);
      if (num <= 2020) {
        setValidationError('⚠️ Academic start year must be greater than AY 2020 (e.g. 2021 or later).');
      } else {
        setValidationError('');
        setEndYearInput(String(num + 4));
      }
    } else {
      setValidationError('');
    }
  };

  const handleEndYearChange = (val) => {
    const numericOnly = val.replace(/\D/g, '').slice(0, 4);
    setEndYearInput(numericOnly);
  };

  const handleCreateBatchInline = (e) => {
    e.preventDefault();
    const startNum = parseInt(startYearInput, 10);
    const endNum = parseInt(endYearInput, 10);

    if (!startYearInput || isNaN(startNum)) {
      alert('Please enter a valid 4-digit numeric Start Academic Year (e.g. 2025).');
      return;
    }
    if (startNum <= 2020) {
      alert('⚠️ Academic start year must be greater than AY 2020 (e.g. 2021 or later).');
      return;
    }
    if (!endYearInput || isNaN(endNum)) {
      alert('Please enter a valid 4-digit numeric End Academic Year (e.g. 2029).');
      return;
    }
    if (endNum <= startNum) {
      alert('⚠️ End Academic Year must be greater than Start Academic Year.');
      return;
    }

    const startAY = `${startNum}-${String(startNum + 1).slice(-2)}`;
    const endAY = `${endNum - 1}-${String(endNum).slice(-2)}`;

    const newBatch = {
      id: `batch-${selectedProgramme.code.toLowerCase()}-${startNum}-${String(endNum).slice(-2)}`,
      programmeId,
      programmeName: selectedProgramme.name,
      programmeCode: selectedProgramme.code,
      name: `Batch ${startNum}-${String(endNum).slice(-2)} (${selectedProgramme.code}) — AY ${startAY} to ${endAY}`,
      startYear: startAY,
      endYear: endAY,
      status: 'INITIALIZED',
    };

    addBatch(newBatch);
    setBatchId(newBatch.id);
    alert(`🎉 Created & Set Active Batch Year: ${newBatch.name}!`);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinishWorkflow = () => {
    alert('🎉 HOD Programme Setup Workflow completed successfully!');
    navigate('/hod/dashboard');
  };

  const activeBatchObj = batches.find((b) => b.id === batchId) || batches[0];

  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>
      {/* ── TOP HEADER BANNER ───────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          border: '1.5px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px' }}>
              HOD GUIDED WORKFLOW • STEP {currentStep} OF 4
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '900' }}>
            Start / Continue Programme Setup
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
            Guided setup process for Department of Computer Science & Engineering
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/hod/dashboard')}
          style={{ height: '38px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700' }}
        >
          Exit Workflow
        </button>
      </div>

      {/* ── STEPPER PROGRESS BAR ───────────────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', position: 'relative' }}>
          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <div
                key={s.number}
                onClick={() => setCurrentStep(s.number)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textCenter: 'center',
                  cursor: 'pointer',
                  opacity: currentStep >= s.number ? 1 : 0.6,
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isCompleted ? '#10b981' : isCurrent ? '#4f46e5' : '#f1f5f9',
                    color: isCompleted || isCurrent ? '#ffffff' : '#64748b',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: '900',
                    fontSize: '14px',
                    marginBottom: '8px',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(79,70,229,0.2)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCompleted ? <Check size={18} /> : s.number}
                </div>

                <div style={{ fontWeight: isCurrent ? '800' : '700', fontSize: '12.5px', color: isCurrent ? '#4f46e5' : '#0f172a', textAlign: 'center' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b', textAlign: 'center', marginTop: '2px' }}>
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP CONTENT AREA ──────────────────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
        {/* STEP 1: SELECT PROGRAMME & TYPE BATCH YEAR (NUMERIC > 2020) */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Step 1: Select Programme & Type Batch Year
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                First select a degree programme allocated by the Director, then type the numeric batch start and end years (greater than AY 2020).
              </p>
            </div>

            {/* 1. SELECT PROGRAMME */}
            <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label className="form-label" style={{ fontWeight: '800', fontSize: '13.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <GraduationCap size={18} style={{ color: '#4f46e5' }} />
                1. Select Degree Programme (Created by Director) *
              </label>
              <select
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                className="form-input"
                style={{ height: '44px', fontSize: '13.5px', fontWeight: '800', color: '#4f46e5', maxWidth: '600px' }}
              >
                {masterProgrammes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. TYPE BATCH YEAR FOR SELECTED PROGRAMME (NUMERIC ONLY > 2020) */}
            <div style={{ background: '#ffffff', border: '1.5px solid #4f46e5', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(79,70,229,0.06)' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: '#4f46e5' }} />
                2. Type & Add Batch Year for {selectedProgramme.code} ({selectedProgramme.name})
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                    Type Start Year (Numeric, &gt; 2020) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2025"
                    value={startYearInput}
                    onChange={(e) => handleStartYearChange(e.target.value)}
                    className="form-input"
                    style={{ height: '42px', fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                    Type End Year (Numeric, &gt; Start Year) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2029"
                    value={endYearInput}
                    onChange={(e) => handleEndYearChange(e.target.value)}
                    className="form-input"
                    style={{ height: '42px', fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateBatchInline}
                  style={{
                    height: '42px',
                    padding: '0 22px',
                    fontSize: '13px',
                    fontWeight: '800',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                    color: '#ffffff',
                  }}
                >
                  + Add Batch Year
                </button>
              </div>

              {/* Validation Warning */}
              {validationError && (
                <div style={{ marginTop: '12px', color: '#dc2626', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} /> {validationError}
                </div>
              )}

              {/* Active Created Batch Confirmation */}
              {activeBatchObj && (
                <div style={{ marginTop: '16px', background: '#f0fdf4', padding: '12px 16px', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '12.5px', color: '#15803d', fontWeight: '700' }}>
                    Active Created Batch: <strong>{activeBatchObj.name}</strong> under {selectedProgramme.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PROGRAMME OUTCOMES VERIFICATION */}
        {currentStep === 2 && (
          <div>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Step 2: PO, PSO & PEO Outcomes Framework
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Verify active Program Outcomes (POs), PSOs, and Program Educational Objectives (PEOs) for {selectedProgramme.name}.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Program Outcomes</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#4f46e5', marginTop: '4px' }}>{activePOs.length} POs Configured</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Program Specific Outcomes</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#059669', marginTop: '4px' }}>{activePSOs.length} PSOs Configured</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Program Educational Objectives</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7', marginTop: '4px' }}>{activePEOs.length} PEOs Configured</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: COURSE & COORDINATOR ALLOCATION */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Step 3: Course Management & Coordinator Allocation
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Assign Course Coordinators to each course under {selectedProgramme.name}.
              </p>
            </div>

            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px', textAlign: 'center' }}>Code</th>
                  <th>Course Name</th>
                  <th style={{ width: '280px' }}>Assign Course Coordinator</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td style={{ textAlign: 'center', fontWeight: '900', color: '#4f46e5' }}>{c.code}</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{c.name}</td>
                    <td>
                      <select
                        value={c.coordinator || c.faculty.split('/')[0].trim()}
                        onChange={(e) => assignCourseCoordinator(c.id, e.target.value)}
                        className="form-input"
                        style={{ height: '36px', fontSize: '12.5px', fontWeight: '700', color: '#4f46e5' }}
                      >
                        {MASTER_FACULTY_LIST.map((fac) => (
                          <option key={fac} value={fac}>{fac}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STEP 4: FINAL REVIEW & FINISH */}
        {currentStep === 4 && (
          <div>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Step 4: Final Review & Setup Verification
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Review complete HOD setup before saving and returning to the dashboard.
              </p>
            </div>

            <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', padding: '18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={24} style={{ color: '#10b981' }} />
              <div>
                <strong style={{ fontSize: '14px', color: '#15803d' }}>
                  ✓ Setup Complete for {selectedProgramme.name}!
                </strong>
                <div style={{ fontSize: '12.5px', color: '#166534', marginTop: '2px' }}>
                  Created Batch: {activeBatchObj?.name} • Outcomes & Coordinators assigned.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── WORKFLOW ACTION FOOTER (PREVIOUS ON EXTREME LEFT, SAVE & CONTINUE ON RIGHT WITH WHITE TEXT) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          background: '#ffffff',
          padding: '16px 24px',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        {/* EXTREME LEFT: PREVIOUS BUTTON */}
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevStep}
              style={{
                height: '42px',
                padding: '0 22px',
                fontSize: '13px',
                fontWeight: '700',
                gap: '8px',
                color: '#0f172a',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <ArrowLeft size={16} /> Previous
            </button>
          )}
        </div>

        {/* EXTREME RIGHT: SAVE & CONTINUE / FINISH BUTTON WITH WHITE TEXT */}
        <div>
          {currentStep < 4 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNextStep}
              style={{
                height: '44px',
                padding: '0 26px',
                fontSize: '13.5px',
                fontWeight: '800',
                gap: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 8px 20px rgba(79,70,229,0.3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Save size={16} style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>Save & Continue to Next Task</span>
              <ArrowRight size={16} style={{ color: '#ffffff' }} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFinishWorkflow}
              style={{
                height: '46px',
                padding: '0 28px',
                fontSize: '14px',
                fontWeight: '900',
                gap: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 8px 20px rgba(16,185,129,0.3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Sparkles size={18} style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>Finish & Return to Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
