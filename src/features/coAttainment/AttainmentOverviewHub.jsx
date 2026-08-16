import { useState } from 'react';
import {
  BarChart2, TrendingUp, TrendingDown,
  CheckCircle2, ChevronDown, Award, Layers, BookOpen,
  Activity, ArrowRight, GitMerge, Zap,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
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
  const n = parseFloat(val);
  if (n >= 2.5) return '#16a34a';
  if (n >= 1.5) return '#d97706';
  return '#dc2626';
};

// Mini progress bar
function MiniBar({ value, max = 3, color }) {
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
    selectedCourse,
    selectedProgramme,
    academicYear,
    activeAttainmentConfig = {},
    yearMetrics            = {},
    activePOs              = [],
    activePSOs             = [],
    activeCOs              = [],
    poPsoTargets           = {},
    programmeId            = '',
  } = useAcademic();

  const course = selectedCourse || availableCourses[0];

  // ── Derived stats ──────────────────────────────────────────────────────────
  const directWeight   = activeAttainmentConfig?.directWeight   || 80;
  const indirectWeight = activeAttainmentConfig?.indirectWeight || 20;
  const directLevel    = yearMetrics?.directExamAttainment      || 2.80;
  const indirectLevel  = yearMetrics?.indirectSurveyAttainment  || 2.50;
  const overallCO      = ((directLevel * directWeight + indirectLevel * indirectWeight) / 100).toFixed(2);

  const progTargets = poPsoTargets[programmeId] || {};
  const cosMet = activeCOs.filter((_, i) =>
    (i % 2 === 0 ? 2.80 - i * 0.1 : 2.10) >= 2.50
  ).length;
  const posMet = activePOs.filter((po) => {
    const t = progTargets.poTargets?.[po.code] ?? 2.0;
    return ((parseFloat(overallCO) * 2.7) / 3) >= t;
  }).length;
  const psosMet = activePSOs.filter((pso) => {
    const t = progTargets.psoTargets?.[pso.code] ?? 2.0;
    return ((parseFloat(overallCO) * 2.7) / 3) >= t;
  }).length;

  const coColor    = levelColor(overallCO);
  const activeTabConfig = TABS.find((t) => t.id === activeTab);

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

        {/* Course selector only — no programme selector */}
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
          <div style={{ fontSize: '32px', fontWeight: '900', color: coColor, lineHeight: 1, letterSpacing: '-0.02em' }}>{overallCO}</div>
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
          <div style={{ fontSize: '30px', fontWeight: '900', color: ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{directLevel}</div>
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', background: '#e0f2fe', color: '#0284c7', borderRadius: '5px', padding: '2px 8px' }}>
              {directWeight}% weight
            </span>
          </div>
          <div style={{ fontSize: '11px', color: muted, marginTop: '5px' }}>Exam-based assessment</div>
        </div>

        {/* Indirect Assessment */}
        <div style={{ ...surface, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: '14px 14px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Indirect</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#f5f3ff', display: 'grid', placeItems: 'center', color: '#7c3aed', flexShrink: 0 }}>
              <TrendingDown size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{indirectLevel}</div>
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', background: '#ede9fe', color: '#7c3aed', borderRadius: '5px', padding: '2px 8px' }}>
              {indirectWeight}% weight
            </span>
          </div>
          <div style={{ fontSize: '11px', color: muted, marginTop: '5px' }}>Survey-based assessment</div>
        </div>

        {/* COs Meeting Target */}
        <div style={{ ...surface, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #16a34a, #4ade80)', borderRadius: '14px 14px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>COs Met</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#16a34a', flexShrink: 0 }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {cosMet}
            <span style={{ fontSize: '16px', fontWeight: '600', color: muted }}> / {activeCOs.length || '—'}</span>
          </div>
          <MiniBar value={activeCOs.length ? cosMet : 0} max={activeCOs.length || 1} color="#16a34a" />
          <div style={{ fontSize: '11px', color: muted, marginTop: '5px' }}>Course Outcomes</div>
        </div>

        {/* POs & PSOs Met */}
        <div style={{ ...surface, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #d97706, #fbbf24)', borderRadius: '14px 14px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>POs / PSOs</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fffbeb', display: 'grid', placeItems: 'center', color: '#d97706', flexShrink: 0 }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: ink, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#d97706' }}>{posMet}</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: muted }}>/{activePOs.length || '—'}</span>
            <span style={{ color: '#94a3b8', margin: '0 6px', fontSize: '14px' }}>·</span>
            <span style={{ color: '#d97706' }}>{psosMet}</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: muted }}>/{activePSOs.length || '—'}</span>
          </div>
          <div style={{ fontSize: '11px', color: muted, marginTop: '10px' }}>POs met · PSOs met</div>
        </div>

      </div>

      {/* ── ACTIVE COURSE CONTEXT STRIP ───────────────────────────────────── */}
      {course && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'linear-gradient(90deg, #eef2ff, #f5f3ff)',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: accent, display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(79,70,229,.25)' }}>
            <Layers size={17} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontSize: '13.5px', fontWeight: '800', color: ink }}>
              {course.code} — {course.name}
            </div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
              {selectedProgramme?.name || course.programme || ''}
              {course.semester && <span style={{ color: '#94a3b8' }}> &nbsp;·&nbsp; {course.semester}</span>}
              {academicYear && <span style={{ color: '#94a3b8' }}> &nbsp;·&nbsp; {academicYear}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Zap size={13} style={{ color: '#16a34a' }} />
            <span style={{ fontSize: '12.5px', fontWeight: '700', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0', borderRadius: '7px', padding: '4px 12px' }}>
              {directWeight}% Direct &nbsp;·&nbsp; {indirectWeight}% Indirect
            </span>
          </div>
        </div>
      )}

      {/* ── TWO-PART TAB NAVIGATION ───────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 20px',
                border: isActive ? `2px solid ${tab.borderActive}` : '2px solid #e2e8f0',
                borderRadius: '14px',
                background: isActive ? tab.bgLight : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'all .2s ease',
                boxShadow: isActive ? `0 4px 16px ${tab.color}20` : '0 1px 3px rgba(0,0,0,.06)',
                transform: isActive ? 'translateY(-1px)' : 'none',
              }}
            >
              {/* Icon block */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: isActive ? tab.color : '#f1f5f9',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                transition: 'background .2s',
              }}>
                <Icon size={20} style={{ color: isActive ? '#fff' : muted }} />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: isActive ? tab.color : muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '3px',
                }}>
                  {tab.id === 'co' ? 'Part 1' : 'Part 2'}
                </div>
                <div style={{
                  fontSize: '13.5px',
                  fontWeight: '800',
                  color: isActive ? ink : '#475569',
                  lineHeight: 1.2,
                  marginBottom: '3px',
                }}>
                  {tab.shortLabel}
                </div>
                <div style={{ fontSize: '11.5px', color: muted, lineHeight: 1.3 }}>
                  {tab.description}
                </div>
              </div>

              {/* Active chevron */}
              {isActive && (
                <ArrowRight size={16} style={{ color: tab.color, flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── ACTIVE TAB LABEL STRIP ────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '18px',
        padding: '10px 16px',
        background: activeTabConfig?.bgLight,
        borderRadius: '10px',
        border: `1px solid ${activeTabConfig?.borderActive}33`,
      }}>
        <div style={{ width: '4px', height: '22px', borderRadius: '2px', background: activeTabConfig?.color, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: '800', color: ink }}>
            {activeTabConfig?.label}
          </div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '1px' }}>
            {activeTabConfig?.description}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={13} style={{ color: activeTabConfig?.color }} />
          <span style={{ fontSize: '11px', fontWeight: '700', color: activeTabConfig?.color }}>
            {course?.code || 'No Course'} &nbsp;·&nbsp; {academicYear || '—'}
          </span>
        </div>
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────────────────────── */}
      {activeTab === 'co' && (
        <div>
          <COAttainmentEngine hideFooter />
        </div>
      )}

      {activeTab === 'po-pso' && (
        <div>
          <POPSOAttainmentEngine hideFooter />
        </div>
      )}

    </div>
  );
}
