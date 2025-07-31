@echo off
echo 🎓 ScholarHub India - Setup Script
echo ==================================

echo 📦 Installing frontend dependencies...
call npm install

echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

echo 🗄️  Setting up database...
echo Please make sure MongoDB is running on your system
echo MongoDB connection URL: mongodb://localhost:27017/scholarship-portal

echo ✅ Setup completed!
echo.
echo 🚀 To start the application:
echo    Frontend: npm run dev
echo    Backend:  cd backend ^&^& npm run dev
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo 📊 To run web scrapers:
echo    cd backend ^&^& npm run scrape

pause
