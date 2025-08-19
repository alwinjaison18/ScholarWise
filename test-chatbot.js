// Quick test for AI Chatbot API using Node.js built-in fetch (for Node 18+)
const testChatbot = async () => {
  try {
    console.log("🧪 Testing AI Chatbot API...");

    // Test data
    const testData = {
      message:
        "Hello, can you help me find engineering scholarships for undergraduate students?",
      sessionId: "test_session_" + Date.now(),
      context: {},
    };

    console.log("📤 Sending request:", testData.message);

    // Use dynamic import for node-fetch if fetch is not available
    let fetchFn;
    try {
      fetchFn = fetch; // Try built-in fetch first (Node 18+)
    } catch {
      const { default: fetch } = await import("node-fetch");
      fetchFn = fetch;
    }

    const response = await fetchFn("http://localhost:5001/api/chatbot/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("📈 HTTP Status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Chatbot Response received!");

    if (data.success) {
      console.log("🎉 AI Chatbot is working perfectly!");
      console.log("📝 AI Response:", data.response);
      if (data.scholarships && data.scholarships.length > 0) {
        console.log("🎓 Found scholarships:", data.scholarships.length);
        data.scholarships.forEach((scholarship, index) => {
          console.log(`   ${index + 1}. ${scholarship.title}`);
        });
      } else {
        console.log(
          "ℹ️ No specific scholarships returned (this is normal for general queries)"
        );
      }
      console.log("⏱️ Response time:", data.responseTime || "N/A");
    } else {
      console.log("❌ Chatbot returned error:", data.message || data.error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.message.includes("fetch")) {
      console.log(
        "💡 Note: You can test the chatbot directly in the web browser at http://localhost:5174"
      );
    }
  }
};

console.log("🚀 Starting AI Chatbot Test...");
testChatbot();
