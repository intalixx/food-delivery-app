# Food Delivery App - Order Management System

This project is a complete Order Management System for a Food Delivery App, consisting of a Node.js/Express backend and a React/Vite frontend. It allows users to browse a menu, add items to their cart, enter delivery details, place an order, and track their order's status in simulated real-time.

---

## 🚀 Features

### 1. Menu Display

- Interactive list of food items showing names, descriptions, prices, and images.
- Responsive design tailored for smooth UX on both mobile and desktop.

### 2. Order Placement (Cart System)

- Users can add items to their cart and dynamically update quantities.
- Calculates correct subtotals in real-time.
- Checkout system that validates user delivery details (name, address, phone number).

### 3. Order Status & Real-Time Tracking

- Once an order is placed, users are redirected to a comprehensive status page.
- Status updates (e.g., "Order Received", "Preparing", "Out for Delivery") are trackable.
- Simulated real-time architectural components built-in to immediately push status changes to the client.

### 4. Robust Backend API

- RESTful, easily extensible API built with Express.js and TypeScript.
- Clean separation of concerns (Routes → Controllers → Services).
- In-memory data store implementation for simple, fast testing, abstracted to allow easy swapping to PostgreSQL/MongoDB.

### 5. High Test Coverage (TDD)

- The project implements Test-Driven Development (TDD) best practices.
- **Backend**: Thoroughly tested using Jest (covering CRUD operations, business logic, validation).
- **Frontend**: Component and hook testing implemented using Vitest and React Testing Library.

---

## 📂 Folder Structure

The project is structured into a "monorepo-style" layout separating the `frontend` and `backend` codebases to assure strict modularity.

```
food-delivery-app/
│
├── backend/                   # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/       # HTTP logic (req, res handling & validation)
│   │   ├── routes/            # Express route declarations
│   │   ├── services/          # Core business logic and database abstractions
│   │   ├── models/            # Type definitions and Mock DB interfaces
│   │   └── utils/             # Helper functions (API response handlers, etc.)
│   ├── tests/                 # Jest test suites for API and business logic
│   ├── package.json           # Backend dependencies and scripts
│   └── server.ts              # Entry point for the Node server
│
├── frontend/                  # React + Vite + TypeScript application
│   ├── src/
│   │   ├── components/        # Reusable UI components (Buttons, Modals, Cards)
│   │   ├── context/           # React Context (Auth State, Global App State)
│   │   ├── hooks/             # Custom React Hooks (e.g., useCart)
│   │   ├── pages/             # Distinct screen views (Menu, Cart, Checkout, Status)
│   │   ├── services/          # HTTP request wrappers (Frontend API calls)
│   │   └── tests/             # Vitest & React Testing Library specifications
│   ├── package.json           # Frontend dependencies and scripts
│   ├── vite.config.ts         # Vite bundler and Vitest configuration
│   └── index.html             # Main HTML entry file
│
├── .gitignore                 # Repo-wide gitignore rules
└── README.md                  # Project documentation (You are here!)
```

---

## 💻 Tech Stack

### Frontend:

- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Radix UI Primitives, Lucide Icons
- **Testing:** Vitest, React Testing Library
- **State Management:** React Context API & Custom Hooks

### Backend:

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Testing:** Jest, Supertest
- **Architecture:** Controller-Service Layer Pattern

---

## 🛠️ Setup & Installation

Follow these steps to get the application running locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes with Node.js)

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd food-delivery-app
```

### 2. Setting up the Backend

Open a new terminal window and navigate to the backend folder:

```bash
cd backend
npm install
```

Start the backend server in development mode:

```bash
npm run dev
```

_The backend API will run on `http://localhost:5000` (or whichever port is configured)._

### 3. Setting up the Frontend

Open another terminal window and navigate to the frontend folder:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

_The React application will be accessible at `http://localhost:5173`._

---

## 🧪 Running Tests

Both the frontend and backend strictly adhere to TDD formatting and have dedicated test commands.

### Backend Tests

In the `backend` directory, run:

```bash
npm run test          # Run all Jest tests
npm run test:watch    # Run in watch mode for active development
npx jest --runInBand <filename> --verbose # Run a specific test file, e.g., npx jest --runInBand tests/orders.test.ts --verbose
```

### Frontend Tests

In the `frontend` directory, run:

```bash
npm run test          # Run Vitest test suite
npm run test:ui       # Run Vitest tests with the Vitest UI dashboard
```

---

## 🤝 Using the Application

1. **Browse the Menu:** When the frontend loads, you will be presented with a list of food items.
2. **Add to Cart:** Click the add buttons. You can manage your quantities from the cart modal/page.
3. **Checkout:** Proceed to checkout, enter the dummy delivery information, and click submit.
4. **Track Order:** You will be routed to the tracking page where you can see the initial state of your dispatched order.
