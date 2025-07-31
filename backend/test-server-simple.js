/**
 * Simple test server without MongoDB for testing API endpoints
 */

import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data and functions
let mockScrapingStatus = {
  totalScrapers: 6,
  activeScrapers: 6,
  circuitBreakersOpen: 0,
  scrapers: {
    aicte: { enabled: true, priority: 1, circuitBreakerOpen: false, failureCount: 0 },
    buddy4study: { enabled: true, priority: 2, circuitBreakerOpen: false, failureCount: 0 },
    nsp: { enabled: true, priority: 3, circuitBreakerOpen: false, failureCount: 0 },
    scholarshipsIndia: { enabled: true, priority: 4, circuitBreakerOpen: false, failureCount: 0 },
    ugc: { enabled: true, priority: 5, circuitBreakerOpen: false, failureCount: 0 },
    vidhyaLakshmi: { enabled: true, priority: 6, circuitBreakerOpen: false, failureCount: 0 },
  },
  lastUpdate: new Date().toISOString(),
};

let mockCircuitBreakers = {
  aicte: { isOpen: false, failureCount: 0, lastFailure: null, status: "CLOSED" },
  buddy4study: { isOpen: false, failureCount: 0, lastFailure: null, status: "CLOSED" },
  nsp: { isOpen: false, failureCount: 0, lastFailure: null, status: "CLOSED" },
  scholarshipsIndia: { isOpen: false, failureCount: 0, lastFailure: null, status: "CLOSED" },
  ugc: { isOpen: false, failureCount: 0, lastFailure: null, status: "CLOSED" },
  vidhyaLakshmi: { isOpen: false, failureCount: 0, lastFailure: null, status: "CLOSED" },
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: "disconnected", // MongoDB not available in test mode
      scrapers: "active",
    },
  });
});

// Scraping trigger endpoint
app.post("/api/scraping/trigger", (req, res) => {
  console.log("🔥 Manual scraping triggered via API");
  
  // Simulate scraping success
  setTimeout(() => {
    res.json({
      success: true,
      message: "Real-time scraping triggered successfully",
      result: {
        totalScrapers: 6,
        successfulScrapers: 6,
        totalScholarships: 25,
        newScholarships: 5,
        duration: "2.3s",
      },
      timestamp: new Date().toISOString(),
    });
  }, 1000);
});

// Scraping status endpoint
app.get("/api/scraping/status", (req, res) => {
  res.json({
    success: true,
    status: mockScrapingStatus,
    serverHealth: {
      database: false,
      lastScraping: new Date().toISOString(),
      uptime: process.uptime(),
    },
    timestamp: new Date().toISOString(),
  });
});

// Circuit breaker status endpoint
app.get("/api/scraping/circuit-breakers", (req, res) => {
  res.json({
    success: true,
    circuitBreakers: mockCircuitBreakers,
    timestamp: new Date().toISOString(),
  });
});

// Reset circuit breakers endpoint
app.post("/api/scraping/reset-circuit-breakers", (req, res) => {
  console.log("🔄 Circuit breakers reset via API");
  
  // Reset all circuit breakers
  Object.keys(mockCircuitBreakers).forEach(key => {
    mockCircuitBreakers[key] = {
      isOpen: false,
      failureCount: 0,
      lastFailure: null,
      status: "CLOSED"
    };
  });
  
  res.json({
    success: true,
    message: "Circuit breakers reset successfully",
    result: mockCircuitBreakers,
    timestamp: new Date().toISOString(),
  });
});

// Metrics endpoint
app.get("/api/metrics", (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    },
    database: {
      connected: false,
      readyState: 0,
    },
    timestamp: new Date().toISOString(),
  });
});

// Scholarships endpoint (mock data)
app.get("/api/scholarships", (req, res) => {
  res.json({
    scholarships: [],
    totalPages: 0,
    currentPage: 1,
    total: 0,
    message: "No scholarships found. MongoDB is not connected in test mode.",
    isEmpty: true,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔥 Trigger scraping: http://localhost:${PORT}/api/scraping/trigger`);
  console.log(`⚡ Circuit breakers: http://localhost:${PORT}/api/scraping/circuit-breakers`);
});
