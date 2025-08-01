# ScholarWise - AI-Powered Scholarship Portal 🎓

> **🚀 Status**: Production Ready | **📅 Version**: 3.0.0 | **🔐 Auth**: Google OAuth + Traditional | **🔗 Ports**: Backend 5001, Frontend 5174

A comprehensive, AI-powered scholarship discovery platform for Indian students with verified working application links, real-time analytics, and hybrid authentication system.

## 🎯 Key Features

- ✅ **Hybrid Authentication** - Google OAuth + Traditional email/password
- ✅ **LIVE DATA ONLY** - Zero mock/sample/test data - AI-powered real-time scraping
- ✅ **MANDATORY Link Validation** - Every scholarship link verified (≥70 quality score)
- ✅ **AI-Powered Intelligence** - Smart scraping, content analysis, and recommendations
- ✅ **Analytics Dashboard** - Comprehensive insights and performance tracking
- ✅ **Save Functionality** - Bookmark scholarships for later application
- ✅ **Admin Dashboard** - Real-time monitoring and system management
- ✅ **Mobile Responsive** - Full mobile experience with modern UI

## 🚀 Quick Start

```bash
# Install all dependencies
npm run install-all

# Start development environment
npm run dev

# Start backend separately (if needed)
cd backend && npm run dev
```

**Access URLs:**
- Frontend: http://localhost:5174
- Backend API: http://localhost:5001
- Admin Dashboard: http://localhost:5174/admin

## 📦 Project Structure

```
ScholarWise/
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 pages/           # React pages
│   │   │   ├── EnhancedHomePage.tsx
│   │   │   ├── ScholarshipsPage.tsx
│   │   │   ├── ScholarshipDetailsPage.tsx
│   │   │   ├── SavedPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── EnhancedAdminDashboard.tsx
│   │   │   └── ...
│   │   ├── 📁 components/      # Reusable components
│   │   ├── 📁 services/        # API services
│   │   ├── 📁 contexts/        # React contexts
│   │   └── 📁 types/           # TypeScript definitions
│   └── 📄 package.json
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 models/          # MongoDB schemas
│   │   ├── 📁 routes/          # API routes
│   │   ├── 📁 scrapers/        # AI-powered scrapers
│   │   ├── 📁 utils/           # Utility functions
│   │   └── server.js           # Main server
│   ├── 📄 package.json
│   └── 📄 .env
└── 📁 docs/                    # Documentation files
```

## 🔐 Authentication System

### Supported Methods
1. **Google OAuth 2.0** - One-click sign-in
2. **Traditional Email/Password** - Standard registration
3. **Session Management** - Secure JWT tokens

### User Roles
- **Student** - Regular user access
- **Admin** - Full system management (admin@scholarhub.com)

## 🎨 Core Pages & Features

### 🏠 **Enhanced Home Page**
- Hero section with search
- Featured scholarships
- Quick stats and categories
- Call-to-action sections

### 🔍 **Scholarships Discovery**
- AI-powered search and filtering
- Real-time data from verified sources
- Advanced filtering by category, amount, deadline
- Grid/list view options

### 📄 **Scholarship Details**
- Comprehensive information display
- Multiple save buttons with state management
- Application link validation
- Responsive design with sticky sidebar

### 💾 **Saved Scholarships**
- Personal bookmark management
- Search and filter saved items
- Deadline tracking
- Remove functionality

### 📊 **Analytics Dashboard**
- Performance metrics tracking
- Financial impact analysis
- Category distribution charts
- Monthly activity timelines
- Actionable insights and recommendations

### 🔧 **Admin Dashboard**
- Real-time system monitoring
- Scraper status and health checks
- Circuit breaker management
- System metrics (uptime, memory, etc.)
- Live scraping trigger

## 🤖 AI-Powered Scraping System

### Core Principles
- **LIVE DATA ONLY** - No mock/sample data ever
- **Intelligent Analysis** - AI-powered content detection
- **Adaptive Scraping** - Learns from website structure changes
- **Quality Validation** - Mandatory link verification

