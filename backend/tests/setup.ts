import request from 'supertest';
import app from '../server';

/**
 * Shared test utilities and helpers.
 * Provides reusable functions for authentication, data creation, and assertions.
 */

export const api = request(app);

/** Random UUID v4 for testing non-existent resources */
export const NON_EXISTENT_UUID = '00000000-0000-4000-a000-000000000000';

/** Clearly invalid UUID format */
export const INVALID_UUID = 'not-a-uuid';

/** Valid UUID format but not v4 */
export const MALFORMED_UUID = '12345678-1234-1234-1234-123456789abc';

/**
 * Creates a test user via the auth flow (send OTP → verify → signup).
 * Returns the JWT token and user object.
 */
export async function createTestUser(mobile: string = '9876543210') {
    // Step 1: Send OTP
    await api.post('/api/auth/send-otp').send({ mobile_number: mobile });

    // Step 2: Verify OTP (uses fixed OTP from test env or default)
    const verifyRes = await api.post('/api/auth/verify-otp').send({
        mobile_number: mobile,
        otp: '123456'
    });

    // If user already exists, we get a token directly
    if (verifyRes.body.data?.token) {
        return {
            token: verifyRes.body.data.token,
            user: verifyRes.body.data.user
        };
    }

    // Step 3: Signup if new user
    const tempToken = verifyRes.body.data?.temp_token;
    const signupRes = await api.post('/api/auth/signup').send({
        temp_token: tempToken,
        user_name: `Test User ${Date.now()}`,
        email: `test${Date.now()}@example.com`
    });

    return {
        token: signupRes.body.data?.token,
        user: signupRes.body.data?.user
    };
}

/**
 * Creates a test category and returns it.
 */
export async function createTestCategory(name?: string) {
    const res = await api
        .post('/api/categories')
        .send({ category_name: name || `Test Category ${Date.now()}` });
    return res.body.data;
}

/**
 * Creates a test product and returns it.
 * Needs a valid category_id.
 */
export async function createTestProduct(categoryId: string, overrides?: Record<string, any>) {
    const res = await api
        .post('/api/products')
        .field('product_name', overrides?.product_name || `Test Product ${Date.now()}`)
        .field('description', overrides?.description || 'Test description')
        .field('price', overrides?.price || '199.99')
        .field('category_id', categoryId);
    return res.body.data;
}

/**
 * Creates a test address and returns it.
 */
export async function createTestAddress(userId: string, token: string) {
    const res = await api
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
            user_id: userId,
            save_as: 'Home',
            pincode: '110001',
            city: 'New Delhi',
            state: 'Delhi',
            house_number: '42-B, Test Building',
            street_locality: 'Test Street, Sector 7',
            mobile: '9876543210'
        });
    return res.body.data;
}
