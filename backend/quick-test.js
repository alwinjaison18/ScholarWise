/**
 * Direct API test using Node.js built-in fetch (Node 18+)
 */

async function quickTest() {
  console.log("🧪 Quick API test starting...");
  
  try {
    // Test health endpoint
    console.log("Testing health endpoint...");
    const response = await fetch("http://localhost:5000/api/health");
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Backend is running!");
      console.log("Status:", data.status);
      console.log("Database:", data.services?.database || "unknown");
      
      // Test scraping trigger
      console.log("\nTesting scraping trigger...");
      const triggerResponse = await fetch("http://localhost:5000/api/scraping/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (triggerResponse.ok) {
        const triggerData = await triggerResponse.json();
        console.log("✅ Scraping trigger works!");
        console.log("Message:", triggerData.message);
      } else {
        console.log("❌ Scraping trigger failed:", triggerResponse.status);
      }
      
      // Test circuit breaker reset
      console.log("\nTesting circuit breaker reset...");
      const resetResponse = await fetch("http://localhost:5000/api/scraping/reset-circuit-breakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (resetResponse.ok) {
        const resetData = await resetResponse.json();
        console.log("✅ Circuit breaker reset works!");
        console.log("Message:", resetData.message);
      } else {
        console.log("❌ Circuit breaker reset failed:", resetResponse.status);
      }
      
    } else {
      console.log("❌ Backend not responding:", response.status);
    }
  } catch (error) {
    console.log("❌ Connection failed:", error.message);
    console.log("Make sure the backend server is running on port 5000");
  }
  
  console.log("\n🏁 Test completed!");
}

quickTest();
