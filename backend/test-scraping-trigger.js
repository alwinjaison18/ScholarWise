// Test scraping trigger endpoint
import http from "http";

function testScrapingTrigger() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({});
    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/api/scraping/trigger",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(30000); // 30 second timeout
    req.write(data);
    req.end();
  });
}

async function testScrapingEndpoints() {
  console.log("🧪 Testing Scraping Endpoints...\n");

  try {
    console.log("📡 Testing POST /api/scraping/trigger...");
    const triggerResult = await testScrapingTrigger();

    console.log(`Status: ${triggerResult.status}`);
    console.log("Response:", JSON.stringify(triggerResult.data, null, 2));

    if (triggerResult.status === 200) {
      console.log("✅ Scraping trigger successful!");
    } else {
      console.log("❌ Scraping trigger failed!");
      console.log("Error details:", triggerResult.data);
    }
  } catch (error) {
    console.error("❌ Error testing scraping trigger:", error.message);
  }
}

testScrapingEndpoints();
