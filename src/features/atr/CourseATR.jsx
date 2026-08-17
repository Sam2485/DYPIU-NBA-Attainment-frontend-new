import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, CheckCircle2, Clock, ShieldCheck, History, Printer, ChevronDown, AlertCircle, Lock, RefreshCw, Send } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';
import { getCourseAtr, saveCourseAtr, submitCourseAtr } from '../../api/reportsApi';
import { getCourseAttainment } from '../../api/attainmentApi';

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

export default function CourseATR({ hideFooter = false, hideHeader = false, showHistoryProp, readOnly = false, courseId }) {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const {
    courses = [],
    availableCourses = [],
    selectedCourse,
    selectedCourseOffering,
    courseOfferings = [],
    academicYear    = '2025-26',
    selectedBatch,
    availableYears  = ['2025-26', '2024-25', '2023-24'],
  } = useAcademic();

  const isFaculty      = role === 'FACULTY' || role === 'COURSE_COORDINATOR';
  const isCoordinator  = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR';

  const [selectedYear, setSelectedYear] = useState(academicYear || '2025-26');
  const [showHistory,  setShowHistory]  = useState(showHistoryProp ?? false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [atrRecord, setAtrRecord] = useState(null);
  const [coList, setCoList] = useState([]);

  const isPreviousYear = selectedYear !== (academicYear || '2025-26');

  useEffect(() => {
    if (showHistoryProp !== undefined) setShowHistory(showHistoryProp);
  }, [showHistoryProp]);

  const targetOffering = selectedCourseOffering || courseOfferings[0];
  const targetCourse = selectedCourse || availableCourses[0];
  const targetOfferingId = courseId || targetOffering?.id || targetCourse?.id;

  // Load real ATR data from backend API
  useEffect(() => {
    let isMounted = true;
    if (!targetOfferingId) return;

    setLoading(true);
    Promise.allSettled([
      getCourseAtr(targetOfferingId),
      getCourseAttainment(targetOfferingId),
    ])
      .then(([atrRes, attRes]) => {
        if (!isMounted) return;
        const atrData = atrRes.status === 'fulfilled' ? (atrRes.value?.data || atrRes.value) : null;
        const attData = attRes.status === 'fulfilled' ? (attRes.value?.data || attRes.value) : null;

        const rawOutcomes = atrData?.outcomes || atrData?.entries;
        if (atrData && Array.isArray(rawOutcomes) && rawOutcomes.length > 0) {
          setAtrRecord(atrData);
          const mapped = rawOutcomes.map((co) => {
            const target = Number(co.targetLevel ?? co.target ?? 2.5);
            const actual = Number(co.actualScore ?? co.attainmentLevel ?? co.actual ?? 2.7);
            const pct = Number(co.pctAchieved ?? co.achievementPercentage ?? (target > 0 ? ((actual / target) * 100).toFixed(2) : 100));
            const met = actual >= target;
            return {
              code: co.coCode || co.outcomeCode || co.code || 'CO1',
              statement: co.statement || co.outcomeStatement || `Course Outcome ${co.coCode || ''}`,
              target,
              actual,
              pct,
              met,
              remark: co.observation || (met ? 'Target achieved.' : 'Target not achieved.'),
              actions: co.actions || [],
            };
          });
          setCoList(mapped);
        } else if (attData && Array.isArray(attData.outcomes || attData.coAttainments) && (attData.outcomes || attData.coAttainments).length > 0) {
          // Construct ATR entries from real attainment calculations
          const sourceList = attData.outcomes || attData.coAttainments;
          const items = sourceList.map((co) => {
            const target = Number(co.targetLevel || co.target || 2.5);
            const actual = Number(co.overallAttainment || co.combinedAttainment || co.actualScore || co.attainmentScore || 0);
            const pct = Number(co.achievementPercentage || (target > 0 ? ((actual / target) * 100).toFixed(2) : 0));
            const met = actual >= target;
            return {
              code: co.coCode || co.code,
              statement: co.statement || `Course Outcome ${co.coCode || co.code}`,
              target,
              actual,
              pct,
              met,
              remark: co.observation || (met ? 'Target achieved. Maintain current pedagogy and assessment methods.' : ''),
              actions: met ? [] : [
                `Conduct extra tutorial sessions on ${co.statement?.slice(0, 45) || co.code}...`,
                'Provide additional practice numericals and interactive assignment problem sets.',
              ],
            };
          });
          setCoList(items);
        } else {
          setCoList([]);
        }
      })
      .catch((err) => {
        console.warn('Error loading Course ATR:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetOfferingId]);

  const atrStatus = atrRecord?.status || 'DRAFT';
  const atrRemarks = atrRecord?.remarks || '';
  const locked = readOnly || isPreviousYear || atrStatus === 'VERIFIED' || atrStatus === 'APPROVED' || role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR';

  // ── Save & Submit Handlers ──────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!targetOfferingId) return;
    try {
      setSaving(true);
      const payload = {
        courseOfferingId: targetOfferingId,
        academicYear: selectedYear,
        entries: coList,
        status: 'DRAFT',
      };
      const res = await saveCourseAtr(payload);
      const saved = res?.data || res;
      if (saved) setAtrRecord(saved);
      alert('Course ATR draft saved successfully!');
    } catch (err) {
      alert('Failed to save Course ATR: ' + (err.message || 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubmit = async () => {
    if (!targetOfferingId) return;
    try {
      setSaving(true);
      const payload = {
        courseOfferingId: targetOfferingId,
        academicYear: selectedYear,
        entries: coList,
        status: 'SUBMITTED',
      };
      const res = await saveCourseAtr(payload);
      const saved = res?.data || res;
      if (saved?.id) {
        await submitCourseAtr(saved.id, 'Submitted for Programme Coordinator verification');
      }
      setAtrRecord({ ...saved, status: 'SUBMITTED' });
      alert('Course ATR submitted to Programme Coordinator for verification!');
    } catch (err) {
      alert('Failed to submit Course ATR: ' + (err.message || 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddAction    = (i)        => setCoList((p) => p.map((c, idx) => idx === i ? { ...c, actions: [...c.actions, 'New corrective action...'] } : c));
  const handleUpdateAction = (i, j, v)  => setCoList((p) => p.map((c, idx) => { if (idx !== i) return c; const a = [...c.actions]; a[j] = v; return { ...c, actions: a }; }));
  const handleDeleteAction = (i, j)     => setCoList((p) => p.map((c, idx) => idx === i ? { ...c, actions: c.actions.filter((_, k) => k !== j) } : c));
  const handleUpdateRemark = (i, v)     => setCoList((p) => p.map((c, idx) => idx === i ? { ...c, remark: v } : c));

  const metCount  = coList.filter((c) => c.met).length;
  const gapCount  = coList.length - metCount;

  return (
    <div className="animated-page" style={{ paddingBottom: hideFooter ? 0 : '60px' }}>
      {!hideHeader && (
        <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: '800', color: accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Academic Governance &nbsp;·&nbsp; Course Quality Loop
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800' }}>
              Course Action Taken Report (ATR)
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: muted }}>
              Target attainment gap analysis and corrective action planning for Course Coordinators.
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
          <div style={{ fontSize: '13px', fontWeight: '700', color: ink }}>Loading Course ATR data from database...</div>
        </div>
      ) : coList.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <AlertCircle size={32} style={{ color: '#d97706', marginBottom: '10px' }} />
          <h4 style={{ margin: 0, fontSize: '16px', color: ink, fontWeight: '800' }}>No Course Outcomes / Attainment Records Found</h4>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: muted }}>
            Please ensure Course Outcomes are defined and assessment marks are uploaded for this course offering.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {coList.map((entry, idx) => (
            <div key={entry.code || idx} style={{ ...surface, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: entry.met ? '#f0fdf4' : '#fef2f2', borderBottom: `1px solid ${entry.met ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>
                  <span style={{ color: accent, fontWeight: '900', marginRight: '6px' }}>{entry.code}:</span>
                  {entry.statement}
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: entry.met ? '#15803d' : '#dc2626' }}>
                  Target: {entry.target?.toFixed(2)} &nbsp;|&nbsp; Actual: {entry.actual?.toFixed(2)} &nbsp;({entry.pct}% {entry.met ? 'Achieved' : 'Gap'})
                </span>
              </div>

              <div style={{ padding: '16px 18px' }}>
                {entry.met ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '6px' }}>
                      Observations &amp; Action Taken:
                    </label>
                    <textarea
                      rows={2}
                      disabled={locked}
                      value={entry.remark}
                      onChange={(e) => handleUpdateRemark(idx, e.target.value)}
                      style={{ ...inputStyle, height: 'auto', padding: '8px 12px' }}
                    />
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#dc2626' }}>
                        Corrective Action Plan for Attainment Gap:
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
                      {(entry.actions || []).map((act, aIdx) => (
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
          ))}

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
                <Send size={15} /> Submit for Verification →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
