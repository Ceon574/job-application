import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCompanyPrefix,
  calculateFollowUpDate,
  computeIsOverdue,
  validateStatusTransition,
  validateDeletion,
  ALLOWED_TRANSITIONS,
  FINAL_STATUSES,
} from '../utils/helpers.js';

describe('Business Logic & Validation Rules', () => {
  describe('Application ID Generation & Fallbacks', () => {
    test('standard company name produces 3 uppercase letters', () => {
      assert.equal(getCompanyPrefix('Infosys'), 'INF');
      assert.equal(getCompanyPrefix('infosys'), 'INF');
      assert.equal(getCompanyPrefix('TCS'), 'TCS');
      assert.equal(getCompanyPrefix('Google'), 'GOO');
      assert.equal(getCompanyPrefix('Microsoft'), 'MIC');
    });

    test('handles names with symbols, spaces, or numbers', () => {
      assert.equal(getCompanyPrefix('Amazon Web Services'), 'AMA');
      assert.equal(getCompanyPrefix('3M'), 'MXX'); // 1 letter 'M' padded with XX
      assert.equal(getCompanyPrefix('HP'), 'HPX'); // 2 letters 'HP' padded with X
      assert.equal(getCompanyPrefix('A&B Corp'), 'ABC'); // letters A, B, C
    });

    test('handles company names with fewer than 3 letters or non-letters', () => {
      assert.equal(getCompanyPrefix('AI'), 'AIX');
      assert.equal(getCompanyPrefix('K'), 'KXX');
      assert.equal(getCompanyPrefix('12345'), 'APP'); // Fallback default
      assert.equal(getCompanyPrefix(''), 'APP');
      assert.equal(getCompanyPrefix(null), 'APP');
    });
  });

  describe('Follow-up Date Calculation', () => {
    test('calculates followUpDate as exactly 7 calendar days after appliedDate', () => {
      const applied = new Date('2026-10-01T10:00:00Z');
      const followUp = calculateFollowUpDate(applied);
      const diffMs = followUp.getTime() - applied.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      assert.equal(diffDays, 7);
      assert.equal(followUp.toISOString().slice(0, 10), '2026-10-08');
    });
  });

  describe('Dynamic Overdue Calculation', () => {
    test('isOverdue is true ONLY when status is Applied AND current date is after followUpDate', () => {
      const pastFollowUp = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
      const futureFollowUp = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow

      // Applied + past followUp = overdue
      assert.equal(computeIsOverdue('Applied', pastFollowUp), true);

      // Applied + future followUp = not overdue
      assert.equal(computeIsOverdue('Applied', futureFollowUp), false);

      // Non-applied statuses are NEVER overdue even if followUpDate has passed
      assert.equal(computeIsOverdue('Interview', pastFollowUp), false);
      assert.equal(computeIsOverdue('Offer', pastFollowUp), false);
      assert.equal(computeIsOverdue('Accepted', pastFollowUp), false);
      assert.equal(computeIsOverdue('Rejected', pastFollowUp), false);
      assert.equal(computeIsOverdue('Declined', pastFollowUp), false);
    });
  });

  describe('Status Transition Validation', () => {
    test('Applied transitions: Interview or Rejected are allowed', () => {
      assert.equal(validateStatusTransition('Applied', 'Interview').valid, true);
      assert.equal(validateStatusTransition('Applied', 'Rejected').valid, true);
      assert.equal(validateStatusTransition('Applied', 'Offer').valid, false);
      assert.equal(validateStatusTransition('Applied', 'Accepted').valid, false);
      assert.equal(validateStatusTransition('Applied', 'Declined').valid, false);
    });

    test('Interview transitions: Offer or Rejected are allowed', () => {
      assert.equal(validateStatusTransition('Interview', 'Offer').valid, true);
      assert.equal(validateStatusTransition('Interview', 'Rejected').valid, true);
      assert.equal(validateStatusTransition('Interview', 'Applied').valid, false);
      assert.equal(validateStatusTransition('Interview', 'Accepted').valid, false);
      assert.equal(validateStatusTransition('Interview', 'Declined').valid, false);
    });

    test('Offer transitions: Accepted or Declined are allowed', () => {
      assert.equal(validateStatusTransition('Offer', 'Accepted').valid, true);
      assert.equal(validateStatusTransition('Offer', 'Declined').valid, true);
      assert.equal(validateStatusTransition('Offer', 'Interview').valid, false);
      assert.equal(validateStatusTransition('Offer', 'Rejected').valid, false);
      assert.equal(validateStatusTransition('Offer', 'Applied').valid, false);
    });

    test('Final statuses cannot be transitioned to anything', () => {
      for (const finalStatus of FINAL_STATUSES) {
        for (const target of ['Applied', 'Interview', 'Offer', 'Accepted', 'Rejected', 'Declined']) {
          const result = validateStatusTransition(finalStatus, target);
          assert.equal(result.valid, false, `Expected transition from ${finalStatus} to ${target} to be rejected`);
        }
      }
    });

    test('Invalid unknown status is rejected', () => {
      assert.equal(validateStatusTransition('Applied', 'UnknownStatus').valid, false);
    });
  });

  describe('Application Deletion Validation', () => {
    test('Permitted statuses can be deleted: Applied, Accepted, Rejected, Declined', () => {
      assert.equal(validateDeletion('Applied').allowed, true);
      assert.equal(validateDeletion('Accepted').allowed, true);
      assert.equal(validateDeletion('Rejected').allowed, true);
      assert.equal(validateDeletion('Declined').allowed, true);
    });

    test('Interview and Offer statuses CANNOT be deleted', () => {
      const interviewCheck = validateDeletion('Interview');
      assert.equal(interviewCheck.allowed, false);
      assert.match(interviewCheck.error, /cannot be deleted/i);

      const offerCheck = validateDeletion('Offer');
      assert.equal(offerCheck.allowed, false);
      assert.match(offerCheck.error, /cannot be deleted/i);
    });
  });
});
