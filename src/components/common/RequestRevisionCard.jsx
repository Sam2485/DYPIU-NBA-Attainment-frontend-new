import React from 'react';
import "/Users/rajshaikh/Desktop/dypiu-nba-attainment-frontend/src/index.css";
import {
  AlertCircle,
  UserCheck,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

export default function RequestRevisionCard({
  title = 'Revision Requested',
  requestedBy = 'HOD / Verifier',
  remarks = 'Please review and update the details as requested.',
  actionText = 'Please revise the details and resubmit for approval.',
  onAction,
  actionButtonText = 'Revise & Update',
}) {
  return (
    <div className="request-revision-card">
      <div className="request-revision-card__content">
        <div className="request-revision-card__details">
          <div className="request-revision-card__header">
            <span className="request-revision-card__status">
              <AlertCircle size={13} />
              {title}
            </span>

            {requestedBy && (
              <span className="request-revision-card__requested-by">
                <UserCheck size={13} />
                By {requestedBy}
              </span>
            )}
          </div>

          <div className="request-revision-card__remarks">
            <strong className="request-revision-card__remarks-label">
              <MessageSquare size={13} />
              Remarks:
            </strong>{' '}
            {remarks}
          </div>

          {actionText && (
            <p className="request-revision-card__action-note">
              💡 {actionText}
            </p>
          )}
        </div>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="request-revision-card__action-button"
          >
            <RefreshCw size={13} />
            {actionButtonText}
          </button>
        )}
      </div>
    </div>
  );
}