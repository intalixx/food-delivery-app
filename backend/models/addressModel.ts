import pool from '../config/db';

export interface Address {
    id: string;
    user_id: string;
    save_as: string;
    pincode: string;
    city: string;
    state: string;
    house_number: string;
    street_locality: string;
    mobile: string;
    created_at: Date;
    updated_at: Date;
}

export const AddressModel = {
    async getAll(): Promise<Address[]> {
        const result = await pool.query('SELECT * FROM addresses ORDER BY created_at DESC');
        return result.rows;
    },

    async getById(id: string): Promise<Address | null> {
        const result = await pool.query('SELECT * FROM addresses WHERE id = $1', [id]);
        return result.rows[0] || null;
    },

    async getByUserId(user_id: string): Promise<Address[]> {
        const result = await pool.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
        return result.rows;
    },

    async create(data: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<Address> {
        const result = await pool.query(
            `INSERT INTO addresses (user_id, save_as, pincode, city, state, house_number, street_locality, mobile)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [data.user_id, data.save_as, data.pincode, data.city, data.state, data.house_number, data.street_locality, data.mobile]
        );
        return result.rows[0];
    },

    async update(id: string, fields: Partial<Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Address | null> {
        const setClauses: string[] = [];
        const values: (string | null)[] = [];
        let paramIndex = 1;

        const fieldMap: Record<string, string | null | undefined> = {
            save_as: fields.save_as,
            pincode: fields.pincode,
            city: fields.city,
            state: fields.state,
            house_number: fields.house_number,
            street_locality: fields.street_locality,
            mobile: fields.mobile,
        };

        for (const [key, value] of Object.entries(fieldMap)) {
            if (value !== undefined) {
                setClauses.push(`${key} = $${paramIndex++}`);
                values.push(value);
            }
        }

        if (setClauses.length === 0) return null;

        values.push(id);
        const query = `UPDATE addresses SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    },

    async delete(id: string): Promise<boolean> {
        const result = await pool.query('DELETE FROM addresses WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
};
