#!/usr/bin/env node

/**
 * PRODUCTION UTILITIES
 *
 * Provides command-line utilities for production operations
 * including scraping, monitoring, and system checks.
 *
 * @description Production utility commands for scholarship portal
 * @author Scholarship Portal Team
 * @version 1.0.0
 */

import { runAllScrapers } from "./src/scrapers/runScrapers.js";
import { scrapingLogger } from "./src/utils/logger.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get command line arguments
const command = process.argv[2];
const args = process.argv.slice(3);

async function connectToDatabase() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/scholarship-portal";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

async function disconnectFromDatabase() {
  try {
    await mongoose.disconnect();
    console.log("📤 Disconnected from MongoDB");
  } catch (error) {
    console.error("⚠️ Error disconnecting from MongoDB:", error.message);
  }
}

async function runScraping() {
  console.log("🚀 Starting production scraping...");

  try {
    await connectToDatabase();

    const result = await runAllScrapers();

    console.log("✅ Scraping completed successfully!");
    console.log("📊 Results:", JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("❌ Scraping failed:", error.message);
    scrapingLogger.error("Production scraping failed:", error);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
}

async function checkStatus() {
  console.log("🔍 Checking system status...");

  try {
    await connectToDatabase();

    // Import Scholarship model
    const { default: Scholarship } = await import(
      "./src/models/Scholarship.js"
    );

    const totalScholarships = await Scholarship.countDocuments();
    const activeScholarships = await Scholarship.countDocuments({
      isActive: true,
    });
    const recentScholarships = await Scholarship.countDocuments({
      lastUpdated: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    console.log("📈 System Status:");
    console.log(`   Total Scholarships: ${totalScholarships}`);
    console.log(`   Active Scholarships: ${activeScholarships}`);
    console.log(`   Updated in Last 24h: ${recentScholarships}`);

    return {
      total: totalScholarships,
      active: activeScholarships,
      recent: recentScholarships,
    };
  } catch (error) {
    console.error("❌ Status check failed:", error.message);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
}

async function countScholarships() {
  console.log("📊 Counting scholarships by source...");

  try {
    await connectToDatabase();

    // Import Scholarship model
    const { default: Scholarship } = await import(
      "./src/models/Scholarship.js"
    );

    const sourceStats = await Scholarship.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("📊 Scholarships by Source:");
    sourceStats.forEach((stat) => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    return sourceStats;
  } catch (error) {
    console.error("❌ Count failed:", error.message);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
}

async function monitorSystem() {
  console.log("🔧 System monitoring...");

  try {
    await connectToDatabase();

    // Check database health
    const adminDb = mongoose.connection.db.admin();
    const dbStatus = await adminDb.serverStatus();

    console.log("🗄️ Database Status:");
    console.log(
      `   Uptime: ${Math.floor(dbStatus.uptime / 3600)}h ${Math.floor(
        (dbStatus.uptime % 3600) / 60
      )}m`
    );
    console.log(
      `   Connections: ${dbStatus.connections.current}/${dbStatus.connections.available}`
    );
    console.log(`   Memory Usage: ${Math.round(dbStatus.mem.resident)}MB`);

    return {
      uptime: dbStatus.uptime,
      connections: dbStatus.connections,
      memory: dbStatus.mem,
    };
  } catch (error) {
    console.error("❌ Monitoring failed:", error.message);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
}

async function systemCheck() {
  console.log("🔍 Running comprehensive system check...");

  try {
    const status = await checkStatus();
    const counts = await countScholarships();
    const monitor = await monitorSystem();

    console.log("\n✅ System check completed successfully!");
    return { status, counts, monitor };
  } catch (error) {
    console.error("❌ System check failed:", error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🎓 Scholarship Portal Production Utils

Usage: npm run <command>

Available commands:
  scrape       - Run all scrapers to collect scholarship data
  status       - Check system status and scholarship counts
  count        - Count scholarships by source
  monitor      - Monitor system health and database metrics
  system-check - Run comprehensive system diagnostics

Examples:
  npm run scrape
  npm run status
  npm run count
  npm run monitor
  npm run system-check
  `);
}

// Main execution
async function main() {
  try {
    switch (command) {
      case "scrape":
        await runScraping();
        break;
      case "check":
      case "status":
        await checkStatus();
        break;
      case "count":
        await countScholarships();
        break;
      case "monitor":
        await monitorSystem();
        break;
      case "system-check":
        await systemCheck();
        break;
      case "help":
      case "--help":
      case "-h":
        showHelp();
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Command execution failed:", error.message);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Run the main function
main();
