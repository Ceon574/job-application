import { Counter } from '../models/Counter.js';

export const STATUS_LIST = ['Applied', 'Interview', 'Offer', 'Accepted', 'Rejected', 'Declined'];
export const ACTIVE_STATUSES = ['Applied', 'Interview', 'Offer'];
export const FINAL_STATUSES = ['Accepted', 'Rejected', 'Declined'];
export const DELETABLE_STATUSES = ['Applied', 'Accepted', 'Rejected', 'Declined'];
export const NON_DELETABLE_STATUSES = ['Interview', 'Offer'];

export const ALLOWED_TRANSITIONS = {
  Applied: ['Interview', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: ['Accepted', 'Declined'],
  Accepted: [],
  Rejected: [],
  Declined: [],
};

/**
 * Extracts a 3-letter uppercase prefix from a company name with documented fallback.
 * 
 * Rules:
 * 1. Filter out all non-alphabetic characters and convert to uppercase.
 * 2. If 3 or more letters, take the first 3 letters (e.g., "Infosys" -> "INF", "Google" -> "GOO").
 * 3. If 1 or 2 letters, pad with 'X' up to 3 letters (e.g., "HP" -> "HPX", "3M" -> "MXX").
 * 4. If 0 letters (e.g., "123", "!@#"), fallback to default prefix "APP".
 */
export const getCompanyPrefix = (companyName) => {
  if (!companyName || typeof companyName !== 'string') {
    return 'APP';
  }

  const lettersOnly = companyName.replace(/[^a-zA-Z]/g, '').toUpperCase();

  if (lettersOnly.length >= 3) {
    return lettersOnly.slice(0, 3);
  }

  if (lettersOnly.length > 0) {
    return lettersOnly.padEnd(3, 'X');
  }

  return 'APP';
};

/**
 * Generates a unique, concurrency-safe Application ID using MongoDB atomic $inc.
 * Format: JA-<PREFIX>-<SEQ> (e.g., JA-INF-001)
 */
export const generateApplicationId = async (companyName) => {
  const prefix = getCompanyPrefix(companyName);

  // Atomically increment the sequence for this prefix
  const counter = await Counter.findByIdAndUpdate(
    prefix,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const sequenceFormatted = String(counter.seq).padStart(3, '0');
  return `JA-${prefix}-${sequenceFormatted}`;
};

/**
 * Calculates followUpDate exactly 7 days after the appliedDate.
 */
export const calculateFollowUpDate = (appliedDate) => {
  const date = new Date(appliedDate);
  // Add 7 full calendar days
  date.setDate(date.getDate() + 7);
  return date;
};

/**
 * Dynamically computes whether an application is overdue.
 * True only when status is 'Applied' AND current date is strictly after followUpDate.
 */
export const computeIsOverdue = (status, followUpDate) => {
  if (status !== 'Applied' || !followUpDate) {
    return false;
  }
  return new Date() > new Date(followUpDate);
};

/**
 * Validates status transition.
 * Returns { valid: boolean, error: string | null }
 */
export const validateStatusTransition = (currentStatus, newStatus) => {
  if (!STATUS_LIST.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid status '${newStatus}'. Allowed statuses are: ${STATUS_LIST.join(', ')}.`,
    };
  }

  if (FINAL_STATUSES.includes(currentStatus)) {
    return {
      valid: false,
      error: `Cannot change status from final status '${currentStatus}'. Final statuses (${FINAL_STATUSES.join(', ')}) cannot be updated.`,
    };
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${
        allowedNext.length > 0 ? allowedNext.join(', ') : 'None'
      }.`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Validates deletion rule.
 * Returns { allowed: boolean, error: string | null }
 */
export const validateDeletion = (status) => {
  if (NON_DELETABLE_STATUSES.includes(status)) {
    return {
      allowed: false,
      error: `Cannot delete application with status '${status}'. Applications in Interview or Offer stages cannot be deleted.`,
    };
  }

  if (!DELETABLE_STATUSES.includes(status)) {
    return {
      allowed: false,
      error: `Application with status '${status}' cannot be deleted.`,
    };
  }

  return { allowed: true, error: null };
};

/**
 * Escapes regex special characters for case-insensitive exact matching.
 */
export const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
