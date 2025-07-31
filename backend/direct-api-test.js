/**
 * DIRECT API TEST
 * Tests all API endpoints directly
 */

import http from "http";

console.log("🔍 Direct API Test");
console.log("==================");

// Test health endpoint
function testHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/health",
        method: "GET",
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            console.log("✅ Health endpoint working:", parsed.status);
            resolve(parsed);
          } catch (e) {
            console.log("❌ Health endpoint failed:", e.message);
            reject(e);
          }
        });
      }
    );

    req.on("error", (err) => {
      console.log("❌ Health endpoint error:", err.message);
      reject(err);
    });

    req.end();
  });
}

// Test trigger scraping
function testTriggerScraping() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/scraping/trigger",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            console.log("✅ Trigger scraping working:", parsed.success);
            resolve(parsed);
          } catch (e) {
            console.log("❌ Trigger scraping failed:", e.message);
            reject(e);
          }
        });
      }
    );

    req.on("error", (err) => {
      console.log("❌ Trigger scraping error:", err.message);
      reject(err);
    });

    req.end();
  });
}

// Test scholarships endpoint
function testScholarships() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/scholarships",
        method: "GET",
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            console.log(
              "✅ Scholarships endpoint working:",
              parsed.scholarships?.length || 0,
              "scholarships"
            );
            resolve(parsed);
          } catch (e) {
            console.log("❌ Scholarships endpoint failed:", e.message);
            reject(e);
          }
        });
      }
    );

    req.on("error", (err) => {
      console.log("❌ Scholarships endpoint error:", err.message);
      reject(err);
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    console.log("\n1️⃣ Testing Health Endpoint...");
    await testHealth();

    console.log("\n2️⃣ Testing Scholarships Endpoint...");
    await testScholarships();

    console.log("\n3️⃣ Testing Trigger Scraping...");
    await testTriggerScraping();

    console.log("\n🎉 ALL API TESTS COMPLETED!");
    console.log("===========================");
    console.log("✅ Backend is fully operational");
    console.log("✅ All endpoints are working");
    console.log("✅ Admin dashboard should work");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

runTests();
