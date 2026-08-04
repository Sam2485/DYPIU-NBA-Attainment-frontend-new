import { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { Building2, Target, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardOverview() {
  const { selectedProgramme, selectedCourse } = useAcademic();
  const { role } = useAuth();

  const [calculationRuns] = useState([
    {
      id: 'RUN-2026-001',
      course: 'CS301 - Data Structures & Algorithms',
      programme: 'B.Tech CSE',
      triggeredBy: 'Dr. Raj Shaikh',
      status: 'SUCCESS',
      directLevel: 2.8,
      indirectLevel: 2.5,
      overallAttainment: 2.74,
      date: '2026-08-01 14:20',
    },
    {
      id: 'RUN-2026-002',
      course: 'CS302 - Database Management Systems',
      programme: 'B.Tech CSE',
      triggeredBy: 'Prof. Ananya Roy',
      status: 'SUCCESS',
      directLevel: 3.0,
      indirectLevel: 2.8,
      overallAttainment: 2.96,
      date: '2026-08-01 11:45',
    },
    {
      id: 'RUN-2026-003',
      course: 'CS303 - Operating Systems',
      programme: 'B.Tech CSE',
      triggeredBy: 'Dr. Sameer Khan',
      status: 'RUNNING',
      directLevel: '-',
      indirectLevel: '-',
      overallAttainment: '-',
      date: '2026-08-01 15:10',
    },
  ]);

  return (
    <div className="animated-page">

      {/* Active scope info strip — replaces the banner (which moved to AppHeader) */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '12px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
        }}
      >
        <div style={{ fontSize: 12.5, color: '#475569' }}>
          🎯 Active Scope:{' '}
          <strong style={{ color: '#0f172a' }}>{selectedProgramme?.code || '—'}</strong>
          {' '}•{' '}
          <strong style={{ color: '#0f172a' }}>{selectedCourse?.code} {selectedCourse?.name ? `(${selectedCourse.name})` : ''}</strong>
          <span style={{ marginLeft: 10, color: '#94a3b8', fontSize: 11 }}>
            Select Programme &amp; Course from the top bar to change scope.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/co-mapping" className="btn btn-secondary" style={{ fontSize: '11.5px', padding: '5px 12px' }}>
            CO Mapping <ArrowRight size={12} />
          </Link>
          <Link to="/co-attainment" className="btn btn-primary" style={{ fontSize: '11.5px', padding: '5px 12px' }}>
            Run Attainment <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-cards-4">
        <div className="stat-card">
          <div className="stat-card__icon">
            <Building2 size={22} />
          </div>
          <div>
            <div className="stat-card__value">4</div>
            <div className="stat-card__label">Active Departments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#0ea5e9', background: '#e0f2fe' }}>
            <Target size={22} />
          </div>
          <div>
            <div className="stat-card__value">12 POs</div>
            <div className="stat-card__label">Program Outcomes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#10b981', background: '#d1fae5' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-card__value">80% / 20%</div>
            <div className="stat-card__label">Direct / Indirect Ratio</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#f59e0b', background: '#fef3c7' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-card__value">2.78</div>
            <div className="stat-card__label">Avg CO Attainment Level</div>
          </div>
        </div>
      </div>

      {/* Recent Calculation Runs */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Recent Attainment Calculation Runs</h3>
            <p>Traceability log of all executed NBA calculation engines.</p>
          </div>
          <Link to="/co-attainment" className="btn btn-outline" style={{ fontSize: '11px' }}>
            View Attainment Engine <ArrowRight size={13} />
          </Link>
        </div>

        <table className="audit-data-table">
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Course Name</th>
              <th>Programme</th>
              <th>Triggered By</th>
              <th>Direct Level</th>
              <th>Indirect Level</th>
              <th>Overall Attainment</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {calculationRuns.map((run) => (
              <tr key={run.id}>
                <td style={{ fontWeight: '700', color: '#2563eb' }}>{run.id}</td>
                <td style={{ fontWeight: '600' }}>{run.course}</td>
                <td>{run.programme}</td>
                <td>{run.triggeredBy}</td>
                <td style={{ textAlign: 'center' }}>
                  {run.directLevel !== '-' ? (
                    <span className="badge badge-level-3">Level {run.directLevel}</span>
                  ) : '—'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {run.indirectLevel !== '-' ? (
                    <span className="badge badge-level-2">Level {run.indirectLevel}</span>
                  ) : '—'}
                </td>
                <td style={{ textAlign: 'center', fontWeight: '800', color: '#1e293b' }}>
                  {run.overallAttainment}
                </td>
                <td>
                  <span className={`badge ${run.status === 'SUCCESS' ? 'badge-success' : 'badge-running'}`}>
                    {run.status}
                  </span>
                </td>
                <td style={{ fontSize: '11.5px', color: '#64748b' }}>{run.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
