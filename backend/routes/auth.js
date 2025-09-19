import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  createInitialAdmin
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createInitialAdmin); // One-time admin creation

// Protected routes
router.post('/logout', requireAuth, logout);
router.get('/me', getCurrentUser); // No auth required - used to check session
router.put('/profile', requireAuth, updateProfile);
router.put('/change-password', requireAuth, changePassword);

export default router;