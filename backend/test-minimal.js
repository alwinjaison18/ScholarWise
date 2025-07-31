/**
 * Minimal server test to identify startup issues
 */

console.log("🚀 Testing minimal server startup...");

// Test basic imports first
try {
  console.log("Testing express import...");
  const express = await import("express");
  console.log("✅ Express imported successfully");

  console.log("Testing cors import...");
  const cors = await import("cors");
  console.log("✅ CORS imported successfully");

  console.log("Testing mongoose import...");
  const mongoose = await import("mongoose");
  console.log("✅ Mongoose imported successfully");

  console.log("Testing orchestrator import...");
  const orchestrator = await import("./src/scrapers/realTimeOrchestrator.js");
  console.log("✅ Orchestrator imported successfully");
  console.log("Available functions:", Object.keys(orchestrator));

  console.log("Testing utils import...");
  const utils = await import("./src/utils/logger.js");
  console.log("✅ Utils imported successfully");

  console.log("\n🎉 All imports successful! Starting minimal server...");

  // Create minimal express app
  const app = express.default();
  app.use(cors.default());
  app.use(express.default.json());

  app.get("/api/test", (req, res) => {
    res.json({ success: true, message: "Test server working!" });
  });

  const server = app.listen(5001, () => {
    console.log("✅ Minimal test server running on port 5001");
    console.log("Test URL: http://localhost:5001/api/test");
    
    // Test the endpoint
    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:5001/api/test");
        const data = await response.json();
        console.log("✅ Test endpoint response:", data);
        server.close();
        console.log("🏁 Test completed successfully!");
      } catch (error) {
        console.log("❌ Test endpoint failed:", error.message);
        server.close();
      }
    }, 1000);
  });

} catch (error) {
  console.error("❌ Import failed:", error.message);
  console.error("Stack:", error.stack);
}
