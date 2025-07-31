/**
 * Gemini AI Service
 * Provides AI-powered content analysis, enhancement, and validation
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

class GeminiAIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    this.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS) || 2048;
    this.temperature = parseFloat(process.env.GEMINI_TEMPERATURE) || 0.3;

    if (!this.apiKey) {
      logger.warn(
        "Gemini API key not configured. AI features will be disabled."
      );
      this.enabled = false;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.generativeModel = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: this.temperature,
        },
      });
      this.enabled = true;
      logger.info("Gemini AI service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Gemini AI:", error);
      this.enabled = false;
    }
  }

  isEnabled() {
    return this.enabled;
  }

  async enhanceScholarshipContent(scholarship) {
    if (!this.enabled) {
      logger.warn("Gemini AI not enabled, returning original content");
      return scholarship;
    }

    try {
      const prompt = `
Analyze and enhance this scholarship information for Indian students. Provide a detailed, accurate response in JSON format:

Original Scholarship:
Title: ${scholarship.title}
Description: ${scholarship.description}
Eligibility: ${scholarship.eligibility || "Not specified"}
Amount: ${scholarship.amount}
Provider: ${scholarship.provider}

Please enhance and return ONLY a valid JSON object with these fields:
{
  "enhancedDescription": "Detailed, clear description (100-200 words)",
  "structuredEligibility": "Clear, bulleted eligibility criteria",
  "normalizedAmount": "Standardized amount format (e.g., ₹50,000 or Up to ₹1,00,000)",
  "category": "One of: Merit-based, Need-based, Sports, Arts, Engineering, Medical, Research, Minority, Other",
  "targetGroup": ["Array of applicable groups: SC/ST, OBC, General, Minority, Women, Disabled, All"],
  "educationLevel": "One of: School, Undergraduate, Postgraduate, Doctoral, All",
  "keyBenefits": ["Array of 3-5 key benefits"],
  "applicationTips": ["Array of 3-5 practical application tips"],
  "qualityScore": 85 // Score 0-100 based on information completeness and clarity
}

Focus on:
- Accuracy and completeness
- Clear, actionable information
- Proper categorization
- Indian education system context
- Helpful application guidance
`;

      const result = await this.generativeModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const enhancedData = JSON.parse(text);

      // Validate and merge with original scholarship
      const enhanced = {
        ...scholarship,
        description:
          enhancedData.enhancedDescription || scholarship.description,
        eligibility:
          enhancedData.structuredEligibility || scholarship.eligibility,
        amount: enhancedData.normalizedAmount || scholarship.amount,
        category: enhancedData.category || scholarship.category || "Other",
        targetGroup: enhancedData.targetGroup ||
          scholarship.targetGroup || ["All"],
        educationLevel:
          enhancedData.educationLevel || scholarship.educationLevel || "All",
        keyBenefits: enhancedData.keyBenefits || [],
        applicationTips: enhancedData.applicationTips || [],
        aiQualityScore: enhancedData.qualityScore || 70,
        aiEnhanced: true,
        aiEnhancedAt: new Date(),
      };

      logger.info(
        `Enhanced scholarship: ${scholarship.title} (Quality Score: ${enhanced.aiQualityScore})`
      );
      return enhanced;
    } catch (error) {
      logger.error("Gemini AI enhancement error:", error);
      return { ...scholarship, aiEnhanced: false };
    }
  }

  async validateScholarshipLink(url, scholarshipTitle) {
    if (!this.enabled) {
      return { isValid: true, score: 70, notes: "AI validation disabled" };
    }

    try {
      // First, try to fetch the page content
      const response = await fetch(url, {
        method: "HEAD",
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const basicValidation = {
        httpStatus: response.status,
        isAccessible: response.ok,
        contentType: response.headers.get("content-type"),
      };

      if (!response.ok) {
        return {
          isValid: false,
          score: 0,
          notes: `HTTP ${response.status} - Link not accessible`,
          basicValidation,
        };
      }

      // For successful responses, use AI to analyze if this looks like a scholarship page
      const prompt = `
Analyze this URL and determine if it's likely to be a legitimate scholarship application page:

URL: ${url}
Expected Scholarship: ${scholarshipTitle}

Based on the URL structure, domain, and path, provide a JSON response:
{
  "isLegitimate": true/false,
  "confidenceScore": 0-100,
  "reasoning": "Brief explanation of analysis",
  "riskFactors": ["Array of any concerning elements"],
  "suggestions": ["Array of recommendations if issues found"]
}

Consider:
- Is this a known educational/government domain?
- Does the URL path suggest scholarship content?
- Are there any suspicious elements?
- Does it match common scholarship portal patterns?
`;

      const result = await this.generativeModel.generateContent(prompt);
      const response2 = await result.response;
      const analysis = JSON.parse(response2.text());

      const finalScore = analysis.isLegitimate
        ? Math.max(70, analysis.confidenceScore)
        : Math.min(50, analysis.confidenceScore);

      return {
        isValid: analysis.isLegitimate && finalScore >= 70,
        score: finalScore,
        notes: analysis.reasoning,
        riskFactors: analysis.riskFactors || [],
        suggestions: analysis.suggestions || [],
        basicValidation,
        aiAnalysis: analysis,
      };
    } catch (error) {
      logger.error("Gemini AI link validation error:", error);
      return {
        isValid: false,
        score: 30,
        notes: `Validation failed: ${error.message}`,
        error: true,
      };
    }
  }

  async detectDuplicateScholarships(scholarships) {
    if (!this.enabled || scholarships.length < 2) {
      return [];
    }

    try {
      const scholarshipSummaries = scholarships.map((s, index) => ({
        index,
        id: s._id,
        title: s.title,
        provider: s.provider,
        amount: s.amount,
        description: s.description.substring(0, 200),
      }));

      const prompt = `
Analyze these scholarships and identify potential duplicates:

${JSON.stringify(scholarshipSummaries, null, 2)}

Return a JSON array of duplicate groups:
{
  "duplicateGroups": [
    {
      "confidence": 0-100,
      "scholarshipIds": ["id1", "id2"],
      "reason": "Why these are considered duplicates",
      "recommendation": "keep_first|keep_second|manual_review"
    }
  ]
}

Consider:
- Similar titles (accounting for variations)
- Same provider
- Similar amounts
- Overlapping descriptions
- Different URLs but same content
`;

      const result = await this.generativeModel.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());

      logger.info(
        `Duplicate detection found ${
          analysis.duplicateGroups?.length || 0
        } potential duplicate groups`
      );
      return analysis.duplicateGroups || [];
    } catch (error) {
      logger.error("Gemini AI duplicate detection error:", error);
      return [];
    }
  }

  async optimizeSearchQuery(userQuery) {
    if (!this.enabled) {
      return userQuery;
    }

    try {
      const prompt = `
Optimize this scholarship search query for better results:

User Query: "${userQuery}"

Return a JSON object:
{
  "optimizedQuery": "Improved search terms",
  "suggestedFilters": {
    "category": "Merit-based|Need-based|Sports|Arts|Engineering|Medical|Research|Minority|Other",
    "educationLevel": "School|Undergraduate|Postgraduate|Doctoral|All",
    "targetGroup": ["SC/ST", "OBC", "General", "Minority", "Women", "Disabled", "All"]
  },
  "searchKeywords": ["array", "of", "relevant", "keywords"],
  "reasoning": "Brief explanation of optimizations"
}

Focus on:
- Indian education system terms
- Common scholarship categories
- Relevant keywords and synonyms
- Proper filtering suggestions
`;

      const result = await this.generativeModel.generateContent(prompt);
      const response = await result.response;
      const optimization = JSON.parse(response.text());

      return {
        original: userQuery,
        optimized: optimization.optimizedQuery || userQuery,
        filters: optimization.suggestedFilters || {},
        keywords: optimization.searchKeywords || [],
        reasoning: optimization.reasoning || "",
      };
    } catch (error) {
      logger.error("Gemini AI query optimization error:", error);
      return { original: userQuery, optimized: userQuery };
    }
  }

  async generateContentSummary(scholarships) {
    if (!this.enabled || scholarships.length === 0) {
      return {
        summary: "No scholarships available",
        highlights: [],
        recommendations: [],
      };
    }

    try {
      const scholarshipData = scholarships.slice(0, 10).map((s) => ({
        title: s.title,
        provider: s.provider,
        amount: s.amount,
        category: s.category,
        deadline: s.deadline,
      }));

      const prompt = `
Analyze these scholarships and create a helpful summary for students:

${JSON.stringify(scholarshipData, null, 2)}

Return a JSON object:
{
  "summary": "2-3 sentence overview of available opportunities",
  "highlights": ["Array of 3-5 key highlights"],
  "categories": {"category": count},
  "deadlineAlerts": ["Scholarships with upcoming deadlines"],
  "recommendations": ["3-5 actionable recommendations for students"],
  "totalValue": "Estimated total value of opportunities"
}

Focus on:
- Helpful insights for Indian students
- Actionable advice
- Deadline awareness
- Category diversity
- Value propositions
`;

      const result = await this.generativeModel.generateContent(prompt);
      const response = await result.response;
      const summary = JSON.parse(response.text());

      return summary;
    } catch (error) {
      logger.error("Gemini AI content summary error:", error);
      return {
        summary: "Analysis unavailable",
        highlights: [],
        recommendations: ["Check individual scholarships for details"],
      };
    }
  }

  async getSystemHealthStatus() {
    return {
      service: "Gemini AI",
      enabled: this.enabled,
      model: this.model,
      status: this.enabled ? "operational" : "disabled",
      lastCheck: new Date().toISOString(),
      configuration: {
        maxTokens: this.maxTokens,
        temperature: this.temperature,
        hasApiKey: !!this.apiKey,
      },
    };
  }
}

// Create singleton instance
const geminiAI = new GeminiAIService();

export default geminiAI;
export { GeminiAIService };
