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

// If this file is run directly, execute the scraping
if (process.argv[1] === new URL(import.meta.url).pathname) {
  (async () => {
    try {
      // Connect to database
      const mongoose = await import("mongoose");
      const dotenv = await import("dotenv");

      dotenv.default.config();

      const mongoUri =
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/scholarship-portal";
      await mongoose.default.connect(mongoUri);
      console.log("✅ Connected to MongoDB");

      // Run scraping
      const result = await runAllScrapers();
      console.log("🎉 Scraping completed successfully!");
      console.log("📊 Results:", JSON.stringify(result, null, 2));

      // Disconnect
      await mongoose.default.disconnect();
      console.log("📤 Disconnected from MongoDB");

      process.exit(0);
    } catch (error) {
      console.error("❌ Scraping failed:", error);
      process.exit(1);
    }
  })();
}
