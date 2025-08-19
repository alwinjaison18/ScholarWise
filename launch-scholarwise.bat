@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo     ScholarWise Portal Launcher v2.0
echo ========================================
echo.

REM Color codes for better output
set "green=[92m"
set "red=[91m"
set "yellow=[93m"
set "blue=[94m"
set "reset=[0m"

echo %blue%Checking system requirements...%reset%
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %red%ERROR: Node.js is not installed or not in PATH%reset%
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %red%ERROR: npm is not available%reset%
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %green%✓ Node.js %NODE_VERSION% found%reset%

REM Get npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo %green%✓ npm %NPM_VERSION% found%reset%
echo.

REM Check if dependencies are installed
echo %blue%Checking dependencies...%reset%

REM Check backend dependencies
if not exist "backend\node_modules" (
    echo %yellow%Installing backend dependencies...%reset%
    cd backend
    call npm install
    cd ..
)

REM Check frontend dependencies
if not exist "node_modules" (
    echo %yellow%Installing frontend dependencies...%reset%
    call npm install
)

echo %green%✓ Dependencies ready%reset%
echo.

echo %blue%Starting ScholarWise Portal...%reset%
echo.

REM Start backend server
echo %green%Starting Backend Server (Port 5001)...%reset%
start "ScholarWise Backend - DO NOT CLOSE" cmd /k "cd /d "%~dp0backend" && echo %green%Backend Server Starting...%reset% && echo. && npm run dev"

REM Wait for backend to initialize
echo %yellow%Waiting for backend to initialize...%reset%
timeout /t 5 /nobreak >nul

REM Start frontend
echo %green%Starting Frontend (Port 5173)...%reset%
start "ScholarWise Frontend - DO NOT CLOSE" cmd /k "cd /d "%~dp0" && echo %green%Frontend Starting...%reset% && echo. && npm run dev"

REM Wait for frontend to start
echo %yellow%Waiting for frontend to start...%reset%
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo %green%   ScholarWise Portal Ready!%reset%
echo ========================================
echo.
echo %blue%Services:%reset%
echo   Backend API: http://localhost:5001
echo   Frontend:    http://localhost:5173
echo   Admin Panel: http://localhost:5173/admin
echo.
echo %blue%Quick Commands:%reset%
echo   - View Scholarships: http://localhost:5173/scholarships
echo   - Dashboard:         http://localhost:5173/dashboard
echo   - System Status:     http://localhost:5001/api/health
echo.

REM Optional: Start scrapers
echo.
set /p START_SCRAPERS="Would you like to start the web scrapers? (y/n): "
if /i "!START_SCRAPERS!"=="y" (
    echo %blue%Starting web scrapers...%reset%
    start "ScholarWise Scrapers" cmd /k "cd /d "%~dp0backend" && echo %green%Starting scrapers...%reset% && npm run scrape"
)

echo.
echo %green%Press any key to open the application...%reset%
pause >nul

REM Open the application in default browser
start "" "http://localhost:5173"

echo.
echo %green%Application launched successfully!%reset%
echo.
echo %yellow%Important Notes:%reset%
echo - Keep the terminal windows open to maintain services
echo - Close windows or press Ctrl+C to stop services
echo - Check the terminal windows for any error messages
echo.
echo %blue%Troubleshooting:%reset%
echo - If port conflicts occur, check if other apps use ports 5001/5173
echo - For database issues, ensure MongoDB is running
echo - Check logs in backend/logs/ directory for detailed errors
echo.
pause
