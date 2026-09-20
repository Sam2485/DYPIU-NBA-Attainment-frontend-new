import { useState } from 'react';
import { Archive, BarChart3 } from 'lucide-react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import ReportsHub from '../../features/reports/ReportsHub';
import GeneratedReportsPage from './GeneratedReportsPage';

export default function IqacReportsPage() {
  const [activeView, setActiveView] = useState('hub'); // 'hub' | 'artifacts'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ flex: 1, minWidth: 0 }}>
        <AppHeader
          title="Reports Hub"
          subtitle="IQAC Institutional Governance & Quality Assurance"
        />
        <div className="page-container">
          {/* Top Switcher: Interactive Reports Hub vs Generated Artifacts Archive */}
          <div
            className="print:hidden"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                background: '#e2e8f0',
                padding: '4px',
                borderRadius: '10px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveView('hub')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: activeView === 'hub' ? '#ffffff' : 'transparent',
                  color: activeView === 'hub' ? '#4f46e5' : '#64748b',
                  boxShadow: activeView === 'hub' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                <BarChart3 size={15} /> Reports Hub & Verification
              </button>
              <button
                type="button"
                onClick={() => setActiveView('artifacts')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: activeView === 'artifacts' ? '#ffffff' : 'transparent',
                  color: activeView === 'artifacts' ? '#4f46e5' : '#64748b',
                  boxShadow: activeView === 'artifacts' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                <Archive size={15} /> Persisted Artifacts Archive
              </button>
            </div>
          </div>

          {activeView === 'hub' ? (
            <ReportsHub />
          ) : (
            <GeneratedReportsPage isEmbedded />
          )}
        </div>
      </main>
    </div>
  );
}
