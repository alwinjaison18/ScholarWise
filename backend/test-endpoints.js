/**
 * Comprehensive endpoint test for the scholarship portal
 */

console.log("🧪 Testing all API endpoints...\n");

const API_BASE = "http://localhost:5000/api";

async function testEndpoint(name, url, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`✅ ${name}: Status ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200) + "...");
    console.log("");
    
    return { success: true, data, status: response.status };
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    console.log("");
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("SCHOLARSHIP PORTAL API ENDPOINT TESTS");
  console.log("=".repeat(60));
  console.log("");

  // Test GET endpoints
  await testEndpoint("Health Check", `${API_BASE}/health`);
  await testEndpoint("Scraping Status", `${API_BASE}/scraping/status`);
  await testEndpoint("Circuit Breakers", `${API_BASE}/scraping/circuit-breakers`);
  await testEndpoint("System Metrics", `${API_BASE}/metrics`);
  await testEndpoint("Scholarships", `${API_BASE}/scholarships`);

  // Test POST endpoints
  console.log("🔥 Testing POST endpoints...\n");
  
  await testEndpoint("Trigger Scraping", `${API_BASE}/scraping/trigger`, "POST");
  await testEndpoint("Reset Circuit Breakers", `${API_BASE}/scraping/reset-circuit-breakers`, "POST");

  console.log("🏁 All endpoint tests completed!");
  console.log("=".repeat(60));
}

runTests().catch(console.error);
