# Hire-Alert Development Startup Script
# Run this script to start all services locally.
# Prerequisites: Docker Desktop running, node/npm installed.

$ErrorActionPreference = "Stop"
$PROJECT_DIR = "D:\opencode-projects\hire-alert"
Set-Location $PROJECT_DIR

Write-Host "=== Hire-Alert Development Setup ===" -ForegroundColor Cyan

# 1. Start Docker services (PostgreSQL + Redis)
Write-Host "`n[1/5] Starting Docker services..." -ForegroundColor Yellow
docker compose up -d postgres redis
Write-Host "  Waiting for databases to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# 2. Run Prisma migrations
Write-Host "`n[2/5] Running database migrations..." -ForegroundColor Yellow
Set-Location "$PROJECT_DIR\frontend"
npx prisma db push
Write-Host "  Database schema synced." -ForegroundColor Green

# 3. Generate Prisma client
Write-Host "`n[3/5] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "  Prisma client generated." -ForegroundColor Green

# 4. Start FastAPI backend
Write-Host "`n[4/5] Starting FastAPI backend..." -ForegroundColor Yellow
Start-Process -WindowStyle Hidden -FilePath "$PROJECT_DIR\backend\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --port 8000" -WorkingDirectory "$PROJECT_DIR\backend"
Write-Host "  Backend starting on http://localhost:8000" -ForegroundColor Green

# 5. Start Next.js frontend
Write-Host "`n[5/5] Starting Next.js frontend..." -ForegroundColor Yellow
Start-Process -WindowStyle Hidden -FilePath "cmd.exe" -ArgumentList "/c npm run dev > next-dev.log 2>&1" -WorkingDirectory "$PROJECT_DIR\frontend"
Write-Host "  Frontend starting on http://localhost:3000" -ForegroundColor Green

Write-Host "`n=== All services started ===" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000"
Write-Host "  Backend:   http://localhost:8000 (docs at /docs)"
Write-Host "  Database:  postgres://localhost:5433"
