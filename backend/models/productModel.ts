import pool from '../config/db';

export interface Product {
    id: string;
    product_name: string;
    description: string | null;
    price: number;
    image_path: string | null;
    category_id: string;
    created_at: Date;
    updated_at: Date;
}

export const ProductModel = {
    async getAll(): Promise<Product[]> {
        const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        return result.rows;
    },

    async getById(id: string): Promise<Product | null> {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        return result.rows[0] || null;
    },

    async create(product_name: string, description: string | null, price: number, image_path: string | null, category_id: string): Promise<Product> {
        const result = await pool.query(
            'INSERT INTO products (product_name, description, price, image_path, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [product_name, description || null, price, image_path || null, category_id]
        );
        return result.rows[0];
    },

    async update(id: string, fields: Partial<Pick<Product, 'product_name' | 'description' | 'price' | 'image_path' | 'category_id'>>): Promise<Product | null> {
        const setClauses: string[] = [];
        const values: (string | number | null)[] = [];
        let paramIndex = 1;

        if (fields.product_name !== undefined) {
            setClauses.push(`product_name = $${paramIndex++}`);
            values.push(fields.product_name);
        }
        if (fields.description !== undefined) {
            setClauses.push(`description = $${paramIndex++}`);
            values.push(fields.description);
        }
        if (fields.price !== undefined) {
            setClauses.push(`price = $${paramIndex++}`);
            values.push(fields.price);
        }
        if (fields.image_path !== undefined) {
            setClauses.push(`image_path = $${paramIndex++}`);
            values.push(fields.image_path);
        }
        if (fields.category_id !== undefined) {
            setClauses.push(`category_id = $${paramIndex++}`);
            values.push(fields.category_id);
        }

        if (setClauses.length === 0) return null;

        values.push(id);
        const query = `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    },

    async delete(id: string): Promise<boolean> {
        const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
};
