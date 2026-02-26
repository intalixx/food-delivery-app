import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';
import { validateCreateOrder, validateUpdateStatus, validateCancelOrder } from '../middleware/validateOrder';

const router = Router();

// All order routes require authentication
router.post('/', protect, validateCreateOrder, OrderController.create);
router.get('/my', protect, OrderController.getMyOrders);
router.get('/stream', protect, OrderController.stream);
router.get('/:id', protect, OrderController.getById);
router.patch('/:id/status', protect, validateUpdateStatus, OrderController.updateStatus);
router.patch('/:id/cancel', protect, validateCancelOrder, OrderController.cancel);

export default router;
