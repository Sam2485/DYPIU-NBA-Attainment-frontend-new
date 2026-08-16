import { useState, useEffect } from 'react';
import { Save, History, Printer, CheckCircle2, ChevronDown, Layers, FileText, AlertCircle, Clock, Lock } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import CourseATR from './CourseATR';
import ProgrammeATR from './ProgrammeATR';

export default function ATRReportsNavHub({ initialTab = 'course-atr' }) {
  const { role, user } = useAuth();
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';

  const {
    availableCourses = [],
    courses = [],
    selectedCourse,
    selectedCourseOffering,
    courseOfferings = [],
    academicYear = '2025-26',
    availableYears = ['2025-26', '2024-25', '2023-24'],
  } = useAcademic();

  const [activeAtrTab, setActiveAtrTab] = useState(initialTab);
  const [selectedYear, setSelectedYear] = useState(academicYear || '2025-26');
  const [showHistory, setShowHistory] = useState(false);

  const courseList = courseOfferings.length > 0 ? courseOfferings : (availableCourses.length > 0 ? availableCourses : courses);
  const currentOffering = selectedCourseOffering || courseList[0];
  const [activeCourseId, setActiveCourseId] = useState(currentOffering?.id || '');

  useEffect(() => {
    if (currentOffering?.id && !activeCourseId) {
      setActiveCourseId(currentOffering.id);
    }
  }, [currentOffering]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '60px' }}>
      {/* ── TOP BANNER ──────────────────────────────────────────────────────── */}
      <div className="banner-dark-gradient" style={{ marginBottom: '20px' }}>
        <div className="banner-content-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: '800', fontSize: '11px' }}>
                QUALITY ASSURANCE &bull; ACTION TAKEN REPORTS
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#ffffff', fontWeight: '800' }}>
              Action Taken Reports (ATR) Hub
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#cbd5e1' }}>
              Continuous improvement loop: target attainment gap analysis and pedagogical action plans.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handlePrint}
            style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', gap: '6px', display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <Printer size={15} /> Print ATR Report
          </button>
        </div>
      </div>

      {/* ── TAB SELECTOR & COURSE FILTER ────────────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Left: Tab switch (Course ATR vs Programme ATR) */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveAtrTab('course-atr')}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              background: activeAtrTab === 'course-atr' ? '#ffffff' : 'transparent',
              color: activeAtrTab === 'course-atr' ? '#4f46e5' : '#64748b',
              boxShadow: activeAtrTab === 'course-atr' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={14} /> Course ATR
          </button>

          {!isCourseCoordinator && (
            <button
              type="button"
              onClick={() => setActiveAtrTab('programme-atr')}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                background: activeAtrTab === 'programme-atr' ? '#ffffff' : 'transparent',
                color: activeAtrTab === 'programme-atr' ? '#4f46e5' : '#64748b',
                boxShadow: activeAtrTab === 'programme-atr' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Layers size={14} /> Programme ATR
            </button>
          )}
        </div>

        {/* Right: Course Selector */}
        {courseList.length > 0 && (
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <select
              value={activeCourseId}
              onChange={(e) => setActiveCourseId(e.target.value)}
              style={{
                height: '38px',
                fontSize: '12.5px',
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
              }}
            >
              {courseList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode || c.code} &mdash; {c.courseName || c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
          </div>
        )}
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────────────────────────── */}
      {activeAtrTab === 'course-atr' ? (
        <CourseATR
          courseId={activeCourseId}
          showHistoryProp={showHistory}
          hideHeader={true}
        />
      ) : (
        <ProgrammeATR
          courseId={activeCourseId}
          hideHeader={true}
        />
      )}
    </div>
  );
}
