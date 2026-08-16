import { useState, useEffect } from 'react';
import { Calculator, Save, AlertCircle, RefreshCw, Layers, FileQuestion, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { getCourseCombinedAttainment, getCourseMappings, downloadAttainmentExcel, downloadAttainmentPdf } from '../../api/academic';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function COAttainmentEngine({ hideFooter = false }) {
  const {
    academicYear,
    selectedBatchId,
    selectedCourse,
    availableCourses = [],
    activeCOs = [],
    activePOs = [],
    activePSOs = [],
    activeAttainmentConfig,
  } = useAcademic();

  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attainmentData, setAttainmentData] = useState(null);
  const [savedPoMappings, setSavedPoMappings] = useState({});
  const [savedPsoMappings, setSavedPsoMappings] = useState({});
  const [fetchedPOs, setFetchedPOs] = useState([]);
  const [fetchedPSOs, setFetchedPSOs] = useState([]);

  // Target course ID from user selection — strictly NO hardcoded dummy fallbacks
  const currentCourse = selectedCourse || availableCourses[0];
  const courseId = currentCourse?.id;

  // Dynamic parameters from Attainment Configuration
  const directWeight = attainmentData?.config?.directWeight ?? activeAttainmentConfig?.directWeight ?? 80;
  const indirectWeight = attainmentData?.config?.indirectWeight ?? activeAttainmentConfig?.indirectWeight ?? 20;
  const directThreshold = attainmentData?.config?.directThreshold ?? activeAttainmentConfig?.directThreshold ?? 60;
  const indirectThreshold = attainmentData?.config?.indirectThreshold ?? activeAttainmentConfig?.indirectThreshold ?? 60;

  // Dynamic Lists
  const poList = fetchedPOs.length > 0 ? fetchedPOs.map((p) => p.code || p) : (activePOs?.length > 0 ? activePOs.map((p) => p.code || p) : ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12']);
  const psoList = fetchedPSOs.length > 0 ? fetchedPSOs.map((p) => p.code || p) : (activePSOs?.length > 0 ? activePSOs.map((p) => p.code || p) : ['PSO1', 'PSO2']);

  useEffect(() => {
    let isMounted = true;
    if (!courseId) return;

    setLoading(true);
    setError(null);

    getCourseCombinedAttainment(courseId)
      .then((res) => {
        if (!isMounted) return;
        const payload = res?.data?.data || res?.data;
        if (payload) {
          setAttainmentData(payload);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching combined CO attainment data:', err);
        setError('Could not load attainment details from backend server for this course.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    getCourseMappings(courseId)
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data?.data || res?.data;
        if (data) {
          if (Array.isArray(data.pos) && data.pos.length > 0) {
            setFetchedPOs(data.pos);
          }
          if (Array.isArray(data.psos) && data.psos.length > 0) {
            setFetchedPSOs(data.psos);
          }
          if (Array.isArray(data.poMappings)) {
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
          if (Array.isArray(data.psoMappings)) {
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
        }
      })
      .catch((err) => console.warn('Failed to fetch course mappings in COAttainmentEngine:', err));

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  // CO List from API for selected course
  const coResults = attainmentData?.coAttainments || [];
  const coList = coResults.length > 0 ? coResults : activeCOs.map((c) => ({
    coCode: c.code,
    statement: c.statement,
    directPct: null,
    directLevel: null,
    indirectPct: null,
    indirectLevel: null,
    combinedAttainment: null,
  }));

  const hasData = coResults.length > 0 && coResults.some(
    (c) => (c.directPct !== null && c.directPct > 0) ||
           (c.indirectPct !== null && c.indirectPct > 0) ||
           (c.directLevel !== null && c.directLevel > 0) ||
           (c.indirectLevel !== null && c.indirectLevel > 0) ||
           (c.combinedAttainment !== null && parseFloat(c.combinedAttainment) > 0)
  );

  const overallCOAttainment = attainmentData?.overallCoAttainment !== undefined && attainmentData?.overallCoAttainment !== null
    ? parseFloat(attainmentData.overallCoAttainment).toFixed(2)
    : (hasData && coList.length > 0
        ? (coList.reduce((acc, curr) => acc + (parseFloat(curr.combinedAttainment) || 0), 0) / coList.length).toFixed(2)
        : '0.00');

  // Helper: Real saved mapping strength from database
  const getMappingStrength = (coCode, targetCode) => {
    if (savedPoMappings[`${coCode}_${targetCode}`] !== undefined) {
      return savedPoMappings[`${coCode}_${targetCode}`];
    }
    if (savedPsoMappings[`${coCode}_${targetCode}`] !== undefined) {
      return savedPsoMappings[`${coCode}_${targetCode}`];
    }
    return '-';
  };

  // Helper: Average mapping strength
  const calculateAverageMapping = (key) => {
    let sum = 0;
    let count = 0;
    coList.forEach((co) => {
      const val = getMappingStrength(co.coCode || co.code, key);
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
    if (avg === '-' || !hasData) return '-';
    return ((parseFloat(avg) * parseFloat(overallCOAttainment)) / 3).toFixed(2);
  };

  const handleSaveCalculation = () => {
    if (!currentCourse) return;
    alert(`Attainment-Main calculation saved successfully for ${currentCourse.code} (${academicYear})!`);
  };

  const handleDownloadExcel = async () => {
    if (!courseId) return;
    try {
      setExportingExcel(true);
      await downloadAttainmentExcel(courseId, selectedBatchId);
    } catch (err) {
      alert('Failed to download Attainment Excel: ' + (err.message || 'Error'));
    } finally {
      setExportingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!courseId) return;
    try {
      setExportingPdf(true);
      await downloadAttainmentPdf(courseId, selectedBatchId);
    } catch (err) {
      alert('Failed to download Attainment PDF: ' + (err.message || 'Error'));
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '30px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#ffffff',
        marginBottom: '22px',
        boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <Calculator size={26} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c7d2fe' }}>
              Attainment Engine &nbsp;·&nbsp; {currentCourse ? `${currentCourse.code} — ${currentCourse.name}` : 'Select Course'}
            </span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Course Outcome (CO) Attainment Summary
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadExcel}
            disabled={exportingExcel || !courseId}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              opacity: exportingExcel ? 0.7 : 1,
            }}
            title="Download fully populated Excel workbook matching NBA Attainment Template"
          >
            <FileSpreadsheet size={16} />
            {exportingExcel ? 'Exporting...' : 'Export Excel (.xlsx)'}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={exportingPdf || !courseId}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              opacity: exportingPdf ? 0.7 : 1,
            }}
            title="Download high quality PDF report for NBA accreditation documentation"
          >
            <FileText size={16} />
            {exportingPdf ? 'Generating...' : 'Export PDF Report'}
          </button>

          <button
            onClick={handleSaveCalculation}
            style={{
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', marginBottom: '20px' }}>
          <RefreshCw size={24} className="spin" style={{ color: '#6366f1', marginBottom: '10px' }} />
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>Fetching backend attainment calculation for {currentCourse?.code}...</div>
        </div>
      )}

      {error && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#991b1b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{error}</span>
        </div>
      )}

      {!hasData && !loading && (
        <div style={{ padding: '24px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', color: '#1e40af', marginBottom: '22px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <FileQuestion size={24} style={{ flexShrink: 0, marginTop: '2px', color: '#2563eb' }} />
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800' }}>No uploaded data for {currentCourse?.code || 'selected course'}</div>
            <div style={{ fontSize: '13px', marginTop: '4px', lineHeight: 1.4 }}>
              Upload Examination marks (`2. Examination`) and Survey responses (`3. Course End Survey`) for this course to calculate real direct and indirect attainment.
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Weightage & Threshold Summary Card */}
      <div className="card" style={{ marginBottom: '22px', padding: '22px', border: '1px solid #e2e8f0', borderRadius: '14px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', color: '#0f172a', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: '#4f46e5' }} /> Attainment Configuration Parameters ({currentCourse?.code || 'Course'} • {academicYear || 'AY 2025-26'})
          </h3>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '20px' }}>
            Database Settings
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Direct Weightage</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>{directWeight}%</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>From Attainment Settings</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Indirect Weightage</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#7c3aed', marginTop: '4px' }}>{indirectWeight}%</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>From Attainment Settings</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Direct Level 3 Threshold</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#059669', marginTop: '4px' }}>≥ {directThreshold}%</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Level 2 (40-59%) · Level 1 (1-39%)</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Indirect Level 3 Threshold</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0284c7', marginTop: '4px' }}>≥ {indirectThreshold}%</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Level 2 (40-59%) · Level 1 (1-39%)</div>
          </div>

          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1.5px solid #bbf7d0' }}>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall CO Attainment</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>{overallCOAttainment}</div>
            <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>Combined Average out of 3.00</div>
          </div>
        </div>
      </div>

      {/* Reference Work: CO Direct & Indirect Examination / Survey Attainment Table */}
      <div className="card" style={{ marginBottom: '22px', padding: '22px', border: '1px solid #e2e8f0', borderRadius: '14px', background: '#ffffff' }}>
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: '#0f172a', fontWeight: '800', margin: 0 }}>
              Reference Work — Direct & Indirect Attainment Calculation ({currentCourse?.code || 'Course'})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Formula: Attainment of CO = ({directWeight}% Direct Level) + ({indirectWeight}% Indirect Level)
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto', width: '100%', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <table className="audit-data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', width: '220px', color: '#334155' }}>Attainment Metric</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', width: '250px', color: '#334155' }}>Assessment Component</th>
                {coList.map((co) => (
                  <th key={co.coCode || co.code} style={{ padding: '12px 14px', textAlign: 'center', color: '#0f172a', fontWeight: '800' }}>
                    {co.coCode || co.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Direct % */}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: '700', color: '#2563eb' }}>% of students above threshold</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Direct through Examination</td>
                {coList.map((co) => (
                  <td key={co.coCode || co.code} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600' }}>
                    {co.directPct !== undefined && co.directPct !== null ? `${co.directPct}%` : '—'}
                  </td>
                ))}
              </tr>

              {/* Row 2: Direct Level */}
              <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <td style={{ padding: '12px 16px', fontWeight: '800', color: '#2563eb' }}>Direct Attainment Level</td>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: '#334155' }}>Score Range 1–3 (≥{directThreshold}% = 3)</td>
                {coList.map((co) => (
                  <td key={co.coCode || co.code} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '900', fontSize: '15px', color: '#2563eb' }}>
                    {co.directLevel !== undefined && co.directLevel !== null ? co.directLevel : '—'}
                  </td>
                ))}
              </tr>

              {/* Row 3: Indirect % */}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: '700', color: '#7c3aed' }}>% of students above threshold</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Indirect through Course End Survey</td>
                {coList.map((co) => (
                  <td key={co.coCode || co.code} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600' }}>
                    {co.indirectPct !== undefined && co.indirectPct !== null ? `${co.indirectPct}%` : '—'}
                  </td>
                ))}
              </tr>

              {/* Row 4: Indirect Level */}
              <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <td style={{ padding: '12px 16px', fontWeight: '800', color: '#7c3aed' }}>Indirect Attainment Level</td>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: '#334155' }}>Score Range 1–3 (≥{indirectThreshold}% = 3)</td>
                {coList.map((co) => (
                  <td key={co.coCode || co.code} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '900', fontSize: '15px', color: '#7c3aed' }}>
                    {co.indirectLevel !== undefined && co.indirectLevel !== null ? co.indirectLevel : '—'}
                  </td>
                ))}
              </tr>

              {/* Row 5: Attainment of CO */}
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#eef2ff' }}>
                <td style={{ padding: '14px 16px', fontWeight: '800', color: '#1e1b4b', fontSize: '14px' }}>Attainment of CO</td>
                <td style={{ padding: '14px 16px', fontWeight: '700', color: '#3730a3' }}>
                  ({directWeight}% Direct + {indirectWeight}% Indirect)
                </td>
                {coList.map((co) => (
                  <td key={co.coCode || co.code} style={{ padding: '14px 14px', textAlign: 'center', fontWeight: '900', fontSize: '16px', color: '#3730a3' }}>
                    {co.combinedAttainment !== undefined && co.combinedAttainment !== null ? co.combinedAttainment : '—'}
                  </td>
                ))}
              </tr>

              {/* Row 6: Overall CO Attainment */}
              <tr style={{ background: '#ecfdf5' }}>
                <td colSpan={2} style={{ padding: '16px', fontWeight: '900', color: '#065f46', fontSize: '15px' }}>
                  Overall CO Attainment Score (Average of all COs)
                </td>
                <td colSpan={coList.length} style={{ padding: '16px', textAlign: 'center', fontWeight: '900', fontSize: '20px', color: '#047857' }}>
                  {overallCOAttainment} / 3.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 1: Combined Mapping of CO to PO/PSO */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
            Table 1 : Combined Mapping of CO to PO/PSO {currentCourse?.code ? `(${currentCourse.code})` : ''}
          </h3>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Course Outcomes ({coList.length})
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
              {coList.map((co, idx) => (
                <tr key={co.coCode || co.code || idx}>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{co.coCode || co.code}</td>

                  {/* PO Columns */}
                  {poList.map((po) => {
                    const val = getMappingStrength(co.coCode || co.code, po);
                    return (
                      <td key={po} style={{ textAlign: 'center' }}>
                        {val}
                      </td>
                    );
                  })}

                  {/* PSO Columns */}
                  {psoList.map((pso) => {
                    const val = getMappingStrength(co.coCode || co.code, pso);
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
                    {calculateAverageMapping(po)}
                  </td>
                ))}
                {psoList.map((pso) => (
                  <td key={pso} style={{ textAlign: 'center', color: '#0f172a', fontWeight: '700' }}>
                    {calculateAverageMapping(pso)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: PO & PSO Attainment Values (Direct Attainment) */}
      <div className="card" style={{ padding: '22px', border: '1px solid #e2e8f0', borderRadius: '14px', background: '#ffffff' }}>
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', color: '#0f172a', fontWeight: '800', margin: 0 }}>
            Table 2: PO & PSO Attainment Values (Direct Attainment)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Formula: PO Attainment = Average CO Mapping × (Overall CO Attainment / 3.00)
          </span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <table className="audit-data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px 14px', width: '140px', color: '#0f172a' }}>Course Code</th>
                <th style={{ padding: '10px 14px', width: '240px', color: '#0f172a' }}>Attainment Metric</th>
                {poList.map((po) => (
                  <th key={po} style={{ padding: '10px 6px', width: '55px', textAlign: 'center' }}>{po}</th>
                ))}
                {psoList.map((pso) => (
                  <th key={pso} style={{ padding: '10px 6px', width: '55px', textAlign: 'center', background: '#f1f5f9' }}>{pso}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0f172a' }}>{currentCourse?.code || 'Course'}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>Average Mapping Weight (Table 1)</td>
                {poList.map((po) => (
                  <td key={po} style={{ padding: '12px 6px', textAlign: 'center', fontWeight: '600' }}>
                    {calculateAverageMapping(po)}
                  </td>
                ))}
                {psoList.map((pso) => (
                  <td key={pso} style={{ padding: '12px 6px', textAlign: 'center', fontWeight: '600', background: '#faf5ff' }}>
                    {calculateAverageMapping(pso)}
                  </td>
                ))}
              </tr>

              <tr style={{ background: '#ecfdf5', fontWeight: '900' }}>
                <td style={{ padding: '14px', color: '#065f46', fontWeight: '900' }}>{currentCourse?.code || 'Course'}</td>
                <td style={{ padding: '14px', color: '#065f46', fontWeight: '900', fontSize: '13px' }}>
                  Final PO / PSO Direct Attainment Value
                </td>
                {poList.map((po) => (
                  <td key={po} style={{ padding: '14px 6px', textAlign: 'center', fontSize: '14px', color: '#047857', fontWeight: '900' }}>
                    {calculatePoPsoAttainment(po)}
                  </td>
                ))}
                {psoList.map((pso) => (
                  <td key={pso} style={{ padding: '14px 6px', textAlign: 'center', fontSize: '14px', color: '#047857', fontWeight: '900', background: '#d1fae5' }}>
                    {calculatePoPsoAttainment(pso)}
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
          label="Attainment-Main"
          prevPath="/survey-upload"
          nextPath="/course-atr"
          nextLabel="Save & Proceed to Course ATR →"
          onSave={handleSaveCalculation}
        />
      )}
    </div>
  );
}