### Link Validation Process
1. **HTTP Status Check** - Must return 200 OK
2. **Content Relevance** - Page content must match scholarship
3. **Application Form Detection** - Must contain actual application mechanism
4. **Quality Scoring** - Minimum 70/100 score required
5. **Real-time Monitoring** - Daily health checks

### Scraper Features
- **Circuit Breakers** - Automatic failure protection
- **Rate Limiting** - Respectful scraping patterns
- **Error Recovery** - Smart retry mechanisms
- **Performance Monitoring** - Real-time status tracking

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #1D4ED8)
- **Secondary**: Purple gradient (#8B5CF6 to #7C3AED)
- **Accent**: Pink gradient (#EC4899 to #DB2777)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### UI Components
- **Glass Morphism** - Backdrop blur effects
- **Gradient Backgrounds** - Multi-color transitions
- **Interactive Elements** - Hover and focus states
- **Responsive Design** - Mobile-first approach

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Passport.js** for OAuth
- **Winston** for logging
- **Puppeteer** for dynamic scraping

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **Git** for version control
- **VS Code** with extensions

## 📋 Environment Setup

### Required Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/scholarwise
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-session-secret
```

### Database Setup
```bash
# MongoDB connection required
# Default: mongodb://localhost:27017/scholarwise
```

## 🚀 Deployment

### Development
```bash
npm run dev          # Start both frontend and backend
npm run frontend     # Frontend only
npm run backend      # Backend only
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Authentication (Google + Traditional)
- [ ] Scholarship search and filtering
- [ ] Save/unsave functionality
- [ ] Application link validation
- [ ] Analytics data accuracy
- [ ] Admin dashboard monitoring
- [ ] Mobile responsiveness

### Automated Testing
```bash
npm run test         # Run test suite
npm run test:coverage # Coverage report
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - User logout

### Scholarships
- `GET /api/scholarships` - List scholarships
- `GET /api/scholarships/:id` - Get specific scholarship
- `POST /api/scholarships/scrape` - Trigger scraping
- `GET /api/scholarships/status` - Scraping status

### Admin
- `GET /api/admin/metrics` - System metrics
- `GET /api/admin/health` - Health check
- `POST /api/admin/reset-breakers` - Reset circuit breakers

## 🎯 Key Accomplishments

### ✅ Complete Feature Set
- Comprehensive scholarship discovery platform
- Real-time AI-powered scraping system
- Advanced analytics and insights
- Professional admin dashboard
- Modern responsive design

### ✅ Production Ready
- Zero mock data - live data only
- Mandatory link validation (≥70 score)
- Robust error handling
- Security best practices
- Performance optimizations

### ✅ User Experience
- Intuitive navigation and design
- Mobile-first responsive layout
- Fast loading and smooth interactions
- Accessible design patterns
- Clear feedback and notifications

## 🚨 Critical Files Checklist

**⚠️ NEVER DELETE - Required for functionality:**

### Frontend Core
- `index.html` - Main HTML entry point
- `src/main.tsx` - React application entry
- `src/App.tsx` - Main React component
- `src/index.css` - Global styles
- `package.json` - Dependencies and scripts

### Backend Core
- `backend/src/server.js` - Main server file
- `backend/package.json` - Dependencies
- `backend/.env` - Environment configuration

### Configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS setup
- `vite.config.ts` - Vite configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📜 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🎉 Acknowledgments

- Built with modern web technologies
- Designed for Indian students' scholarship needs
- AI-powered for accuracy and efficiency
- Production-ready with comprehensive features

---

**🚀 Ready for Production Use** | **📅 Last Updated**: August 1, 2025 | **✅ Status**: Complete
cd backend && npm install

# Set up environment
cp backend/.env.example backend/.env
# Edit .env with your MongoDB URI and Google OAuth credentials

# Start development
npm run dev          # Frontend (port 5174)
cd backend && npm run dev    # Backend (port 5001)
```

## � Authentication System

### **Access the Portal**

- **Frontend**: http://localhost:5174
- **Sign Up**: Click "Sign up" → Choose Google or traditional registration
- **Sign In**: Click "Sign in" → Google OAuth or email/password
- **Dashboard**: Personal portal with scholarship tracking

### **User Journey**

1. Visit http://localhost:5174
2. Click "Sign up" or "Sign in" in navbar
3. Choose authentication method:
   - **Google**: One-click OAuth sign-in
   - **Traditional**: Email and password
4. Complete profile for better recommendations
5. Browse, save, and apply to scholarships

## 📚 Complete Documentation

For detailed setup, API reference, deployment guide, and technical documentation:
**[DOCUMENTATION.md](./DOCUMENTATION.md)**

## 🛠️ Production Commands

```bash
npm run scrape       # Run production scrapers
npm run status       # Check system status
npm run monitor      # Monitor link health
```

## 🎯 Current Status

- ✅ **Backend**: Running on port 5001 with MongoDB connection
- ✅ **Frontend**: Running on port 5174 with authentication UI
- ✅ **Database**: 16+ verified scholarships with working links
- ✅ **Authentication**: JWT + Google OAuth fully functional
- ✅ **API**: All endpoints working with rate limiting
- ✅ **Mobile**: Responsive design for all devices

## 🔗 Important Links

- **Complete Documentation**: [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

---

**Ready for production deployment! 🚀**

**Built for Indian Students | 100% Free | Production Ready**
npm install

# Install backend dependencies

cd backend && npm install

````

### 3. Environment Setup

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/scholarship-portal
NODE_ENV=development
````

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For Windows (if MongoDB is installed as a service)
net start MongoDB

# For macOS/Linux
sudo systemctl start mongod
```

### 5. Run the Application

**Option 1: Run both frontend and backend separately**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

**Option 2: Run everything with one command**

```bash
npm run install-all
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📊 Web Scraping

The platform includes automated web scrapers for the following sources:

- ScholarshipsIndia.com
- Vidhya Lakshmi Portal
- National Scholarship Portal (coming soon)

### Manual Scraping

You can trigger manual scraping via:

```bash
# Run all scrapers
cd backend && npm run scrape

# Or via API endpoint
POST http://localhost:5000/api/scrapers/run
```

## 🎯 API Endpoints

### Scholarships

- `GET /api/scholarships` - Get all scholarships with filtering
- `GET /api/scholarships/:id` - Get specific scholarship
- `GET /api/scholarships/deadlines/upcoming` - Get upcoming deadlines
- `GET /api/scholarships/stats/overview` - Get platform statistics

### Scrapers

- `POST /api/scrapers/run` - Trigger manual scraping
- `GET /api/scrapers/status` - Get scraper status

### 🤖 AI-Enhanced Endpoints

- `GET /api/ai/analytics` - Get AI scraping analytics and performance metrics
- `GET /api/ai/system-health` - Get AI system health and component status
- `POST /api/ai/optimize-schedule` - Optimize scraping schedule using AI
- `POST /api/ai/validate-links` - Validate and fix scholarship links
- `POST /api/ai/enhance-content` - Enhance scholarship content with AI
- `POST /api/ai/detect-duplicates` - Detect and analyze duplicate scholarships
- `POST /api/ai/intelligent-scrape` - Perform intelligent multi-strategy scraping
- `GET /api/ai/metrics` - Get AI performance metrics
- `POST /api/ai/improve-database` - Run comprehensive database improvement
- `POST /api/ai/fix-broken-links` - Fix broken links in bulk

## 🧠 AI Enhancement Tools

The portal includes several powerful AI-enhanced tools for database optimization:

### Database Optimizer

```bash
node backend/database-optimizer.js
```

- Removes duplicate scholarships
- Adds quality scoring system
- Creates search indexes
- Optimizes database structure

### Link Fixer

```bash
node backend/comprehensive-link-fixer.js [limit]
```

- Validates all scholarship links
- Automatically finds alternatives for broken links
- Uses multiple search strategies
- Updates scholarship records

### Content Enhancer

```bash
node backend/content-enhancer.js [limit]
```

- Enhances descriptions with AI
- Extracts eligibility criteria
- Normalizes amounts and dates
- Adds intelligent categorization

### Comprehensive Improvement Suite

```bash
node backend/run-comprehensive-improvements.js
```

- Runs all optimization tools in sequence
- Provides detailed progress reporting
- Comprehensive database enhancement

### Testing Tools

```bash
# Test AI features
node backend/test-ai-enhanced.js

# Demo AI capabilities
node backend/test-ai-demo.js

# Test basic imports
node backend/test-imports-simple.js
```

## 🎨 Customization

### Tailwind Configuration

The design system uses a custom color palette optimized for educational content. You can modify colors in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Blue theme for trust and professionalism
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  }
}
```

### Adding New Scrapers

1. Create a new scraper file in `backend/src/scrapers/`
2. Implement the scraping logic following the existing pattern
3. Add the scraper to `runScrapers.js`

## � Deployment (100% FREE Options)

This project can be deployed completely free using various cloud platforms:

### Option 1: Vercel + MongoDB Atlas (Recommended)

**Frontend (Vercel - Always Free)**

```bash
# 1. Build the frontend
npm run build

# 2. Deploy to Vercel
npm install -g vercel
vercel --prod
```

**Backend + Database**

- Use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier (512MB storage)
- Deploy backend on [Railway](https://railway.app) or [Render](https://render.com) free tier

### Option 2: Railway (Full Stack)

```bash
# Deploy both frontend and backend on Railway
railway login
railway init
railway up
```

### Option 3: Self-Hosted (VPS/Home Server)

```bash
# Use PM2 for process management
npm install -g pm2
pm2 start backend/src/server.js --name "scholarship-backend"
pm2 start "npm run dev" --name "scholarship-frontend"
```

### Free Hosting Providers

| Provider      | Frontend | Backend          | Database | Storage         |
| ------------- | -------- | ---------------- | -------- | --------------- |
| Vercel        | ✅ Free  | ❌               | ❌       | 100GB bandwidth |
| Netlify       | ✅ Free  | ❌               | ❌       | 100GB bandwidth |
| Railway       | ✅ Free  | ✅ Free (500hrs) | ❌       | 1GB RAM         |
| Render        | ✅ Free  | ✅ Free (750hrs) | ❌       | 512MB RAM       |
| MongoDB Atlas | ❌       | ❌               | ✅ Free  | 512MB storage   |
| PlanetScale   | ❌       | ❌               | ✅ Free  | 5GB storage     |

### Environment Variables for Production

```env
# Production .env file
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scholarship-portal
FRONTEND_URL=https://your-app.vercel.app
```

## �🛡️ Security Considerations

- Rate limiting implemented for web scraping
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Error handling and logging
- No API keys required (fully open-source)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all scholarship providers for making education accessible
- Built with love for Indian students pursuing their dreams
- Open source community for amazing tools and libraries
- **100% FREE** - No paid services or subscriptions required

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/scholarhub-india/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🆓 Cost Breakdown

| Component              | Service              | Cost                   |
| ---------------------- | -------------------- | ---------------------- |
| Frontend Hosting       | Vercel/Netlify       | **FREE**               |
| Backend Hosting        | Railway/Render       | **FREE** (with limits) |
| Database               | MongoDB Atlas        | **FREE** (512MB)       |
| Domain                 | Freenom/Github Pages | **FREE**               |
| SSL Certificate        | Let's Encrypt        | **FREE**               |
| AI/ML Libraries        | Open Source          | **FREE**               |
| Web Scraping           | Puppeteer/Cheerio    | **FREE**               |
| **Total Monthly Cost** |                      | **$0.00**              |

---

**Happy Learning! 🎓**

_Build your scholarship portal at absolutely zero cost!_
