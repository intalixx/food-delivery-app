import { api, createTestCategory, NON_EXISTENT_UUID, INVALID_UUID } from './setup';

/**
 * Product API — Full CRUD + Edge Cases
 *
 * Endpoints:
 *   GET    /api/products       → List all
 *   GET    /api/products/:id   → Get by ID
 *   POST   /api/products       → Create (multipart/form-data)
 *   PUT    /api/products/:id   → Update (multipart/form-data)
 *   DELETE /api/products/:id   → Delete
 */
describe('Products API', () => {
    let categoryId: string;
    let productId: string;

    beforeAll(async () => {
        const cat = await createTestCategory('Product Test Category');
        categoryId = cat.id;
    });

    // ─── CREATE ──────────────────────────────────────────
    describe('POST /api/products', () => {

        it('should create a product with valid fields', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Margherita Pizza')
                .field('description', 'Classic Italian pizza')
                .field('price', '299.99')
                .field('category_id', categoryId);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.product_name).toBe('Margherita Pizza');
            expect(Number(res.body.data.price)).toBe(299.99);
            productId = res.body.data.id;
        });

        it('should create a product without description (optional field)', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Plain Burger')
                .field('price', '150')
                .field('category_id', categoryId);

            expect(res.status).toBe(201);
            expect(res.body.data.product_name).toBe('Plain Burger');
        });

        it('should reject missing product_name', async () => {
            const res = await api
                .post('/api/products')
                .field('price', '100')
                .field('category_id', categoryId);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/product_name/);
        });

        it('should reject missing price', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Test')
                .field('category_id', categoryId);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/price/);
        });

        it('should reject missing category_id', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Test')
                .field('price', '100');

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/category_id/);
        });

        it('should reject negative price', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Negative Price Product')
                .field('price', '-50')
                .field('category_id', categoryId);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/negative/);
        });

        it('should reject price exceeding 9999.99', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Expensive Product')
                .field('price', '10000')
                .field('category_id', categoryId);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/exceed/);
        });

        it('should reject price with more than 2 decimal places', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Decimal Product')
                .field('price', '99.999')
                .field('category_id', categoryId);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/2 decimal/);
        });

        it('should reject non-numeric price', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Bad Price')
                .field('price', 'abc')
                .field('category_id', categoryId);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/valid number/);
        });

        it('should reject invalid category_id UUID', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Orphan Product')
                .field('price', '100')
                .field('category_id', 'not-a-uuid');

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/valid UUID/);
        });

        it('should reject non-existent category_id (FK violation)', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Orphan Product')
                .field('price', '100')
                .field('category_id', NON_EXISTENT_UUID);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/category/i);
        });

        it('should reject product_name exceeding 50 characters', async () => {
            const longName = 'A'.repeat(51);
            const res = await api
                .post('/api/products')
                .field('product_name', longName)
                .field('price', '100')
                .field('category_id', categoryId);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/at most 50/);
        });

        it('should reject description exceeding 100 characters', async () => {
            const longDesc = 'B'.repeat(101);
            const res = await api
                .post('/api/products')
                .field('product_name', 'Good Name')
                .field('description', longDesc)
                .field('price', '100')
                .field('category_id', categoryId);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/at most 100/);
        });

        it('should reject special characters in product_name', async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'Pizza @#!')
                .field('price', '100')
                .field('category_id', categoryId);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/can only contain/);
        });
    });

    // ─── READ ALL ────────────────────────────────────────
    describe('GET /api/products', () => {

        it('should return a list of products', async () => {
            const res = await api.get('/api/products');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('each product should have required fields', async () => {
            const res = await api.get('/api/products');

            res.body.data.forEach((product: any) => {
                expect(product).toHaveProperty('id');
                expect(product).toHaveProperty('product_name');
                expect(product).toHaveProperty('price');
                expect(product).toHaveProperty('category_id');
            });
        });
    });

    // ─── READ BY ID ──────────────────────────────────────
    describe('GET /api/products/:id', () => {

        it('should return a single product by valid ID', async () => {
            const res = await api.get(`/api/products/${productId}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(productId);
            expect(res.body.data.product_name).toBe('Margherita Pizza');
        });

        it('should return 404 for non-existent UUID', async () => {
            const res = await api.get(`/api/products/${NON_EXISTENT_UUID}`);
            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api.get(`/api/products/${INVALID_UUID}`);
            expect(res.status).toBe(400);
            expect(res.body.errors).toContain('Invalid ID format');
        });
    });

    // ─── UPDATE ──────────────────────────────────────────
    describe('PUT /api/products/:id', () => {

        it('should update product_name only', async () => {
            const res = await api
                .put(`/api/products/${productId}`)
                .field('product_name', 'Supreme Pizza');

            expect(res.status).toBe(200);
            expect(res.body.data.product_name).toBe('Supreme Pizza');
        });

        it('should update price only', async () => {
            const res = await api
                .put(`/api/products/${productId}`)
                .field('price', '349.50');

            expect(res.status).toBe(200);
            expect(Number(res.body.data.price)).toBe(349.50);
        });

        it('should reject update with no fields', async () => {
            const res = await api
                .put(`/api/products/${productId}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/at least one field/i);
        });

        it('should return 404 for updating non-existent product', async () => {
            const res = await api
                .put(`/api/products/${NON_EXISTENT_UUID}`)
                .field('product_name', 'Ghost');

            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID in params', async () => {
            const res = await api
                .put(`/api/products/${INVALID_UUID}`)
                .field('product_name', 'Ghost');

            expect(res.status).toBe(400);
        });
    });

    // ─── DELETE ──────────────────────────────────────────
    describe('DELETE /api/products/:id', () => {

        let toDeleteId: string;

        beforeAll(async () => {
            const res = await api
                .post('/api/products')
                .field('product_name', 'To Delete Product')
                .field('price', '50')
                .field('category_id', categoryId);
            toDeleteId = res.body.data.id;
        });

        it('should delete an existing product', async () => {
            const res = await api.delete(`/api/products/${toDeleteId}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 404 when deleting already deleted product', async () => {
            const res = await api.delete(`/api/products/${toDeleteId}`);
            expect(res.status).toBe(404);
        });

        it('should return 404 for non-existent UUID', async () => {
            const res = await api.delete(`/api/products/${NON_EXISTENT_UUID}`);
            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api.delete(`/api/products/${INVALID_UUID}`);
            expect(res.status).toBe(400);
        });
    });
});
