// Simple wrapper to run cleanup with better error handling
import("./cleanup-and-setup-ai.js").catch((error) => {
  console.error("Error running cleanup script:", error);
  process.exit(1);
});
