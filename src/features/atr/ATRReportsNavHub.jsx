import { useState } from 'react';
import { Save, History, Printer, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import CourseATR from './CourseATR';

export default function ATRReportsNavHub() {
  const {
    availableCourses = [],
    courses = [],
    selectedCourse,
    setCourseId = () => {},
    academicYear,
  } = useAcademic();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleSaveSubmitATR = () => {
    setIsSubmitted(true);
    alert(`🎉 Course ATR for ${selectedCourse?.code || 'Course'} saved and submitted successfully to the Programme Coordinator!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animated-page">
      {/* Top Banner Header with Space-Between Action Bar */}
      <div className="banner-dark-gradient print:hidden" style={{ marginBottom: '20px' }}>
        {/* TITLE BLOCK */}
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
            Action Taken Report (ATR) Hub
          </h2>
        </div>

        {/* SPACE BETWEEN ACTION BAR: First two options on left, Course Selector & Save option on extreme right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* FIRST TWO OPTIONS (LEFT) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowHistory(!showHistory)}
              style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            >
              <History size={15} /> {showHistory ? 'Hide Previous Batch ATR' : 'View Carry-Forward ATR'}
            </button>

            <button
              className="btn btn-secondary"
              onClick={handlePrint}
              style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            >
              <Printer size={15} /> Print ATR Report
            </button>
          </div>

          {/* COURSE SELECTOR & SAVE OPTION (EXTREME RIGHT) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Course Selector Dropdown */}
            <div style={{ position: 'relative', width: '260px' }}>
              <select
                value={selectedCourse?.id || ''}
                onChange={(e) => setCourseId(e.target.value)}
                style={{
                  height: '38px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#4f46e5',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 30px 0 12px',
                  background: '#ffffff',
                  width: '100%',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {(availableCourses.length > 0 ? availableCourses : courses).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>

            {isSubmitted && (
              <span className="badge badge-active" style={{ height: '38px', boxSizing: 'border-box', background: '#dcfce7', color: '#15803d', padding: '0 14px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center' }}>
                ✓ SUBMITTED TO PROGRAMME COORDINATOR
              </span>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSaveSubmitATR}
              style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '800', gap: '8px', display: 'inline-flex', alignItems: 'center' }}
            >
              <Save size={16} /> Save &amp; Submit Course ATR
            </button>
          </div>
        </div>
      </div>

      {/* Render Course ATR Form Directly */}
      <div>
        <CourseATR hideFooter={true} hideHeader={true} showHistoryProp={showHistory} />
      </div>
    </div>
  );
}
