# Testing Documentation

> Backend API test suite built with **Jest** + **Supertest** using **ts-jest** for TypeScript support.

---

## Tech Stack

| Tool                                             | Purpose                            |
| ------------------------------------------------ | ---------------------------------- |
| [Jest](https://jestjs.io/)                       | Test runner & assertion library    |
| [Supertest](https://github.com/ladakh/supertest) | HTTP assertion library for Express |
| [ts-jest](https://kulshekhar.github.io/ts-jest/) | TypeScript preprocessor for Jest   |

---

## Setup

All test dependencies are already in `devDependencies`. Just install:

```bash
cd backend
npm install
```

### Configuration

Jest is configured via `jest.config.ts` in the backend root:

```ts
preset: "ts-jest"; // TypeScript support
testEnvironment: "node"; // Node.js environment
roots: ["<rootDir>/tests"];
testMatch: ["**/*.test.ts"];
testTimeout: 15000; // 15s per test
forceExit: true; // Kill open handles (DB connections)
```

---

## Running Tests

> ⚠️ **Important:** Stop any running backend server (`npm start` or `npm run dev`) before running tests. Both use port 8000 and will conflict.

### Run All Tests

```bash
npm test
```

### Run All Tests (Verbose Output)

```bash
npm run test:verbose
```

### Run in Watch Mode (Re-runs on file changes)

```bash
npm run test:watch
```

### Run a Single Test File

```bash
# Categories API tests
npx jest --runInBand tests/categories.test.ts --verbose

# Products API tests
npx jest --runInBand tests/products.test.ts --verbose

# Addresses API tests
npx jest --runInBand tests/addresses.test.ts --verbose

# Orders API tests
npx jest --runInBand tests/orders.test.ts --verbose

# Users API tests
npx jest --runInBand tests/users.test.ts --verbose

# Auth API tests
npx jest --runInBand tests/auth.test.ts --verbose

# Health check tests
npx jest --runInBand tests/health.test.ts --verbose
```

### Run a Specific Test by Name

```bash
# Match tests by description string
npx jest --runInBand -t "should create a product" --verbose

# Match multiple tests with partial name
npx jest --runInBand -t "should reject" --verbose
```

---

## Test Structure

```
backend/
├── tests/
│   ├── setup.ts              # Shared helpers & utilities
│   ├── health.test.ts        # Server health checks
│   ├── categories.test.ts    # Categories CRUD + validation
│   ├── products.test.ts      # Products CRUD + validation
│   ├── addresses.test.ts     # Addresses CRUD + validation
│   ├── users.test.ts         # Users CRUD + validation
│   ├── auth.test.ts          # Auth flow + protected routes
│   └── orders.test.ts        # Orders auth guards + validation
├── jest.config.ts            # Jest configuration
└── package.json              # Test scripts
```

---

## Test Coverage Summary

| Test File            |   Tests | What It Covers                                                                                                             |
| -------------------- | ------: | -------------------------------------------------------------------------------------------------------------------------- |
| `health.test.ts`     |       3 | Root `/`, health check `/api/health`, 404 for unknown routes                                                               |
| `categories.test.ts` |      20 | Full CRUD, name validation (empty, whitespace, max 50 chars, special characters, trim), UUID validation                    |
| `products.test.ts`   |      28 | Full CRUD with multipart upload, price validation (negative, max, decimals), FK constraint, name/description length limits |
| `addresses.test.ts`  |      31 | Full CRUD, pincode (6-digit), mobile (10-digit), UUID format, max field lengths, multi-error reporting, user-scoped fetch  |
| `users.test.ts`      |      16 | Full CRUD, duplicate mobile rejection (409), field presence, UUID validation                                               |
| `auth.test.ts`       |      18 | Send OTP, verify OTP, signup flow, logout, protected route guards (GET/PUT `/me`), invalid/expired tokens                  |
| `orders.test.ts`     |      13 | Auth guards on all 6 order endpoints, invalid/malformed tokens, SSE stream authentication                                  |
| **Total**            | **129** |                                                                                                                            |

---

## Shared Test Utilities (`tests/setup.ts`)

The setup file exports reusable helpers:

| Helper                                      | Purpose                                     |
| ------------------------------------------- | ------------------------------------------- |
| `api`                                       | Supertest instance bound to the Express app |
| `NON_EXISTENT_UUID`                         | Valid UUID format that doesn't exist in DB  |
| `INVALID_UUID`                              | Clearly malformed UUID string               |
| `createTestCategory(name?)`                 | Creates a category and returns it           |
| `createTestProduct(categoryId, overrides?)` | Creates a product via multipart form        |
| `createTestAddress(userId, token)`          | Creates an address with auth token          |
| `createTestUser(mobile?)`                   | Full auth flow: send OTP → verify → signup  |

---

## What Each Test Suite Validates

### Categories (`categories.test.ts`)

- ✅ Create with valid name
- ✅ Trim whitespace from name
- ✅ Reject empty body / empty string / whitespace-only
- ✅ Reject name > 50 characters
- ✅ Reject special characters (`@#$!`)
- ✅ Allow hyphens & ampersands (`Fish & Chips`)
- ✅ Reject numeric type for name
- ✅ Get all categories with correct structure
- ✅ Get by valid ID / 404 for missing / 400 for invalid UUID
- ✅ Update name / reject empty / 404 for missing
- ✅ Delete / re-delete (404) / invalid UUID (400)

### Products (`products.test.ts`)

- ✅ Create with all fields / without optional description
- ✅ Reject missing required fields (name, price, category_id)
- ✅ Price validation: negative, exceeds max (9999.99), > 2 decimal places, non-numeric
- ✅ FK constraint: non-existent category_id returns 400
- ✅ Name validation: > 50 chars, special characters
- ✅ Description validation: > 100 chars
- ✅ Partial update (name only, price only)
- ✅ Delete with image cleanup verification

### Addresses (`addresses.test.ts`)

- ✅ Create with all valid fields
- ✅ Reject every missing required field individually
- ✅ Pincode: must be exactly 6 digits (reject letters, short)
- ✅ Mobile: must be exactly 10 digits (reject short, long)
- ✅ Max length: city (50), house_number (100), street_locality (150)
- ✅ Multiple validation errors returned in single response
- ✅ Get by user ID returns empty array for unknown user
- ✅ Update validation (partial fields, invalid formats)

### Orders (`orders.test.ts`)

- ✅ All 6 endpoints reject unauthenticated requests (401)
- ✅ Invalid JWT token returns 401
- ✅ Malformed Authorization header returns 401
- ✅ SSE stream rejects without token / with invalid query token

### Auth (`auth.test.ts`)

- ✅ Send OTP with valid/invalid mobile
- ✅ Verify OTP with wrong code / missing fields
- ✅ Signup with missing/invalid temp_token
- ✅ Logout clears cookie
- ✅ GET /me and PUT /me reject without auth

---

## Sample Test Output

```
PASS tests/products.test.ts
  Products API
    POST /api/products
      √ should create a product with valid fields (40 ms)
      √ should reject missing product_name (19 ms)
      √ should reject negative price (13 ms)
      √ should reject price exceeding 9999.99 (17 ms)
      √ should reject non-existent category_id (FK violation) (26 ms)
      ...
    GET /api/products
      √ should return a list of products (99 ms)
      √ each product should have required fields (29 ms)
    DELETE /api/products/:id
      √ should delete an existing product (43 ms)
      √ should return 404 when deleting already deleted product (28 ms)

Test Suites: 7 passed, 7 total
Tests:       129 passed, 129 total
Time:        8.764 s
```

---

## NPM Scripts Reference

| Script                 | Command                      | Description                       |
| ---------------------- | ---------------------------- | --------------------------------- |
| `npm test`             | `jest --runInBand`           | Run all tests sequentially        |
| `npm run test:verbose` | `jest --runInBand --verbose` | Run with detailed per-test output |
| `npm run test:watch`   | `jest --runInBand --watch`   | Watch mode, re-run on changes     |

---

## Troubleshooting

### Port Conflict (EADDRINUSE)

```
Error: listen EADDRINUSE: address already in use :::8000
```

**Fix:** Stop the running backend server before running tests:

```bash
# If running npm start or npm run dev — stop it first (Ctrl+C)
npm test
```

### Open Handles Warning

```
Jest has detected the following 1 open handle potentially keeping Jest from exiting:
  ● TCPSERVERWRAP
```

This is expected — the Express `app.listen()` creates a TCP server that Jest detects. The `forceExit: true` in `jest.config.ts` handles this automatically.

### Database Connection Issues

Tests connect to the real PostgreSQL database using the `.env` configuration. Make sure:

1. PostgreSQL is running
2. `.env` has correct `DATABASE_URL`
3. Database tables exist (run SQL migrations first)
