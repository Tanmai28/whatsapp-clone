Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    WhatsApp Clone - Project Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Server..." -ForegroundColor Yellow
Set-Location server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
Set-Location ..

Write-Host ""
Write-Host "Waiting for server to start..." -ForegroundColor Green
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Starting Client..." -ForegroundColor Yellow
Set-Location client
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Both services are starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server: http://localhost:3005" -ForegroundColor Green
Write-Host "Client: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
