# 🚨 CRITICAL FILES CHECKLIST - ScholarWise India

**⚠️ NEVER DELETE THESE FILES - Required for project functionality**

## 📋 Frontend Critical Files

### Core Entry Points

- [ ] `index.html` - Main HTML entry point (Vite requirement)
- [ ] `src/main.tsx` - React application entry script
- [ ] `src/App.tsx` - Main React application component
- [ ] `src/index.css` - Global styles and Tailwind directives

### Essential Configuration

- [ ] `package.json` - Frontend dependencies and scripts
- [ ] `vite.config.ts` - Vite build configuration
- [ ] `tailwind.config.js` - Tailwind CSS configuration
- [ ] `tsconfig.json` - TypeScript configuration
- [ ] `postcss.config.js` - PostCSS configuration

### Core React Components

- [ ] `src/components/Navbar.tsx` - Navigation component
- [ ] `src/components/Footer.tsx` - ⭐ ENHANCED: Modern footer with comprehensive sections and animations
- [ ] `src/components/index.ts` - Component exports

### Authentication System

- [ ] `src/contexts/AuthContext.tsx` - Authentication state management
- [ ] `src/services/scholarshipService.ts` - API service layer

### Page Components

- [ ] `src/pages/LandingPage.tsx` - ⭐ NEW: Interactive landing page with animations
- [ ] `src/pages/Login.tsx` - ⭐ ENHANCED: Split-screen login with branding panel
- [ ] `src/pages/Register.tsx` - ⭐ ENHANCED: Multi-step registration with progress
- [ ] `src/pages/EnhancedHomePage.tsx` - ⭐ ENHANCED: Modern home page with animations and enhanced UX
- [ ] `src/pages/ScholarshipsPage.tsx` - Scholarship listings
- [ ] `src/pages/Dashboard.tsx` - User dashboard
- [ ] `src/pages/EnhancedAdminDashboard.tsx` - Admin interface
- [ ] `src/pages/ScholarshipDetailsPage.tsx` - Individual scholarship view
- [ ] `src/pages/index.ts` - Page exports (UPDATED with all components)

### TypeScript Types

- [ ] `src/types/index.ts` - Type definitions
- [ ] `src/vite-env.d.ts` - Vite environment types

### Custom Hooks

- [ ] `src/hooks/useScholarships.ts` - Scholarship data management

## 🔧 Backend Critical Files

### Core Server

- [ ] `backend/src/server.js` - Main Express server
- [ ] `backend/package.json` - Backend dependencies and scripts
- [ ] `backend/.env` - Environment variables (sensitive)

### Database Models

- [ ] `backend/src/models/User.js` - User data schema
- [ ] `backend/src/models/Scholarship.js` - Scholarship data schema

### API Routes

- [ ] `backend/src/routes/auth.js` - Authentication endpoints
- [ ] `backend/src/routes/scholarships.js` - Scholarship CRUD operations
- [ ] `backend/src/routes/users.js` - User management
- [ ] `backend/src/routes/aiEnhanced.js` - AI-powered features
- [ ] `backend/src/routes/realTimeScholarships.js` - Live data endpoints

### AI Scraping System

- [ ] `backend/src/scrapers/realTimeOrchestrator.js` - Scraping coordinator
- [ ] `backend/src/scrapers/nationalScholarshipPortalScraper.js` - NSP scraper
- [ ] `backend/src/scrapers/buddy4StudyScraper.js` - Buddy4Study scraper
- [ ] `backend/src/scrapers/scholarshipsIndiaScraper.js` - ScholarshipsIndia scraper
- [ ] `backend/src/scrapers/vidhyaLakshmiScraper.js` - VidyaLakshmi scraper

### Utilities & Configuration

- [ ] `backend/src/utils/linkValidationSystem.js` - Link verification system
- [ ] `backend/src/utils/logger.js` - Logging system
- [ ] `backend/src/utils/geminiAIService.js` - AI integration
- [ ] `backend/src/config/passport.js` - Authentication configuration

## 📁 Static Assets

- [ ] `public/vite.svg` - Default favicon

## 🔒 Environment & Security

- [ ] `backend/.env` - Database URLs, API keys, JWT secrets
- [ ] `.gitignore` - Prevent sensitive files from being committed

## 📚 Documentation

- [ ] `README.md` - Project overview and setup
- [ ] `DOCUMENTATION.md` - Comprehensive project documentation

---

## ⚡ Before Making Changes Checklist:

1. **Verify all critical files exist**
2. **Check for compilation errors**
3. **Test both servers are running**
4. **Verify database connection**
5. **Test authentication flow**
6. **Validate API endpoints**
7. **Check scraping system status**

## 🚨 Emergency Recovery:

If critical files are missing:

1. Stop all servers immediately
2. Check git history for recent deletions
3. Restore from backup or recreate from templates
4. Test functionality before proceeding

---

**Last Updated:** July 31, 2025
**Status:** ✅ All critical files verified and functional
