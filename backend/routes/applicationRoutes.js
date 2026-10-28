import express from 'express';
import {
  createApplication,
  getApplications,
  getApplicationStats,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  getHealth,
} from '../controllers/applicationController.js';

const router = express.Router();

// Health check endpoint
router.get('/health', getHealth);

// Application statistics
router.get('/applications/stats', getApplicationStats);

// Application collection operations
router.route('/applications')
  .get(getApplications)
  .post(createApplication);

// Single application operations
router.route('/applications/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

// Status transition
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;
