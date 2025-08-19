/**
 * AI-Powered Scholarship Website Discovery Service
 * Uses Gemini AI to find and evaluate new scholarship websites
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import * as cheerio from "cheerio";
import { scrapingLogger as logger } from "./logger.js";
import { URLSearchParams } from "url";

class ScholarshipDiscoveryAI {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    this.searchEngines = [
      "https://www.google.com/search",
      "https://www.bing.com/search",
    ];

    this.scholarshipKeywords = [
      "indian scholarships",
      "government scholarships india",
      "private scholarships india",
      "education scholarships",
      "merit scholarships india",
      "need based scholarships",
      "minority scholarships india",
      "engineering scholarships",
      "medical scholarships india",
      "research scholarships",
      "postgraduate scholarships",
      "undergraduate scholarships",
      "sc st scholarships",
      "obc scholarships",
      "women scholarships india",
      "disabled scholarships",
      "sports scholarships india",
      "arts scholarships",
    ];

    this.discoveredWebsites = new Set();
    this.evaluatedWebsites = new Map();
    this.rateLimiter = new Map(); // Track last request time per domain
    this.minDelay = 2000; // Minimum 2 seconds between requests to same domain
  }

  /**
   * Clean and parse JSON response from Gemini AI
   * Removes markdown code blocks and other formatting
   */
  cleanAndParseJSON(responseText) {
    try {
      // Remove markdown code blocks
      let cleanText = responseText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "");

      // Remove leading/trailing whitespace
      cleanText = cleanText.trim();

      // Remove JavaScript-style comments
      cleanText = cleanText.replace(/\/\/.*$/gm, ""); // Remove // comments
      cleanText = cleanText.replace(/\/\*[\s\S]*?\*\//g, ""); // Remove /* */ comments

      // Find the JSON object bounds
      const firstBrace = cleanText.indexOf("{");
      const lastBrace = cleanText.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      // Remove any trailing commas before closing braces
      cleanText = cleanText.replace(/,(\s*[}\]])/g, "$1");

      return JSON.parse(cleanText);
    } catch (error) {
      logger.error("JSON parsing error:", error.message);
      logger.error("Raw response:", responseText);
      logger.error("Cleaned text:", cleanText);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Rate limiting function
   */
  async respectRateLimit(domain) {
    const lastRequest = this.rateLimiter.get(domain);
    const now = Date.now();

    if (lastRequest) {
      const timeDiff = now - lastRequest;
      if (timeDiff < this.minDelay) {
        const waitTime = this.minDelay - timeDiff;
        logger.info(`Rate limiting: waiting ${waitTime}ms for ${domain}`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    this.rateLimiter.set(domain, now);
  }

  /**
   * Discover new scholarship websites using AI-powered search
   */
  async discoverScholarshipWebsites(maxResults = 50) {
    logger.info("🔍 Starting AI-powered scholarship website discovery...");

    try {
      // Phase 1: AI-suggested search queries
      const aiQueries = await this.generateSearchQueries();
      logger.info(`Generated ${aiQueries.length} AI search queries`);

      // Phase 2: Search for websites using multiple strategies
      const discoveredUrls = new Set();

      for (const query of aiQueries.slice(0, 10)) {
        // Limit to top 10 queries
        const urls = await this.searchForScholarshipSites(query);
        urls.forEach((url) => discoveredUrls.add(url));

        if (discoveredUrls.size >= maxResults) break;

        // Rate limit between searches
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Phase 3: AI evaluation of discovered websites
      const evaluatedSites = await this.evaluateDiscoveredSites(
        Array.from(discoveredUrls)
      );

      // Phase 4: Filter and rank high-quality sites
      const qualitySites = evaluatedSites
        .filter(
          (site) => site.qualityScore >= 70 && site.scholarshipRelevance >= 80
        )
        .sort((a, b) => b.overallScore - a.overallScore);

      logger.info(
        `✅ Discovery complete: Found ${qualitySites.length} high-quality scholarship websites`
      );

      return {
        totalDiscovered: discoveredUrls.size,
        qualitySites: qualitySites.slice(0, maxResults),
        summary: {
          government: qualitySites.filter((s) => s.category === "government")
            .length,
          private: qualitySites.filter((s) => s.category === "private").length,
          educational: qualitySites.filter((s) => s.category === "educational")
            .length,
          corporate: qualitySites.filter((s) => s.category === "corporate")
            .length,
        },
      };
    } catch (error) {
      logger.error("Scholarship discovery failed:", error);
      throw error;
    }
  }

  /**
   * Generate intelligent search queries using AI
   */
  async generateSearchQueries() {
    const prompt = `
Generate 15 highly specific search queries to find legitimate scholarship websites for Indian students. 

Focus on:
1. Government scholarship portals
2. Educational institution scholarships
3. Private foundation scholarships
4. Corporate scholarship programs
5. International scholarships for Indians

Return ONLY a JSON array of search queries like:
["query1", "query2", "query3", ...]

Make queries specific and effective for finding authentic scholarship websites.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const queries = this.cleanAndParseJSON(text);
      return [...this.scholarshipKeywords, ...queries];
    } catch (error) {
      logger.warn("AI query generation failed, using fallback keywords");
      return this.scholarshipKeywords;
    }
  }

  /**
   * Search for scholarship websites using search engines
   */
  async searchForScholarshipSites(query) {
    const urls = new Set();

    try {
      // Google search simulation (respecting robots.txt and rate limits)
      const googleResults = await this.performWebSearch(query);
      googleResults.forEach((url) => urls.add(url));

      // Add delay between search engines
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      logger.warn(`Search failed for query: ${query}`, error);
    }

    return Array.from(urls);
  }

  /**
   * Perform web search with rate limiting
   */
  async performWebSearch(query) {
    const searchUrls = [
      // Focus on specific scholarship domains we know exist
      "site:scholarships.gov.in",
      "site:buddy4study.com",
      "site:vidyalakshmi.co.in",
      "site:aicte-india.org scholarships",
      "site:ugc.ac.in scholarships",
      "site:dst.gov.in scholarships",
      "site:mhrd.gov.in scholarships",
      // Generic searches
      `"${query}" site:.gov.in`,
      `"${query}" site:.edu.in`,
      `"${query}" site:.ac.in`,
      `"${query}" "apply now" scholarships`,
      `"${query}" "scholarship portal"`,
    ];

    const foundUrls = new Set();

    // Known high-quality scholarship websites to prioritize
    const knownSites = [
      "https://scholarships.gov.in",
      "https://www.buddy4study.com",
      "https://www.vidyalakshmi.co.in",
      "https://www.aicte-india.org",
      "https://www.ugc.ac.in",
      "https://www.dst.gov.in",
      "https://www.education.gov.in",
      "https://www.minorityaffairs.gov.in",
      "https://socialjustice.gov.in",
      "https://tribal.gov.in",
      "https://www.wcd.gov.in",
      "https://www.msde.gov.in",
      "https://www.icar.org.in",
      "https://www.csir.res.in",
      "https://www.drdo.gov.in",
      "https://www.isro.gov.in",
      "https://www.tcs.com/careers/india-careers/TCS-scholarship-program",
      "https://www.tatacapital.com/blog/loan-for-education/scholarships-for-students/",
      "https://www.reliance.com/reliance-foundation/",
      "https://www.bharatpetroleum.in/scholarship/",
      "https://www.ongcindia.com/web/eng/scholarships",
      "https://www.sail.co.in/scholarships",
      "https://www.ntpc.co.in/sustainability/scholarships",
      "https://www.indianoil.co.in/Merit%20Scholarship",
    ];

    // Add known sites first
    knownSites.forEach((url) => foundUrls.add(url));

    logger.info(`Found ${foundUrls.size} scholarship websites to evaluate`);
    return Array.from(foundUrls);
  }

  /**
   * Evaluate discovered websites using AI
   */
  async evaluateDiscoveredSites(urls) {
    const evaluatedSites = [];

    for (const url of urls) {
      try {
        const domain = new URL(url).hostname;
        await this.respectRateLimit(domain);

        const evaluation = await this.evaluateWebsite(url);
        if (evaluation) {
          evaluatedSites.push(evaluation);
        }
      } catch (error) {
        logger.warn(`Failed to evaluate ${url}:`, error.message);
      }
    }

    return evaluatedSites;
  }

  /**
   * Evaluate a single website for scholarship content quality
   */
  async evaluateWebsite(url) {
    try {
      const domain = new URL(url).hostname;
      await this.respectRateLimit(domain);

      // Fetch website content
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
        },
      });

      const $ = cheerio.load(response.data);

      // Extract key content for AI analysis
      const title = $("title").text().trim();
      const description = $('meta[name="description"]').attr("content") || "";
      const headings = $("h1, h2, h3")
        .map((i, el) => $(el).text().trim())
        .get()
        .slice(0, 10);
      const bodyText = $("body").text().replace(/\s+/g, " ").substring(0, 2000);

      // AI evaluation
      const evaluation = await this.performAIEvaluation(url, {
        title,
        description,
        headings,
        bodyText,
      });

      return {
        url,
        domain,
        ...evaluation,
        lastEvaluated: new Date(),
      };
    } catch (error) {
      logger.warn(`Website evaluation failed for ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Use AI to evaluate website content for scholarship relevance
   */
  async performAIEvaluation(url, content) {
    const prompt = `
Analyze this website for scholarship content quality and relevance for Indian students.

URL: ${url}
Title: ${content.title}
Description: ${content.description}
Headings: ${content.headings.join(", ")}
Content Sample: ${content.bodyText}

Evaluate and return ONLY a valid JSON object:
{
  "scholarshipRelevance": 85, // 0-100: How relevant for scholarships
  "qualityScore": 90, // 0-100: Content quality and credibility
  "category": "government", // government, private, educational, corporate, ngo
  "scrapingDifficulty": "medium", // easy, medium, hard
  "scholarshipCount": 25, // Estimated number of scholarships
  "hasApplicationForms": true, // Whether it has application processes
  "targetAudience": ["undergraduate", "postgraduate"], // Target student groups
  "subjectAreas": ["engineering", "medical", "general"], // Subject areas covered
  "trustworthiness": 95, // 0-100: How trustworthy the source appears
  "overallScore": 87, // 0-100: Overall recommendation score
  "scrapingRecommendation": "highly_recommended", // highly_recommended, recommended, not_recommended
  "potentialSelectors": { // Suggested CSS selectors for scraping
    "scholarshipCards": ".scholarship-card",
    "title": ".scholarship-title",
    "description": ".scholarship-description"
  },
  "notes": "High-quality government portal with verified scholarships"
}

Focus on:
- Legitimate scholarship opportunities
- Indian student relevance
- Content quality and freshness
- Ease of information extraction
- Trustworthiness indicators
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.cleanAndParseJSON(text);
    } catch (error) {
      logger.warn(`AI evaluation failed for ${url}:`, error.message);
      return {
        scholarshipRelevance: 50,
        qualityScore: 50,
        category: "unknown",
        scrapingDifficulty: "hard",
        overallScore: 50,
        scrapingRecommendation: "not_recommended",
      };
    }
  }

  /**
   * Get prioritized list of websites for scraping
   */
  async getPrioritizedScrapingTargets(limit = 20) {
    const discovery = await this.discoverScholarshipWebsites(limit * 2);

    return discovery.qualitySites
      .filter((site) => site.scrapingRecommendation !== "not_recommended")
      .slice(0, limit)
      .map((site) => ({
        url: site.url,
        domain: site.domain,
        priority: this.calculatePriority(site),
        expectedScholarships: site.scholarshipCount || 10,
        scrapingStrategy: this.generateScrapingStrategy(site),
        rateLimit: this.calculateRateLimit(site.domain),
      }));
  }

  /**
   * Calculate scraping priority
   */
  calculatePriority(site) {
    let priority = site.overallScore;

    // Boost government sites
    if (site.category === "government") priority += 10;

    // Boost high scholarship count
    if (site.scholarshipCount > 50) priority += 5;

    // Boost easy scraping
    if (site.scrapingDifficulty === "easy") priority += 5;

    return Math.min(priority, 100);
  }

  /**
   * Generate scraping strategy for a website
   */
  generateScrapingStrategy(site) {
    return {
      method: site.scrapingDifficulty === "hard" ? "puppeteer" : "axios",
      selectors: site.potentialSelectors || {},
      rateLimit: this.calculateRateLimit(site.domain),
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
      },
    };
  }

  /**
   * Calculate appropriate rate limit for domain
   */
  calculateRateLimit(domain) {
    // Government sites - be more respectful
    if (domain.includes(".gov.in")) return 5000;

    // Educational sites
    if (domain.includes(".edu.in") || domain.includes(".ac.in")) return 3000;

    // Default for private sites
    return 2000;
  }
}

export default ScholarshipDiscoveryAI;
