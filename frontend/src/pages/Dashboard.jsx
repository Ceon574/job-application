import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  RefreshCw,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { getApplications, getApplicationStats, deleteApplication, updateApplicationStatus } from '../services/api';
import StatsCards from '../components/StatsCards';
import StatusBadge from '../components/StatusBadge';
import OverdueBadge from '../components/OverdueBadge';
import ChangeStatusModal from '../components/ChangeStatusModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useToast } from '../components/Toast';

export const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [deleteModalApp, setDeleteModalApp] = useState(null);

  // Fetch stats from backend
  const fetchStats = useCallback(async () => {
    try {
      const res = await getApplicationStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch applications from backend with search and status params
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }

      const res = await getApplications(params);
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Error connecting to server. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  // Handle status update
  const handleStatusUpdated = async (id, newStatus) => {
    const res = await updateApplicationStatus(id, newStatus);
    if (res.success) {
      toast.success(`Application status updated to ${newStatus}`);
      fetchApplications();
      fetchStats();
    }
  };

  // Handle delete
  const handleConfirmDelete = async (id) => {
    const res = await deleteApplication(id);
    if (res.success) {
      toast.success('Application deleted successfully');
      fetchApplications();
      fetchStats();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Job Application Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track, manage, and optimize your job hunting pipeline in one place.
          </p>
        </div>

        <Link
          to="/applications/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <StatsCards
        stats={stats}
        currentFilter={statusFilter}
        onSelectFilter={(filterKey) => setStatusFilter(filterKey)}
      />

      {/* Filter and Search Bar Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search applications by company name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Declined">Declined</option>
            </select>

            {(statusFilter !== 'All' || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setSearchTerm('');
                }}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="inline-block w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-600">Loading job applications from MongoDB Atlas...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 shadow-xs">
          <div className="flex items-center gap-3 mb-2 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Connection or Server Error</span>
          </div>
          <p className="text-sm text-rose-800 mb-4">{error}</p>
          <button
            onClick={() => {
              fetchApplications();
              fetchStats();
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Applications Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            {searchTerm || statusFilter !== 'All'
              ? 'No applications match your current search or status filter. Try clearing the filters.'
              : "You haven't tracked any job applications yet. Start adding your applications to monitor follow-ups and interview progress."}
          </p>
          {searchTerm || statusFilter !== 'All' ? (
            <button
              onClick={() => {
                setStatusFilter('All');
                setSearchTerm('');
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              to="/applications/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Application</span>
            </Link>
          )}
        </div>
      ) : (
        /* Responsive Table & Card View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">App ID</th>
                  <th className="py-3.5 px-4">Company & Role</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Job Type</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Applied Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Follow-up</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {applications.map((app) => {
                  const isDeletable = ['Applied', 'Accepted', 'Rejected', 'Declined'].includes(
                    app.status
                  );

                  return (
                    <tr
                      key={app._id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Application ID */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <Link
                          to={`/applications/${app._id}`}
                          className="font-mono text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {app.applicationId}
                        </Link>
                      </td>

                      {/* Company & Role */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          <Link to={`/applications/${app._id}`}>
                            {app.companyName}
                          </Link>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{app.jobRole}</span>
                          <span className="md:hidden text-slate-300">&bull;</span>
                          <span className="md:hidden font-medium text-slate-600">{app.jobType}</span>
                        </div>
                      </td>

                      {/* Job Type (md+) */}
                      <td className="py-4 px-4 hidden md:table-cell whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          {app.jobType}
                        </span>
                      </td>

                      {/* Applied Date */}
                      <td className="py-4 px-4 hidden sm:table-cell whitespace-nowrap text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(app.appliedDate)}</span>
                        </div>
                      </td>

                      {/* Status & Overdue badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={app.status} size="sm" />
                          {app.isOverdue && <OverdueBadge size="sm" />}
                        </div>
                      </td>

                      {/* Follow-up info (lg+) */}
                      <td className="py-4 px-4 hidden lg:table-cell whitespace-nowrap text-xs">
                        <div className="text-slate-600">
                          {formatDate(app.followUpDate)}
                        </div>
                        {app.isOverdue && (
                          <span className="text-[10px] font-semibold text-rose-600">
                            Action required
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <Link
                            to={`/applications/${app._id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit Application */}
                          <Link
                            to={`/applications/${app._id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Application"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Change Status */}
                          <button
                            type="button"
                            onClick={() => setStatusModalApp(app)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Change Status"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Delete Application */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalApp(app)}
                            disabled={!isDeletable}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDeletable
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-300 cursor-not-allowed opacity-50'
                            }`}
                            title={
                              isDeletable
                                ? 'Delete Application'
                                : `Cannot delete while in ${app.status} stage`
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{applications.length}</strong> of <strong>{stats?.total ?? applications.length}</strong> applications
            </span>
            <span>Real-time Atlas Sync</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ChangeStatusModal
        isOpen={Boolean(statusModalApp)}
        onClose={() => setStatusModalApp(null)}
        application={statusModalApp}
        onStatusUpdated={handleStatusUpdated}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteModalApp)}
        onClose={() => setDeleteModalApp(null)}
        application={deleteModalApp}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default Dashboard;
