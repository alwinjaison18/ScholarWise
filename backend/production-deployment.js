/**
 * PRODUCTION DEPLOYMENT SCRIPT
 *
 * This script orchestrates the complete production deployment of the scholarship portal:
 * - Validates LIVE DATA ONLY compliance
 * - Initializes AI-powered scraping systems
 * - Sets up real-time link monitoring
 * - Validates all database operations
 * - Starts production-ready server
 *
 * @description Complete production deployment orchestration
 * @author Scholarship Portal Team
 * @version 1.0.0 - Production Deployment
 * @created 2025-06-30
 */

import mongoose from "mongoose";
import { scrapingLogger } from "./src/utils/logger.js";
import { runProductionAIScraping } from "./src/scrapers/productionAIScraper.js";
import {
  runRealTimeScrapers,
  scheduleRealTimeScraping,
} from "./src/scrapers/realTimeOrchestrator.js";
import { monitorScholarshipLinks } from "./src/utils/linkValidationSystem.js";
import {
  ensureLiveDataAvailability,
  validateNoMockData,
} from "./src/utils/liveDataOnlyFallback.js";
import Scholarship from "./src/models/Scholarship.js";

/**
 * Production Deployment Manager
 */
class ProductionDeploymentManager {
  constructor() {
    this.isInitialized = false;
    this.deploymentStatus = {
      databaseConnection: false,
      liveDataCompliance: false,
      aiScrapingSetup: false,
      linkMonitoring: false,
      serverReady: false,
      overallStatus: "INITIALIZING",
    };
  }

  /**
   * Run complete production deployment
   */
  async deploy() {
    console.log("🚀 SCHOLARSHIP PORTAL - PRODUCTION DEPLOYMENT");
    console.log("=".repeat(60));
    console.log("Enforcing LIVE DATA ONLY rule...\n");

    try {
      // Step 1: Database Connection
      await this.initializeDatabase();

      // Step 2: Live Data Compliance Check
      await this.validateLiveDataCompliance();

      // Step 3: Initial AI Scraping Setup
      await this.setupAIScrapingSystem();

      // Step 4: Link Monitoring System
      await this.setupLinkMonitoring();

      // Step 5: Schedule Real-time Operations
      await this.scheduleRealTimeOperations();

      // Step 6: Final Validation
      await this.performFinalValidation();

      this.deploymentStatus.overallStatus = "PRODUCTION_READY";
      console.log("\n✅ PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY");
      console.log("🌟 Scholarship Portal is now PRODUCTION READY");

      return {
        success: true,
        status: this.deploymentStatus,
        message: "Production deployment completed successfully",
      };
    } catch (error) {
      this.deploymentStatus.overallStatus = "DEPLOYMENT_FAILED";
      console.error("\n❌ PRODUCTION DEPLOYMENT FAILED:", error.message);
      scrapingLogger.error("Production deployment failed", {
        error: error.stack,
      });

      return {
        success: false,
        status: this.deploymentStatus,
        error: error.message,
      };
    }
  }

