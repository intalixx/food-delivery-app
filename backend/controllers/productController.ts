import { Request, Response } from 'express';
import { ProductModel } from '../models/productModel';
import fs from 'fs';
import { resolveImagePath } from '../utils/paths';

export const ProductController = {
    // GET /api/products
    async getAll(_req: Request, res: Response): Promise<void> {
        try {
            const products = await ProductModel.getAll();
            res.json({ success: true, data: products });
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // GET /api/products/:id
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const product = await ProductModel.getById(req.params.id as string);
            if (!product) {
                res.status(404).json({ success: false, errors: ['Product not found'] });
                return;
            }
            res.json({ success: true, data: product });
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // POST /api/products
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { product_name, description, price, category_id } = req.body;
            const image_path = req.file ? `/uploads/products/${req.file.filename}` : null;

            const product = await ProductModel.create(product_name, description, parseFloat(price), image_path, category_id);
            res.status(201).json({ success: true, data: product });
        } catch (error: any) {
            // Clean up uploaded file on error
            if (req.file) {
                fs.unlink(req.file.path, () => { });
            }
            if (error.code === '23503') {
                res.status(400).json({ success: false, errors: ['Invalid category_id: category does not exist'] });
                return;
            }
            console.error('Error creating product:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // PUT /api/products/:id
    async update(req: Request, res: Response): Promise<void> {
        try {
            const existing = await ProductModel.getById(req.params.id as string);
            if (!existing) {
                if (req.file) fs.unlink(req.file.path, () => { });
                res.status(404).json({ success: false, errors: ['Product not found'] });
                return;
            }

            const { product_name, description, price, category_id } = req.body;
            const updateFields: any = {};

            if (product_name !== undefined) updateFields.product_name = product_name;
            if (description !== undefined) updateFields.description = description;
            if (price !== undefined) updateFields.price = parseFloat(price);
            if (category_id !== undefined) updateFields.category_id = category_id;

            if (req.file) {
                updateFields.image_path = `/uploads/products/${req.file.filename}`;
                // Delete old image if exists
                if (existing.image_path) {
                    const oldPath = resolveImagePath(existing.image_path);
                    fs.unlink(oldPath, () => { });
                }
            }

            const product = await ProductModel.update(req.params.id as string, updateFields);
            res.json({ success: true, data: product });
        } catch (error: any) {
            if (req.file) fs.unlink(req.file.path, () => { });
            if (error.code === '23503') {
                res.status(400).json({ success: false, errors: ['Invalid category_id: category does not exist'] });
                return;
            }
            console.error('Error updating product:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // DELETE /api/products/:id
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const existing = await ProductModel.getById(req.params.id as string);
            if (!existing) {
                res.status(404).json({ success: false, errors: ['Product not found'] });
                return;
            }

            // Delete image file
            if (existing.image_path) {
                const filePath = resolveImagePath(existing.image_path);
                fs.unlink(filePath, () => { });
            }

            await ProductModel.delete(req.params.id as string);
            res.json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    }
};
