import { api, createTestCategory, NON_EXISTENT_UUID, INVALID_UUID } from './setup';

/**
 * Category API — Full CRUD + Edge Cases
 *
 * Endpoints:
 *   GET    /api/categories       → List all
 *   GET    /api/categories/:id   → Get by ID
 *   POST   /api/categories       → Create
 *   PUT    /api/categories/:id   → Update
 *   DELETE /api/categories/:id   → Delete
 */
describe('Categories API', () => {
    let categoryId: string;

    // ─── CREATE ──────────────────────────────────────────
    describe('POST /api/categories', () => {

        it('should create a category with valid name', async () => {
            const res = await api
                .post('/api/categories')
                .send({ category_name: 'Pizza' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.category_name).toBe('Pizza');
            categoryId = res.body.data.id;
        });

        it('should trim whitespace from category_name', async () => {
            const res = await api
                .post('/api/categories')
                .send({ category_name: '  Burgers  ' });

            expect(res.status).toBe(201);
            expect(res.body.data.category_name).toBe('Burgers');
        });

        it('should reject empty body', async () => {
            const res = await api
                .post('/api/categories')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toContain('category_name is required and must be a string');
        });

        it('should reject empty string category_name', async () => {
            const res = await api
                .post('/api/categories')
                .send({ category_name: '' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject whitespace-only category_name', async () => {
            const res = await api
                .post('/api/categories')
                .send({ category_name: '   ' });

            expect(res.status).toBe(400);
            expect(res.body.errors).toContain('category_name cannot be empty');
        });

        it('should reject category_name exceeding 50 characters', async () => {
            const longName = 'A'.repeat(51);
            const res = await api
                .post('/api/categories')
                .send({ category_name: longName });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/at most 50 characters/);
        });

        it('should reject category_name with special characters', async () => {
            const res = await api
                .post('/api/categories')
                .send({ category_name: 'Pizza @#$!' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/can only contain letters/);
        });

        it('should allow hyphens and ampersands in category_name', async () => {
            const res = await api
                .post('/api/categories')
                .send({ category_name: "Fish & Chips" });

            expect(res.status).toBe(201);
            expect(res.body.data.category_name).toBe("Fish & Chips");
        });

        it('should reject numeric category_name type', async () => {
            const res = await api
                .post('/api/categories')
                .send({ category_name: 12345 });

            expect(res.status).toBe(400);
        });
    });

    // ─── READ ALL ────────────────────────────────────────
    describe('GET /api/categories', () => {

        it('should return a list of categories', async () => {
            const res = await api.get('/api/categories');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('each category should have id and category_name fields', async () => {
            const res = await api.get('/api/categories');

            res.body.data.forEach((cat: any) => {
                expect(cat).toHaveProperty('id');
                expect(cat).toHaveProperty('category_name');
                expect(typeof cat.id).toBe('string');
                expect(typeof cat.category_name).toBe('string');
            });
        });
    });

    // ─── READ BY ID ──────────────────────────────────────
    describe('GET /api/categories/:id', () => {

        it('should return a single category by valid ID', async () => {
            const res = await api.get(`/api/categories/${categoryId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(categoryId);
        });

        it('should return 404 for non-existent UUID', async () => {
            const res = await api.get(`/api/categories/${NON_EXISTENT_UUID}`);
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api.get(`/api/categories/${INVALID_UUID}`);
            expect(res.status).toBe(400);
            expect(res.body.errors).toContain('Invalid ID format');
        });
    });

    // ─── UPDATE ──────────────────────────────────────────
    describe('PUT /api/categories/:id', () => {

        it('should update category_name', async () => {
            const res = await api
                .put(`/api/categories/${categoryId}`)
                .send({ category_name: 'Updated Pizza' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.category_name).toBe('Updated Pizza');
        });

        it('should reject update with empty body', async () => {
            const res = await api
                .put(`/api/categories/${categoryId}`)
                .send({});

            expect(res.status).toBe(400);
        });

        it('should reject update with empty string', async () => {
            const res = await api
                .put(`/api/categories/${categoryId}`)
                .send({ category_name: '' });

            expect(res.status).toBe(400);
        });

        it('should return 404 for updating non-existent category', async () => {
            const res = await api
                .put(`/api/categories/${NON_EXISTENT_UUID}`)
                .send({ category_name: 'Ghost' });

            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api
                .put(`/api/categories/${INVALID_UUID}`)
                .send({ category_name: 'Ghost' });

            expect(res.status).toBe(400);
        });
    });

    // ─── DELETE ──────────────────────────────────────────
    describe('DELETE /api/categories/:id', () => {

        let toDeleteId: string;

        beforeAll(async () => {
            const cat = await createTestCategory('To Delete Category');
            toDeleteId = cat.id;
        });

        it('should delete an existing category', async () => {
            const res = await api.delete(`/api/categories/${toDeleteId}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 404 when deleting already deleted category', async () => {
            const res = await api.delete(`/api/categories/${toDeleteId}`);
            expect(res.status).toBe(404);
        });

        it('should return 404 for non-existent UUID', async () => {
            const res = await api.delete(`/api/categories/${NON_EXISTENT_UUID}`);
            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api.delete(`/api/categories/${INVALID_UUID}`);
            expect(res.status).toBe(400);
        });
    });
});
