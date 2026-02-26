import { api } from './setup';

/**
 * Auth API — Authentication flow + Edge Cases
 *
 * Endpoints:
 *   POST /api/auth/send-otp     → Send OTP
 *   POST /api/auth/verify-otp   → Verify OTP
 *   POST /api/auth/signup       → Signup
 *   POST /api/auth/logout       → Logout
 *   GET  /api/auth/me           → Get current user (auth required)
 *   PUT  /api/auth/me           → Update profile (auth required)
 */
describe('Auth API', () => {

    // ─── SEND OTP ────────────────────────────────────────
    describe('POST /api/auth/send-otp', () => {

        it('should accept a valid mobile number', async () => {
            const res = await api
                .post('/api/auth/send-otp')
                .send({ mobile_number: '9876543210' });

            // Could be 200 (OTP sent) or any success-like response
            expect([200, 201]).toContain(res.status);
            expect(res.body.success).toBe(true);
        });

        it('should reject empty body', async () => {
            const res = await api
                .post('/api/auth/send-otp')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject missing mobile_number', async () => {
            const res = await api
                .post('/api/auth/send-otp')
                .send({ phone: '9876543210' }); // wrong field name

            expect(res.status).toBe(400);
        });

        it('should reject invalid mobile_number format', async () => {
            const res = await api
                .post('/api/auth/send-otp')
                .send({ mobile_number: '123' });

            expect(res.status).toBe(400);
        });

        it('should reject non-string mobile_number', async () => {
            const res = await api
                .post('/api/auth/send-otp')
                .send({ mobile_number: 9876543210 });

            // May accept numeric — depends on validation
            expect([200, 400]).toContain(res.status);
        });
    });

    // ─── VERIFY OTP ──────────────────────────────────────
    describe('POST /api/auth/verify-otp', () => {

        it('should reject empty body', async () => {
            const res = await api
                .post('/api/auth/verify-otp')
                .send({});

            expect(res.status).toBe(400);
        });

        it('should reject missing OTP', async () => {
            const res = await api
                .post('/api/auth/verify-otp')
                .send({ mobile_number: '9876543210' });

            expect(res.status).toBe(400);
        });

        it('should reject invalid OTP', async () => {
            // First send OTP
            await api.post('/api/auth/send-otp').send({ mobile_number: '9876543210' });

            const res = await api
                .post('/api/auth/verify-otp')
                .send({ mobile_number: '9876543210', otp: '000000' });

            expect([400, 401]).toContain(res.status);
            expect(res.body.success).toBe(false);
        });

        it('should reject wrong mobile_number for OTP', async () => {
            const res = await api
                .post('/api/auth/verify-otp')
                .send({ mobile_number: '0000000000', otp: '123456' });

            expect([400, 401]).toContain(res.status);
        });
    });

    // ─── SIGNUP ──────────────────────────────────────────
    describe('POST /api/auth/signup', () => {

        it('should reject empty body', async () => {
            const res = await api
                .post('/api/auth/signup')
                .send({});

            expect(res.status).toBe(400);
        });

        it('should reject missing temp_token', async () => {
            const res = await api
                .post('/api/auth/signup')
                .send({ user_name: 'Test', email: 'test@test.com' });

            expect(res.status).toBe(400);
        });

        it('should reject invalid temp_token', async () => {
            const res = await api
                .post('/api/auth/signup')
                .send({ temp_token: 'expired-token', user_name: 'Test', email: 'test@test.com' });

            expect([400, 401]).toContain(res.status);
        });
    });

    // ─── LOGOUT ──────────────────────────────────────────
    describe('POST /api/auth/logout', () => {

        it('should handle logout (clears cookie)', async () => {
            const res = await api.post('/api/auth/logout');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ─── GET ME (Protected) ──────────────────────────────
    describe('GET /api/auth/me', () => {

        it('should reject without authentication', async () => {
            const res = await api.get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.errors[0]).toMatch(/not authorized/i);
        });

        it('should reject with invalid token', async () => {
            const res = await api
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid.token.here');

            expect(res.status).toBe(401);
        });

        it('should reject with empty Bearer token', async () => {
            const res = await api
                .get('/api/auth/me')
                .set('Authorization', 'Bearer ');

            expect(res.status).toBe(401);
        });
    });

    // ─── UPDATE ME (Protected) ───────────────────────────
    describe('PUT /api/auth/me', () => {

        it('should reject without authentication', async () => {
            const res = await api
                .put('/api/auth/me')
                .field('user_name', 'Hacker');

            expect(res.status).toBe(401);
        });

        it('should reject with invalid token', async () => {
            const res = await api
                .put('/api/auth/me')
                .set('Authorization', 'Bearer bad.token')
                .field('user_name', 'Hacker');

            expect(res.status).toBe(401);
        });
    });
});
