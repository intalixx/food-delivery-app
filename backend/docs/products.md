# Products API

Base URL: `http://localhost:8000/api/products`

> ⚠️ **Important:** Create and Update endpoints use `multipart/form-data` (not JSON) because of image upload support.

---

## 1. Get All Products

**GET** `/api/products`

### Request

```bash
curl http://localhost:8000/api/products
```

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "f7e8d9c0-b1a2-4c3d-8e5f-6a7b8c9d0e1f",
      "product_name": "Avocado Salad",
      "description": "Fresh avocado with cherry tomatoes and mixed greens",
      "price": "120.00",
      "image_path": "/uploads/product-1740472800000-123456789.jpg",
      "category_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "created_at": "2026-02-25T12:00:00.000Z",
      "updated_at": "2026-02-25T12:00:00.000Z"
    }
  ]
}
```

> **Image URL:** Access uploaded images at `http://localhost:8000/uploads/<filename>`

---

## 2. Get Product by ID

**GET** `/api/products/:id`

### Request

```bash
curl http://localhost:8000/api/products/f7e8d9c0-b1a2-4c3d-8e5f-6a7b8c9d0e1f
```

### Response (200)

```json
{
  "success": true,
  "data": {
    "id": "f7e8d9c0-b1a2-4c3d-8e5f-6a7b8c9d0e1f",
    "product_name": "Avocado Salad",
    "description": "Fresh avocado with cherry tomatoes and mixed greens",
    "price": "120.00",
    "image_path": "/uploads/product-1740472800000-123456789.jpg",
    "category_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "created_at": "2026-02-25T12:00:00.000Z",
    "updated_at": "2026-02-25T12:00:00.000Z"
  }
}
```

### Error (404)

```json
{ "success": false, "errors": ["Product not found"] }
```

### Error (400 - Invalid UUID)

```json
{ "success": false, "errors": ["Invalid ID format"] }
```

---

## 3. Create Product

**POST** `/api/products`

> **Content-Type:** `multipart/form-data`

### Postman Setup

1. Set method to **POST** and URL to `http://localhost:8000/api/products`
2. Go to **Body** tab → select **form-data**
3. Add the following fields:

| Key            | Type | Value                                  |
| -------------- | ---- | -------------------------------------- |
| `product_name` | Text | `Avocado Salad`                        |
| `description`  | Text | `Fresh avocado with cherry tomatoes`   |
| `price`        | Text | `120`                                  |
| `category_id`  | Text | `a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d` |
| `image`        | File | _(select an image file)_               |

### curl

```bash
curl -X POST http://localhost:8000/api/products \
  -F "product_name=Avocado Salad" \
  -F "description=Fresh avocado with cherry tomatoes" \
  -F "price=120" \
  -F "category_id=a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d" \
  -F "image=@/path/to/image.jpg"
```

### Body Fields

| Field          | Type | Required | Rules                                                        |
| -------------- | ---- | -------- | ------------------------------------------------------------ |
| `product_name` | text | Yes      | Max 50 chars. Only letters, numbers, spaces, `-`, `&`, `'`   |
| `description`  | text | No       | Max 100 chars                                                |
| `price`        | text | Yes      | 0 – 9999.99, max 2 decimal places                            |
| `category_id`  | text | Yes      | Must be valid UUID of an existing category                   |
| `image`        | file | No       | Max 5 MB. Allowed: jpeg, jpg, png, gif, webp, svg, bmp, tiff |

### Response (201)

```json
{
  "success": true,
  "data": {
    "id": "f7e8d9c0-b1a2-4c3d-8e5f-6a7b8c9d0e1f",
    "product_name": "Avocado Salad",
    "description": "Fresh avocado with cherry tomatoes",
    "price": "120.00",
    "image_path": "/uploads/product-1740472800000-123456789.jpg",
    "category_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "created_at": "2026-02-25T12:00:00.000Z",
    "updated_at": "2026-02-25T12:00:00.000Z"
  }
}
```

### Error (400 - Validation)

