/**
 * REAL-TIME SCHOLARSHIP SCRAPING ORCHESTRATOR
 *
 * Orchestrates multiple scrapers with circuit breakers, rate limiting,
 * and intelligent scheduling for the scholarship portal.
 *
 * @description Production orchestrator for real-time scholarship scraping
 * @author Scholarship Portal Team
 * @version 2.0.0 - Production Ready
 * @created 2025-07-01
 */

import cron from "node-cron";
import { scrapingLogger } from "../utils/logger.js";
import aicteScraper from "./aicteScraper.js";
import buddy4StudyScraper from "./buddy4StudyScraper.js";
import nationalScholarshipPortalScraper from "./nationalScholarshipPortalScraper.js";
import scholarshipsIndiaScraper from "./scholarshipsIndiaScraper.js";
import ugcScraper from "./ugcScraper.js";
import vidhyaLakshmiScraper from "./vidhyaLakshmiScraper.js";

/**
 * Circuit breaker states for each scraper
 */
const circuitBreakers = {
  aicte: { isOpen: false, failureCount: 0, lastFailure: null, maxFailures: 3 },
  buddy4study: {
    isOpen: false,
    failureCount: 0,
    lastFailure: null,
    maxFailures: 3,
  },
  nsp: { isOpen: false, failureCount: 0, lastFailure: null, maxFailures: 3 },
  scholarshipsIndia: {
    isOpen: false,
    failureCount: 0,
    lastFailure: null,
    maxFailures: 3,
  },
  ugc: { isOpen: false, failureCount: 0, lastFailure: null, maxFailures: 3 },
  vidhyaLakshmi: {
    isOpen: false,
    failureCount: 0,
    lastFailure: null,
    maxFailures: 3,
  },
};

/**
 * Available scrapers configuration
 */
const scrapers = {
  aicte: {
    name: "AICTE Scholarships",
    scraper: aicteScraper,
    enabled: true,
    priority: 1,
    interval: 30, // minutes
  },
  buddy4study: {
    name: "Buddy4Study",
    scraper: buddy4StudyScraper,
    enabled: true,
    priority: 2,
    interval: 25,
  },
  nsp: {
    name: "National Scholarship Portal",
    scraper: nationalScholarshipPortalScraper,
    enabled: true,
    priority: 1,
    interval: 20,
  },
  scholarshipsIndia: {
    name: "Scholarships India",
    scraper: scholarshipsIndiaScraper,
    enabled: true,
    priority: 2,
    interval: 35,
  },
  ugc: {
    name: "UGC Scholarships",
    scraper: ugcScraper,
    enabled: true,
    priority: 1,
    interval: 40,
  },
  vidhyaLakshmi: {
    name: "Vidhya Lakshmi",
    scraper: vidhyaLakshmiScraper,
    enabled: true,
    priority: 2,
    interval: 45,
  },
};

/**
 * Check if circuit breaker should be opened
 */
function checkCircuitBreaker(scraperName) {
  const breaker = circuitBreakers[scraperName];

  if (breaker.isOpen) {
    // Check if enough time has passed to try again (5 minutes)
    const timeSinceLastFailure = Date.now() - breaker.lastFailure;
    if (timeSinceLastFailure > 5 * 60 * 1000) {
      breaker.isOpen = false;
      breaker.failureCount = 0;
      scrapingLogger.info(`Circuit breaker reset for ${scraperName}`);
    }
  }

  return breaker.isOpen;
}

/**
 * Record scraper failure
 */
function recordFailure(scraperName, error) {
  const breaker = circuitBreakers[scraperName];
  breaker.failureCount++;
  breaker.lastFailure = Date.now();

  if (breaker.failureCount >= breaker.maxFailures) {
    breaker.isOpen = true;
    scrapingLogger.warn(
      `Circuit breaker opened for ${scraperName} after ${breaker.failureCount} failures`
    );
  }

  scrapingLogger.error(`Scraper failure recorded for ${scraperName}:`, {
    error: error.message,
  });
}

/**
 * Record scraper success
 */
function recordSuccess(scraperName) {
  const breaker = circuitBreakers[scraperName];
  breaker.failureCount = 0;
  breaker.isOpen = false;
  scrapingLogger.info(`Scraper success recorded for ${scraperName}`);
}

/**
 * Execute a single scraper with circuit breaker protection
 */
