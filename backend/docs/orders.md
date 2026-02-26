# Orders API

Base URL: `http://localhost:8000/api/orders`

> ⚠️ **All order endpoints require authentication.** Include the JWT token as a Bearer token in the `Authorization` header or as a `jwt` cookie.

---

## 1. Place Order (Checkout)

**POST** `/api/orders`

> **Content-Type:** `application/json`
> **Auth:** Required (Bearer Token)

Creates a new order with items. The server validates product existence, snapshots current prices from the database, verifies address ownership, **snapshots the delivery address** into `order_addresses`, and wraps everything in a database transaction.

> **Address Snapshot:** The delivery address is copied into the `order_addresses` table at order time. If the user later edits or deletes their address, the order's address is preserved exactly as it was when placed.

### Request Body

```json
{
  "address_id": "address-uuid-here",
  "items": [
    { "product_id": "product-uuid-1", "qty": 2 },
    { "product_id": "product-uuid-2", "qty": 1 }
  ]
}
```

### curl

```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "address_id": "address-uuid-here",
    "items": [
      { "product_id": "product-uuid-1", "qty": 2 },
      { "product_id": "product-uuid-2", "qty": 1 }
    ]
  }'
```

### Validation Rules

| Field                | Type   | Required | Rules                            |
| -------------------- | ------ | -------- | -------------------------------- |
| `address_id`         | string | Yes      | Must be a valid UUID             |
| `items`              | array  | Yes      | Must be a non-empty array        |
| `items[].product_id` | string | Yes      | Must be a valid UUID             |
| `items[].qty`        | number | Yes      | Must be a positive integer (≥ 1) |

### Server-Side Validations

| Check                                 | Error if Failed                                      |
| ------------------------------------- | ---------------------------------------------------- |
| Address exists                        | `Invalid delivery address`                           |
| Address belongs to authenticated user | `Invalid delivery address`                           |
| Each product exists in database       | `Product not found: <id>. It may have been removed.` |
| Order code uniqueness                 | Retries up to 5 times with new random code           |

### Response (201)

```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "order_code": "ORD-A7X3B2",
    "user_id": "user-uuid",
    "total_qty": 3,
    "final_amount": 460.0,
    "order_status": "Order Received",
    "created_at": "2026-02-26T05:00:00.000Z",
    "updated_at": "2026-02-26T05:00:00.000Z",
    "address": {
      "id": "order-address-uuid",
      "order_id": "order-uuid",
      "save_as": "Home",
      "pincode": "400001",
      "city": "Mumbai",
      "state": "Maharashtra",
      "house_number": "12A",
      "street_locality": "MG Road",
      "mobile": "9876543210",
      "created_at": "2026-02-26T05:00:00.000Z"
    },
    "items": [
      {
        "id": "item-uuid-1",
        "order_id": "order-uuid",
        "product_id": "product-uuid-1",
        "product_name": "Chicken Burger",
        "product_price": 170.0,
        "qty": 2,
        "subtotal": 340.0,
        "created_at": "2026-02-26T05:00:00.000Z",
        "updated_at": "2026-02-26T05:00:00.000Z"
      },
      {
        "id": "item-uuid-2",
        "order_id": "order-uuid",
        "product_id": "product-uuid-2",
        "product_name": "Avocado Salad",
        "product_price": 120.0,
        "qty": 1,
        "subtotal": 120.0,
        "created_at": "2026-02-26T05:00:00.000Z",
        "updated_at": "2026-02-26T05:00:00.000Z"
      }
    ]
  }
}
```

### Error (400 - Invalid Address)

```json
{ "success": false, "errors": ["Invalid delivery address"] }
```

### Error (400 - Product Not Found)

```json
{
  "success": false,
  "errors": ["Product not found: product-uuid. It may have been removed."]
}
```

### Error (400 - Validation)

```json
{
  "success": false,
  "errors": [
    "address_id is required",
    "items must be a non-empty array",
    "items[0].product_id must be a valid UUID",
    "items[1].qty must be a positive integer"
  ]
}
```

### Error (401 - Not Authenticated)

```json
{ "success": false, "errors": ["Not authorized, no token"] }
```

---

## 2. Get My Orders

**GET** `/api/orders/my`

> **Auth:** Required (Bearer Token)

Returns all orders for the authenticated user, sorted by most recent first. Each order includes its address snapshot and items.

