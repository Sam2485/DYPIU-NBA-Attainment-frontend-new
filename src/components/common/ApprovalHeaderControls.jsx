import React from 'react';
import { Check, RefreshCw } from 'lucide-react';
import RequestRevisionCard from './RequestRevisionCard';
import "/Users/rajshaikh/Desktop/dypiu-nba-attainment-frontend/src/index.css";

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
  className = '',
}) {
  const isApproved = status === 'APPROVED' || status === 'VERIFIED';
  const isNeedsRevision =
    status === 'REVISION_REQUESTED' || status === 'REJECTED';

  if (showCardOnly) {
    if (!isNeedsRevision) return null;

    return (
      <RequestRevisionCard
        title={revisionCardTitle}
        requestedBy={revisionCardRequestedBy}
        remarks={revisionCardRemarks}
        actionText={revisionCardActionText}
      />
    );
  }

  return (
    <div className={`approval-header-controls ${className}`}>
      {!showCardOnly && (
        <div className="approval-header-controls__actions">
          {/* Approve Button */}
          <button
            type="button"
            disabled={isApproved}
            onClick={isApproved ? (e) => e.preventDefault() : onApprove}
            title={
              isApproved
                ? 'Submission is already approved'
                : 'Click to approve'
            }
            className={`approval-header-controls__approve-button ${
              isApproved
                ? 'approval-header-controls__approve-button--approved'
                : ''
            }`}
          >
            <Check size={15} />
            {isApproved ? approvedText : approveText}
          </button>

          {/* Request Revision Button */}
          <button
            type="button"
            onClick={onRequestRevision}
            className={`approval-header-controls__revision-button ${
              isNeedsRevision
                ? 'approval-header-controls__revision-button--requested'
                : ''
            }`}
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