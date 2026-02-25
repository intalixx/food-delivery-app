import { Router } from 'express';
import { AddressController } from '../controllers/addressController';
import { validateCreateAddress, validateUpdateAddress } from '../middleware/validateAddress';
import { validateUUID } from '../middleware/validateProduct';

const router = Router();

router.get('/', AddressController.getAll);
router.get('/:id', validateUUID, AddressController.getById);
router.get('/user/:userId', AddressController.getByUserId);
router.post('/', validateCreateAddress, AddressController.create);
router.put('/:id', validateUUID, validateUpdateAddress, AddressController.update);
router.delete('/:id', validateUUID, AddressController.delete);

export default router;
