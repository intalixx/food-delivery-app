# Users API

Base URL: `http://localhost:8000/api/users`

> ⚠️ Create and Update use `multipart/form-data` for image upload support.

---

## 1. Get All Users

**GET** `/api/users`

```bash
curl http://localhost:8000/api/users
```

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "user_name": "Sudip Santra",
      "mobile_number": "+91 9876543210",
      "email": "sudip@example.com",
      "gender": "male",
      "image_path": "/uploads/users/user-1740472800000-123456789.jpg",
      "created_at": "2026-02-25T12:00:00.000Z",
      "updated_at": "2026-02-25T12:00:00.000Z"
    }
  ]
}
```

---

## 2. Get User by ID

**GET** `/api/users/:id`

```bash
curl http://localhost:8000/api/users/<uuid>
```

### Response (200)

```json
{ "success": true, "data": { ... } }
```

### Error (404)

```json
{ "success": false, "errors": ["User not found"] }
```

---

## 3. Create User

**POST** `/api/users`

> **Content-Type:** `multipart/form-data`

### Postman Setup

| Key             | Type | Value               |
| --------------- | ---- | ------------------- |
| `user_name`     | Text | `Sudip Santra`      |
| `mobile_number` | Text | `+91 9876543210`    |
| `email`         | Text | `sudip@example.com` |
| `gender`        | Text | `male`              |
| `image`         | File | _(select image)_    |

### curl

```bash
curl -X POST http://localhost:8000/api/users \
  -F "user_name=Sudip Santra" \
  -F "mobile_number=+91 9876543210" \
  -F "email=sudip@example.com" \
  -F "gender=male" \
  -F "image=@/path/to/photo.jpg"
```

### Validation Rules

| Field           | Type | Required | Rules                                                    |
| --------------- | ---- | -------- | -------------------------------------------------------- |
| `user_name`     | text | Yes      | Max 50 chars. Letters, spaces, hyphens, apostrophes only |
| `mobile_number` | text | Yes      | Max 15 chars. **Must be unique.** Valid phone format     |
| `email`         | text | No       | Max 100 chars. Valid email format                        |
| `gender`        | text | No       | Must be `male` or `female`                               |
| `image`         | file | No       | Max 5 MB. jpeg, jpg, png, gif, webp, svg, bmp, tiff      |

### Response (201)

```json
{ "success": true, "data": { ... } }
```

### Error (409 - Duplicate Mobile)

```json
{ "success": false, "errors": ["Mobile number already registered"] }
```

### Error (400 - Validation)

```json
{
  "success": false,
  "errors": [
    "user_name can only contain letters, spaces, hyphens, and apostrophes",
    "mobile_number must be a valid phone number"
  ]
}
```

---

## 4. Update User

**PUT** `/api/users/:id`

> **Content-Type:** `multipart/form-data`

### Postman Setup (partial update)

| Key         | Type | Value       |
| ----------- | ---- | ----------- |
| `user_name` | Text | `New Name`  |
| `image`     | File | _(new img)_ |

```bash
curl -X PUT http://localhost:8000/api/users/<uuid> \
  -F "user_name=New Name" \
  -F "image=@/path/to/new-photo.jpg"
```

> Old image is auto-deleted when a new one is uploaded.

### Response (200)

```json
{ "success": true, "data": { ... } }
```

### Error (409)

```json
{ "success": false, "errors": ["Mobile number already registered"] }
```

---

## 5. Delete User

**DELETE** `/api/users/:id`

> ⚠️ Deletes user image and all associated addresses (CASCADE).

```bash
curl -X DELETE http://localhost:8000/api/users/<uuid>
```

### Response (200)

```json
{ "success": true, "message": "User deleted successfully" }
```

### Error (404)

```json
{ "success": false, "errors": ["User not found"] }
```
