import { useState } from 'react';
import { BarChart3, Award } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function POPSOAttainmentEngine({ hideFooter = false }) {
  const { role } = useAuth();
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
    activePOs = [],
    activePSOs = [],
    activeCOs = [],
    coMapping = {},
    coAttainment = {},
  } = useAcademic();

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'competency'

  // Dynamic Lists from Outcome Management
  const poList = (activePOs || []).map((p) => p?.code || p).filter(Boolean);
  const psoList = (activePSOs || []).map((p) => p?.code || p).filter(Boolean);
  const courseOutcomes = activeCOs || [];

  const activeData = (selectedCourse?.id && coAttainment?.[selectedCourse.id]) || selectedCourse || {};

  // Helper: Get mapping strength for a CO and PO/PSO from real coMapping store
  const getMappingStrength = (coCode, targetCode) => {
    if (!coCode || !targetCode || !selectedCourse?.id) return '-';
    const val = coMapping?.[selectedCourse.id]?.[`${coCode}-${targetCode}`];
    return (val !== undefined && val !== null) ? val : '-';
  };

  // Helper: Calculate Average for a PO or PSO column
  const calculateAverage = (key) => {
    let sum = 0;
    let count = 0;
    courseOutcomes.forEach((co) => {
      const val = getMappingStrength(co?.code, key);
      if (typeof val === 'number') {
        sum += val;
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(2) : '-';
  };

  // Helper: Calculate Final PO/PSO Attainment Value: (Average * Overall CO Attainment) / 3
  const calculateFinalAttainment = (key) => {
    const avg = calculateAverage(key);
    if (avg === '-') return '-';
    const val = (parseFloat(avg) * activeData.overallCOAttainment) / 3;
    return val.toFixed(2);
  };

  return (
    <div className="animated-page">
      {/* Top Banner Header */}
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
              <BarChart3 size={24} style={{ color: '#4f46e5' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
                PO/PSO Attainment
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f3ff', border: '1.5px solid #6366f1', padding: '6px 14px', borderRadius: '10px' }}>
            <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '700' }}>Overall CO Attainment:</span>
            <strong style={{ fontSize: '16px', color: '#059669' }}>{activeData.overallCOAttainment}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('summary')}
        >
          CO to PO & PSO Attainment Matrix (Table 1 & Table 2)
        </button>
        <button
          className={`btn ${activeTab === 'competency' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('competency')}
        >
          Competency Breakdown
        </button>
      </div>

      {/* TAB 1: Clean Table Matrix */}
      {activeTab === 'summary' && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
              Programme Outcome & PSO Attainment Table ({courseOutcomes.length} COs)
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th colSpan={2} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                    Table 1: Mapping of CO to PO/PSO
                  </th>
                  <th colSpan={poList.length || 1} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
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
                  <th style={{ width: '110px' }}>CO Code</th>
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
                    <td colSpan={2 + Math.max(1, poList.length) + psoList.length} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      No Course Outcomes defined in Outcome Management yet.
                    </td>
                  </tr>
                ) : (
                  courseOutcomes.map((co, idx) => (
                    <tr key={co.code || idx}>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ fontWeight: '700', color: '#0f172a' }}>{co.code}</td>

                      {poList.map((po) => (
                        <td key={po} style={{ textAlign: 'center' }}>
                          {getMappingStrength(co.code, po)}
                        </td>
                      ))}

                      {psoList.map((pso) => (
                        <td key={pso} style={{ textAlign: 'center' }}>
                          {getMappingStrength(co.code, pso)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}

                {/* Table 1 Average Row */}
                <tr style={{ background: '#f8fafc', fontWeight: '700' }}>
                  <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', color: '#334155' }}>
                    Average
                  </td>
                  {poList.map((po) => (
                    <td key={po} style={{ textAlign: 'center', color: '#0f172a' }}>
                      {calculateAverage(po)}
                    </td>
                  ))}
                  {psoList.map((pso) => (
                    <td key={pso} style={{ textAlign: 'center', color: '#0f172a' }}>
                      {calculateAverage(pso)}
                    </td>
                  ))}
                </tr>

                {/* Overall CO Attainment Row */}
                <tr style={{ background: '#f8fafc', fontWeight: '700' }}>
                  <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', color: '#334155' }}>
                    Overall CO Attainment
                  </td>
                  <td colSpan={Math.max(1, poList.length) + psoList.length} style={{ textAlign: 'center', color: '#0f172a' }}>
                    {activeData.overallCOAttainment}
                  </td>
                </tr>

                {/* Table 2 Final PO/PSO Attainment Values Row */}
                <tr style={{ background: '#f1f5f9', fontWeight: '800', borderTop: '2px solid #cbd5e1' }}>
                  <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', color: '#0f172a' }}>
                    PO / PSO Attainment Value
                  </td>
                  {poList.map((po) => (
                    <td key={po} style={{ textAlign: 'center', color: '#0f172a', fontSize: '13.5px' }}>
                      {calculateFinalAttainment(po)}
                    </td>
                  ))}
                  {psoList.map((pso) => (
                    <td key={pso} style={{ textAlign: 'center', color: '#0f172a', fontSize: '13.5px' }}>
                      {calculateFinalAttainment(pso)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Competency Breakdown */}
      {activeTab === 'competency' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
              Competency-Level PO & PSO Attainment Summary
            </h3>
          </div>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Outcome</th>
                <th style={{ width: '130px' }}>Target Code</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Average Mapping</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Overall CO Attainment</th>
                <th style={{ textAlign: 'center' }}>Final Attainment Score</th>
              </tr>
            </thead>
            <tbody>
              {poList.map((po) => {
                const avg = calculateAverage(po);
                const finalVal = calculateFinalAttainment(po);
                return (
                  <tr key={po}>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: '#475569' }}>PO</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{po}</td>
                    <td style={{ textAlign: 'center' }}>{avg}</td>
                    <td style={{ textAlign: 'center' }}>{activeData.overallCOAttainment}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                      {finalVal}
                    </td>
                  </tr>
                );
              })}
              {psoList.map((pso) => {
                const avg = calculateAverage(pso);
                const finalVal = calculateFinalAttainment(pso);
                return (
                  <tr key={pso}>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: '#475569' }}>PSO</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{pso}</td>
                    <td style={{ textAlign: 'center' }}>{avg}</td>
                    <td style={{ textAlign: 'center' }}>{activeData.overallCOAttainment}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                      {finalVal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Save, Previous & Save & Next Footer */}
      {!hideFooter && (
        <SectionSaveFooter
          label="PO/PSO Attainment"
          prevPath={role === 'FACULTY' ? '/survey-upload' : '/course-atr'}
          nextPath={role === 'FACULTY' ? '/course-atr' : '/programme-atr'}
          nextLabel={role === 'FACULTY' ? 'Save & Proceed to Course ATR →' : 'Save & Proceed to Programme ATR →'}
        />
      )}
    </div>
  );
}
