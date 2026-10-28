import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  RefreshCw,
  Edit,
  Trash2,
  AlertTriangle,
  History,
  CheckCircle2,
} from 'lucide-react';
import { getApplicationById, updateApplicationStatus, deleteApplication } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import OverdueBadge from '../components/OverdueBadge';
import ChangeStatusModal from '../components/ChangeStatusModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useToast } from '../components/Toast';

export const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getApplicationById(id);
      if (res.success) {
        setApplication(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to retrieve application details.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleStatusUpdated = async (appId, newStatus) => {
    const res = await updateApplicationStatus(appId, newStatus);
    if (res.success) {
      toast.success(`Status updated to ${newStatus}`);
      fetchDetails();
    }
  };

  const handleConfirmDelete = async (appId) => {
    const res = await deleteApplication(appId);
    if (res.success) {
      toast.success('Application deleted successfully');
      navigate('/');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Loading application details...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 shadow-xs">
          <div className="flex items-center gap-3 mb-2 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Application Error</span>
          </div>
          <p className="text-sm text-rose-800 mb-4">{error || 'Application not found.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const isDeletable = ['Applied', 'Accepted', 'Rejected', 'Declined'].includes(application.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                {application.applicationId}
              </span>
              <StatusBadge status={application.status} />
              {application.isOverdue && <OverdueBadge />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {application.companyName}
            </h1>
            <p className="text-base text-slate-600 font-medium mt-0.5">
              {application.jobRole} &bull; <span className="text-slate-500 font-normal">{application.jobType}</span>
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs border border-purple-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Status</span>
            </button>

            <Link
              to={`/applications/${application._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={!isDeletable}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isDeletable
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer'
                  : 'bg-slate-50 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
              }`}
              title={isDeletable ? 'Delete application' : 'Cannot delete in Interview or Offer stages'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Applied Date
            </span>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{formatDate(application.appliedDate)}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Follow-up Date
            </span>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className={`w-4 h-4 ${application.isOverdue ? 'text-red-500' : 'text-slate-400'}`} />
              <span>{formatDate(application.followUpDate)}</span>
            </div>
            {application.isOverdue && (
              <span className="text-[11px] font-bold text-red-600 mt-1 block">
                7-day window passed
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Expected Salary
            </span>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>
                {application.expectedSalary !== null && application.expectedSalary !== undefined
                  ? `$${application.expectedSalary.toLocaleString()}`
                  : 'Not specified'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Job Category
            </span>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-purple-500" />
              <span>{application.jobType}</span>
            </div>
          </div>
        </div>

        {/* Notes section */}
        <div className="px-6 sm:px-8 pb-8 pt-2">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Notes & Details</span>
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {application.notes ? application.notes : 'No specific notes recorded for this application.'}
            </p>
          </div>
        </div>
      </div>

      {/* Vertical Status History Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
          <History className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Status Transition History Timeline
          </h2>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {application.statusHistory && application.statusHistory.length > 0 ? (
            application.statusHistory.map((item, index) => {
              const dt = formatDateTime(item.changedAt);
              const isLatest = index === application.statusHistory.length - 1;

              return (
                <div key={index} className="relative group">
                  {/* Timeline Dot Marker */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isLatest
                        ? 'bg-indigo-600 border-white ring-4 ring-indigo-100'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isLatest ? 'bg-white' : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  {/* Timeline Content */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 group-hover:border-slate-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.status} size="sm" />
                        {isLatest && (
                          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">
                            (Current Status)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {dt.date} &bull; {dt.time}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">
                      {index === 0
                        ? 'Application registered and placed in initial Applied stage.'
                        : `Transitioned successfully to ${item.status}.`}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">No status history available.</p>
          )}
        </div>
      </div>

      {/* Modals */}
      <ChangeStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        application={application}
        onStatusUpdated={handleStatusUpdated}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        application={application}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default ApplicationDetails;
