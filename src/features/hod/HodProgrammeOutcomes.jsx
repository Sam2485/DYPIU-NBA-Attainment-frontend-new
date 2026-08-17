import { useState, useEffect } from 'react';
import { Plus, Trash2, X, CheckCircle2, ChevronDown, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import {
  getHodDepartmentSummary,
  getProgrammes,
  getProgrammePOs,
  saveProgrammePOs,
  getProgrammePSOs,
  saveProgrammePSOs,
  getProgrammePEOs,
  saveProgrammePEOs,
} from '../../api/academic';

// ── Style tokens ─────────────────────────────────────────────────────────────
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

const DEFAULT_POS = [];
const DEFAULT_PSOS = [];
const DEFAULT_PEOS = [];

export default function HodProgrammeOutcomes() {
  const { user } = useAuth();

  const [programmesList, setProgrammesList] = useState([]);
  const [programmeId, setProgrammeId] = useState('');
  const [activePOs, setActivePOs] = useState([]);
  const [activePSOs, setActivePSOs] = useState([]);
  const [activePEOs, setActivePEOs] = useState([]);

  const [activeTab, setActiveTab] = useState('PO');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    onConfirm: () => {},
  });

  const selectedProgramme =
    programmesList.find((p) => p.id === programmeId) ||
    programmesList[0] ||
    null;

  // Load HOD department and programmes
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        let deptId = '';
        if (user?.email) {
          const summaryRes = await getHodDepartmentSummary(user.email);
          const summaryData = summaryRes?.data?.data || summaryRes?.data || summaryRes;
          if (summaryData?.deptId) {
            deptId = summaryData.deptId;
          }
        }
        const progRes = await getProgrammes('', deptId);
        const progList = progRes?.data?.programmes || progRes?.programmes || progRes?.data?.data || progRes?.data || [];
        if (isMounted && Array.isArray(progList) && progList.length > 0) {
          setProgrammesList(progList);
          setProgrammeId((prev) => prev || progList[0].id);
        }
      } catch (err) {
        console.warn('Failed to load initial programmes for Programme Outcomes:', err);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

const sortOutcomesNaturally = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list]
    .map((item) => {
      if (item.competencies && Array.isArray(item.competencies)) {
        return {
          ...item,
          competencies: [...item.competencies].sort((c1, c2) =>
            (c1.code || '').localeCompare(c2.code || '', undefined, { numeric: true, sensitivity: 'base' })
          ),
        };
      }
      return item;
    })
    .sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true, sensitivity: 'base' }));
};

  // Fetch POs, PSOs, PEOs for selected programme
  useEffect(() => {
    let isMounted = true;
    const fetchProgrammeOutcomes = async () => {
      if (!programmeId) return;
      try {
        const [poRes, psoRes, peoRes] = await Promise.allSettled([
          getProgrammePOs(programmeId),
          getProgrammePSOs(programmeId),
          getProgrammePEOs(programmeId),
        ]);

        if (isMounted) {
          const poList = poRes.status === 'fulfilled' ? (poRes.value?.data?.pos || poRes.value?.pos || poRes.value?.data?.data || poRes.value?.data || []) : [];
          setActivePOs(sortOutcomesNaturally(Array.isArray(poList) ? poList : []));

          const psoList = psoRes.status === 'fulfilled' ? (psoRes.value?.data?.psos || psoRes.value?.psos || psoRes.value?.data?.data || psoRes.value?.data || []) : [];
          setActivePSOs(sortOutcomesNaturally(Array.isArray(psoList) ? psoList : []));

          const peoList = peoRes.status === 'fulfilled' ? (peoRes.value?.data?.peos || peoRes.value?.peos || peoRes.value?.data?.data || peoRes.value?.data || []) : [];
          setActivePEOs(sortOutcomesNaturally(Array.isArray(peoList) ? peoList : []));
        }
      } catch (err) {
        console.warn('Failed to fetch outcome framework data:', err);
      }
    };

    fetchProgrammeOutcomes();
    return () => {
      isMounted = false;
    };
  }, [programmeId]);

  const handleSaveOutcomes = async () => {
    if (!programmeId) return;
    setIsSaving(true);
    try {
      await Promise.all([
        saveProgrammePOs(programmeId, activePOs),
        saveProgrammePSOs(programmeId, activePSOs),
        saveProgrammePEOs(programmeId, activePEOs),
      ]);
      setToastMessage(`🎉 Outcomes (POs, PSOs, PEOs) saved successfully for ${selectedProgramme.name}!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Failed to save outcomes:', err);
      alert('Failed to save outcomes to server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerDeleteConfirm = ({ title, itemName, description, onConfirm }) => {
    setDeleteModalConfig({
      isOpen: true,
      title,
      itemName,
      description,
      onConfirm: () => {
        onConfirm();
        setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // ── PO HANDLERS ─────────────────────────────────────────────────────────────
  const handleAddPO = () => {
    const n = activePOs.length + 1;
    const newPo = {
      code: `PO${n}`,
      statement: `New Programme Outcome ${n}...`,
      status: 'VERIFIED',
      competencies: [{ id: `comp-PO${n}-1`, statement: `Competency 1 for PO${n}` }],
    };
    setActivePOs([...activePOs, newPo]);
  };

  const handleUpdatePOCode = (i, v) => {
    setActivePOs(activePOs.map((p, idx) => (idx === i ? { ...p, code: v } : p)));
  };
  const handleUpdatePOStatement = (i, v) => {
    setActivePOs(activePOs.map((p, idx) => (idx === i ? { ...p, statement: v } : p)));
  };
  const handleDeletePO = (i) => {
    const item = activePOs[i];
    triggerDeleteConfirm({
      title: 'Delete Programme Outcome?',
      itemName: item?.code,
      description: 'This action cannot be undone. This PO mapping will be permanently removed.',
      onConfirm: () => setActivePOs(activePOs.filter((_, idx) => idx !== i)),
    });
  };
  const handleAddPOCompetency = (pi) => {
    setActivePOs(
      activePOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = p.competencies || [];
        const n = comps.length + 1;
        return { ...p, competencies: [...comps, { id: `comp-${p.code}-${n}`, statement: `Competency ${n} for ${p.code}` }] };
      }),
    );
  };
  const handleUpdatePOCompetency = (pi, ci, v) => {
    setActivePOs(
      activePOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = [...(p.competencies || [])];
        comps[ci] = { ...comps[ci], statement: v };
        return { ...p, competencies: comps };
      }),
    );
  };
  const handleDeletePOCompetency = (pi, ci) => {
    setActivePOs(
      activePOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = (p.competencies || []).filter((_, c) => c !== ci);
        return { ...p, competencies: comps };
      }),
    );
  };

  // ── PSO HANDLERS ────────────────────────────────────────────────────────────
  const normalisedPSOs = activePSOs.map((pso) => ({
    ...pso,
    competencies: pso.competencies ?? [],
  }));

  const handleAddPSO = () => {
    const n = normalisedPSOs.length + 1;
    const newPso = {
      code: `PSO${n}`,
      statement: `New Programme Specific Outcome ${n}...`,
      competencies: [{ id: `psocomp-PSO${n}-1`, statement: `Competency 1 for PSO${n}` }],
    };
    setActivePSOs([...normalisedPSOs, newPso]);
  };

  const handleUpdatePSOCode = (i, v) => {
    setActivePSOs(normalisedPSOs.map((p, idx) => (idx === i ? { ...p, code: v } : p)));
  };
  const handleUpdatePSOStatement = (i, v) => {
    setActivePSOs(normalisedPSOs.map((p, idx) => (idx === i ? { ...p, statement: v } : p)));
  };
  const handleDeletePSO = (i) => {
    const item = normalisedPSOs[i];
    triggerDeleteConfirm({
      title: 'Delete Programme Specific Outcome?',
      itemName: item?.code,
      description: 'This action cannot be undone. This PSO mapping will be permanently removed.',
      onConfirm: () => setActivePSOs(normalisedPSOs.filter((_, idx) => idx !== i)),
    });
  };
  const handleAddPSOCompetency = (pi) => {
    setActivePSOs(
      normalisedPSOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = p.competencies || [];
        const n = comps.length + 1;
        return { ...p, competencies: [...comps, { id: `psocomp-${p.code}-${n}`, statement: `Competency ${n} for ${p.code}` }] };
      }),
    );
  };
  const handleUpdatePSOCompetency = (pi, ci, v) => {
    setActivePSOs(
      normalisedPSOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = [...(p.competencies || [])];
        comps[ci] = { ...comps[ci], statement: v };
        return { ...p, competencies: comps };
      }),
    );
  };
  const handleDeletePSOCompetency = (pi, ci) => {
    setActivePSOs(
      normalisedPSOs.map((p, i) => {
        if (i !== pi) return p;
        const comps = (p.competencies || []).filter((_, c) => c !== ci);
        return { ...p, competencies: comps };
      }),
    );
  };

  // ── PEO HANDLERS ────────────────────────────────────────────────────────────
  const handleAddPEO = () => {
    const n = activePEOs.length + 1;
    setActivePEOs([...activePEOs, { code: `PEO${n}`, statement: `New Programme Educational Objective ${n}...` }]);
  };
  const handleUpdatePEOStatement = (i, v) => {
    setActivePEOs(activePEOs.map((p, idx) => (idx === i ? { ...p, statement: v } : p)));
  };
  const handleDeletePEO = (i) => {
    const item = activePEOs[i];
    triggerDeleteConfirm({
      title: 'Delete Programme Educational Objective?',
      itemName: item?.code,
      description: 'This action cannot be undone. This PEO mapping will be permanently removed.',
      onConfirm: () => setActivePEOs(activePEOs.filter((_, idx) => idx !== i)),
    });
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px', display: 'grid', gap: '16px' }}>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1.5px solid #6ee7b7',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#059669' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── PAGE HEADER ───────────────────────────────────────────────────────── */}
      <div className="banner-dark-gradient" style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderRadius: '14px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '800', color: accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            HOD Portal &nbsp;·&nbsp; Programme Outcomes
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.01em' }}>
            Programme Outcomes
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            {selectedProgramme ? `${selectedProgramme.code} — ${selectedProgramme.name}` : 'No programmes added yet'}
          </p>
        </div>

        {/* Programme selector & Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              disabled={programmesList.length === 0}
              style={{
                height: '40px',
                paddingLeft: '12px',
                paddingRight: '32px',
                fontSize: '13px',
                fontWeight: '700',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: '#ffffff',
                color: ink,
                cursor: programmesList.length === 0 ? 'not-allowed' : 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
                appearance: 'none',
                minWidth: '240px',
              }}
            >
              {programmesList.length === 0 ? (
                <option value="">No programmes added yet</option>
              ) : (
                programmesList.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                ))
              )}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>

          <button
            type="button"
            onClick={handleSaveOutcomes}
            disabled={isSaving}
            style={{
              height: '40px',
              padding: '0 20px',
              borderRadius: '9px',
              border: 'none',
              background: '#4f46e5',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '800',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              fontFamily: 'inherit',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save Outcomes'}
          </button>
        </div>
      </div>

      {/* ── SECTION HEADER + TAB STRIP + ADD BUTTON ──────────────────────────── */}
      <div style={{ ...surface, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
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

      {/* ── DELETE CONFIRM MODAL ──────────────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title={deleteModalConfig.title}
        itemName={deleteModalConfig.itemName}
        description={deleteModalConfig.description}
        confirmText="Delete"
        onConfirm={deleteModalConfig.onConfirm}
        onClose={() => setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