async function executeScraper(scraperName, scraper) {
  try {
    // Check circuit breaker
    if (checkCircuitBreaker(scraperName)) {
      scrapingLogger.warn(`Skipping ${scraperName} - circuit breaker is open`);
      return { success: false, reason: "circuit_breaker_open" };
    }

    scrapingLogger.info(`Starting scraper: ${scraperName}`);

    // Execute the scraper
    const startTime = Date.now();
    const result = await scraper.scrapeScholarships();
    const duration = Date.now() - startTime;

    // Record success
    recordSuccess(scraperName);

    scrapingLogger.info(
      `Scraper ${scraperName} completed successfully in ${duration}ms`,
      {
        scholarshipsFound: result.scholarships?.length || 0,
        duration,
      }
    );

    return {
      success: true,
      scraperName,
      duration,
      scholarships: result.scholarships || [],
      count: result.scholarships?.length || 0,
    };
  } catch (error) {
    // Record failure
    recordFailure(scraperName, error);

    scrapingLogger.error(`Scraper ${scraperName} failed:`, {
      error: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      scraperName,
      error: error.message,
      reason: "scraper_error",
    };
  }
}

/**
 * Run all enabled scrapers
 */
export async function triggerImmediateScraping() {
  try {
    scrapingLogger.info("🚀 Starting immediate scraping of all sources...");

    const results = [];
    let totalScholarships = 0;
    let successfulScrapers = 0;

    // Execute scrapers sequentially to be respectful to servers
    for (const [scraperName, config] of Object.entries(scrapers)) {
      if (!config.enabled) {
        scrapingLogger.info(`Skipping disabled scraper: ${scraperName}`);
        continue;
      }

      const result = await executeScraper(scraperName, config.scraper);
      results.push(result);

      if (result.success) {
        successfulScrapers++;
        totalScholarships += result.count || 0;
      }

      // Add delay between scrapers to be respectful
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const summary = {
      timestamp: new Date().toISOString(),
      totalScrapers: Object.keys(scrapers).filter((k) => scrapers[k].enabled)
        .length,
      successfulScrapers,
      failedScrapers: results.filter((r) => !r.success).length,
      totalScholarships,
      results,
    };

    scrapingLogger.info("✅ Immediate scraping completed", summary);
    return summary;
  } catch (error) {
    scrapingLogger.error("❌ Immediate scraping failed:", {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Schedule regular scraping
 */
export function scheduleRealTimeScraping() {
  scrapingLogger.info("📅 Setting up scheduled scraping...");

  // Schedule high-priority scrapers every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    scrapingLogger.info("⏰ Running scheduled high-priority scraping...");

    const highPriorityScrapers = Object.entries(scrapers).filter(
      ([name, config]) => config.enabled && config.priority === 1
    );

    for (const [scraperName, config] of highPriorityScrapers) {
      await executeScraper(scraperName, config.scraper);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay
    }
  });

  // Schedule lower-priority scrapers every hour
  cron.schedule("0 * * * *", async () => {
    scrapingLogger.info("⏰ Running scheduled standard scraping...");

    const standardScrapers = Object.entries(scrapers).filter(
      ([name, config]) => config.enabled && config.priority === 2
    );

    for (const [scraperName, config] of standardScrapers) {
      await executeScraper(scraperName, config.scraper);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay
    }
  });

  scrapingLogger.info("✅ Scheduled scraping configured");
}

/**
 * Get circuit breaker status for all scrapers
 */
export function getCircuitBreakerStatus() {
  return Object.entries(circuitBreakers).reduce((status, [name, breaker]) => {
    status[name] = {
      isOpen: breaker.isOpen,
      failureCount: breaker.failureCount,
      lastFailure: breaker.lastFailure,
      status: breaker.isOpen ? "OPEN" : "CLOSED",
    };
    return status;
  }, {});
}

/**
 * Reset circuit breakers
 */
export function resetCircuitBreakers() {
  Object.keys(circuitBreakers).forEach((scraperName) => {
    circuitBreakers[scraperName] = {
      isOpen: false,
      failureCount: 0,
      lastFailure: null,
      maxFailures: 3,
    };
  });

  scrapingLogger.info("🔄 All circuit breakers reset");
  return { success: true, message: "All circuit breakers reset successfully" };
}

/**
 * Get scraping status and statistics
 */
export function getScrapingStatus() {
  const enabledScrapers = Object.entries(scrapers).filter(
    ([name, config]) => config.enabled
  );
  const openBreakers = Object.entries(circuitBreakers).filter(
    ([name, breaker]) => breaker.isOpen
  );

  return {
    totalScrapers: enabledScrapers.length,
    activeScrapers: enabledScrapers.length - openBreakers.length,
    circuitBreakersOpen: openBreakers.length,
    scrapers: Object.entries(scrapers).reduce((status, [name, config]) => {
      status[name] = {
        enabled: config.enabled,
        priority: config.priority,
        circuitBreakerOpen: circuitBreakers[name].isOpen,
        failureCount: circuitBreakers[name].failureCount,
      };
      return status;
    }, {}),
    lastUpdate: new Date().toISOString(),
  };
}

// Initialize scheduling when module is loaded
scrapingLogger.info("🔧 Real-time orchestrator initialized");

export default {
  triggerImmediateScraping,
  scheduleRealTimeScraping,
  getCircuitBreakerStatus,
  resetCircuitBreakers,
  getScrapingStatus,
};
