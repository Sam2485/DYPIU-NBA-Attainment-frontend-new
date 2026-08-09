import { useNavigate } from 'react';
import { BookOpen, Users, ShieldCheck, Clock, CheckCircle2, FileText, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function ProgrammeCoordinatorDashboard() {
  const navigate = useNavigate();
  const {
    selectedProgramme = { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' },
    selectedBatch = { name: 'Batch 2025-29' },
    courses = [],
    programmeId = 'prog-1',
  } = useAcademic();

  const progCourses = courses.filter((c) => !c.programmeId || c.programmeId === programmeId);

  // Mock pending submissions from Course Coordinators
  const pendingSubmissions = [
    { id: 'sub-1', courseCode: 'CS301', courseName: 'Data Structures & Algorithms', submittedBy: 'Dr. Raj Shaikh', type: 'CO Mapping & Attainment' },
    { id: 'sub-2', courseCode: 'CS302', courseName: 'Database Management Systems', submittedBy: 'Prof. Ananya Roy', type: 'Course ATR Report' },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* ── TOP HEADER BANNER (WHITE BACKGROUND, CLEAN, RIGHT ALIGNED BUTTON) ──────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px' }}>
                PROGRAMME COORDINATOR PORTAL • {selectedProgramme.code}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '900' }}>
              Programme Coordinator Dashboard
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
              Scope: <strong>{selectedProgramme.name} ({selectedProgramme.code})</strong> • Active Cycle: <strong>{selectedBatch.name}</strong>
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/programme-coordinator/setup-workflow')}
            style={{
              height: '44px',
              padding: '0 24px',
              fontSize: '13.5px',
              fontWeight: '800',
              gap: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 8px 20px rgba(79,70,229,0.25)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Sparkles size={18} style={{ color: '#ffffff' }} />
            <span style={{ color: '#ffffff' }}>Start / Continue Programme Process</span>
            <ArrowRight size={16} style={{ color: '#ffffff' }} />
          </button>
        </div>
      </div>

      {/* ── STATS SUMMARY METRICS GRID ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', background: '#ffffff', borderLeft: '4px solid #4f46e5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Total Programme Courses</span>
            <BookOpen size={20} style={{ color: '#4f46e5' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            {progCourses.length}
          </div>
          <div style={{ fontSize: '11.5px', color: '#10b981', fontWeight: '700', marginTop: '4px' }}>
            ✓ Allocated to Faculty
          </div>
        </div>

        <div className="card" style={{ padding: '20px', background: '#ffffff', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Pending Course Verifications</span>
            <Clock size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            {pendingSubmissions.length}
          </div>
          <div style={{ fontSize: '11.5px', color: '#b45309', fontWeight: '700', marginTop: '4px' }}>
            Requires Programme Coordinator review
          </div>
        </div>

        <div className="card" style={{ padding: '20px', background: '#ffffff', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>PO & PSO Targets Status</span>
            <ShieldCheck size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            1.0 – 3.0 Scale
          </div>
          <div style={{ fontSize: '11.5px', color: '#15803d', fontWeight: '700', marginTop: '4px' }}>
            ✓ Benchmark configured
          </div>
        </div>

        <div className="card" style={{ padding: '20px', background: '#ffffff', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Programme ATR Status</span>
            <FileText size={20} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            In Progress
          </div>
          <div style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: '700', marginTop: '4px' }}>
            Ready for continuous improvement entry
          </div>
        </div>
      </div>

      {/* ── PENDING VERIFICATIONS ALERT BANNER ────────────────────────────────────── */}
      {pendingSubmissions.length > 0 && (
        <div
          style={{
            background: '#fffbe6',
            border: '1.5px solid #ffe58f',
            borderRadius: '12px',
            padding: '18px 22px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} style={{ color: '#d48806' }} />
            <div>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#873800', fontWeight: '800' }}>
                {pendingSubmissions.length} Course Submissions Awaiting Your Verification
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b76e00' }}>
                Course Coordinators have submitted CO mapping, assessment data, and Course ATRs for review.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/programme-coordinator/verification')}
            style={{ padding: '0 18px', height: '38px', fontSize: '12.5px', fontWeight: '800', background: '#d48806' }}
          >
            Go to Verification Panel →
          </button>
        </div>
      )}

      {/* ── PROGRAMME MANAGEMENT MODULE CARDS ─────────────────────────────────────── */}
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
        Programme Management & Monitoring Modules
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="card" onClick={() => navigate('/programme-coordinator/setup')} style={{ cursor: 'pointer', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <BookOpen size={20} style={{ color: '#4f46e5' }} />
            <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>1. Programme Setup</h4>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
            Add course list under programme, inspect PO/PSO/PEO framework, and submit for HOD verification.
          </p>
        </div>

        <div className="card" onClick={() => navigate('/programme-coordinator/course-allocation')} style={{ cursor: 'pointer', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Users size={20} style={{ color: '#059669' }} />
            <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>2. Course & Faculty Allocation</h4>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
            Allocate senior faculty members as Course Coordinators and inspect current allocation status.
          </p>
        </div>

        <div className="card" onClick={() => navigate('/programme-coordinator/target-settings')} style={{ cursor: 'pointer', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <ShieldCheck size={20} style={{ color: '#0284c7' }} />
            <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>3. Target Settings</h4>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
            Set benchmark target levels (1.0 to 3.0 scale) for POs and PSOs for {selectedProgramme.code}.
          </p>
        </div>

        <div className="card" onClick={() => navigate('/programme-coordinator/verification')} style={{ cursor: 'pointer', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Clock size={20} style={{ color: '#d97706' }} />
            <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>4. Verification Panel</h4>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
            Verify course-level submissions (COs, mapping, direct/indirect attainment, Course ATR) made by Course Coordinators.
          </p>
        </div>

        <div className="card" onClick={() => navigate('/programme-coordinator/attainment-summary')} style={{ cursor: 'pointer', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <CheckCircle2 size={20} style={{ color: '#7c3aed' }} />
            <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>5. Attainment Summary</h4>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
            View overall PO/PSO attainment matrix, compare target vs actual attainment, and analyze course contributions.
          </p>
        </div>

        <div className="card" onClick={() => navigate('/programme-coordinator/programme-atr')} style={{ cursor: 'pointer', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FileText size={20} style={{ color: '#db2777' }} />
            <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>6. Programme ATR</h4>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
            Prepare final Programme Action Taken Report (ATR) with continuous improvement action plans for HOD approval.
          </p>
        </div>
      </div>
    </div>
  );
}
