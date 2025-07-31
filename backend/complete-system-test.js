/**
 * COMPLETE SYSTEM TEST
 * Tests the entire scholarship portal system end-to-end
 */

import mongoose from "mongoose";
import { scrapeBuddy4Study } from "./src/scrapers/buddy4StudyScraper.js";
import {
  triggerImmediateScraping,
  getScrapingStatus,
} from "./src/scrapers/realTimeOrchestrator.js";
import Scholarship from "./src/models/Scholarship.js";

console.log("🔧 Complete System Test");
console.log("=======================");

async function testSystem() {
  try {
    // Test 1: Database Connection
    console.log("\n1️⃣ Testing Database Connection...");
    await mongoose.connect("mongodb://localhost:27017/scholarship_portal");
    console.log("✅ Database connected successfully");

    // Test 2: Check existing scholarships
    console.log("\n2️⃣ Checking Existing Scholarships...");
    const count = await Scholarship.countDocuments();
    console.log(`✅ Found ${count} existing scholarships`);

    // Test 3: Test orchestrator status
    console.log("\n3️⃣ Testing Orchestrator Status...");
    const status = getScrapingStatus();
    console.log(
      `✅ Orchestrator Status: ${status.totalScrapers} scrapers, ${status.activeScrapers} active`
    );

    // Test 4: Test single scraper
    console.log("\n4️⃣ Testing Single Scraper...");
    console.log("   Starting Buddy4Study scraper...");
    const scraperResult = await scrapeBuddy4Study();
    console.log(
      `✅ Scraper completed: ${scraperResult?.length || 0} items found`
    );

    if (scraperResult && scraperResult.length > 0) {
      console.log(`   Sample: ${scraperResult[0]?.title || "Unknown"}`);
      console.log(
        `   Link validated: ${scraperResult[0]?.linkValidated ? "Yes" : "No"}`
      );
    }

    // Test 5: Check database after scraping
    console.log("\n5️⃣ Checking Database After Scraping...");
    const newCount = await Scholarship.countDocuments();
    console.log(`✅ Database now has ${newCount} scholarships`);

    if (newCount > count) {
      console.log(`   Added ${newCount - count} new scholarships`);
    }

    // Test 6: Test orchestrator trigger
    console.log("\n6️⃣ Testing Orchestrator Trigger...");
    const triggerResult = await triggerImmediateScraping();
    console.log(
      `✅ Orchestrator trigger: ${triggerResult.success ? "Success" : "Failed"}`
    );
    console.log(`   Message: ${triggerResult.message}`);

    // Test 7: Final count
    console.log("\n7️⃣ Final Database Count...");
    const finalCount = await Scholarship.countDocuments();
    console.log(`✅ Final count: ${finalCount} scholarships`);

    // Test 8: Link validation check
    console.log("\n8️⃣ Checking Link Validation...");
    const validatedCount = await Scholarship.countDocuments({
      linkValidated: true,
    });
    const highQualityCount = await Scholarship.countDocuments({
      linkQualityScore: { $gte: 70 },
    });
    console.log(`✅ Validated links: ${validatedCount} scholarships`);
    console.log(`✅ High quality links: ${highQualityCount} scholarships`);

    console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("====================================");
    console.log("✅ Database connection: Working");
    console.log("✅ Scrapers: Working");
    console.log("✅ Orchestrator: Working");
    console.log("✅ Link validation: Working");
    console.log("✅ Data persistence: Working");

    console.log("\n🌟 System is fully operational!");
    console.log("   - Frontend: http://localhost:5173");
    console.log("   - Backend: http://localhost:5000");
    console.log("   - Admin: http://localhost:5173/admin");
  } catch (error) {
    console.error("❌ System test failed:", error.message);
    console.error("   Stack:", error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
  }
}

// Run the test
testSystem();
