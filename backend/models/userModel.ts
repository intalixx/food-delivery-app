import pool from '../config/db';

export interface User {
    id: string;
    user_name: string;
    mobile_number: string;
    email: string | null;
    gender: 'male' | 'female' | null;
    image_path: string | null;
    created_at: Date;
    updated_at: Date;
}

export const UserModel = {
    async getAll(): Promise<User[]> {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        return result.rows;
    },

    async getById(id: string): Promise<User | null> {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    },

    async getByMobile(mobile_number: string): Promise<User | null> {
        const result = await pool.query('SELECT * FROM users WHERE mobile_number = $1', [mobile_number]);
        return result.rows[0] || null;
    },

    async create(user_name: string, mobile_number: string, email: string | null, gender: string | null, image_path: string | null): Promise<User> {
        const result = await pool.query(
            'INSERT INTO users (user_name, mobile_number, email, gender, image_path) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_name, mobile_number, email || null, gender || null, image_path || null]
        );
        return result.rows[0];
    },

    async update(id: string, fields: Partial<Pick<User, 'user_name' | 'mobile_number' | 'email' | 'gender' | 'image_path'>>): Promise<User | null> {
        const setClauses: string[] = [];
        const values: (string | null)[] = [];
        let paramIndex = 1;

        if (fields.user_name !== undefined) {
            setClauses.push(`user_name = $${paramIndex++}`);
            values.push(fields.user_name);
        }
        if (fields.mobile_number !== undefined) {
            setClauses.push(`mobile_number = $${paramIndex++}`);
            values.push(fields.mobile_number);
        }
        if (fields.email !== undefined) {
            setClauses.push(`email = $${paramIndex++}`);
            values.push(fields.email);
        }
        if (fields.gender !== undefined) {
            setClauses.push(`gender = $${paramIndex++}`);
            values.push(fields.gender);
        }
        if (fields.image_path !== undefined) {
            setClauses.push(`image_path = $${paramIndex++}`);
            values.push(fields.image_path);
        }

        if (setClauses.length === 0) return null;

        values.push(id);
        const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    },

    async delete(id: string): Promise<boolean> {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
};
