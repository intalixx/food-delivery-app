import { api } from './setup';

/**
 * Health & Root endpoint tests.
 * These are basic sanity checks to verify the server is running.
 */
describe('Server Health', () => {

    describe('GET /', () => {
        it('should return API running message', async () => {
            const res = await api.get('/');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toBe('Food Delivery API is running');
        });
    });

    describe('GET /api/health', () => {
        it('should return ok status with uptime', async () => {
            const res = await api.get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body).toHaveProperty('uptime');
            expect(typeof res.body.uptime).toBe('number');
        });
    });

    describe('GET /non-existent-route', () => {
        it('should return 404 for unknown routes', async () => {
            const res = await api.get('/api/this-does-not-exist');
            expect(res.status).toBe(404);
        });
    });
});
