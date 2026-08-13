import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';
import "/Users/rajshaikh/Desktop/dypiu-nba-attainment-frontend/src/index.css";

export default function DeleteConfirmModal({
  isOpen,
  title = 'Delete Item?',
  itemName,
  description = 'This action cannot be undone. All data associated with this item will be permanently removed.',
  confirmText = 'Delete',
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="delete-confirm-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="delete-confirm-modal__dialog">
        <div className="delete-confirm-modal__content">
          <div className="delete-confirm-modal__icon-wrapper">
            <Trash2
              size={20}
              className="delete-confirm-modal__icon"
            />
          </div>

          <h3 className="delete-confirm-modal__title">
            {title}
          </h3>

          {itemName && (
            <p className="delete-confirm-modal__item-name">
              {itemName}
            </p>
          )}

          <p className="delete-confirm-modal__description">
            {description}
          </p>
        </div>

        <div className="delete-confirm-modal__actions">
          <button
            type="button"
            onClick={onClose}
            className="delete-confirm-modal__cancel-button"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="delete-confirm-modal__confirm-button"
          >
            <Trash2 size={13} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}