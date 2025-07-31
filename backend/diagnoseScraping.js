// Test rate limiting and scraping trigger
import http from "http";

function makeRequest(method, path, data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "127.0.0.1", // Add IP header
      },
    };

    const req = http.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: responseData,
        });
      });
    });

    req.on("error", (error) => {
      resolve({ status: "ERROR", data: error.message });
    });

    req.setTimeout(10000);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function diagnoseScrapingIssue() {
  console.log("🔍 DIAGNOSING SCRAPING TRIGGER ISSUE\n");

  // Test 1: Check server health
  console.log("1️⃣ Testing server health...");
  const health = await makeRequest("GET", "/health");
  console.log(`   Status: ${health.status}`);
  if (health.data) {
    try {
      const healthData = JSON.parse(health.data);
      console.log(`   Database: ${healthData.database}`);
    } catch (e) {
      console.log(`   Response: ${health.data.substring(0, 100)}`);
    }
  }

  // Test 2: Check scraping status
  console.log("\n2️⃣ Testing scraping status...");
  const status = await makeRequest("GET", "/scraping/status");
  console.log(`   Status: ${status.status}`);

  // Test 3: Test scraping trigger (this is where the issue might be)
  console.log("\n3️⃣ Testing scraping trigger...");
  const trigger = await makeRequest("POST", "/scraping/trigger");
  console.log(`   Status: ${trigger.status}`);
  console.log(`   Rate Limit Headers:`);
  console.log(
    `     X-RateLimit-Limit: ${trigger.headers?.["x-ratelimit-limit"] || "N/A"}`
  );
  console.log(
    `     X-RateLimit-Remaining: ${
      trigger.headers?.["x-ratelimit-remaining"] || "N/A"
    }`
  );
  console.log(
    `     X-RateLimit-Reset: ${trigger.headers?.["x-ratelimit-reset"] || "N/A"}`
  );

  if (trigger.status === 429) {
    console.log("   ❌ RATE LIMIT EXCEEDED!");
    console.log("   This is likely the cause of the admin portal error.");
  } else if (trigger.status === 200) {
    console.log("   ✅ Scraping trigger successful!");
    try {
      const triggerData = JSON.parse(trigger.data);
      console.log(`   Message: ${triggerData.message}`);
    } catch (e) {
      console.log(`   Response: ${trigger.data.substring(0, 200)}`);
    }
  } else {
    console.log("   ❌ Unexpected status code");
    console.log(`   Response: ${trigger.data.substring(0, 200)}`);
  }

  // Test 4: Check circuit breakers
  console.log("\n4️⃣ Testing circuit breakers...");
  const breakers = await makeRequest("GET", "/scraping/circuit-breakers");
  console.log(`   Status: ${breakers.status}`);

  console.log("\n🎯 DIAGNOSIS COMPLETE");
  console.log("If status 429 (rate limit) was seen, that's your issue!");
}

diagnoseScrapingIssue();
