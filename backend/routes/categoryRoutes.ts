import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { validateCreateCategory, validateUpdateCategory } from '../middleware/validateCategory';
import { validateUUID } from '../middleware/validateProduct';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:id', validateUUID, CategoryController.getById);
router.post('/', validateCreateCategory, CategoryController.create);
router.put('/:id', validateUUID, validateUpdateCategory, CategoryController.update);
router.delete('/:id', validateUUID, CategoryController.delete);

export default router;
