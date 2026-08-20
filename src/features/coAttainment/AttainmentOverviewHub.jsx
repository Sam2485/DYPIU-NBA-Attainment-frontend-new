import { useState, useEffect } from 'react';
import {
  BarChart2, TrendingUp,
  CheckCircle2, ChevronDown, Award, BookOpen,
  GitMerge,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import COAttainmentEngine from './COAttainmentEngine';
import POPSOAttainmentEngine from '../poPsoAttainment/POPSOAttainmentEngine';

// ── Style tokens ──────────────────────────────────────────────────────────────
const ink   = '#0f172a';
const muted = '#64748b';
const accent = '#4f46e5';

const surface = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
};

// Tab configuration
const TABS = [
  {
    id: 'co',
    label: 'Part 1 — CO Attainment',
    shortLabel: 'CO Attainment',
    description: 'Direct & indirect assessment per Course Outcome',
    icon: BarChart2,
    color: accent,
    bgLight: '#eef2ff',
    borderActive: '#4f46e5',
  },
  {
    id: 'po-pso',
    label: 'Part 2 — CO to PO & PSO Attainment',
    shortLabel: 'PO / PSO Attainment',
    description: 'CO–PO/PSO mapping weighted contribution',
    icon: GitMerge,
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderActive: '#0284c7',
  },
];

// Attainment level colour helper
const levelColor = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '#64748b';
  const n = parseFloat(val);
  if (n >= 2.5) return '#16a34a';
  if (n >= 1.5) return '#d97706';
  return '#dc2626';
};

// Mini progress bar
function MiniBar({ value, max = 3, color }) {
  if (value === null || value === undefined || isNaN(value)) {
    return <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '3px', marginTop: '8px' }} />;
  }
  const pct = Math.min(100, (parseFloat(value) / max) * 100);
  return (
    <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginTop: '8px' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width .5s ease' }} />
    </div>
  );
}

