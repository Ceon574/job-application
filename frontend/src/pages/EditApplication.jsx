import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Lock,
  Save,
  Calendar,
} from 'lucide-react';
import { getApplicationById, updateApplication } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

export const EditApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [backendError, setBackendError] = useState('');
  const [errors, setErrors] = useState({});

  const [initialData, setInitialData] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    jobRole: '',
    jobType: 'Full-time',
    expectedSalary: '',
    notes: '',
  });

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await getApplicationById(id);
        if (res.success) {
          const app = res.data;
          setInitialData(app);
          setFormData({
            companyName: app.companyName || '',
            jobRole: app.jobRole || '',
            jobType: app.jobType || 'Full-time',
            expectedSalary:
              app.expectedSalary !== null && app.expectedSalary !== undefined
                ? String(app.expectedSalary)
                : '',
            notes: app.notes || '',
          });
        }
      } catch (err) {
        setLoadError(
          err.response?.data?.message || err.message || 'Failed to load application for editing.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (backendError) {
      setBackendError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required.';
    }

    if (!formData.jobRole.trim()) {
      newErrors.jobRole = 'Job role is required.';
    }

    if (!formData.jobType) {
      newErrors.jobType = 'Job type is required.';
    }

    if (formData.expectedSalary !== '') {
      const salary = Number(formData.expectedSalary);
      if (isNaN(salary) || salary < 0) {
        newErrors.expectedSalary = 'Expected salary must be a positive number or zero.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setBackendError('');

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        jobRole: formData.jobRole.trim(),
        jobType: formData.jobType,
        expectedSalary: formData.expectedSalary !== '' ? Number(formData.expectedSalary) : null,
        notes: formData.notes.trim(),
      };

      const res = await updateApplication(id, payload);

      if (res.success) {
        toast.success('Application updated successfully!');
        navigate(`/applications/${id}`);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to update application.';
      setBackendError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Loading application details...</p>
      </div>
    );
  }

  if (loadError || !initialData) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 shadow-xs">
          <div className="flex items-center gap-3 mb-2 font-bold text-base">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Error Loading Application</span>
          </div>
          <p className="text-sm text-rose-800 mb-4">{loadError || 'Application not found.'}</p>
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to={`/applications/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Application Details</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Edit Application
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Update job details, salary expectations, or notes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                {initialData.applicationId}
              </span>
              <StatusBadge status={initialData.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Read-Only Notice Box */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1 text-amber-800">
              <Lock className="w-4 h-4" />
              <span>Immutable Parameters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-amber-200/60 text-slate-700">
              <div>
                <span className="font-semibold text-slate-500 block">Application ID:</span>
                <span className="font-mono font-bold">{initialData.applicationId}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Applied Date:</span>
                <span className="font-medium">{formatDate(initialData.appliedDate)}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Current Status:</span>
                <span className="font-medium">{initialData.status} (use Change Status)</span>
              </div>
            </div>
          </div>

          {/* Backend Error (e.g., 409 duplicate active application) */}
          {backendError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cannot Update Application</p>
                <p className="mt-0.5 text-xs leading-relaxed">{backendError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.companyName
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.companyName && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.companyName}
                </p>
              )}
            </div>

            {/* Job Role */}
            <div>
              <label
                htmlFor="jobRole"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Job Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="jobRole"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.jobRole
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.jobRole && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.jobRole}
                </p>
              )}
            </div>

            {/* Job Type */}
            <div>
              <label
                htmlFor="jobType"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Job Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* Expected Salary */}
            <div>
              <label
                htmlFor="expectedSalary"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Expected Salary ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  id="expectedSalary"
                  name="expectedSalary"
                  min="0"
                  step="500"
                  value={formData.expectedSalary}
                  onChange={handleChange}
                  placeholder="Optional"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.expectedSalary
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.expectedSalary && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.expectedSalary}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Notes & Description
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Update notes, links, or follow-up details..."
                className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to={`/applications/${id}`}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditApplication;
