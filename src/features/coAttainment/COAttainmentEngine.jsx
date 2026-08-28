import { useEffect } from 'react';
import { Calculator, Save, CheckCircle2 } from 'lucide-react';
import { useAcademic } from '../../context/academic';
import { useAttainment } from '../../context/attainment';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function COAttainmentEngine({ hideFooter = false }) {
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
    selectedCourseOffering,
    courseOfferingId,
    activeCOs = [],
    activePOs = [],
    activePSOs = [],
    coMapping,
  } = useAcademic();

  const {
    attainmentConfigs,
    courseAttainmentStore,
    loadCourseCoAttainment,
  } = useAttainment();

  useEffect(() => {
    if (courseOfferingId) {
      loadCourseCoAttainment(courseOfferingId).catch(() => {});
    }
  }, [courseOfferingId, loadCourseCoAttainment]);

  // Parameters from Attainment Configuration
  const directWeight = attainmentConfigs?.directWeight ?? 80;
  const indirectWeight = attainmentConfigs?.indirectWeight ?? 20;
  const directThreshold = attainmentConfigs?.targetThresholdPercentage ?? attainmentConfigs?.directThreshold ?? 60;
  const thresholdPct = `${directThreshold}%`;

  const attainmentReport = courseAttainmentStore ?? {};
  const displayCourseCode = attainmentReport.courseCode
    ?? selectedCourse?.code
    ?? selectedCourseOffering?.courseCode
    ?? 'Course';
  const displayCourseName = attainmentReport.courseName
    ?? selectedCourse?.name
    ?? selectedCourseOffering?.courseName
    ?? 'Selected Offering';
  const table1Mapping = Array.isArray(attainmentReport.table1Mapping) ? attainmentReport.table1Mapping : [];
  const table2DirectPO = Array.isArray(attainmentReport.table2DirectPO) ? attainmentReport.table2DirectPO : [];
  const table2DirectPSO = Array.isArray(attainmentReport.table2DirectPSO) ? attainmentReport.table2DirectPSO : [];
  const table3CoAttainments = Array.isArray(attainmentReport.table3CoAttainments)
    ? attainmentReport.table3CoAttainments
    : [];
  const courseOutcomes = table3CoAttainments.length > 0
    ? table3CoAttainments.map((item) => ({ code: item.coCode, statement: item.statement }))
    : activeCOs;
  const poList = [...new Set(table1Mapping.flatMap((item) => Object.keys(item.poMappings ?? {})))];
  const psoList = [...new Set(table1Mapping.flatMap((item) => Object.keys(item.psoMappings ?? {})))];
  const displayPOs = poList.length > 0 ? poList : activePOs.map((p) => p.code);
  const displayPSOs = psoList.length > 0 ? psoList : activePSOs.map((p) => p.code);

  // Backend returned CO Attainment values
  const directLevel = attainmentReport.directAttainment ?? attainmentReport.averageDirectAttainment ?? null;
  const indirectLevel = attainmentReport.indirectAttainment ?? attainmentReport.averageIndirectAttainment ?? null;
  const overallCOAttainment = attainmentReport.overallCoAttainment ?? attainmentReport.overallAttainment ?? (
    directLevel != null && indirectLevel != null
      ? ((Number(directLevel) * directWeight + Number(indirectLevel) * indirectWeight) / 100).toFixed(2)
      : null
  );

  const matrix = table1Mapping.length > 0
    ? Object.fromEntries(table1Mapping.map((item) => [
      item.coCode,
      { ...(item.poMappings ?? {}), ...(item.psoMappings ?? {}) },
    ]))
    : (coMapping?.matrix || coMapping || {});

  // Helper: Mapping strength from real matrix
  const getMappingStrength = (coCode, targetCode) => {
    if (matrix[coCode] && matrix[coCode][targetCode] != null) {
      return Number(matrix[coCode][targetCode]);
    }
    return '-';
  };

  // Helper: Average mapping strength
  const calculateAverageMapping = (key) => {
    const serverRow = table2DirectPO.find((item) => item.poCode === key)
      ?? table2DirectPSO.find((item) => item.psoCode === key);
    if (serverRow?.averageMapping != null) return Number(serverRow.averageMapping).toFixed(2);
    let sum = 0;
    let count = 0;
    courseOutcomes.forEach((co) => {
      const val = getMappingStrength(co.code, key);
      if (typeof val === 'number') {
        sum += val;
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(2) : '-';
  };

  // Table 2 contribution is calculated by the backend from the direct
  // attainment and average mapping strength.
  const calculatePoPsoAttainment = (key) => {
    const serverRow = table2DirectPO.find((item) => item.poCode === key)
      ?? table2DirectPSO.find((item) => item.psoCode === key);
    if (serverRow?.directContribution != null) return Number(serverRow.directContribution).toFixed(2);
    const avg = calculateAverageMapping(key);
    if (avg === '-' || overallCOAttainment == null) return '-';
    return ((parseFloat(avg) * parseFloat(overallCOAttainment)) / 3).toFixed(2);
  };

  return (
    <div className="animated-page">
      {/* Header Banner */}
      <div className="banner-dark-gradient">
        <div className="banner-content-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#f5f3ff',
                border: '1.5px solid #6366f1',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Calculator size={24} style={{ color: '#4f46e5' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
                Course Outcome (CO) Attainment
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {displayCourseCode} — {displayCourseName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Weightage & Threshold Summary Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            Attainment Configuration Parameters ({displayCourseCode} • {academicYear || 'Current Year'})
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Direct Weightage</span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>{directWeight}%</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Indirect Weightage</span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>{indirectWeight}%</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Target Threshold</span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>{thresholdPct}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Overall CO Attainment</span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
              {overallCOAttainment != null ? overallCOAttainment : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Table 1 : Combined Mapping of CO to PO/PSO */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            Table 1 : Combined Mapping of CO to PO/PSO ({displayCourseCode})
          </h3>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Course Outcomes ({courseOutcomes.length})
                </th>
                <th colSpan={displayPOs.length} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Programme Outcomes ({displayPOs.length} POs)
                </th>
                {displayPSOs.length > 0 && (
                  <th colSpan={displayPSOs.length} style={{ textAlign: 'center', background: '#e2e8f0', color: '#0f172a' }}>
                    Programme Specific Outcomes ({displayPSOs.length} PSOs)
                  </th>
                )}
              </tr>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>Sr No</th>
                <th style={{ width: '120px' }}>CO Code</th>
                {displayPOs.map((po) => (
                  <th key={po} style={{ width: '65px', textAlign: 'center' }}>
                    {po}
                  </th>
                ))}
                {displayPSOs.map((pso) => (
                  <th key={pso} style={{ width: '65px', textAlign: 'center' }}>
                    {pso}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courseOutcomes.length === 0 ? (
                <tr>
                  <td colSpan={2 + displayPOs.length + displayPSOs.length} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                    No Course Outcomes defined.
                  </td>
                </tr>
              ) : (
                courseOutcomes.map((co, idx) => (
                  <tr key={co.code}>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{co.code}</td>

                    {/* PO Columns */}
                    {displayPOs.map((po) => {
                      const val = getMappingStrength(co.code, po);
                      return (
                        <td key={po} style={{ textAlign: 'center' }}>
                          {val}
                        </td>
                      );
                    })}

                    {/* PSO Columns */}
                    {displayPSOs.map((pso) => {
                      const val = getMappingStrength(co.code, pso);
                      return (
                        <td key={pso} style={{ textAlign: 'center' }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}

              {/* Average Row */}
              {courseOutcomes.length > 0 && (
                <tr style={{ background: '#f8fafc', fontWeight: '700' }}>
                  <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', color: '#0f172a' }}>
                    Average
                  </td>
                  {displayPOs.map((po) => (
                    <td key={po} style={{ textAlign: 'center', color: '#0f172a', fontWeight: '700' }}>
                      {calculateAverageMapping(po)}
                    </td>
                  ))}
                  {displayPSOs.map((pso) => (
                    <td key={pso} style={{ textAlign: 'center', color: '#0f172a', fontWeight: '700' }}>
                      {calculateAverageMapping(pso)}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: PO & PSO Attainment Values */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            Table 2 : PO &amp; PSO Attainment Values for {displayCourseCode} ({academicYear || 'Current Year'})
          </h3>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Course Code: {displayCourseCode}
                </th>
                <th colSpan={displayPOs.length} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Programme Outcomes ({displayPOs.length} POs)
                </th>
                {displayPSOs.length > 0 && (
                  <th colSpan={displayPSOs.length} style={{ textAlign: 'center', background: '#e2e8f0', color: '#0f172a' }}>
                    Programme Specific Outcomes ({displayPSOs.length} PSOs)
                  </th>
                )}
              </tr>
              <tr>
                <th style={{ width: '120px' }}>Course Code</th>
                <th style={{ width: '180px' }}>Metric</th>
                {displayPOs.map((po) => (
                  <th key={po} style={{ width: '65px', textAlign: 'center' }}>
                    {po}
                  </th>
                ))}
                {displayPSOs.map((pso) => (
                  <th key={pso} style={{ width: '65px', textAlign: 'center' }}>
                    {pso}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: '700', color: '#0f172a' }}>{displayCourseCode}</td>
                <td style={{ fontSize: '12px', color: '#475569' }}>Avg Mapping Strength (Table 1)</td>
                {displayPOs.map((po) => (
                  <td key={po} style={{ textAlign: 'center' }}>
                    {calculateAverageMapping(po)}
                  </td>
                ))}
                {displayPSOs.map((pso) => (
                  <td key={pso} style={{ textAlign: 'center' }}>
                    {calculateAverageMapping(pso)}
                  </td>
                ))}
              </tr>
              <tr style={{ background: '#f1f5f9', fontWeight: '800' }}>
                <td style={{ fontWeight: '800', color: '#0f172a' }}>{displayCourseCode}</td>
                <td style={{ fontWeight: '800', color: '#0f172a' }}>Direct Attainment Contribution</td>
                {displayPOs.map((po) => (
                  <td key={po} style={{ textAlign: 'center', fontSize: '13.5px', color: '#0f172a' }}>
                    {calculatePoPsoAttainment(po)}
                  </td>
                ))}
                {displayPSOs.map((pso) => (
                  <td key={pso} style={{ textAlign: 'center', fontSize: '13.5px', color: '#0f172a' }}>
                    {calculatePoPsoAttainment(pso)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 3: CO-level attainment report */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            Table 3 : CO Attainment Report ({courseOutcomes.length} COs)
          </h3>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '220px' }}>Attainment Measure</th>
                {table3CoAttainments.map((item) => (
                  <th key={item.coCode} style={{ textAlign: 'center', minWidth: '110px' }}>{item.coCode}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table3CoAttainments.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No CO-attainment report is available for this programme-batch course yet.
                  </td>
                </tr>
              ) : [
                ['Target Level', (item) => item.targetLevel != null ? Number(item.targetLevel).toFixed(2) : '—'],
                ['Direct Attainment %', (item) => item.directPercentage != null ? `${Number(item.directPercentage).toFixed(2)}%` : '—'],
                ['Direct Attainment', (item) => item.directLevel != null ? `L${item.directLevel}` : '—'],
                ['Indirect Attainment %', (item) => item.indirectPercentage != null ? `${Number(item.indirectPercentage).toFixed(2)}%` : '—'],
                ['Indirect Attainment', (item) => item.indirectScore != null ? `${Number(item.indirectScore).toFixed(2)}${item.indirectLevel != null ? ` / L${item.indirectLevel}` : ''}` : '—'],
                ['Final Attainment', (item) => item.finalAttainment != null ? Number(item.finalAttainment).toFixed(2) : '—'],
                ['Target Status', (item) => item.targetMet == null ? '—' : item.targetMet ? 'Met' : 'Not met'],
                ['Observation', (item) => item.observation || '—'],
              ].map(([label, getValue], index) => (
                <tr key={label} style={label === 'Final Attainment' ? { background: '#f1f5f9', fontWeight: '800', borderTop: '2px solid #cbd5e1' } : undefined}>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{label}</td>
                  {table3CoAttainments.map((item) => (
                    <td key={item.coCode} style={{ textAlign: 'center', fontWeight: label === 'Final Attainment' ? '800' : '600', color: label === 'Target Status' && item.targetMet === false ? '#b91c1c' : undefined }}>
                      {getValue(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save, Previous & Save & Next Footer */}
      {!hideFooter && (
        <SectionSaveFooter
          label="CO Attainment"
          prevPath="/survey-upload"
          nextPath="/course-atr"
          nextLabel="Save & Proceed to Course ATR →"
        />
      )}
    </div>
  );
}
