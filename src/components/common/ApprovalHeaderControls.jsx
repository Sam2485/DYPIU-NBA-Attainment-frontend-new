import React from 'react';
import { Check, RefreshCw } from 'lucide-react';
import RequestRevisionCard from './RequestRevisionCard';

export default function ApprovalHeaderControls({
  status,
  onApprove,
  onRequestRevision,
  approveText = 'Approve',
  approvedText = 'Approved',
  requestRevisionText = 'Request Revision',
  editRevisionText = 'Edit Revision Request',
  revisionCardTitle = 'Revision Requested for Programme Allocations',
  revisionCardRequestedBy = 'Head of Department (HOD)',
  revisionCardRemarks = 'Please review and re-assign Course Coordinators as per HOD notes.',
  revisionCardActionText = 'The Programme Coordinator has been notified to revise the Course Coordinator assignments.',
  showButtonsOnly = false,
  showCardOnly = false,
  style = {},
}) {
  const isApproved = status === 'APPROVED' || status === 'VERIFIED';
  const isNeedsRevision = status === 'REVISION_REQUESTED' || status === 'REJECTED';

  if (showCardOnly) {
    if (!isNeedsRevision) return null;
    return (
      <RequestRevisionCard
        title={revisionCardTitle}
        requestedBy={revisionCardRequestedBy}
        remarks={revisionCardRemarks}
        actionText={revisionCardActionText}
        style={style}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', ...style }}>
      {!showCardOnly && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Approve Button */}
          <button
            type="button"
            onClick={onApprove}
            style={{
              height: '38px',
              padding: '0 18px',
              fontSize: '12.5px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: isApproved ? '#16a34a' : '#059669',
              color: '#ffffff',
              boxShadow: isApproved ? '0 0 0 3px rgba(187,247,208,0.6)' : 'none',
            }}
          >
            <Check size={15} />
            {isApproved ? approvedText : approveText}
          </button>

          {/* Request Revision Button */}
          <button
            type="button"
            onClick={onRequestRevision}
            style={{
              height: '38px',
              padding: '0 16px',
              fontSize: '12.5px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: isNeedsRevision ? '#fee2e2' : '#fef2f2',
              color: '#dc2626',
              border: `1.5px solid ${isNeedsRevision ? '#fca5a5' : '#fecaca'}`,
            }}
          >
            <RefreshCw size={14} />
            {isNeedsRevision ? editRevisionText : requestRevisionText}
          </button>
        </div>
      )}

      {/* Revision Card */}
      {!showButtonsOnly && isNeedsRevision && (
        <RequestRevisionCard
          title={revisionCardTitle}
          requestedBy={revisionCardRequestedBy}
          remarks={revisionCardRemarks}
          actionText={revisionCardActionText}
        />
      )}
    </div>
  );
}
