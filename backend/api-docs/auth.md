# User Authentication API

Endpoints for user authentication (Login, OTP, Signup).

## 1. Send OTP

Generates and sends a random 6-digit OTP to the given mobile number. In **login** mode, it first checks if the user exists — if not, returns a `404` with `needs_signup: true`.

- **URL**: `/api/auth/send-otp`
- **Method**: `POST`
- **Body**:

  ```json
  {
    "mobile_number": "9876543210",
    "mode": "login"
  }
  ```

  | Field           | Type   | Required | Description                                                          |
  | --------------- | ------ | -------- | -------------------------------------------------------------------- |
  | `mobile_number` | string | Yes      | 10-digit mobile number                                               |
  | `mode`          | string | No       | `"login"` or `"signup"`. When `"login"`, checks user existence first |

- **Response**: `200 OK`

  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "otp": "491965"
  }
  ```

  > ⚠️ The `otp` field is returned in the response for testing/development purposes only.

- **Error (404 — Login mode, user not found)**:

  ```json
  {
    "success": false,
    "errors": ["Account not found"],
    "needs_signup": true
  }
  ```

- **Error (400 — Invalid number)**:
  ```json
  {
    "success": false,
    "errors": ["Valid 10-digit mobile number is required"]
  }
  ```

## 2. Verify OTP

Verifies the OTP and checks if the user exists. If user exists, returns user details, a JWT token, and sets an HTTP-only `jwt` cookie. If not, returns `isNewUser: true`.

- **URL**: `/api/auth/verify-otp`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "mobile_number": "9876543210",
    "otp": "491965"
  }
  ```
- **Response (Existing User)**: `200 OK` (Sets `jwt` cookie)
  ```json
  {
      "success": true,
      "isNewUser": false,
      "user": {
          "id": "uuid",
          "user_name": "John Doe",
          "mobile_number": "9876543210",
          ...
      },
      "token": "eyJhbGci..."
  }
  ```
- **Response (New User)**: `200 OK`
  ```json
  {
    "success": true,
    "isNewUser": true,
    "message": "User not found, please proceed to signup",
    "mobile_number": "9876543210"
  }
  ```

## 3. Signup

Creates a new user and an associated default address (`Home` type), then logs them in by setting the `jwt` cookie.

- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "mobile_number": "9876543210",
    "user_name": "Sudip",
    "house_number": "42",
    "street_locality": "FC Road, Shivajinagar",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411005"
  }
  ```
- **Response**: `201 Created` (Sets `jwt` cookie)
  ```json
  {
      "success": true,
      "user": { ... },
      "address": { ... },
      "token": "eyJhbGci..."
  }
  ```

## 4. Logout

Clears the `jwt` authentication cookie.

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

## 5. Get Current User (Me)

Returns the details of the currently authenticated user based on the `jwt` cookie or `Authorization: Bearer <token>` header.

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
      "success": true,
      "data": { ... }
  }
  ```
