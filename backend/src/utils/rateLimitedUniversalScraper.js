/**
 * Rate-Limited Universal Scholarship Scraper
 * Intelligently scrapes discovered websites with proper rate limiting
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import axios from "axios";
import https from "https";
import * as cheerio from "cheerio";
import { scrapingLogger as logger } from "./logger.js";
import { GeminiAIService } from "./geminiAIService.js";
import linkValidationSystem from "./linkValidationSystem.js";

puppeteer.use(StealthPlugin());

class RateLimitedUniversalScraper {
  constructor() {
    this.rateLimiters = new Map(); // Per-domain rate limiting
    this.globalRateLimit = 1000; // Global minimum delay
    this.domainPolicies = new Map(); // Domain-specific policies
    this.geminiAI = new GeminiAIService();
    this.linkValidator = linkValidationSystem;

    // Create robust HTTP client with SSL bypass
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      secureProtocol: "TLSv1_2_method",
      ciphers: "ALL",
    });

    this.userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ];

    this.initializeDomainPolicies();

    this.scrapingMetrics = {
      totalRequests: 0,
      successfulScrapes: 0,
      failedScrapes: 0,
      rateLimitEvents: 0,
      averageDelay: 0,
      domainsScraped: new Set(),
      scholarshipsFound: 0,
      validLinksFound: 0,
    };
  }

  /**
   * Initialize domain-specific scraping policies
   */
  initializeDomainPolicies() {
    // Government sites - most respectful
    this.domainPolicies.set("gov.in", {
      minDelay: 8000,
      maxConcurrent: 1,
      userAgent: this.userAgents[0],
      respectRobots: true,
      maxRetries: 2,
    });

    // Educational institutions
    this.domainPolicies.set("edu.in", {
      minDelay: 5000,
      maxConcurrent: 2,
      userAgent: this.userAgents[1],
      respectRobots: true,
      maxRetries: 3,
    });

    this.domainPolicies.set("ac.in", {
      minDelay: 5000,
      maxConcurrent: 2,
      userAgent: this.userAgents[1],
      respectRobots: true,
      maxRetries: 3,
    });

    // Private/commercial sites
    this.domainPolicies.set("buddy4study.com", {
      minDelay: 3000,
      maxConcurrent: 3,
      userAgent: this.userAgents[2],
      respectRobots: true,
      maxRetries: 3,
    });

    // Default policy
    this.domainPolicies.set("default", {
      minDelay: 4000,
      maxConcurrent: 2,
      userAgent: this.userAgents[0],
      respectRobots: true,
      maxRetries: 3,
    });
  }

  /**
   * Get domain policy for a URL
   */
  getDomainPolicy(url) {
    try {
      const domain = new URL(url).hostname.toLowerCase();

      // Check for specific domain matches
      for (const [suffix, policy] of this.domainPolicies) {
        if (domain.includes(suffix) && suffix !== "default") {
          return { ...policy, domain: suffix };
        }
      }

      return { ...this.domainPolicies.get("default"), domain: "default" };
    } catch {
      return { ...this.domainPolicies.get("default"), domain: "default" };
    }
  }

  /**
   * Respect rate limits for domain
   */
  async respectRateLimit(domain, policy) {
    const key = domain;
    const lastRequest = this.rateLimiters.get(key);
    const now = Date.now();

    if (lastRequest) {
      const timeDiff = now - lastRequest;
      const requiredDelay = Math.max(policy.minDelay, this.globalRateLimit);

      if (timeDiff < requiredDelay) {
        const waitTime = requiredDelay - timeDiff;
        logger.info(`🕒 Rate limiting ${domain}: waiting ${waitTime}ms`);
        this.scrapingMetrics.rateLimitEvents++;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    this.rateLimiters.set(key, Date.now());
  }

  /**
   * Scrape scholarships from discovered websites
   */
  async scrapeDiscoveredWebsites(scrapingTargets) {
    logger.info(
      `🚀 Starting rate-limited scraping of ${scrapingTargets.length} websites`
    );

    const results = {
      totalWebsites: scrapingTargets.length,
      successfulScrapes: 0,
      failedScrapes: 0,
      scholarshipsFound: 0,
      validScholarships: 0,
      scrapingResults: [],
    };

    for (const target of scrapingTargets) {
      try {
        const domain = new URL(target.url).hostname;
        this.scrapingMetrics.domainsScraped.add(domain);

        logger.info(
          `📄 Scraping: ${target.url} (Priority: ${target.priority})`
        );

        const scholarships = await this.scrapeWebsite(target);

        if (scholarships && scholarships.length > 0) {
          results.successfulScrapes++;
          results.scholarshipsFound += scholarships.length;

          // Validate and enhance scholarships
          const validScholarships = await this.validateAndEnhanceScholarships(
            scholarships
          );
          results.validScholarships += validScholarships.length;

          results.scrapingResults.push({
            url: target.url,
            domain,
            status: "success",
            scholarshipsFound: scholarships.length,
            validScholarships: validScholarships.length,
            scholarships: validScholarships,
          });

          logger.info(
            `✅ ${target.url}: Found ${scholarships.length} scholarships, ${validScholarships.length} valid`
          );
        } else {
          results.failedScrapes++;
          results.scrapingResults.push({
            url: target.url,
            domain,
            status: "no_scholarships",
            scholarshipsFound: 0,
            validScholarships: 0,
            scholarships: [],
          });

          logger.warn(`⚠️ ${target.url}: No scholarships found`);
        }
      } catch (error) {
        results.failedScrapes++;
        results.scrapingResults.push({
          url: target.url,
          domain: new URL(target.url).hostname,
          status: "error",
          error: error.message,
          scholarshipsFound: 0,
          validScholarships: 0,
          scholarships: [],
        });

        logger.error(`❌ Failed to scrape ${target.url}:`, error.message);
      }

      // Global rate limiting between websites
      await new Promise((resolve) => setTimeout(resolve, this.globalRateLimit));
    }

    this.logScrapingMetrics(results);
    return results;
  }

  /**
   * Scrape a single website using appropriate strategy
   */
  async scrapeWebsite(target) {
    const policy = this.getDomainPolicy(target.url);
    await this.respectRateLimit(new URL(target.url).hostname, policy);

    this.scrapingMetrics.totalRequests++;

    try {
      if (target.scrapingStrategy.method === "puppeteer") {
        return await this.scrapeWithPuppeteer(target, policy);
      } else {
        return await this.scrapeWithAxios(target, policy);
      }
    } catch (error) {
      this.scrapingMetrics.failedScrapes++;
      throw error;
    }
  }

  /**
   * Scrape using Axios and Cheerio with robust error handling
   */
  async scrapeWithAxios(target, policy) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(
          `🔗 Scraping ${target.url} (Attempt ${attempt}/${maxRetries})`
        );

        const response = await axios.get(target.url, {
          timeout: 30000,
          httpsAgent: this.httpsAgent, // Use SSL bypass agent
          maxRedirects: 5,
          validateStatus: function (status) {
            return status < 500; // Accept 4xx but retry on 5xx
          },
          headers: {
            "User-Agent": policy.userAgent,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            "Cache-Control": "max-age=0",
            "sec-ch-ua":
              '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
          },
        });

        // Handle different status codes
        if (response.status >= 400 && response.status < 500) {
          logger.warn(
            `⚠️ HTTP ${response.status} for ${target.url} - Content may be limited`
          );
          // For 4xx errors, try to extract what we can
          if (!response.data || response.data.length < 100) {
            throw new Error(
              `HTTP ${response.status}: ${this.getStatusMessage(
                response.status
              )}`
            );
          }
        }

        const $ = cheerio.load(response.data);
        return await this.extractScholarshipsWithAI(
          $,
          target.url,
          target.domain,
          response.data
        );
      } catch (error) {
        lastError = error;
        logger.warn(
          `❌ Attempt ${attempt}/${maxRetries} failed for ${target.url}: ${error.message}`
        );

        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const retryDelay = Math.min(2000 * attempt, 10000); // Exponential backoff
          logger.info(`⏳ Waiting ${retryDelay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    // All attempts failed
    logger.error(
      `❌ All ${maxRetries} attempts failed for ${target.url}: ${lastError?.message}`
    );
    return {
      success: false,
      scholarships: [],
      error: lastError?.message || "Unknown error",
      metadata: {
        url: target.url,
        attempts: maxRetries,
        strategy: "axios",
      },
    };
  }

  /**
   * Get human-readable status message
   */
  getStatusMessage(status) {
    const statusMessages = {
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      429: "Too Many Requests",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable",
    };
    return statusMessages[status] || `HTTP ${status}`;
  }

  /**
   * Scrape using Puppeteer (for dynamic content)
   */
  async scrapeWithPuppeteer(target, policy) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
        "--ignore-certificate-errors", // Ignore SSL certificate errors
        "--ignore-ssl-errors",
        "--ignore-certificate-errors-spki-list",
        "--ignore-certificate-errors-spki-list-verify",
        "--ignore-ssl-errors-spki-list",
        "--disable-web-security", // Additional security bypass for problematic sites
      ],
    });

    try {
      const page = await browser.newPage();

      await page.setUserAgent(policy.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });

      // Set extra HTTP headers for better compatibility
      await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      });

      // Block unnecessary resources to speed up loading
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const resourceType = req.resourceType();
        if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navigate with better error handling
      try {
        logger.info(`🌐 Loading page: ${target.url}`);

        const response = await page.goto(target.url, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // Check response status
        if (response && !response.ok()) {
          logger.warn(`⚠️ HTTP ${response.status()} for ${target.url}`);
          if (response.status() >= 400) {
            throw new Error(
              `HTTP ${response.status()}: ${response.statusText()}`
            );
          }
        }

        // Wait for content to load
        await page.waitForTimeout(2000);

        const content = await page.content();
        const $ = cheerio.load(content);

        return await this.extractScholarshipsWithAI(
          $,
          target.url,
          target.domain,
          content
        );
      } catch (error) {
        logger.error(
          `❌ Puppeteer navigation failed for ${target.url}: ${error.message}`
        );
        throw error;
      }
    } finally {
      await browser.close();
    }
  }

  /**
   * Use AI to intelligently extract scholarship data
   */
  async extractScholarshipsWithAI($, url, strategy) {
    // Get page content for AI analysis
    const pageTitle = $("title").text().trim();
    const headings = $("h1, h2, h3, h4")
      .map((i, el) => $(el).text().trim())
      .get();
    const links = $("a")
      .map((i, el) => ({
        text: $(el).text().trim(),
        href: $(el).attr("href"),
      }))
      .get();

    // Look for scholarship-related content patterns
    const scholarshipKeywords = [
      "scholarship",
      "fellowship",
      "grant",
      "award",
      "financial aid",
      "स्कॉलरशिप",
      "छात्रवृत्ति",
      "apply now",
      "eligible",
      "deadline",
    ];

    // Find potential scholarship containers
    const potentialContainers = this.findScholarshipContainers(
      $,
      scholarshipKeywords
    );

    if (potentialContainers.length === 0) {
      logger.warn(`No scholarship containers found on ${url}`);
      return [];
    }

    const scholarships = [];

    for (const container of potentialContainers.slice(0, 50)) {
      // Limit to prevent overwhelming
      try {
        const scholarshipData = await this.extractScholarshipFromContainer(
          $,
          container,
          url
        );
        if (scholarshipData && this.isValidScholarship(scholarshipData)) {
          scholarships.push(scholarshipData);
        }
      } catch (error) {
        logger.warn(
          `Failed to extract scholarship from container:`,
          error.message
        );
      }
    }

    this.scrapingMetrics.scholarshipsFound += scholarships.length;
    logger.info(`Extracted ${scholarships.length} scholarships from ${url}`);

    return scholarships;
  }

  /**
   * Find potential scholarship containers on the page
   */
  findScholarshipContainers($, keywords) {
    const containers = [];
    const selectors = [
      ".scholarship",
      ".grant",
      ".fellowship",
      ".award",
      '[class*="scholarship"]',
      '[class*="grant"]',
      '[class*="fellowship"]',
      '[id*="scholarship"]',
      '[id*="grant"]',
      '[id*="fellowship"]',
      ".card",
      ".item",
      ".entry",
      ".post",
      ".content-item",
      "article",
      "section",
      ".row",
      ".col",
    ];

    selectors.forEach((selector) => {
      $(selector).each((i, element) => {
        const text = $(element).text().toLowerCase();
        const hasKeyword = keywords.some((keyword) =>
          text.includes(keyword.toLowerCase())
        );

        if (hasKeyword && text.length > 50 && text.length < 5000) {
          containers.push({
            element,
            selector,
            relevanceScore: this.calculateRelevanceScore(text, keywords),
            length: text.length,
          });
        }
      });
    });

    // Sort by relevance score
    return containers
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20); // Top 20 most relevant
  }

  /**
   * Calculate relevance score for scholarship content
   */
  calculateRelevanceScore(text, keywords) {
    let score = 0;

    keywords.forEach((keyword) => {
      const count = (
        text.toLowerCase().match(new RegExp(keyword.toLowerCase(), "g")) || []
      ).length;
      score += count * 10;
    });

    // Bonus for key phrases
    const bonusPhrases = [
      "apply now",
      "deadline",
      "eligible",
      "amount",
      "criteria",
      "application",
      "scholarship details",
      "how to apply",
    ];

    bonusPhrases.forEach((phrase) => {
      if (text.toLowerCase().includes(phrase)) {
        score += 20;
      }
    });

    return score;
  }

  /**
   * Extract scholarship data from a container element
   */
  async extractScholarshipFromContainer($, container, baseUrl) {
    const element = $(container.element);

    // Extract basic information
    const title = this.extractTitle(element);
    const description = this.extractDescription(element);
    const amount = this.extractAmount(element);
    const deadline = this.extractDeadline(element);
    const eligibility = this.extractEligibility(element);
    const applicationLink = this.extractApplicationLink(element, baseUrl);
    const provider = this.extractProvider(element, baseUrl);

    if (!title || title.length < 10) {
      return null;
    }

    const scholarship = {
      title: title.trim(),
      description: description ? description.trim() : "",
      amount: amount || "Amount not specified",
      deadline: deadline || "Deadline not specified",
      eligibility: eligibility || "Eligibility criteria not specified",
      applicationLink: applicationLink || baseUrl,
      provider: provider || new URL(baseUrl).hostname,
      sourceUrl: baseUrl,
      category: "General",
      targetAudience: ["All"],
      educationLevel: "All",
      scrapedAt: new Date(),
      isActive: true,
      verified: false,
      aiEnhanced: false,
    };

    return scholarship;
  }

  /**
   * Extract scholarship title
   */
  extractTitle(element) {
    const titleSelectors = [
      "h1",
      "h2",
      "h3",
      "h4",
      ".title",
      ".name",
      ".heading",
      '[class*="title"]',
      '[class*="name"]',
      '[class*="heading"]',
      'a[href*="scholarship"]',
      "strong",
      "b",
    ];

    for (const selector of titleSelectors) {
      const title = element.find(selector).first().text().trim();
      if (title && title.length > 5 && title.length < 200) {
        return title;
      }
    }

    // Fallback: try to find the most prominent text
    const allText = element.text().trim();
    const lines = allText.split("\n").filter((line) => line.trim().length > 5);

    if (lines.length > 0) {
      return lines[0].substring(0, 150);
    }

    return null;
  }

  /**
   * Extract scholarship description
   */
  extractDescription(element) {
    const descSelectors = [
      ".description",
      ".desc",
      ".content",
      ".summary",
      ".details",
      "p",
      ".text",
      '[class*="description"]',
      '[class*="content"]',
    ];

    for (const selector of descSelectors) {
      const desc = element.find(selector).text().trim();
      if (desc && desc.length > 20 && desc.length < 2000) {
        return desc;
      }
    }

    // Fallback: get all paragraph text
    const allParagraphs = element
      .find("p")
      .map((i, p) => $(p).text().trim())
      .get();
    const combinedDesc = allParagraphs.join(" ").substring(0, 1500);

    return combinedDesc || element.text().trim().substring(0, 500);
  }

  /**
   * Extract scholarship amount
   */
  extractAmount(element) {
    const text = element.text();
    const amountPatterns = [
      /₹[\d,]+(?:\.\d{2})?/g,
      /INR[\s]?[\d,]+/gi,
      /Rs\.?[\s]?[\d,]+/gi,
      /rupees?[\s]?[\d,]+/gi,
      /amount[\s]?:?[\s]?₹?[\d,]+/gi,
      /value[\s]?:?[\s]?₹?[\d,]+/gi,
      /worth[\s]?:?[\s]?₹?[\d,]+/gi,
      /upto?[\s]?₹?[\d,]+/gi,
      /up\s+to[\s]?₹?[\d,]+/gi,
    ];

    for (const pattern of amountPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].trim();
      }
    }

    return null;
  }

  /**
   * Extract application deadline
   */
  extractDeadline(element) {
    const text = element.text();
    const deadlinePatterns = [
      /deadline[\s]?:?[\s]?[\d]{1,2}[\/\-.][\d]{1,2}[\/\-.][\d]{2,4}/gi,
      /last[\s]?date[\s]?:?[\s]?[\d]{1,2}[\/\-.][\d]{1,2}[\/\-.][\d]{2,4}/gi,
      /apply[\s]?by[\s]?:?[\s]?[\d]{1,2}[\/\-.][\d]{1,2}[\/\-.][\d]{2,4}/gi,
      /due[\s]?date[\s]?:?[\s]?[\d]{1,2}[\/\-.][\d]{1,2}[\/\-.][\d]{2,4}/gi,
      /[\d]{1,2}[\/\-.][\d]{1,2}[\/\-.][\d]{2,4}/g,
    ];

    for (const pattern of deadlinePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].trim();
      }
    }

    return null;
  }

  /**
   * Extract eligibility criteria
   */
  extractEligibility(element) {
    const eligibilityKeywords = [
      "eligible",
      "criteria",
      "qualification",
      "requirement",
      "who can apply",
      "eligibility criteria",
      "academic requirement",
    ];

    const text = element.text().toLowerCase();

    for (const keyword of eligibilityKeywords) {
      const index = text.indexOf(keyword);
      if (index !== -1) {
        // Extract surrounding text
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + 300);
        return element.text().substring(start, end).trim();
      }
    }

    return null;
  }

  /**
   * Extract application link
   */
  extractApplicationLink(element, baseUrl) {
    const linkSelectors = [
      'a[href*="apply"]',
      'a[href*="application"]',
      'a[href*="form"]',
      'a:contains("Apply")',
      'a:contains("Apply Now")',
      'a:contains("Application")',
      ".apply-btn",
      ".application-link",
      '[class*="apply"]',
    ];

    for (const selector of linkSelectors) {
      const link = element.find(selector).first();
      if (link.length > 0) {
        let href = link.attr("href");
        if (href) {
          // Convert relative URLs to absolute
          if (href.startsWith("/")) {
            const base = new URL(baseUrl);
            href = `${base.protocol}//${base.host}${href}`;
          } else if (!href.startsWith("http")) {
            href = new URL(href, baseUrl).href;
          }
          return href;
        }
      }
    }

    return null;
  }

  /**
   * Extract scholarship provider/organization
   */
  extractProvider(element, baseUrl) {
    const providerKeywords = [
      "by",
      "from",
      "offered by",
      "provided by",
      "sponsored by",
      "organization",
      "foundation",
      "ministry",
      "government",
    ];

    const text = element.text();
    const domain = new URL(baseUrl).hostname;

    // Try to find provider in text
    for (const keyword of providerKeywords) {
      const index = text.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        const afterKeyword = text.substring(index + keyword.length).trim();
        const providerMatch = afterKeyword.match(/^[^\n\.]{5,100}/);
        if (providerMatch) {
          return providerMatch[0].trim();
        }
      }
    }

    // Fallback to domain-based provider
    if (domain.includes("gov.in")) {
      return "Government of India";
    } else if (domain.includes("edu.in") || domain.includes("ac.in")) {
      return "Educational Institution";
    } else {
      return domain.replace("www.", "").split(".")[0];
    }
  }

  /**
   * Validate if extracted data represents a valid scholarship
   */
  isValidScholarship(scholarship) {
    if (!scholarship.title || scholarship.title.length < 10) {
      return false;
    }

    if (!scholarship.description || scholarship.description.length < 20) {
      return false;
    }

    // Check for spam indicators
    const spamWords = ["casino", "bet", "loan", "credit card", "viagra"];
    const titleLower = scholarship.title.toLowerCase();

    if (spamWords.some((word) => titleLower.includes(word))) {
      return false;
    }

    return true;
  }

  /**
   * Validate and enhance scholarships using AI
   */
  async validateAndEnhanceScholarships(scholarships) {
    const validScholarships = [];

    for (const scholarship of scholarships) {
      try {
        // Basic validation
        if (!this.isValidScholarship(scholarship)) {
          continue;
        }

        // Link validation
        if (
          scholarship.applicationLink &&
          scholarship.applicationLink !== scholarship.sourceUrl
        ) {
          const linkValidation =
            await this.linkValidator.validateScholarshipLink(
              scholarship.applicationLink,
              scholarship.title
            );

          if (!linkValidation.isValid) {
            logger.warn(`Invalid application link for: ${scholarship.title}`);
            scholarship.applicationLink = scholarship.sourceUrl;
          } else {
            this.scrapingMetrics.validLinksFound++;
          }
        }

        // AI enhancement
        if (this.geminiAI.isEnabled()) {
          const enhanced = await this.geminiAI.enhanceScholarshipContent(
            scholarship
          );
          validScholarships.push(enhanced);
        } else {
          validScholarships.push(scholarship);
        }
      } catch (error) {
        logger.warn(
          `Failed to validate scholarship: ${scholarship.title}`,
          error.message
        );
      }
    }

    return validScholarships;
  }

  /**
   * Log scraping metrics
   */
  logScrapingMetrics(results) {
    logger.info("📊 Scraping Metrics Summary:");
    logger.info(`  Total Websites: ${results.totalWebsites}`);
    logger.info(`  Successful Scrapes: ${results.successfulScrapes}`);
    logger.info(`  Failed Scrapes: ${results.failedScrapes}`);
    logger.info(`  Total Scholarships Found: ${results.scholarshipsFound}`);
    logger.info(`  Valid Scholarships: ${results.validScholarships}`);
    logger.info(
      `  Success Rate: ${(
        (results.successfulScrapes / results.totalWebsites) *
        100
      ).toFixed(1)}%`
    );
    logger.info(
      `  Domains Scraped: ${this.scrapingMetrics.domainsScraped.size}`
    );
    logger.info(`  Rate Limit Events: ${this.scrapingMetrics.rateLimitEvents}`);
    logger.info(`  Valid Links Found: ${this.scrapingMetrics.validLinksFound}`);
  }

  /**
   * Get current scraping metrics
   */
  getMetrics() {
    return {
      ...this.scrapingMetrics,
      domainsScraped: Array.from(this.scrapingMetrics.domainsScraped),
    };
  }
}

export default RateLimitedUniversalScraper;
