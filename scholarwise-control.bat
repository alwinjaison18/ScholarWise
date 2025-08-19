@echo off
setlocal EnableDelayedExpansion

title ScholarWise Portal Control Center

:MENU
cls
echo ========================================
echo     ScholarWise Portal Control Center
echo ========================================
echo.
echo Please choose an option:
echo.
echo 1. Start Development Environment
echo 2. Start Production Environment
echo 3. Install/Update Dependencies
echo 4. Run Database Setup
echo 5. Start Web Scrapers Only
echo 6. System Health Check
echo 7. View Logs
echo 8. Stop All Services
echo 9. Exit
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto DEV_START
if "%choice%"=="2" goto PROD_START
if "%choice%"=="3" goto INSTALL_DEPS
if "%choice%"=="4" goto DB_SETUP
if "%choice%"=="5" goto SCRAPERS_ONLY
if "%choice%"=="6" goto HEALTH_CHECK
if "%choice%"=="7" goto VIEW_LOGS
if "%choice%"=="8" goto STOP_SERVICES
if "%choice%"=="9" goto EXIT
goto MENU

:DEV_START
cls
echo ========================================
echo    Starting Development Environment
echo ========================================
echo.

REM Check system requirements
call :CHECK_REQUIREMENTS
if %errorlevel% neq 0 goto MENU

echo Starting development servers...
echo.

REM Start backend in development mode
echo Starting Backend Development Server...
start "ScholarWise Backend DEV" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

REM Start frontend in development mode
echo Starting Frontend Development Server...
start "ScholarWise Frontend DEV" cmd /k "cd /d "%~dp0" && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo Development environment started!
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the application...
pause >nul
start "" "http://localhost:5173"
goto MENU

:PROD_START
cls
echo ========================================
echo    Starting Production Environment
echo ========================================
echo.

call :CHECK_REQUIREMENTS
if %errorlevel% neq 0 goto MENU

echo Starting production servers...
echo.

REM Build frontend for production
echo Building frontend for production...
call npm run build

REM Start backend in production mode
echo Starting Backend Production Server...
start "ScholarWise Backend PROD" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak >nul

REM Start frontend production server (if available)
echo Starting Frontend Production Server...
start "ScholarWise Frontend PROD" cmd /k "cd /d "%~dp0" && npm run preview"

echo.
echo Production environment started!
echo.
pause
goto MENU

:INSTALL_DEPS
cls
echo ========================================
echo     Installing/Updating Dependencies
echo ========================================
echo.

echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing frontend dependencies...
call npm install

echo.
echo Dependencies installed successfully!
pause
goto MENU

:DB_SETUP
cls
echo ========================================
echo         Database Setup
echo ========================================
echo.

echo Running database setup and seeding...
cd backend
call npm run setup-db
cd ..

echo.
echo Database setup completed!
pause
goto MENU

:SCRAPERS_ONLY
cls
echo ========================================
echo         Web Scrapers Only
echo ========================================
echo.

echo Starting web scrapers...
start "ScholarWise Scrapers" cmd /k "cd /d "%~dp0backend" && npm run scrape"

echo.
echo Web scrapers started!
echo Check the scraper window for progress and results.
pause
goto MENU

:HEALTH_CHECK
cls
echo ========================================
echo         System Health Check
echo ========================================
echo.

call :CHECK_REQUIREMENTS

echo Checking backend health...
cd backend
call npm run status
cd ..

echo.
echo Health check completed!
pause
goto MENU

:VIEW_LOGS
cls
echo ========================================
echo            View Logs
echo ========================================
echo.

if exist "backend\logs\combined.log" (
    echo Opening combined logs...
    start notepad "backend\logs\combined.log"
) else (
    echo No log files found.
)

if exist "backend\logs\error.log" (
    echo Opening error logs...
    start notepad "backend\logs\error.log"
)

if exist "backend\logs\scraping.log" (
    echo Opening scraping logs...
    start notepad "backend\logs\scraping.log"
)

pause
goto MENU

:STOP_SERVICES
cls
echo ========================================
echo         Stopping All Services
echo ========================================
echo.

echo Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo.
echo All services stopped!
pause
goto MENU

:CHECK_REQUIREMENTS
echo Checking system requirements...

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo System requirements met.
exit /b 0

:EXIT
echo.
echo Thank you for using ScholarWise Portal!
echo.
pause
exit
