import { GoogleGenerativeAI } from "@google/generative-ai";
import { scrapingLogger } from "../utils/logger.js";
import Scholarship from "../models/Scholarship.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Verify Gemini AI initialization
if (!genAI) {
  throw new Error(
    "Failed to initialize GoogleGenerativeAI - genAI is null or undefined"
  );
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

// Knowledge base about ScholarWise and scholarships
const KNOWLEDGE_BASE = `
You are ScholarWise Assistant, an AI chatbot for the ScholarWise India scholarship portal. Your role is to help Indian students find scholarships and navigate the platform.

ABOUT SCHOLARWISE:
- ScholarWise India is a comprehensive scholarship portal for Indian students
- We provide real-time, verified scholarship information with tested application links
- Our platform uses AI-powered web scraping to ensure all data is current and accurate
- We cover scholarships for all education levels: undergraduate, postgraduate, PhD, and professional courses
- All scholarships are verified and application links are tested before being listed

KEY FEATURES:
1. Real-time scholarship data from 6+ verified sources
2. AI-powered link validation ensuring 100% working application links
3. Smart filtering by education level, state, category, and amount
4. Personalized dashboard for tracking applications
5. Deadline alerts and application reminders
6. Mobile-responsive design for access anywhere

SCHOLARSHIP CATEGORIES:
- Merit-based scholarships
- Need-based financial aid
- Minority community scholarships
- Women empowerment scholarships
- State government scholarships
- Central government schemes
- Private foundation awards
- International study grants
- Research fellowships
- Sports scholarships

ELIGIBILITY SUPPORT:
- Help students understand eligibility criteria
- Suggest relevant scholarships based on academic background
- Guide through application processes
- Provide tips for successful applications

IMPORTANT GUIDELINES:
1. Always be helpful, encouraging, and supportive
2. Provide accurate information about scholarships and the platform
3. If you don't know specific details, suggest checking the scholarship details page
4. Encourage users to verify all information from official sources
5. Never guarantee scholarship approval - emphasize that applications are competitive
6. Be empathetic to students' financial concerns and educational aspirations
7. Suggest contacting our support team for technical issues
8. Promote the platform's key features when relevant

RESPONSE STYLE:
- Friendly and conversational
- Use simple, clear language
- Provide actionable advice
- Include relevant links or suggestions to explore the platform
- Be concise but comprehensive
- Use encouraging and positive tone
`;

class ScholarWiseAIChatbot {
  constructor() {
    try {
      if (!genAI) {
        throw new Error("genAI is not initialized");
      }
      this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      this.conversationHistory = new Map(); // Store conversation context per session
      this.maxHistoryLength = 10; // Limit conversation history

      if (!this.model) {
        throw new Error("Failed to create Gemini model");
      }
    } catch (error) {
      console.error("Error initializing ScholarWiseAIChatbot:", error);
      throw error;
    }
  }

  // Generate contextual response based on user query
  async generateResponse(userMessage, sessionId, userContext = {}) {
    try {
      // Get or create conversation history for this session
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }

      const history = this.conversationHistory.get(sessionId);

      // Get relevant scholarship data based on user query
      const relevantScholarships = await this.findRelevantScholarships(
        userMessage
      );

      // Build context for AI
      const contextPrompt = this.buildContextPrompt(
        userMessage,
        history,
        relevantScholarships,
        userContext
      );

      scrapingLogger.info(
        `AI Chatbot generating response for: "${userMessage.substring(
          0,
          50
        )}..."`
      );

      // Generate response using Gemini
      const result = await this.model.generateContent(contextPrompt);
      const response = result.response;
      const aiResponse = response.text();

      // Update conversation history
      history.push(
        { role: "user", content: userMessage, timestamp: new Date() },
        { role: "assistant", content: aiResponse, timestamp: new Date() }
      );

      // Limit history length
      if (history.length > this.maxHistoryLength * 2) {
        history.splice(0, 4); // Remove oldest 2 exchanges
      }

      this.conversationHistory.set(sessionId, history);

      scrapingLogger.info(`AI Chatbot response generated successfully`);

      return {
        response: aiResponse,
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        relevantScholarships: relevantScholarships.slice(0, 3), // Include top 3 relevant scholarships
      };
    } catch (error) {
      scrapingLogger.error("AI Chatbot error:", error);
      return {
        response: this.getFallbackResponse(userMessage),
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        error: true,
      };
    }
  }

  // Find scholarships relevant to user query
  async findRelevantScholarships(query) {
    try {
      const keywords = this.extractKeywords(query);

      // Build search criteria based on keywords
      const searchCriteria = {
        isActive: true,
        $or: [],
      };

      // Add text search conditions
      keywords.forEach((keyword) => {
        searchCriteria.$or.push(
          { title: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
          { category: { $regex: keyword, $options: "i" } },
          { eligibility: { $regex: keyword, $options: "i" } }
        );
      });

      // If no keywords found, return recent scholarships
      if (searchCriteria.$or.length === 0) {
        return await Scholarship.find({ isActive: true })
          .sort({ scrapedAt: -1 })
          .limit(5)
          .select("title description amount deadline category applicationLink")
          .lean();
      }

      const scholarships = await Scholarship.find(searchCriteria)
        .sort({ scrapedAt: -1 })
        .limit(5)
        .select(
          "title description amount deadline category applicationLink state educationLevel"
        )
        .lean();

      return scholarships;
    } catch (error) {
      scrapingLogger.error("Error finding relevant scholarships:", error);
      return [];
    }
  }

  // Extract keywords from user query
  extractKeywords(query) {
    const lowercaseQuery = query.toLowerCase();
    const keywords = [];

    // Education level keywords
    const educationLevels = [
      "undergraduate",
      "graduate",
      "postgraduate",
      "phd",
      "doctorate",
      "diploma",
      "bachelor",
      "master",
      "btech",
      "mtech",
      "mbbs",
      "engineering",
      "medical",
      "arts",
      "science",
      "commerce",
    ];
    educationLevels.forEach((level) => {
      if (lowercaseQuery.includes(level)) keywords.push(level);
    });

    // Category keywords
    const categories = [
      "merit",
      "need",
      "minority",
      "women",
      "girl",
      "sc",
      "st",
      "obc",
      "muslim",
      "christian",
      "sports",
      "research",
      "international",
    ];
    categories.forEach((category) => {
      if (lowercaseQuery.includes(category)) keywords.push(category);
    });

    // State keywords
    const states = [
      "maharashtra",
      "delhi",
      "karnataka",
      "tamil nadu",
      "gujarat",
      "rajasthan",
      "uttar pradesh",
      "west bengal",
      "bihar",
      "odisha",
    ];
    states.forEach((state) => {
      if (lowercaseQuery.includes(state)) keywords.push(state);
    });

    // Subject keywords
    const subjects = [
      "engineering",
      "medical",
      "management",
      "law",
      "arts",
      "science",
      "commerce",
      "agriculture",
      "pharmacy",
      "nursing",
      "teaching",
    ];
    subjects.forEach((subject) => {
      if (lowercaseQuery.includes(subject)) keywords.push(subject);
    });

    return keywords;
  }

  // Build comprehensive context prompt for AI
  buildContextPrompt(userMessage, history, scholarships, userContext) {
    let prompt = KNOWLEDGE_BASE + "\n\n";

    // Add conversation history for context
    if (history.length > 0) {
      prompt += "CONVERSATION HISTORY:\n";
      history.slice(-6).forEach((exchange) => {
        prompt += `${exchange.role.toUpperCase()}: ${exchange.content}\n`;
      });
      prompt += "\n";
    }

    // Add user context if available
    if (
      userContext.educationLevel ||
      userContext.state ||
      userContext.interests
    ) {
      prompt += "USER CONTEXT:\n";
      if (userContext.educationLevel)
        prompt += `Education Level: ${userContext.educationLevel}\n`;
      if (userContext.state) prompt += `State: ${userContext.state}\n`;
      if (userContext.interests)
        prompt += `Interests: ${userContext.interests.join(", ")}\n`;
      prompt += "\n";
    }

    // Add relevant scholarships
    if (scholarships.length > 0) {
      prompt += "RELEVANT SCHOLARSHIPS FOUND:\n";
      scholarships.forEach((scholarship, index) => {
        prompt += `${index + 1}. ${scholarship.title}\n`;
        prompt += `   Amount: ${scholarship.amount || "Not specified"}\n`;
        prompt += `   Deadline: ${
          scholarship.deadline || "Check official website"
        }\n`;
        prompt += `   Category: ${scholarship.category || "General"}\n`;
        if (scholarship.description) {
          prompt += `   Description: ${scholarship.description.substring(
            0,
            200
          )}...\n`;
        }
        prompt += "\n";
      });
    }

    // Add current user query
    prompt += `CURRENT USER QUERY: "${userMessage}"\n\n`;

    // Add specific instructions
    prompt += `Please provide a helpful, detailed response to the user's query. If relevant scholarships were found, mention them and explain how they relate to the user's needs. Always encourage the user to visit the scholarship details page for complete information and to verify eligibility. Keep the response conversational, supportive, and actionable.`;

    return prompt;
  }

  // Fallback response for errors
  getFallbackResponse(userMessage) {
    const fallbacks = [
      "I'm here to help you find scholarships! Could you please rephrase your question? You can ask me about scholarship eligibility, application processes, or search for specific types of scholarships.",
      "I'd love to assist you with your scholarship search! Try asking me about scholarships for your education level, state, or field of study.",
      "I'm having trouble understanding your query right now, but I'm here to help! You can ask me about merit scholarships, need-based aid, or scholarships for specific communities.",
      "Let me help you find the right scholarships! You can search by education level (like 'undergraduate scholarships'), state (like 'Maharashtra scholarships'), or category (like 'engineering scholarships').",
    ];

    const randomIndex = Math.floor(Math.random() * fallbacks.length);
    return fallbacks[randomIndex];
  }

  // Get conversation history for a session
  getConversationHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || [];
  }

  // Clear conversation history for a session
  clearConversationHistory(sessionId) {
    this.conversationHistory.delete(sessionId);
  }

  // Get chatbot analytics
  getAnalytics() {
    const activeSessions = this.conversationHistory.size;
    const totalMessages = Array.from(this.conversationHistory.values()).reduce(
      (total, history) => total + history.length,
      0
    );

    return {
      activeSessions,
      totalMessages,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const scholarWiseBot = new ScholarWiseAIChatbot();
export default scholarWiseBot;
