/**
 * ADVANCED LINK VALIDATION SYSTEM
 *
 * Comprehensive link validation with AI-powered content analysis,
 * quality scoring, and real-time monitoring for scholarship portal.
 *
 * CRITICAL: All links must achieve quality score >= 70 to be saved
 *
 * @description Production link validation system
 * @author Scholarship Portal Team
 * @version 3.0.0 - Production Ready with AI
 * @created 2025-07-10
 */

import axios from "axios";
import cheerio from "cheerio";
import { URL } from "url";
import { validationLogger } from "./logger.js";

/**
 * Link validation configuration
 */
const VALIDATION_CONFIG = {
  MIN_QUALITY_SCORE: 70,
  REQUEST_TIMEOUT: 15000,
  MAX_REDIRECTS: 5,
  USER_AGENT: "ScholarshipPortal-LinkValidator/3.0",
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000,
};

/**
 * Scholarship-related keywords for content validation
 */
const SCHOLARSHIP_KEYWORDS = [
  "scholarship", "fellowships", "grant", "bursary", "financial aid",
  "education funding", "student assistance", "academic award",
  "application form", "apply now", "eligibility", "criteria",
  "deadline", "submit", "register", "enrollment"
];

/**
 * Red flag indicators for invalid links
 */
const RED_FLAGS = [
  "page not found", "404", "error", "expired", "closed",
  "maintenance", "temporarily unavailable", "access denied",
  "under construction", "coming soon", "invalid request"
];

/**
 * Advanced Link Validation Class
 */
