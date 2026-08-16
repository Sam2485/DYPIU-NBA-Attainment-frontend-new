import { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, Clock, ShieldCheck, Target, Layers, PieChart, Award, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';
import { getAttainmentConfiguration, saveAttainmentConfiguration } from '../../api/academicApi';

export default function AttainmentConfig() {
  const { role, user } = useAuth();
  const {
    academicYear,
    programmeId,
    selectedProgramme,
    selectedCourseOffering,
    courseOfferings = [],
    selectedCourse,
    courses = [],
    activePOs = [],
    activePSOs = [],
  } = useAcademic();

  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR';

  const courseList = courseOfferings.length > 0 ? courseOfferings : courses;

  const targetOffering = selectedCourseOffering || courseList[0];
  const [activeCourseId, setActiveCourseId] = useState(targetOffering?.id || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState({
    directWeight: 80,
    indirectWeight: 20,
    directThreshold: 60,
    directLevels: [
      { level: 1, minPercentage: 0, maxPercentage: 50 },
      { level: 2, minPercentage: 50, maxPercentage: 70 },
      { level: 3, minPercentage: 70, maxPercentage: 100 },
    ],
    indirectLevels: [
      { level: 1, minPercentage: 0, maxPercentage: 50 },
      { level: 2, minPercentage: 50, maxPercentage: 70 },
      { level: 3, minPercentage: 70, maxPercentage: 100 },
    ],
    status: 'DRAFT',
  });

  useEffect(() => {
    if (targetOffering?.id && !activeCourseId) {
      setActiveCourseId(targetOffering.id);
    }
  }, [targetOffering]);

  useEffect(() => {
    let isMounted = true;
    if (!activeCourseId) return;

    setLoading(true);
    getAttainmentConfiguration(activeCourseId)
      .then((res) => {
        if (isMounted) {
          const data = res?.data || res;
          if (data && typeof data === 'object') {
            setConfig((prev) => ({
              ...prev,
              ...data,
              directWeight: data.directWeight ?? 80,
              indirectWeight: data.indirectWeight ?? 20,
              directThreshold: data.directThreshold ?? 60,
            }));
          }
        }
      })
      .catch((err) => {
        console.warn('Error fetching attainment config:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCourseId]);

  const handleDirectWeightChange = (val) => {
    const direct = Math.min(100, Math.max(0, Number(val)));
    setConfig((prev) => ({
      ...prev,
      directWeight: direct,
      indirectWeight: 100 - direct,
    }));
  };

  const handleThresholdChange = (val) => {
    const threshold = Number(val);
    setConfig((prev) => ({
      ...prev,
      directThreshold: threshold,
    }));
  };

  const handleDirectLevelChange = (levelIndex, field, val) => {
    const numVal = Math.min(100, Math.max(0, Number(val)));
    const updatedLevels = (config.directLevels || []).map((lvl, idx) => {
      if (idx === levelIndex) {
        return { ...lvl, [field]: numVal };
      }
      return lvl;
    });
    setConfig((prev) => ({
      ...prev,
      directLevels: updatedLevels,
    }));
  };

  const handleIndirectLevelChange = (levelIndex, field, val) => {
    const numVal = Math.min(100, Math.max(0, Number(val)));
    const updatedLevels = (config.indirectLevels || []).map((lvl, idx) => {
      if (idx === levelIndex) {
        return { ...lvl, [field]: numVal };
      }
      return lvl;
    });
    setConfig((prev) => ({
      ...prev,
      indirectLevels: updatedLevels,
    }));
  };

  const handleSaveConfig = async () => {
    if (!activeCourseId) return;
    try {
      setSaving(true);
      const payload = {
        ...config,
        status: isCoordinator ? 'VERIFIED' : 'SUBMITTED',
      };
      await saveAttainmentConfiguration(activeCourseId, payload);
      setConfig(payload);
      alert('Attainment settings saved successfully to database!');
    } catch (err) {
      alert('Failed to save attainment settings: ' + (err.message || 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const activeCourseObj = courseList.find((c) => c.id === activeCourseId) || targetOffering;
  const courseDisplayName = activeCourseObj?.courseCode
    ? `${activeCourseObj.courseCode} — ${activeCourseObj.courseName || ''}`
    : activeCourseObj
    ? `${activeCourseObj.code} — ${activeCourseObj.name}`
    : 'Select Course';

  return (
    <div className="animated-page">
      {/* Standard Header Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '20px' }}>
        <div className="banner-content-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              Attainment Settings ({courseDisplayName})
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#cbd5e1' }}>
              Define Direct/Indirect assessment weights, target thresholds, and percentage achievement bands.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSaveConfig}
            disabled={saving || !activeCourseId}
            style={{ background: '#10b981', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={15} /> {saving ? 'Saving...' : !isCoordinator ? 'Submit Configuration Proposal' : 'Save Attainment Settings'}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: '24px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <RefreshCw size={20} className="spin" style={{ color: '#4f46e5', marginBottom: '6px' }} />
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Loading attainment settings from database...</div>
        </div>
      )}

      {/* Course Selection Strip */}
      {courseList.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '10px',
            marginBottom: '16px',
          }}
        >
          {courseList.map((c) => {
            const isCurrent = c.id === activeCourseId;
            const cCode = c.courseCode || c.code;
            const cName = c.courseName || c.name;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCourseId(c.id)}
                className={`btn ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontSize: '12px',
                  padding: '8px 14px',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{cCode} - {cName}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Weight & Threshold Configuration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Direct Assessment Weight</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input
              type="number"
              min="0"
              max="100"
              value={config.directWeight}
              onChange={(e) => handleDirectWeightChange(e.target.value)}
              className="form-input"
              style={{ width: '80px', fontWeight: '800', fontSize: '15px' }}
            />
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>% Direct Weight</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Internal exams, practicals, assignments</div>
        </div>

        <div className="card" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Indirect Assessment Weight</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input
              type="number"
              min="0"
              max="100"
              disabled
              value={config.indirectWeight}
              className="form-input"
              style={{ width: '80px', fontWeight: '800', fontSize: '15px', background: '#f8fafc' }}
            />
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>% Indirect Weight</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Course-end student feedback surveys</div>
        </div>

        <div className="card" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Direct Target Threshold</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input
              type="number"
              min="0"
              max="100"
              value={config.directThreshold}
              onChange={(e) => handleThresholdChange(e.target.value)}
              className="form-input"
              style={{ width: '80px', fontWeight: '800', fontSize: '15px' }}
            />
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>% Pass / Benchmark</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Min marks % required per student</div>
        </div>
      </div>

      {/* Direct Attainment Level Bands */}
      <div className="card" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
          Direct Attainment Level Bands (Levels 1 to 3)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {(config.directLevels || []).map((lvl, idx) => (
            <div key={lvl.level} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '13px', color: '#4f46e5', marginBottom: '8px' }}>
                Level {lvl.level} Attainment Score
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                <span>From</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={lvl.minPercentage}
                  onChange={(e) => handleDirectLevelChange(idx, 'minPercentage', e.target.value)}
                  className="form-input"
                  style={{ width: '65px', padding: '4px 8px' }}
                />
                <span>% to</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={lvl.maxPercentage}
                  onChange={(e) => handleDirectLevelChange(idx, 'maxPercentage', e.target.value)}
                  className="form-input"
                  style={{ width: '65px', padding: '4px 8px' }}
                />
                <span>%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionSaveFooter
        label="Attainment Configuration"
        prevPath="/dashboard"
        nextPath="/outcomes"
        nextLabel="Proceed to Outcome Management →"
        onSave={handleSaveConfig}
      />
    </div>
  );
}
