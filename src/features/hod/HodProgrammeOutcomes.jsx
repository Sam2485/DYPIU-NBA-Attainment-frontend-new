import { useState } from 'react';
import { Layers, Plus, Edit2, CheckCircle2, ShieldCheck, Trash2, Save, X } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function HodProgrammeOutcomes() {
  const {
    masterProgrammes = [],
    programmeId,
    setProgrammeId,
    activePOs = [],
    activePSOs = [],
    activePEOs = [],
    updateProgrammePOs = () => {},
    updateProgrammePSOs = () => {},
    updateProgrammePEOs = () => {},
  } = useAcademic();

  const selectedProgramme = masterProgrammes.find((p) => p.id === programmeId) || masterProgrammes[0] || { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  const [activeTab, setActiveTab] = useState('PO'); // 'PO', 'PSO', 'PEO'
  const [showAddModal, setShowAddModal] = useState(false);

  // New Outcome Form State
  const [code, setCode] = useState('');
  const [statement, setStatement] = useState('');
  const [initialCompStatement, setInitialCompStatement] = useState('');

  // ── PO HANDLERS ─────────────────────────────────────────────────────────────
  const handleAddPO = () => {
    const newNum = activePOs.length + 1;
    const newPo = {
      code: `PO${newNum}`,
      statement: `New Programme Outcome ${newNum} Statement...`,
      status: 'VERIFIED',
      competencies: [
        { id: `comp-PO${newNum}-1`, order: 1, statement: `Demonstrate competency 1 for PO${newNum}` },
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
    if (window.confirm(`Are you sure you want to delete ${activePOs[index].code}?`)) {
      const updated = activePOs.filter((_, i) => i !== index);
      updateProgrammePOs(programmeId, updated);
    }
  };

  const handleAddPOCompetency = (poIndex) => {
    const updated = activePOs.map((p, i) => {
      if (i === poIndex) {
        const comps = p.competencies || [];
        const nextOrder = comps.length + 1;
        const newComp = {
          id: `comp-${p.code}-${nextOrder}`,
          order: nextOrder,
          statement: `Demonstrate competency statement ${nextOrder} for ${p.code}`,
        };
        return { ...p, competencies: [...comps, newComp] };
      }
      return p;
    });
    updateProgrammePOs(programmeId, updated);
  };

  const handleUpdatePOCompetencyStatement = (poIndex, compIndex, statementText) => {
    const updated = activePOs.map((p, i) => {
      if (i === poIndex) {
        const comps = [...(p.competencies || [])];
        comps[compIndex] = { ...comps[compIndex], statement: statementText };
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

  // ── PSO HANDLERS ────────────────────────────────────────────────────────────
  const handleAddPSO = () => {
    const newNum = activePSOs.length + 1;
    const newPso = {
      code: `PSO${newNum}`,
      statement: `New Programme Specific Outcome ${newNum} Statement...`,
      competencies: [
        { id: `psocomp-PSO${newNum}-1`, order: 1, statement: `Demonstrate domain competency 1 for PSO${newNum}` },
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
    if (window.confirm(`Are you sure you want to delete ${activePSOs[index].code}?`)) {
      const updated = activePSOs.filter((_, i) => i !== index);
      updateProgrammePSOs(programmeId, updated);
    }
  };

  const handleAddPSOCompetency = (psoIndex) => {
    const updated = activePSOs.map((p, i) => {
      if (i === psoIndex) {
        const comps = p.competencies || [];
        const nextOrder = comps.length + 1;
        const newComp = {
          id: `psocomp-${p.code}-${nextOrder}`,
          order: nextOrder,
          statement: `Demonstrate specialized competency statement ${nextOrder} for ${p.code}`,
        };
        return { ...p, competencies: [...comps, newComp] };
      }
      return p;
    });
    updateProgrammePSOs(programmeId, updated);
  };

  const handleUpdatePSOCompetencyStatement = (psoIndex, compIndex, statementText) => {
    const updated = activePSOs.map((p, i) => {
      if (i === psoIndex) {
        const comps = [...(p.competencies || [])];
        comps[compIndex] = { ...comps[compIndex], statement: statementText };
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

  // ── PEO HANDLERS ────────────────────────────────────────────────────────────
  const handleAddPEO = () => {
    const newNum = activePEOs.length + 1;
    const newPeo = { code: `PEO${newNum}`, statement: `New Programme Educational Objective ${newNum} Statement...` };
    updateProgrammePEOs(programmeId, [...activePEOs, newPeo]);
  };

  const handleDeletePEO = (index) => {
    if (window.confirm(`Are you sure you want to delete ${activePEOs[index].code}?`)) {
      const updated = activePEOs.filter((_, i) => i !== index);
      updateProgrammePEOs(programmeId, updated);
    }
  };

  // Submit Modal
  const handleAddOutcomeModal = (e) => {
    e.preventDefault();
    if (!code || !statement) {
      alert('Please enter Outcome Code and Statement.');
      return;
    }

    if (activeTab === 'PO') {
      const newPo = {
        code,
        statement,
        status: 'VERIFIED',
        competencies: [
          { id: `comp-${code}-1`, order: 1, statement: initialCompStatement || `Demonstrate competence 1 for ${code}` },
        ],
      };
      updateProgrammePOs(programmeId, [...activePOs, newPo]);
    } else if (activeTab === 'PSO') {
      const newPso = {
        code,
        statement,
        competencies: [
          { id: `psocomp-${code}-1`, order: 1, statement: initialCompStatement || `Demonstrate specialized competency for ${code}` },
        ],
      };
      updateProgrammePSOs(programmeId, [...activePSOs, newPso]);
    } else if (activeTab === 'PEO') {
      updateProgrammePEOs(programmeId, [...activePEOs, { code, statement }]);
    }

    alert(`🎉 New ${activeTab} (${code}) added successfully!`);
    setCode('');
    setStatement('');
    setInitialCompStatement('');
    setShowAddModal(false);
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fef08a', fontWeight: '800', fontSize: '11px' }}>
                HOD PORTAL • OUTCOMES & COMPETENCIES
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              Program Outcomes (POs), PSOs & Competencies Management
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Create and manage POs, PSOs, and nested Competency Statements for {selectedProgramme.name}.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'PO' && (
              <button className="btn btn-primary" onClick={handleAddPO} style={{ height: '40px', padding: '0 20px', fontSize: '12.5px', fontWeight: '800', gap: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <Plus size={16} /> + Propose / Create New PO
              </button>
            )}
            {activeTab === 'PSO' && (
              <button className="btn btn-primary" onClick={handleAddPSO} style={{ height: '40px', padding: '0 20px', fontSize: '12.5px', fontWeight: '800', gap: '8px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                <Plus size={16} /> + Propose / Create New PSO
              </button>
            )}
            {activeTab === 'PEO' && (
              <button className="btn btn-primary" onClick={handleAddPEO} style={{ height: '40px', padding: '0 20px', fontSize: '12.5px', fontWeight: '800', gap: '8px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
                <Plus size={16} /> + Add New PEO
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── PROGRAMME SELECTOR & TAB STRIP ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Select Programme:</span>
            <select
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              className="form-input"
              style={{ height: '38px', fontSize: '13px', fontWeight: '800', color: '#4f46e5', minWidth: '280px' }}
            >
              {masterProgrammes.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          {/* Outcome Type Tab Buttons */}
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            {['PO', 'PSO', 'PEO'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: activeTab === tab ? '#ffffff' : 'transparent',
                  color: activeTab === tab ? '#4f46e5' : '#64748b',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {tab === 'PO' ? `Program Outcomes (POs: ${activePOs.length})` : tab === 'PSO' ? `Program Specific Outcomes (PSOs: ${activePSOs.length})` : `Program Educational Objectives (PEOs: ${activePEOs.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB 1: PO CARDS WITH NESTED COMPETENCY STATEMENTS TABLE ───────────────── */}
      {activeTab === 'PO' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {activePOs.map((po, index) => {
            const comps = po.competencies || [];

            return (
              <div key={index} className="card" style={{ padding: '20px', borderLeft: '4px solid #4f46e5', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '90px', fontWeight: '900', textAlign: 'center', color: '#4f46e5', height: '40px', fontSize: '13.5px' }}
                      value={po.code}
                      onChange={(e) => handleUpdatePOCode(index, e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, minWidth: '200px', fontWeight: '700', height: '40px', fontSize: '13px' }}
                      value={po.statement}
                      onChange={(e) => handleUpdatePOStatement(index, e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800' }}>
                      ✓ Active PO
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px', fontWeight: '700', gap: '4px' }}
                      onClick={() => handleAddPOCompetency(index)}
                    >
                      <Plus size={14} /> + Add Competency
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '6px 10px' }}
                      onClick={() => handleDeletePO(index)}
                      title="Delete PO"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* NESTED COMPETENCY STATEMENTS TABLE */}
                <div style={{ marginLeft: '12px', borderLeft: '2.5px solid #cbd5e1', paddingLeft: '16px', width: '100%' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '800' }}>
                    Competency Statements for {po.code} ({comps.length} Competencies)
                  </h5>

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
                          <td style={{ textAlign: 'center', fontWeight: '800', color: '#4f46e5' }}>
                            {po.code}.{compIdx + 1}
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              style={{ height: '36px', fontSize: '12.5px' }}
                              value={comp.statement}
                              onChange={(e) => handleUpdatePOCompetencyStatement(index, compIdx, e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
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

      {/* ── TAB 2: PSO CARDS WITH NESTED COMPETENCY STATEMENTS TABLE ───────────────── */}
      {activeTab === 'PSO' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {activePSOs.map((pso, index) => {
            const comps = pso.competencies || [];

            return (
              <div key={index} className="card" style={{ padding: '20px', borderLeft: '4px solid #059669', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '90px', fontWeight: '900', textAlign: 'center', color: '#059669', height: '40px', fontSize: '13.5px' }}
                      value={pso.code}
                      onChange={(e) => handleUpdatePSOCode(index, e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, minWidth: '200px', fontWeight: '700', height: '40px', fontSize: '13px' }}
                      value={pso.statement}
                      onChange={(e) => handleUpdatePSOStatement(index, e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800' }}>
                      ✓ Active PSO
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px', fontWeight: '700', gap: '4px' }}
                      onClick={() => handleAddPSOCompetency(index)}
                    >
                      <Plus size={14} /> + Add Competency
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '6px 10px' }}
                      onClick={() => handleDeletePSO(index)}
                      title="Delete PSO"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* NESTED PSO COMPETENCY STATEMENTS TABLE */}
                <div style={{ marginLeft: '12px', borderLeft: '2.5px solid #a7f3d0', paddingLeft: '16px', width: '100%' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '800' }}>
                    PSO Competency Statements for {pso.code} ({comps.length} Competencies)
                  </h5>

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
                          <td style={{ textAlign: 'center', fontWeight: '800', color: '#059669' }}>
                            {pso.code}.{compIdx + 1}
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              style={{ height: '36px', fontSize: '12.5px' }}
                              value={comp.statement}
                              onChange={(e) => handleUpdatePSOCompetencyStatement(index, compIdx, e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
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

      {/* ── TAB 3: PEOs ───────────────────────────────────────────────────────────── */}
      {activeTab === 'PEO' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {activePEOs.map((peo, index) => (
            <div key={index} className="card" style={{ padding: '18px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ fontWeight: '900', color: '#0284c7', fontSize: '14px', width: '70px' }}>{peo.code}</span>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, fontWeight: '700', height: '40px', fontSize: '13px' }}
                  value={peo.statement}
                  onChange={(e) => {
                    const updated = activePEOs.map((p, i) => (i === index ? { ...p, statement: e.target.value } : p));
                    updateProgrammePEOs(programmeId, updated);
                  }}
                />
                <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDeletePEO(index)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD OUTCOME MODAL ──────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '540px', maxWidth: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', padding: '18px 24px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                Add New {activeTab} & Initial Competency Statement
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '18px', fontWeight: '800' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOutcomeModal} style={{ padding: '24px', display: 'grid', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  Outcome Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${activeTab}${activeTab === 'PO' ? activePOs.length + 1 : activeTab === 'PSO' ? activePSOs.length + 1 : activePEOs.length + 1}`}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="form-input"
                  style={{ height: '40px', fontSize: '13px', fontWeight: '800', color: '#4f46e5' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  Outcome Statement *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={`Enter statement for ${activeTab}...`}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '13px', padding: '10px' }}
                />
              </div>

              {(activeTab === 'PO' || activeTab === 'PSO') && (
                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                    Initial Competency Statement ({code ? `${code}.1` : 'Competency 1'})
                  </label>
                  <textarea
                    rows={2}
                    placeholder={`Enter initial competency statement...`}
                    value={initialCompStatement}
                    onChange={(e) => setInitialCompStatement(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '12.5px', padding: '10px' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5' }}>
                  Save Outcome & Competency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
