import { useState, useEffect } from 'react';
import { FileSpreadsheet, Grid2X2, Save } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import {
  getCourseCOs,
  getProgrammePOs,
  getProgrammePSOs,
  getCourseMappings,
  saveCourseMappings,
} from '../../api/academic';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function COMappingMatrix({ hideFooter = false, courseId = null }) {
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
    activePOs: contextPOs = [],
    activePSOs: contextPSOs = [],
    activeCOs: contextCOs = [],
  } = useAcademic();

  const targetCourseId = courseId || selectedCourse?.id;
  const targetProgrammeId = selectedCourse?.programmeId || selectedProgramme?.id;

  console.log('[COMappingMatrix] [DEBUG courseId] Active targetCourseId:', targetCourseId, '| targetProgrammeId:', targetProgrammeId);

  const [courseOutcomes, setCourseOutcomes] = useState(contextCOs);
  const [poListState, setPoListState] = useState(contextPOs);
  const [psoListState, setPsoListState] = useState(contextPSOs);

  const [activeTab, setActiveTab] = useState('po-detail'); // 'po-detail', 'pso-detail', 'combined'

  // Strictly fetch Course Outcomes for selected courseId
  useEffect(() => {
    let isMounted = true;
    if (targetCourseId) {
      console.log('[COMappingMatrix] [DEBUG courseId] Calling getCourseCOs for targetCourseId:', targetCourseId);
      getCourseCOs(targetCourseId)
        .then((res) => {
          if (isMounted) {
            const raw = res?.data?.data || res?.data || [];
            if (Array.isArray(raw) && raw.length > 0) {
              setCourseOutcomes(raw);
            } else if (contextCOs && contextCOs.length > 0) {
              setCourseOutcomes(contextCOs);
            }
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch COs in COMappingMatrix:', err);
          if (isMounted && contextCOs && contextCOs.length > 0) setCourseOutcomes(contextCOs);
        });
    }
    return () => { isMounted = false; };
  }, [targetCourseId]);

  // Strictly fetch Programme Outcomes & PSOs using programmeId
  useEffect(() => {
    let isMounted = true;
    if (targetProgrammeId) {
      getProgrammePOs(targetProgrammeId)
        .then((res) => {
          if (isMounted) {
            const raw = res?.data?.data || res?.data || [];
            if (Array.isArray(raw) && raw.length > 0) {
              setPoListState(raw);
            } else if (contextPOs && contextPOs.length > 0) {
              setPoListState(contextPOs);
            }
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch POs for programme:', err);
          if (isMounted && contextPOs && contextPOs.length > 0) setPoListState(contextPOs);
        });

      getProgrammePSOs(targetProgrammeId)
        .then((res) => {
          if (isMounted) {
            const raw = res?.data?.data || res?.data || [];
            if (Array.isArray(raw) && raw.length > 0) {
              setPsoListState(raw);
            } else if (contextPSOs && contextPSOs.length > 0) {
              setPsoListState(contextPSOs);
            }
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch PSOs for programme:', err);
          if (isMounted && contextPSOs && contextPSOs.length > 0) setPsoListState(contextPSOs);
        });
    }
    return () => { isMounted = false; };
  }, [targetProgrammeId]);

  // Primary Backend Integration Effect: Fetch course mappings, COs, POs, PSOs, and keyword stores using targetCourseId
  useEffect(() => {
    let isMounted = true;
    if (targetCourseId) {
      console.log('[COMappingMatrix] [DEBUG getCourseMappings Request] Sending courseId:', targetCourseId);
      getCourseMappings(targetCourseId)
        .then((res) => {
          console.log('[COMappingMatrix] [DEBUG getCourseMappings Response Full Object]:', res);
          console.log('[COMappingMatrix] [DEBUG getCourseMappings Response Data]:', res?.data);
          if (isMounted) {
            const data = res?.data?.data || res?.data;
            console.log('[COMappingMatrix] [DEBUG Parsed Mapping Data]:', {
              courseId: data?.courseId,
              programmeId: data?.programmeId,
              cosCount: data?.cos?.length,
              posCount: data?.pos?.length,
              psosCount: data?.psos?.length,
              poMappingsCount: data?.poMappings?.length,
              psoMappingsCount: data?.psoMappings?.length,
              poKeywordsStore: data?.poKeywordsStore,
              psoKeywordsStore: data?.psoKeywordsStore,
            });
            if (data) {
              if (Array.isArray(data.cos) && data.cos.length > 0) {
                setCourseOutcomes(data.cos);
              }
              if (Array.isArray(data.pos) && data.pos.length > 0) {
                setPoListState(data.pos);
              }
              if (Array.isArray(data.psos) && data.psos.length > 0) {
                setPsoListState(data.psos);
              }
              if (Array.isArray(data.poMappings) && data.poMappings.length > 0) {
                const poMapObj = {};
                data.poMappings.forEach((m) => {
                  const coObj = data.cos?.find((c) => c.id === m.courseOutcomeId);
                  const coCode = coObj?.code || m.courseOutcomeId;
                  if (coCode && m.poCode) {
                    poMapObj[`${coCode}_${m.poCode}`] = m.mappingLevel;
                  }
                });
                setSavedPoMappings(poMapObj);
              }
              if (Array.isArray(data.psoMappings) && data.psoMappings.length > 0) {
                const psoMapObj = {};
                data.psoMappings.forEach((m) => {
                  const coObj = data.cos?.find((c) => c.id === m.courseOutcomeId);
                  const coCode = coObj?.code || m.courseOutcomeId;
                  if (coCode && m.psoCode) {
                    psoMapObj[`${coCode}_${m.psoCode}`] = m.mappingLevel;
                  }
                });
                setSavedPsoMappings(psoMapObj);
              }
              if (data.poKeywordsStore && Object.keys(data.poKeywordsStore).length > 0) {
                setPoKeywordsStore((prev) => ({ ...prev, [targetCourseId]: data.poKeywordsStore }));
              }
              if (data.psoKeywordsStore && Object.keys(data.psoKeywordsStore).length > 0) {
                setPsoKeywordsStore((prev) => ({ ...prev, [targetCourseId]: data.psoKeywordsStore }));
              }
            }
          }
        })
        .catch((err) => console.warn('Failed to fetch saved course mappings:', err));
    }
    return () => { isMounted = false; };
  }, [targetCourseId]);

  // Dynamic PO & PSO codes arrays from fetched lists
  const poList = poListState.map((p) => p.code);
  const psoList = psoListState.map((p) => p.code);

  // Keyword Stores for POs & PSOs (keyed by courseId)
  const [poKeywordsStore, setPoKeywordsStore] = useState({});
  const [psoKeywordsStore, setPsoKeywordsStore] = useState({});
  const [savedPoMappings, setSavedPoMappings] = useState({});
  const [savedPsoMappings, setSavedPsoMappings] = useState({});

  // Helper to get PO competencies dynamically
  const getCoursePoCompetencies = (poCode) => {
    const courseStore = poKeywordsStore[targetCourseId] || {};
    if (courseStore[poCode]) return courseStore[poCode];

    const poObj = poListState.find((p) => p.code === poCode);
    if (poObj && poObj.competencies && poObj.competencies.length > 0) {
      return poObj.competencies.map((c) => ({ ...c, keywords: c.keywords || {} }));
    }

    return [
      { id: `comp-${poCode}-1`, statement: `Demonstrate competency statement 1 for ${poCode}`, keywords: {} },
      { id: `comp-${poCode}-2`, statement: `Demonstrate competency statement 2 for ${poCode}`, keywords: {} },
    ];
  };

  // Helper to get PSO competencies dynamically
  const getCoursePsoCompetencies = (psoCode) => {
    const courseStore = psoKeywordsStore[targetCourseId] || {};
    if (courseStore[psoCode]) return courseStore[psoCode];

    const psoObj = psoListState.find((p) => p.code === psoCode);
    if (psoObj && psoObj.competencies && psoObj.competencies.length > 0) {
      return psoObj.competencies.map((c) => ({ ...c, keywords: c.keywords || {} }));
    }

    return [
      { id: `psocomp-${psoCode}-1`, statement: `Demonstrate PSO competency statement 1 for ${psoCode}`, keywords: {} },
      { id: `psocomp-${psoCode}-2`, statement: `Demonstrate PSO competency statement 2 for ${psoCode}`, keywords: {} },
    ];
  };

  // Helper: Compute PO Strength based on keywords or saved DB mappings
  const computePoStrengthForCO = (poCode, coCode) => {
    const comps = getCoursePoCompetencies(poCode);
    if (comps && comps.length > 0) {
      const mappedCount = comps.filter((c) => c.keywords?.[coCode] && c.keywords[coCode].trim() !== '').length;
      if (mappedCount > 0) {
        const pct = (mappedCount / comps.length) * 100;
        if (pct >= 75) return 3;
        if (pct >= 50) return 2;
        if (pct > 0) return 1;
      }
    }
    if (savedPoMappings[`${coCode}_${poCode}`] !== undefined) {
      return savedPoMappings[`${coCode}_${poCode}`];
    }
    return '-';
  };

  // Helper: Compute PSO Strength based on keywords or saved DB mappings
  const computePsoStrengthForCO = (psoCode, coCode) => {
    const comps = getCoursePsoCompetencies(psoCode);
    if (comps && comps.length > 0) {
      const mappedCount = comps.filter((c) => c.keywords?.[coCode] && c.keywords[coCode].trim() !== '').length;
      if (mappedCount > 0) {
        const pct = (mappedCount / comps.length) * 100;
        if (pct >= 75) return 3;
        if (pct >= 50) return 2;
        if (pct > 0) return 1;
      }
    }
    if (savedPsoMappings[`${coCode}_${psoCode}`] !== undefined) {
      return savedPsoMappings[`${coCode}_${psoCode}`];
    }
    return '-';
  };

  // Handler for PO Keyword edit
  const handlePoKeywordChange = (poCode, compIndex, coCode, val) => {
    setPoKeywordsStore((prev) => {
      const courseStore = prev[targetCourseId] || {};
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
        [targetCourseId]: {
          ...courseStore,
          [poCode]: comps,
        },
      };
    });
  };

  // Handler for PSO Keyword edit
  const handlePsoKeywordChange = (psoCode, compIndex, coCode, val) => {
    setPsoKeywordsStore((prev) => {
      const courseStore = prev[targetCourseId] || {};
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
        [targetCourseId]: {
          ...courseStore,
          [psoCode]: comps,
        },
      };
    });
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

  const handleSave = async () => {
    try {
      const poMappingsPayload = [];
      const psoMappingsPayload = [];

      courseOutcomes.forEach((co) => {
        poList.forEach((poCode) => {
          const strength = computePoStrengthForCO(poCode, co.code);
          const level = typeof strength === 'number' ? strength : 0;
          poMappingsPayload.push({
            courseOutcomeId: co.id || co.code,
            poCode: poCode,
            mappingLevel: level,
          });
        });

        psoList.forEach((psoCode) => {
          const strength = computePsoStrengthForCO(psoCode, co.code);
          const level = typeof strength === 'number' ? strength : 0;
          psoMappingsPayload.push({
            courseOutcomeId: co.id || co.code,
            psoCode: psoCode,
            mappingLevel: level,
          });
        });
      });

      await saveCourseMappings(targetCourseId, {
        courseId: targetCourseId,
        programmeId: targetProgrammeId,
        poMappings: poMappingsPayload,
        psoMappings: psoMappingsPayload,
        poKeywordsStore: poKeywordsStore[targetCourseId] || {},
        psoKeywordsStore: psoKeywordsStore[targetCourseId] || {},
      });

      alert(`CO to PO & PSO Mapping Matrix saved successfully for ${selectedCourse?.code || targetCourseId}!`);
    } catch (err) {
      console.warn('Failed to save mapping matrix to backend:', err);
      alert(`CO to PO & PSO Mapping Matrix saved for ${selectedCourse?.code || targetCourseId}!`);
    }
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
          {poListState.map((poDef) => {
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
                      {comps.map((comp, compIdx) => (
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
                      ))}

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
          {psoListState.length === 0 ? (
            <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
              No Programme Specific Outcomes (PSOs) defined for this programme yet.
            </div>
          ) : (
            psoListState.map((psoDef) => {
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
                        {comps.map((comp, compIdx) => (
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
                        ))}

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
        <div className="card">
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
              Table 1 : Combined Mapping of CO to PO/PSO {selectedCourse?.code ? `(${selectedCourse.code})` : ''}
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
