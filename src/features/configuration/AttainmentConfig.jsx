import { useState } from 'react';
import { Sliders, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AttainmentConfig() {
  const { role } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN';

  // Config State
  const [directWeight, setDirectWeight] = useState(80);
  const [indirectWeight, setIndirectWeight] = useState(20);
  const [directThreshold, setDirectThreshold] = useState(60);

  const [slightWeight, setSlightWeight] = useState(0.33);
  const [moderateWeight, setModerateWeight] = useState(0.66);
  const [substantialWeight, setSubstantialWeight] = useState(1.00);

  // Attainment Levels State
  const [levels, setLevels] = useState([
    { level: 1, minPercentage: 0, maxPercentage: 50 },
    { level: 2, minPercentage: 50, maxPercentage: 70 },
    { level: 3, minPercentage: 70, maxPercentage: 100 },
  ]);

  const handleDirectWeightChange = (val) => {
    const direct = Number(val);
    setDirectWeight(direct);
    setIndirectWeight(100 - direct);
  };

  const handleSaveConfig = () => {
    alert('Attainment Configurations updated successfully!');
  };

  return (
    <div className="animated-page">
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)',
          color: '#fff',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.1)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Sliders size={24} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
                Configuration Management (Module 7)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#bfdbfe' }}>
                Centralized control over Direct/Indirect weightages, thresholds, and attainment level ranges.
              </p>
            </div>
          </div>

          {isSuperAdmin && (
            <button className="btn btn-success" onClick={handleSaveConfig}>
              <Save size={15} /> Save Configurations
            </button>
          )}
        </div>
      </div>

      {!isSuperAdmin && (
        <div
          style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#b45309',
            fontSize: '12.5px',
          }}
        >
          <ShieldAlert size={18} />
          <span>
            <strong>Read-Only View:</strong> Only `SUPER_ADMIN` can edit attainment configuration rules. Switch role in top header to edit.
          </span>
        </div>
      )}

      {/* Grid Layout for Configuration Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Card 1: Attainment Weightages & Threshold */}
        <div className="card">
          <div className="card-header">
            <h3>Attainment Weightages & Direct Threshold</h3>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Direct CO Attainment Weightage (%)</span>
              <strong style={{ color: '#2563eb' }}>{directWeight}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              disabled={!isSuperAdmin}
              value={directWeight}
              onChange={(e) => handleDirectWeightChange(e.target.value)}
              style={{ accentColor: '#2563eb' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Indirect CO Attainment Weightage (%)</span>
              <strong style={{ color: '#0ea5e9' }}>{indirectWeight}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              disabled
              value={indirectWeight}
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
              disabled={!isSuperAdmin}
              value={directThreshold}
              onChange={(e) => setDirectThreshold(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Card 2: Attainment Level Configuration */}
        <div className="card">
          <div className="card-header">
            <h3>Attainment Level Ranges (Levels 1–3)</h3>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>
            Percentage of students attaining threshold mapped to NBA Attainment Levels.
          </p>

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
              {levels.map((lvl, idx) => (
                <tr key={lvl.level}>
                  <td style={{ textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>
                    Level {lvl.level}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      disabled={!isSuperAdmin}
                      value={lvl.minPercentage}
                      onChange={(e) => {
                        const updated = [...levels];
                        updated[idx].minPercentage = Number(e.target.value);
                        setLevels(updated);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      disabled={!isSuperAdmin}
                      value={lvl.maxPercentage}
                      onChange={(e) => {
                        const updated = [...levels];
                        updated[idx].maxPercentage = Number(e.target.value);
                        setLevels(updated);
                      }}
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
  );
}
