/**
 * Quick API test to verify new endpoints
 */

import axios from "axios";

const API_BASE = "http://localhost:5000/api";

async function testAPIs() {
  console.log("🧪 Testing API endpoints...\n");

  const endpoints = [
    { name: "Health Check", url: `${API_BASE}/health` },
    { name: "Scraping Status", url: `${API_BASE}/scraping/status` },
    { name: "Circuit Breakers", url: `${API_BASE}/scraping/circuit-breakers` },
    { name: "Scholarships", url: `${API_BASE}/scholarships` },
    { name: "Metrics", url: `${API_BASE}/metrics` },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await axios.get(endpoint.url, { timeout: 5000 });
      console.log(`✅ ${endpoint.name}: Status ${response.status}`);

      if (endpoint.name === "Scraping Status") {
        console.log(
          `   - Scrapers: ${response.data?.status?.totalScrapers || 0}`
        );
        console.log(
          `   - Active: ${response.data?.status?.activeScrapers || 0}`
        );
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
    console.log("");
  }

  console.log("🏁 API testing completed!");
}

testAPIs().catch(console.error);
