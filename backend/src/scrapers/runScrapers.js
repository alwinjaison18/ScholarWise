/**
 * SCRAPER RUNNER
 *
 * Coordinates the execution of all scrapers for the scholarship portal.
 * This module provides a unified interface to run all scrapers.
 *
 * @description Runs all available scrapers
 * @author Scholarship Portal Team
 * @version 2.0.0 - Production Ready
 */

import { scrapingLogger } from "../utils/logger.js";
import { triggerImmediateScraping } from "./realTimeOrchestrator.js";

/**
 * Run all available scrapers
 * @returns {Object} Results of scraping operation
 */
export async function runAllScrapers() {
  try {
    scrapingLogger.info("🚀 Starting manual scraping of all sources...");

    const result = await triggerImmediateScraping();

    scrapingLogger.info("✅ Manual scraping completed", result);
    return result;
  } catch (error) {
    scrapingLogger.error("❌ Manual scraping failed:", {
      error: error.message,
    });
    throw error;
  }
}

export default {
  runAllScrapers,
};