export default function AttainmentOverviewHub() {
  const [activeTab, setActiveTab] = useState('co');

  const {
    availableCourses       = [],
    setCourseId            = () => {},
    selectedCourse         = null,
    activeAttainmentConfig = null,
    yearMetrics            = null,
    activePOs              = [],
    activePSOs             = [],
    activeCOs              = [],
    poPsoTargets           = {},
    programmeId            = null,
    courseOfferingId       = null,
    loadCOAttainment,
    loadAttainmentConfig,
  } = useAcademic();

  const course = selectedCourse || availableCourses[0] || null;
  const courseId = course?.id || null;

  useEffect(() => {
    if (courseOfferingId && loadCOAttainment) {
      loadCOAttainment(courseOfferingId).catch(() => {});
    }
    if ((courseOfferingId || courseId) && loadAttainmentConfig) {
      loadAttainmentConfig(courseOfferingId || courseId).catch(() => {});
    }
  }, [courseOfferingId, courseId]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const directWeight   = activeAttainmentConfig?.directWeight ?? 80;
  const indirectWeight = activeAttainmentConfig?.indirectWeight ?? 20;
  const directLevel    = yearMetrics?.directExamAttainment ?? null;
  const indirectLevel  = yearMetrics?.indirectSurveyAttainment ?? null;

  const overallCO = directLevel !== null && indirectLevel !== null
    ? ((directLevel * directWeight + indirectLevel * indirectWeight) / 100).toFixed(2)
    : yearMetrics?.overallCOAttainment !== undefined && yearMetrics?.overallCOAttainment !== null
    ? Number(yearMetrics.overallCOAttainment).toFixed(2)
    : null;

  const progTargets = (programmeId && poPsoTargets[programmeId]) || {};
  const cosMet = activeCOs.filter((co) => {
    const directVal = co.directAttainment ?? directLevel;
    const indirectVal = co.indirectAttainment ?? indirectLevel;
    if (directVal === null || directVal === undefined) return false;
    const coOverall = ((directVal * directWeight + (indirectVal ?? directVal) * indirectWeight) / 100);
    return coOverall >= (co.targetLevel ?? 2.5);
  }).length;

  const posMet = overallCO !== null ? activePOs.filter((po) => {
    const t = progTargets.poTargets?.[po.code] ?? 2.0;
    return ((parseFloat(overallCO) * 2.7) / 3) >= t;
  }).length : 0;

  const psosMet = overallCO !== null ? activePSOs.filter((pso) => {
    const t = progTargets.psoTargets?.[pso.code] ?? 2.0;
    return ((parseFloat(overallCO) * 2.7) / 3) >= t;
  }).length : 0;

  const coColor = levelColor(overallCO);

  return (
    <div className="animated-page" style={{ paddingBottom: '56px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div style={{
        ...surface,
        padding: '22px 26px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderLeft: `4px solid ${accent}`,
      }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>
            Course Coordinator &nbsp;·&nbsp; Attainment Overview
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', color: ink, fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Attainment Summary
          </h2>
        </div>

        {/* Course selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <BookOpen
              size={14}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: accent, pointerEvents: 'none', zIndex: 1 }}
            />
            <select
              value={course?.id || ''}
              onChange={(e) => setCourseId(e.target.value)}
              style={{
                height: '42px',
                fontSize: '13px',
                fontWeight: '700',
                border: `1.5px solid #c7d2fe`,
                borderRadius: '10px',
                padding: '0 38px 0 36px',
                background: '#f5f3ff',
                color: accent,
                outline: 'none',
                fontFamily: 'inherit',
                appearance: 'none',
                cursor: 'pointer',
                minWidth: '280px',
              }}
            >
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
            <ChevronDown
              size={13}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: accent, pointerEvents: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ROW ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '14px', marginBottom: '22px' }}>

        {/* Overall CO Attainment */}
        <div style={{ ...surface, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${coColor}, ${coColor}88)`, borderRadius: '14px 14px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Overall CO</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: accent, flexShrink: 0 }}>
              <BarChart2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: coColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {overallCO !== null ? overallCO : '—'}
          </div>
          <MiniBar value={overallCO} color={coColor} />
          <div style={{ fontSize: '11px', color: muted, marginTop: '5px' }}>out of 3.0 scale</div>
        </div>

        {/* Direct Assessment */}
        <div style={{ ...surface, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', borderRadius: '14px 14px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Direct</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#f0f9ff', display: 'grid', placeItems: 'center', color: '#0284c7', flexShrink: 0 }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {directLevel !== null ? directLevel : '—'}
          </div>
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', background: '#e0f2fe', color: '#0284c7', borderRadius: '5px', padding: '2px 8px' }}>
              {directWeight}% weight
            </span>
          </div>
        </div>

        {/* Indirect Assessment */}
        <div style={{ ...surface, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #059669, #34d399)', borderRadius: '14px 14px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Indirect</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#059669', flexShrink: 0 }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {indirectLevel !== null ? indirectLevel : '—'}
          </div>
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', background: '#dcfce7', color: '#059669', borderRadius: '5px', padding: '2px 8px' }}>
              {indirectWeight}% weight
            </span>
          </div>
        </div>

        {/* COs Target Met */}
        <div style={{ ...surface, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: '14px 14px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>COs Met</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#f5f3ff', display: 'grid', placeItems: 'center', color: '#7c3aed', flexShrink: 0 }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {cosMet}<span style={{ fontSize: '16px', fontWeight: '600', color: muted }}>/{activeCOs.length}</span>
          </div>
          <MiniBar value={activeCOs.length ? cosMet : 0} max={activeCOs.length > 0 ? activeCOs.length : 1} color="#16a34a" />
          <div style={{ fontSize: '11px', color: muted, marginTop: '5px' }}>target ≥ 2.50</div>
        </div>

        {/* POs / PSOs Met */}
        <div style={{ ...surface, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #d97706, #fbbf24)', borderRadius: '14px 14px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>POs / PSOs</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fffbeb', display: 'grid', placeItems: 'center', color: '#d97706', flexShrink: 0 }}>
              <GitMerge size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {posMet + psosMet}
          </div>
          <div style={{ fontSize: '11px', color: muted, marginTop: '8px' }}>
            {posMet}/{activePOs.length} POs &nbsp;·&nbsp; {psosMet}/{activePSOs.length} PSOs
          </div>
        </div>

      </div>

      {/* ── PART 1 / PART 2 TAB SWITCHER ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...surface,
                padding: '16px 20px',
                textAlign: 'left',
                cursor: 'pointer',
                border: `2px solid ${isActive ? tab.borderActive : '#e2e8f0'}`,
                background: isActive ? '#ffffff' : '#f8fafc',
                boxShadow: isActive ? `0 4px 16px ${tab.color}22` : 'none',
                transition: 'all .2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'inherit',
              }}
            >
              {isActive && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: tab.color }} />
              )}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '11px',
                background: isActive ? tab.bgLight : '#ffffff',
                border: `1.5px solid ${isActive ? tab.borderActive : '#e2e8f0'}`,
                display: 'grid',
                placeItems: 'center',
                color: tab.color,
                flexShrink: 0,
              }}>
                <Icon size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14.5px', fontWeight: '800', color: isActive ? tab.color : ink }}>
                  {tab.label}
                </div>
                <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
                  {tab.description}
                </div>
              </div>
              {isActive && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tab.color, flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT WITH ISOLATED ERROR BOUNDARY ──────────────────────── */}
      <ErrorBoundary
        fallbackTitle={`Error Loading ${activeTab === 'co' ? 'CO Attainment' : 'PO / PSO Attainment'}`}
        fallbackMessage="An error occurred while calculating or displaying attainment data. Other sections remain accessible."
      >
        {activeTab === 'co' ? (
          <COAttainmentEngine hideHeader />
        ) : (
          <POPSOAttainmentEngine hideHeader />
        )}
      </ErrorBoundary>

    </div>
  );
}
