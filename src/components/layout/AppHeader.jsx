import { useLocation } from 'react-router-dom';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import AttainmentProgressTracker from './AttainmentProgressTracker';

export default function AppHeader() {
  const location = useLocation();
  const { role } = useAuth();
  const {
    batches,
    batchId,
    setBatchId,
    academicYear,
    setAcademicYear,
    availableYears,
  } = useAcademic();

  const isFaculty = role === 'FACULTY';
  const isWorkflowRoute = location.pathname.includes('workflow');

  // Completely suppress main header in all workflow routes (Director, HOD, Programme Coordinator, Course Coordinator)
  if (isWorkflowRoute) {
    return null;
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
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
            flexWrap: 'wrap',
          }}
        >
          {/* Left Side: OBE Header Title -> College Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '280px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '950', color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              NBA Outcome-Based Education (OBE) Attainment System
            </h1>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#374151', margin: '2px 0 0' }}>
              School of Engineering Management &amp; Research
            </div>
          </div>

          {/* Right Side Edge: DYPIU Logo */}
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

      {/* Render Start Course Attainment Row ONLY on Dashboard */}
      {isFaculty && (location.pathname === '/dashboard' || location.pathname === '/') && <AttainmentProgressTracker />}
    </div>
  );
}