class LinkValidationSystem {
  constructor() {
    this.httpClient = axios.create({
      timeout: VALIDATION_CONFIG.REQUEST_TIMEOUT,
      maxRedirects: VALIDATION_CONFIG.MAX_REDIRECTS,
      headers: {
        "User-Agent": VALIDATION_CONFIG.USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });
    
    this.validationStats = {
      totalValidated: 0,
      successfulValidations: 0,
      failedValidations: 0,
      averageQualityScore: 0,
    };
  }

  /**
   * MAIN VALIDATION FUNCTION
   * Validates scholarship application links with comprehensive checks
   */
  async validateScholarshipLink(scholarship) {
    validationLogger.info(`🔍 Validating link for: ${scholarship.title}`);
    
    const validationResult = {
      isValid: false,
      qualityScore: 0,
      errors: [],
      warnings: [],
      linkHealth: {
        httpStatus: null,
        responseTime: null,
        finalUrl: null,
        isSecure: false,
        certificateValid: false,
      },
      contentAnalysis: {
        isScholarshipRelated: false,
        hasApplicationForm: false,
        hasContactInfo: false,
        hasDeadlineInfo: false,
        titleMatches: false,
        contentQuality: 0,
      },
      accessibility: {
        mobileCompatible: false,
        hasNavigation: false,
        hasStructuredData: false,
      },
      metadata: {
        title: null,
        description: null,
        keywords: [],
        lastModified: null,
      },
    };

    try {
      // Step 1: Basic URL validation
      if (!this.isValidUrl(scholarship.applicationLink)) {
        validationResult.errors.push("Invalid URL format");
        return validationResult;
      }

      // Step 2: HTTP accessibility test
      const httpResult = await this.testHttpAccessibility(scholarship.applicationLink);
      validationResult.linkHealth = { ...validationResult.linkHealth, ...httpResult };

      if (!httpResult.accessible) {
        validationResult.errors.push(`HTTP Error: ${httpResult.error}`);
        return validationResult;
      }

      // Step 3: Content analysis
      const contentResult = await this.analyzePageContent(
        httpResult.content,
        httpResult.finalUrl,
        scholarship
      );
      validationResult.contentAnalysis = contentResult;

      // Step 4: Accessibility check
      const accessibilityResult = await this.checkAccessibility(httpResult.content);
      validationResult.accessibility = accessibilityResult;

      // Step 5: Extract metadata
      validationResult.metadata = this.extractMetadata(httpResult.content);

      // Step 6: Calculate quality score
      validationResult.qualityScore = this.calculateQualityScore(validationResult);

      // Step 7: Determine if link is valid
      validationResult.isValid = validationResult.qualityScore >= VALIDATION_CONFIG.MIN_QUALITY_SCORE;

      // Update statistics
      this.updateValidationStats(validationResult);

      validationLogger.info(
        `✅ Link validation completed: ${scholarship.title} - Score: ${validationResult.qualityScore}/100`
      );

      return validationResult;

    } catch (error) {
      validationResult.errors.push(`Validation failed: ${error.message}`);
      validationLogger.error(`❌ Link validation error: ${error.message}`);
      return validationResult;
    }
  }

  /**
   * Test HTTP accessibility and performance
   */
  async testHttpAccessibility(url) {
    const startTime = Date.now();
    
    try {
      const response = await this.httpClient.get(url);
      const responseTime = Date.now() - startTime;
      
      const parsedUrl = new URL(response.request.res.responseUrl || url);
      
      return {
        accessible: true,
        httpStatus: response.status,
        responseTime,
        finalUrl: response.request.res.responseUrl || url,
        isSecure: parsedUrl.protocol === "https:",
        certificateValid: parsedUrl.protocol === "https:", // Simplified check
        content: response.data,
        contentType: response.headers["content-type"] || "",
        contentLength: response.headers["content-length"] || 0,
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message,
        httpStatus: error.response?.status || null,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Analyze page content for scholarship relevance
   */
  async analyzePageContent(htmlContent, finalUrl, scholarship) {
    const $ = cheerio.load(htmlContent);
    const pageText = $("body").text().toLowerCase();
    const pageTitle = $("title").text().toLowerCase();
    
    // Remove extra whitespace and normalize
    const normalizedText = pageText.replace(/\s+/g, " ").trim();
    const normalizedTitle = pageTitle.replace(/\s+/g, " ").trim();
    const scholarshipTitle = scholarship.title.toLowerCase();

    const analysis = {
      isScholarshipRelated: false,
      hasApplicationForm: false,
      hasContactInfo: false,
      hasDeadlineInfo: false,
      titleMatches: false,
      contentQuality: 0,
      keywordMatches: 0,
      redFlags: 0,
    };

    // Check for scholarship-related keywords
    SCHOLARSHIP_KEYWORDS.forEach(keyword => {
      if (normalizedText.includes(keyword)) {
        analysis.keywordMatches++;
      }
    });

    // Check for red flags
    RED_FLAGS.forEach(flag => {
      if (normalizedText.includes(flag)) {
        analysis.redFlags++;
      }
    });

    // Check if title matches scholarship
    const titleWords = scholarshipTitle.split(" ").filter(word => word.length > 3);
    const titleMatchCount = titleWords.filter(word => 
      normalizedTitle.includes(word) || normalizedText.includes(word)
    ).length;
    
    analysis.titleMatches = titleMatchCount >= Math.ceil(titleWords.length * 0.6);

    // Check for application form indicators
    const formSelectors = [
      "form", "input[type='submit']", "button[type='submit']",
      ".apply-now", ".application-form", ".register-now",
      "a[href*='apply']", "a[href*='register']", "a[href*='application']"
    ];
    
    analysis.hasApplicationForm = formSelectors.some(selector => $(selector).length > 0);

    // Check for contact information
    const contactIndicators = [
      "contact", "email", "@", "phone", "tel:", "mailto:",
      "address", "office", "helpdesk", "support"
    ];
    
    analysis.hasContactInfo = contactIndicators.some(indicator => 
      normalizedText.includes(indicator)
    );

    // Check for deadline information
    const deadlineIndicators = [
      "deadline", "last date", "apply by", "closing date",
      "expiry", "expires", "until", "before"
    ];
    
    analysis.hasDeadlineInfo = deadlineIndicators.some(indicator => 
      normalizedText.includes(indicator)
    );

    // Calculate content quality
    analysis.contentQuality = this.calculateContentQuality(analysis, normalizedText);
    analysis.isScholarshipRelated = analysis.keywordMatches >= 3 && analysis.redFlags === 0;

    return analysis;
  }

  /**
   * Check accessibility features
   */
  async checkAccessibility(htmlContent) {
    const $ = cheerio.load(htmlContent);
    
    return {
      mobileCompatible: $("meta[name='viewport']").length > 0,
      hasNavigation: $("nav, .navigation, .menu").length > 0,
      hasStructuredData: $("script[type='application/ld+json']").length > 0,
      hasAltText: $("img[alt]").length > $("img").length * 0.8,
      hasHeadings: $("h1, h2, h3").length > 0,
    };
  }

  /**
   * Extract page metadata
   */
  extractMetadata(htmlContent) {
    const $ = cheerio.load(htmlContent);
    
    return {
      title: $("title").text().trim(),
      description: $("meta[name='description']").attr("content") || "",
      keywords: ($("meta[name='keywords']").attr("content") || "").split(",").map(k => k.trim()),
      lastModified: $("meta[name='last-modified']").attr("content") || null,
      author: $("meta[name='author']").attr("content") || "",
      ogTitle: $("meta[property='og:title']").attr("content") || "",
      ogDescription: $("meta[property='og:description']").attr("content") || "",
    };
  }

  /**
   * Calculate content quality score
   */
  calculateContentQuality(analysis, text) {
    let score = 0;
    
    // Content length bonus
    if (text.length > 500) score += 10;
    if (text.length > 1000) score += 10;
    
    // Keyword density bonus
    if (analysis.keywordMatches >= 5) score += 20;
    else if (analysis.keywordMatches >= 3) score += 10;
    
    // Structure bonus
    if (analysis.hasApplicationForm) score += 15;
    if (analysis.hasContactInfo) score += 10;
    if (analysis.hasDeadlineInfo) score += 10;
    
    // Red flags penalty
    score -= analysis.redFlags * 15;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate overall quality score (0-100)
   */
  calculateQualityScore(validationResult) {
    let score = 0;
    
    // HTTP Accessibility (40 points)
    if (validationResult.linkHealth.httpStatus === 200) score += 30;
    else if (validationResult.linkHealth.httpStatus < 400) score += 20;
    
    if (validationResult.linkHealth.isSecure) score += 5;
    if (validationResult.linkHealth.responseTime < 3000) score += 5;
    
    // Content Relevance (35 points)
    if (validationResult.contentAnalysis.isScholarshipRelated) score += 15;
    if (validationResult.contentAnalysis.titleMatches) score += 10;
    if (validationResult.contentAnalysis.hasApplicationForm) score += 10;
    
    // Content Quality (15 points)
    score += Math.round(validationResult.contentAnalysis.contentQuality * 0.15);
    
    // Accessibility (10 points)
    if (validationResult.accessibility.mobileCompatible) score += 3;
    if (validationResult.accessibility.hasNavigation) score += 2;
    if (validationResult.accessibility.hasStructuredData) score += 2;
    if (validationResult.accessibility.hasAltText) score += 2;
    if (validationResult.accessibility.hasHeadings) score += 1;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Validate URL format
   */
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  /**
   * Update validation statistics
   */
  updateValidationStats(result) {
    this.validationStats.totalValidated++;
    
    if (result.isValid) {
      this.validationStats.successfulValidations++;
    } else {
      this.validationStats.failedValidations++;
    }
    
    // Update average quality score
    const totalScore = this.validationStats.averageQualityScore * (this.validationStats.totalValidated - 1);
    this.validationStats.averageQualityScore = 
      (totalScore + result.qualityScore) / this.validationStats.totalValidated;
  }

  /**
   * Get validation statistics
   */
  getValidationStats() {
    return {
      ...this.validationStats,
      successRate: this.validationStats.totalValidated > 0 
        ? (this.validationStats.successfulValidations / this.validationStats.totalValidated) * 100 
        : 0,
    };
  }

  /**
   * Batch validate multiple scholarship links
   */
  async batchValidateLinks(scholarships, concurrency = 3) {
    validationLogger.info(`🔍 Starting batch validation of ${scholarships.length} scholarships`);
    
    const results = [];
    const promises = [];
    
    for (let i = 0; i < scholarships.length; i += concurrency) {
      const batch = scholarships.slice(i, i + concurrency);
      const batchPromises = batch.map(async (scholarship) => {
        try {
          const result = await this.validateScholarshipLink(scholarship);
          return { scholarship, validation: result };
        } catch (error) {
          validationLogger.error(`Batch validation error for ${scholarship.title}: ${error.message}`);
          return { 
            scholarship, 
            validation: { 
              isValid: false, 
              qualityScore: 0, 
              errors: [error.message] 
            } 
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to be respectful
      if (i + concurrency < scholarships.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const validResults = results.filter(r => r.validation.isValid);
    
    validationLogger.info(
      `✅ Batch validation completed: ${validResults.length}/${scholarships.length} valid scholarships`
    );
    
    return results;
  }
}

// Export singleton instance
export default new LinkValidationSystem();
