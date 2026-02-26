# SSE — Real-Time Order Status Updates

Base URL: `http://localhost:8000/api/orders`

> ⚠️ **All SSE endpoints require authentication.** Since `EventSource` cannot send custom headers, the JWT token is passed as a query parameter `?token=<jwt>`.

---

## Architecture Overview

```
┌─────────────┐     SSE Connection      ┌─────────────────┐
│   Frontend   │ ◄──────────────────────  │   SSE Manager   │
│ (EventSource)│   text/event-stream     │   (Singleton)   │
└──────┬───────┘                         └────────┬────────┘
       │                                          │
       │ GET /api/orders/stream?token=xxx         │ sendToUser(userId, event, data)
       │                                          │
       ▼                                          ▲
┌──────────────┐                         ┌────────┴────────┐
│  Auth Middle  │                         │Order Controller │
│   ware       │                         │ (updateStatus)  │
└──────────────┘                         └─────────────────┘
```

### How It Works

1. **Connection**: User opens the My Orders page → Frontend creates an `EventSource` to `/api/orders/stream?token=<jwt>`
2. **Registration**: Backend authenticates the token, sets SSE headers, and registers the connection in `SSEManager`
3. **Status Change**: When an order status is updated via `PATCH /api/orders/:id/status`, the controller calls `sseManager.sendToUser()`
4. **Push Event**: `SSEManager` finds all active connections for that `user_id` and writes the event to their response stream
5. **Client Receives**: Frontend's `EventSource` fires the `order_status_update` listener → updates UI instantly + shows toast
6. **Cleanup**: When the user leaves the page, `EventSource.close()` fires → backend detects `res.on('close')` → removes client from pool

---

## 1. SSE Stream — Connect

**GET** `/api/orders/stream?token=<jwt>`

> **Auth:** Required (JWT via query parameter)
> **Response Type:** `text/event-stream` (persistent connection)

Opens a persistent SSE connection for the authenticated user. The server will push `order_status_update` events whenever one of the user's orders changes status.

### curl (for testing)

```bash
curl -N "http://localhost:8000/api/orders/stream?token=<your-jwt-token>"
```

> `-N` disables output buffering so events appear immediately.

### Connection Headers (set by server)

| Header              | Value               | Purpose                                      |
| ------------------- | ------------------- | -------------------------------------------- |
| `Content-Type`      | `text/event-stream` | SSE protocol                                 |
| `Cache-Control`     | `no-cache`          | Prevent caching                              |
| `Connection`        | `keep-alive`        | Persistent connection                        |
| `X-Accel-Buffering` | `no`                | Disable Nginx buffering (if reverse-proxied) |

### Initial Event (on connect)

```
event: connected
data: {"message":"SSE connected"}
```

### Keep-Alive Ping (every 30 seconds)

```
: ping
```

> SSE comments (lines starting with `:`) are ignored by the client but keep the connection alive, preventing proxy/firewall timeouts.

### Error (401 — Invalid Token)

```json
{ "success": false, "errors": ["Not authorized, token failed"] }
```

---

## 2. SSE Event — `order_status_update`

Pushed to the user whenever any of their orders changes status.

### Event Format

```
event: order_status_update
data: {"order_id":"<uuid>","order_code":"ORD-A7X3B2","order_status":"Preparing"}
```

### Event Data Fields

| Field          | Type   | Description                                    |
| -------------- | ------ | ---------------------------------------------- |
| `order_id`     | UUID   | The order that was updated                     |
| `order_code`   | string | Human-readable order code (e.g., `ORD-A7X3B2`) |
| `order_status` | string | New status value                               |

### Possible `order_status` Values

| Status             | Triggered By         | Cancel Button |
| ------------------ | -------------------- | ------------- |
| `Order Received`   | Order placed by user | ✅ Visible    |
| `Preparing`        | Admin/system update  | ❌ Hidden     |
| `Out for Delivery` | Admin/system update  | ❌ Hidden     |
| `Delivered`        | Admin/system update  | ❌ Hidden     |
| `Cancelled`        | User cancellation    | ❌ Hidden     |

---

## 3. Trigger — Update Order Status

**PATCH** `/api/orders/:id/status`

> **Auth:** Required (Bearer Token)
> **Content-Type:** `application/json`

Updates an order's status and broadcasts the change to the user via SSE in real-time.

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

After a successful status update, the server automatically pushes the following event to all active SSE connections for that order's `user_id`:

