import { useEffect } from 'react';
import { Building2, GraduationCap, Landmark, Users } from 'lucide-react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import { useAcademic } from '../../context/AcademicContext';
import { useUser } from '../../context/user';

const metricStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  padding: 20,
  boxShadow: '0 8px 24px rgba(15,23,42,.05)',
};

export default function IqacDashboardPage() {
  const { users = [], refreshUsers = () => Promise.resolve([]) } = useUser();
  const {
    schools = [], departments = [], masterProgrammes = [],
    loadSchools = () => Promise.resolve([]),
    loadDepartments = () => Promise.resolve([]),
    loadMasterProgrammes = () => Promise.resolve([]),
  } = useAcademic();

  useEffect(() => {
    Promise.all([refreshUsers(), loadSchools(), loadDepartments(), loadMasterProgrammes()]).catch(() => {});
  }, [loadDepartments, loadMasterProgrammes, loadSchools, refreshUsers]);

  const metrics = [
    { label: 'Institutional Users', value: users.length, icon: Users, color: '#4f46e5', note: 'Active role assignments' },
    { label: 'Schools', value: schools.length, icon: Landmark, color: '#0369a1', note: 'Registered academic schools' },
    { label: 'Departments', value: departments.length, icon: Building2, color: '#059669', note: 'Academic departments' },
    { label: 'Programmes', value: masterProgrammes.length, icon: GraduationCap, color: '#d97706', note: 'Master programmes configured' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <div className="page-container">
          <section style={{ marginBottom: 22 }}>
            <p style={{ margin: 0, color: '#4f46e5', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>IQAC Control Centre</p>
            <h2 style={{ margin: '5px 0 6px', color: '#0f172a', fontSize: 26 }}>Analytics overview</h2>
            <p style={{ margin: 0, color: '#64748b' }}>A live summary of the OBE institutional setup and user access.</p>
          </section>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
            {metrics.map(({ label, value, icon: MetricIcon, color, note }) => (
              <article key={label} style={metricStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ color: '#64748b', fontSize: 13, fontWeight: 700 }}>{label}</span>
                  <span style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, color, display: 'grid', placeItems: 'center' }}><MetricIcon size={19} /></span>
                </div>
                <strong style={{ display: 'block', marginTop: 18, color: '#0f172a', fontSize: 32 }}>{value}</strong>
                <span style={{ display: 'block', marginTop: 4, color: '#94a3b8', fontSize: 12 }}>{note}</span>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
