import { Request, Response } from 'express';
import { AddressModel } from '../models/addressModel';
import { UserModel } from '../models/userModel';

export const AddressController = {
    // GET /api/addresses
    async getAll(_req: Request, res: Response): Promise<void> {
        try {
            const addresses = await AddressModel.getAll();
            res.json({ success: true, data: addresses });
        } catch (error) {
            console.error('Error fetching addresses:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // GET /api/addresses/:id
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const address = await AddressModel.getById(req.params.id as string);
            if (!address) {
                res.status(404).json({ success: false, errors: ['Address not found'] });
                return;
            }
            res.json({ success: true, data: address });
        } catch (error) {
            console.error('Error fetching address:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // GET /api/addresses/user/:userId
    async getByUserId(req: Request, res: Response): Promise<void> {
        try {
            const addresses = await AddressModel.getByUserId(req.params.userId as string);
            res.json({ success: true, data: addresses });
        } catch (error) {
            console.error('Error fetching user addresses:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // POST /api/addresses
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { user_id, address_type, location, pincode, city, state, house_number, street_locality, mobile } = req.body;

            // Verify user exists
            const user = await UserModel.getById(user_id);
            if (!user) {
                res.status(400).json({ success: false, errors: ['Invalid user_id: user does not exist'] });
                return;
            }

            const address = await AddressModel.create({
                user_id, address_type, location, pincode, city, state, house_number, street_locality, mobile
            });
            res.status(201).json({ success: true, data: address });
        } catch (error: any) {
            if (error.code === '23503') {
                res.status(400).json({ success: false, errors: ['Invalid user_id: user does not exist'] });
                return;
            }
            console.error('Error creating address:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // PUT /api/addresses/:id
    async update(req: Request, res: Response): Promise<void> {
        try {
            const existing = await AddressModel.getById(req.params.id as string);
            if (!existing) {
                res.status(404).json({ success: false, errors: ['Address not found'] });
                return;
            }

            const { address_type, location, pincode, city, state, house_number, street_locality, mobile } = req.body;
            const address = await AddressModel.update(req.params.id as string, {
                address_type, location, pincode, city, state, house_number, street_locality, mobile
            });
            res.json({ success: true, data: address });
        } catch (error) {
            console.error('Error updating address:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // DELETE /api/addresses/:id
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await AddressModel.delete(req.params.id as string);
            if (!deleted) {
                res.status(404).json({ success: false, errors: ['Address not found'] });
                return;
            }
            res.json({ success: true, message: 'Address deleted successfully' });
        } catch (error) {
            console.error('Error deleting address:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    }
};
