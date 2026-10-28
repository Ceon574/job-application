import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ALLOWED_TRANSITIONS = {
  Applied: ['Interview', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: ['Accepted', 'Declined'],
  Accepted: [],
  Rejected: [],
  Declined: [],
};

export const ChangeStatusModal = ({ isOpen, onClose, application, onStatusUpdated }) => {
  if (!isOpen || !application) return null;

  const currentStatus = application.status;
  const validNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
  const isFinalStatus = validNextStatuses.length === 0;

  const [selectedStatus, setSelectedStatus] = useState(validNextStatuses[0] || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setLoading(true);
    setError('');

    try {
      await onStatusUpdated(application._id, selectedStatus);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to update status. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Change Application Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {application.applicationId} &bull; {application.companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Current Status
            </label>
            <div className="flex items-center gap-2">
              <StatusBadge status={currentStatus} />
              {isFinalStatus && (
                <span className="text-xs text-slate-500 italic">
                  (Final status &mdash; cannot be transitioned further)
                </span>
              )}
            </div>
          </div>

          {!isFinalStatus ? (
            <div className="mb-6">
              <label
                htmlFor="newStatusSelect"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Select Next Valid Status
              </label>
              <select
                id="newStatusSelect"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {validNextStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Workflow Path: </span>
                {currentStatus} <ArrowRight className="inline w-3 h-3 text-slate-400 mx-1" />{' '}
                <span className="font-semibold text-indigo-600">{selectedStatus || 'Select'}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mb-6">
              Applications with status <strong>{currentStatus}</strong> have reached their conclusive stage and cannot be modified.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            {!isFinalStatus && (
              <button
                type="submit"
                disabled={loading || !selectedStatus}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Change</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeStatusModal;
