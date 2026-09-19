import { useSearchParams } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import ProgrammeATR from '../features/atr/ProgrammeATR';

export default function ProgrammeATRPage() {
  const [searchParams] = useSearchParams();
  const programmeBatchId = searchParams.get('programmeBatchId');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Programme Action Taken Report (ATR)" subtitle="PO & PSO Attainment Analysis & Action Plans" />
        <div className="page-container">
          {programmeBatchId ? (
            <ProgrammeATR
              readOnly
              hideFooter={true}
              hideHeader={false}
              showBatchSelector={false}
              showHeaderActions={false}
              batchId={programmeBatchId}
              useBatchApprovalWorkspace={true}
            />
          ) : (
            <ProgrammeATR />
          )}
        </div>
      </main>
    </div>
  );
}
