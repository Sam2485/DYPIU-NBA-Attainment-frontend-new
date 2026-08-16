import { useState, useEffect } from 'react';
import {
  Save, CheckCircle2, Clock, ShieldCheck, Printer,
  ChevronDown, AlertCircle, Plus, Lock, History, ArrowRight, BookOpen, RefreshCw, Send,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { getProgrammeAtr, saveProgrammeAtr, submitProgrammeAtr } from '../../api/reportsApi';
import { getProgrammeBatchDataset, getProgrammeOverallAttainment } from '../../api/attainmentApi';
import { getBatches } from '../../api/academicApi';

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

export default function ProgrammeATR({ courseId = null, hideFooter = false, hideHeader = false, readOnly = false }) {
  const { role, user } = useAuth();
  const {
    selectedProgramme,
    selectedBatch,
    batches = [],
    academicYear    = '2025-26',
    availableYears  = ['2025-26', '2024-25', '2023-24'],
    activePOs       = [],
    activePSOs      = [],
    programmeId,
  } = useAcademic();

  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'HOD' || role === 'DIRECTOR';

  const [selectedYear, setSelectedYear] = useState(academicYear || '2025-26');
  const [batchesList, setBatchesList] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(selectedBatch?.id || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [atrRecord, setAtrRecord] = useState(null);
  const [atrList, setAtrList] = useState([]);

  const activeProgId = selectedProgramme?.id || programmeId;

  // Load batches for programme
  useEffect(() => {
    let isMounted = true;
    if (activeProgId) {
      getBatches(activeProgId)
        .then((res) => {
          const list = res?.data || res || [];
          if (isMounted && Array.isArray(list)) {
            setBatchesList(list);
            if (!selectedBatchId && list.length > 0) {
              setSelectedBatchId(list[0].id);
            }
          }
        })
        .catch((err) => console.warn('Could not load batches in ProgrammeATR:', err));
    }
    return () => { isMounted = false; };
  }, [activeProgId]);

  // Load real Programme ATR & Dataset from backend
  useEffect(() => {
    let isMounted = true;
    const curBatchId = selectedBatchId || selectedBatch?.id;
    if (!activeProgId || !curBatchId) return;

    setLoading(true);
    Promise.allSettled([
      getProgrammeAtr(activeProgId, curBatchId),
      getProgrammeOverallAttainment(activeProgId, curBatchId),
    ])
      .then(([atrRes, attRes]) => {
        if (!isMounted) return;
        const atrData = atrRes.status === 'fulfilled' ? (atrRes.value?.data || atrRes.value) : null;
        const attData = attRes.status === 'fulfilled' ? (attRes.value?.data || attRes.value) : null;

        if (atrData && Array.isArray(atrData.entries) && atrData.entries.length > 0) {
          setAtrRecord(atrData);
          setAtrList(atrData.entries);
        } else if (attData && Array.isArray(attData.outcomes) && attData.outcomes.length > 0) {
          const items = attData.outcomes.map((out) => {
            const target = Number(out.target || 2.0);
            const actual = Number(out.attainmentScore || out.overallAttainment || out.actual || 0);
            const pct = target > 0 ? Number(((actual / target) * 100).toFixed(1)) : 0;
            const met = actual >= target;
            return {
              code: out.code,
              type: out.type || (out.code?.startsWith('PSO') ? 'PSO' : 'PO'),
              statement: out.statement || `${out.code} Outcome Statement`,
              target,
              actual,
              pct,
              met,
              remark: met ? 'Target achieved. Maintain current pedagogy and assessment structure.' : '',
              actions: met ? [] : [
                `Conduct expert technical sessions and industry workshops for ${out.code}.`,
                'Increase hands-on practical problem sets and continuous evaluation frequency.',
              ],
            };
          });
          setAtrList(items);
        } else {
          // If neither is found, initialize clean outcome targets from database outcomes
          const defaultItems = [
            ...(activePOs || []).map((po) => ({
              code: po.code,
              type: 'PO',
              statement: po.statement,
              target: 2.0,
              actual: 0,
              pct: 0,
              met: false,
              remark: '',
              actions: [`Review assessment methods for ${po.code}`],
            })),
            ...(activePSOs || []).map((pso) => ({
              code: pso.code,
              type: 'PSO',
              statement: pso.statement,
              target: 2.0,
              actual: 0,
              pct: 0,
              met: false,
              remark: '',
              actions: [`Review assessment methods for ${pso.code}`],
            })),
          ];
          setAtrList(defaultItems);
        }
      })
      .catch((err) => {
        console.warn('Error fetching Programme ATR:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeProgId, selectedBatchId, selectedBatch?.id, activePOs, activePSOs]);

  const atrStatus = atrRecord?.status || 'DRAFT';
  const locked = readOnly || atrStatus === 'VERIFIED' || atrStatus === 'APPROVED';

  // ── Save & Submit Handlers ──────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    const curBatchId = selectedBatchId || selectedBatch?.id;
    if (!activeProgId || !curBatchId) return;

    try {
      setSaving(true);
      const payload = {
        programmeId: activeProgId,
        batchId: curBatchId,
        academicYear: selectedYear,
        entries: atrList,
        status: 'DRAFT',
      };
      const res = await saveProgrammeAtr(payload);
      const saved = res?.data || res;
      if (saved) setAtrRecord(saved);
      alert('Programme ATR draft saved successfully!');
    } catch (err) {
      alert('Failed to save Programme ATR: ' + (err.message || 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubmit = async () => {
    const curBatchId = selectedBatchId || selectedBatch?.id;
    if (!activeProgId || !curBatchId) return;

    try {
      setSaving(true);
      const payload = {
        programmeId: activeProgId,
        batchId: curBatchId,
        academicYear: selectedYear,
        entries: atrList,
        status: 'SUBMITTED',
      };
      const res = await saveProgrammeAtr(payload);
      const saved = res?.data || res;
      if (saved?.id) {
        await submitProgrammeAtr(saved.id, 'Submitted for HOD verification');
      }
      setAtrRecord({ ...saved, status: 'SUBMITTED' });
      alert('Programme ATR submitted to Head of Department (HOD) for verification!');
    } catch (err) {
      alert('Failed to submit Programme ATR: ' + (err.message || 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRemark = (idx, v)    => setAtrList((p) => p.map((c, i) => i === idx ? { ...c, remark: v } : c));
  const handleAddAction    = (idx)       => setAtrList((p) => p.map((c, i) => i === idx ? { ...c, actions: [...c.actions, 'New corrective action...'] } : c));
  const handleUpdateAction = (idx, j, v) => setAtrList((p) => p.map((c, i) => { if (i !== idx) return c; const a = [...c.actions]; a[j] = v; return { ...c, actions: a }; }));
  const handleDeleteAction = (idx, j)    => setAtrList((p) => p.map((c, i) => i === idx ? { ...c, actions: c.actions.filter((_, k) => k !== j) } : c));

  const poList  = atrList.filter((i) => i.type === 'PO');
  const psoList = atrList.filter((i) => i.type === 'PSO');

  const renderCard = (item, accentColor) => {
    const idx       = atrList.findIndex((i) => i.code === item.code);
    const borderCol = item.met ? '#bbf7d0' : '#fecaca';
    const bgCol     = item.met ? '#f0fdf4'  : '#fef2f2';

    return (
      <div key={item.code} style={{ border: `1px solid ${borderCol}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: '12px' }}>
        <div style={{ background: bgCol, borderBottom: `1px solid ${borderCol}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>
            <span style={{ color: accentColor, fontWeight: '900', marginRight: '6px' }}>{item.code}:</span>
            {item.statement}
          </span>
          <span style={{ fontSize: '11.5px', fontWeight: '800', color: item.met ? '#15803d' : '#dc2626' }}>
            Target: {item.target?.toFixed(2)} &nbsp;|&nbsp; Actual: {item.actual?.toFixed(2)} &nbsp;({item.pct}% {item.met ? 'Achieved' : 'Gap'})
          </span>
        </div>

        <div style={{ padding: '14px 16px' }}>
          {item.met ? (
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '6px' }}>
                Observations &amp; Pedagogical Remarks:
              </label>
              <textarea
                rows={2}
                disabled={locked}
                value={item.remark}
                onChange={(e) => handleUpdateRemark(idx, e.target.value)}
                style={{ ...inputStyle, height: 'auto', padding: '8px 12px' }}
              />
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#dc2626' }}>
                  Programme-Level Corrective Actions:
                </label>
                {!locked && (
                  <button
                    type="button"
                    onClick={() => handleAddAction(idx)}
                    style={{ fontSize: '11.5px', fontWeight: '700', color: accent, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    + Add Action Item
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                {(item.actions || []).map((act, aIdx) => (
                  <div key={aIdx} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      disabled={locked}
                      value={act}
                      onChange={(e) => handleUpdateAction(idx, aIdx, e.target.value)}
                      style={inputStyle}
                    />
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAction(idx, aIdx)}
                        style={{ padding: '0 10px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const currentBatchName = batchesList.find((b) => b.id === selectedBatchId)?.name || selectedBatch?.name || 'Selected Batch';

  return (
    <div className="animated-page" style={{ paddingBottom: hideFooter ? 0 : '60px' }}>
      {!hideHeader && (
        <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: '800', color: accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Academic Governance &nbsp;·&nbsp; Programme Quality Loop
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800' }}>
              Programme Action Taken Report (ATR)
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: muted }}>
              Comprehensive PO/PSO gap analysis for <strong>{selectedProgramme?.name || 'Programme'}</strong> ({currentBatchName}).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: atrStatus === 'VERIFIED' ? '#dcfce7' : atrStatus === 'SUBMITTED' ? '#fef3c7' : '#f1f5f9', color: atrStatus === 'VERIFIED' ? '#15803d' : atrStatus === 'SUBMITTED' ? '#b45309' : '#475569' }}>
              Status: {atrStatus}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <RefreshCw size={24} className="spin" style={{ color: accent, marginBottom: '8px' }} />
          <div style={{ fontSize: '13px', fontWeight: '700', color: ink }}>Loading Programme ATR from database...</div>
        </div>
      ) : atrList.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <AlertCircle size={32} style={{ color: '#d97706', marginBottom: '10px' }} />
          <h4 style={{ margin: 0, fontSize: '16px', color: ink, fontWeight: '800' }}>No Programme Outcomes / Attainment Records Found</h4>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: muted }}>
            Please ensure Programme Outcomes (POs/PSOs) and batch attainment data are configured in the database.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {poList.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                1. Programme Outcomes (POs)
              </div>
              {poList.map((po) => renderCard(po, accent))}
            </div>
          )}

          {psoList.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                2. Programme Specific Outcomes (PSOs)
              </div>
              {psoList.map((pso) => renderCard(pso, '#059669'))}
            </div>
          )}

          {!locked && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                <Save size={15} /> Save Draft
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveSubmit}
                disabled={saving}
                style={{ background: '#059669', color: '#ffffff' }}
              >
                <Send size={15} /> Submit to HOD for Verification →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
