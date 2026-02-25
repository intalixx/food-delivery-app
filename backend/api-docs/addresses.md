# Addresses API

Base URL: `http://localhost:8000/api/addresses`

---

## 1. Get All Addresses

**GET** `/api/addresses`

```bash
curl http://localhost:8000/api/addresses
```

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "user_id": "user-uuid-here",
      "address_type": "Home",
      "location": "Home",
      "pincode": "110016",
      "city": "New Delhi",
      "state": "Delhi",
      "house_number": "123, Green Park",
      "street_locality": "South Delhi",
      "mobile": "+91 9876543210",
      "created_at": "2026-02-25T12:00:00.000Z",
      "updated_at": "2026-02-25T12:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Address by ID

**GET** `/api/addresses/:id`

```bash
curl http://localhost:8000/api/addresses/<uuid>
```

### Response (200)

```json
{ "success": true, "data": { ... } }
```

### Error (404)

```json
{ "success": false, "errors": ["Address not found"] }
```

---

## 3. Get Addresses by User ID

**GET** `/api/addresses/user/:userId`

> Returns all addresses belonging to a specific user.

```bash
curl http://localhost:8000/api/addresses/user/<user-uuid>
```

### Response (200)

```json
{
  "success": true,
  "data": [
    { ... },
    { ... }
  ]
}
```

---

## 4. Create Address

**POST** `/api/addresses`

> **Content-Type:** `application/json`

### Request Body

```json
{
  "user_id": "user-uuid-here",
  "address_type": "Home",
  "location": "Home",
  "pincode": "110016",
  "city": "New Delhi",
  "state": "Delhi",
  "house_number": "123, Green Park",
  "street_locality": "South Delhi",
  "mobile": "+91 9876543210"
}
```

### curl

```bash
curl -X POST http://localhost:8000/api/addresses \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid-here",
    "address_type": "Home",
    "location": "Home",
    "pincode": "110016",
    "city": "New Delhi",
    "state": "Delhi",
    "house_number": "123, Green Park",
    "street_locality": "South Delhi",
    "mobile": "+91 9876543210"
  }'
```

### Validation Rules

| Field             | Type   | Required | Rules                               |
| ----------------- | ------ | -------- | ----------------------------------- |
| `user_id`         | string | Yes      | Must be valid UUID of existing user |
| `address_type`    | string | Yes      | Must be `Home`, `Work`, or `Other`  |
| `location`        | string | No       | Max 100 chars                       |
| `pincode`         | string | Yes      | 4-10 digits only                    |
| `city`            | string | Yes      | Max 50 chars                        |
| `state`           | string | Yes      | Max 50 chars                        |
| `house_number`    | string | Yes      | Max 100 chars                       |
| `street_locality` | string | Yes      | Max 150 chars                       |
| `mobile`          | string | Yes      | Valid phone format, max 15 chars    |

### Response (201)

```json
{ "success": true, "data": { ... } }
```

### Error (400 - Invalid User)

```json
{ "success": false, "errors": ["Invalid user_id: user does not exist"] }
```

### Error (400 - Validation)

```json
{
  "success": false,
  "errors": [
    "pincode must be 4-10 digits",
    "city is required and must be a string",
    "address_type must be one of: Home, Work, Other"
  ]
}
```

---

## 5. Update Address

**PUT** `/api/addresses/:id`

> **Content-Type:** `application/json`

### Request Body (partial — only fields to update)

```json
{
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

### curl

```bash
curl -X PUT http://localhost:8000/api/addresses/<uuid> \
  -H "Content-Type: application/json" \
  -d '{"city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}'
```

### Body (all optional, at least one required)

| Field             | Type   | Required | Rules                              |
| ----------------- | ------ | -------- | ---------------------------------- |
| `address_type`    | string | No       | Must be `Home`, `Work`, or `Other` |
| `location`        | string | No       | Max 100 chars                      |
| `pincode`         | string | No       | 4-10 digits only                   |
| `city`            | string | No       | Max 50 chars                       |
| `state`           | string | No       | Max 50 chars                       |
| `house_number`    | string | No       | Max 100 chars                      |
| `street_locality` | string | No       | Max 150 chars                      |
| `mobile`          | string | No       | Valid phone format                 |

> ⚠️ `user_id` cannot be changed via update.

### Response (200)

```json
{ "success": true, "data": { ... } }
```

### Error (404)

```json
{ "success": false, "errors": ["Address not found"] }
```

---

## 6. Delete Address

**DELETE** `/api/addresses/:id`

```bash
curl -X DELETE http://localhost:8000/api/addresses/<uuid>
```

### Response (200)

```json
{ "success": true, "message": "Address deleted successfully" }
```

### Error (404)

```json
{ "success": false, "errors": ["Address not found"] }
```
