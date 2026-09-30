import { useEffect, useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  Grid2X2,
  Save,
  Upload,
  Download,
  ChevronDown,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';
import { sortOutcomes } from '../../utils/outcomeOrder';
import { downloadMappingImportTemplate } from '../../utils/templateDownloader';
import CourseMappingExcelImportModal from './CourseMappingExcelImportModal';

export default function COMappingMatrix({ hideFooter = false, saveRef = null }) {
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
    selectedCourseOffering,
    courseOfferingId,
    programmeId,
    activePOs,
    activePSOs,
    activeCOs,
    yearMetrics,
    activeAttainmentConfig,
    coMapping = null,
    loadCourseOutcomes = () => Promise.resolve([]),
    loadCourseMapping = () => Promise.resolve(null),
    loadProgrammeOutcomes = () => Promise.resolve(null),
    updateCourseMapping = () => Promise.resolve(null),
  } = useAcademic();

  const [activeTab, setActiveTab] = useState('po-detail'); // 'po-detail', 'pso-detail', 'combined'
  const courseScope = selectedCourseOffering ?? selectedCourse;
  const programmeBatchCourseId = selectedCourseOffering?.programmeBatchCourseId ?? courseOfferingId;
  const masterProgrammeId = selectedCourseOffering?.masterProgrammeId
    ?? selectedCourseOffering?.programmeId
    ?? selectedCourseOffering?.course?.masterProgrammeId
    ?? selectedProgramme?.masterProgrammeId
    ?? selectedProgramme?.id
    ?? programmeId
    ?? null;

  useEffect(() => {
    if (!programmeBatchCourseId) return;
    // This component is mounted both in workflow Step 2 and on the standalone
    // Mapping page. Fetch every definition it renders so either entry point
    // works on a cold session and never depends on Save Mapping Matrix.
    const requests = [
      loadCourseOutcomes(programmeBatchCourseId),
      loadCourseMapping(programmeBatchCourseId),
    ];
    if (masterProgrammeId) {
      requests.push(loadProgrammeOutcomes(masterProgrammeId, {
        includeTargets: false,
        includePEOs: false,
      }));
    }
    Promise.allSettled(requests);
  }, [loadCourseMapping, loadCourseOutcomes, loadProgrammeOutcomes, masterProgrammeId, programmeBatchCourseId]);

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
  // The programme-batch-course mapping endpoint is authoritative for this
  // screen. Context outcomes are only a fallback while its response loads.
  const normalizeCode = (val) => String(val || '').replace(/[\s\-_]/g, '').toUpperCase();

  const mappingPOs = useMemo(
    () => sortOutcomes(Array.isArray(coMapping?.pos) && coMapping.pos.length > 0 ? coMapping.pos : activePOs),
    [activePOs, coMapping?.pos]
  );

  const mappingPSOs = useMemo(() => {
    let psoItems = Array.isArray(coMapping?.psos) && coMapping.psos.length > 0 ? coMapping.psos : activePSOs;
    if ((!psoItems || psoItems.length === 0) && coMapping) {
      // Fallback: extract PSO codes from psoMappings or psoKeywordsStore
      const psoCodes = new Set();
      if (Array.isArray(coMapping.psoMappings)) {
        coMapping.psoMappings.forEach((m) => {
          if (m.psoCode) psoCodes.add(m.psoCode.trim().toUpperCase().replace(/\s+/g, ''));
        });
      }
      const rawStore = coMapping.psoKeywordsStore ?? coMapping.psoKeywords ?? coMapping.psoKeywordStore;
      const parsedStore = typeof rawStore === 'string' ? (() => { try { return JSON.parse(rawStore); } catch { return null; } })() : rawStore;
      if (parsedStore && typeof parsedStore === 'object') {
        const unwrapped = parsedStore[programmeBatchCourseId] || parsedStore;
        Object.entries(unwrapped).forEach(([k, v]) => {
          if (/^pso/i.test(k)) psoCodes.add(k.trim().toUpperCase().replace(/\s+/g, ''));
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            Object.keys(v).forEach((innerK) => {
              if (/^pso/i.test(innerK)) psoCodes.add(innerK.trim().toUpperCase().replace(/\s+/g, ''));
            });
          }
        });
      }
      if (psoCodes.size > 0) {
        psoItems = Array.from(psoCodes).map((code) => ({
          code,
          statement: `${code} keyword mapping`,
        }));
      }
    }
    return sortOutcomes(psoItems);
  }, [activePSOs, coMapping, programmeBatchCourseId]);

  const courseOutcomes = useMemo(
    () => sortOutcomes(Array.isArray(coMapping?.cos) && coMapping.cos.length > 0 ? coMapping.cos : activeCOs),
    [activeCOs, coMapping?.cos]
  );
  const poList = mappingPOs.map((p) => p.code);
  const psoList = mappingPSOs.map((p) => p.code);

  // Keyword Stores for POs & PSOs (keyed by programme-batch-course ID locally).
  const [poKeywordsStore, setPoKeywordsStore] = useState({});
  const [psoKeywordsStore, setPsoKeywordsStore] = useState({});
  const [savedMatrix, setSavedMatrix] = useState({});
  const [savedMappingSignature, setSavedMappingSignature] = useState(null);
  const [isSavingMapping, setIsSavingMapping] = useState(false);
  const [activeKeywordEditor, setActiveKeywordEditor] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Helper to reliably lookup a keyword across various CO code keys
  const getCompKeyword = (comp, coCode, coIndex = 0) => {
    if (!comp?.keywords) return '';
    if (comp.keywords[coCode] !== undefined && comp.keywords[coCode] !== '') {
      return comp.keywords[coCode];
    }
    const normCo = normalizeCode(coCode);
    for (const [k, v] of Object.entries(comp.keywords)) {
      if (normalizeCode(k) === normCo && v !== '') {
        return v;
      }
    }
    const coIdx = coIndex + 1;
    const aliases = [`CO${coIdx}`, `co${coIdx}`, String(coIdx)];
    for (const alias of aliases) {
      if (comp.keywords[alias] !== undefined && comp.keywords[alias] !== '') {
        return comp.keywords[alias];
      }
    }
    return comp.keywords[coCode] || '';
  };

  // A saved signature belongs to one programme-batch course only. Never let
  // an identical-looking mapping from a previous course disable Save here.
  useEffect(() => {
    setSavedMappingSignature(null);
  }, [programmeBatchCourseId]);

  useEffect(() => {
    setSavedMatrix(coMapping?.matrix ?? {});
  }, [coMapping]);

  useEffect(() => {
    const hydrateKeywordStore = (rawStore, outcomeDefinitions) => {
      if (!programmeBatchCourseId || !rawStore || !outcomeDefinitions.length) return {};
      let apiStore = rawStore;
      if (typeof apiStore === 'string') {
        try {
          apiStore = JSON.parse(apiStore);
        } catch {
          return {};
        }
      }
      if (!apiStore || typeof apiStore !== 'object') return {};
      const store = apiStore[programmeBatchCourseId] && typeof apiStore[programmeBatchCourseId] === 'object' && !Array.isArray(apiStore[programmeBatchCourseId])
        ? apiStore[programmeBatchCourseId]
        : apiStore;

      return {
        [programmeBatchCourseId]: Object.fromEntries(outcomeDefinitions.map((outcome) => {
          const normOutcome = normalizeCode(outcome.code);

          // Determine competencies: use defined competencies if present, otherwise inspect store to see how many exist
          let effectiveCompetencies = Array.isArray(outcome.competencies) && outcome.competencies.length > 0
            ? outcome.competencies
            : null;

          if (!effectiveCompetencies) {
            let maxCount = 1;
            Object.entries(store).forEach(([coKey, coVal]) => {
              if (coVal && typeof coVal === 'object') {
                Object.entries(coVal).forEach(([outKey, outVal]) => {
                  if (normalizeCode(outKey) === normOutcome && Array.isArray(outVal)) {
                    maxCount = Math.max(maxCount, outVal.length);
                  }
                });
              }
              if (normalizeCode(coKey) === normOutcome && Array.isArray(coVal)) {
                maxCount = Math.max(maxCount, coVal.length);
              }
            });
            effectiveCompetencies = Array.from({ length: maxCount }, (_, i) => ({
              code: `${outcome.code}.${i + 1}`,
              statement: outcome.statement || `${outcome.code} Competency ${i + 1}`,
            }));
          }

          return [outcome.code, effectiveCompetencies.map((competency, competencyIndex) => {
            const compCode = competency.code ?? `${outcome.code}.${competencyIndex + 1}`;
            const normCompCode = normalizeCode(compCode);

            const keywords = Object.fromEntries(courseOutcomes.map((co, coIndex) => {
              const coIdx = coIndex + 1;
              const normCo = normalizeCode(co.code);
              const coAliases = [
                normCo,
                `CO${coIdx}`,
                `CO${coIdx}`.toUpperCase(),
                `co${coIdx}`,
                String(coIdx),
              ];

              // 1. Try finding in outer CO map: store[coKey][outcomeKey]
              let outcomeVal = undefined;
              for (const [topKey, topVal] of Object.entries(store)) {
                if (coAliases.includes(normalizeCode(topKey)) && topVal && typeof topVal === 'object') {
                  for (const [oKey, oVal] of Object.entries(topVal)) {
                    if (normalizeCode(oKey) === normOutcome) {
                      outcomeVal = oVal;
                      break;
                    }
                  }
                  if (outcomeVal !== undefined) break;
                }
              }

              // 2. Try finding in outer Outcome map: store[outcomeKey][coKey]
              if (outcomeVal === undefined) {
                for (const [topKey, topVal] of Object.entries(store)) {
                  if (normalizeCode(topKey) === normOutcome && topVal && typeof topVal === 'object') {
                    if (Array.isArray(topVal)) {
                      outcomeVal = topVal;
                    } else {
                      for (const [cKey, cVal] of Object.entries(topVal)) {
                        if (coAliases.includes(normalizeCode(cKey))) {
                          outcomeVal = cVal;
                          break;
                        }
                      }
                    }
                    if (outcomeVal !== undefined) break;
                  }
                }
              }

              // 3. Try direct competency lookup: store[coKey][compCode]
              if (outcomeVal === undefined) {
                for (const [topKey, topVal] of Object.entries(store)) {
                  if (coAliases.includes(normalizeCode(topKey)) && topVal && typeof topVal === 'object') {
                    for (const [oKey, oVal] of Object.entries(topVal)) {
                      if (normalizeCode(oKey) === normCompCode) {
                        outcomeVal = oVal;
                        break;
                      }
                    }
                  }
                }
              }

              // Extract keyword string for this competency index
              let kwResult = '';
              if (Array.isArray(outcomeVal)) {
                if (Array.isArray(outcomeVal[competencyIndex])) {
                  kwResult = outcomeVal[competencyIndex].join(', ');
                } else if (typeof outcomeVal[competencyIndex] === 'string') {
                  kwResult = outcomeVal[competencyIndex];
                } else if (outcomeVal.every((item) => typeof item === 'string')) {
                  kwResult = competencyIndex === 0 ? outcomeVal.join(', ') : '';
                } else if (outcomeVal[competencyIndex] && typeof outcomeVal[competencyIndex] === 'object') {
                  const inner = outcomeVal[competencyIndex];
                  kwResult = inner[co.code] ?? inner[`CO${coIdx}`] ?? '';
                  if (Array.isArray(kwResult)) kwResult = kwResult.join(', ');
                }
              } else if (typeof outcomeVal === 'string') {
                kwResult = competencyIndex === 0 ? outcomeVal : '';
              } else if (outcomeVal && typeof outcomeVal === 'object') {
                const subVal = outcomeVal[compCode] ?? outcomeVal[normCompCode] ?? outcomeVal[competencyIndex] ?? outcomeVal[String(competencyIndex)];
                if (Array.isArray(subVal)) {
                  kwResult = subVal.join(', ');
                } else if (typeof subVal === 'string') {
                  kwResult = subVal;
                }
              }

              return [co.code, kwResult];
            }));

            return {
              ...competency,
              keywords,
            };
          })];
        })),
      };
    };

    const rawPoStore = coMapping?.poKeywordsStore ?? coMapping?.poKeywords ?? coMapping?.poKeywordStore;
    const rawPsoStore = coMapping?.psoKeywordsStore ?? coMapping?.psoKeywords ?? coMapping?.psoKeywordStore;
    setPoKeywordsStore(hydrateKeywordStore(rawPoStore, mappingPOs));
    setPsoKeywordsStore(hydrateKeywordStore(rawPsoStore, mappingPSOs));
  }, [coMapping, courseOutcomes, mappingPOs, mappingPSOs, programmeBatchCourseId]);

  // Helper to get PO competencies dynamically
  const getCoursePoCompetencies = (poCode) => {
    const courseStore = poKeywordsStore[programmeBatchCourseId] || {};
    const normPo = normalizeCode(poCode);
    const matchedKey = Object.keys(courseStore).find((k) => normalizeCode(k) === normPo);
    if (matchedKey && courseStore[matchedKey]) return courseStore[matchedKey];

    const poObj = mappingPOs.find((p) => normalizeCode(p.code) === normPo);
    if (poObj) {
      const competencies = Array.isArray(poObj.competencies) && poObj.competencies.length > 0
        ? poObj.competencies
        : [{ code: poObj.code, statement: poObj.statement || `${poObj.code} keyword mapping` }];
      return competencies.map((c) => ({ ...c, keywords: c.keywords || {} }));
    }

    return [];
  };

  // Helper to get PSO competencies dynamically
  const getCoursePsoCompetencies = (psoCode) => {
    const courseStore = psoKeywordsStore[programmeBatchCourseId] || {};
    const normPso = normalizeCode(psoCode);
    const matchedKey = Object.keys(courseStore).find((k) => normalizeCode(k) === normPso);
    if (matchedKey && courseStore[matchedKey]) return courseStore[matchedKey];

    const psoObj = mappingPSOs.find((p) => normalizeCode(p.code) === normPso);
    if (psoObj) {
      const competencies = Array.isArray(psoObj.competencies) && psoObj.competencies.length > 0
        ? psoObj.competencies
        : [{ code: psoObj.code, statement: psoObj.statement || `${psoObj.code} keyword mapping` }];
      return competencies.map((c) => ({ ...c, keywords: c.keywords || {} }));
    }

    return [];
  };

  // Handler for PO Keyword edit
  const handlePoKeywordChange = (poCode, compIndex, coCode, val) => {
    setPoKeywordsStore((prev) => {
      const courseStore = prev[programmeBatchCourseId] || {};
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
        [programmeBatchCourseId]: {
          ...courseStore,
          [poCode]: comps,
        },
      };
    });
  };

  // Handler for PSO Keyword edit
  const handlePsoKeywordChange = (psoCode, compIndex, coCode, val) => {
    setPsoKeywordsStore((prev) => {
      const courseStore = prev[programmeBatchCourseId] || {};
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
        [programmeBatchCourseId]: {
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
    const coIdx = courseOutcomes.findIndex((c) => normalizeCode(c.code) === normalizeCode(coCode));
    const mappedCount = comps.filter((c) => getCompKeyword(c, coCode, coIdx >= 0 ? coIdx : 0).trim() !== '').length;
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
    const coIdx = courseOutcomes.findIndex((c) => normalizeCode(c.code) === normalizeCode(coCode));
    const mappedCount = comps.filter((c) => getCompKeyword(c, coCode, coIdx >= 0 ? coIdx : 0).trim() !== '').length;
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
        const storedLevel = savedMatrix[co.code]?.[poCode];
        matrix[co.code][poCode] = Number.isInteger(storedLevel)
          ? storedLevel
          : computePoStrengthForCO(poCode, co.code);
      });
      psoList.forEach((psoCode) => {
        const storedLevel = savedMatrix[co.code]?.[psoCode];
        matrix[co.code][psoCode] = Number.isInteger(storedLevel)
          ? storedLevel
          : computePsoStrengthForCO(psoCode, co.code);
      });
    });
    return matrix;
  };

  const derivedMatrix = getDerivedCombinedMatrix();
  const currentMappingSignature = JSON.stringify({
    matrix: derivedMatrix,
    poKeywords: poKeywordsStore[programmeBatchCourseId] ?? {},
    psoKeywords: psoKeywordsStore[programmeBatchCourseId] ?? {},
  });
  const isMappingSaved = savedMappingSignature !== null && savedMappingSignature === currentMappingSignature;

  // Combined Average Helper
  const calculateCombinedAverage = (key) => {
    const serverAverage = coMapping?.poAverages?.[key] ?? coMapping?.psoAverages?.[key];
    if (serverAverage !== undefined && serverAverage !== null) return Number(serverAverage).toFixed(2);
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
    if (!programmeBatchCourseId || isSavingMapping || isMappingSaved) {
      if (!programmeBatchCourseId) alert('Select an assigned programme-batch course before saving the mapping.');
      return;
    }
    const toMappings = (outcomes, outcomeKey) => courseOutcomes.flatMap((co) => outcomes
      .map((outcome) => ({
        courseOutcomeId: co.courseOutcomeId ?? co.id,
        [outcomeKey]: outcome.code,
        mappingLevel: derivedMatrix[co.code]?.[outcome.code],
      }))
      .filter((item) => Number.isInteger(item.mappingLevel) && item.mappingLevel >= 1 && item.mappingLevel <= 3)
    );
    const toKeywordStore = (store, outcomes) => Object.fromEntries(
      courseOutcomes.map((co) => {
        const courseStore = store[programmeBatchCourseId] ?? {};
        const keywordEntries = Object.fromEntries(outcomes.map((outcome) => {
          const competencies = courseStore[outcome.code] ?? [];
          const competencyKeywordGroups = competencies.map((competency) => [...new Set(String(competency?.keywords?.[co.code] ?? '')
              .split(',')
              .map((keyword) => keyword.trim())
              .filter(Boolean))]);
          return [outcome.code, competencyKeywordGroups];
        }));
        return [co.code, keywordEntries];
      }).filter(([coCode]) => Boolean(coCode))
    );
    try {
      setIsSavingMapping(true);
      const saved = await updateCourseMapping({
        poMappings: toMappings(mappingPOs, 'poCode'),
        psoMappings: toMappings(mappingPSOs, 'psoCode'),
        poKeywordsStore: toKeywordStore(poKeywordsStore, mappingPOs),
        psoKeywordsStore: toKeywordStore(psoKeywordsStore, mappingPSOs),
      }, programmeBatchCourseId);
      setSavedMatrix(saved?.matrix ?? derivedMatrix);
      setSavedMappingSignature(currentMappingSignature);
      alert(`CO to PO & PSO mapping saved for ${selectedCourseOffering?.courseCode || selectedCourse?.code || 'the selected offering'}.`);
    } catch (error) {
      console.error('Failed to save CO mapping:', error);
      alert('Unable to save the CO mapping. Please try again.');
    } finally {
      setIsSavingMapping(false);
    }
  };

  const isKeywordEditorExpanded = (type, outcomeCode, competencyIndex, coCode) => (
    activeKeywordEditor?.type === type
    && activeKeywordEditor?.outcomeCode === outcomeCode
    && activeKeywordEditor?.competencyIndex === competencyIndex
    && activeKeywordEditor?.coCode === coCode
  );

  const keywordInputStyle = (expanded, columnIndex, columnCount, hasValue) => {
    const isFirstColumn = columnIndex === 0;
    const isLastColumn = columnIndex === columnCount - 1;
    return {
      position: 'absolute',
      top: '50%',
      width: expanded ? '214px' : 'calc(100% - 4px)',
      height: expanded ? '32px' : '26px',
      left: expanded && !isFirstColumn && !isLastColumn ? '50%' : '2px',
      right: expanded && isLastColumn ? '2px' : 'auto',
      transform: expanded && !isFirstColumn && !isLastColumn ? 'translate(-50%, -50%)' : 'translateY(-50%)',
      zIndex: expanded ? 20 : 1,
      fontSize: expanded ? '12.5px' : '10.5px',
      padding: expanded ? '5px 8px' : '3px 4px',
      boxSizing: 'border-box',
      borderColor: hasValue ? '#93c5fd' : '#cbd5e1',
      background: '#ffffff',
      boxShadow: expanded ? '0 4px 12px rgba(37,99,235,0.20)' : 'none',
      transition: 'width 160ms ease, height 160ms ease, left 160ms ease, transform 160ms ease, font-size 160ms ease, box-shadow 160ms ease',
    };
  };

  useEffect(() => {
    if (saveRef) {
      saveRef.current = async () => {
        if (!isMappingSaved && programmeBatchCourseId && !isSavingMapping) {
          return await handleSave();
        }
        return true;
      };
    }
    return () => {
      if (saveRef) saveRef.current = null;
    };
  }, [handleSave, isMappingSaved, isSavingMapping, programmeBatchCourseId, saveRef]);

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Download Template Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsTemplateMenuOpen((prev) => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1.5px solid #c7d2fe',
                  color: '#4338ca',
                  fontWeight: '700',
                  padding: '0 14px',
                  height: '38px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                }}
                title="Download CO-PO / PSO mapping Excel templates"
              >
                <Download size={14} color="#4338ca" />
                <span>Download Template</span>
                <ChevronDown size={13} color="#4338ca" />
              </button>

              {isTemplateMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    minWidth: '260px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsTemplateMenuOpen(false);
                      downloadMappingImportTemplate('ALL');
                    }}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <FileSpreadsheet size={15} color="#4338ca" />
                    <div>
                      <div style={{ fontWeight: '700' }}>CO-PO &amp; PSO Mapping Sheet</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>Combined (co-po:pso mapping.xlsx)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTemplateMenuOpen(false);
                      downloadMappingImportTemplate('PO');
                    }}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <CheckCircle2 size={15} color="#4338ca" />
                    <div>
                      <div style={{ fontWeight: '700' }}>CO-PO Mapping Sheet</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>Single Sheet (co-po mapping.xlsx)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTemplateMenuOpen(false);
                      downloadMappingImportTemplate('PSO');
                    }}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Sparkles size={15} color="#0891b2" />
                    <div>
                      <div style={{ fontWeight: '700' }}>CO-PSO Mapping Sheet</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>Single Sheet (co-pso mapping.xlsx)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsImportModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1.5px solid #c7d2fe',
                color: '#4338ca',
                fontWeight: '700',
                padding: '0 16px',
                height: '38px',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
            >
              <FileSpreadsheet size={15} color="#4338ca" />
              <span>Import Excel Mapping</span>
            </button>

            <button className="btn btn-primary" onClick={handleSave} disabled={isSavingMapping || isMappingSaved} style={{ opacity: isSavingMapping || isMappingSaved ? 0.6 : 1, cursor: isSavingMapping || isMappingSaved ? 'not-allowed' : 'pointer' }}>
              <Save size={15} /> {isSavingMapping ? 'Saving…' : isMappingSaved ? 'Saved' : 'Save Mapping Matrix'}
            </button>
          </div>
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
          {mappingPOs.map((poDef) => {
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
                          {courseOutcomes.map((co, coIndex) => {
                            const kw = getCompKeyword(comp, co.code, coIndex);
                            const expanded = isKeywordEditorExpanded('po', poDef.code, compIdx, co.code);
                            return (
                              <td key={`input-${co.code}`} style={{ position: 'relative', padding: '2px', width: '70px', minWidth: '70px', height: '32px' }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  style={keywordInputStyle(expanded, coIndex, courseOutcomes.length, kw.trim() !== '')}
                                  placeholder="KW..."
                                  value={kw}
                                  onFocus={() => setActiveKeywordEditor({ type: 'po', outcomeCode: poDef.code, competencyIndex: compIdx, coCode: co.code })}
                                  onBlur={() => setActiveKeywordEditor(null)}
                                  onChange={(e) => handlePoKeywordChange(poDef.code, compIdx, co.code, e.target.value)}
                                />
                              </td>
                            );
                          })}
                          {courseOutcomes.map((co, coIndex) => {
                            const kw = getCompKeyword(comp, co.code, coIndex);
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
                        {courseOutcomes.map((co, coIndex) => {
                          const count = comps.filter((c) => getCompKeyword(c, co.code, coIndex).trim() !== '').length;
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
                        {courseOutcomes.map((co, coIndex) => {
                          const count = comps.filter((c) => getCompKeyword(c, co.code, coIndex).trim() !== '').length;
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
          {mappingPSOs.length === 0 ? (
            <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
              No Programme Specific Outcomes (PSOs) defined for this programme yet.
            </div>
          ) : (
            mappingPSOs.map((psoDef) => {
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
                            {courseOutcomes.map((co, coIndex) => {
                              const kw = getCompKeyword(comp, co.code, coIndex);
                              const expanded = isKeywordEditorExpanded('pso', psoDef.code, compIdx, co.code);
                              return (
                                <td key={`input-${co.code}`} style={{ position: 'relative', padding: '2px', width: '70px', minWidth: '70px', height: '32px' }}>
                                  <input
                                    type="text"
                                    className="form-control"
                                    style={keywordInputStyle(expanded, coIndex, courseOutcomes.length, kw.trim() !== '')}
                                    placeholder="KW..."
                                    value={kw}
                                    onFocus={() => setActiveKeywordEditor({ type: 'pso', outcomeCode: psoDef.code, competencyIndex: compIdx, coCode: co.code })}
                                    onBlur={() => setActiveKeywordEditor(null)}
                                    onChange={(e) => handlePsoKeywordChange(psoDef.code, compIdx, co.code, e.target.value)}
                                  />
                                </td>
                              );
                            })}
                            {courseOutcomes.map((co, coIndex) => {
                              const kw = getCompKeyword(comp, co.code, coIndex);
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
                          {courseOutcomes.map((co, coIndex) => {
                            const count = comps.filter((c) => getCompKeyword(c, co.code, coIndex).trim() !== '').length;
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
                          {courseOutcomes.map((co, coIndex) => {
                            const count = comps.filter((c) => getCompKeyword(c, co.code, coIndex).trim() !== '').length;
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
          {/* Table 1 : Combined Mapping of CO to PO/PSO */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
                Table 1 : Combined Mapping of CO to PO/PSO ({courseScope?.courseCode || courseScope?.code || 'Course'})
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

      {isImportModalOpen && (
        <CourseMappingExcelImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          programmeBatchCourseId={programmeBatchCourseId}
          courseCode={selectedCourseOffering?.courseCode || selectedCourse?.code}
          courseName={selectedCourseOffering?.courseName || selectedCourse?.name}
          programmeBatchName={selectedCourseOffering?.batchName || selectedCourseOffering?.programmeBatchName}
          initialScope="ALL"
          onImportSuccess={async () => {
            if (programmeBatchCourseId) {
              await loadCourseOutcomes(programmeBatchCourseId).catch(() => {});
              await loadCourseMapping(programmeBatchCourseId).catch(() => {});
            }
          }}
        />
      )}

      {/* Save, Previous & Save & Next Footer */}
      <SectionSaveFooter
        label="CO Mapping Matrix"
        prevPath="/configurations"
        nextPath="/marks-upload"
        nextLabel="Save & Proceed to Direct Assessment →"
        onSave={handleSave}
        saving={isSavingMapping}
        saved={isMappingSaved}
        hidden={hideFooter}
      />
    </div>
  );
}
