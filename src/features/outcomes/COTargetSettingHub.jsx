import { useState, useEffect } from 'react';
import { Target, Save, CheckCircle2, Sliders, Send } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';

export default function COTargetSettingHub({ hideFooter = false }) {
  const { role, user } = useAuth();
  const {
    courseId,
    selectedCourse,
    activeCOs,
    coTargets,
    updateCourseCoTargets,
    updateCourseVerificationStatus = () => {},
    courseVerificationStore = {},
  } = useAcademic();

  const [localCoTargets, setLocalCoTargets] = useState({});

  useEffect(() => {
    if (selectedCourse?.id && coTargets[selectedCourse.id]) {
      setLocalCoTargets(coTargets[selectedCourse.id]);
    } else if (activeCOs && activeCOs.length > 0) {
      const initial = {};
      activeCOs.forEach((co) => {
        initial[co.code] = co.targetLevel || 2.5;
      });
      setLocalCoTargets(initial);
    }
  }, [selectedCourse, coTargets, activeCOs]);

  const handleTargetChange = (coCode, val) => {
    const num = parseFloat(val);
    setLocalCoTargets((prev) => ({
      ...prev,
      [coCode]: isNaN(num) ? 1.0 : Math.min(3.0, Math.max(1.0, num)),
    }));
  };

  const targetCourseId = selectedCourse?.id || courseId || 'crs-1';

  const handleSaveCoTargets = () => {
    if (selectedCourse?.id) {
      updateCourseCoTargets(selectedCourse.id, localCoTargets);
      updateCourseVerificationStatus(targetCourseId, 'coStatus', 'SUBMITTED', '', user?.name || 'Course Coordinator');
      alert(`CO Target Levels for ${selectedCourse?.code} submitted for Programme Coordinator review!`);
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
              Set CO Targets
            </h2>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            {!isApproved && (
              <button className="btn btn-primary" onClick={handleSaveCoTargets} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Send size={15} /> Submit CO for Review
              </button>
            )}
          </div>
        </div>
      </div>

      {isNeedsRevision && (
        <RequestRevisionCard
          title={`CO Targets Revision Requested (${selectedCourse?.code || 'CS301'})`}
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
              Target attainment levels (1.00 to 3.00 scale) for {selectedCourse?.code || 'CS301'} - {selectedCourse?.name || 'Data Structures & Algorithms'} have been set and verified. Benchmarks are now locked.
            </p>
          </div>
        </div>
      )}

      {/* Target Setting Card */}
      <div className="card" style={{ marginBottom: '24px', background: '#ffffff', border: '1.5px solid #4f46e5' }}>
        <div className="card-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
              Step 2: Course Outcome Target Benchmarks ({selectedCourse?.code})
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
              {activeCOs && activeCOs.length > 0 ? (
                activeCOs.map((co) => {
                  const currentVal = localCoTargets[co.code] !== undefined ? localCoTargets[co.code] : (co.targetLevel || 2.5);
                  return (
                    <tr key={co.id || co.code}>
                      <td style={{ fontWeight: '800', color: '#4f46e5' }}>{co.code}</td>
                      <td style={{ fontSize: '13px', color: '#334155' }}>{co.statement}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="3.0"
                            disabled={isApproved}
                            className="form-control"
                            style={{
                              width: '90px',
                              textAlign: 'center',
                              fontWeight: '800',
                              fontSize: '14px',
                              color: '#0f172a',
                              background: isApproved ? '#f8fafc' : '#ffffff',
                              cursor: isApproved ? 'not-allowed' : 'text',
                            }}
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
                    No Course Outcomes found for {selectedCourse?.code || 'this course'}. Please add COs in Step 1 first.
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
