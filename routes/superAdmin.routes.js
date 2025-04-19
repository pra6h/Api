// backend/routes/superAdmin.routes.js
import express from 'express';
import { superAdminLogin, getSuperAdminStats, getPendingRecruiters, approveRecruiter, rejectRecruiter } from '../controllers/superAdmin.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Super Admin login route
router.post('/login', superAdminLogin);

// Dashboard stats route (protected)
router.get('/dashboard-stats', isAuthenticated, getSuperAdminStats);

// Recruiter approval routes
router.get('/pending', getPendingRecruiters);       // Get all unapproved recruiters
router.put('/approve/:id', approveRecruiter);       // Approve recruiter
router.delete('/reject/:id', rejectRecruiter);      // Reject recruiter

export default router;
