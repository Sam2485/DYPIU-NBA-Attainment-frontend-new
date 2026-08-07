import { useState, useEffect } from 'react';
import { Target, Save, CheckCircle2, Sliders } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function COTargetSettingHub() {
  const { role } = useAuth();
  const {
    selectedCourse,
    activeCOs,
    coTargets,
    updateCourseCoTargets,
  } = useAcademic();

  const [localCoTargets, setLocalCoTargets] = useState({});

  useEffect(() => {
    if (selectedCourse?.id && coTargets[selectedCourse.id]) {
      setLocalCoTargets(coTargets[selectedCourse.id]);
    } else if (activeCOs.length > 0) {
      const initial = {};
      activeCOs.forEach((co) => {
        initial[co.code] = 2.50;
      });
      setLocalCoTargets(initial);
    }
  }, [selectedCourse, activeCOs, coTargets]);

  const handleSaveCoTargets = () => {
    if (selectedCourse?.id) {
      updateCourseCoTargets(selectedCourse.id, localCoTargets);
      alert(`CO Target Levels (1.00 - 3.00 scale) for ${selectedCourse?.code} saved successfully!`);
    }
  };

  return (
    <div className="animated-page">
      {/* Top Banner Header */}
      <div className="banner-dark-gradient" style={{ marginBottom: '20px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-active" style={{ fontSize: '11px', padding: '4px 10px' }}>
                Step 2 of Faculty Workflow
              </span>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
                Course CO Target Level Setting (1.00 – 3.00 Scale)
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>
              Set explicit target attainment levels (1.00 to 3.00 scale) for each Course Outcome for {selectedCourse?.code} - {selectedCourse?.name}
            </p>
          </div>

          <button className="btn btn-primary" onClick={handleSaveCoTargets}>
            <Save size={15} /> Save CO Target Levels
          </button>
        </div>
      </div>

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
                <th style={{ width: '240px', textAlign: 'center' }}>Target Attainment Level (1.00 – 3.00 Scale)</th>
              </tr>
            </thead>
            <tbody>
              {activeCOs.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No Course Outcomes found for {selectedCourse?.code}. Please add COs in Step 1 first.
                  </td>
                </tr>
              ) : (
                activeCOs.map((co) => (
                  <tr key={co.code}>
                    <td style={{ fontWeight: '800', color: '#4f46e5' }}>{co.code}</td>
                    <td style={{ fontSize: '12.5px', color: '#1e293b' }}>{co.statement}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="3.0"
                          value={localCoTargets[co.code] !== undefined ? localCoTargets[co.code] : 2.50}
                          onChange={(e) =>
                            setLocalCoTargets({
                              ...localCoTargets,
                              [co.code]: Number(e.target.value),
                            })
                          }
                          className="form-input"
                          style={{
                            width: '95px',
                            padding: '6px 10px',
                            fontSize: '14px',
                            fontWeight: '900',
                            color: '#059669',
                            textAlign: 'center',
                            border: '1.5px solid #10b981',
                            borderRadius: '8px',
                          }}
                        />
                        <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700' }}>Out of 3.0</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Navigation */}
      <SectionSaveFooter
        label="Step 2: Target Setting"
        prevPath="/outcomes"
        nextPath="/co-mapping"
        nextLabel="Save Targets & Proceed to CO Mapping →"
        onSave={handleSaveCoTargets}
      />
    </div>
  );
}
