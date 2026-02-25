import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController';
import { validateCreateUser, validateUpdateUser } from '../middleware/validateUser';
import { validateUUID } from '../middleware/validateProduct';
import { uploadUserImage } from '../middleware/uploadUserImage';
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

router.get('/', UserController.getAll);
router.get('/:id', validateUUID, UserController.getById);
router.post('/', uploadUserImage.single('image'), handleMulterError, validateCreateUser, UserController.create);
router.put('/:id', validateUUID, uploadUserImage.single('image'), handleMulterError, validateUpdateUser, UserController.update);
router.delete('/:id', validateUUID, UserController.delete);

export default router;
