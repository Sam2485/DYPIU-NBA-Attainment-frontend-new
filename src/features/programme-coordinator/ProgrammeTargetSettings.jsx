import { useState, useEffect } from 'react';
import { Save, Check, ChevronDown, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import {
  getProgrammes,
  getProgrammePOs,
  getProgrammePSOs,
  getProgrammeTargets,
  saveProgrammeTargets,
} from '../../api/academic';

// ── Style tokens ─────────────────────────────────────────────────────────────
const surface    = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink        = '#0f172a';
const muted      = '#64748b';
const accent     = '#4f46e5';
const inputStyle = {
  height: '40px', fontSize: '13px', border: '1px solid #e2e8f0',
  borderRadius: '8px', padding: '0 12px', background: '#ffffff',
  color: ink, width: '100%', outline: 'none', fontFamily: 'inherit',
};

const TARGET_INPUT = {
  type: 'number', min: 1, max: 3, step: 0.1,
  style: { height: '36px', width: '90px', fontSize: '13.5px', fontWeight: '700', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontFamily: 'inherit', textAlign: 'center', color: accent, background: '#ffffff' },
};

export default function ProgrammeTargetSettings() {
  const { user } = useAuth();
  const {
    masterProgrammes    = [],
    poPsoTargets        = {},
    updatePoPsoTargets  = () => {},
  } = useAcademic();

  const [programmesList, setProgrammesList] = useState([]);
  const [selectedProgId, setSelectedProgId] = useState('');
  const [activePOsList, setActivePOsList] = useState([]);
  const [activePSOsList, setActivePSOsList] = useState([]);

  const [isLoadingProgrammes, setIsLoadingProgrammes] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [poTargetDraft, setPoTargetDraft] = useState({});
  const [psoTargetDraft, setPsoTargetDraft] = useState({});

  // 1. Load programmes assigned under Programme Coordinator on initial mount
  useEffect(() => {
    let isMounted = true;
    const fetchInitialProgrammes = async () => {
      setIsLoadingProgrammes(true);
      try {
        const progRes = await getProgrammes('', '', user?.email);
        const rawProgs = progRes?.data?.data || progRes?.data || [];
        if (isMounted) {
          const allProgs = Array.isArray(rawProgs) && rawProgs.length > 0 ? rawProgs : masterProgrammes;
          const userEmail = user?.email?.toLowerCase();
          const userAssigned = allProgs.filter(
            (p) =>
              (p.coordinatorEmail && p.coordinatorEmail.toLowerCase() === userEmail) ||
              (p.coordinator && p.coordinator.toLowerCase() === userEmail)
          );
          const finalProgs = userAssigned.length > 0 ? userAssigned : allProgs;
          setProgrammesList(finalProgs);

          if (finalProgs.length > 0 && !selectedProgId) {
            setSelectedProgId(finalProgs[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load programmes for target settings:', err);
      } finally {
        if (isMounted) setIsLoadingProgrammes(false);
      }
    };

    fetchInitialProgrammes();
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // 2. Fetch POs, PSOs, and backend Target Benchmark Levels when selected programme changes
  useEffect(() => {
    if (!selectedProgId) return;

    let isMounted = true;
    const fetchTargetsAndOutcomes = async () => {
      setIsLoadingDetails(true);
      setSaved(false);
      try {
        const [poRes, psoRes, targetRes] = await Promise.allSettled([
          getProgrammePOs(selectedProgId),
          getProgrammePSOs(selectedProgId),
          getProgrammeTargets(selectedProgId),
        ]);

        if (isMounted) {
          let pos = [];
          let psos = [];
          if (poRes.status === 'fulfilled') {
            const rawPOs = poRes.value?.data?.data || poRes.value?.data || [];
            pos = Array.isArray(rawPOs) ? rawPOs : [];
            setActivePOsList(pos);
          }
          if (psoRes.status === 'fulfilled') {
            const rawPSOs = psoRes.value?.data?.data || psoRes.value?.data || [];
            psos = Array.isArray(rawPSOs) ? rawPSOs : [];
            setActivePSOsList(psos);
          }

          let fetchedPoTargets = {};
          let fetchedPsoTargets = {};
          if (targetRes.status === 'fulfilled') {
            const targetDto = targetRes.value?.data?.data || targetRes.value?.data || {};
            fetchedPoTargets = targetDto.poTargets || {};
            fetchedPsoTargets = targetDto.psoTargets || {};
          }

          const seedContextTargets = poPsoTargets[selectedProgId] || {};
          const seedContextPOs = seedContextTargets.poTargets || {};
          const seedContextPSOs = seedContextTargets.psoTargets || {};

          const poDraft = {};
          pos.forEach((po) => {
            poDraft[po.code] = fetchedPoTargets[po.code] ?? seedContextPOs[po.code] ?? 2.0;
          });

          const psoDraft = {};
          psos.forEach((pso) => {
            psoDraft[pso.code] = fetchedPsoTargets[pso.code] ?? seedContextPSOs[pso.code] ?? 2.0;
          });

          setPoTargetDraft(poDraft);
          setPsoTargetDraft(psoDraft);
        }
      } catch (err) {
        console.warn('Failed to load targets for programme', selectedProgId, err);
      } finally {
        if (isMounted) setIsLoadingDetails(false);
      }
    };

    fetchTargetsAndOutcomes();
    return () => {
      isMounted = false;
    };
  }, [selectedProgId]);

  const selectedProgramme =
    programmesList.find((p) => p.id === selectedProgId) ||
    programmesList[0] ||
    { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  const normPSOs = activePSOsList.map((p) => ({ ...p, competencies: p.competencies ?? [] }));

  const handleSave = async () => {
    if (!selectedProgId) return;
    setIsSaving(true);
    try {
      await saveProgrammeTargets(selectedProgId, {
        programmeId: selectedProgId,
        poTargets: poTargetDraft,
        psoTargets: psoTargetDraft,
      });

      updatePoPsoTargets(selectedProgId, poTargetDraft, psoTargetDraft);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error('Failed to save targets to backend:', err);
      alert('Failed to save target levels to backend database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Programme Coordinator &nbsp;·&nbsp; Target Settings
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            PO &amp; PSO Target Levels
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            Set benchmark target levels (1.0 – 3.0 scale) for <strong>{selectedProgramme.name}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Programme selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedProgId}
              onChange={(e) => setSelectedProgId(e.target.value)}
              disabled={isLoadingProgrammes}
              style={{ height: '38px', paddingLeft: '12px', paddingRight: '32px', fontSize: '12.5px', fontWeight: '600', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', color: ink, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none', maxWidth: '300px' }}
            >
              {programmesList.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{ height: '38px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: saved ? '#16a34a' : accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit', transition: 'background .2s', opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? (
              <><Loader2 size={14} className="spin" /> Saving...</>
            ) : saved ? (
              <><Check size={14} /> Saved</>
            ) : (
              <><Save size={14} /> Save Targets</>
            )}
          </button>
        </div>
      </div>

      {/* ── NO OUTCOMES WARNING ────────────────────────────────────────────── */}
      {!isLoadingDetails && activePOsList.length === 0 && normPSOs.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400e' }}>No POs or PSOs defined yet</div>
            <div style={{ fontSize: '12px', color: '#b45309', marginTop: '1px' }}>Ask your HOD to add Programme Outcomes before setting targets.</div>
          </div>
        </div>
      )}

      {/* ── SAVED CONFIRMATION ─────────────────────────────────────────────── */}
      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
          <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>
            Target levels saved successfully to backend for {selectedProgramme.name}.
          </span>
        </div>
      )}

      {/* ── PO TARGETS TABLE ───────────────────────────────────────────────── */}
      {isLoadingDetails ? (
        <div style={{ ...surface, padding: '32px', textAlign: 'center', color: muted, fontSize: '12.5px' }}>
          Loading target levels from backend database...
        </div>
      ) : (
        <>
          {activePOsList.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Programme Outcomes — Target Levels ({activePOsList.length} POs)
              </div>
              <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
                <table className="audit-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>PO</th>
                      <th>Statement</th>
                      <th style={{ width: '160px', textAlign: 'center' }}>Target Level (1.0 – 3.0)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePOsList.map((po) => (
                      <tr key={po.code}>
                        <td style={{ textAlign: 'center', fontWeight: '700', color: accent }}>{po.code}</td>
                        <td style={{ fontSize: '12.5px', color: ink }}>{po.statement}</td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            {...TARGET_INPUT}
                            style={{ ...TARGET_INPUT.style, color: accent }}
                            value={poTargetDraft[po.code] ?? 2.0}
                            onChange={(e) => {
                              setSaved(false);
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) setPoTargetDraft((prev) => ({ ...prev, [po.code]: v }));
                            }}
                            onBlur={(e) => {
                              const v = Math.min(3, Math.max(1, parseFloat(e.target.value) || 1));
                              setPoTargetDraft((prev) => ({ ...prev, [po.code]: Math.round(v * 10) / 10 }));
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PSO TARGETS TABLE ──────────────────────────────────────────────── */}
          {normPSOs.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Programme Specific Outcomes — Target Levels ({normPSOs.length} PSOs)
              </div>
              <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
                <table className="audit-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>PSO</th>
                      <th>Statement</th>
                      <th style={{ width: '160px', textAlign: 'center' }}>Target Level (1.0 – 3.0)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normPSOs.map((pso) => (
                      <tr key={pso.code}>
                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#059669' }}>{pso.code}</td>
                        <td style={{ fontSize: '12.5px', color: ink }}>{pso.statement}</td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            {...TARGET_INPUT}
                            style={{ ...TARGET_INPUT.style, color: '#059669' }}
                            value={psoTargetDraft[pso.code] ?? 2.0}
                            onChange={(e) => {
                              setSaved(false);
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) setPsoTargetDraft((prev) => ({ ...prev, [pso.code]: v }));
                            }}
                            onBlur={(e) => {
                              const v = Math.min(3, Math.max(1, parseFloat(e.target.value) || 1));
                              setPsoTargetDraft((prev) => ({ ...prev, [pso.code]: Math.round(v * 10) / 10 }));
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CURRENT TARGETS SUMMARY ────────────────────────────────────────── */}
          {(activePOsList.length > 0 || normPSOs.length > 0) && (
            <div style={{ ...surface, padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Current Target Summary
              </div>
              {activePOsList.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '6px' }}>PO Targets</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {activePOsList.map((po) => (
                      <div key={po.code} style={{ ...surface, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: accent }}>{po.code}</span>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>{(poTargetDraft[po.code] ?? 2.0).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {normPSOs.length > 0 && (
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '6px' }}>PSO Targets</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {normPSOs.map((pso) => (
                      <div key={pso.code} style={{ ...surface, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>{pso.code}</span>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>{(psoTargetDraft[pso.code] ?? 2.0).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
