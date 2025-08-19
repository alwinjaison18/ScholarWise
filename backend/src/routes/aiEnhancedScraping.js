/**
 * AI-Enhanced Scraping API Routes
 * Provides endpoints for AI-powered scholarship discovery and scraping
 */

import express from "express";
import AIEnhancedScrapingOrchestrator from "../utils/aiEnhancedScrapingOrchestrator.js";
import ScholarshipDiscoveryAI from "../utils/scholarshipDiscoveryAI.js";
import RateLimitedUniversalScraper from "../utils/rateLimitedUniversalScraper.js";
import { scrapingLogger as logger } from "../utils/logger.js";

const router = express.Router();

// Initialize services
const scrapingOrchestrator = new AIEnhancedScrapingOrchestrator();
const discoveryAI = new ScholarshipDiscoveryAI();
const universalScraper = new RateLimitedUniversalScraper();

/**
 * @route POST /api/ai-enhanced/start-full-session
 * @desc Start a complete AI-enhanced scraping session
 * @access Public
 */
router.post("/start-full-session", async (req, res) => {
  try {
    const { maxWebsites = 30, maxTargets = 20 } = req.body;

    logger.info("🚀 Starting AI-Enhanced Scraping Session via API");

    // Start the session (this runs in background)
    const sessionPromise = scrapingOrchestrator.runEnhancedScrapingSession({
      maxWebsites,
      maxTargets,
    });

    // Return immediate response with session info
    const currentStatus = scrapingOrchestrator.getCurrentSessionStatus();

    res.json({
      success: true,
      message: "AI-Enhanced scraping session started",
      sessionId: currentStatus.sessionId,
      status: currentStatus,
      estimatedDuration: "15-30 minutes",
      note: "Use /session-status endpoint to monitor progress",
    });

    // Handle session completion in background
    sessionPromise
      .then((result) => {
        logger.info(`Session ${currentStatus.sessionId} completed:`, {
          success: result.success,
          scholarships: result.scholarships?.length || 0,
        });
      })
      .catch((error) => {
        logger.error(`Session ${currentStatus.sessionId} failed:`, error);
      });
  } catch (error) {
    logger.error("Failed to start AI-enhanced session:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/ai-enhanced/quick-discovery
 * @desc Run a quick AI discovery and scraping session
 * @access Public
 */
router.post("/quick-discovery", async (req, res) => {
  try {
    const { maxWebsites = 10 } = req.body;

    logger.info("⚡ Starting Quick Discovery Session via API");

    const result = await scrapingOrchestrator.runQuickDiscovery(maxWebsites);

    res.json({
      success: true,
      message: "Quick discovery completed",
      result,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Quick discovery failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/ai-enhanced/session-status
 * @desc Get current session status
 * @access Public
 */
router.get("/session-status", (req, res) => {
  try {
    const status = scrapingOrchestrator.getCurrentSessionStatus();

    res.json({
      success: true,
      status,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to get session status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/ai-enhanced/stop-session
 * @desc Stop current scraping session
 * @access Public
 */
router.post("/stop-session", async (req, res) => {
  try {
    const result = await scrapingOrchestrator.stopCurrentSession();

    res.json({
      success: true,
      message: result.success
        ? "Session stopped successfully"
        : "No active session",
      result,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to stop session:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/ai-enhanced/metrics
 * @desc Get comprehensive scraping metrics
 * @access Public
 */
router.get("/metrics", (req, res) => {
  try {
    const metrics = scrapingOrchestrator.getMetrics();

    res.json({
      success: true,
      metrics,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to get metrics:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/ai-enhanced/discover-websites
 * @desc Discover new scholarship websites using AI
 * @access Public
 */
router.post("/discover-websites", async (req, res) => {
  try {
    const { maxResults = 20 } = req.body;

    logger.info("🔍 Starting AI website discovery via API");

    const discoveryResults = await discoveryAI.discoverScholarshipWebsites(
      maxResults
    );

    res.json({
      success: true,
      message: "Website discovery completed",
      results: discoveryResults,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Website discovery failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/ai-enhanced/scrape-specific-urls
 * @desc Scrape specific URLs provided by user
 * @access Public
 */
router.post("/scrape-specific-urls", async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of URLs to scrape",
      });
    }

    if (urls.length > 10) {
      return res.status(400).json({
        success: false,
        error: "Maximum 10 URLs allowed per request",
      });
    }

    logger.info(`🕷️ Scraping ${urls.length} specific URLs via API`);

    // Convert URLs to scraping targets
    const scrapingTargets = urls.map((url, index) => ({
      url,
      priority: 50,
      expectedScholarships: 10,
      scrapingStrategy: {
        method: "axios",
        selectors: {},
        rateLimit: 3000,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          initialDelay: 1000,
        },
      },
      rateLimit: 3000,
    }));

    const results = await universalScraper.scrapeDiscoveredWebsites(
      scrapingTargets
    );

    res.json({
      success: true,
      message: "URL scraping completed",
      results,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Specific URL scraping failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/ai-enhanced/scraping-targets
 * @desc Get prioritized scraping targets
 * @access Public
 */
router.get("/scraping-targets", async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    logger.info("🎯 Getting prioritized scraping targets via API");

    const targets = await discoveryAI.getPrioritizedScrapingTargets(
      parseInt(limit)
    );

    res.json({
      success: true,
      message: "Scraping targets retrieved",
      targets,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to get scraping targets:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/ai-enhanced/health
 * @desc Get AI-enhanced scraping system health
 * @access Public
 */
router.get("/health", (req, res) => {
  try {
    const status = scrapingOrchestrator.getCurrentSessionStatus();
    const metrics = scrapingOrchestrator.getMetrics();

    res.json({
      success: true,
      health: {
        systemStatus: "operational",
        aiDiscoveryEnabled: true,
        universalScrapingEnabled: true,
        rateLimitingEnabled: true,
        currentSession: status.isRunning
          ? {
              sessionId: status.sessionId,
              phase: status.phase,
              progress: status.progress,
            }
          : null,
        totalSessions: metrics.sessionsRun,
        lastRunDate: metrics.lastRunDate,
        totalScholarshipsFound: metrics.totalScholarshipsFound,
        averageQualityScore: metrics.averageQualityScore,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/ai-enhanced/schedule-session
 * @desc Schedule a recurring AI-enhanced scraping session
 * @access Public
 */
router.post("/schedule-session", (req, res) => {
  try {
    const {
      frequency = "daily", // daily, weekly, monthly
      time = "02:00", // 24-hour format
      maxWebsites = 30,
      maxTargets = 20,
    } = req.body;

    // Note: This would integrate with a job scheduler like node-cron
    // For now, we'll just return a success message

    logger.info(`📅 Scheduling AI-enhanced scraping: ${frequency} at ${time}`);

    res.json({
      success: true,
      message: "Scraping session scheduled successfully",
      schedule: {
        frequency,
        time,
        maxWebsites,
        maxTargets,
        nextRun: "To be implemented with job scheduler",
      },
      note: "Scheduled scraping will be implemented with node-cron integration",
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to schedule session:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
