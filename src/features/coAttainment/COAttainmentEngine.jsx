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

  const courseOutcomes = activeCOs;
  const poList = activePOs.map((p) => p.code);
  const psoList = activePSOs.map((p) => p.code);

  // Backend returned CO Attainment values
  const directLevel = courseAttainmentStore?.directAttainment ?? courseAttainmentStore?.averageDirectAttainment ?? null;
  const indirectLevel = courseAttainmentStore?.indirectAttainment ?? courseAttainmentStore?.averageIndirectAttainment ?? null;
  const overallCOAttainment = courseAttainmentStore?.overallCoAttainment ?? courseAttainmentStore?.overallAttainment ?? (
    directLevel != null && indirectLevel != null
      ? ((Number(directLevel) * directWeight + Number(indirectLevel) * indirectWeight) / 100).toFixed(2)
      : null
  );

  const matrix = coMapping?.matrix || coMapping || {};

  // Helper: Mapping strength from real matrix
  const getMappingStrength = (coCode, targetCode) => {
    if (matrix[coCode] && matrix[coCode][targetCode] != null) {
      return Number(matrix[coCode][targetCode]);
    }
    return '-';
  };

  // Helper: Average mapping strength
  const calculateAverageMapping = (key) => {
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

  // Helper: Table 2 Final PO/PSO Attainment Value: (Average * Overall CO Attainment) / 3
  const calculatePoPsoAttainment = (key) => {
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
                {selectedCourse?.code || selectedCourseOffering?.courseCode || 'Course'} — {selectedCourse?.name || selectedCourseOffering?.courseName || 'Selected Offering'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Weightage & Threshold Summary Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            Attainment Configuration Parameters ({selectedCourse?.code || 'Course'} • {academicYear || 'Current Year'})
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
            Table 1 : Combined Mapping of CO to PO/PSO ({selectedCourse?.code || 'Course'})
          </h3>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Course Outcomes ({courseOutcomes.length})
                </th>
                <th colSpan={poList.length} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Programme Outcomes ({poList.length} POs)
                </th>
                {psoList.length > 0 && (
                  <th colSpan={psoList.length} style={{ textAlign: 'center', background: '#e2e8f0', color: '#0f172a' }}>
                    Programme Specific Outcomes ({psoList.length} PSOs)
                  </th>
                )}
              </tr>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>Sr No</th>
                <th style={{ width: '120px' }}>CO Code</th>
                {poList.map((po) => (
                  <th key={po} style={{ width: '65px', textAlign: 'center' }}>
                    {po}
                  </th>
                ))}
                {psoList.map((pso) => (
                  <th key={pso} style={{ width: '65px', textAlign: 'center' }}>
                    {pso}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courseOutcomes.length === 0 ? (
                <tr>
                  <td colSpan={2 + poList.length + psoList.length} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                    No Course Outcomes defined.
                  </td>
                </tr>
              ) : (
                courseOutcomes.map((co, idx) => (
                  <tr key={co.code}>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{co.code}</td>

                    {/* PO Columns */}
                    {poList.map((po) => {
                      const val = getMappingStrength(co.code, po);
                      return (
                        <td key={po} style={{ textAlign: 'center' }}>
                          {val}
                        </td>
                      );
                    })}

                    {/* PSO Columns */}
                    {psoList.map((pso) => {
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
                  {poList.map((po) => (
                    <td key={po} style={{ textAlign: 'center', color: '#0f172a', fontWeight: '700' }}>
                      {calculateAverageMapping(po)}
                    </td>
                  ))}
                  {psoList.map((pso) => (
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
            Table 2 : PO &amp; PSO Attainment Values for {selectedCourse?.code || 'Course'} ({academicYear || 'Current Year'})
          </h3>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Course Code: {selectedCourse?.code || 'Course'}
                </th>
                <th colSpan={poList.length} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Programme Outcomes ({poList.length} POs)
                </th>
                {psoList.length > 0 && (
                  <th colSpan={psoList.length} style={{ textAlign: 'center', background: '#e2e8f0', color: '#0f172a' }}>
                    Programme Specific Outcomes ({psoList.length} PSOs)
                  </th>
                )}
              </tr>
              <tr>
                <th style={{ width: '120px' }}>Course Code</th>
                <th style={{ width: '180px' }}>Metric</th>
                {poList.map((po) => (
                  <th key={po} style={{ width: '65px', textAlign: 'center' }}>
                    {po}
                  </th>
                ))}
                {psoList.map((pso) => (
                  <th key={pso} style={{ width: '65px', textAlign: 'center' }}>
                    {pso}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: '700', color: '#0f172a' }}>{selectedCourse?.code || 'Course'}</td>
                <td style={{ fontSize: '12px', color: '#475569' }}>Avg Mapping Strength (Table 1)</td>
                {poList.map((po) => (
                  <td key={po} style={{ textAlign: 'center' }}>
                    {calculateAverageMapping(po)}
                  </td>
                ))}
                {psoList.map((pso) => (
                  <td key={pso} style={{ textAlign: 'center' }}>
                    {calculateAverageMapping(pso)}
                  </td>
                ))}
              </tr>
              <tr style={{ background: '#f1f5f9', fontWeight: '800' }}>
                <td style={{ fontWeight: '800', color: '#0f172a' }}>{selectedCourse?.code || 'Course'}</td>
                <td style={{ fontWeight: '800', color: '#0f172a' }}>Final PO / PSO Attainment Value</td>
                {poList.map((po) => (
                  <td key={po} style={{ textAlign: 'center', fontSize: '13.5px', color: '#0f172a' }}>
                    {calculatePoPsoAttainment(po)}
                  </td>
                ))}
                {psoList.map((pso) => (
                  <td key={pso} style={{ textAlign: 'center', fontSize: '13.5px', color: '#0f172a' }}>
                    {calculatePoPsoAttainment(pso)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CO Direct & Indirect Attainment Table */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            CO Direct &amp; Indirect Attainment ({courseOutcomes.length} COs)
          </h3>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Attainment Component</th>
                <th style={{ width: '220px' }}>Metric</th>
                {courseOutcomes.map((co) => (
                  <th key={co.code} style={{ textAlign: 'center' }}>
                    {co.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: '700', color: '#2563eb' }}>Direct Examination</td>
                <td style={{ fontSize: '12px', color: '#475569' }}>Target Threshold ({thresholdPct})</td>
                {courseOutcomes.map((co) => (
                  <td key={co.code} style={{ textAlign: 'center', fontWeight: '600' }}>
                    {thresholdPct}
                  </td>
                ))}
              </tr>
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ fontWeight: '700', color: '#2563eb' }}>Direct Examination</td>
                <td style={{ fontWeight: '700', color: '#0f172a' }}>Direct Attainment Level</td>
                {courseOutcomes.map((co) => (
                  <td key={co.code} style={{ textAlign: 'center', fontWeight: '800', color: '#2563eb' }}>
                    {directLevel != null ? Number(directLevel).toFixed(2) : '—'}
                  </td>
                ))}
              </tr>

              <tr style={{ background: '#f8fafc' }}>
                <td style={{ fontWeight: '700', color: '#0284c7' }}>Indirect Course Survey</td>
                <td style={{ fontWeight: '700', color: '#0f172a' }}>Indirect Attainment Level</td>
                {courseOutcomes.map((co) => (
                  <td key={co.code} style={{ textAlign: 'center', fontWeight: '800', color: '#0284c7' }}>
                    {indirectLevel != null ? Number(indirectLevel).toFixed(2) : '—'}
                  </td>
                ))}
              </tr>

              <tr style={{ background: '#f1f5f9', fontWeight: '800', borderTop: '2px solid #cbd5e1' }}>
                <td style={{ color: '#0f172a' }}>Combined CO Attainment</td>
                <td style={{ color: '#0f172a' }}>({directWeight}% Direct + {indirectWeight}% Indirect)</td>
                {courseOutcomes.map((co) => (
                  <td key={co.code} style={{ textAlign: 'center', fontSize: '14px', color: '#0f172a' }}>
                    {overallCOAttainment != null ? Number(overallCOAttainment).toFixed(2) : '—'}
                  </td>
                ))}
              </tr>
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
