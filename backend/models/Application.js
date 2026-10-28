import mongoose from 'mongoose';
import { STATUS_LIST, computeIsOverdue } from '../utils/helpers.js';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: STATUS_LIST,
    },
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: {
        values: ['Full-time', 'Internship', 'Contract'],
        message: '{VALUE} is not a valid job type. Must be Full-time, Internship, or Contract.',
      },
    },
    appliedDate: {
      type: Date,
      required: [true, 'Applied date is required'],
      validate: {
        validator: function (val) {
          if (!val) return false;
          // Disallow future applied date (allow up to end of today)
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return new Date(val) <= today;
        },
        message: 'Applied date cannot be in the future.',
      },
    },
    expectedSalary: {
      type: Number,
      min: [0, 'Expected salary must be a non-negative number'],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: STATUS_LIST,
      default: 'Applied',
    },
    followUpDate: {
      type: Date,
      required: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for dynamic isOverdue calculation
applicationSchema.virtual('isOverdue').get(function () {
  return computeIsOverdue(this.status, this.followUpDate);
});

// Indexes for fast searching and filtering
applicationSchema.index({ companyName: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ companyName: 1, jobRole: 1, status: 1 });

export const Application = mongoose.model('Application', applicationSchema);
