# API Reference for Juice Bar POS Frontend

Quick reference guide for all API endpoints used by the frontend application.

## Base URL

```
http://localhost:8080  (Development)
```

## Authentication

All requests (except login/register) require JWT token in header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123"
}
```

**Response (201 Created):**
```json
{
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "john@example.com"
}
```

**Error (400):**
```json
{
    "timestamp": "2024-03-21T10:30:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Email already exists",
    "path": "/auth/register"
}
```

---

### Login

```http
POST /auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "securepass123"
}
```

**Response (200 OK):**
```json
{
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "john@example.com"
}
```

**Error (401):**
```json
{
    "timestamp": "2024-03-21T10:30:00Z",
    "status": 401,
    "error": "Unauthorized",
    "message": "Invalid credentials",
    "path": "/auth/login"
}
```

---

## User Endpoints

### Get User by ID

```http
GET /users/1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-03-21T09:00:00Z"
}
```

---

## Product Endpoints

### Get All Products

```http
GET /products
```

**Response (200 OK):**
```json
[
    {
        "id": "p1",
        "name": "Orange Juice",
        "price": 4.99,
        "imageUrl": "https://storage.googleapis.com/juice-bar/p1.jpg",
        "createdAt": "2024-03-21T09:00:00Z"
    },
    {
        "id": "p2",
        "name": "Apple Juice",
        "price": 4.99,
        "imageUrl": null,
        "createdAt": "2024-03-21T09:10:00Z"
    }
]
```

---

### Create Product (Regular Juice)

```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Orange Juice",
    "price": 4.99
}
```

**Response (201 Created):**
```json
{
    "id": "p1",
    "name": "Orange Juice",
    "price": 4.99,
    "imageUrl": null,
    "createdAt": "2024-03-21T09:00:00Z"
}
```

---

### Create Chips Product

```http
POST /products/chips
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Potato Chips",
    "price": 2.99
}
```

**Response (201 Created):**
```json
{
    "id": "chips1",
    "name": "Potato Chips",
    "price": 2.99,
    "imageUrl": null,
    "type": "CHIPS",
    "createdAt": "2024-03-21T09:00:00Z"
}
```

---

### Create Water Product

```http
POST /products/water
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Bottled Water",
    "price": 1.99
}
```

**Response (201 Created):**
```json
{
    "id": "water1",
    "name": "Bottled Water",
    "price": 1.99,
    "imageUrl": null,
    "type": "WATER",
    "createdAt": "2024-03-21T09:00:00Z"
}
```

---

### Upload Product Image

```http
POST /products/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
    file: <image-file>
    productId: "p1"
```

**Response (200 OK):**
```json
{
    "id": "p1",
    "name": "Orange Juice",
    "price": 4.99,
    "imageUrl": "https://storage.googleapis.com/juice-bar/p1.jpg",
    "uploadedAt": "2024-03-21T09:30:00Z"
}
```

**Error (413):**
```json
{
    "timestamp": "2024-03-21T10:30:00Z",
    "status": 413,
    "error": "Payload Too Large",
    "message": "File size exceeds 5MB limit",
    "path": "/products/upload-image"
}
```

---

## Order Endpoints

### Get Orders by User

```http
GET /orders/user/1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
    {
        "id": "order-001",
        "userId": 1,
        "productId": "p1",
        "quantity": 2,
        "totalPrice": 9.98,
        "status": "COMPLETED",
        "createdAt": "2024-03-21T10:00:00Z"
    },
    {
        "id": "order-002",
        "userId": 1,
        "productId": "p2",
        "quantity": 1,
        "totalPrice": 4.99,
        "status": "COMPLETED",
        "createdAt": "2024-03-21T10:15:00Z"
    }
]
```

---

### Place Single Order

```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
    "userId": 1,
    "productId": "p1",
    "quantity": 2
}
```

**Response (201 Created):**
```json
{
    "id": "order-001",
    "userId": 1,
    "productId": "p1",
    "quantity": 2,
    "totalPrice": 9.98,
    "status": "COMPLETED",
    "createdAt": "2024-03-21T10:00:00Z"
}
```

---

### Place Batch Orders (Different Quantities)

```http
POST /orders/different-quantity
Authorization: Bearer <token>
Content-Type: application/json

