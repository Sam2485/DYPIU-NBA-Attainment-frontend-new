import { useLocation } from 'react-router-dom';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Layers } from 'lucide-react';
import AttainmentProgressTracker, { WORKFLOW_STEPS } from './AttainmentProgressTracker';

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
  const isStandaloneMode = location.search.includes('mode=standalone');
  const isWorkflowActive = !isStandaloneMode && WORKFLOW_STEPS.some((s) => s.path === location.pathname);

  // If in the middle of the Course Attainment Process, show ONLY Progress Tracker at top (Hide Main Header)
  if (isWorkflowActive && isFaculty) {
    return (
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        <AttainmentProgressTracker />
      </div>
    );
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
          {/* Left Side: OBE Header Title -> College Name -> Batch & Academic Year Selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '280px' }}>
            {/* Big Bold System Name at Top */}
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '950', color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              NBA Outcome-Based Education (OBE) Attainment System
            </h1>

            {/* Sub-header Line 1: College / School Name */}
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#374151', margin: '2px 0 0' }}>
              School of Engineering Management & Research
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

      {/* Render Start Course Attainment Row ONLY on Dashboard */}
      {isFaculty && (location.pathname === '/dashboard' || location.pathname === '/') && <AttainmentProgressTracker />}
    </div>
  );
}
