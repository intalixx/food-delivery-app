import { api, NON_EXISTENT_UUID, INVALID_UUID } from './setup';

/**
 * Users API — Full CRUD + Edge Cases
 *
 * Endpoints:
 *   GET    /api/users       → List all
 *   GET    /api/users/:id   → Get by ID
 *   POST   /api/users       → Create (multipart/form-data)
 *   PUT    /api/users/:id   → Update (multipart/form-data)
 *   DELETE /api/users/:id   → Delete
 */
describe('Users API', () => {
    let userId: string;
    const uniqueMobile = `9${Date.now().toString().slice(-9)}`;

    // ─── CREATE ──────────────────────────────────────────
    describe('POST /api/users', () => {

        it('should create a user with valid data', async () => {
            const res = await api
                .post('/api/users')
                .field('user_name', 'Test User')
                .field('mobile_number', uniqueMobile)
                .field('email', `test${Date.now()}@example.com`)
                .field('gender', 'male');

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.user_name).toBe('Test User');
            userId = res.body.data.id;
        });

        it('should reject duplicate mobile_number', async () => {
            const res = await api
                .post('/api/users')
                .field('user_name', 'Duplicate Mobile')
                .field('mobile_number', uniqueMobile) // same as above
                .field('email', `dup${Date.now()}@example.com`)
                .field('gender', 'male');

            expect(res.status).toBe(409);
            expect(res.body.errors[0]).toMatch(/already registered/i);
        });
    });

    // ─── READ ALL ────────────────────────────────────────
    describe('GET /api/users', () => {

        it('should return a list of users', async () => {
            const res = await api.get('/api/users');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('each user should have core fields', async () => {
            const res = await api.get('/api/users');

            if (res.body.data.length > 0) {
                const user = res.body.data[0];
                expect(user).toHaveProperty('id');
                expect(user).toHaveProperty('user_name');
                expect(user).toHaveProperty('mobile_number');
            }
        });
    });

    // ─── READ BY ID ──────────────────────────────────────
    describe('GET /api/users/:id', () => {

        it('should return a user by valid ID', async () => {
            if (!userId) return; // Skip if creation failed

            const res = await api.get(`/api/users/${userId}`);
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(userId);
        });

        it('should return 404 for non-existent UUID', async () => {
            const res = await api.get(`/api/users/${NON_EXISTENT_UUID}`);
            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api.get(`/api/users/${INVALID_UUID}`);
            expect(res.status).toBe(400);
            expect(res.body.errors).toContain('Invalid ID format');
        });
    });

    // ─── UPDATE ──────────────────────────────────────────
    describe('PUT /api/users/:id', () => {

        it('should update user_name', async () => {
            if (!userId) return;

            const res = await api
                .put(`/api/users/${userId}`)
                .field('user_name', 'Updated User');

            expect(res.status).toBe(200);
            expect(res.body.data.user_name).toBe('Updated User');
        });

        it('should return 404 for non-existent UUID', async () => {
            const res = await api
                .put(`/api/users/${NON_EXISTENT_UUID}`)
                .field('user_name', 'Ghost');

            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api
                .put(`/api/users/${INVALID_UUID}`)
                .field('user_name', 'Ghost');

            expect(res.status).toBe(400);
        });
    });

    // ─── DELETE ──────────────────────────────────────────
    describe('DELETE /api/users/:id', () => {

        it('should delete the test user', async () => {
            if (!userId) return;

            const res = await api.delete(`/api/users/${userId}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 404 when deleting already deleted user', async () => {
            if (!userId) return;

            const res = await api.delete(`/api/users/${userId}`);
            expect(res.status).toBe(404);
        });

        it('should return 404 for non-existent UUID', async () => {
            const res = await api.delete(`/api/users/${NON_EXISTENT_UUID}`);
            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api.delete(`/api/users/${INVALID_UUID}`);
            expect(res.status).toBe(400);
        });
    });
});
