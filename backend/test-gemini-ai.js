/**
 * Gemini AI Integration Test Script
 * Tests all AI features and database cleanup
 */

async function testGeminiAIIntegration() {
  console.log("🤖 GEMINI AI INTEGRATION TEST");
  console.log("=".repeat(60));

  const baseURL = "http://localhost:5000/api";

  // Test cases for Gemini AI endpoints
  const tests = [
    {
      name: "AI System Status",
      method: "GET",
      url: `${baseURL}/gemini/status`,
      description: "Check if Gemini AI is properly configured",
    },
    {
      name: "AI Performance Metrics",
      method: "GET",
      url: `${baseURL}/gemini/metrics`,
      description: "Get AI performance metrics and usage statistics",
    },
    {
      name: "Content Summary Generation",
      method: "GET",
      url: `${baseURL}/gemini/content-summary?limit=10`,
      description: "Generate AI-powered content summary of scholarships",
    },
    {
      name: "Search Query Optimization",
      method: "POST",
      url: `${baseURL}/gemini/optimize-search`,
      body: { query: "engineering scholarship for women" },
      description: "Test AI-powered search query optimization",
    },
    {
      name: "Link Validation",
      method: "POST",
      url: `${baseURL}/gemini/validate-link`,
      body: {
        url: "https://scholarships.gov.in",
        scholarshipTitle: "National Scholarship Portal",
      },
      description: "Test AI-powered link validation",
    },
    {
      name: "Duplicate Detection",
      method: "POST",
      url: `${baseURL}/gemini/detect-duplicates`,
      body: { limit: 20 },
      description: "Test AI-powered duplicate scholarship detection",
    },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  console.log(`\n🔍 Testing ${totalTests} Gemini AI endpoints...\n`);

  for (const test of tests) {
    try {
      console.log(`📋 ${test.name}`);
      console.log(`   ${test.description}`);

      const options = {
        method: test.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, options);
      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`   ✅ SUCCESS (${response.status})`);

        // Display relevant results
        if (test.name === "AI System Status") {
          console.log(
            `      Gemini Status: ${
              data.aiSystems?.gemini?.status || "unknown"
            }`
          );
          console.log(
            `      Gemini Enabled: ${data.aiSystems?.gemini?.enabled || false}`
          );
          console.log(
            `      Model: ${data.aiSystems?.gemini?.model || "not configured"}`
          );
        }

        if (test.name === "Content Summary Generation") {
          console.log(
            `      Scholarships Analyzed: ${data.scholarshipsAnalyzed || 0}`
          );
          console.log(
            `      Summary: ${
              data.summary?.summary?.substring(0, 100) || "No summary"
            }...`
          );
        }

        if (test.name === "Search Query Optimization") {
          console.log(
            `      Original: ${data.optimization?.original || "N/A"}`
          );
          console.log(
            `      Optimized: ${data.optimization?.optimized || "N/A"}`
          );
        }

        if (test.name === "Duplicate Detection") {
          console.log(`      Groups Found: ${data.duplicateGroups || 0}`);
          console.log(`      Total Checked: ${data.totalChecked || 0}`);
        }

        passedTests++;
      } else {
        console.log(`   ❌ FAILED (${response.status})`);
        console.log(`      Error: ${data.error || "Unknown error"}`);

        // Check if it's a configuration issue
        if (data.error && data.error.includes("API key")) {
          console.log(`      💡 Fix: Add your Gemini API key to .env file`);
        }
      }
    } catch (error) {
      console.log(`   ❌ CONNECTION ERROR`);
      console.log(`      ${error.message}`);

      if (error.message.includes("ECONNREFUSED")) {
        console.log(`      💡 Fix: Start the backend server first`);
      }
    }

    console.log(""); // Empty line for spacing
  }

  // Database cleanup test
  console.log("\n🧹 DATABASE CLEANUP TEST");
  console.log("-".repeat(40));

  try {
    console.log("Testing database cleanup (dry run)...");

    const response = await fetch(`${baseURL}/gemini/cleanup-database`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dryRun: true }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("✅ Database cleanup test successful");
      console.log(
        `   Total Scholarships: ${data.results?.totalScholarships || 0}`
      );
      console.log(`   Duplicate Groups: ${data.results?.duplicateGroups || 0}`);
      console.log(
        `   Potential Removals: ${data.results?.potentialRemovals || 0}`
      );
      passedTests++;
    } else {
      console.log("❌ Database cleanup test failed");
      console.log(`   Error: ${data.error || "Unknown error"}`);
    }
    totalTests++;
  } catch (error) {
    console.log("❌ Database cleanup connection error");
    console.log(`   ${error.message}`);
    totalTests++;
  }

  // Final summary
  console.log("\n" + "=".repeat(60));
  console.log("🎯 GEMINI AI INTEGRATION TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
  console.log(
    `📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`
  );

  if (passedTests === totalTests) {
    console.log(
      "\n🎉 ALL TESTS PASSED! Gemini AI is fully integrated and working!"
    );
  } else if (passedTests >= totalTests * 0.7) {
    console.log("\n✅ MOSTLY WORKING! Some features may need configuration.");
  } else {
    console.log("\n⚠️  ISSUES DETECTED! Check configuration and API key.");
  }

  // Configuration guide
  console.log("\n🔧 SETUP CHECKLIST:");
  console.log(
    "   1. ✅ Install dependencies: npm install @google/generative-ai"
  );
  console.log(
    "   2. 🔑 Get Gemini API key: https://makersuite.google.com/app/apikey"
  );
  console.log("   3. 📝 Add to .env: GEMINI_API_KEY=your_key_here");
  console.log("   4. 🚀 Restart server to enable AI features");

  console.log("\n🚀 AI FEATURES AVAILABLE:");
  console.log("   • Smart content enhancement");
  console.log("   • Intelligent link validation");
  console.log("   • Advanced duplicate detection");
  console.log("   • Search query optimization");
  console.log("   • Automated content summarization");
  console.log("   • Database cleanup and optimization");

  console.log("\n📚 API ENDPOINTS:");
  console.log("   GET  /api/gemini/status");
  console.log("   GET  /api/gemini/metrics");
  console.log("   POST /api/gemini/enhance-scholarship");
  console.log("   POST /api/gemini/validate-link");
  console.log("   POST /api/gemini/detect-duplicates");
  console.log("   POST /api/gemini/optimize-search");
  console.log("   GET  /api/gemini/content-summary");
  console.log("   POST /api/gemini/bulk-enhance");
  console.log("   POST /api/gemini/cleanup-database");
}

// Run the test
console.log("Starting Gemini AI Integration Test...\n");
testGeminiAIIntegration().catch(console.error);