```bash
curl http://localhost:8000/api/orders/my \
  -H "Authorization: Bearer <token>"
```

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "order_code": "ORD-A7X3B2",
      "user_id": "user-uuid",
      "total_qty": 3,
      "final_amount": 460.0,
      "order_status": "Order Received",
      "created_at": "2026-02-26T05:00:00.000Z",
      "updated_at": "2026-02-26T05:00:00.000Z",
      "address": {
        "id": "order-address-uuid",
        "order_id": "order-uuid",
        "save_as": "Home",
        "pincode": "400001",
        "city": "Mumbai",
        "state": "Maharashtra",
        "house_number": "12A",
        "street_locality": "MG Road",
        "mobile": "9876543210",
        "created_at": "2026-02-26T05:00:00.000Z"
      },
      "items": [
        {
          "id": "item-uuid-1",
          "order_id": "order-uuid",
          "product_id": "product-uuid-1",
          "product_name": "Chicken Burger",
          "product_price": 170.0,
          "qty": 2,
          "subtotal": 340.0,
          "created_at": "2026-02-26T05:00:00.000Z",
          "updated_at": "2026-02-26T05:00:00.000Z"
        },
        {
          "id": "item-uuid-2",
          "order_id": "order-uuid",
          "product_id": "product-uuid-2",
          "product_name": "Avocado Salad",
          "product_price": 120.0,
          "qty": 1,
          "subtotal": 120.0,
          "created_at": "2026-02-26T05:00:00.000Z",
          "updated_at": "2026-02-26T05:00:00.000Z"
        }
      ]
    }
  ]
}
```

### Error (401 - Not Authenticated)

```json
{ "success": false, "errors": ["Not authorized, no token"] }
```

---

## 3. Get Order by ID

**GET** `/api/orders/:id`

> **Auth:** Required (Bearer Token)

Returns a single order with its address snapshot and items. The order must belong to the authenticated user.

```bash
curl http://localhost:8000/api/orders/<order-uuid> \
  -H "Authorization: Bearer <token>"
```

### Response (200)

```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "order_code": "ORD-A7X3B2",
    "user_id": "user-uuid",
    "total_qty": 3,
    "final_amount": 460.00,
    "order_status": "Preparing",
    "created_at": "2026-02-26T05:00:00.000Z",
    "updated_at": "2026-02-26T05:10:00.000Z",
    "address": {
      "id": "order-address-uuid",
      "order_id": "order-uuid",
      "save_as": "Home",
      "pincode": "400001",
      "city": "Mumbai",
      "state": "Maharashtra",
      "house_number": "12A",
      "street_locality": "MG Road",
      "mobile": "9876543210",
      "created_at": "2026-02-26T05:00:00.000Z"
    },
    "items": [ ... ]
  }
}
```

### Error (404 - Not Found / Not Owner)

```json
{ "success": false, "errors": ["Order not found"] }
```

---

## 4. Cancel Order

**PATCH** `/api/orders/:id/cancel`

> **Auth:** Required (Bearer Token)

Cancels an order. **Allowed from any state except `Delivered` and `Cancelled`.** Orders that have reached `Delivered` or are already `Cancelled` cannot be cancelled.

```bash
curl -X PATCH http://localhost:8000/api/orders/<order-uuid>/cancel \
  -H "Authorization: Bearer <token>"
```

### Response (200)

```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "order_code": "ORD-A7X3B2",
    "user_id": "user-uuid",
    "total_qty": 3,
    "final_amount": 460.0,
    "order_status": "Cancelled",
    "created_at": "2026-02-26T05:00:00.000Z",
    "updated_at": "2026-02-26T05:15:00.000Z"
  },
  "message": "Order cancelled successfully"
}
```

### Error (400 - Already Delivered)

```json
{
  "success": false,
  "errors": ["Order is already delivered and cannot be cancelled."]
}
```

### Error (400 - Already Cancelled)

```json
{
  "success": false,
  "errors": ["Order is already cancelled."]
}
```

### Error (400 - Invalid UUID)

```json
{ "success": false, "errors": ["Invalid order ID"] }
```

---

## 5. Update Order Status

**PATCH** `/api/orders/:id/status`

> **Content-Type:** `application/json`
> **Auth:** Required (Bearer Token)

Updates the status of an order. Typically used by admin or internal systems to progress an order through its lifecycle. On success, an SSE event is automatically pushed to the user's active connections for real-time updates (see [SSE docs](./sse-order-status.md)).

**Sequential transitions are enforced:**

```
Order Received → Preparing → Out for Delivery → Delivered
```

Cancel is allowed from any active state (not Delivered or Cancelled). Backward transitions and skipping are not allowed.

### Request Body

```json
{
  "order_status": "Preparing"
}
```

### curl

```bash
curl -X PATCH http://localhost:8000/api/orders/<order-uuid>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"order_status": "Preparing"}'
```

### Validation Rules

| Field          | Type   | Required | Rules                                                                                       |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------- |
| `order_status` | string | Yes      | Must be one of: `Order Received`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled` |

### Response (200)

```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "order_code": "ORD-A7X3B2",
    "user_id": "user-uuid",
    "total_qty": 3,
    "final_amount": 460.0,
    "order_status": "Preparing",
    "created_at": "2026-02-26T05:00:00.000Z",
    "updated_at": "2026-02-26T05:10:00.000Z"
  },
  "message": "Order status updated"
}
```

### Side Effect — SSE Push

On successful update, the server pushes an `order_status_update` event to all active SSE connections for the order's user:

```
event: order_status_update
data: {"order_id":"order-uuid","order_code":"ORD-A7X3B2","order_status":"Preparing"}
```

