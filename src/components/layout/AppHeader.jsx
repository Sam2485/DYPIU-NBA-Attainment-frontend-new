import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { Shield, Sparkles } from 'lucide-react';

export default function AppHeader({ title, subtitle }) {
  const { role, switchRole } = useAuth();
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
  } = useAcademic();

  return (
    <header className="main-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
      {/* DYPIU Branding Logo & Title */}
      <div className="main-header__branding">
        <img
          src="/image.png"
          alt="DYPIU Logo"
          className="main-header__logo"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="main-header__title">
          <h1>{title || 'NBA Outcome-Based Education (OBE) Attainment'}</h1>
          <p>
            {subtitle ||
              `D. Y. Patil International University • ${selectedProgramme?.code} (${selectedCourse?.code})`}
          </p>
        </div>
      </div>

      {/* Clean Top Header Bar Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Role Switcher for RBAC Testing */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            padding: '5px 12px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
          }}
        >
          <Shield size={14} style={{ color: '#475569' }} />
          <select
            value={role}
            onChange={(e) => switchRole(e.target.value)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#0f172a',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="SUPER_ADMIN">Role: SUPER_ADMIN</option>
            <option value="HOD">Role: HOD</option>
            <option value="FACULTY">Role: FACULTY</option>
          </select>
        </div>

        {/* Live Academic Year Badge */}
        <div className="badge badge-active">
          <Sparkles size={12} /> AY {academicYear}
        </div>
      </div>
    </header>
  );
}
