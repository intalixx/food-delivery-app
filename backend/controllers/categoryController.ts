import { Request, Response } from 'express';
import { CategoryModel } from '../models/categoryModel';

export const CategoryController = {
    // GET /api/categories
    async getAll(_req: Request, res: Response): Promise<void> {
        try {
            const categories = await CategoryModel.getAll();
            res.json({ success: true, data: categories });
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // GET /api/categories/:id
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const category = await CategoryModel.getById(req.params.id as string);
            if (!category) {
                res.status(404).json({ success: false, errors: ['Category not found'] });
                return;
            }
            res.json({ success: true, data: category });
        } catch (error) {
            console.error('Error fetching category:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // POST /api/categories
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { category_name } = req.body;
            const category = await CategoryModel.create(category_name);
            res.status(201).json({ success: true, data: category });
        } catch (error: any) {
            if (error.code === '23505') {
                res.status(409).json({ success: false, errors: ['Category name already exists'] });
                return;
            }
            console.error('Error creating category:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // PUT /api/categories/:id
    async update(req: Request, res: Response): Promise<void> {
        try {
            const existing = await CategoryModel.getById(req.params.id as string);
            if (!existing) {
                res.status(404).json({ success: false, errors: ['Category not found'] });
                return;
            }

            const { category_name } = req.body;
            const category = await CategoryModel.update(req.params.id as string, category_name);
            res.json({ success: true, data: category });
        } catch (error: any) {
            if (error.code === '23505') {
                res.status(409).json({ success: false, errors: ['Category name already exists'] });
                return;
            }
            console.error('Error updating category:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // DELETE /api/categories/:id
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await CategoryModel.delete(req.params.id as string);
            if (!deleted) {
                res.status(404).json({ success: false, errors: ['Category not found'] });
                return;
            }
            res.json({ success: true, message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    }
};
