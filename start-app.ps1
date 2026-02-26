# ============================================
#  Intalix - Food Delivery App Startup Script
# ============================================

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host ""
Write-Host "  Intalix - Food Delivery App" -ForegroundColor Green
Write-Host "  ===========================" -ForegroundColor DarkGray
Write-Host ""

# ---- Check Node.js ----
$nodeVersion = $null
try { $nodeVersion = (node -v 2>$null) } catch {}
if (-Not $nodeVersion) {
    Write-Host "  [✗] Node.js is not installed." -ForegroundColor Red
    Write-Host "      Download it from https://nodejs.org" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
Write-Host "  [✓] Node.js $nodeVersion detected" -ForegroundColor Green

# ---- Check .env ----
if (-Not (Test-Path "$Root\.env")) {
    Write-Host "  [!] .env file not found at project root." -ForegroundColor Red
    Write-Host "      Copy .env.example to .env and fill in the values." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
Write-Host "  [✓] .env found" -ForegroundColor Green

# ---- Backend: Install Dependencies ----
Write-Host ""
Write-Host "  [1/4] Installing backend dependencies..." -ForegroundColor Cyan
Set-Location "$Root\backend"
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [✗] Backend npm install failed." -ForegroundColor Red
    exit 1
}
Write-Host "  [✓] Backend dependencies installed" -ForegroundColor Green

# ---- Frontend: Install Dependencies ----
Write-Host ""
Write-Host "  [2/4] Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location "$Root\frontend"
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [✗] Frontend npm install failed." -ForegroundColor Red
    exit 1
}
Write-Host "  [✓] Frontend dependencies installed" -ForegroundColor Green

# ---- Start Backend ----
Write-Host ""
Write-Host "  [3/4] Starting backend (npm start)..." -ForegroundColor Cyan
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\backend'; npm start" -PassThru
Write-Host "  [✓] Backend started (PID: $($backend.Id))" -ForegroundColor Green

# ---- Start Frontend ----
Write-Host ""
Write-Host "  [4/4] Starting frontend (npm run dev)..." -ForegroundColor Cyan
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\frontend'; npm run dev" -PassThru
Write-Host "  [✓] Frontend started (PID: $($frontend.Id))" -ForegroundColor Green

# ---- Done ----
Write-Host ""
Write-Host "  ============================" -ForegroundColor DarkGray
Write-Host "  Both servers are running!" -ForegroundColor Green
Write-Host "  Backend  → http://localhost:8000" -ForegroundColor White
Write-Host "  Frontend → http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "  Close the opened terminal windows to stop." -ForegroundColor DarkGray
Write-Host ""
