import { useState } from 'react';
import { Sliders, Save, CheckCircle2, Clock, XCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function AttainmentConfig() {
  const { role, user } = useAuth();
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
    availableCourses = [],
    attainmentConfigs,
    updateCourseAttainmentConfig,
  } = useAcademic();

  const isFaculty = role === 'FACULTY';
  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';

  const courseList = availableCourses.length > 0 ? availableCourses : [
    { id: 'crs-1', code: '310244', name: 'Computer Network and Security' },
    { id: 'crs-2', code: 'CS301', name: 'Data Structures & Algorithms' },
  ];

  // Local state initialized with context attainmentConfigs
  const [courseConfigs, setCourseConfigs] = useState({
    'crs-1': {
      courseCode: '310244',
      courseName: 'Computer Network and Security',
      directWeight: attainmentConfigs?.['crs-1']?.directWeight || 80,
      indirectWeight: attainmentConfigs?.['crs-1']?.indirectWeight || 20,
      directThreshold: attainmentConfigs?.['crs-1']?.directThreshold || 60,
      slightWeight: 0.33,
      moderateWeight: 0.66,
      substantialWeight: 1.00,
      levels: [
        { level: 1, minPercentage: 0, maxPercentage: 50 },
        { level: 2, minPercentage: 50, maxPercentage: 70 },
        { level: 3, minPercentage: 70, maxPercentage: 100 },
      ],
      status: 'WAITING_FOR_COORDINATOR_VERIFICATION',
      proposedBy: 'Dr. Raj Shaikh',
      proposedAt: '2026-08-04',
    },
    'crs-2': {
      courseCode: 'CS301',
      courseName: 'Data Structures & Algorithms',
      directWeight: attainmentConfigs?.['crs-2']?.directWeight || 80,
      indirectWeight: attainmentConfigs?.['crs-2']?.indirectWeight || 20,
      directThreshold: attainmentConfigs?.['crs-2']?.directThreshold || 65,
      slightWeight: 0.33,
      moderateWeight: 0.66,
      substantialWeight: 1.00,
      levels: [
        { level: 1, minPercentage: 0, maxPercentage: 55 },
        { level: 2, minPercentage: 55, maxPercentage: 75 },
        { level: 3, minPercentage: 75, maxPercentage: 100 },
      ],
      status: 'VERIFIED',
      proposedBy: 'Prof. Ananya Roy',
      proposedAt: '2026-08-02',
    },
  });

  const [activeCourseId, setActiveCourseId] = useState(selectedCourse?.id || 'crs-1');
  const currentConfig = courseConfigs[activeCourseId] || {
    courseCode: selectedCourse?.code || '310244',
    courseName: selectedCourse?.name || 'Computer Network and Security',
    directWeight: attainmentConfigs?.[selectedCourse?.id]?.directWeight || 80,
    indirectWeight: attainmentConfigs?.[selectedCourse?.id]?.indirectWeight || 20,
    directThreshold: attainmentConfigs?.[selectedCourse?.id]?.directThreshold || 60,
    slightWeight: 0.33,
    moderateWeight: 0.66,
    substantialWeight: 1.00,
    levels: [
      { level: 1, minPercentage: 0, maxPercentage: 50 },
      { level: 2, minPercentage: 50, maxPercentage: 70 },
      { level: 3, minPercentage: 70, maxPercentage: 100 },
    ],
    status: 'VERIFIED',
    proposedBy: 'Dr. Raj Shaikh',
    proposedAt: '2026-08-04',
  };

  const handleDirectWeightChange = (val) => {
    const direct = Number(val);
    const updated = {
      ...currentConfig,
      directWeight: direct,
      indirectWeight: 100 - direct,
      status: isFaculty ? 'WAITING_FOR_COORDINATOR_VERIFICATION' : currentConfig.status,
      proposedBy: user?.name || 'Faculty Member',
      proposedAt: new Date().toISOString().split('T')[0],
    };
    setCourseConfigs((prev) => ({
      ...prev,
      [activeCourseId]: updated,
    }));
    updateCourseAttainmentConfig(activeCourseId, updated);
  };

  const handleThresholdChange = (val) => {
    const threshold = Number(val);
    const updated = {
      ...currentConfig,
      directThreshold: threshold,
      status: isFaculty ? 'WAITING_FOR_COORDINATOR_VERIFICATION' : currentConfig.status,
      proposedBy: user?.name || 'Faculty Member',
      proposedAt: new Date().toISOString().split('T')[0],
    };
    setCourseConfigs((prev) => ({
      ...prev,
      [activeCourseId]: updated,
    }));
    updateCourseAttainmentConfig(activeCourseId, updated);
  };

  const handleLevelChange = (idx, field, val) => {
    const updatedLevels = [...(currentConfig.levels || [])];
    updatedLevels[idx] = { ...updatedLevels[idx], [field]: Number(val) };

    const updated = {
      ...currentConfig,
      levels: updatedLevels,
      status: isFaculty ? 'WAITING_FOR_COORDINATOR_VERIFICATION' : currentConfig.status,
      proposedBy: user?.name || 'Faculty Member',
      proposedAt: new Date().toISOString().split('T')[0],
    };

    setCourseConfigs((prev) => ({
      ...prev,
      [activeCourseId]: updated,
    }));
    updateCourseAttainmentConfig(activeCourseId, updated);
  };

  const handleVerifyConfig = (cId) => {
    const updated = {
      ...courseConfigs[cId],
      status: 'VERIFIED',
    };
    setCourseConfigs((prev) => ({
      ...prev,
      [cId]: updated,
    }));
    updateCourseAttainmentConfig(cId, updated);
    alert(`Attainment configuration for ${courseConfigs[cId]?.courseCode || 'course'} VERIFIED by Programme Coordinator!`);
  };

  const handleRejectConfig = (cId) => {
    const updated = {
      ...courseConfigs[cId],
      status: 'REJECTED',
    };
    setCourseConfigs((prev) => ({
      ...prev,
      [cId]: updated,
    }));
    updateCourseAttainmentConfig(cId, updated);
    alert(`Attainment configuration for ${courseConfigs[cId]?.courseCode || 'course'} rejected and sent back to Faculty for revision.`);
  };

  const handleSaveConfig = () => {
    updateCourseAttainmentConfig(activeCourseId, currentConfig);
    if (isFaculty) {
      alert('Attainment Configurations submitted! Waiting for Programme Coordinator verification.');
    } else {
      alert('Attainment Configurations saved and verified successfully!');
    }
  };

  // Count pending verifications for Programme Coordinator
  const pendingVerifications = Object.values(courseConfigs).filter(
    (c) => c.status === 'WAITING_FOR_COORDINATOR_VERIFICATION'
  );

  const isVerified = currentConfig.status === 'VERIFIED';
  const isPending = currentConfig.status === 'WAITING_FOR_COORDINATOR_VERIFICATION';

  return (
    <div className="animated-page">
      {/* Standard Header Banner */}
      <div className="banner-dark-gradient">
        <div className="banner-content-row">
          <div>
            <div className="badge badge-active" style={{ marginBottom: '6px' }}>
              Attainment Configuration ({role})
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Course Attainment Configurations & Verification
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#475569' }}>
              Programme: <strong style={{ color: '#0f172a' }}>{selectedProgramme?.code}</strong> • AY: <strong style={{ color: '#0f172a' }}>{academicYear}</strong> • Faculty proposals require Coordinator verification.
            </p>
          </div>

          <button className="btn btn-primary" onClick={handleSaveConfig}>
            <Save size={15} /> {isFaculty ? 'Submit Configuration Proposal' : 'Save & Verify Configurations'}
          </button>
        </div>
      </div>

      {/* Programme Coordinator Pending Verifications Alert Banner */}
      {isCoordinator && pendingVerifications.length > 0 && (
        <div
          className="card"
          style={{
            background: '#fefce8',
            border: '1.5px solid #fef08a',
            borderLeft: '5px solid #ca8a04',
            padding: '16px 20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={24} style={{ color: '#ca8a04' }} />
              <div>
                <strong style={{ fontSize: '14px', color: '#854d0e' }}>
                  {pendingVerifications.length} Course Attainment Configurations Waiting for Your Verification
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#a16207' }}>
                  Faculty members have updated attainment weightages & target thresholds. Review and click Verify below.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {pendingVerifications.map((c) => (
                <button
                  key={c.courseCode}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                  onClick={() => {
                    const foundId = Object.keys(courseConfigs).find((k) => courseConfigs[k].courseCode === c.courseCode);
                    if (foundId) setActiveCourseId(foundId);
                  }}
                >
                  <UserCheck size={13} /> {c.courseCode} Pending
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Course Selection Bar for Programme Coordinator & Faculty */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={18} style={{ color: '#4f46e5' }} />
            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>Select Course Configuration:</strong>
            <select
              value={activeCourseId}
              onChange={(e) => setActiveCourseId(e.target.value)}
              className="glass-selector-group"
              style={{
                height: '36px',
                padding: '0 12px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#4f46e5',
                background: '#ffffff',
                border: '1.5px solid #6366f1',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              {courseList.map((crs) => {
                const cfg = courseConfigs[crs.id];
                const isPendingItem = cfg?.status === 'WAITING_FOR_COORDINATOR_VERIFICATION';
                return (
                  <option key={crs.id} value={crs.id} style={{ color: '#0f172a' }}>
                    {crs.code} - {crs.name} {isPendingItem ? '(Pending Verification)' : '(Verified)'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Active Configuration Verification Status Badge & Coordinator Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isVerified ? (
              <span className="badge badge-success" style={{ gap: '4px' }}>
                <CheckCircle2 size={13} /> Verified by Coordinator
              </span>
            ) : isPending ? (
              <span className="badge badge-pending" style={{ gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                <Clock size={13} /> Waiting for Coordinator Verification
              </span>
            ) : (
              <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', gap: '4px' }}>
                <XCircle size={13} /> Needs Revision
              </span>
            )}

            {isCoordinator && !isVerified && (
              <button
                className="btn btn-success"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => handleVerifyConfig(activeCourseId)}
              >
                <ShieldCheck size={14} /> Verify Course Config
              </button>
            )}

            {isCoordinator && isPending && (
              <button
                className="btn btn-danger"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => handleRejectConfig(activeCourseId)}
              >
                <XCircle size={14} /> Reject
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Layout for Configuration Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Card 1: Attainment Weightages & Threshold */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
              Attainment Weightages & Direct Target Threshold ({currentConfig.courseCode})
            </h3>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Direct CO Attainment Weightage (%)</span>
              <strong style={{ color: '#2563eb' }}>{currentConfig.directWeight}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={currentConfig.directWeight}
              onChange={(e) => handleDirectWeightChange(e.target.value)}
              style={{ accentColor: '#2563eb' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Indirect CO Attainment Weightage (%)</span>
              <strong style={{ color: '#0ea5e9' }}>{currentConfig.indirectWeight}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              disabled
              value={currentConfig.indirectWeight}
              style={{ accentColor: '#0ea5e9' }}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

          <div className="form-group">
            <label className="form-label">Direct Attainment Target Threshold (%)</label>
            <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#64748b' }}>
              Minimum marks percentage required for a student to attain a Course Outcome (CO).
            </p>
            <input
              type="number"
              className="form-control"
              value={currentConfig.directThreshold}
              onChange={(e) => handleThresholdChange(e.target.value)}
            />
          </div>
        </div>

        {/* Card 2: Attainment Level Configuration */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
              Attainment Level Ranges (Levels 1–3) ({currentConfig.courseCode})
            </h3>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>
            Percentage of students attaining threshold mapped to NBA Attainment Levels.
          </p>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px', textAlign: 'center' }}>Level</th>
                  <th>Min Student %</th>
                  <th>Max Student %</th>
                  <th style={{ textAlign: 'center' }}>Badge</th>
                </tr>
              </thead>
              <tbody>
                {(currentConfig.levels || []).map((lvl, idx) => (
                  <tr key={lvl.level}>
                    <td style={{ textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>
                      Level {lvl.level}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={lvl.minPercentage}
                        onChange={(e) => handleLevelChange(idx, 'minPercentage', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={lvl.maxPercentage}
                        onChange={(e) => handleLevelChange(idx, 'maxPercentage', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge badge-level-${lvl.level}`}>
                        Level {lvl.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Save, Previous & Save & Next Footer */}
      <SectionSaveFooter
        label="Attainment Config"
        prevPath="/users"
        nextPath="/academic"
        onSave={handleSaveConfig}
      />
    </div>
  );
}