```json
{
  "success": false,
  "errors": [
    "product_name is required and must be a string",
    "price is required",
    "category_id is required and must be a string"
  ]
}
```

### Error (400 - Image too large)

```json
{ "success": false, "errors": ["Image size must not exceed 5 MB"] }
```

### Error (400 - Invalid image type)

```json
{
  "success": false,
  "errors": [
    "Only image files are allowed (jpeg, jpg, png, gif, webp, svg, bmp, tiff)"
  ]
}
```

### Error (400 - Invalid Category)

```json
{ "success": false, "errors": ["Invalid category_id: category does not exist"] }
```

---

## 4. Update Product

**PUT** `/api/products/:id`

> **Content-Type:** `multipart/form-data`

### Postman Setup

1. Set method to **PUT** and URL to `http://localhost:8000/api/products/:id`
2. Go to **Body** tab → select **form-data**
3. Add only the fields you want to update:

| Key     | Type | Value                |
| ------- | ---- | -------------------- |
| `price` | Text | `150`                |
| `image` | File | _(select new image)_ |

> When a new image is uploaded, the old image file is automatically deleted.

### curl (Partial Update)

```bash
curl -X PUT http://localhost:8000/api/products/f7e8d9c0-b1a2-4c3d-8e5f-6a7b8c9d0e1f \
  -F "price=150"
```

### curl (Full Update with new image)

```bash
curl -X PUT http://localhost:8000/api/products/f7e8d9c0-b1a2-4c3d-8e5f-6a7b8c9d0e1f \
  -F "product_name=Green Salad" \
  -F "description=Crisp lettuce with cucumber" \
  -F "price=100" \
  -F "category_id=a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d" \
  -F "image=@/path/to/new-image.png"
```

### Body (all fields optional, at least one required)

| Field          | Type | Required | Rules                                                        |
| -------------- | ---- | -------- | ------------------------------------------------------------ |
| `product_name` | text | No       | Max 50 chars. Only letters, numbers, spaces, `-`, `&`, `'`   |
| `description`  | text | No       | Max 100 chars                                                |
| `price`        | text | No       | 0 – 9999.99, max 2 decimal places                            |
| `category_id`  | text | No       | Must be valid UUID of an existing category                   |
| `image`        | file | No       | Max 5 MB. Allowed: jpeg, jpg, png, gif, webp, svg, bmp, tiff |

### Response (200)

```json
{
  "success": true,
  "data": {
    "id": "f7e8d9c0-b1a2-4c3d-8e5f-6a7b8c9d0e1f",
    "product_name": "Green Salad",
    "description": "Crisp lettuce with cucumber",
    "price": "100.00",
    "image_path": "/uploads/product-1740472900000-987654321.png",
    "category_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "created_at": "2026-02-25T12:00:00.000Z",
    "updated_at": "2026-02-25T12:10:00.000Z"
  }
}
```

### Error (404)

```json
{ "success": false, "errors": ["Product not found"] }
```

---

## 5. Delete Product

**DELETE** `/api/products/:id`

> The associated image file is automatically deleted from the server.

### Request

```bash
curl -X DELETE http://localhost:8000/api/products/f7e8d9c0-b1a2-4c3d-8e5f-6a7b8c9d0e1f
```

### Response (200)

```json
{ "success": true, "message": "Product deleted successfully" }
```

### Error (404)

```json
{ "success": false, "errors": ["Product not found"] }
```

---

## Validation Rules Summary

| Field          | Max Length | Allowed Characters                        | Other Rules                               |
| -------------- | ---------- | ----------------------------------------- | ----------------------------------------- |
| `product_name` | 50         | Letters, numbers, spaces, `-`, `&`, `'`   | Required on create, trimmed               |
| `description`  | 100        | Any text                                  | Optional, trimmed                         |
| `price`        | —          | Numbers only                              | 0–9999.99, 2 dp max                       |
| `category_id`  | —          | UUID v4 format                            | Must exist in DB                          |
| `image`        | 5 MB       | jpeg, jpg, png, gif, webp, svg, bmp, tiff | Optional, old file auto-deleted on update |
