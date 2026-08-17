import { useState, useEffect } from 'react';
import { Target, Save, CheckCircle2, Sliders } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { getCourseCOs, saveCourseCOs } from '../../api/academic';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';

export default function COTargetSettingHub({ hideFooter = false }) {
  const { role } = useAuth();
  const {
    selectedCourse,
    availableCourses = [],
    activeCOs = [],
    coTargets,
    updateCourseCoTargets,
    updateCourseCOs,
    courseVerificationStore = {},
  } = useAcademic();

  const currentCourse = selectedCourse || availableCourses[0];
  const targetCourseId = currentCourse?.id;

  const [localCoTargets, setLocalCoTargets] = useState({});
  const [coListState, setCoListState] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch COs with targetLevel from backend REST API on mount / course change
  useEffect(() => {
    let isMounted = true;
    if (targetCourseId) {
      setLoading(true);
      getCourseCOs(targetCourseId)
        .then((res) => {
          if (!isMounted) return;
          const rawCOs = res?.data?.outcomes || res?.data?.cos || res?.outcomes || res?.cos || res?.data?.data || res?.data || [];
          if (Array.isArray(rawCOs) && rawCOs.length > 0) {
            const initialMap = {};
            const formattedCOs = rawCOs.map((co, idx) => {
              const targetVal = co.targetLevel !== undefined && co.targetLevel !== null
                ? parseFloat(co.targetLevel)
                : (co.target !== undefined && co.target !== null ? parseFloat(co.target) : 2.50);
              initialMap[co.code] = targetVal;
              return {
                ...co,
                targetLevel: targetVal,
                target: targetVal,
              };
            });

            setCoListState(formattedCOs);
            setLocalCoTargets(initialMap);
            updateCourseCoTargets(targetCourseId, initialMap);
            updateCourseCOs(targetCourseId, formattedCOs);
          } else if (coTargets[targetCourseId]) {
            setLocalCoTargets(coTargets[targetCourseId]);
            setCoListState(activeCOs);
          } else if (activeCOs && activeCOs.length > 0) {
            const initialMap = {};
            activeCOs.forEach((co) => {
              initialMap[co.code] = co.targetLevel !== undefined ? parseFloat(co.targetLevel) : (co.target !== undefined ? parseFloat(co.target) : 2.50);
            });
            setLocalCoTargets(initialMap);
            setCoListState(activeCOs);
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch CO targets from backend:', err);
          if (isMounted) {
            if (coTargets[targetCourseId]) {
              setLocalCoTargets(coTargets[targetCourseId]);
            } else if (activeCOs && activeCOs.length > 0) {
              const initialMap = {};
              activeCOs.forEach((co) => {
                initialMap[co.code] = co.targetLevel !== undefined ? parseFloat(co.targetLevel) : (co.target !== undefined ? parseFloat(co.target) : 2.50);
              });
              setLocalCoTargets(initialMap);
            }
            setCoListState(activeCOs);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [targetCourseId]);

  const displayCOs = coListState.length > 0 ? coListState : activeCOs;

  const handleTargetChange = (coCode, val) => {
    const num = parseFloat(val);
    const validNum = isNaN(num) ? 1.00 : Math.min(3.00, Math.max(1.00, num));
    setLocalCoTargets((prev) => ({
      ...prev,
      [coCode]: validNum,
    }));
  };

  const handleSaveCoTargets = async () => {
    if (!targetCourseId) {
      alert('Please select a course first.');
      return;
    }

    try {
      setSaving(true);
      const updatedCOs = (displayCOs || []).map((co, idx) => {
        const targetVal = localCoTargets[co.code] !== undefined
          ? parseFloat(localCoTargets[co.code])
          : (co.targetLevel !== undefined ? parseFloat(co.targetLevel) : (co.target !== undefined ? parseFloat(co.target) : 2.50));
        return {
          ...co,
          targetLevel: targetVal,
          target: targetVal,
        };
      });

      // 1. Update React Context state & local component state
      setCoListState(updatedCOs);
      updateCourseCoTargets(targetCourseId, localCoTargets);
      updateCourseCOs(targetCourseId, updatedCOs);

      // 2. Persist to Backend PostgreSQL database via REST API
      const payload = updatedCOs.map((co, idx) => ({
        id: co.id || `co-${targetCourseId}-${idx + 1}`,
        courseId: targetCourseId,
        code: co.code || `C321.${idx + 1}`,
        statement: co.statement || '',
        targetLevel: co.targetLevel !== undefined ? parseFloat(co.targetLevel) : 2.50,
        target: co.targetLevel !== undefined ? parseFloat(co.targetLevel) : 2.50,
        status: co.status || 'APPROVED',
      }));

      await saveCourseCOs(targetCourseId, payload);
      alert(`CO Target Benchmark Levels saved and persisted to database successfully for ${currentCourse?.code || targetCourseId}!`);
    } catch (err) {
      console.error('Failed to save CO targets to backend:', err);
      alert(`CO Target Levels updated in workspace state. (Backend warning: ${err.message})`);
    } finally {
      setSaving(false);
    }
  };

  const targetData = courseVerificationStore[targetCourseId] || {};
  const isApproved = targetData.coStatus === 'APPROVED' || targetData.coStatus === 'VERIFIED';
  const isNeedsRevision = targetData.coStatus === 'REJECTED' || targetData.coStatus === 'REVISION_REQUESTED' || targetData.coStatus === 'NEEDS_REVISION';

  return (
    <div className="animated-page">
      {/* Top Banner Header */}
      <div className="banner-dark-gradient" style={{ marginBottom: '20px' }}>
        <div className="banner-content-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Set CO Targets — {currentCourse ? `${currentCourse.code} (${currentCourse.name})` : 'Select Course'}
            </h2>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary" onClick={handleSaveCoTargets} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving Target Levels...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {isNeedsRevision && (
        <RequestRevisionCard
          title={`CO Targets Revision Requested (${currentCourse?.code || '—'})`}
          requestedBy={targetData.verifiedBy || 'Programme Coordinator'}
          remarks={targetData.coRemarks || 'Please review and adjust CO target attainment benchmarks.'}
          actionText="Modify the target levels below and click 'Save Changes' to resubmit for Programme Coordinator approval."
        />
      )}

      {isApproved && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', padding: '12px 18px', marginBottom: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} style={{ color: '#10b981' }} />
          <div>
            <strong style={{ fontSize: '13.5px', color: '#15803d' }}>
              ✓ ALL CO TARGET LEVELS VERIFIED &amp; APPROVED BY PROGRAMME COORDINATOR
            </strong>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#166534' }}>
              Target attainment levels (1.00 to 3.00 scale) for {currentCourse?.code || 'Course'} - {currentCourse?.name || ''} have been set and verified.
            </p>
          </div>
        </div>
      )}

      {/* Target Setting Card */}
      <div className="card" style={{ marginBottom: '24px', background: '#ffffff', border: '1.5px solid #4f46e5' }}>
        <div className="card-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
              Step 2: Course Outcome Target Benchmarks ({currentCourse?.code})
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
              Course Coordinator defines the expected target attainment benchmark (1.00 to 3.00) for gap identification in Course ATR.
            </p>
          </div>

          <span className="badge badge-active" style={{ background: '#eef2ff', color: '#4f46e5', padding: '6px 14px', fontSize: '12px', fontWeight: '800' }}>
            Scale: 1.00 (Low) to 3.00 (High)
          </span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>CO Code</th>
                <th>Course Outcome Statement</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Target Level (1.00 - 3.00)</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Benchmark Level</th>
              </tr>
            </thead>
            <tbody>
              {displayCOs && displayCOs.length > 0 ? (
                displayCOs.map((co) => {
                  const currentVal = localCoTargets[co.code] !== undefined ? localCoTargets[co.code] : (co.targetLevel !== undefined ? parseFloat(co.targetLevel) : (co.target !== undefined ? parseFloat(co.target) : 2.50));
                  return (
                    <tr key={co.id || co.code}>
                      <td style={{ fontWeight: '800', color: '#4f46e5' }}>{co.code}</td>
                      <td style={{ fontSize: '13px', color: '#334155' }}>{co.statement}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            step="0.05"
                            min="1.00"
                            max="3.00"
                            className="form-control"
                            style={{ width: '90px', textAlign: 'center', fontWeight: '800', fontSize: '14px', color: '#0f172a' }}
                            value={currentVal}
                            onChange={(e) => handleTargetChange(co.code, e.target.value)}
                          />
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className="badge"
                          style={{
                            background: currentVal >= 2.5 ? '#dcfce7' : currentVal >= 2.0 ? '#fef3c7' : '#fee2e2',
                            color: currentVal >= 2.5 ? '#15803d' : currentVal >= 2.0 ? '#b45309' : '#dc2626',
                            border: `1px solid ${currentVal >= 2.5 ? '#86efac' : currentVal >= 2.0 ? '#fde68a' : '#fca5a5'}`,
                            fontSize: '11.5px',
                            padding: '4px 10px',
                            fontWeight: '700',
                          }}
                        >
                          {currentVal >= 2.5 ? 'High (Level 3)' : currentVal >= 2.0 ? 'Medium (Level 2)' : 'Low (Level 1)'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
                    No Course Outcomes found for {currentCourse?.code || 'this course'}. Please add COs in Step 1 first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!hideFooter && (
        <SectionSaveFooter
          label="CO Target Level Setting"
          prevPath="/outcomes"
          nextPath="/co-mapping"
          onSave={handleSaveCoTargets}
        />
      )}
    </div>
  );
}