> The user's My Orders page receives this event instantly — the badge color updates and a toast notification appears without any page refresh.

### Error (400 - Invalid Status)

```json
{
  "success": false,
  "errors": [
    "Invalid status. Must be one of: Order Received, Preparing, Out for Delivery, Delivered, Cancelled"
  ]
}
```

### Error (400 - Invalid Transition)

```json
{
  "success": false,
  "errors": [
    "Invalid transition. Current status is \"Order Received\", next allowed status is \"Preparing\". Cannot jump to \"Delivered\"."
  ]
}
```

### Error (404 - Order Not Found)

```json
{ "success": false, "errors": ["Order not found"] }
```

---

## Data Models

### Order

| Field          | Type      | Description                                      |
| -------------- | --------- | ------------------------------------------------ |
| `id`           | UUID      | Primary key, auto-generated                      |
| `order_code`   | string    | Unique, human-readable code (e.g., `ORD-A7X3B2`) |
| `user_id`      | UUID      | References `users(id)`                           |
| `total_qty`    | integer   | Total quantity across all items                  |
| `final_amount` | decimal   | Total cost of order                              |
| `order_status` | enum      | One of the statuses listed below                 |
| `created_at`   | timestamp | Auto-set on creation                             |
| `updated_at`   | timestamp | Auto-updated on modification                     |

> **Note:** The `orders` table does **not** have an `address_id` foreign key. The delivery address is snapshotted into `order_addresses` instead.

### Order Address (Snapshot)

| Field             | Type      | Description                                         |
| ----------------- | --------- | --------------------------------------------------- |
| `id`              | UUID      | Primary key, auto-generated                         |
| `order_id`        | UUID      | References `orders(id)`, CASCADE delete, **UNIQUE** |
| `save_as`         | string    | Address label (e.g., `Home`, `Work`)                |
| `pincode`         | string    | 6-digit pincode                                     |
| `city`            | string    | City name                                           |
| `state`           | string    | State name                                          |
| `house_number`    | string    | House/flat number                                   |
| `street_locality` | string    | Street and locality                                 |
| `mobile`          | string    | 10-digit mobile number                              |
| `created_at`      | timestamp | Auto-set on creation                                |

> **Why snapshot?** If the user later edits or deletes their saved address, the order's delivery address is preserved exactly as it was when placed. This is a 1:1 relationship — each order has exactly one address snapshot.

### Order Item

| Field           | Type      | Description                                   |
| --------------- | --------- | --------------------------------------------- |
| `id`            | UUID      | Primary key, auto-generated                   |
| `order_id`      | UUID      | References `orders(id)`, CASCADE delete       |
| `product_id`    | UUID      | References `products(id)`, SET NULL on delete |
| `product_name`  | string    | Snapshot of product name at order time        |
| `product_price` | decimal   | Snapshot of product price at order time       |
| `qty`           | integer   | Quantity of this product in the order         |
| `subtotal`      | decimal   | `product_price * qty`                         |
| `created_at`    | timestamp | Auto-set on creation                          |
| `updated_at`    | timestamp | Auto-updated on modification                  |

> **Note:** `product_name` and `product_price` are snapshotted at order time. This preserves accurate order history even if products are later edited or deleted.

### Order Status Values

| Status             | Description                     | Badge Color |
| ------------------ | ------------------------------- | ----------- |
| `Order Received`   | Order placed, not yet processed | 🔵 Blue     |
| `Preparing`        | Kitchen is preparing the order  | 🟠 Amber    |
| `Out for Delivery` | Order is on the way             | 🔵 Indigo   |
| `Delivered`        | Order completed                 | 🟢 Green    |
| `Cancelled`        | Order was cancelled by the user | 🔴 Red      |

### Status Transition Rules

```
Order Received → Preparing → Out for Delivery → Delivered
       ↓              ↓              ↓
   Cancelled      Cancelled      Cancelled
```

- **Forward only** — no backward transitions, no skipping steps
- **Cancel** — allowed from `Order Received`, `Preparing`, or `Out for Delivery`
- **Terminal states** — `Delivered` and `Cancelled` allow no further transitions

---

## Security Notes

1. **All endpoints require authentication** — JWT token via Bearer header or cookie.
2. **Address ownership** — Server verifies `address.user_id === authenticated_user.id` before creating an order.
3. **Address snapshot** — Delivery address is copied into `order_addresses` at order time, decoupled from the user's address book. No FK dependency on the `addresses` table.
4. **Product validation** — Each product ID is validated against the database; missing products cause a `400` error.
5. **Price integrity** — Prices are fetched from the database at order time, not from the client.
6. **Transaction safety** — Order + address snapshot + items are inserted within a PostgreSQL transaction. On failure, everything rolls back.
7. **Cancel restriction** — Only active orders (not `Delivered` or `Cancelled`) can be cancelled. Combined with user ownership check.
8. **Sequential status enforcement** — Status updates must follow the defined flow. Backward transitions and step-skipping are rejected.
9. **UUID validation** — All ID parameters are validated as proper UUIDs before hitting the database.
