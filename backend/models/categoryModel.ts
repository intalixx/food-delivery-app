import pool from '../config/db';

export interface Category {
    id: string;
    category_name: string;
    created_at: Date;
    updated_at: Date;
}

export const CategoryModel = {
    async getAll(): Promise<Category[]> {
        const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
        return result.rows;
    },

    async getById(id: string): Promise<Category | null> {
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        return result.rows[0] || null;
    },

    async create(category_name: string): Promise<Category> {
        const result = await pool.query(
            'INSERT INTO categories (category_name) VALUES ($1) RETURNING *',
            [category_name]
        );
        return result.rows[0];
    },

    async update(id: string, category_name: string): Promise<Category | null> {
        const result = await pool.query(
            'UPDATE categories SET category_name = $1 WHERE id = $2 RETURNING *',
            [category_name, id]
        );
        return result.rows[0] || null;
    },

    async delete(id: string): Promise<boolean> {
        const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
};
