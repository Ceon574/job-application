import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const DeleteConfirmModal = ({ isOpen, onClose, application, onConfirmDelete }) => {
  if (!isOpen || !application) return null;

  const isProtectedStatus = ['Interview', 'Offer'].includes(application.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (isProtectedStatus) return;

    setLoading(true);
    setError('');

    try {
      await onConfirmDelete(application._id);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to delete application.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900">Delete Application</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Application ID: <span className="text-slate-800">{application.applicationId}</span>
            </div>
            <div className="text-base font-bold text-slate-900 mb-1">
              {application.companyName}
            </div>
            <div className="text-xs text-slate-600 mb-3">
              {application.jobRole} &bull; {application.jobType}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Status:</span>
              <StatusBadge status={application.status} size="sm" />
            </div>
          </div>

          {isProtectedStatus ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Deletion Restricted</p>
                <p className="mt-0.5 text-amber-800">
                  Applications in <strong>{application.status}</strong> status cannot be deleted according to policy.
                  Please update the status to a final stage (Accepted, Rejected, or Declined) if you wish to remove it later.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete this application? This action cannot be undone. Note that the sequence counter will not be reset.
            </p>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            {!isProtectedStatus && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Application</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
