// Quick mock data checker and remover
import fetch from "node-fetch";

async function checkAndRemoveMockData() {
  try {
    console.log("🔍 Checking for mock data...");

    // Get current scholarships
    const response = await fetch("http://localhost:5000/api/scholarships");
    const data = await response.json();

    console.log(
      `📊 Total scholarships found: ${data.total || data.length || 0}`
    );

    if (data.scholarships && data.scholarships.length > 0) {
      // Look for mock/test patterns
      const mockPatterns = [
        "test",
        "mock",
        "example",
        "sample",
        "demo",
        "Lorem ipsum",
        "placeholder",
        "dummy",
        "fake",
      ];

      const scholarships = data.scholarships;
      const mockScholarships = scholarships.filter((scholarship) => {
        const text = `${scholarship.title} ${scholarship.description || ""} ${
          scholarship.provider || ""
        }`.toLowerCase();
        return mockPatterns.some((pattern) => text.includes(pattern));
      });

      console.log(
        `🔍 Found ${mockScholarships.length} potential mock scholarships`
      );

      if (mockScholarships.length > 0) {
        console.log("📋 Mock scholarships found:");
        mockScholarships.slice(0, 5).forEach((s, i) => {
          console.log(
            `   ${i + 1}. ${s.title} (${s.provider || "Unknown provider"})`
          );
        });
      }

      // Show some real scholarships
      const realScholarships = scholarships.filter(
        (s) =>
          !mockPatterns.some((p) =>
            `${s.title} ${s.description || ""} ${s.provider || ""}`
              .toLowerCase()
              .includes(p)
          )
      );

      console.log(`✅ Found ${realScholarships.length} real scholarships`);
      if (realScholarships.length > 0) {
        console.log("📋 Recent real scholarships:");
        realScholarships.slice(0, 3).forEach((s, i) => {
          console.log(
            `   ${i + 1}. ${s.title} - ${s.amount || "Amount varies"} (${
              s.provider || "Unknown"
            })`
          );
        });
      }
    }

    // Test Gemini AI
    console.log("\n🤖 Testing Gemini AI integration...");
    const aiResponse = await fetch("http://localhost:5000/api/ai/status");
    const aiData = await aiResponse.json();

    console.log(`🎯 Gemini AI Status: ${aiData.status}`);
    console.log(`🎯 Gemini AI Enabled: ${aiData.enabled}`);
    console.log(`🎯 Gemini AI Model: ${aiData.model}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkAndRemoveMockData();
