/**
 * Simple test without complex imports
 */

import express from "express";
import cors from "cors";

console.log("🚀 Starting simple express server...");

const app = express();
app.use(cors());
app.use(express.json());

// Simple test endpoints that mimic the production ones
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      database: "disconnected",
      scrapers: "test-mode"
    }
  });
});

app.post("/api/scraping/trigger", (req, res) => {
  console.log("🔥 Scraping triggered (test mode)");
  res.json({
    success: true,
    message: "Scraping triggered successfully (test mode)",
    result: {
      totalScrapers: 6,
      successfulScrapers: 6,
      totalScholarships: 15,
      duration: "1.5s"
    },
    timestamp: new Date().toISOString()
  });
});

app.get("/api/scraping/status", (req, res) => {
  res.json({
    success: true,
    status: {
      totalScrapers: 6,
      activeScrapers: 6,
      circuitBreakersOpen: 0,
      scrapers: {
        aicte: { enabled: true, priority: 1, circuitBreakerOpen: false, failureCount: 0 },
        buddy4study: { enabled: true, priority: 2, circuitBreakerOpen: false, failureCount: 0 },
        nsp: { enabled: true, priority: 3, circuitBreakerOpen: false, failureCount: 0 }
      },
      lastUpdate: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

app.get("/api/scraping/circuit-breakers", (req, res) => {
  res.json({
    success: true,
    circuitBreakers: {
      aicte: { isOpen: false, failureCount: 0, lastFailure: null, status: "CLOSED" },
      buddy4study: { isOpen: false, failureCount: 0, lastFailure: null, status: "CLOSED" },
      nsp: { isOpen: false, failureCount: 0, lastFailure: null, status: "CLOSED" }
    },
    timestamp: new Date().toISOString()
  });
});

app.post("/api/scraping/reset-circuit-breakers", (req, res) => {
  console.log("🔄 Circuit breakers reset (test mode)");
  res.json({
    success: true,
    message: "Circuit breakers reset successfully (test mode)",
    result: {},
    timestamp: new Date().toISOString()
  });
});

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
    database: { connected: false, readyState: 0 },
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/scholarships", (req, res) => {
  res.json({
    scholarships: [],
    totalPages: 0,
    currentPage: 1,
    total: 0,
    message: "No scholarships found. This is test mode.",
    isEmpty: true,
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Simple test server running on port ${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔥 Trigger: http://localhost:${PORT}/api/scraping/trigger`);
  console.log(`⚡ Circuit breakers: http://localhost:${PORT}/api/scraping/circuit-breakers`);
});
