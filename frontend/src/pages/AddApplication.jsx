import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';
import { createApplication } from '../services/api';
import { useToast } from '../components/Toast';

export const AddApplication = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Today's date in YYYY-MM-DD for the max attribute of date picker
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    companyName: '',
    jobRole: '',
    jobType: 'Full-time',
    appliedDate: todayStr,
    expectedSalary: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
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

    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Applied date is required.';
    } else {
      const selectedDate = new Date(formData.appliedDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.appliedDate = 'Applied date cannot be in the future.';
      }
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

    setSubmitting(true);
    setBackendError('');

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        jobRole: formData.jobRole.trim(),
        jobType: formData.jobType,
        appliedDate: formData.appliedDate,
        expectedSalary: formData.expectedSalary !== '' ? Number(formData.expectedSalary) : null,
        notes: formData.notes.trim(),
      };

      const res = await createApplication(payload);

      if (res.success) {
        toast.success(`Application created successfully! (ID: ${res.data.applicationId})`);
        navigate(`/applications/${res.data._id}`);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to submit application.';
      setBackendError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Track New Application
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Application ID will be auto-generated and initial status set to <strong>Applied</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Backend Error Alert (especially for 409 duplicate active application) */}
          {backendError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Submission Blocked</p>
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
                  placeholder="e.g. Infosys, Google, TCS"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
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
                  placeholder="e.g. Full Stack Developer"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
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
              {errors.jobType && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.jobType}
                </p>
              )}
            </div>

            {/* Applied Date */}
            <div>
              <label
                htmlFor="appliedDate"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Applied Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  id="appliedDate"
                  name="appliedDate"
                  max={todayStr}
                  value={formData.appliedDate}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.appliedDate
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Follow-up date will automatically be set to 7 days after this date.
              </p>
              {errors.appliedDate && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.appliedDate}
                </p>
              )}
            </div>

            {/* Expected Salary (Optional) */}
            <div className="sm:col-span-2">
              <label
                htmlFor="expectedSalary"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Expected Salary ($ / Year or Per Month - Optional)
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
                  placeholder="e.g. 75000"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
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

            {/* Notes (Optional) */}
            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Notes & Description (Optional)
              </label>
              <div className="relative">
                <textarea
                  id="notes"
                  name="notes"
                  rows="4"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add details such as referral contact, job portal link, preparation notes, or interview rounds..."
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Application...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApplication;
