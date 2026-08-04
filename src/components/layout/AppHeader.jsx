import { useAcademic } from '../../context/AcademicContext';
import { Sparkles } from 'lucide-react';

export default function AppHeader() {
  const {
    academicYear,
    setAcademicYear,
    availableYears,
  } = useAcademic();

  return (
    <div style={{ width: '100%', padding: '20px 28px 0', boxSizing: 'border-box' }}>
      <header
        className="banner-dark-gradient"
        style={{
          width: '100%',
          margin: 0,
          padding: '20px 24px',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '14px',
          boxShadow: '0 10px 28px rgba(17,24,39,0.06)',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Side: OBE Header Title -> College Name -> Academic Year */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
          {/* Big Bold System Name at Top */}
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '950', color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            NBA Outcome-Based Education (OBE) Attainment System
          </h1>

          {/* Sub-header Line 1: College / School Name */}
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#374151', margin: '2px 0 4px' }}>
            School of Engineering Management & Research
          </div>

          {/* Sub-header Line 2: Academic Year Dropdown with Active/Closed Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: '700' }}>
            <Sparkles size={14} style={{ color: '#4f46e5' }} />
            <span>Academic Year:</span>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              style={{
                height: '34px',
                minWidth: '170px',
                border: '1.5px solid #6366f1',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '12.5px',
                fontFamily: 'inherit',
                color: '#4f46e5',
                background: '#ffffff',
                outline: 'none',
                fontWeight: '800',
                boxShadow: '0 1px 3px rgba(99,102,241,0.08)',
                cursor: 'pointer',
              }}
            >
              {availableYears.map((yr) => {
                const isActive = yr === '2026-27' || yr === academicYear;
                return (
                  <option key={yr} value={yr} style={{ color: '#0f172a', fontWeight: '700' }}>
                    {yr} {isActive ? '(Active)' : '(Closed)'}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Right Side Edge: DYPIU Logo matching AppraisalHeaderImage (height: 78px) */}
        <img
          src="/image.png"
          alt="DYPIU"
          style={{
            height: '78px',
            width: 'auto',
            maxWidth: 'min(36vw, 320px)',
            objectFit: 'contain',
            display: 'block',
            flexShrink: 0,
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </header>
    </div>
  );
}
