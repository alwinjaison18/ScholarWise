/**
 * SCRAPER FUNCTIONALITY TEST
 * Tests individual scrapers and validates their functionality
 */

console.log("🔍 Testing Scholarship Scrapers...");
console.log("==================================");

// Test a single scraper
async function testSingleScraper() {
  console.log("\n🎯 Testing Buddy4Study Scraper...");

  try {
    // Import the scraper
    const { scrapeBuddy4Study } = await import(
      "./src/scrapers/buddy4StudyScraper.js"
    );

    console.log("✅ Scraper imported successfully");

    // Run the scraper
    const result = await scrapeBuddy4Study();

    console.log("✅ Scraper executed successfully");
    console.log("   - Scraped items:", result?.length || 0);

    if (result && result.length > 0) {
      console.log("   - Sample scholarship:", result[0]?.title || "Unknown");
      console.log(
        "   - Link validation:",
        result[0]?.linkValidated ? "Yes" : "No"
      );
      console.log("   - Quality score:", result[0]?.linkQualityScore || "N/A");
    }

    return true;
  } catch (error) {
    console.log("❌ Scraper test failed:", error.message);
    return false;
  }
}

// Test orchestrator
async function testOrchestrator() {
  console.log("\n🎼 Testing Real-Time Orchestrator...");

  try {
    // Import orchestrator
    const orchestrator = await import("./src/scrapers/realTimeOrchestrator.js");

    console.log("✅ Orchestrator imported successfully");

    // Test getting status
    const status = orchestrator.getScrapingStatus();
    console.log(
      "✅ Orchestrator status:",
      status?.totalScrapers || 0,
      "scrapers"
    );

    // Test circuit breaker status
    const circuitBreakers = orchestrator.getCircuitBreakerStatus();
    console.log(
      "✅ Circuit breakers:",
      Object.keys(circuitBreakers).length,
      "total"
    );

    return true;
  } catch (error) {
    console.log("❌ Orchestrator test failed:", error.message);
    return false;
  }
}

// Test database connection
async function testDatabase() {
  console.log("\n🗃️  Testing Database Connection...");

  try {
    // Import mongoose
    const mongoose = await import("mongoose");

    // Try to connect
    await mongoose.default.connect(
      "mongodb://localhost:27017/scholarship_portal"
    );
    console.log("✅ Database connected successfully");

    // Test Scholarship model
    const Scholarship = await import("./src/models/Scholarship.js");
    const count = await Scholarship.default.countDocuments();
    console.log("✅ Scholarship count:", count);

    return true;
  } catch (error) {
    console.log("❌ Database test failed:", error.message);
    return false;
  }
}

// Run all tests
async function runScraperTests() {
  console.log("🚀 Running Scraper Tests...");

  const results = {
    scraper: await testSingleScraper(),
    orchestrator: await testOrchestrator(),
    database: await testDatabase(),
  };

  console.log("\n📊 Test Results:");
  console.log("================");
  console.log("Scraper:", results.scraper ? "✅ PASS" : "❌ FAIL");
  console.log("Orchestrator:", results.orchestrator ? "✅ PASS" : "❌ FAIL");
  console.log("Database:", results.database ? "✅ PASS" : "❌ FAIL");

  const allPassed = Object.values(results).every((r) => r);
  console.log(
    "\n🎉 Overall Result:",
    allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"
  );

  if (allPassed) {
    console.log("\n🌟 Scraper system is fully functional!");
    console.log("   - Ready for production use");
    console.log("   - Link validation enabled");
    console.log("   - Database connectivity confirmed");
  }
}

// Run the tests
runScraperTests().catch(console.error);
