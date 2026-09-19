import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Users, FileSpreadsheet, ExternalLink, Award, CheckCircle2, TrendingUp, Info } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue (Direct Attainment)
const PSO_COLOR = '#16a34a';  // Light Green (Indirect Attainment)

function formatVal(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

function sortCosAscending(cos = []) {
  return [...cos].sort((a, b) => {
    const codeA = a.coCode || a.code || '';
    const codeB = b.coCode || b.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function StackedCoTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        fontSize: 12,
        minWidth: 230,
        maxWidth: 320,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>
        {item.coCode}
      </div>
      {item.statement && (
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, lineHeight: 1.3 }}>
          {item.statement}
        </div>
      )}

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Overall Attainment:</span>
          <strong style={{ color: '#7c3aed' }}>{formatVal(item.overallAttainment)} / 3.00</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: PO_COLOR, fontWeight: 700 }}>Direct ({item.directWeight}%):</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>
            {formatVal(item.directAttainment)} <span style={{ color: '#64748b', fontWeight: 400 }}>(share: {formatVal(item.directPart)})</span>
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: PSO_COLOR, fontWeight: 700 }}>Indirect ({item.indirectWeight}%):</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>
            {formatVal(item.indirectAttainment)} <span style={{ color: '#64748b', fontWeight: 400 }}>(share: {formatVal(item.indirectPart)})</span>
          </span>
        </div>

        {item.target != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>CO Target:</span>
            <strong style={{ color: '#0f172a' }}>{formatVal(item.target)} / 3.00</strong>
          </div>
        )}

        {item.targetMet != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <span style={{ color: '#64748b' }}>Status:</span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: item.targetMet ? '#15803d' : '#b91c1c',
              }}
            >
              {item.targetMet ? 'Target Met' : 'Target Not Met'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoDirectVsIndirectSection({
  coScope = 'SELECTED', // 'SELECTED' | 'ALL'
  coCode,
  directAttainment,
  indirectAttainment,
  overallAttainment,
  target,
  targetMet,
  directEvidenceSummary,
  indirectEvidenceSummary,
  directWeight = 80,
  indirectWeight = 20,
  courseOutcomes = [],
  onSelectCo,
  onOpenStudentEvidence,
  onOpenSurvey,
  outcomeCode,
}) {
  const isAllCo = coScope === 'ALL';

  // Build stacked chart data based on coScope
  const chartData = React.useMemo(() => {
    if (isAllCo && courseOutcomes && courseOutcomes.length > 0) {
      const sorted = sortCosAscending(courseOutcomes);
      return sorted.map((co) => {
        const dWeight = co.directWeight != null ? Number(co.directWeight) : 80;
        const iWeight = co.indirectWeight != null ? Number(co.indirectWeight) : 20;
        const dAtt = co.directAttainment != null ? Number(co.directAttainment) : (co.directLevel != null ? Number(co.directLevel) : 0);
        const iAtt = co.indirectAttainment != null ? Number(co.indirectAttainment) : (co.indirectLevel != null ? Number(co.indirectLevel) : 0);
        const dPart = Number(((dWeight / 100) * dAtt).toFixed(4));
        const iPart = Number(((iWeight / 100) * iAtt).toFixed(4));

        return {
          coCode: co.coCode,
          statement: co.statement,
          directAttainment: dAtt,
          indirectAttainment: iAtt,
          overallAttainment: co.overallAttainment != null ? co.overallAttainment : Number((dPart + iPart).toFixed(2)),
          directPart: dPart,
          indirectPart: iPart,
          target: co.target != null ? Number(co.target) : null,
          targetMet: co.targetMet,
          directWeight: dWeight,
          indirectWeight: iWeight,
        };
      });
    }

    // Single CO mode: 1 stacked bar for selected CO
    const dWeight = directWeight != null ? Number(directWeight) : 80;
    const iWeight = indirectWeight != null ? Number(indirectWeight) : 20;
    const dAtt = directAttainment != null ? Number(directAttainment) : (directEvidenceSummary?.directAttainment != null ? Number(directEvidenceSummary.directAttainment) : (directEvidenceSummary?.directLevel != null ? Number(directEvidenceSummary.directLevel) : 0));
    const iAtt = indirectAttainment != null ? Number(indirectAttainment) : (indirectEvidenceSummary?.indirectScore != null ? Number(indirectEvidenceSummary.indirectScore) : (indirectEvidenceSummary?.indirectLevel != null ? Number(indirectEvidenceSummary.indirectLevel) : 0));
    const dPart = Number(((dWeight / 100) * dAtt).toFixed(4));
    const iPart = Number(((iWeight / 100) * iAtt).toFixed(4));

    return [
      {
        coCode: coCode || 'CO',
        directAttainment: dAtt,
        indirectAttainment: iAtt,
        overallAttainment: overallAttainment != null ? overallAttainment : Number((dPart + iPart).toFixed(2)),
        directPart: dPart,
        indirectPart: iPart,
        target: target != null ? Number(target) : null,
        targetMet,
        directWeight: dWeight,
        indirectWeight: iWeight,
      },
    ];
  }, [
    isAllCo,
    courseOutcomes,
    coCode,
    directAttainment,
    indirectAttainment,
    overallAttainment,
    target,
    targetMet,
    directWeight,
    indirectWeight,
  ]);

  const dynamicWidth = isAllCo ? Math.max(500, chartData.length * 64) : '100%';

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: '#7c3aed',
                display: 'inline-block',
              }}
            />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              Direct vs Indirect Assessment Breakdown ({isAllCo ? 'All COs' : coCode})
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Unified stacked vertical bar showing Direct Attainment at the bottom and Indirect Attainment on top.
          </span>
        </div>

        {/* Legend Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: PO_COLOR, display: 'inline-block' }} />
            <span style={{ color: '#0369a1' }}>Direct (Bottom)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: PSO_COLOR, display: 'inline-block' }} />
            <span style={{ color: '#15803d' }}>Indirect (Top)</span>
          </div>
          <span style={{ color: '#64748b' }}>Y-Axis: Overall Scale (0.00 – 3.00)</span>
        </div>
      </div>

      {/* Stacked Vertical Bar Chart */}
      <div style={{ overflowX: isAllCo ? 'auto' : 'visible', width: '100%', paddingBottom: 8 }}>
        <div style={{ minWidth: dynamicWidth, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 30, left: -20, bottom: 20 }}
              onClick={(state) => {
                const clickedCo =
                  state?.activePayload?.[0]?.payload?.coCode ||
                  (state?.activeTooltipIndex != null ? chartData[state.activeTooltipIndex]?.coCode : null);
                if (clickedCo && onSelectCo) {
                  onSelectCo(clickedCo);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="coCode"
                tick={{ fontSize: 12, fontWeight: 700, fill: '#334155' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 3.0]}
                ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              {!isAllCo && target != null && (
                <ReferenceLine
                  y={Number(target)}
                  stroke="#0f172a"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `Target: ${formatVal(target)}`,
                    position: 'insideTopRight',
                    fill: '#0f172a',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                />
              )}
              <Tooltip content={<StackedCoTooltip />} />

              {/* 1. Bottom Stack: Direct Attainment */}
              <Bar
                dataKey="directPart"
                name="Direct Attainment"
                stackId="coStack"
                fill={PO_COLOR}
                barSize={isAllCo ? 32 : 44}
                cursor="pointer"
                onClick={(entry) => {
                  const clickedCo = entry?.coCode || entry?.payload?.coCode;
                  if (clickedCo && onSelectCo) onSelectCo(clickedCo);
                }}
              />

              {/* 2. Top Stack: Indirect Attainment */}
              <Bar
                dataKey="indirectPart"
                name="Indirect Attainment"
                stackId="coStack"
                fill={PSO_COLOR}
                radius={[4, 4, 0, 0]}
                barSize={isAllCo ? 32 : 44}
                cursor="pointer"
                onClick={(entry) => {
                  const clickedCo = entry?.coCode || entry?.payload?.coCode;
                  if (clickedCo && onSelectCo) onSelectCo(clickedCo);
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Guide Note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '8px 12px',
          background: '#f8fafc',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          fontSize: 11.5,
          color: '#64748b',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={14} color="#7c3aed" />
          <span>
            <strong>Stacked Breakdown:</strong> Bottom: Direct Marks Component ({directWeight || 80}%) + Top: Indirect Survey Component ({indirectWeight || 20}%) = Overall Attainment.
          </span>
        </div>
        {isAllCo && <span>Click any CO bar to inspect its evidence</span>}
      </div>

      {/* Sub-content depending on coScope */}
      {!isAllCo ? (
        /* Single CO Mode: Side-by-side Evidence Drilldown Panels */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {/* Direct Evidence Panel */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #bae6fd',
              borderRadius: 12,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: PO_COLOR,
                      display: 'inline-block',
                    }}
                  />
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Direct Evidence (Exams)
                  </h4>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#e0f2fe',
                    color: '#0284c7',
                  }}
                >
                  Weight: {directWeight || 80}%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Evaluated Students:</span>
                  <strong style={{ color: '#0f172a' }}>
                    {directEvidenceSummary?.evaluatedStudents ?? '—'}
                    {directEvidenceSummary?.totalStudents ? ` / ${directEvidenceSummary.totalStudents}` : ''}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Students Meeting Threshold:</span>
                  <strong style={{ color: '#0284c7' }}>
                    {directEvidenceSummary?.studentsMeetingThreshold ?? '—'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Passing Percentage:</span>
                  <strong style={{ color: '#0f172a' }}>
                    {formatVal(directEvidenceSummary?.directPercentage, 1)}%
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>NBA Direct Level:</span>
                  <strong style={{ color: '#0f172a' }}>
                    Level {directEvidenceSummary?.directLevel ?? '—'}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={onOpenStudentEvidence}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#0369a1')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0284c7')}
              >
                <Users size={14} />
                <span>View Student Evidence</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Indirect Evidence Panel */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #bbf7d0',
              borderRadius: 12,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: PSO_COLOR,
                      display: 'inline-block',
                    }}
                  />
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Indirect Evidence (Survey)
                  </h4>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#dcfce7',
                    color: '#16a34a',
                  }}
                >
                  Weight: {indirectWeight || 20}%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Survey Responses:</span>
                  <strong style={{ color: '#0f172a' }}>
                    {indirectEvidenceSummary?.responseCount ?? '—'} students
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Average Survey Score:</span>
                  <strong style={{ color: '#16a34a' }}>
                    {formatVal(indirectEvidenceSummary?.indirectScore)} / 3.00
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>NBA Indirect Level:</span>
                  <strong style={{ color: '#0f172a' }}>
                    Level {indirectEvidenceSummary?.indirectLevel ?? '—'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Assessment Method:</span>
                  <span style={{ color: '#64748b' }}>Course-End Survey</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={onOpenSurvey}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#15803d')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#16a34a')}
              >
                <FileSpreadsheet size={14} />
                <span>View Course-End Survey</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* All CO Mode: All COs Detail Table */
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>CO Code & Statement</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Direct Attainment</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Indirect Attainment</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Overall Attainment</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>CO Target</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Status</th>
                {outcomeCode && (
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>
                    {outcomeCode} Mapping
                  </th>
                )}
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((co) => {
                const isTargetMet = co.targetMet === true;
                return (
                  <tr
                    key={co.coCode}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectCo && onSelectCo(co.coCode)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    <td style={{ padding: '10px 14px', maxWidth: 360 }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{co.coCode}</div>
                      {co.statement && (
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, lineHeight: 1.3 }}>
                          {co.statement}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                      {formatVal(co.directAttainment)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                      {formatVal(co.indirectAttainment)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#7c3aed' }}>
                      {formatVal(co.overallAttainment)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                      {formatVal(co.target)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {co.targetMet != null ? (
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: isTargetMet ? '#ecfdf5' : '#fef2f2',
                            color: isTargetMet ? '#059669' : '#dc2626',
                            border: `1px solid ${isTargetMet ? '#a7f3d0' : '#fecaca'}`,
                          }}
                        >
                          {isTargetMet ? 'Target Met' : 'Target Not Met'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    {outcomeCode && (
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {co.selectedOutcomeMapping != null && co.selectedOutcomeMapping > 0 ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#f1f5f9',
                              color: '#0f172a',
                            }}
                          >
                            Level {co.selectedOutcomeMapping}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    )}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectCo) onSelectCo(co.coCode);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          padding: '5px 10px',
                          borderRadius: 6,
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f5f3ff';
                          e.currentTarget.style.borderColor = '#7c3aed';
                          e.currentTarget.style.color = '#7c3aed';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#ffffff';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.color = '#0f172a';
                        }}
                      >
                        <span>View Details</span>
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
