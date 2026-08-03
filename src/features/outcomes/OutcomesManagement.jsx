import { useState, useEffect } from 'react';
import { Target, FileSpreadsheet, Plus, Trash2, Save } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

export default function OutcomesManagement() {
  const { role } = useAuth();
  const {
    programmeId,
    selectedProgramme,
    courseId,
    selectedCourse,
    activePOs,
    activePSOs,
    activeCOs,
    updateProgrammePOs,
    updateProgrammePSOs,
    updateCourseCOs,
  } = useAcademic();

  const [entryMode, setEntryMode] = useState('table');

  // Role Restriction: HOD and FACULTY can ONLY access Course Outcomes (CO) tab (not PO or PSO)
  const isLimitedUser = role === 'HOD' || role === 'FACULTY';
  const initialTab = isLimitedUser ? 'cos' : 'pos';
  const [activeOutcomeTab, setActiveOutcomeTab] = useState(initialTab);

  useEffect(() => {
    if (isLimitedUser && activeOutcomeTab !== 'cos') {
      setActiveOutcomeTab('cos');
    }
  }, [role, activeOutcomeTab, isLimitedUser]);

  // PO & Competency Handlers
  const handleAddPO = () => {
    const newPoNum = activePOs.length + 1;
    const newPo = {
      code: `PO${newPoNum}`,
      statement: `New Programme Outcome ${newPoNum} Statement...`,
      competencies: [
        { id: `comp-po${newPoNum}-1`, order: 1, statement: `Demonstrate competence statement for PO${newPoNum}` },
      ],
    };
    updateProgrammePOs(programmeId, [...activePOs, newPo]);
  };

  const handleUpdatePOCode = (index, newCode) => {
    const updated = activePOs.map((p, i) => (i === index ? { ...p, code: newCode } : p));
    updateProgrammePOs(programmeId, updated);
  };

  const handleUpdatePOStatement = (index, newStatement) => {
    const updated = activePOs.map((p, i) => (i === index ? { ...p, statement: newStatement } : p));
    updateProgrammePOs(programmeId, updated);
  };

  const handleDeletePO = (index) => {
    const updated = activePOs.filter((_, i) => i !== index);
    updateProgrammePOs(programmeId, updated);
  };

  const handleAddPOCompetency = (poIndex) => {
    const updated = activePOs.map((p, i) => {
      if (i === poIndex) {
        const comps = p.competencies || [];
        return {
          ...p,
          competencies: [
            ...comps,
            { id: `comp-${Date.now()}`, order: comps.length + 1, statement: 'New Competency Statement...' },
          ],
        };
      }
      return p;
    });
    updateProgrammePOs(programmeId, updated);
  };

  const handleUpdatePOCompetencyStatement = (poIndex, compIndex, newStatement) => {
    const updated = activePOs.map((p, i) => {
      if (i === poIndex) {
        const comps = [...(p.competencies || [])];
        comps[compIndex] = { ...comps[compIndex], statement: newStatement };
        return { ...p, competencies: comps };
      }
      return p;
    });
    updateProgrammePOs(programmeId, updated);
  };

  const handleDeletePOCompetency = (poIndex, compIndex) => {
    const updated = activePOs.map((p, i) => {
      if (i === poIndex) {
        const comps = (p.competencies || []).filter((_, ci) => ci !== compIndex);
        return { ...p, competencies: comps.map((c, idx) => ({ ...c, order: idx + 1 })) };
      }
      return p;
    });
    updateProgrammePOs(programmeId, updated);
  };

  // PSO & Competency Handlers
  const handleAddPSO = () => {
    const newPsoNum = activePSOs.length + 1;
    const newPso = {
      code: `PSO${newPsoNum}`,
      statement: `New Programme Specific Outcome ${newPsoNum} Statement...`,
      competencies: [
        { id: `psocomp-${newPsoNum}-1`, order: 1, statement: `Demonstrate competence statement for PSO${newPsoNum}` },
      ],
    };
    updateProgrammePSOs(programmeId, [...activePSOs, newPso]);
  };

  const handleUpdatePSOCode = (index, newCode) => {
    const updated = activePSOs.map((p, i) => (i === index ? { ...p, code: newCode } : p));
    updateProgrammePSOs(programmeId, updated);
  };

  const handleUpdatePSOStatement = (index, newStatement) => {
    const updated = activePSOs.map((p, i) => (i === index ? { ...p, statement: newStatement } : p));
    updateProgrammePSOs(programmeId, updated);
  };

  const handleDeletePSO = (index) => {
    const updated = activePSOs.filter((_, i) => i !== index);
    updateProgrammePSOs(programmeId, updated);
  };

  const handleAddPSOCompetency = (psoIndex) => {
    const updated = activePSOs.map((p, i) => {
      if (i === psoIndex) {
        const comps = p.competencies || [];
        return {
          ...p,
          competencies: [
            ...comps,
            { id: `psocomp-${Date.now()}`, order: comps.length + 1, statement: 'New PSO Competency Statement...' },
          ],
        };
      }
      return p;
    });
    updateProgrammePSOs(programmeId, updated);
  };

  const handleUpdatePSOCompetencyStatement = (psoIndex, compIndex, newStatement) => {
    const updated = activePSOs.map((p, i) => {
      if (i === psoIndex) {
        const comps = [...(p.competencies || [])];
        comps[compIndex] = { ...comps[compIndex], statement: newStatement };
        return { ...p, competencies: comps };
      }
      return p;
    });
    updateProgrammePSOs(programmeId, updated);
  };

  const handleDeletePSOCompetency = (psoIndex, compIndex) => {
    const updated = activePSOs.map((p, i) => {
      if (i === psoIndex) {
        const comps = (p.competencies || []).filter((_, ci) => ci !== compIndex);
        return { ...p, competencies: comps.map((c, idx) => ({ ...c, order: idx + 1 })) };
      }
      return p;
    });
    updateProgrammePSOs(programmeId, updated);
  };

  // CO Handlers
  const handleAddCO = () => {
    const newCoNum = activeCOs.length + 1;
    const newCo = {
      code: `C321.${newCoNum}`,
      statement: `New Course Outcome ${newCoNum} Statement...`,
    };
    updateCourseCOs(courseId, [...activeCOs, newCo]);
  };

  const handleUpdateCOCode = (index, newCode) => {
    const updated = activeCOs.map((c, i) => (i === index ? { ...c, code: newCode } : c));
    updateCourseCOs(courseId, updated);
  };

  const handleUpdateCOStatement = (index, newStatement) => {
    const updated = activeCOs.map((c, i) => (i === index ? { ...c, statement: newStatement } : c));
    updateCourseCOs(courseId, updated);
  };

  const handleDeleteCO = (index) => {
    const updated = activeCOs.filter((_, i) => i !== index);
    updateCourseCOs(courseId, updated);
  };

  const handleSaveChanges = (outcomeType) => {
    alert(`Changes to ${outcomeType} saved successfully!`);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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
              <Target size={24} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
                Outcome Management (Module 3) — {role} Access
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#bfdbfe' }}>
                Programme: <strong>{selectedProgramme?.code}</strong> • Course: <strong>{selectedCourse?.code} - {selectedCourse?.name}</strong> ({activeCOs.length} COs)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '10px' }}>
            <button
              className={`btn ${entryMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ color: entryMode === 'table' ? '#fff' : '#bfdbfe' }}
              onClick={() => setEntryMode('table')}
            >
              📝 Table Entry
            </button>
            <button
              className="btn btn-ghost"
              style={{ color: '#bfdbfe' }}
              onClick={() => alert('Excel Import Modal')}
            >
              <FileSpreadsheet size={15} /> Import Excel
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs with Role-Based Visibility */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {/* PO & PSO Tabs are visible ONLY to SUPER_ADMIN */}
        {role === 'SUPER_ADMIN' && (
          <>
            <button
              className={`btn ${activeOutcomeTab === 'pos' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveOutcomeTab('pos')}
            >
              Programme Outcomes (PO & Competencies)
            </button>
            <button
              className={`btn ${activeOutcomeTab === 'psos' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveOutcomeTab('psos')}
            >
              Programme Specific Outcomes (PSO & Competencies)
            </button>
          </>
        )}

        {/* CO Tab is accessible to ALL roles (SUPER_ADMIN, HOD, FACULTY) */}
        <button
          className={`btn ${activeOutcomeTab === 'cos' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveOutcomeTab('cos')}
        >
          Course Outcomes (CO)
        </button>
      </div>

      {/* TAB 1: Programme Outcomes (SUPER_ADMIN ONLY) */}
      {activeOutcomeTab === 'pos' && role === 'SUPER_ADMIN' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                POs & Competencies for {selectedProgramme?.name} ({selectedProgramme?.code})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Competencies have statements only (no codes).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-success" onClick={handleAddPO}>
                <Plus size={15} /> Add New PO
              </button>
              <button className="btn btn-primary" onClick={() => handleSaveChanges('PO & Competencies')}>
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>

          {activePOs.map((po, index) => {
            const comps = po.competencies || [
              { id: `comp-${index}-1`, order: 1, statement: 'Demonstrate competence in knowledge of basic & applied mathematics' },
              { id: `comp-${index}-2`, order: 2, statement: 'Demonstrate competence in engineering fundamentals' },
            ];

            return (
              <div key={index} className="card" style={{ padding: '18px', borderLeft: '4px solid #2563eb', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '90px', fontWeight: '800', textAlign: 'center', color: '#2563eb' }}
                    value={po.code}
                    onChange={(e) => handleUpdatePOCode(index, e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    style={{ flex: 1, fontWeight: '600' }}
                    value={po.statement}
                    onChange={(e) => handleUpdatePOStatement(index, e.target.value)}
                  />
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

                <div style={{ marginLeft: '20px', borderLeft: '2px solid #e2e8f0', paddingLeft: '16px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Competencies ({comps.length})
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Programme Specific Outcomes (SUPER_ADMIN ONLY) */}
      {activeOutcomeTab === 'psos' && role === 'SUPER_ADMIN' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                PSOs & Competencies for {selectedProgramme?.name} ({selectedProgramme?.code})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Competencies have statements only (no codes).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-success" onClick={handleAddPSO}>
                <Plus size={15} /> Add New PSO
              </button>
              <button className="btn btn-primary" onClick={() => handleSaveChanges('PSO & Competencies')}>
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>

          {activePSOs.map((pso, index) => {
            const comps = pso.competencies || [
              { id: `psocomp-${index}-1`, order: 1, statement: 'Demonstrate the ability to analyze software and hardware systems' },
            ];

            return (
              <div key={index} className="card" style={{ padding: '18px', borderLeft: '4px solid #0284c7', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '90px', fontWeight: '800', textAlign: 'center', color: '#0284c7' }}
                    value={pso.code}
                    onChange={(e) => handleUpdatePSOCode(index, e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    style={{ flex: 1, fontWeight: '600' }}
                    value={pso.statement}
                    onChange={(e) => handleUpdatePSOStatement(index, e.target.value)}
                  />
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

                <div style={{ marginLeft: '20px', borderLeft: '2px solid #e2e8f0', paddingLeft: '16px' }}>
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Course Outcomes (Accessible to SUPER_ADMIN, HOD, and FACULTY) */}
      {activeOutcomeTab === 'cos' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Course Outcomes (COs) for {selectedCourse?.code} - {selectedCourse?.name}</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Course Code is filled by teacher (named as <strong>code</strong>, e.g. `C321.1` or `CO1`).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-success" onClick={handleAddCO}>
                <Plus size={14} /> Add New CO
              </button>
              <button className="btn btn-primary" onClick={() => handleSaveChanges('Course Outcomes')}>
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>

          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                <th style={{ width: '140px' }}>CO Code</th>
                <th>Course Outcome Statement</th>
                <th style={{ width: '70px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeCOs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No Course Outcomes defined for this course yet. Click "+ Add New CO".
                  </td>
                </tr>
              ) : (
                activeCOs.map((co, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontWeight: '800', color: '#10b981' }}
                        value={co.code}
                        onChange={(e) => handleUpdateCOCode(index, e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={co.statement}
                        onChange={(e) => handleUpdateCOStatement(index, e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn btn-danger" style={{ padding: '4px 6px' }} onClick={() => handleDeleteCO(index)}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