{
    "userId": 1,
    "items": [
        {
            "productId": "p1",
            "quantity": 2
        },
        {
            "productId": "p2",
            "quantity": 1
        },
        {
            "productId": "chips1",
            "quantity": 3
        }
    ]
}
```

**Response (201 Created):**
```json
[
    {
        "id": "order-001",
        "userId": 1,
        "productId": "p1",
        "quantity": 2,
        "totalPrice": 9.98,
        "status": "COMPLETED",
        "createdAt": "2024-03-21T10:00:00Z"
    },
    {
        "id": "order-002",
        "userId": 1,
        "productId": "p2",
        "quantity": 1,
        "totalPrice": 4.99,
        "status": "COMPLETED",
        "createdAt": "2024-03-21T10:00:00Z"
    },
    {
        "id": "order-003",
        "userId": 1,
        "productId": "chips1",
        "quantity": 3,
        "totalPrice": 8.97,
        "status": "COMPLETED",
        "createdAt": "2024-03-21T10:00:00Z"
    }
]
```

---

## Error Handling

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET/POST/PUT |
| 201 | Created | Successful resource creation |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not authorized for resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 413 | Payload Too Large | File too large |
| 500 | Server Error | Internal server error |

### Error Response Format

```json
{
    "timestamp": "2024-03-21T10:30:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Descriptive error message",
    "path": "/api/endpoint"
}
```

---

## JWT Token Structure

Decoded JWT token contains:

```json
{
    "sub": "1",           // User ID
    "email": "john@example.com",
    "name": "John Doe",
    "iat": 1711011000,   // Issued at
    "exp": 1711097400    // Expires at
}
```

---

## Frontend Implementation

### Making Requests

```javascript
// Using the API module
const response = await api.request('/products', {
    method: 'GET'
});

// With authentication
const response = await api.request('/orders/user/1', {
    method: 'GET'
});

// POST request
const response = await api.createProduct('Orange Juice', 4.99, 'juice');

// File upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('productId', 'p1');
const response = await api.uploadImage('p1', fileInput.files[0]);
```

### Handling Responses

```javascript
try {
    const data = await api.getProducts();
    console.log('Products:', data);
} catch (error) {
    console.error('Error:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', error.data);
}
```

---

## Rate Limiting

Currently no rate limiting implemented. For production, add:

```javascript
// Backend configuration
@Bean
public RateLimiter rateLimiter() {
    return RateLimiter.create(100);  // 100 requests per second
}
```

---

## Pagination

Currently no pagination. For large datasets, add:

```http
GET /products?page=0&size=10&sort=name,asc
```

---

## Filtering & Search

Currently basic search implemented on frontend. Backend support:

```http
GET /products?search=orange
GET /orders/user/1?status=COMPLETED
```

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'

# Get products (save token from login response first)
curl -X GET http://localhost:8080/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Create product
curl -X POST http://localhost:8080/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Orange Juice",
    "price": 4.99
  }'

# Upload image
curl -X POST http://localhost:8080/products/upload-image \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg" \
  -F "productId=p1"

# Place order
curl -X POST http://localhost:8080/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productId": "p1",
    "quantity": 2
  }'

# Get user orders
curl -X GET http://localhost:8080/orders/user/1 \
  -H "Authorization: Bearer <token>"
```

---

## Webhook Integration (Future)

```http
POST /webhooks/order-completed
Content-Type: application/json

{
    "orderId": "order-001",
    "userId": 1,
    "status": "COMPLETED",
    "timestamp": "2024-03-21T10:00:00Z"
}
```

---

## Versioning

Current API version: **v1** (implicit)

For future versions:
```
/api/v1/products
/api/v2/products
```

---

**Last Updated**: March 21, 2024
**API Version**: 1.0.0
**Frontend Version**: 1.0.0

