import express from "express";
import { scholarWiseBot } from "../utils/aiChatbot.js";
import { scrapingLogger } from "../utils/logger.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting for chatbot to prevent abuse
const chatbotRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error:
      "Too many chatbot requests. Please wait a moment before asking again.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/chatbot/chat - Main chat endpoint
router.post("/chat", chatbotRateLimit, async (req, res) => {
  try {
    const { message, sessionId, userContext } = req.body;

    // Validate input
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Message is required and must be a non-empty string",
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        error: "Message is too long. Please keep it under 500 characters.",
      });
    }

    // Generate or validate session ID
    const validSessionId =
      sessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    scrapingLogger.info(
      `Chatbot request - Session: ${validSessionId}, Message: "${message.substring(
        0,
        50
      )}..."`
    );

    // Generate AI response
    const response = await scholarWiseBot.generateResponse(
      message.trim(),
      validSessionId,
      userContext || {}
    );

    // Log successful response
    scrapingLogger.info(
      `Chatbot response generated for session ${validSessionId}`
    );

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    scrapingLogger.error("Chatbot API error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/chatbot/history/:sessionId - Get conversation history
router.get("/history/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required",
      });
    }

    const history = scholarWiseBot.getConversationHistory(sessionId);

    res.json({
      success: true,
      data: {
        sessionId,
        history,
        messageCount: history.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    scrapingLogger.error("Chatbot history API error:", error);
    res.status(500).json({
      error: "Failed to retrieve conversation history",
      timestamp: new Date().toISOString(),
    });
  }
});

// DELETE /api/chatbot/history/:sessionId - Clear conversation history
router.delete("/history/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required",
      });
    }

    scholarWiseBot.clearConversationHistory(sessionId);

    scrapingLogger.info(
      `Cleared conversation history for session: ${sessionId}`
    );

    res.json({
      success: true,
      message: "Conversation history cleared successfully",
      sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    scrapingLogger.error("Chatbot clear history API error:", error);
    res.status(500).json({
      error: "Failed to clear conversation history",
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/chatbot/analytics - Get chatbot analytics (admin only)
router.get("/analytics", async (req, res) => {
  try {
    const analytics = scholarWiseBot.getAnalytics();

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    scrapingLogger.error("Chatbot analytics API error:", error);
    res.status(500).json({
      error: "Failed to retrieve chatbot analytics",
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/chatbot/feedback - Submit feedback about chatbot response
router.post("/feedback", async (req, res) => {
  try {
    const { sessionId, messageId, rating, feedback, responseHelpful } =
      req.body;

    // Log feedback for analysis
    scrapingLogger.info(
      `Chatbot feedback received - Session: ${sessionId}, Rating: ${rating}, Helpful: ${responseHelpful}`
    );

    if (feedback) {
      scrapingLogger.info(
        `Chatbot feedback text: ${feedback.substring(0, 200)}...`
      );
    }

    res.json({
      success: true,
      message: "Thank you for your feedback! It helps us improve.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    scrapingLogger.error("Chatbot feedback API error:", error);
    res.status(500).json({
      error: "Failed to submit feedback",
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/chatbot/suggestions - Get quick question suggestions
router.get("/suggestions", async (req, res) => {
  try {
    const suggestions = [
      {
        id: 1,
        text: "What scholarships are available for engineering students?",
        category: "Education Level",
        icon: "🎓",
      },
      {
        id: 2,
        text: "Show me need-based scholarships",
        category: "Financial Aid",
        icon: "💰",
      },
      {
        id: 3,
        text: "How do I apply for government scholarships?",
        category: "Application Process",
        icon: "📝",
      },
      {
        id: 4,
        text: "What documents do I need for scholarship applications?",
        category: "Documentation",
        icon: "📄",
      },
      {
        id: 5,
        text: "Are there scholarships for women in STEM?",
        category: "Women Empowerment",
        icon: "👩‍🔬",
      },
      {
        id: 6,
        text: "Tell me about merit-based scholarships",
        category: "Merit Awards",
        icon: "🏆",
      },
      {
        id: 7,
        text: "What scholarships are available in my state?",
        category: "Location Based",
        icon: "📍",
      },
      {
        id: 8,
        text: "How can I track my scholarship applications?",
        category: "Application Tracking",
        icon: "📊",
      },
    ];

    // Randomize suggestions and return subset
    const shuffled = suggestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    res.json({
      success: true,
      data: {
        suggestions: selected,
        totalAvailable: suggestions.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    scrapingLogger.error("Chatbot suggestions API error:", error);
    res.status(500).json({
      error: "Failed to retrieve suggestions",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
