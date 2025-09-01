@echo off
echo ========================================
echo    WhatsApp Clone - Project Starter
echo ========================================
echo.

echo Starting Server...
cd server
start "WhatsApp Server" cmd /k "npm start"
cd ..

echo.
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Client...
cd client
start "WhatsApp Client" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo    Both services are starting...
echo ========================================
echo.
echo Server: http://localhost:3005
echo Client: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
