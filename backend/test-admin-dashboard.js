/**
 * ADMIN DASHBOARD TEST SCRIPT
 * Tests the admin dashboard functionality end-to-end
 */

console.log("🔧 Testing Admin Dashboard Functionality...");
console.log("============================================");

const API_BASE = "http://localhost:5000/api";

// Test scraping trigger
async function testScrapingTrigger() {
  console.log("\n🚀 Testing Scraping Trigger...");
  try {
    const response = await fetch(`${API_BASE}/scraping/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Scraping trigger successful:", data.message);
      return true;
    } else {
      console.log(
        "❌ Scraping trigger failed:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.log("❌ Scraping trigger error:", error.message);
    return false;
  }
}

// Test circuit breaker reset
async function testCircuitBreakerReset() {
  console.log("\n🔄 Testing Circuit Breaker Reset...");
  try {
    const response = await fetch(
      `${API_BASE}/scraping/reset-circuit-breakers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Circuit breaker reset successful:", data.message);
      return true;
    } else {
      console.log(
        "❌ Circuit breaker reset failed:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.log("❌ Circuit breaker reset error:", error.message);
    return false;
  }
}

// Test system health
async function testSystemHealth() {
  console.log("\n🏥 Testing System Health...");
  try {
    const response = await fetch(`${API_BASE}/health`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ System health:", data.status);
      console.log(
        "   - Database:",
        data.database ? "connected" : "disconnected"
      );
      console.log("   - Scrapers:", data.scrapers ? "active" : "inactive");
      return true;
    } else {
      console.log("❌ System health check failed:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ System health error:", error.message);
    return false;
  }
}

// Test scholarship data
async function testScholarshipData() {
  console.log("\n📚 Testing Scholarship Data...");
  try {
    const response = await fetch(`${API_BASE}/scholarships`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Scholarship data retrieved:");
      console.log("   - Total scholarships:", data.scholarships?.length || 0);
      console.log("   - Live data only:", data.liveDataOnly ? "Yes" : "No");

      // Check if any scholarships have validated links
      const validatedScholarships =
        data.scholarships?.filter(
          (s) => s.linkValidated && s.linkQualityScore >= 70
        ) || [];

      console.log("   - Validated scholarships:", validatedScholarships.length);

      return true;
    } else {
      console.log("❌ Scholarship data retrieval failed:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ Scholarship data error:", error.message);
    return false;
  }
}

// Main test function
async function runAdminTests() {
  console.log("🎯 Running Admin Dashboard Tests...");

  const results = {
    health: await testSystemHealth(),
    scraping: await testScrapingTrigger(),
    circuitBreakers: await testCircuitBreakerReset(),
    scholarships: await testScholarshipData(),
  };

  console.log("\n📊 Test Results Summary:");
  console.log("========================");
  console.log("System Health:", results.health ? "✅ PASS" : "❌ FAIL");
  console.log("Scraping Trigger:", results.scraping ? "✅ PASS" : "❌ FAIL");
  console.log(
    "Circuit Breakers:",
    results.circuitBreakers ? "✅ PASS" : "❌ FAIL"
  );
  console.log(
    "Scholarship Data:",
    results.scholarships ? "✅ PASS" : "❌ FAIL"
  );

  const allPassed = Object.values(results).every((r) => r);
  console.log(
    "\n🎉 Overall Result:",
    allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"
  );

  if (allPassed) {
    console.log("\n🌟 Admin Dashboard is fully functional!");
    console.log("   - Frontend: http://localhost:5173/admin");
    console.log("   - Backend: http://localhost:5000/api/health");
    console.log("   - All endpoints working correctly");
  } else {
    console.log("\n⚠️  Some issues detected. Check the logs above.");
  }
}

// Run the tests
runAdminTests().catch(console.error);
