/**
 * Simple server startup test
 */

console.log("🚀 Starting server test...");

try {
  // Test imports first
  import("./src/server.js")
    .then(() => {
      console.log("✅ Server started successfully");
    })
    .catch((error) => {
      console.error("❌ Server startup failed:", error.message);
      console.error("Stack:", error.stack);
    });
} catch (error) {
  console.error("❌ Import failed:", error.message);
}
