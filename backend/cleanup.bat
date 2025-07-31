@echo off
echo 🧹 COMPREHENSIVE PROJECT CLEANUP
echo ================================

echo Deleting test files...
del /Q test-*.js 2>nul

echo Deleting duplicate scraper files...
del /Q analyze-*.js 2>nul
del /Q working-*.js 2>nul
del /Q comprehensive-*.js 2>nul
del /Q intelligent-*.js 2>nul
del /Q real-website-*.js 2>nul
del /Q run-comprehensive-*.js 2>nul
del /Q minimal-*.js 2>nul
del /Q simple-*.js 2>nul
del /Q connectivity-*.js 2>nul
del /Q content-*.js 2>nul
del /Q database-*.js 2>nul
del /Q fix-*.js 2>nul
del /Q verify-*.js 2>nul

echo Deleting individual utility files...
del /Q check-*.js 2>nul
del /Q count-*.js 2>nul
del /Q live-data-*.js 2>nul
del /Q quick-*.js 2>nul
del /Q clear-all-*.js 2>nul
del /Q cleanup-*.js 2>nul

echo Deleting report files...
del /Q SCRAPER_*.md 2>nul

echo Cleanup completed!
echo.
echo Remaining essential files:
echo - production-utils.js (consolidated utilities)
echo - production-deployment.js (deployment script)
echo - production-compliance-test.js (compliance testing)
echo - production-scraper.js (production scraper)
echo - src/ directory (core application files)

echo.
echo 📊 File count after cleanup:
dir *.js | find /c "js"
