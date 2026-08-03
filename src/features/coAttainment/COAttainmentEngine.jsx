import { useState } from 'react';
import { Calculator, Save } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function COAttainmentEngine() {
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
    activeCOs,
    activePOs,
    activePSOs,
    yearMetrics,
  } = useAcademic();

  const [directWeight, setDirectWeight] = useState(80);
  const [indirectWeight, setIndirectWeight] = useState(20);

  // Dynamic Lists
  const courseOutcomes = activeCOs;
  const poList = activePOs.map((p) => p.code);
  const psoList = activePSOs.map((p) => p.code);

  // Year-wise Attainment Levels from AcademicContext
  const directLevel = yearMetrics.directExamAttainment;
  const indirectLevel = yearMetrics.indirectSurveyAttainment;
  const overallCOAttainment = ((directLevel * directWeight + indirectLevel * indirectWeight) / 100).toFixed(2);

  // Helper: Mapping strength
  const getMappingStrength = (coCode, targetCode) => {
    if (targetCode === 'PO1' || targetCode === 'PO2' || targetCode === 'PSO1') return 3;
    if (targetCode === 'PO3' || targetCode === 'PSO2') return 2;
    if (targetCode === 'PO4' || targetCode === 'PO12' || targetCode === 'PSO3') return coCode.endsWith('.5') || coCode.endsWith('.6') ? 1 : 2;
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
    if (avg === '-') return '-';
    return ((parseFloat(avg) * parseFloat(overallCOAttainment)) / 3).toFixed(2);
  };

  const handleSaveCalculation = () => {
    alert(`CO & PO/PSO Attainment calculation saved for ${selectedCourse.code} (${academicYear})!`);
  };

  return (
    <div className="animated-page">
      {/* Restored Dark Gradient Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)',
          color: '#ffffff',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.1)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Calculator size={24} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
                Course Outcome (CO) Attainment Engine (Module 8)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#bfdbfe' }}>
                Course: <strong>{selectedCourse.code} - {selectedCourse.name}</strong> • Programme: <strong>{selectedProgramme?.code}</strong> • AY: <strong>{academicYear}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-success" onClick={handleSaveCalculation}>
              <Save size={15} /> Save Calculation Results
            </button>
          </div>
        </div>
      </div>

      {/* Weightage & Threshold Summary Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            Attainment Configuration Parameters ({academicYear})
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
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>{yearMetrics.thresholdPct}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Overall CO Attainment</span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{overallCOAttainment}</div>
          </div>
        </div>
      </div>

      {/* CO Direct & Indirect Attainment Table */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            CO Direct & Indirect Examination / Survey Attainment ({courseOutcomes.length} COs)
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Attainment Component</th>
                <th style={{ width: '180px' }}>Metric</th>
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
                <td style={{ fontSize: '12px', color: '#475569' }}>% Students ≥ Threshold ({yearMetrics.thresholdPct})</td>
                {courseOutcomes.map((co) => (
                  <td key={co.code} style={{ textAlign: 'center', fontWeight: '600' }}>
                    {yearMetrics.thresholdPct}
                  </td>
                ))}
              </tr>
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ fontWeight: '700', color: '#2563eb' }}>Direct Examination</td>
                <td style={{ fontWeight: '700', color: '#0f172a' }}>Direct Attainment Level</td>
                {courseOutcomes.map((co) => (
                  <td key={co.code} style={{ textAlign: 'center', fontWeight: '800', color: '#2563eb' }}>
                    {directLevel}
                  </td>
                ))}
              </tr>

              <tr>
                <td style={{ fontWeight: '700', color: '#0284c7' }}>Indirect Course Survey</td>
                <td style={{ fontSize: '12px', color: '#475569' }}>% Positive Rating</td>
                {courseOutcomes.map((co) => (
                  <td key={co.code} style={{ textAlign: 'center', fontWeight: '600' }}>
                    82%
                  </td>
                ))}
              </tr>
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ fontWeight: '700', color: '#0284c7' }}>Indirect Course Survey</td>
                <td style={{ fontWeight: '700', color: '#0f172a' }}>Indirect Attainment Level</td>
                {courseOutcomes.map((co) => (
                  <td key={co.code} style={{ textAlign: 'center', fontWeight: '800', color: '#0284c7' }}>
                    {indirectLevel}
                  </td>
                ))}
              </tr>

              <tr style={{ background: '#f1f5f9', fontWeight: '800', borderTop: '2px solid #cbd5e1' }}>
                <td style={{ color: '#0f172a' }}>Combined CO Attainment</td>
                <td style={{ color: '#0f172a' }}>({directWeight}% Direct + {indirectWeight}% Indirect)</td>
                {courseOutcomes.map((co) => (
                  <td key={co.code} style={{ textAlign: 'center', fontSize: '14px', color: '#0f172a' }}>
                    {overallCOAttainment}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: PO & PSO Attainment Values */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            Table 2 : PO & PSO Attainment Values for {selectedCourse.code} ({academicYear})
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Course Code: {selectedCourse.code}
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
                <td style={{ fontWeight: '700', color: '#0f172a' }}>{selectedCourse.code}</td>
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
                <td style={{ fontWeight: '800', color: '#0f172a' }}>{selectedCourse.code}</td>
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
    </div>
  );
}
