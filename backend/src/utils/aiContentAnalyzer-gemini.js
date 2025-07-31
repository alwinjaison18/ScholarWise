/**
 * AI Content Analyzer with Gemini AI Integration
 * Provides intelligent content analysis and enhancement for scholarships
 */

import geminiAI from "./geminiAIService.js";
import logger from "./logger.js";

class AIContentAnalyzer {
  constructor() {
    this.enabled = true;
    this.totalAnalyzed = 0;
    this.enhancementRate = 0;
    this.lastAnalysis = null;
  }

  async analyzeContent(content, context = {}) {
    try {
      this.totalAnalyzed++;
      this.lastAnalysis = new Date();

      if (!geminiAI.isEnabled()) {
        logger.warn("Gemini AI not available, using basic analysis");
        return this.basicAnalysis(content, context);
      }

      // Use Gemini AI for advanced content analysis
      const analysis = await this.performGeminiAnalysis(content, context);

      if (analysis.enhanced) {
        this.enhancementRate = (this.enhancementRate + 1) / this.totalAnalyzed;
      }

      return analysis;
    } catch (error) {
      logger.error("AI Content analysis error:", error);
      return this.basicAnalysis(content, context);
    }
  }

  async performGeminiAnalysis(content, context) {
    try {
      const prompt = `
Analyze this scholarship content and provide detailed insights:

Content: ${JSON.stringify(content)}
Context: ${JSON.stringify(context)}

Return a JSON object with:
{
  "qualityScore": 0-100,
  "readabilityScore": 0-100,
  "completenessScore": 0-100,
  "relevanceScore": 0-100,
  "suggestions": ["Array of improvement suggestions"],
  "extractedKeywords": ["Array of relevant keywords"],
  "sentimentScore": 0-100,
  "trustworthiness": 0-100,
  "urgencyLevel": "low|medium|high",
  "targetAudience": "Identified target student group",
  "improvedContent": "Enhanced version if improvements possible",
  "enhanced": true/false
}

Focus on:
- Content quality and clarity
- Relevance to Indian students
- Completeness of information
- Trust indicators
- Actionable improvements
`;

      const result = await geminiAI.generativeModel.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());

      return {
        ...analysis,
        timestamp: new Date(),
        aiProvider: "Gemini",
        processingTime: Date.now() - this.lastAnalysis,
      };
    } catch (error) {
      logger.error("Gemini analysis error:", error);
      throw error;
    }
  }

  basicAnalysis(content, context) {
    // Fallback analysis when AI is not available
    const contentStr = JSON.stringify(content).toLowerCase();

    const qualityIndicators = [
      "scholarship",
      "eligibility",
      "amount",
      "deadline",
      "application",
      "education",
      "student",
      "criteria",
      "benefit",
      "award",
    ];

    const trustIndicators = [
      "government",
      "ministry",
      "official",
      "university",
      "college",
      "institution",
      "portal",
      "website",
    ];

    const qualityScore =
      qualityIndicators.filter((word) => contentStr.includes(word)).length * 10;

    const trustScore =
      trustIndicators.filter((word) => contentStr.includes(word)).length * 15;

    return {
      qualityScore: Math.min(100, qualityScore),
      readabilityScore: 70, // Default score
      completenessScore: content.description && content.eligibility ? 80 : 50,
      relevanceScore: 75,
      trustworthiness: Math.min(100, trustScore + 40),
      suggestions: ["Consider adding more detailed eligibility criteria"],
      extractedKeywords: qualityIndicators.filter((word) =>
        contentStr.includes(word)
      ),
      sentimentScore: 75,
      urgencyLevel: "medium",
      targetAudience: "General students",
      enhanced: false,
      timestamp: new Date(),
      aiProvider: "Basic",
      processingTime: 0,
    };
  }

  async enhanceScholarshipData(scholarship) {
    try {
      if (!geminiAI.isEnabled()) {
        logger.warn("Gemini AI not available for enhancement");
        return scholarship;
      }

      const enhanced = await geminiAI.enhanceScholarshipContent(scholarship);
      return enhanced;
    } catch (error) {
      logger.error("Scholarship enhancement error:", error);
      return scholarship;
    }
  }

  async detectDuplicates(scholarships) {
    try {
      if (!geminiAI.isEnabled()) {
        return this.basicDuplicateDetection(scholarships);
      }

      const duplicates = await geminiAI.detectDuplicateScholarships(
        scholarships
      );
      return duplicates;
    } catch (error) {
      logger.error("Duplicate detection error:", error);
      return this.basicDuplicateDetection(scholarships);
    }
  }

  basicDuplicateDetection(scholarships) {
    // Simple duplicate detection based on title similarity
    const duplicates = [];

    for (let i = 0; i < scholarships.length - 1; i++) {
      for (let j = i + 1; j < scholarships.length; j++) {
        const similarity = this.calculateSimilarity(
          scholarships[i].title,
          scholarships[j].title
        );

        if (similarity > 0.8) {
          duplicates.push({
            confidence: similarity * 100,
            scholarshipIds: [scholarships[i]._id, scholarships[j]._id],
            reason: "Similar titles detected",
            recommendation: "manual_review",
          });
        }
      }
    }

    return duplicates;
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  async optimizeSearchQuery(query) {
    try {
      if (!geminiAI.isEnabled()) {
        return { original: query, optimized: query };
      }

      const optimization = await geminiAI.optimizeSearchQuery(query);
      return optimization;
    } catch (error) {
      logger.error("Query optimization error:", error);
      return { original: query, optimized: query };
    }
  }

  async generateSummary(scholarships) {
    try {
      if (!geminiAI.isEnabled()) {
        return this.basicSummary(scholarships);
      }

      const summary = await geminiAI.generateContentSummary(scholarships);
      return summary;
    } catch (error) {
      logger.error("Summary generation error:", error);
      return this.basicSummary(scholarships);
    }
  }

  basicSummary(scholarships) {
    const categories = {};
    let totalAmount = 0;

    scholarships.forEach((s) => {
      categories[s.category] = (categories[s.category] || 0) + 1;

      // Try to extract amount (basic parsing)
      const amountMatch = s.amount.match(/(\d+)/);
      if (amountMatch) {
        totalAmount += parseInt(amountMatch[1]);
      }
    });

    return {
      summary: `Found ${scholarships.length} scholarship opportunities across various categories.`,
      highlights: [
        `${scholarships.length} total opportunities`,
        `${Object.keys(categories).length} different categories`,
        "Mix of merit and need-based scholarships",
      ],
      categories,
      recommendations: [
        "Review eligibility criteria carefully",
        "Apply early to avoid deadline rush",
        "Prepare required documents in advance",
      ],
      totalValue: `Estimated ₹${totalAmount.toLocaleString()} in total opportunities`,
    };
  }

  getSystemHealth() {
    return {
      aiContentAnalyzer: {
        status: this.enabled ? "operational" : "disabled",
        totalAnalyzed: this.totalAnalyzed,
        enhancementRate: this.enhancementRate,
        lastAnalysis: this.lastAnalysis,
        geminiEnabled: geminiAI.isEnabled(),
      },
    };
  }

  getMetrics() {
    return {
      totalAnalyzed: this.totalAnalyzed,
      enhancementRate: this.enhancementRate,
      lastAnalysis: this.lastAnalysis,
      enabled: this.enabled,
      aiProvider: geminiAI.isEnabled() ? "Gemini" : "Basic",
    };
  }
}

// Export singleton instance
const aiContentAnalyzer = new AIContentAnalyzer();

export default aiContentAnalyzer;
export { AIContentAnalyzer };
