import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import {
  generateApplicationId,
  calculateFollowUpDate,
  validateStatusTransition,
  validateDeletion,
  escapeRegex,
  ACTIVE_STATUSES,
  STATUS_LIST,
} from '../utils/helpers.js';
import { getDBStatus, connectDB } from '../config/db.js';

/**
 * Health check endpoint
 * GET /api/health
 */
export const getHealth = async (req, res) => {
  await connectDB();
  const dbStatus = getDBStatus();
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
  });
};

/**
 * Create a new job application
 * POST /api/applications
 */
export const createApplication = async (req, res, next) => {
  try {
    const { companyName, jobRole, jobType, appliedDate, expectedSalary, notes } = req.body;

    // Validate required fields
    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required.',
      });
    }

    if (!jobRole || !jobRole.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required.',
      });
    }

    if (!jobType || !['Full-time', 'Internship', 'Contract'].includes(jobType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid job type is required (Full-time, Internship, or Contract).',
      });
    }

    if (!appliedDate) {
      return res.status(400).json({
        success: false,
        message: 'Applied date is required.',
      });
    }

    // Validate appliedDate is not in the future
    const parsedAppliedDate = new Date(appliedDate);
    if (isNaN(parsedAppliedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Applied date is not a valid date.',
      });
    }

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (parsedAppliedDate > endOfToday) {
      return res.status(400).json({
        success: false,
        message: 'Applied date cannot be in the future.',
      });
    }

    // Validate expectedSalary if provided
    let parsedSalary = null;
    if (expectedSalary !== undefined && expectedSalary !== null && expectedSalary !== '') {
      parsedSalary = Number(expectedSalary);
      if (isNaN(parsedSalary) || parsedSalary < 0) {
        return res.status(400).json({
          success: false,
          message: 'Expected salary must be a non-negative number.',
        });
      }
    }

    const trimmedCompany = companyName.trim();
    const trimmedRole = jobRole.trim();

    // Check for active duplicate application
    const existingActive = await Application.findOne({
      companyName: { $regex: new RegExp(`^${escapeRegex(trimmedCompany)}$`, 'i') },
      jobRole: { $regex: new RegExp(`^${escapeRegex(trimmedRole)}$`, 'i') },
      status: { $in: ACTIVE_STATUSES },
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: `An active application for "${trimmedCompany}" with role "${trimmedRole}" already exists (Current status: ${existingActive.status}, ID: ${existingActive.applicationId}). You can apply again once the existing application reaches a final status (Accepted, Rejected, or Declined).`,
      });
    }

    // Generate concurrency-safe business Application ID
    const applicationId = await generateApplicationId(trimmedCompany);

    // Calculate follow-up date (strictly 7 days after applied date)
    const followUpDate = calculateFollowUpDate(parsedAppliedDate);

    // Initial status is ALWAYS Applied
    const initialStatus = 'Applied';
    const now = new Date();

    const application = new Application({
      applicationId,
      companyName: trimmedCompany,
      jobRole: trimmedRole,
      jobType,
      appliedDate: parsedAppliedDate,
      expectedSalary: parsedSalary,
      notes: notes ? notes.trim() : '',
      status: initialStatus,
      followUpDate,
      statusHistory: [
        {
          status: initialStatus,
          changedAt: now,
        },
      ],
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Job application created successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applications with search and status filtering
 * GET /api/applications?search=...&status=...
 */
export const getApplications = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    // Search by company name (case-insensitive substring)
    if (search && search.trim()) {
      filter.companyName = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    // Filter by status
    if (status && status.trim() && status !== 'All') {
      filter.status = status.trim();
    }

    const applications = await Application.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully.',
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get application statistics
 * GET /api/applications/stats
 */
export const getApplicationStats = async (req, res, next) => {
  try {
    const stats = {
      total: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Accepted: 0,
      Rejected: 0,
      Declined: 0,
      overdue: 0,
    };

    const applications = await Application.find({}, 'status followUpDate');

    stats.total = applications.length;

    const now = new Date();
    applications.forEach((app) => {
      if (stats[app.status] !== undefined) {
        stats[app.status] += 1;
      }
      if (app.status === 'Applied' && app.followUpDate && now > new Date(app.followUpDate)) {
        stats.overdue += 1;
      }
    });

    res.status(200).json({
      success: true,
      message: 'Application statistics retrieved successfully.',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single application by MongoDB _id
 * GET /api/applications/:id
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Application not found with the provided ID.',
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found with the provided ID.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application details retrieved successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update editable application fields
 * PUT /api/applications/:id
 */
export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const { companyName, jobRole, jobType, expectedSalary, notes } = req.body;

    // Validate fields if provided
    if (companyName !== undefined && !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name cannot be empty.',
      });
    }

    if (jobRole !== undefined && !jobRole.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job role cannot be empty.',
      });
    }

    if (jobType !== undefined && !['Full-time', 'Internship', 'Contract'].includes(jobType)) {
      return res.status(400).json({
        success: false,
        message: 'Job type must be Full-time, Internship, or Contract.',
      });
    }

    let parsedSalary = application.expectedSalary;
    if (expectedSalary !== undefined) {
      if (expectedSalary === null || expectedSalary === '') {
        parsedSalary = null;
      } else {
        const num = Number(expectedSalary);
        if (isNaN(num) || num < 0) {
          return res.status(400).json({
            success: false,
            message: 'Expected salary must be a non-negative number.',
          });
        }
        parsedSalary = num;
      }
    }

    const targetCompany = companyName !== undefined ? companyName.trim() : application.companyName;
    const targetRole = jobRole !== undefined ? jobRole.trim() : application.jobRole;

    // Check if new company/role conflicts with another active application
    if (ACTIVE_STATUSES.includes(application.status)) {
      const duplicate = await Application.findOne({
        _id: { $ne: application._id },
        companyName: { $regex: new RegExp(`^${escapeRegex(targetCompany)}$`, 'i') },
        jobRole: { $regex: new RegExp(`^${escapeRegex(targetRole)}$`, 'i') },
        status: { $in: ACTIVE_STATUSES },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Cannot update: An active application for "${targetCompany}" with role "${targetRole}" already exists (ID: ${duplicate.applicationId}).`,
        });
      }
    }

    // Apply allowed updates only (preserve applicationId, appliedDate, followUpDate, status, statusHistory)
    if (companyName !== undefined) application.companyName = targetCompany;
    if (jobRole !== undefined) application.jobRole = targetRole;
    if (jobType !== undefined) application.jobType = jobType;
    application.expectedSalary = parsedSalary;
    if (notes !== undefined) application.notes = notes.trim();

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change application status
 * PATCH /api/applications/:id/status
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'New status is required.',
      });
    }

    // Validate transition
    const validation = validateStatusTransition(application.status, newStatus);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    // Append to status history
    application.status = newStatus;
    application.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: `Status updated successfully to '${newStatus}'.`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete application (only allowed for Applied, Accepted, Rejected, Declined)
 * DELETE /api/applications/:id
 */
export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Validate deletion rule
    const deletionCheck = validateDeletion(application.status);
    if (!deletionCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: deletionCheck.error,
      });
    }

    await Application.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully.',
      data: {
        id: application._id,
        applicationId: application.applicationId,
      },
    });
  } catch (error) {
    next(error);
  }
};
