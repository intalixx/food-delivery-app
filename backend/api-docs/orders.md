# Orders API

Base URL: `http://localhost:8000/api/orders`

> ⚠️ **All order endpoints require authentication.** Include the JWT token as a Bearer token in the `Authorization` header or as a `jwt` cookie.

---

## 1. Place Order (Checkout)

**POST** `/api/orders`

> **Content-Type:** `application/json`
> **Auth:** Required (Bearer Token)

Creates a new order with items. The server validates product existence, snapshots current prices from the database, verifies address ownership, and wraps everything in a database transaction.

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
    "address_id": "address-uuid",
    "total_qty": 3,
    "final_amount": 460.0,
    "order_status": "Order Received",
    "created_at": "2026-02-26T05:00:00.000Z",
    "updated_at": "2026-02-26T05:00:00.000Z",
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

Returns all orders for the authenticated user, sorted by most recent first. Each order includes its items.

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
      "address_id": "address-uuid",
      "total_qty": 3,
      "final_amount": 460.0,
      "order_status": "Order Received",
      "created_at": "2026-02-26T05:00:00.000Z",
      "updated_at": "2026-02-26T05:00:00.000Z",
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

Returns a single order with its items. The order must belong to the authenticated user.

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
    "address_id": "address-uuid",
    "total_qty": 3,
    "final_amount": 460.00,
    "order_status": "Preparing",
    "created_at": "2026-02-26T05:00:00.000Z",
    "updated_at": "2026-02-26T05:10:00.000Z",
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

Cancels an order. **Only orders with status `Order Received` can be cancelled.** Orders that have progressed to `Preparing`, `Out for Delivery`, or `Delivered` cannot be cancelled.

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
    "address_id": "address-uuid",
    "total_qty": 3,
    "final_amount": 460.0,
    "order_status": "Cancelled",
    "created_at": "2026-02-26T05:00:00.000Z",
    "updated_at": "2026-02-26T05:15:00.000Z"
  },
  "message": "Order cancelled successfully"
}
```

### Error (400 - Cannot Cancel)

```json
{
  "success": false,
  "errors": [
    "Cannot cancel this order. It may have already been processed or does not exist."
  ]
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
    "address_id": "address-uuid",
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
| `address_id`   | UUID      | References `addresses(id)`                       |
| `total_qty`    | integer   | Total quantity across all items                  |
| `final_amount` | decimal   | Total cost of order                              |
| `order_status` | enum      | One of the statuses listed below                 |
| `created_at`   | timestamp | Auto-set on creation                             |
| `updated_at`   | timestamp | Auto-updated on modification                     |

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

---

## Security Notes

1. **All endpoints require authentication** — JWT token via Bearer header or cookie.
2. **Address ownership** — Server verifies `address.user_id === authenticated_user.id` before creating an order.
3. **Product validation** — Each product ID is validated against the database; missing products cause a `400` error.
4. **Price integrity** — Prices are fetched from the database at order time, not from the client.
5. **Transaction safety** — Order + items are inserted within a PostgreSQL transaction. On failure, everything rolls back.
6. **Cancel restriction** — Only `Order Received` status allows cancellation. Combined with user ownership check.
7. **UUID validation** — All ID parameters are validated as proper UUIDs before hitting the database.
