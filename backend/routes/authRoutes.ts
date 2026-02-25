import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Routes
router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/signup', AuthController.signup);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/me', protect, AuthController.getMe);

export default router;
