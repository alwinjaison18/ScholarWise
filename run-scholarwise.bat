@echo off
echo ========================================
echo     ScholarWise Portal Launcher
echo ========================================
echo.
echo Starting ScholarWise Portal components...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo Node.js and npm are available
echo.

REM Start backend server in new window
echo Starting Backend Server...
start "ScholarWise Backend" cmd /k "cd /d "%~dp0backend" && echo Starting backend server... && npm run dev"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting Frontend...
start "ScholarWise Frontend" cmd /k "cd /d "%~dp0" && echo Starting frontend... && npm run dev"

REM Wait a moment for services to start
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   ScholarWise Portal is starting...
echo ========================================
echo.
echo Backend Server: http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open the application in default browser
start "" "http://localhost:5173"

echo.
echo Application launched successfully!
echo.
echo To stop the application:
echo 1. Close the backend and frontend terminal windows
echo 2. Or press Ctrl+C in each terminal window
echo.
pause
