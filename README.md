# ScholarWise - Production Ready Scholarship Portal 🎓

> **🚀 Status**: Production Ready | **📅 Version**: 3.0.0 | **🔐 Auth**: Google OAuth + Traditional | **🔗 Ports**: Backend 5001, Frontend 5174

A comprehensive, AI-powered scholarship discovery platform for Indian students with verified working application links and hybrid authentication system.

## 🎯 Key Features

- ✅ **Hybrid Authentication** - Google OAuth + Traditional email/password
- ✅ **LIVE DATA ONLY** - Zero mock/sample/test data
- ✅ **MANDATORY Link Validation** - Every link verified (≥70 quality score)
- ✅ **AI-Powered Intelligence** - Smart scraping and content analysis
- ✅ **Personal Dashboard** - Track applications and saved scholarships
- ✅ **Mobile Responsive** - Full mobile experience

## 🚀 Quick Start

```bash
# Install dependencies
npm install
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
