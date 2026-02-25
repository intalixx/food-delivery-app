import { Router, Request, Response, NextFunction } from 'express';
import { ProductController } from '../controllers/productController';
import { validateCreateProduct, validateUpdateProduct, validateUUID } from '../middleware/validateProduct';
import { upload } from '../middleware/uploadImage';
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

router.get('/', ProductController.getAll);
router.get('/:id', validateUUID, ProductController.getById);
router.post('/', upload.single('image'), handleMulterError, validateCreateProduct, ProductController.create);
router.put('/:id', validateUUID, upload.single('image'), handleMulterError, validateUpdateProduct, ProductController.update);
router.delete('/:id', validateUUID, ProductController.delete);

export default router;
