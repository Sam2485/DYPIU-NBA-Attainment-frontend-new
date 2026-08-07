import { useState } from 'react';
import { BarChart3, Award, Calculator, Sparkles } from 'lucide-react';
import COAttainmentEngine from './COAttainmentEngine';
import POPSOAttainmentEngine from '../poPsoAttainment/POPSOAttainmentEngine';

export default function AttainmentOverviewHub() {
  const [activeTab, setActiveTab] = useState('co'); // 'co', 'po_pso'

  return (
    <div className="animated-page">
      {/* Top Banner Header */}
      <div className="banner-dark-gradient" style={{ marginBottom: '20px' }}>
        <div className="banner-content-row">
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Attainment Overview Hub
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
              Combined Course Attainment (Direct & Indirect) and PO/PSO Attainment Aggregations
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn ${activeTab === 'co' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('co')}
              style={{ gap: '6px', fontSize: '12.5px', fontWeight: '700' }}
            >
              <BarChart3 size={15} /> 1. CO Attainment Engine
            </button>
            <button
              className={`btn ${activeTab === 'po_pso' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('po_pso')}
              style={{ gap: '6px', fontSize: '12.5px', fontWeight: '700' }}
            >
              <Award size={15} /> 2. CO to PO & PSO Attainment
            </button>
          </div>
        </div>
      </div>

      {/* Render Selected View (Overview Mode: No Footer Navigation Buttons) */}
      {activeTab === 'co' ? <COAttainmentEngine hideFooter={true} /> : <POPSOAttainmentEngine hideFooter={true} />}
    </div>
  );
}
