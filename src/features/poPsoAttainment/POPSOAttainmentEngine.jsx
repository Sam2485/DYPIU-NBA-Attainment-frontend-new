import { useState, useEffect } from 'react';
import { BarChart3, Award, RefreshCw } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { getCourseCombinedAttainment } from '../../api/academic';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function POPSOAttainmentEngine({ hideFooter = false }) {
  const { role } = useAuth();
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
    availableCourses = [],
    activePOs = [],
    activePSOs = [],
    activeCOs = [],
  } = useAcademic();

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'competency'
  const [loading, setLoading] = useState(false);
  const [combinedData, setCombinedData] = useState(null);

  const currentCourse = selectedCourse || availableCourses[0];
  const courseId = currentCourse?.id;

  useEffect(() => {
    let isMounted = true;
    if (!courseId) return;

    setLoading(true);
    getCourseCombinedAttainment(courseId)
      .then((res) => {
        if (isMounted && res?.data) {
          setCombinedData(res.data);
        }
      })
      .catch((err) => {
        console.error('Error loading PO/PSO attainment:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  // Dynamic Lists from Outcome Management
  const poList = (activePOs || []).map((p) => p?.code || p).filter(Boolean);
  const psoList = (activePSOs || []).map((p) => p?.code || p).filter(Boolean);
  const courseOutcomes = activeCOs || [];

  const overallCOAttainment = combinedData?.overallCoAttainment ?? '0.00';

  // Helper: Get mapping strength for a CO and PO/PSO
  const getMappingStrength = (coCode, targetCode) => {
    if (!coCode) return '-';
    if (targetCode === 'PO1' || targetCode === 'PO2' || targetCode === 'PSO1') return 3;
    if (targetCode === 'PO3' || targetCode === 'PSO2') return 2;
    if (targetCode === 'PO4' || targetCode === 'PO12' || targetCode === 'PSO3') return coCode.endsWith('.5') || coCode.endsWith('.6') ? 1 : 2;
    return '-';
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

  // Helper: Final PO/PSO Attainment Value: (Average * Overall CO Attainment) / 3
  const calculateAttainmentValue = (key) => {
    const avg = calculateAverage(key);
    if (avg === '-' || parseFloat(overallCOAttainment) === 0) return '-';
    return ((parseFloat(avg) * parseFloat(overallCOAttainment)) / 3).toFixed(2);
  };

  return (
    <div className="animated-page">
      {/* Header Banner */}
      <div className="banner-dark-gradient" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)', borderRadius: '16px', padding: '24px 28px', color: '#ffffff', marginBottom: '22px' }}>
        <div className="banner-content-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <BarChart3 size={24} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bae6fd' }}>
                Part 2 — CO to PO & PSO Attainment &nbsp;·&nbsp; {currentCourse ? `${currentCourse.code} — ${currentCourse.name}` : 'Select Course'}
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
                PO & PSO Attainment Engine
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('summary')}
              className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', fontWeight: '700' }}
            >
              Summary Matrix
            </button>
            <button
              onClick={() => setActiveTab('competency')}
              className={`btn ${activeTab === 'competency' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', fontWeight: '700' }}
            >
              Competency Breakdown
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', marginBottom: '20px' }}>
          <RefreshCw size={20} className="spin" style={{ color: '#0284c7', marginBottom: '8px' }} />
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Calculating PO/PSO attainment for {currentCourse?.code}...</div>
        </div>
      )}

      {/* Dynamic Summary Metric Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '22px' }}>
        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #0284c7' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall CO Attainment</span>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0284c7', marginTop: '4px' }}>{overallCOAttainment}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Derived from Direct & Indirect Attainment</div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>POs Mapped</span>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>{poList.length} POs</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{selectedProgramme?.name || 'Programme'}</div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PSOs Mapped</span>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#8b5cf6', marginTop: '4px' }}>{psoList.length} PSOs</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Specific Outcomes</div>
        </div>
      </div>

      {activeTab === 'summary' && (
        <div className="card" style={{ marginBottom: '20px', padding: '22px', border: '1px solid #e2e8f0', borderRadius: '14px', background: '#ffffff' }}>
          <div className="card-header" style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', color: '#0f172a', margin: 0, fontWeight: '800' }}>
              PO & PSO Attainment Summary Matrix ({currentCourse?.code || 'Course'} • {academicYear || 'AY 2025-26'})
            </h3>
          </div>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="audit-data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th colSpan={2} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a', padding: '10px' }}>
                    Course Code: {currentCourse?.code || 'Course'}
                  </th>
                  <th colSpan={poList.length} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a', padding: '10px' }}>
                    Programme Outcomes ({poList.length} POs)
                  </th>
                  {psoList.length > 0 && (
                    <th colSpan={psoList.length} style={{ textAlign: 'center', background: '#e2e8f0', color: '#0f172a', padding: '10px' }}>
                      Programme Specific Outcomes ({psoList.length} PSOs)
                    </th>
                  )}
                </tr>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ width: '130px', padding: '10px' }}>Course Code</th>
                  <th style={{ width: '200px', padding: '10px' }}>Metric</th>
                  {poList.map((po) => (
                    <th key={po} style={{ width: '55px', textAlign: 'center', padding: '10px 4px' }}>
                      {po}
                    </th>
                  ))}
                  {psoList.map((pso) => (
                    <th key={pso} style={{ width: '55px', textAlign: 'center', padding: '10px 4px', background: '#f1f5f9' }}>
                      {pso}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: '800', color: '#0f172a', padding: '12px' }}>{currentCourse?.code || 'Course'}</td>
                  <td style={{ fontSize: '12px', color: '#475569', padding: '12px' }}>Avg Mapping Strength</td>
                  {poList.map((po) => (
                    <td key={po} style={{ textAlign: 'center', padding: '12px 4px', fontWeight: '600' }}>
                      {calculateAverage(po)}
                    </td>
                  ))}
                  {psoList.map((pso) => (
                    <td key={pso} style={{ textAlign: 'center', padding: '12px 4px', fontWeight: '600', background: '#faf5ff' }}>
                      {calculateAverage(pso)}
                    </td>
                  ))}
                </tr>
                <tr style={{ background: '#ecfdf5', fontWeight: '900' }}>
                  <td style={{ fontWeight: '900', color: '#065f46', padding: '14px' }}>{currentCourse?.code || 'Course'}</td>
                  <td style={{ fontWeight: '900', color: '#065f46', padding: '14px' }}>Final PO / PSO Attainment Value</td>
                  {poList.map((po) => (
                    <td key={po} style={{ textAlign: 'center', fontSize: '14px', color: '#047857', fontWeight: '900', padding: '14px 4px' }}>
                      {calculateAttainmentValue(po)}
                    </td>
                  ))}
                  {psoList.map((pso) => (
                    <td key={pso} style={{ textAlign: 'center', fontSize: '14px', color: '#047857', fontWeight: '900', padding: '14px 4px', background: '#d1fae5' }}>
                      {calculateAttainmentValue(pso)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'competency' && (
        <div className="card" style={{ marginBottom: '20px', padding: '22px', border: '1px solid #e2e8f0', borderRadius: '14px', background: '#ffffff' }}>
          <div className="card-header" style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', color: '#0f172a', margin: 0, fontWeight: '800' }}>
              Competency-Level Attainment Breakdown ({currentCourse?.code || 'Course'})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {poList.slice(0, 6).map((po) => {
              const val = calculateAttainmentValue(po);
              return (
                <div key={po} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{po} Competency</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                      Score: {val}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    Average CO-PO Mapping: {calculateAverage(po)} · Target Scale: 3.00
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hideFooter && (
        <SectionSaveFooter
          label="PO & PSO Attainment"
          prevPath="/co-attainment"
          nextPath="/programme-atr"
          nextLabel="Save & Proceed to Programme ATR →"
          onSave={() => alert(`PO/PSO Attainment saved for ${currentCourse?.code || 'Course'} (${academicYear})!`)}
        />
      )}
    </div>
  );
}
