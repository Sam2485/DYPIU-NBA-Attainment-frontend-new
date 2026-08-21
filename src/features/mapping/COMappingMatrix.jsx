import { useState } from 'react';
import { FileSpreadsheet, Grid2X2, Save } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function COMappingMatrix({ hideFooter = false }) {
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
    activePOs,
    activePSOs,
    activeCOs,
    yearMetrics,
    activeAttainmentConfig,
  } = useAcademic();

  const [activeTab, setActiveTab] = useState('po-detail'); // 'po-detail', 'pso-detail', 'combined'

  // Dynamic parameters from Attainment Configuration
  const directWeight = activeAttainmentConfig?.directWeight || 80;
  const indirectWeight = activeAttainmentConfig?.indirectWeight || 20;
  const directThreshold = activeAttainmentConfig?.directThreshold || 60;
  const thresholdPct = `${directThreshold}%`;

  // Year-wise Attainment Levels from AcademicContext
  const directLevel = yearMetrics?.directExamAttainment ?? null;
  const indirectLevel = yearMetrics?.indirectSurveyAttainment ?? null;
  const overallCOAttainment = directLevel !== null && indirectLevel !== null
    ? ((directLevel * directWeight + indirectLevel * indirectWeight) / 100).toFixed(2)
    : yearMetrics?.overallCOAttainment != null
    ? Number(yearMetrics.overallCOAttainment).toFixed(2)
    : null;

  // Dynamic PO & PSO codes arrays from Outcome Management
  const poList = (activePOs || []).map((p) => p.code);
  const psoList = (activePSOs || []).map((p) => p.code);
  const courseOutcomes = activeCOs || [];

  // Keyword Stores for POs & PSOs (keyed by courseId)
  const [poKeywordsStore, setPoKeywordsStore] = useState({});
  const [psoKeywordsStore, setPsoKeywordsStore] = useState({});

  // Helper to get PO competencies dynamically
  const getCoursePoCompetencies = (poCode) => {
    const courseStore = (selectedCourse?.id && poKeywordsStore[selectedCourse.id]) || {};
    if (courseStore[poCode]) return courseStore[poCode];

    const poObj = activePOs.find((p) => p.code === poCode);
    if (poObj && poObj.competencies && poObj.competencies.length > 0) {
      return poObj.competencies.map((c) => ({ ...c, keywords: c.keywords || {} }));
    }

    return [];
  };

  // Helper to get PSO competencies dynamically
  const getCoursePsoCompetencies = (psoCode) => {
    const courseStore = (selectedCourse?.id && psoKeywordsStore[selectedCourse.id]) || {};
    if (courseStore[psoCode]) return courseStore[psoCode];

    const psoObj = activePSOs.find((p) => p.code === psoCode);
    if (psoObj && psoObj.competencies && psoObj.competencies.length > 0) {
      return psoObj.competencies.map((c) => ({ ...c, keywords: c.keywords || {} }));
    }

    return [];
  };

  // Handler for PO Keyword edit
  const handlePoKeywordChange = (poCode, compIndex, coCode, val) => {
    setPoKeywordsStore((prev) => {
      const courseStore = prev[selectedCourse.id] || {};
      const comps = [...(courseStore[poCode] || getCoursePoCompetencies(poCode))];
      comps[compIndex] = {
        ...comps[compIndex],
        keywords: {
          ...comps[compIndex].keywords,
          [coCode]: val,
        },
      };
      return {
        ...prev,
        [selectedCourse.id]: {
          ...courseStore,
          [poCode]: comps,
        },
      };
    });
  };

  // Handler for PSO Keyword edit
  const handlePsoKeywordChange = (psoCode, compIndex, coCode, val) => {
    setPsoKeywordsStore((prev) => {
      const courseStore = prev[selectedCourse.id] || {};
      const comps = [...(courseStore[psoCode] || getCoursePsoCompetencies(psoCode))];
      comps[compIndex] = {
        ...comps[compIndex],
        keywords: {
          ...comps[compIndex].keywords,
          [coCode]: val,
        },
      };
      return {
        ...prev,
        [selectedCourse.id]: {
          ...courseStore,
          [psoCode]: comps,
        },
      };
    });
  };

  // Helper: Compute PO Strength based on keywords
  const computePoStrengthForCO = (poCode, coCode) => {
    const comps = getCoursePoCompetencies(poCode);
    if (!comps || comps.length === 0) return '-';
    const mappedCount = comps.filter((c) => c.keywords?.[coCode] && c.keywords[coCode].trim() !== '').length;
    const pct = (mappedCount / comps.length) * 100;
    if (pct >= 75) return 3;
    if (pct >= 50) return 2;
    if (pct > 0) return 1;
    return '-';
  };

  // Helper: Compute PSO Strength based on keywords
  const computePsoStrengthForCO = (psoCode, coCode) => {
    const comps = getCoursePsoCompetencies(psoCode);
    if (!comps || comps.length === 0) return '-';
    const mappedCount = comps.filter((c) => c.keywords?.[coCode] && c.keywords[coCode].trim() !== '').length;
    const pct = (mappedCount / comps.length) * 100;
    if (pct >= 75) return 3;
    if (pct >= 50) return 2;
    if (pct > 0) return 1;
    return '-';
  };

  // Derived Combined Matrix
  const getDerivedCombinedMatrix = () => {
    const matrix = {};
    courseOutcomes.forEach((co) => {
      matrix[co.code] = {};
      poList.forEach((poCode) => {
        matrix[co.code][poCode] = computePoStrengthForCO(poCode, co.code);
      });
      psoList.forEach((psoCode) => {
        matrix[co.code][psoCode] = computePsoStrengthForCO(psoCode, co.code);
      });
    });
    return matrix;
  };

  const derivedMatrix = getDerivedCombinedMatrix();

  // Combined Average Helper
  const calculateCombinedAverage = (key) => {
    let sum = 0;
    let count = 0;
    courseOutcomes.forEach((co) => {
      const val = derivedMatrix[co.code]?.[key];
      if (typeof val === 'number') {
        sum += val;
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(2) : '-';
  };

  const handleSave = () => {
    alert(`CO to PO & PSO Keyword Mapping Matrix saved for ${selectedCourse.code} - ${selectedCourse.name}!`);
  };

  return (
    <div className="animated-page">
      {/* Standard Header Banner */}
      <div className="banner-dark-gradient">
        <div className="banner-content-row">
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              CO to PO & PSO Mapping Matrix
            </h2>
          </div>

          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Save Mapping Matrix
          </button>
        </div>
      </div>

      {/* Dynamic Course Outcomes Summary Table */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ marginBottom: '10px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            Course Outcomes ({courseOutcomes.length} COs Defined in Outcome Management)
          </h3>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Sr No</th>
                <th style={{ width: '140px' }}>CO Code</th>
                <th>Course Outcome Statement</th>
              </tr>
            </thead>
            <tbody>
              {courseOutcomes.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                    No Course Outcomes defined in Outcome Management yet.
                  </td>
                </tr>
              ) : (
                courseOutcomes.map((co, idx) => (
                  <tr key={co.code}>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{co.code}</td>
                    <td style={{ fontWeight: '500' }}>{co.statement}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'po-detail' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('po-detail')}
        >
          <FileSpreadsheet size={15} /> 1. Detailed PO Keyword Mapping Sheet ({poList.length} POs)
        </button>
        <button
          className={`btn ${activeTab === 'pso-detail' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pso-detail')}
        >
          <FileSpreadsheet size={15} /> 2. Detailed PSO Keyword Mapping Sheet ({psoList.length} PSOs)
        </button>
        <button
          className={`btn ${activeTab === 'combined' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('combined')}
        >
          <Grid2X2 size={15} /> 3. Table 1: Combined CO to PO/PSO Matrix
        </button>
      </div>

      {/* VIEW 1: Detailed PO Competencies Keyword Mapping Sheet */}
      {activeTab === 'po-detail' && (
        <div>
          {activePOs.map((poDef) => {
            const comps = getCoursePoCompetencies(poDef.code);

            return (
              <div key={poDef.code} className="card" style={{ borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
                <div className="card-header" style={{ marginBottom: '10px' }}>
                  <div>
                    <span className="badge badge-active" style={{ fontSize: '11px', padding: '4px 8px' }}>
                      {poDef.code}
                    </span>
                    <h3 style={{ marginTop: '4px', fontSize: '13.5px', color: '#0f172a' }}>{poDef.statement}</h3>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table className="audit-data-table" style={{ minWidth: `${430 + courseOutcomes.length * 108}px` }}>
                    <thead>
                      <tr>
                        <th colSpan={2} style={{ width: '430px', background: '#f1f5f9', color: '#0f172a' }}>
                          Programme Outcomes & Competency Definition
                        </th>
                        <th colSpan={courseOutcomes.length} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                          Keywords mapping to Competency from respective CO
                        </th>
                        <th colSpan={courseOutcomes.length} style={{ textAlign: 'center', background: '#e2e8f0', color: '#0f172a' }}>
                          Y or N Indicator
                        </th>
                      </tr>
                      <tr>
                        <th style={{ width: '400px', minWidth: '400px' }}>Competency Statement</th>
                        <th style={{ width: '30px' }}></th>
                        {courseOutcomes.map((co) => (
                          <th key={`kw-${co.code}`} style={{ width: '70px', minWidth: '70px', textAlign: 'center', padding: '6px 4px', fontSize: '11px' }}>
                            {co.code}
                          </th>
                        ))}
                        {courseOutcomes.map((co) => (
                          <th key={`yn-${co.code}`} style={{ width: '38px', minWidth: '38px', textAlign: 'center', padding: '6px 2px', fontSize: '11px' }}>
                            {co.code}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comps.length === 0 ? (
                        <tr>
                          <td colSpan={2 + courseOutcomes.length * 2} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12px' }}>
                            No competencies defined for {poDef.code}.
                          </td>
                        </tr>
                      ) : (
                        comps.map((comp, compIdx) => (
                        <tr key={comp.id || compIdx}>
                          <td style={{ width: '400px', minWidth: '400px', fontSize: '11.5px', color: '#1e293b', lineHeight: 1.35 }}>
                            {comp.statement}
                          </td>
                          <td></td>
                          {courseOutcomes.map((co) => {
                            const kw = comp.keywords?.[co.code] || '';
                            return (
                              <td key={`input-${co.code}`} style={{ padding: '2px', width: '70px' }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  style={{
                                    fontSize: '10.5px',
                                    padding: '3px 4px',
                                    height: '26px',
                                    width: '100%',
                                    borderColor: kw.trim() !== '' ? '#93c5fd' : '#cbd5e1',
                                    background: kw.trim() !== '' ? '#f8fafc' : '#ffffff',
                                  }}
                                  placeholder="KW..."
                                  value={kw}
                                  onChange={(e) => handlePoKeywordChange(poDef.code, compIdx, co.code, e.target.value)}
                                />
                              </td>
                            );
                          })}
                          {courseOutcomes.map((co) => {
                            const kw = comp.keywords?.[co.code] || '';
                            const isMapped = kw.trim() !== '';
                            return (
                              <td key={`badge-${co.code}`} style={{ textAlign: 'center', fontWeight: '700', fontSize: '11.5px', width: '38px', padding: '2px', color: isMapped ? '#0f172a' : '#94a3b8' }}>
                                {isMapped ? 'Y' : 'N'}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                      )}

                      {/* PO Calculation Summary Rows */}
                      <tr style={{ background: '#f8fafc', fontWeight: '600' }}>
                        <td colSpan={2 + courseOutcomes.length} style={{ textAlign: 'right', paddingRight: '12px', fontSize: '11px', color: '#334155' }}>
                          No of competencies from given {poDef.code} mapped by COs
                        </td>
                        {courseOutcomes.map((co) => {
                          const count = comps.filter((c) => c.keywords?.[co.code] && c.keywords[co.code].trim() !== '').length;
                          return (
                            <td key={`count-${co.code}`} style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a', fontSize: '11.5px' }}>
                              {count}
                            </td>
                          );
                        })}
                      </tr>

                      <tr style={{ background: '#f8fafc', fontWeight: '600' }}>
                        <td colSpan={2 + courseOutcomes.length} style={{ textAlign: 'right', paddingRight: '12px', fontSize: '11px', color: '#334155' }}>
                          % of competencies from given {poDef.code} mapped by COs
                        </td>
                        {courseOutcomes.map((co) => {
                          const count = comps.filter((c) => c.keywords?.[co.code] && c.keywords[co.code].trim() !== '').length;
                          const pct = comps.length > 0 ? Math.round((count / comps.length) * 100) : 0;
                          return (
                            <td key={`pct-${co.code}`} style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a', fontSize: '11.5px' }}>
                              {pct}%
                            </td>
                          );
                        })}
                      </tr>

                      <tr style={{ background: '#f1f5f9', fontWeight: '700' }}>
                        <td colSpan={2 + courseOutcomes.length} style={{ textAlign: 'right', paddingRight: '12px', fontSize: '11px', color: '#0f172a' }}>
                          Mapping strength of {poDef.code} of CO
                        </td>
                        {courseOutcomes.map((co) => {
                          const strength = computePoStrengthForCO(poDef.code, co.code);
                          return (
                            <td key={`str-${co.code}`} style={{ textAlign: 'center', fontSize: '13.5px', color: '#0f172a', fontWeight: '800' }}>
                              {strength}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Detailed PSO Competencies Keyword Mapping Sheet */}
      {activeTab === 'pso-detail' && (
        <div>
          {activePSOs.length === 0 ? (
            <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
              No Programme Specific Outcomes (PSOs) defined for this programme yet.
            </div>
          ) : (
            activePSOs.map((psoDef) => {
              const comps = getCoursePsoCompetencies(psoDef.code);

              return (
                <div key={psoDef.code} className="card" style={{ borderLeft: '4px solid #0284c7', marginBottom: '20px' }}>
                  <div className="card-header" style={{ marginBottom: '10px' }}>
                    <div>
                      <span className="badge badge-active" style={{ fontSize: '11px', padding: '4px 8px', background: '#e0f2fe', color: '#0284c7' }}>
                        {psoDef.code}
                      </span>
                      <h3 style={{ marginTop: '4px', fontSize: '13.5px', color: '#0f172a' }}>{psoDef.statement}</h3>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table className="audit-data-table" style={{ minWidth: `${430 + courseOutcomes.length * 108}px` }}>
                      <thead>
                        <tr>
                          <th colSpan={2} style={{ width: '430px', background: '#f1f5f9', color: '#0f172a' }}>
                            Programme Specific Outcomes & Competency Definition
                          </th>
                          <th colSpan={courseOutcomes.length} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                            Keywords mapping to Competency from respective CO
                          </th>
                          <th colSpan={courseOutcomes.length} style={{ textAlign: 'center', background: '#e2e8f0', color: '#0f172a' }}>
                            Y or N Indicator
                          </th>
                        </tr>
                        <tr>
                          <th style={{ width: '400px', minWidth: '400px' }}>Competency Statement</th>
                          <th style={{ width: '30px' }}></th>
                          {courseOutcomes.map((co) => (
                            <th key={`kw-${co.code}`} style={{ width: '70px', minWidth: '70px', textAlign: 'center', padding: '6px 4px', fontSize: '11px' }}>
                              {co.code}
                            </th>
                          ))}
                          {courseOutcomes.map((co) => (
                            <th key={`yn-${co.code}`} style={{ width: '38px', minWidth: '38px', textAlign: 'center', padding: '6px 2px', fontSize: '11px' }}>
                              {co.code}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comps.length === 0 ? (
                          <tr>
                            <td colSpan={2 + courseOutcomes.length * 2} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12px' }}>
                              No competencies defined for {psoDef.code}.
                            </td>
                          </tr>
                        ) : (
                          comps.map((comp, compIdx) => (
                          <tr key={comp.id || compIdx}>
                            <td style={{ width: '400px', minWidth: '400px', fontSize: '11.5px', color: '#1e293b', lineHeight: 1.35 }}>
                              {comp.statement}
                            </td>
                            <td></td>
                            {courseOutcomes.map((co) => {
                              const kw = comp.keywords?.[co.code] || '';
                              return (
                                <td key={`input-${co.code}`} style={{ padding: '2px', width: '70px' }}>
                                  <input
                                    type="text"
                                    className="form-control"
                                    style={{
                                      fontSize: '10.5px',
                                      padding: '3px 4px',
                                      height: '26px',
                                      width: '100%',
                                      borderColor: kw.trim() !== '' ? '#93c5fd' : '#cbd5e1',
                                      background: kw.trim() !== '' ? '#f8fafc' : '#ffffff',
                                    }}
                                    placeholder="KW..."
                                    value={kw}
                                    onChange={(e) => handlePsoKeywordChange(psoDef.code, compIdx, co.code, e.target.value)}
                                  />
                                </td>
                              );
                            })}
                            {courseOutcomes.map((co) => {
                              const kw = comp.keywords?.[co.code] || '';
                              const isMapped = kw.trim() !== '';
                              return (
                                <td key={`badge-${co.code}`} style={{ textAlign: 'center', fontWeight: '700', fontSize: '11.5px', width: '38px', padding: '2px', color: isMapped ? '#0f172a' : '#94a3b8' }}>
                                  {isMapped ? 'Y' : 'N'}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                        )}

                        {/* PSO Calculation Summary Rows */}
                        <tr style={{ background: '#f8fafc', fontWeight: '600' }}>
                          <td colSpan={2 + courseOutcomes.length} style={{ textAlign: 'right', paddingRight: '12px', fontSize: '11px', color: '#334155' }}>
                            No of competencies from given {psoDef.code} mapped by COs
                          </td>
                          {courseOutcomes.map((co) => {
                            const count = comps.filter((c) => c.keywords?.[co.code] && c.keywords[co.code].trim() !== '').length;
                            return (
                              <td key={`count-${co.code}`} style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a', fontSize: '11.5px' }}>
                                {count}
                              </td>
                            );
                          })}
                        </tr>

                        <tr style={{ background: '#f8fafc', fontWeight: '600' }}>
                          <td colSpan={2 + courseOutcomes.length} style={{ textAlign: 'right', paddingRight: '12px', fontSize: '11px', color: '#334155' }}>
                            % of competencies from given {psoDef.code} mapped by COs
                          </td>
                          {courseOutcomes.map((co) => {
                            const count = comps.filter((c) => c.keywords?.[co.code] && c.keywords[co.code].trim() !== '').length;
                            const pct = comps.length > 0 ? Math.round((count / comps.length) * 100) : 0;
                            return (
                              <td key={`pct-${co.code}`} style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a', fontSize: '11.5px' }}>
                                {pct}%
                              </td>
                            );
                          })}
                        </tr>

                        <tr style={{ background: '#f1f5f9', fontWeight: '700' }}>
                          <td colSpan={2 + courseOutcomes.length} style={{ textAlign: 'right', paddingRight: '12px', fontSize: '11px', color: '#0f172a' }}>
                            Mapping strength of {psoDef.code} of CO
                          </td>
                          {courseOutcomes.map((co) => {
                            const strength = computePsoStrengthForCO(psoDef.code, co.code);
                            return (
                              <td key={`str-${co.code}`} style={{ textAlign: 'center', fontSize: '13.5px', color: '#0f172a', fontWeight: '800' }}>
                                {strength}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 3: Table 1 - Combined CO to PO/PSO Matrix */}
      {activeTab === 'combined' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Dynamic Weightage & Threshold Summary Card (from Attainment Config) */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
                Dynamic Attainment Configuration Parameters ({selectedCourse.code} • {academicYear})
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
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{overallCOAttainment}</div>
              </div>
            </div>
          </div>

          {/* CO Direct & Indirect Examination / Survey Attainment Table (Dynamic Values) */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
                CO Direct &amp; Indirect Examination / Survey Attainment ({courseOutcomes.length} COs)
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
                    <td style={{ fontSize: '12px', color: '#475569' }}>% Students ≥ Threshold ({thresholdPct})</td>
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

          {/* Table 1 : Combined Mapping of CO to PO/PSO */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
                Table 1 : Combined Mapping of CO to PO/PSO ({selectedCourse.code})
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
                      Programme Outcomes ({poList.length})
                    </th>
                    {psoList.length > 0 && (
                      <th colSpan={psoList.length} style={{ textAlign: 'center', background: '#e2e8f0', color: '#0f172a' }}>
                        Programme Specific Outcomes ({psoList.length})
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
                  {courseOutcomes.map((co, idx) => (
                    <tr key={co.code}>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ fontWeight: '700', color: '#0f172a' }}>{co.code}</td>

                      {/* PO Columns */}
                      {poList.map((po) => {
                        const val = derivedMatrix[co.code]?.[po] ?? '-';
                        return (
                          <td key={po} style={{ textAlign: 'center' }}>
                            {val}
                          </td>
                        );
                      })}

                      {/* PSO Columns */}
                      {psoList.map((pso) => {
                        const val = derivedMatrix[co.code]?.[pso] ?? '-';
                        return (
                          <td key={pso} style={{ textAlign: 'center' }}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Average Row */}
                  <tr style={{ background: '#f8fafc', fontWeight: '700' }}>
                    <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', color: '#0f172a' }}>
                      Average
                    </td>
                    {poList.map((po) => (
                      <td key={po} style={{ textAlign: 'center', color: '#0f172a', fontWeight: '700' }}>
                        {calculateCombinedAverage(po)}
                      </td>
                    ))}
                    {psoList.map((pso) => (
                      <td key={pso} style={{ textAlign: 'center', color: '#0f172a', fontWeight: '700' }}>
                        {calculateCombinedAverage(pso)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Save, Previous & Save & Next Footer */}
      <SectionSaveFooter
        label="CO Mapping Matrix"
        prevPath="/configurations"
        nextPath="/marks-upload"
        nextLabel="Save & Proceed to Direct Assessment →"
        onSave={handleSave}
        hidden={hideFooter}
      />
    </div>
  );
}
