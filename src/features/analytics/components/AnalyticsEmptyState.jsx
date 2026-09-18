import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';

export default function AnalyticsEmptyState({
  hasActiveBatches = true,
  selectedSchoolName = null,
  selectedProgrammeName = null,
}) {
  let message = 'All active programme batches are currently meeting their evaluated PO/PSO targets.';
  let isAllGood = true;

  if (!hasActiveBatches) {
    message = 'No active programme batches found.';
    isAllGood = false;
  } else if (selectedProgrammeName) {
    message = `No active batches requiring attention in ${selectedProgrammeName}.`;
  } else if (selectedSchoolName) {
    message = `No active batches requiring attention in ${selectedSchoolName}.`;
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        marginTop: 24,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 50,
          background: isAllGood ? '#ecfdf5' : '#f8fafc',
          color: isAllGood ? '#10b981' : '#64748b',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {isAllGood ? <CheckCircle2 size={30} /> : <Info size={30} />}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#0f172a',
          maxWidth: 480,
          lineHeight: 1.4,
        }}
      >
        {message}
      </div>
    </div>
  );
}
