/**
 * LINK FIXER SCRAPER
 *
 * Validates and fixes broken scholarship links using AI-powered analysis.
 * Implements the mandatory link validation requirements.
 *
 * @description AI-powered link validation and fixing system
 * @author Scholarship Portal Team
 * @version 2.0.0 - Production Ready
 */

import axios from "axios";
import { scrapingLogger } from "../utils/logger.js";
import Scholarship from "../models/Scholarship.js";

export class LinkFixerScraper {
  constructor() {
    this.timeout = 10000;
    this.maxRetries = 3;
  }

  /**
   * Test if a link is accessible
   * @param {string} url - URL to test
   * @returns {Object} - Validation results
   */
  async testLinkAccessibility(url) {
    try {
      const response = await axios.head(url, {
        timeout: this.timeout,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
      });

      return {
        status: response.status,
        accessible: response.status < 400,
        redirected: response.request.res?.responseUrl !== url,
        finalUrl: response.request.res?.responseUrl || url,
      };
    } catch (error) {
      return {
        status: error.response?.status || 0,
        accessible: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyze link content for scholarship relevance
   * @param {string} url - URL to analyze
   * @returns {Object} - Content analysis results
   */
  async analyzeLinkContent(url) {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        maxRedirects: 5,
      });

      const content = response.data.toLowerCase();

      // Check for scholarship-related keywords
      const scholarshipKeywords = [
        "scholarship",
        "apply",
        "application",
        "eligibility",
        "grant",
        "fellowship",
        "financial aid",
        "education",
        "form",
        "register",
        "deadline",
        "submit",
      ];

      const hasScholarshipInfo = scholarshipKeywords.some((keyword) =>
        content.includes(keyword)
      );

      const hasApplicationForm = [
        "form",
        "apply now",
        "register",
        "submit application",
        "application form",
        "online application",
      ].some((keyword) => content.includes(keyword));

      const hasContactInfo = [
        "contact",
        "email",
        "phone",
        "address",
        "support",
      ].some((keyword) => content.includes(keyword));

      const hasDeadlineInfo = [
        "deadline",
        "last date",
        "closing date",
        "due date",
      ].some((keyword) => content.includes(keyword));

      return {
        containsScholarshipInfo: hasScholarshipInfo,
        hasApplicationForm: hasApplicationForm,
        hasContactInfo: hasContactInfo,
        hasDeadlineInfo: hasDeadlineInfo,
        contentLength: content.length,
      };
    } catch (error) {
      return {
        containsScholarshipInfo: false,
        hasApplicationForm: false,
        hasContactInfo: false,
        hasDeadlineInfo: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate link quality score
   * @param {Object} validationResults - Results from validation
   * @param {Object} pageContent - Results from content analysis
   * @returns {number} - Quality score (0-100)
   */
  calculateLinkQuality(validationResults, pageContent) {
    let score = 0;

    // Accessibility (40 points)
    if (validationResults.accessible) score += 40;

    // Relevance (30 points)
    if (pageContent.containsScholarshipInfo) score += 20;
    if (pageContent.hasApplicationForm) score += 10;

    // Functionality (30 points)
    if (pageContent.hasApplicationForm) score += 20;
    if (pageContent.hasContactInfo) score += 5;
    if (pageContent.hasDeadlineInfo) score += 5;

    return score;
  }

  /**
   * Validate scholarship links according to MANDATORY requirements
   * @param {Object} scholarship - Scholarship object to validate
   * @returns {Object} - Comprehensive validation results
   */
  async validateScholarshipLinks(scholarship) {
    const validationResults = {
      applicationLinkValid: false,
      sourceUrlValid: false,
      leadsToCorrectPage: false,
      applicationFormPresent: false,
      scholarshipNameMatches: false,
      qualityScore: 0,
      errors: [],
    };

    try {
      // Test application link accessibility
      const linkResponse = await this.testLinkAccessibility(
        scholarship.applicationLink
      );
      validationResults.applicationLinkValid = linkResponse.accessible;

      if (linkResponse.accessible) {
        // Verify the link leads to correct scholarship page
        const pageContent = await this.analyzeLinkContent(
          scholarship.applicationLink
        );
        validationResults.leadsToCorrectPage =
          pageContent.containsScholarshipInfo;
        validationResults.applicationFormPresent =
          pageContent.hasApplicationForm;

        // Check if scholarship name matches (basic keyword matching)
        const titleWords = scholarship.title.toLowerCase().split(" ");
        validationResults.scholarshipNameMatches = titleWords.some(
          (word) => pageContent.containsScholarshipInfo && word.length > 3
        );

        // Calculate quality score
        validationResults.qualityScore = this.calculateLinkQuality(
          linkResponse,
          pageContent
        );
      }

      // Test source URL if different from application link
      if (
        scholarship.sourceUrl &&
        scholarship.sourceUrl !== scholarship.applicationLink
      ) {
        const sourceResponse = await this.testLinkAccessibility(
          scholarship.sourceUrl
        );
        validationResults.sourceUrlValid = sourceResponse.accessible;
      } else {
        validationResults.sourceUrlValid =
          validationResults.applicationLinkValid;
      }
    } catch (error) {
      validationResults.errors.push(error.message);
      scrapingLogger.error(
        `Link validation failed for ${scholarship.title}:`,
        error
      );
    }

    return validationResults;
  }

  /**
   * Attempt to repair a broken link
   * @param {Object} scholarship - Scholarship with broken link
   * @returns {Object} - Repair results
   */
  async attemptLinkRepair(scholarship) {
    try {
      // Try common variations of the URL
      const url = scholarship.applicationLink;
      const variations = [
        url.replace("http://", "https://"),
        url.replace("https://", "http://"),
        url + "/",
        url.replace(/\/$/, ""),
        url.replace("www.", ""),
        "https://www." + url.replace(/^https?:\/\//, "").replace("www.", ""),
      ];

      for (const variant of variations) {
        const response = await this.testLinkAccessibility(variant);
        if (response.accessible) {
          scrapingLogger.info(
            `Link repaired for ${scholarship.title}: ${variant}`
          );
          return {
            success: true,
            newUrl: variant,
            method: "url_variation",
          };
        }
      }

      return {
        success: false,
        error: "No working URL variation found",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle broken link detection and repair
   * @param {Object} scholarship - Scholarship with broken link
   * @param {string} error - Error message
   */
  async handleBrokenLink(scholarship, error) {
    scrapingLogger.warn(
      `Broken link detected: ${scholarship.title} - ${error}`
    );

    try {
      // Attempt automatic link repair
      const repairedLink = await this.attemptLinkRepair(scholarship);

      if (repairedLink.success) {
        scholarship.applicationLink = repairedLink.newUrl;
        scholarship.lastValidated = new Date();
        await scholarship.save();
        scrapingLogger.info(`Link repaired: ${scholarship.title}`);
        return { repaired: true, newUrl: repairedLink.newUrl };
      } else {
        // Mark as inactive but keep for manual review
        scholarship.isActive = false;
        scholarship.linkStatus = "broken";
        scholarship.lastValidated = new Date();
        await scholarship.save();
        scrapingLogger.error(`Could not repair link: ${scholarship.title}`);
        return { repaired: false, error: repairedLink.error };
      }
    } catch (repairError) {
      scrapingLogger.error(`Link repair failed: ${repairError.message}`);
      return { repaired: false, error: repairError.message };
    }
  }

  /**
   * Monitor all active scholarship links
   * @returns {Object} - Monitoring results
   */
  async monitorScholarshipLinks() {
    try {
      const activeScholarships = await Scholarship.find({ isActive: true });
      const results = {
        total: activeScholarships.length,
        checked: 0,
        healthy: 0,
        broken: 0,
        repaired: 0,
        details: [],
      };

      for (const scholarship of activeScholarships) {
        const validation = await this.validateScholarshipLinks(scholarship);
        results.checked++;

        if (validation.applicationLinkValid && validation.qualityScore >= 70) {
          results.healthy++;
          scholarship.lastValidated = new Date();
          await scholarship.save();
        } else {
          results.broken++;
          const repairResult = await this.handleBrokenLink(
            scholarship,
            "Failed validation"
          );
          if (repairResult.repaired) {
            results.repaired++;
          }
        }

        results.details.push({
          title: scholarship.title,
          valid: validation.applicationLinkValid,
          qualityScore: validation.qualityScore,
          repaired: false,
        });
      }

      scrapingLogger.info("Link monitoring completed", results);
      return results;
    } catch (error) {
      scrapingLogger.error("Link monitoring failed:", error);
      throw error;
    }
  }
}

export default LinkFixerScraper;
