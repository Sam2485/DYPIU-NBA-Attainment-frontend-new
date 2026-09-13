import React from 'react';
import { Layers, ChevronRight, Landmark, Building2, GraduationCap, Calendar, Globe2 } from 'lucide-react';

export default function ActiveScopeBanner({
  scopeName = 'Institution-wide (All Schools & Programmes)',
  school = null,
  department = null,
  programme = null,
  batch = null,
}) {
  // Determine scope level
  let scopeLevel = 'INSTITUTION-WIDE SCOPE';
  let badgeColor = '#4f46e5';
  let badgeBg = '#eef2ff';
  let badgeBorder = '#c7d2fe';

  if (batch) {
    scopeLevel = 'COHORT BATCH SCOPE';
    badgeColor = '#7c3aed';
    badgeBg = '#f5f3ff';
    badgeBorder = '#ddd6fe';
  } else if (programme) {
    scopeLevel = 'MASTER PROGRAMME SCOPE';
    badgeColor = '#d97706';
    badgeBg = '#fffbeb';
    badgeBorder = '#fde68a';
  } else if (department) {
    scopeLevel = 'DEPARTMENT SCOPE';
    badgeColor = '#059669';
    badgeBg = '#ecfdf5';
    badgeBorder = '#a7f3d0';
  } else if (school) {
    scopeLevel = 'SCHOOL SCOPE';
    badgeColor = '#0284c7';
    badgeBg = '#f0f9ff';
    badgeBorder = '#bae6fd';
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '14px 18px',
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        {/* Left Side: Scope Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              background: badgeBg,
              color: badgeColor,
              border: `1px solid ${badgeBorder}`,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {scopeLevel}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: !school ? '#0f172a' : '#64748b', fontWeight: !school ? 700 : 500 }}>
              <Globe2 size={13} color="#4f46e5" />
              University
            </span>

            {school && (
              <>
                <ChevronRight size={13} color="#94a3b8" />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: !department ? '#0f172a' : '#64748b', fontWeight: !department ? 700 : 500 }}>
                  <Landmark size={13} color="#0284c7" />
                  {school.name || school.code}
                </span>
              </>
            )}

            {department && (
              <>
                <ChevronRight size={13} color="#94a3b8" />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: !programme ? '#0f172a' : '#64748b', fontWeight: !programme ? 700 : 500 }}>
                  <Building2 size={13} color="#059669" />
                  {department.name || department.code}
                </span>
              </>
            )}

            {programme && (
              <>
                <ChevronRight size={13} color="#94a3b8" />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: !batch ? '#0f172a' : '#64748b', fontWeight: !batch ? 700 : 500 }}>
                  <GraduationCap size={13} color="#d97706" />
                  {programme.name} {programme.degreeAwarded ? `(${programme.degreeAwarded})` : ''}
                </span>
              </>
            )}

            {batch && (
              <>
                <ChevronRight size={13} color="#94a3b8" />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0f172a', fontWeight: 700 }}>
                  <Calendar size={13} color="#7c3aed" />
                  {batch.name || `Batch ${batch.startYear}-${batch.endYear}`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Scope Summary Text */}
        <div style={{ fontSize: 11.5, color: '#64748b' }}>
          Showing calculated finalized outcome attainments for current filtered scope
        </div>
      </div>
    </div>
  );
}
