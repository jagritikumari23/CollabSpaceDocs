'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  onConfirm: () => Promise<void>;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Document">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-900">Are you sure?</p>
            <p className="text-red-700 text-xs mt-0.5">
              This will permanently delete{' '}
              <span className="font-semibold text-red-900">&ldquo;{documentTitle}&rdquo;</span>.
              This action cannot be undone.
            </p>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
