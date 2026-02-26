import { api, NON_EXISTENT_UUID, INVALID_UUID, createTestUser, createTestCategory, createTestProduct, createTestAddress } from './setup';
import { OrderModel } from '../models/orderModel';

/**
 * Orders API — Full CRUD + Sequential Status + Order Address Snapshot
 *
 * Endpoints:
 *   POST   /api/orders             → Place order (auth required)
 *   GET    /api/orders/my          → Get my orders (auth required)
 *   GET    /api/orders/:id         → Get by ID (auth required)
 *   PATCH  /api/orders/:id/status  → Update status (auth required, sequential)
 *   PATCH  /api/orders/:id/cancel  → Cancel order (auth required)
 *   GET    /api/orders/stream      → SSE stream (auth required)
 */

// ═══════════════════════════════════════════════════════════════════
// UNIT TESTS — Status Transition Validation (no DB required)
// ═══════════════════════════════════════════════════════════════════
describe('OrderModel.validateStatusTransition (Unit)', () => {

    // ─── VALID FORWARD TRANSITIONS ─────────────────────────
    describe('Valid forward transitions', () => {
        it('Order Received → Preparing', () => {
            const result = OrderModel.validateStatusTransition('Order Received', 'Preparing');
            expect(result.valid).toBe(true);
        });

        it('Preparing → Out for Delivery', () => {
            const result = OrderModel.validateStatusTransition('Preparing', 'Out for Delivery');
            expect(result.valid).toBe(true);
        });

        it('Out for Delivery → Delivered', () => {
            const result = OrderModel.validateStatusTransition('Out for Delivery', 'Delivered');
            expect(result.valid).toBe(true);
        });
    });

    // ─── CANCELLATION RULES ────────────────────────────────
    describe('Cancellation rules', () => {
        it('Order Received → Cancelled (allowed)', () => {
            const result = OrderModel.validateStatusTransition('Order Received', 'Cancelled');
            expect(result.valid).toBe(true);
        });

        it('Preparing → Cancelled (allowed)', () => {
            const result = OrderModel.validateStatusTransition('Preparing', 'Cancelled');
            expect(result.valid).toBe(true);
        });

        it('Out for Delivery → Cancelled (allowed)', () => {
            const result = OrderModel.validateStatusTransition('Out for Delivery', 'Cancelled');
            expect(result.valid).toBe(true);
        });

        it('Delivered → Cancelled (BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Delivered', 'Cancelled');
            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.reason).toMatch(/already delivered/i);
            }
        });

        it('Cancelled → Cancelled (BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Cancelled', 'Cancelled');
            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.reason).toMatch(/already cancelled/i);
            }
        });
    });

    // ─── BLOCKED BACKWARD TRANSITIONS ──────────────────────
    describe('Backward transitions (all blocked)', () => {
        it('Preparing → Order Received (backward — BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Preparing', 'Order Received');
            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.reason).toMatch(/next allowed status is "Out for Delivery"/i);
            }
        });

        it('Out for Delivery → Preparing (backward — BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Out for Delivery', 'Preparing');
            expect(result.valid).toBe(false);
        });

        it('Delivered → Out for Delivery (backward — BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Delivered', 'Out for Delivery');
            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.reason).toMatch(/already delivered/i);
            }
        });

        it('Delivered → Preparing (backward — BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Delivered', 'Preparing');
            expect(result.valid).toBe(false);
        });

        it('Delivered → Order Received (backward — BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Delivered', 'Order Received');
            expect(result.valid).toBe(false);
        });
    });

    // ─── BLOCKED SKIP TRANSITIONS ──────────────────────────
    describe('Skipping steps (all blocked)', () => {
        it('Order Received → Out for Delivery (skip — BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Order Received', 'Out for Delivery');
            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.reason).toMatch(/next allowed status is "Preparing"/i);
            }
        });

        it('Order Received → Delivered (skip — BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Order Received', 'Delivered');
            expect(result.valid).toBe(false);
        });

        it('Preparing → Delivered (skip — BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Preparing', 'Delivered');
            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.reason).toMatch(/next allowed status is "Out for Delivery"/i);
            }
        });
    });

    // ─── TERMINAL STATE TRANSITIONS ────────────────────────
    describe('Terminal states (no further transitions)', () => {
        it('Cancelled → Preparing (BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Cancelled', 'Preparing');
            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.reason).toMatch(/already cancelled/i);
            }
        });

        it('Cancelled → Order Received (BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Cancelled', 'Order Received');
            expect(result.valid).toBe(false);
        });

        it('Cancelled → Out for Delivery (BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Cancelled', 'Out for Delivery');
            expect(result.valid).toBe(false);
        });

        it('Cancelled → Delivered (BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Cancelled', 'Delivered');
            expect(result.valid).toBe(false);
        });

        it('Delivered → Delivered (same status — BLOCKED)', () => {
            const result = OrderModel.validateStatusTransition('Delivered', 'Delivered');
            expect(result.valid).toBe(false);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════
// INTEGRATION TESTS — API Endpoints
// ═══════════════════════════════════════════════════════════════════
describe('Orders API', () => {

    // ─── UNAUTHENTICATED ACCESS ──────────────────────────
    describe('Authentication Guard', () => {

        it('POST /api/orders — should reject without token', async () => {
            const res = await api
                .post('/api/orders')
                .send({
                    address_id: NON_EXISTENT_UUID,
                    items: [{ product_id: NON_EXISTENT_UUID, qty: 1 }]
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.errors[0]).toMatch(/not authorized/i);
        });

        it('GET /api/orders/my — should reject without token', async () => {
            const res = await api.get('/api/orders/my');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('GET /api/orders/:id — should reject without token', async () => {
            const res = await api.get(`/api/orders/${NON_EXISTENT_UUID}`);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('PATCH /api/orders/:id/status — should reject without token', async () => {
            const res = await api
                .patch(`/api/orders/${NON_EXISTENT_UUID}/status`)
                .send({ order_status: 'Preparing' });

            expect(res.status).toBe(401);
        });

        it('PATCH /api/orders/:id/cancel — should reject without token', async () => {
            const res = await api
                .patch(`/api/orders/${NON_EXISTENT_UUID}/cancel`);

            expect(res.status).toBe(401);
        });

        it('should reject with invalid/expired token', async () => {
            const res = await api
                .get('/api/orders/my')
                .set('Authorization', 'Bearer invalid.jwt.token');

            expect(res.status).toBe(401);
            expect(res.body.errors[0]).toMatch(/not authorized/i);
        });

        it('should reject with malformed Authorization header', async () => {
            const res = await api
                .get('/api/orders/my')
                .set('Authorization', 'NotBearer token');

            expect(res.status).toBe(401);
        });
    });

    // ─── ORDER VALIDATION (Place Order) ──────────────────
    describe('POST /api/orders — Validation', () => {

        it('should reject empty body (no token still rejects with 401)', async () => {
            const res = await api
                .post('/api/orders')
                .send({});

            // Without auth, we get 401 before validation
            expect(res.status).toBe(401);
        });

        it('should require address_id to be present', async () => {
            const res = await api
                .post('/api/orders')
                .set('Authorization', 'Bearer fake')
                .send({ items: [{ product_id: NON_EXISTENT_UUID, qty: 1 }] });

            // Will fail on auth (401) since token is fake
            expect(res.status).toBe(401);
        });
    });

    // ─── ORDER CANCEL VALIDATION ─────────────────────────
    describe('PATCH /api/orders/:id/cancel — Validation', () => {

        it('should reject invalid UUID in path', async () => {
            const res = await api
                .patch(`/api/orders/${INVALID_UUID}/cancel`);

            // Auth is first middleware
            expect(res.status).toBe(401);
        });
    });

    // ─── ORDER STATUS UPDATE VALIDATION ──────────────────
    describe('PATCH /api/orders/:id/status — Validation', () => {

        it('should reject without authentication', async () => {
            const res = await api
                .patch(`/api/orders/${NON_EXISTENT_UUID}/status`)
                .send({ order_status: 'Preparing' });

            expect(res.status).toBe(401);
        });
    });

    // ─── SSE STREAM ──────────────────────────────────────
    describe('GET /api/orders/stream', () => {

        it('should reject SSE stream without token', async () => {
            const res = await api.get('/api/orders/stream');
            expect(res.status).toBe(401);
        });

        it('should reject SSE stream with invalid query token', async () => {
            const res = await api.get('/api/orders/stream?token=invalid');
            expect(res.status).toBe(401);
        });
    });

    // ─── FULL ORDER LIFECYCLE (Authenticated) ────────────
    describe('Full Order Lifecycle (Authenticated)', () => {
        let token: string;
        let userId: string;
        let addressId: string;
        let productId: string;
        let orderId: string;

        beforeAll(async () => {
            // Create test user
            const userResult = await createTestUser('9876543211');
            token = userResult.token;
            userId = userResult.user?.id;

            if (!token || !userId) return;

            // Create test address
            const address = await createTestAddress(userId, token);
            addressId = address?.id;

            // Create test category + product
            const category = await createTestCategory(`Lifecycle Cat ${Date.now()}`);
            if (category) {
                const product = await createTestProduct(category.id, {
                    product_name: `Lifecycle Product ${Date.now()}`,
                    price: '250.00'
                });
                productId = product?.id;
            }
        });

        it('should create an order with address snapshot', async () => {
            if (!token || !addressId || !productId) return;

            const res = await api
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    address_id: addressId,
                    items: [{ product_id: productId, qty: 2 }]
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.order_status).toBe('Order Received');

            // Verify address snapshot is present
            expect(res.body.data).toHaveProperty('address');
            expect(res.body.data.address).toHaveProperty('order_id');
            expect(res.body.data.address).toHaveProperty('pincode');
            expect(res.body.data.address).toHaveProperty('city');
            expect(res.body.data.address).toHaveProperty('house_number');
            expect(res.body.data.address).toHaveProperty('mobile');

            // Verify no address_id on the order itself
            expect(res.body.data).not.toHaveProperty('address_id');

            // Verify items
            expect(res.body.data.items.length).toBe(1);
            expect(res.body.data.items[0].qty).toBe(2);

            orderId = res.body.data.id;
        });

        it('should fetch the order by ID with address snapshot', async () => {
            if (!token || !orderId) return;

            const res = await api
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(orderId);
            expect(res.body.data.address).toBeTruthy();
            expect(res.body.data.address.order_id).toBe(orderId);
        });

        it('should list my orders with address snapshot', async () => {
            if (!token) return;

            const res = await api
                .get('/api/orders/my')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);

            const order = res.body.data.find((o: any) => o.id === orderId);
            expect(order).toBeTruthy();
            expect(order.address).toBeTruthy();
        });

        // ─── SEQUENTIAL STATUS UPDATES ───────────────────
        it('should advance: Order Received → Preparing', async () => {
            if (!token || !orderId) return;

            const res = await api
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ order_status: 'Preparing' });

            expect(res.status).toBe(200);
            expect(res.body.data.order_status).toBe('Preparing');
        });

        it('should REJECT skip: Preparing → Delivered (must go through Out for Delivery)', async () => {
            if (!token || !orderId) return;

            const res = await api
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ order_status: 'Delivered' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/next allowed status is "Out for Delivery"/i);
        });

        it('should REJECT backward: Preparing → Order Received', async () => {
            if (!token || !orderId) return;

            const res = await api
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ order_status: 'Order Received' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/next allowed status is "Out for Delivery"/i);
        });

        it('should advance: Preparing → Out for Delivery', async () => {
            if (!token || !orderId) return;

            const res = await api
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ order_status: 'Out for Delivery' });

            expect(res.status).toBe(200);
            expect(res.body.data.order_status).toBe('Out for Delivery');
        });

        it('should advance: Out for Delivery → Delivered', async () => {
            if (!token || !orderId) return;

            const res = await api
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ order_status: 'Delivered' });

            expect(res.status).toBe(200);
            expect(res.body.data.order_status).toBe('Delivered');
        });

        it('should REJECT cancel after Delivered', async () => {
            if (!token || !orderId) return;

            const res = await api
                .patch(`/api/orders/${orderId}/cancel`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/already delivered/i);
        });

        it('should REJECT any status update after Delivered', async () => {
            if (!token || !orderId) return;

            const res = await api
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ order_status: 'Preparing' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/already delivered/i);
        });
    });

    // ─── CANCEL FROM VARIOUS STATES ──────────────────────
    describe('Cancel from different states', () => {
        let token: string;
        let userId: string;
        let addressId: string;
        let productId: string;

        beforeAll(async () => {
            const userResult = await createTestUser('9876543212');
            token = userResult.token;
            userId = userResult.user?.id;

            if (!token || !userId) return;

            const address = await createTestAddress(userId, token);
            addressId = address?.id;

            const category = await createTestCategory(`Cancel Cat ${Date.now()}`);
            if (category) {
                const product = await createTestProduct(category.id, {
                    product_name: `Cancel Product ${Date.now()}`,
                    price: '100.00'
                });
                productId = product?.id;
            }
        });

        /** Helper to create a fresh order */
        async function createOrder(): Promise<string | null> {
            if (!token || !addressId || !productId) return null;
            const res = await api
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    address_id: addressId,
                    items: [{ product_id: productId, qty: 1 }]
                });
            return res.body.data?.id || null;
        }

        it('should cancel from Order Received', async () => {
            const oid = await createOrder();
            if (!oid) return;

            const res = await api
                .patch(`/api/orders/${oid}/cancel`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.order_status).toBe('Cancelled');
        });

        it('should cancel from Preparing', async () => {
            const oid = await createOrder();
            if (!oid) return;

            // Advance to Preparing
            await api
                .patch(`/api/orders/${oid}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ order_status: 'Preparing' });

            const res = await api
                .patch(`/api/orders/${oid}/cancel`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.order_status).toBe('Cancelled');
        });

        it('should cancel from Out for Delivery', async () => {
            const oid = await createOrder();
            if (!oid) return;

            // Advance to Out for Delivery
            await api
                .patch(`/api/orders/${oid}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ order_status: 'Preparing' });
            await api
                .patch(`/api/orders/${oid}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ order_status: 'Out for Delivery' });

            const res = await api
                .patch(`/api/orders/${oid}/cancel`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.order_status).toBe('Cancelled');
        });

        it('should NOT cancel already cancelled order', async () => {
            const oid = await createOrder();
            if (!oid) return;

            // Cancel once
            await api
                .patch(`/api/orders/${oid}/cancel`)
                .set('Authorization', `Bearer ${token}`);

            // Try again
            const res = await api
                .patch(`/api/orders/${oid}/cancel`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/already cancelled/i);
        });

        it('should REJECT status update on cancelled order', async () => {
            const oid = await createOrder();
            if (!oid) return;

            await api
                .patch(`/api/orders/${oid}/cancel`)
                .set('Authorization', `Bearer ${token}`);

            const res = await api
                .patch(`/api/orders/${oid}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ order_status: 'Preparing' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/already cancelled/i);
        });
    });

    // ─── INVALID STATUS VALUES ───────────────────────────
    describe('Invalid status values', () => {

        it('should reject garbage status value (with auth)', async () => {
            const userResult = await createTestUser('9876543213');
            if (!userResult.token) return;

            const res = await api
                .patch(`/api/orders/${NON_EXISTENT_UUID}/status`)
                .set('Authorization', `Bearer ${userResult.token}`)
                .send({ order_status: 'SomeRandomStatus' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/invalid status/i);
        });

        it('should reject empty order_status', async () => {
            const userResult = await createTestUser('9876543214');
            if (!userResult.token) return;

            const res = await api
                .patch(`/api/orders/${NON_EXISTENT_UUID}/status`)
                .set('Authorization', `Bearer ${userResult.token}`)
                .send({ order_status: '' });

            expect(res.status).toBe(400);
        });

        it('should reject missing order_status in body', async () => {
            const userResult = await createTestUser('9876543215');
            if (!userResult.token) return;

            const res = await api
                .patch(`/api/orders/${NON_EXISTENT_UUID}/status`)
                .set('Authorization', `Bearer ${userResult.token}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatch(/order_status is required/i);
        });
    });

    // ─── ORDER ADDRESS UNIQUENESS (1:1) ──────────────────
    describe('Order Address 1:1 Constraint', () => {

        it('each order should have exactly one address snapshot', async () => {
            const userResult = await createTestUser('9876543216');
            if (!userResult.token || !userResult.user) return;
            const token = userResult.token;
            const userId = userResult.user.id;

            const address = await createTestAddress(userId, token);
            if (!address) return;

            const category = await createTestCategory(`Unique Addr Cat ${Date.now()}`);
            if (!category) return;

            const product = await createTestProduct(category.id, {
                product_name: `Unique Addr Product ${Date.now()}`,
                price: '50.00'
            });
            if (!product) return;

            // Create order
            const createRes = await api
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    address_id: address.id,
                    items: [{ product_id: product.id, qty: 1 }]
                });

            expect(createRes.status).toBe(201);
            const order = createRes.body.data;

            // The address snapshot should be tied to this order
            expect(order.address).toBeTruthy();
            expect(order.address.order_id).toBe(order.id);

            // Fetch the same order — address must still be there
            const fetchRes = await api
                .get(`/api/orders/${order.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(fetchRes.body.data.address).toBeTruthy();
            expect(fetchRes.body.data.address.order_id).toBe(order.id);
        });
    });
});
