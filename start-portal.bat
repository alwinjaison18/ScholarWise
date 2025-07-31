@echo off
echo Starting ScholarHub India Portal...
echo.

echo Installing dependencies...
npm install
cd backend
npm install
cd ..

echo.
echo Starting frontend on port 5173...
start "Frontend" cmd /k "npm run dev"

echo.
echo Starting backend on port 5000...
cd backend
start "Backend" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
pause
