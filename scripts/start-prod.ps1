# Hire-Alert Production Startup Script
# Starts all services via Docker Compose

Write-Host "=== Hire-Alert Production Deployment ===" -ForegroundColor Cyan

cd C:\Users\HP\Desktop\opencode-projects\hire-alert

# Build and start all services
Write-Host "`nBuilding and starting services..." -ForegroundColor Yellow
docker compose up --build -d

Write-Host "`nServices starting:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "  Docs:     http://localhost:8000/docs" -ForegroundColor Cyan

Write-Host "`nTo view logs:" -ForegroundColor Gray
Write-Host "  docker compose logs -f"