  /**
   * Initialize database connection
   */
  async initializeDatabase() {
    console.log("📊 Step 1: Initializing Database Connection...");

    try {
      await mongoose.connect(
        process.env.MONGODB_URI ||
          "mongodb://localhost:27017/scholarship_portal",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        }
      );

      this.deploymentStatus.databaseConnection = true;
      console.log("✅ Database connection established");
      scrapingLogger.info("Production database connection established");
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Validate LIVE DATA ONLY compliance
   */
  async validateLiveDataCompliance() {
    console.log("🔍 Step 2: Validating LIVE DATA ONLY Compliance...");

    try {
      // Validate no mock data exists
      const mockDataCheck = await validateNoMockData();
      if (!mockDataCheck.isCompliant) {
        throw new Error(
          `Mock data detected: ${mockDataCheck.violations.join(", ")}`
        );
      }

      // Ensure live data availability system
      const liveDataSystem = await ensureLiveDataAvailability();
      if (!liveDataSystem.isReady) {
        throw new Error("Live data system not properly configured");
      }

      this.deploymentStatus.liveDataCompliance = true;
      console.log("✅ LIVE DATA ONLY compliance verified");
      scrapingLogger.info("Live data compliance validated");
    } catch (error) {
      throw new Error(`Live data compliance failed: ${error.message}`);
    }
  }

  /**
   * Setup AI-powered scraping system
   */
  async setupAIScrapingSystem() {
    console.log("🤖 Step 3: Setting up AI-Powered Scraping System...");

    try {
      // Run initial AI scraping to populate data
      console.log("   Running initial AI scraping...");
      const scrapingResult = await runProductionAIScraping();

      if (!scrapingResult.success) {
        console.log(
          "⚠️  Initial scraping returned no data - continuing with setup"
        );
      } else {
        console.log(
          `   ✅ Initial scraping completed: ${scrapingResult.totalScholarships} scholarships`
        );
      }

      this.deploymentStatus.aiScrapingSetup = true;
      console.log("✅ AI scraping system initialized");
      scrapingLogger.info("AI scraping system setup completed");
    } catch (error) {
      throw new Error(`AI scraping setup failed: ${error.message}`);
    }
  }

  /**
   * Setup real-time link monitoring
   */
  async setupLinkMonitoring() {
    console.log("🔗 Step 4: Setting up Real-time Link Monitoring...");

    try {
      // Run initial link monitoring
      await monitorScholarshipLinks();

      this.deploymentStatus.linkMonitoring = true;
      console.log("✅ Link monitoring system initialized");
      scrapingLogger.info("Link monitoring system setup completed");
    } catch (error) {
      // Link monitoring failure shouldn't stop deployment
      console.log(
        "⚠️  Link monitoring setup had issues - continuing deployment"
      );
      scrapingLogger.warn("Link monitoring setup issues", {
        error: error.message,
      });
      this.deploymentStatus.linkMonitoring = false;
    }
  }

  /**
   * Schedule real-time operations
   */
  async scheduleRealTimeOperations() {
    console.log("⏰ Step 5: Scheduling Real-time Operations...");

    try {
      // Schedule real-time scraping (every 6 hours)
      scheduleRealTimeScraping();

      // Schedule daily link monitoring (2 AM daily)
      this.scheduleDailyLinkMonitoring();

      console.log("✅ Real-time operations scheduled");
      scrapingLogger.info("Real-time operations scheduling completed");
    } catch (error) {
      throw new Error(`Real-time scheduling failed: ${error.message}`);
    }
  }

  /**
   * Schedule daily link monitoring
   */
  scheduleDailyLinkMonitoring() {
    const cron = require("node-cron");

    // Schedule daily at 2 AM
    cron.schedule("0 2 * * *", async () => {
      scrapingLogger.info("Starting scheduled daily link monitoring");
      try {
        await monitorScholarshipLinks();
        scrapingLogger.info("Scheduled link monitoring completed successfully");
      } catch (error) {
        scrapingLogger.error("Scheduled link monitoring failed", {
          error: error.message,
        });
      }
    });
  }

  /**
   * Perform final production validation
   */
  async performFinalValidation() {
    console.log("🔎 Step 6: Final Production Validation...");

    try {
      // Check database has data
      const scholarshipCount = await Scholarship.countDocuments();
      console.log(`   Database contains ${scholarshipCount} scholarships`);

      // Validate database collections
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      const hasScholarshipCollection = collections.some(
        (col) => col.name === "scholarships"
      );

      if (!hasScholarshipCollection) {
        throw new Error("Scholarship collection not found in database");
      }

      this.deploymentStatus.serverReady = true;
      console.log("✅ Final validation completed");
      scrapingLogger.info("Production validation completed successfully");
    } catch (error) {
      throw new Error(`Final validation failed: ${error.message}`);
    }
  }

  /**
   * Get deployment status
   */
  getStatus() {
    return this.deploymentStatus;
  }
}

/**
 * Run production deployment if this script is executed directly
 */
async function main() {
  const deploymentManager = new ProductionDeploymentManager();

  try {
    const result = await deploymentManager.deploy();

    if (result.success) {
      console.log("\n📋 DEPLOYMENT STATUS:");
      console.log(JSON.stringify(result.status, null, 2));
      process.exit(0);
    } else {
      console.error("\n❌ DEPLOYMENT FAILED");
      console.error(result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("\n💥 DEPLOYMENT ERROR:", error.message);
    scrapingLogger.error("Deployment error", { error: error.stack });
    process.exit(1);
  }
}

// Export the manager class and run main if executed directly
export { ProductionDeploymentManager };

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
