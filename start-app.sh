#!/bin/bash
# ============================================
#  Intalix - Food Delivery App Startup Script
# ============================================

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  Intalix - Food Delivery App"
echo "  ==========================="
echo ""

# ---- Check Node.js ----
if ! command -v node &> /dev/null; then
    echo "  [✗] Node.js is not installed."
    echo "      Download it from https://nodejs.org"
    echo ""
    exit 1
fi
NODE_VERSION=$(node -v)
echo "  [✓] Node.js $NODE_VERSION detected"

# ---- Check .env ----
if [ ! -f "$ROOT/.env" ]; then
    echo "  [!] .env file not found at project root."
    echo "      Copy .env.example to .env and fill in the values."
    echo ""
    exit 1
fi
echo "  [✓] .env found"

# ---- Backend: Install Dependencies ----
echo ""
echo "  [1/4] Installing backend dependencies..."
cd "$ROOT/backend"
npm install --silent
echo "  [✓] Backend dependencies installed"

# ---- Frontend: Install Dependencies ----
echo ""
echo "  [2/4] Installing frontend dependencies..."
cd "$ROOT/frontend"
npm install --silent
echo "  [✓] Frontend dependencies installed"

# ---- Start Backend ----
echo ""
echo "  [3/4] Starting backend (npm start)..."
cd "$ROOT/backend"
npm start &
BACKEND_PID=$!
echo "  [✓] Backend started (PID: $BACKEND_PID)"

# ---- Start Frontend ----
echo ""
echo "  [4/4] Starting frontend (npm run dev)..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
echo "  [✓] Frontend started (PID: $FRONTEND_PID)"

# ---- Done ----
echo ""
echo "  ============================"
echo "  Both servers are running!"
echo "  Backend  → http://localhost:8000"
echo "  Frontend → http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

# Cleanup on exit — kill both processes
trap "echo ''; echo '  Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '  Done.'; exit 0" SIGINT SIGTERM

# Wait for both processes
wait
