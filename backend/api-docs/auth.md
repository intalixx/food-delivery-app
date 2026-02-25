# User Authentication API

Endpoints for user authentication (Login, OTP, Signup).

## 1. Send OTP

Generates and sends an OTP to the given mobile number. For testing, the OTP is fixed to `123456`.

- **URL**: `/api/auth/send-otp`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "mobile_number": "8597935676"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "OTP sent successfully"
  }
  ```

## 2. Verify OTP

Verifies the OTP and checks if the user exists. If user exists, returns user details and sets an HTTP-only JWT cookie. If not, returns `isNewUser: true`.

- **URL**: `/api/auth/verify-otp`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "mobile_number": "8597935676",
    "otp": "123456"
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
          "mobile_number": "8597935676",
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
    "mobile_number": "8597935676"
  }
  ```

## 3. Signup

Creates a new user and an associated default address (`Home` type), then logs them in by setting the `jwt` cookie.

- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "mobile_number": "8597935676",
    "user_name": "Saurav",
    "house_number": "12",
    "street_locality": "Green Park",
    "city": "Siliguri",
    "state": "West Bengal",
    "pincode": "734005"
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