```
event: order_status_update
data: {"order_id":"order-uuid","order_code":"ORD-A7X3B2","order_status":"Preparing"}
```

### Error (400 — Invalid Status)

```json
{
  "success": false,
  "errors": [
    "Invalid status. Must be one of: Order Received, Preparing, Out for Delivery, Delivered, Cancelled"
  ]
}
```

### Error (404 — Order Not Found)

```json
{ "success": false, "errors": ["Order not found"] }
```

---

## Frontend Integration

### Connecting to SSE (React)

```tsx
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

useEffect(() => {
  const token = Cookies.get("auth_token");
  if (!token) return;

  const url = `${API_BASE_URL}/orders/stream?token=${encodeURIComponent(token)}`;
  const es = new EventSource(url);

  // Listen for order status updates
  es.addEventListener("order_status_update", (event) => {
    const data = JSON.parse(event.data);
    // data.order_id, data.order_code, data.order_status

    // Update local state (no page refresh!)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === data.order_id ? { ...o, order_status: data.order_status } : o,
      ),
    );

    // Show toast notification
    toast.info(`${data.order_code} — ${data.order_status}`);
  });

  // Auto-reconnect is built into EventSource
  es.onerror = () =>
    console.warn("SSE connection error, will auto-reconnect...");

  // Cleanup on unmount
  return () => es.close();
}, [isAuthenticated]);
```

### Key Behaviors

| Behavior               | How                                                                             |
| ---------------------- | ------------------------------------------------------------------------------- |
| **Auto-reconnect**     | Built into browser's `EventSource` API — reconnects automatically on disconnect |
| **No page refresh**    | State is updated in memory via `setOrders()`                                    |
| **Toast notification** | `toast.info()` shows order code + new status                                    |
| **Badge color update** | `OrderStatusBadge` re-renders with new status → color changes instantly         |
| **Connection cleanup** | `useEffect` return function calls `es.close()` on page unmount                  |

---

## Backend Components

### SSEManager (`utils/sseManager.ts`)

Singleton class managing all active SSE connections.

| Method           | Signature                                              | Description                              |
| ---------------- | ------------------------------------------------------ | ---------------------------------------- |
| `addClient`      | `(userId: string, res: Response) → void`               | Register a new SSE connection            |
| `sendToUser`     | `(userId: string, event: string, data: object) → void` | Push event to all connections for a user |
| `getClientCount` | `() → number`                                          | Get total connected client count         |

**Auto-cleanup:** When a client disconnects, the `res.on('close')` handler removes them from the pool. No manual cleanup needed.

**Multi-tab support:** If a user has the My Orders page open in multiple tabs, each tab gets its own SSE connection and receives events independently.

### Auth for SSE

Since the browser's `EventSource` API **cannot** send custom HTTP headers (no `Authorization: Bearer <token>`), authentication is handled via query parameter:

```
GET /api/orders/stream?token=<jwt>
```

The `protect` middleware checks tokens in this order:

1. `req.cookies.jwt` — Cookie
2. `req.headers.authorization` — Bearer header
3. `req.query.token` — Query parameter ← **used by SSE**

---

## Testing SSE Manually

### Step 1: Open SSE connection in one terminal

```bash
curl -N "http://localhost:8000/api/orders/stream?token=<jwt>"
```

You should see:

```
event: connected
data: {"message":"SSE connected"}
```

### Step 2: Trigger a status update in another terminal

```bash
curl -X PATCH http://localhost:8000/api/orders/<order-uuid>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"order_status": "Preparing"}'
```

### Step 3: Observe — The first terminal instantly receives:

```
event: order_status_update
data: {"order_id":"<uuid>","order_code":"ORD-XXXXXX","order_status":"Preparing"}
```

---

## Security Notes

1. **Token in URL**: Query parameter tokens are visible in server logs and browser history. For production, consider implementing cookie-based SSE auth or a short-lived SSE token exchange.
2. **User isolation**: Each user only receives events for their own orders — `sendToUser()` filters by `userId`.
3. **Connection limits**: No explicit limit on SSE connections per user. For high-traffic production, consider adding connection caps.
4. **Keep-alive**: 30-second ping prevents proxy timeouts. Adjust `setInterval` if behind a proxy with different timeout settings.
5. **Graceful cleanup**: Connections are auto-removed on `res.close`. Server restart clears all connections — `EventSource` auto-reconnects.
