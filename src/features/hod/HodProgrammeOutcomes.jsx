import { useState } from 'react';
import { Plus, Trash2, X, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

// ── Style tokens (identical to HodSetupWorkflow) ─────────────────────────────
const surface  = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink      = '#0f172a';
const muted    = '#64748b';
const accent   = '#4f46e5';
const inputStyle = {
  height: '40px',
  fontSize: '13px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '0 12px',
  background: '#ffffff',
  color: ink,
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
};
const labelStyle = {
  display: 'block',
  fontSize: '11.5px',
  fontWeight: '600',
  color: muted,
  marginBottom: '5px',
};

export default function HodProgrammeOutcomes() {
  const {
    masterProgrammes = [],
    programmeId,
    setProgrammeId,
    activePOs = [],
    activePSOs = [],
    activePEOs = [],
    updateProgrammePOs  = () => {},
    updateProgrammePSOs = () => {},
    updateProgrammePEOs = () => {},
  } = useAcademic();

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) ||
    masterProgrammes[0] ||
    { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  const [activeTab, setActiveTab] = useState('PO');

  // ── PO HANDLERS ─────────────────────────────────────────────────────────────
  const handleAddPO = () => {
    const n = activePOs.length + 1;
    const newPo = {
      code: `PO${n}`,
      statement: `New Programme Outcome ${n}...`,
      status: 'VERIFIED',
      competencies: [{ id: `comp-PO${n}-1`, order: 1, statement: `Competency 1 for PO${n}` }],
    };
    updateProgrammePOs(programmeId, [...activePOs, newPo]);
  };

  const handleUpdatePOCode = (i, v) => {
    updateProgrammePOs(programmeId, activePOs.map((p, idx) => (idx === i ? { ...p, code: v } : p)));
  };
  const handleUpdatePOStatement = (i, v) => {
    updateProgrammePOs(programmeId, activePOs.map((p, idx) => (idx === i ? { ...p, statement: v } : p)));
  };
  const handleDeletePO = (i) => {
    if (window.confirm(`Delete ${activePOs[i].code}?`))
      updateProgrammePOs(programmeId, activePOs.filter((_, idx) => idx !== i));
  };
  const handleAddPOCompetency = (pi) => {
    updateProgrammePOs(
      programmeId,
      activePOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = p.competencies || [];
        const n = comps.length + 1;
        return { ...p, competencies: [...comps, { id: `comp-${p.code}-${n}`, order: n, statement: `Competency ${n} for ${p.code}` }] };
      }),
    );
  };
  const handleUpdatePOCompetency = (pi, ci, v) => {
    updateProgrammePOs(
      programmeId,
      activePOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = [...(p.competencies || [])];
        comps[ci] = { ...comps[ci], statement: v };
        return { ...p, competencies: comps };
      }),
    );
  };
  const handleDeletePOCompetency = (pi, ci) => {
    updateProgrammePOs(
      programmeId,
      activePOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = (p.competencies || []).filter((_, c) => c !== ci).map((c, idx) => ({ ...c, order: idx + 1 }));
        return { ...p, competencies: comps };
      }),
    );
  };

  // ── PSO HANDLERS ────────────────────────────────────────────────────────────
  // Normalise: ensure every PSO has a competencies array (context seed data may omit it)
  const normalisedPSOs = activePSOs.map((pso) => ({
    ...pso,
    competencies: pso.competencies ?? [],
  }));

  const handleAddPSO = () => {
    const n = normalisedPSOs.length + 1;
    const newPso = {
      code: `PSO${n}`,
      statement: `New Programme Specific Outcome ${n}...`,
      competencies: [{ id: `psocomp-PSO${n}-1`, order: 1, statement: `Competency 1 for PSO${n}` }],
    };
    updateProgrammePSOs(programmeId, [...normalisedPSOs, newPso]);
  };

  const handleUpdatePSOCode = (i, v) => {
    updateProgrammePSOs(programmeId, normalisedPSOs.map((p, idx) => (idx === i ? { ...p, code: v } : p)));
  };
  const handleUpdatePSOStatement = (i, v) => {
    updateProgrammePSOs(programmeId, normalisedPSOs.map((p, idx) => (idx === i ? { ...p, statement: v } : p)));
  };
  const handleDeletePSO = (i) => {
    if (window.confirm(`Delete ${normalisedPSOs[i].code}?`))
      updateProgrammePSOs(programmeId, normalisedPSOs.filter((_, idx) => idx !== i));
  };
  const handleAddPSOCompetency = (pi) => {
    updateProgrammePSOs(
      programmeId,
      normalisedPSOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = p.competencies || [];
        const n = comps.length + 1;
        return { ...p, competencies: [...comps, { id: `psocomp-${p.code}-${n}`, order: n, statement: `Competency ${n} for ${p.code}` }] };
      }),
    );
  };
  const handleUpdatePSOCompetency = (pi, ci, v) => {
    updateProgrammePSOs(
      programmeId,
      normalisedPSOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = [...(p.competencies || [])];
        comps[ci] = { ...comps[ci], statement: v };
        return { ...p, competencies: comps };
      }),
    );
  };
  const handleDeletePSOCompetency = (pi, ci) => {
    updateProgrammePSOs(
      programmeId,
      normalisedPSOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = (p.competencies || []).filter((_, c) => c !== ci).map((c, idx) => ({ ...c, order: idx + 1 }));
        return { ...p, competencies: comps };
      }),
    );
  };

  // ── PEO HANDLERS ────────────────────────────────────────────────────────────
  const handleAddPEO = () => {
    const n = activePEOs.length + 1;
    updateProgrammePEOs(programmeId, [...activePEOs, { code: `PEO${n}`, statement: `New Programme Educational Objective ${n}...` }]);
  };
  const handleUpdatePEOStatement = (i, v) => {
    updateProgrammePEOs(programmeId, activePEOs.map((p, idx) => (idx === i ? { ...p, statement: v } : p)));
  };
  const handleDeletePEO = (i) => {
    if (window.confirm(`Delete ${activePEOs[i].code}?`))
      updateProgrammePEOs(programmeId, activePEOs.filter((_, idx) => idx !== i));
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────────── */}
      <div className="banner-dark-gradient" style={{ padding: '22px 28px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderRadius: '14px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '800', color: accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            HOD Portal &nbsp;·&nbsp; Programme Outcomes
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.01em' }}>
            Programme Outcomes
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            {selectedProgramme.code} &nbsp;—&nbsp; {selectedProgramme.name}
          </p>
        </div>

        {/* Programme selector */}
        <div style={{ position: 'relative' }}>
          <select
            value={programmeId}
            onChange={(e) => setProgrammeId(e.target.value)}
            style={{
              height: '38px',
              paddingLeft: '12px',
              paddingRight: '32px',
              fontSize: '12.5px',
              fontWeight: '600',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#ffffff',
              color: ink,
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit',
              appearance: 'none',
              maxWidth: '300px',
            }}
          >
            {masterProgrammes.map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
        </div>
      </div>

      {/* ── SECTION HEADER + TAB STRIP + ADD BUTTON ──────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Tab strip */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '9px' }}>
          {[
            ['PO',  `POs (${activePOs.length})`],
            ['PSO', `PSOs (${normalisedPSOs.length})`],
            ['PEO', `PEOs (${activePEOs.length})`],
          ].map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '7px 18px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                background: activeTab === tab ? '#ffffff' : 'transparent',
                color: activeTab === tab ? accent : muted,
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Add button */}
        {activeTab === 'PO' && (
          <button
            onClick={handleAddPO}
            style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Add PO
          </button>
        )}
        {activeTab === 'PSO' && (
          <button
            onClick={handleAddPSO}
            style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Add PSO
          </button>
        )}
        {activeTab === 'PEO' && (
          <button
            onClick={handleAddPEO}
            style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Add PEO
          </button>
        )}
      </div>

      {/* ── TAB: PO ───────────────────────────────────────────────────────────── */}
      {activeTab === 'PO' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {activePOs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: muted, fontSize: '12.5px', ...surface }}>
              No POs yet — click <strong>Add PO</strong> above to get started.
            </div>
          )}

          {activePOs.map((po, idx) => (
            <div key={idx} style={{ ...surface, padding: '16px', borderLeft: `3px solid ${accent}` }}>
              {/* PO code + statement row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: po.competencies?.length ? '12px' : 0, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={po.code}
                  onChange={(e) => handleUpdatePOCode(idx, e.target.value)}
                  style={{ ...inputStyle, width: '80px', fontWeight: '700', color: accent, textAlign: 'center' }}
                />
                <input
                  type="text"
                  value={po.statement}
                  onChange={(e) => handleUpdatePOStatement(idx, e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                />
                <button
                  onClick={() => handleAddPOCompetency(idx)}
                  style={{ height: '36px', padding: '0 12px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                >
                  <Plus size={13} /> Competency
                </button>
                <button
                  onClick={() => handleDeletePO(idx)}
                  style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Competencies table */}
              {(po.competencies || []).length > 0 && (
                <div style={{ marginLeft: '8px', paddingLeft: '14px', borderLeft: '2px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Competencies ({(po.competencies || []).length})
                  </div>
                  <table className="audit-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>No.</th>
                        <th>Statement</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(po.competencies || []).map((comp, ci) => (
                        <tr key={comp.id || ci}>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: accent, fontSize: '11.5px' }}>
                            {po.code}.{ci + 1}
                          </td>
                          <td>
                            <input
                              type="text"
                              value={comp.statement}
                              onChange={(e) => handleUpdatePOCompetency(idx, ci, e.target.value)}
                              style={{ ...inputStyle, height: '34px', fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeletePOCompetency(idx, ci)}
                              style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                            >
                              <X size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {/* Inline add button */}
          <button
            onClick={handleAddPO}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1.5px dashed #c7d2fe', background: '#fafafa', color: accent, fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background .15s', fontFamily: 'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#eef2ff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fafafa'; }}
          >
            <Plus size={15} /> Add Programme Outcome (PO{activePOs.length + 1})
          </button>
        </div>
      )}

      {/* ── TAB: PSO ──────────────────────────────────────────────────────────── */}
      {activeTab === 'PSO' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {normalisedPSOs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: muted, fontSize: '12.5px', ...surface }}>
              No PSOs yet — click <strong>Add PSO</strong> above to get started.
            </div>
          )}

          {normalisedPSOs.map((pso, idx) => (
            <div key={idx} style={{ ...surface, padding: '16px', borderLeft: '3px solid #059669' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: pso.competencies.length ? '12px' : 0, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={pso.code}
                  onChange={(e) => handleUpdatePSOCode(idx, e.target.value)}
                  style={{ ...inputStyle, width: '80px', fontWeight: '700', color: '#059669', textAlign: 'center' }}
                />
                <input
                  type="text"
                  value={pso.statement}
                  onChange={(e) => handleUpdatePSOStatement(idx, e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                />
                <button
                  onClick={() => handleAddPSOCompetency(idx)}
                  style={{ height: '36px', padding: '0 12px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                >
                  <Plus size={13} /> Competency
                </button>
                <button
                  onClick={() => handleDeletePSO(idx)}
                  style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {pso.competencies.length > 0 && (
                <div style={{ marginLeft: '8px', paddingLeft: '14px', borderLeft: '2px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Competencies ({pso.competencies.length})
                  </div>
                  <table className="audit-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>No.</th>
                        <th>Statement</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pso.competencies.map((comp, ci) => (
                        <tr key={comp.id || ci}>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: '#059669', fontSize: '11.5px' }}>
                            {pso.code}.{ci + 1}
                          </td>
                          <td>
                            <input
                              type="text"
                              value={comp.statement}
                              onChange={(e) => handleUpdatePSOCompetency(idx, ci, e.target.value)}
                              style={{ ...inputStyle, height: '34px', fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeletePSOCompetency(idx, ci)}
                              style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                            >
                              <X size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={handleAddPSO}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1.5px dashed #6ee7b7', background: '#fafafa', color: '#059669', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background .15s', fontFamily: 'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fafafa'; }}
          >
            <Plus size={15} /> Add Programme Specific Outcome (PSO{normalisedPSOs.length + 1})
          </button>
        </div>
      )}

      {/* ── TAB: PEO ──────────────────────────────────────────────────────────── */}
      {activeTab === 'PEO' && (
        <div style={{ display: 'grid', gap: '10px' }}>
          {activePEOs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: muted, fontSize: '12.5px', ...surface }}>
              No PEOs yet — click <strong>Add PEO</strong> above to get started.
            </div>
          )}

          {activePEOs.map((peo, idx) => (
            <div key={idx} style={{ ...surface, padding: '14px 16px', borderLeft: '3px solid #0284c7', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', width: '52px', flexShrink: 0 }}>{peo.code}</span>
              <input
                type="text"
                value={peo.statement}
                onChange={(e) => handleUpdatePEOStatement(idx, e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => handleDeletePEO(idx)}
                style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddPEO}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1.5px dashed #7dd3fc', background: '#fafafa', color: '#0284c7', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background .15s', fontFamily: 'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f9ff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fafafa'; }}
          >
            <Plus size={15} /> Add Programme Educational Objective (PEO{activePEOs.length + 1})
          </button>
        </div>
      )}
    </div>
  );
}
