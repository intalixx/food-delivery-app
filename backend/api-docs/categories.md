# Categories API

Base URL: `http://localhost:8000/api/categories`

---

## 1. Get All Categories

**GET** `/api/categories`

### Request

```bash
curl http://localhost:8000/api/categories
```

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "category_name": "Salads",
      "created_at": "2026-02-25T12:00:00.000Z",
      "updated_at": "2026-02-25T12:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Category by ID

**GET** `/api/categories/:id`

### Request

```bash
curl http://localhost:8000/api/categories/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d
```

### Response (200)

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "category_name": "Salads",
    "created_at": "2026-02-25T12:00:00.000Z",
    "updated_at": "2026-02-25T12:00:00.000Z"
  }
}
```

### Error (404)

```json
{
  "success": false,
  "errors": ["Category not found"]
}
```

### Error (400 - Invalid UUID)

```json
{
  "success": false,
  "errors": ["Invalid ID format"]
}
```

---

## 3. Create Category

**POST** `/api/categories`

### Request

```bash
curl -X POST http://localhost:8000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"category_name": "Salads"}'
```

### Body

| Field           | Type   | Required | Rules                                                      |
| --------------- | ------ | -------- | ---------------------------------------------------------- |
| `category_name` | string | Yes      | Max 50 chars. Only letters, numbers, spaces, `-`, `&`, `'` |

### Response (201)

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "category_name": "Salads",
    "created_at": "2026-02-25T12:00:00.000Z",
    "updated_at": "2026-02-25T12:00:00.000Z"
  }
}
```

### Error (400 - Validation)

```json
{
  "success": false,
  "errors": ["category_name is required and must be a string"]
}
```

### Error (409 - Duplicate)

```json
{
  "success": false,
  "errors": ["Category name already exists"]
}
```

---

## 4. Update Category

**PUT** `/api/categories/:id`

### Request

```bash
curl -X PUT http://localhost:8000/api/categories/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d \
  -H "Content-Type: application/json" \
  -d '{"category_name": "Burgers"}'
```

### Body

| Field           | Type   | Required | Rules                                                      |
| --------------- | ------ | -------- | ---------------------------------------------------------- |
| `category_name` | string | Yes      | Max 50 chars. Only letters, numbers, spaces, `-`, `&`, `'` |

### Response (200)

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "category_name": "Burgers",
    "created_at": "2026-02-25T12:00:00.000Z",
    "updated_at": "2026-02-25T12:05:00.000Z"
  }
}
```

### Error (404)

```json
{
  "success": false,
  "errors": ["Category not found"]
}
```

### Error (409 - Duplicate)

```json
{
  "success": false,
  "errors": ["Category name already exists"]
}
```

---

## 5. Delete Category

**DELETE** `/api/categories/:id`

> ⚠️ This will also delete all products under this category (CASCADE).

### Request

```bash
curl -X DELETE http://localhost:8000/api/categories/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d
```

### Response (200)

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

### Error (404)

```json
{
  "success": false,
  "errors": ["Category not found"]
}
```
