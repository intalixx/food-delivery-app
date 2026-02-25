import pool from '../config/db';

export interface Otp {
    id: string;
    mobile_number: string;
    otp: string;
    created_at: Date;
    expires_at: Date;
}

export const OtpModel = {
    async createOrUpdate(mobile_number: string, otp: string): Promise<Otp> {
        // Set expiry to 5 minutes from now
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        // Upsert logic: If mobile number exists, update OTP and expiry. Otherwise, insert.
        const query = `
            INSERT INTO otps (mobile_number, otp, expires_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (mobile_number) 
            DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, created_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const result = await pool.query(query, [mobile_number, otp, expiresAt]);
        return result.rows[0];
    },

    async getByMobile(mobile_number: string): Promise<Otp | null> {
        const result = await pool.query('SELECT * FROM otps WHERE mobile_number = $1', [mobile_number]);
        return result.rows[0] || null;
    },

    async deleteByMobile(mobile_number: string): Promise<void> {
        await pool.query('DELETE FROM otps WHERE mobile_number = $1', [mobile_number]);
    }
};
