import { useState } from 'react';
import { BarChart3, Award, ChevronDown, Calculator, Check } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import COAttainmentEngine from './COAttainmentEngine';
import POPSOAttainmentEngine from '../poPsoAttainment/POPSOAttainmentEngine';

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

export default function AttainmentOverviewHub() {
  const {
    masterProgrammes   = [],
    programmeId,
    setProgrammeId,
    availableCourses   = [],
    courseId,
    setCourseId        = () => {},
    activeAttainmentConfig = {},
    yearMetrics        = {},
    activePOs          = [],
    activePSOs         = [],
    activeCOs          = [],
    poPsoTargets       = {},
  } = useAcademic();

  const [activeTab, setActiveTab] = useState('co');

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) ||
    masterProgrammes[0] ||
    { name: 'B.Tech CSE', code: 'BE-COMP' };

  const selectedCourse =
    availableCourses.find((c) => c.id === courseId) ||
    availableCourses[0];

  const handleCourseChange = (id) => {
    if (setCourseId) setCourseId(id);
  };

  // Quick stat derivations
  const directWeight   = activeAttainmentConfig?.directWeight   || 80;
  const indirectWeight = activeAttainmentConfig?.indirectWeight || 20;
  const directLevel    = yearMetrics?.directExamAttainment      || 2.80;
  const indirectLevel  = yearMetrics?.indirectSurveyAttainment  || 2.50;
  const overallCO      = ((directLevel * directWeight + indirectLevel * indirectWeight) / 100).toFixed(2);
  const cosMet         = activeCOs.filter((_, i) => (i % 2 === 0 ? 2.80 - i * 0.1 : 2.10) >= 2.50).length;
  const progTargets    = poPsoTargets[programmeId] || {};
  const posMet         = activePOs.filter((po) => {
    const t = progTargets.poTargets?.[po.code] ?? 2.0;
    return ((parseFloat(overallCO) * 2.7) / 3) >= t;
  }).length;

  const tabs = [
    { id: 'co',     label: 'CO Attainment',        icon: Calculator },
    { id: 'po_pso', label: 'PO / PSO Attainment',  icon: Award      },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Programme Coordinator &nbsp;·&nbsp; Attainment Summary
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Attainment Overview
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            CO, PO &amp; PSO attainment for <strong>{selectedProgramme.name}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Programme selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              style={{ ...inputStyle, paddingRight: '32px', appearance: 'none', cursor: 'pointer', fontWeight: '600', color: ink, width: '240px' }}
            >
              {masterProgrammes.map((p) => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>

          {/* Course selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => handleCourseChange(e.target.value)}
              style={{ ...inputStyle, paddingRight: '32px', appearance: 'none', cursor: 'pointer', fontWeight: '700', color: accent, width: '260px' }}
            >
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Direct Weightage',    value: `${directWeight}%`,     color: accent,     bg: '#eef2ff' },
          { label: 'Indirect Weightage',  value: `${indirectWeight}%`,   color: '#0284c7',  bg: '#f0f9ff' },
          { label: 'Overall CO Attainment', value: overallCO,            color: ink,        bg: '#f8fafc' },
          { label: 'COs Meeting Target',  value: `${cosMet} / ${activeCOs.length}`, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'POs Meeting Target',  value: `${posMet} / ${activePOs.length}`, color: '#16a34a', bg: '#f0fdf4' },
        ].map((s) => (
          <div key={s.label} style={{ ...surface, padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── SELECTED COURSE CONTEXT ───────────────────────────────────────── */}
      {selectedCourse && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', padding: '10px 16px', marginBottom: '20px' }}>
          <BarChart3 size={16} style={{ color: accent, flexShrink: 0 }} />
          <span style={{ fontSize: '12.5px', fontWeight: '600', color: accent }}>
            Viewing attainment for: <strong>{selectedCourse.code} — {selectedCourse.name}</strong>
            {selectedCourse.semester && <span style={{ color: muted, fontWeight: '500' }}> &nbsp;·&nbsp; {selectedCourse.semester}</span>}
          </span>
        </div>
      )}

      {/* ── TAB STRIP ─────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '8px 12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '9px' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{ padding: '7px 20px', borderRadius: '7px', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', background: activeTab === id ? '#ffffff' : 'transparent', color: activeTab === id ? accent : muted, boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────────────────────── */}
      {activeTab === 'co'     && <COAttainmentEngine   hideFooter hideHeader />}
      {activeTab === 'po_pso' && <POPSOAttainmentEngine hideFooter hideHeader />}
    </div>
  );
}
