import { useState } from 'react';
import { Layers, Plus, Edit2, CheckCircle2, ShieldCheck } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState('PO'); // 'PO', 'PSO', 'PEO'
  const [showAddModal, setShowAddModal] = useState(false);

  // New Outcome Form State
  const [code, setCode] = useState('');
  const [statement, setStatement] = useState('');

  const handleAddOutcome = (e) => {
    e.preventDefault();
    if (!code || !statement) {
      alert('Please enter Outcome Code and Statement.');
      return;
    }

    const newOutcome = { code, statement };

    if (activeTab === 'PO') {
      updateProgrammePOs(programmeId, [...activePOs, newOutcome]);
    } else if (activeTab === 'PSO') {
      updateProgrammePSOs(programmeId, [...activePSOs, newOutcome]);
    } else if (activeTab === 'PEO') {
      updateProgrammePEOs(programmeId, [...activePEOs, newOutcome]);
    }

    alert(`🎉 New ${activeTab} (${code}) added successfully!`);
    setCode('');
    setStatement('');
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
                HOD PORTAL • PROGRAMME OUTCOMES
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              Program Outcomes (POs), PSOs & PEOs Management
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Define, edit, and verify Program Outcomes (POs), Program Specific Outcomes (PSOs), and Program Educational Objectives (PEOs).
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ height: '40px', padding: '0 20px', fontSize: '12.5px', fontWeight: '800', gap: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <Plus size={16} /> Add {activeTab} Outcome
          </button>
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
              style={{ height: '38px', fontSize: '13px', fontWeight: '800', color: '#4f46e5', minWidth: '260px' }}
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
                {tab === 'PO' ? 'Program Outcomes (POs)' : tab === 'PSO' ? 'Program Specific Outcomes (PSOs)' : 'Program Educational Objectives (PEOs)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── OUTCOMES LIST TABLE ────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="audit-data-table">
          <thead>
            <tr>
              <th style={{ width: '100px', textAlign: 'center' }}>Code</th>
              <th>Outcome Statement</th>
              <th style={{ width: '160px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'PO' ? activePOs : activeTab === 'PSO' ? activePSOs : activePEOs).map((item, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: 'center', fontWeight: '900', color: '#4f46e5' }}>
                  {item.code}
                </td>
                <td style={{ fontWeight: '600', color: '#0f172a', fontSize: '13px', lineHeight: 1.5 }}>
                  {item.statement}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '11px' }}>
                    ✓ Approved
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '520px', maxWidth: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', padding: '18px 24px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                Add New {activeTab} Statement
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '18px', fontWeight: '800' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOutcome} style={{ padding: '24px', display: 'grid', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '6px', display: 'block' }}>
                  Outcome Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${activeTab}${activeTab === 'PO' ? '13' : '4'}`}
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
                  rows={4}
                  placeholder={`Enter statement for ${activeTab}...`}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '13px', padding: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5' }}>
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
