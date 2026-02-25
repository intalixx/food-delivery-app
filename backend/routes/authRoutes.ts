import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { uploadProfileImage } from '../middleware/uploadProfileImage';
import multer from 'multer';

const router = Router();

// Multer error handler
const handleMulterError = (err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ success: false, errors: ['Image size must not exceed 5 MB'] });
            return;
        }
        res.status(400).json({ success: false, errors: [err.message] });
        return;
    }
    if (err) {
        res.status(400).json({ success: false, errors: [err.message] });
        return;
    }
    next();
};

// Routes
router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/signup', AuthController.signup);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/me', protect, AuthController.getMe);
router.put('/me', protect, uploadProfileImage.single('image'), handleMulterError, AuthController.updateMe);

export default router;
