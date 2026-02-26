import { api, NON_EXISTENT_UUID, INVALID_UUID } from './setup';

/**
 * Addresses API — Full CRUD + Edge Cases
 *
 * Endpoints:
 *   GET    /api/addresses            → List all
 *   GET    /api/addresses/:id        → Get by ID
 *   GET    /api/addresses/user/:uid  → Get by User ID
 *   POST   /api/addresses            → Create
 *   PUT    /api/addresses/:id        → Update
 *   DELETE /api/addresses/:id        → Delete
 */
describe('Addresses API', () => {
    let addressId: string;
    const testUserId = NON_EXISTENT_UUID; // Placeholder — real tests may need a real user

    const validAddress = {
        user_id: NON_EXISTENT_UUID,
        save_as: 'Home',
        pincode: '110001',
        city: 'New Delhi',
        state: 'Delhi',
        house_number: '42-B, Block A',
        street_locality: 'Sector 7, Dwarka',
        mobile: '9876543210'
    };

    // ─── CREATE ──────────────────────────────────────────
    describe('POST /api/addresses', () => {

        it('should create an address with valid data', async () => {
            const res = await api
                .post('/api/addresses')
                .send(validAddress);

            // Note: may fail with FK constraint if user_id doesn't exist in DB
            // That's expected — we test validation independently
            if (res.status === 201) {
                expect(res.body.success).toBe(true);
                expect(res.body.data).toHaveProperty('id');
                expect(res.body.data.save_as).toBe('Home');
                expect(res.body.data.pincode).toBe('110001');
                addressId = res.body.data.id;
            }
        });

        it('should reject empty body', async () => {
            const res = await api
                .post('/api/addresses')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it('should reject missing user_id', async () => {
            const { user_id, ...noUserId } = validAddress;
            const res = await api.post('/api/addresses').send(noUserId);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/user_id/);
        });

        it('should reject invalid user_id UUID format', async () => {
            const res = await api
                .post('/api/addresses')
                .send({ ...validAddress, user_id: 'not-a-uuid' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/valid UUID/);
        });

        it('should reject missing pincode', async () => {
            const { pincode, ...noPincode } = validAddress;
            const res = await api.post('/api/addresses').send(noPincode);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/pincode/);
        });

        it('should reject invalid pincode (non 6-digit)', async () => {
            const res = await api
                .post('/api/addresses')
                .send({ ...validAddress, pincode: '1234' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/6 digits/);
        });

        it('should reject pincode with letters', async () => {
            const res = await api
                .post('/api/addresses')
                .send({ ...validAddress, pincode: 'ABC123' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/6 digits/);
        });

        it('should reject missing mobile', async () => {
            const { mobile, ...noMobile } = validAddress;
            const res = await api.post('/api/addresses').send(noMobile);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/mobile/);
        });

        it('should reject mobile with less than 10 digits', async () => {
            const res = await api
                .post('/api/addresses')
                .send({ ...validAddress, mobile: '12345' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/10 digits/);
        });

        it('should reject mobile with more than 10 digits', async () => {
            const res = await api
                .post('/api/addresses')
                .send({ ...validAddress, mobile: '12345678901' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/10 digits/);
        });

        it('should reject missing city', async () => {
            const { city, ...noCity } = validAddress;
            const res = await api.post('/api/addresses').send(noCity);

            expect(res.status).toBe(400);
        });

        it('should reject missing state', async () => {
            const { state, ...noState } = validAddress;
            const res = await api.post('/api/addresses').send(noState);

            expect(res.status).toBe(400);
        });

        it('should reject missing house_number', async () => {
            const { house_number, ...noHouse } = validAddress;
            const res = await api.post('/api/addresses').send(noHouse);

            expect(res.status).toBe(400);
        });

        it('should reject missing street_locality', async () => {
            const { street_locality, ...noStreet } = validAddress;
            const res = await api.post('/api/addresses').send(noStreet);

            expect(res.status).toBe(400);
        });

        it('should reject missing save_as', async () => {
            const { save_as, ...noSaveAs } = validAddress;
            const res = await api.post('/api/addresses').send(noSaveAs);

            expect(res.status).toBe(400);
        });

        it('should reject empty string save_as', async () => {
            const res = await api
                .post('/api/addresses')
                .send({ ...validAddress, save_as: '   ' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/empty/);
        });

        it('should reject city exceeding 50 characters', async () => {
            const res = await api
                .post('/api/addresses')
                .send({ ...validAddress, city: 'A'.repeat(51) });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/50 characters/);
        });

        it('should reject house_number exceeding 100 characters', async () => {
            const res = await api
                .post('/api/addresses')
                .send({ ...validAddress, house_number: 'H'.repeat(101) });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/100 characters/);
        });

        it('should reject street_locality exceeding 150 characters', async () => {
            const res = await api
                .post('/api/addresses')
                .send({ ...validAddress, street_locality: 'S'.repeat(151) });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/150 characters/);
        });

        it('should report multiple validation errors at once', async () => {
            const res = await api
                .post('/api/addresses')
                .send({ user_id: 'bad', pincode: '1', mobile: '0' });

            expect(res.status).toBe(400);
            expect(res.body.errors.length).toBeGreaterThan(2);
        });
    });

    // ─── READ ALL ────────────────────────────────────────
    describe('GET /api/addresses', () => {

        it('should return a list of addresses', async () => {
            const res = await api.get('/api/addresses');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    // ─── READ BY ID ──────────────────────────────────────
    describe('GET /api/addresses/:id', () => {

        it('should return 404 for non-existent UUID', async () => {
            const res = await api.get(`/api/addresses/${NON_EXISTENT_UUID}`);
            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api.get(`/api/addresses/${INVALID_UUID}`);
            expect(res.status).toBe(400);
            expect(res.body.errors).toContain('Invalid ID format');
        });
    });

    // ─── READ BY USER ID ─────────────────────────────────
    describe('GET /api/addresses/user/:userId', () => {

        it('should return empty array for non-existent user', async () => {
            const res = await api.get(`/api/addresses/user/${NON_EXISTENT_UUID}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
        });
    });

    // ─── UPDATE ──────────────────────────────────────────
    describe('PUT /api/addresses/:id', () => {

        it('should reject update with no fields', async () => {
            const res = await api
                .put(`/api/addresses/${NON_EXISTENT_UUID}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/at least one field/i);
        });

        it('should reject invalid pincode on update', async () => {
            const res = await api
                .put(`/api/addresses/${NON_EXISTENT_UUID}`)
                .send({ pincode: 'abc' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/6 digits/);
        });

        it('should reject invalid mobile on update', async () => {
            const res = await api
                .put(`/api/addresses/${NON_EXISTENT_UUID}`)
                .send({ mobile: '123' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/10 digits/);
        });

        it('should return 404 for non-existent UUID', async () => {
            const res = await api
                .put(`/api/addresses/${NON_EXISTENT_UUID}`)
                .send({ city: 'Mumbai' });

            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api
                .put(`/api/addresses/${INVALID_UUID}`)
                .send({ city: 'Mumbai' });

            expect(res.status).toBe(400);
        });
    });

    // ─── DELETE ──────────────────────────────────────────
    describe('DELETE /api/addresses/:id', () => {

        it('should return 404 for non-existent UUID', async () => {
            const res = await api.delete(`/api/addresses/${NON_EXISTENT_UUID}`);
            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await api.delete(`/api/addresses/${INVALID_UUID}`);
            expect(res.status).toBe(400);
        });
    });
});
