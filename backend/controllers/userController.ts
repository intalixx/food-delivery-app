import { Request, Response } from 'express';
import { UserModel } from '../models/userModel';
import fs from 'fs';
import path from 'path';

export const UserController = {
    // GET /api/users
    async getAll(_req: Request, res: Response): Promise<void> {
        try {
            const users = await UserModel.getAll();
            res.json({ success: true, data: users });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // GET /api/users/:id
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const user = await UserModel.getById(req.params.id as string);
            if (!user) {
                res.status(404).json({ success: false, errors: ['User not found'] });
                return;
            }
            res.json({ success: true, data: user });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // POST /api/users
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { user_name, mobile_number, email, gender } = req.body;
            const image_path = req.file ? `/uploads/users/${req.file.filename}` : null;

            const user = await UserModel.create(user_name, mobile_number, email, gender, image_path);
            res.status(201).json({ success: true, data: user });
        } catch (error: any) {
            if (req.file) fs.unlink(req.file.path, () => { });
            if (error.code === '23505') {
                res.status(409).json({ success: false, errors: ['Mobile number already registered'] });
                return;
            }
            console.error('Error creating user:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // PUT /api/users/:id
    async update(req: Request, res: Response): Promise<void> {
        try {
            const existing = await UserModel.getById(req.params.id as string);
            if (!existing) {
                if (req.file) fs.unlink(req.file.path, () => { });
                res.status(404).json({ success: false, errors: ['User not found'] });
                return;
            }

            const { user_name, mobile_number, email, gender } = req.body;
            const updateFields: any = {};

            if (user_name !== undefined) updateFields.user_name = user_name;
            if (mobile_number !== undefined) updateFields.mobile_number = mobile_number;
            if (email !== undefined) updateFields.email = email;
            if (gender !== undefined) updateFields.gender = gender;

            if (req.file) {
                updateFields.image_path = `/uploads/users/${req.file.filename}`;
                if (existing.image_path) {
                    const oldPath = path.resolve(__dirname, '..', existing.image_path.replace(/^\//, ''));
                    fs.unlink(oldPath, () => { });
                }
            }

            const user = await UserModel.update(req.params.id as string, updateFields);
            res.json({ success: true, data: user });
        } catch (error: any) {
            if (req.file) fs.unlink(req.file.path, () => { });
            if (error.code === '23505') {
                res.status(409).json({ success: false, errors: ['Mobile number already registered'] });
                return;
            }
            console.error('Error updating user:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // DELETE /api/users/:id
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const existing = await UserModel.getById(req.params.id as string);
            if (!existing) {
                res.status(404).json({ success: false, errors: ['User not found'] });
                return;
            }

            if (existing.image_path) {
                const filePath = path.resolve(__dirname, '..', existing.image_path.replace(/^\//, ''));
                fs.unlink(filePath, () => { });
            }

            await UserModel.delete(req.params.id as string);
            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    }
};
