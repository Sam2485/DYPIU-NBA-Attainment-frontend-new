import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { BookOpen, Award, ArrowRight } from 'lucide-react';

const DIRECT_COLOR = '#0284c7';   // Sky Blue
const INDIRECT_COLOR = '#0d9488'; // Teal

function SourceTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 800, color: data.color, marginBottom: 4 }}>
        {data.name}
      </div>
      <div style={{ color: '#475569', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div>Attainment Score: <strong style={{ color: '#0f172a' }}>{data.attainment.toFixed(2)}</strong> / 3.00</div>
        <div>Programme Weight: <strong>{data.weightPercent}%</strong></div>
      </div>
    </div>
  );
}

export default function AttainmentSourcesSection({
  directIndirect = {},
  programmeBatchId = '',
}) {
  const navigate = useNavigate();

  const directWeight = directIndirect.programmeDirectWeight != null
    ? (Number(directIndirect.programmeDirectWeight) * 100).toFixed(0)
    : '80';
  const indirectWeight = directIndirect.programmeIndirectWeight != null
    ? (Number(directIndirect.programmeIndirectWeight) * 100).toFixed(0)
    : '20';

  const directAttainmentNum = directIndirect.programmeDirect != null ? Number(directIndirect.programmeDirect) : null;
  const indirectAttainmentNum = directIndirect.programmeIndirect != null ? Number(directIndirect.programmeIndirect) : null;

  const directAttainmentStr = directAttainmentNum != null ? directAttainmentNum.toFixed(2) : '—';
  const indirectAttainmentStr = indirectAttainmentNum != null ? indirectAttainmentNum.toFixed(2) : '—';

  const chartData = [
    {
      name: 'Programme Direct',
      attainment: directAttainmentNum ?? 0,
      weightPercent: directWeight,
      color: DIRECT_COLOR,
    },
    {
      name: 'Programme Indirect',
      attainment: indirectAttainmentNum ?? 0,
      weightPercent: indirectWeight,
      color: INDIRECT_COLOR,
    },
  ];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: 22,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 28,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 4px 0',
          }}
        >
          ATTAINMENT SOURCES
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
          Separate evaluation branches contributing to total batch attainment (weights displayed separately from attainment scores)
        </p>
      </div>

      {/* Main Grid: Direct Block + Indirect Block + Comparison Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {/* BLOCK 1: PROGRAMME DIRECT */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={16} color={DIRECT_COLOR} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                    PROGRAMME DIRECT
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Academic Course Attainment</div>
                </div>
              </div>

              {/* Weight Callout */}
              <div
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  color: '#0369a1',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                Weight: {directWeight}%
              </div>
            </div>

            {/* Numeric Attainment Display */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Direct Attainment Score
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: 2 }}>
                {directAttainmentStr}
                <span style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginLeft: 4 }}>/ 3.00</span>
              </div>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#475569', lineHeight: 1.45 }}>
              Aggregated from internal continuous assessments, course assignments, labs, and end-semester examinations across curriculum semesters.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/co-attainment?programmeBatchId=${programmeBatchId}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0f9ff';
              e.currentTarget.style.borderColor = DIRECT_COLOR;
              e.currentTarget.style.color = DIRECT_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#0f172a';
            }}
          >
            <span>Explore Direct Attainment</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* BLOCK 2: PROGRAMME INDIRECT */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    background: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={16} color={INDIRECT_COLOR} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                    PROGRAMME INDIRECT
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Events, Activities & Surveys</div>
                </div>
              </div>

              {/* Weight Callout */}
              <div
                style={{
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  color: '#0f766e',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                Weight: {indirectWeight}%
              </div>
            </div>

            {/* Numeric Attainment Display */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Indirect Attainment Score
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: 2 }}>
                {indirectAttainmentStr}
                <span style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginLeft: 4 }}>/ 3.00</span>
              </div>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#475569', lineHeight: 1.45 }}>
              Derived from programme-level co-curricular events, technical activities, stakeholder surveys, and the graduating batch exit survey.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/programme-coordinator/indirect-attainment?programmeBatchId=${programmeBatchId}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0fdfa';
              e.currentTarget.style.borderColor = INDIRECT_COLOR;
              e.currentTarget.style.color = INDIRECT_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#0f172a';
            }}
          >
            <span>Explore Indirect Attainment</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* BLOCK 3: REAL RECHARTS VISUAL COMPARISON */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            Branch Comparison (0 – 3.0 Scale)
          </div>
          <div style={{ height: 160, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 3.0]}
                  ticks={[0, 1.0, 2.0, 3.0]}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<SourceTooltip />} />
                <Bar dataKey="attainment" radius={[6, 6, 0, 0]} barSize={36}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 6 }}>
            Direct (80%) vs Indirect (20%) configured weighting ratio
          </div>
        </div>
      </div>
    </div>
  );
}
