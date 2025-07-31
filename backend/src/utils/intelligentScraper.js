import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import axios from "axios";
import * as cheerio from "cheerio";
import { scrapingLogger } from "../utils/logger.js";

// Add stealth plugin for better scraping success
puppeteer.use(StealthPlugin());

export class IntelligentScrapingManager {
  constructor() {
    this.userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    ];

    this.scrapingStrategies = new Map();
    this.performanceMetrics = new Map();
    this.retryDelays = [1000, 2000, 5000, 10000]; // Progressive retry delays
    this.initializeStrategies();

    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      successfulScrapes: 0,
      failedScrapes: 0,
      strategiesUsed: new Set(),
      averageResponseTime: 0,
      errors: [],
    };
  }

  // Initialize scraping strategies for different sites
  initializeStrategies() {
    // Buddy4Study strategy
    this.scrapingStrategies.set("buddy4study.com", {
      baseUrls: [
        "https://www.buddy4study.com/scholarships",
        "https://www.buddy4study.com/scholarships/engineering",
        "https://www.buddy4study.com/scholarships/medical",
        "https://www.buddy4study.com/scholarships/arts",
        "https://www.buddy4study.com/scholarships/commerce",
        "https://www.buddy4study.com/page/government-scholarships",
        "https://www.buddy4study.com/page/private-scholarships",
      ],
      selectors: {
        scholarshipCards: [
          ".scholarship-card",
          ".scholarship-item",
          ".card",
          ".scholarship",
          ".scholarship-listing",
        ],
        title: ["h3", "h4", ".title", ".scholarship-title", ".card-title"],
        description: [".description", ".excerpt", ".card-text", ".summary"],
        amount: [".amount", ".prize", ".scholarship-amount", ".reward"],
        deadline: [".deadline", ".last-date", ".apply-by", ".date"],
        link: ["a", ".apply-link", ".scholarship-link"],
        category: [".category", ".type", ".field"],
        provider: [".provider", ".organization", ".sponsor"],
      },
      paginationSelectors: [".next", ".pagination a", ".load-more"],
      waitConditions: [
        "networkidle2",
        ".scholarship-card",
        ".scholarship-item",
      ],
    });

    // National Scholarship Portal strategy
    this.scrapingStrategies.set("scholarships.gov.in", {
      baseUrls: [
        "https://scholarships.gov.in/",
        "https://scholarships.gov.in/fresh",
        "https://scholarships.gov.in/renewal",
        "https://scholarships.gov.in/schemeGuidelines",
      ],
      selectors: {
        scholarshipCards: [
          ".scheme-card",
          ".scholarship-scheme",
          ".scheme-item",
        ],
        title: ["h3", "h4", ".scheme-title"],
        description: [".scheme-description", ".description"],
        amount: [".amount", ".scholarship-amount"],
        deadline: [".deadline", ".last-date"],
        link: ["a", ".apply-link"],
        category: [".category", ".scheme-type"],
        provider: [".ministry", ".department"],
      },
      waitConditions: ["networkidle2", ".scheme-card"],
    });

    // ScholarshipsIndia strategy
    this.scrapingStrategies.set("scholarshipsindia.com", {
      baseUrls: [
        "https://www.scholarshipsindia.com/",
        "https://www.scholarshipsindia.com/scholarships/",
        "https://www.scholarshipsindia.com/undergraduate-scholarships/",
        "https://www.scholarshipsindia.com/postgraduate-scholarships/",
        "https://www.scholarshipsindia.com/central-government-scholarships/",
        "https://www.scholarshipsindia.com/state-government-scholarships/",
      ],
      selectors: {
        scholarshipCards: [".scholarship-post", ".post", ".scholarship-item"],
        title: ["h2", "h3", ".post-title"],
        description: [".post-content", ".excerpt"],
        amount: [".amount", ".scholarship-amount"],
        deadline: [".deadline", ".date"],
        link: ["a", ".read-more"],
        category: [".category", ".tag"],
        provider: [".provider", ".source"],
      },
      waitConditions: ["networkidle2", ".scholarship-post"],
    });
  }

  // Intelligent scraping with adaptive strategies
  async scrapeWithIntelligence(domain, maxPages = 5) {
    const strategy = this.scrapingStrategies.get(domain);
    if (!strategy) {
      throw new Error(`No scraping strategy found for domain: ${domain}`);
    }

    scrapingLogger.info(`🧠 Starting intelligent scraping for ${domain}`);

    const browser = await this.launchBrowser();
    const page = await browser.newPage();

    try {
      await this.setupPage(page);
      const scholarships = [];

      // Try different base URLs and adaptive scraping
      for (const baseUrl of strategy.baseUrls) {
        scrapingLogger.info(`📄 Scraping: ${baseUrl}`);

        try {
          const pageScholarships = await this.scrapePageWithAdaptiveStrategy(
            page,
            baseUrl,
            strategy,
            maxPages
          );

          scholarships.push(...pageScholarships);

          // Add intelligent delay based on site performance
          await this.intelligentDelay(domain);
        } catch (error) {
          scrapingLogger.error(
            `❌ Failed to scrape ${baseUrl}: ${error.message}`
          );
          continue;
        }
      }

      // Apply AI enhancement to all scraped scholarships
      const enhancedScholarships = await this.enhanceScholarshipsWithAI(
        scholarships
      );

      // Update performance metrics
      this.updatePerformanceMetrics(domain, enhancedScholarships.length);

      return enhancedScholarships;
    } finally {
      await browser.close();
    }
  }

  // Scrape a single page with adaptive strategy
  async scrapePageWithAdaptiveStrategy(page, url, strategy, maxPages = 5) {
    const scholarships = [];
    let currentPage = 1;
    let currentUrl = url;

    while (currentPage <= maxPages) {
      try {
        scrapingLogger.info(`📖 Scraping page ${currentPage}: ${currentUrl}`);

        // Navigate to page with intelligent retry
        await this.navigateWithRetry(page, currentUrl);

        // Wait for content to load using multiple strategies
        await this.waitForContent(page, strategy.waitConditions);

        // Extract scholarships using multiple selector strategies
        const pageScholarships = await this.extractScholarshipsAdaptively(
          page,
          strategy
        );

        if (pageScholarships.length === 0) {
          scrapingLogger.warn(
            `⚠️ No scholarships found on page ${currentPage}`
          );
          break;
        }

        scholarships.push(...pageScholarships);
        scrapingLogger.info(
          `✅ Extracted ${pageScholarships.length} scholarships from page ${currentPage}`
        );

        // Try to find next page
        const nextUrl = await this.findNextPage(
          page,
          strategy.paginationSelectors
        );
        if (!nextUrl) {
          scrapingLogger.info(
            `🏁 No more pages found after page ${currentPage}`
          );
          break;
        }

        currentUrl = nextUrl;
        currentPage++;

        // Intelligent delay between pages
        await this.intelligentDelay(new URL(url).hostname);
      } catch (error) {
        scrapingLogger.error(
          `❌ Error on page ${currentPage}: ${error.message}`
        );
        break;
      }
    }

    return scholarships;
  }

  // Enhanced browser setup
  async launchBrowser() {
    return await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--no-first-run",
        "--disable-default-apps",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });
  }

  // Setup page with intelligent configurations
  async setupPage(page) {
    // Set random user agent
    const userAgent =
      this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    await page.setUserAgent(userAgent);

    // Set realistic headers
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
    });

    // Optimize for faster loading
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const resourceType = request.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Block unnecessary resources
    await page.evaluateOnNewDocument(() => {
      // Disable images
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });
  }

  // Navigate with intelligent retry mechanism
  async navigateWithRetry(page, url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await page.goto(url, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        if (response && response.status() < 400) {
          return response;
        }

        throw new Error(`HTTP ${response.status()}`);
      } catch (error) {
        scrapingLogger.warn(
          `⚠️ Navigation attempt ${attempt} failed: ${error.message}`
        );

        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  // Wait for content using multiple strategies
  async waitForContent(page, waitConditions) {
    const promises = waitConditions.map(async (condition) => {
      try {
        if (
          condition.startsWith("networkidle") ||
          condition.startsWith("domcontent")
        ) {
          // Already handled in navigation
          return true;
        } else {
          // Wait for selector
          await page.waitForSelector(condition, { timeout: 10000 });
          return true;
        }
      } catch {
        return false;
      }
    });

    // Wait for at least one condition to be met
    const results = await Promise.allSettled(promises);
    const anySuccess = results.some(
      (result) => result.status === "fulfilled" && result.value === true
    );

    if (!anySuccess) {
      // Fallback wait
      await page.waitForTimeout(3000);
    }
  }

  // Extract scholarships using adaptive selectors
  async extractScholarshipsAdaptively(page, strategy) {
    return await page.evaluate((strategy) => {
      const scholarships = [];

      // Try different card selectors
      let scholarshipElements = [];
      for (const selector of strategy.selectors.scholarshipCards) {
        scholarshipElements = document.querySelectorAll(selector);
        if (scholarshipElements.length > 0) break;
      }

      scholarshipElements.forEach((element) => {
        const scholarship = {};

        // Extract title
        for (const titleSelector of strategy.selectors.title) {
          const titleElement = element.querySelector(titleSelector);
          if (titleElement && titleElement.textContent.trim()) {
            scholarship.title = titleElement.textContent.trim();
            break;
          }
        }

        // Extract description
        for (const descSelector of strategy.selectors.description) {
          const descElement = element.querySelector(descSelector);
          if (descElement && descElement.textContent.trim()) {
            scholarship.description = descElement.textContent.trim();
            break;
          }
        }

        // Extract amount
        for (const amountSelector of strategy.selectors.amount) {
          const amountElement = element.querySelector(amountSelector);
          if (amountElement && amountElement.textContent.trim()) {
            scholarship.amount = amountElement.textContent.trim();
            break;
          }
        }

        // Extract deadline
        for (const deadlineSelector of strategy.selectors.deadline) {
          const deadlineElement = element.querySelector(deadlineSelector);
          if (deadlineElement && deadlineElement.textContent.trim()) {
            scholarship.deadline = deadlineElement.textContent.trim();
            break;
          }
        }

        // Extract link
        for (const linkSelector of strategy.selectors.link) {
          const linkElement = element.querySelector(linkSelector);
          if (linkElement) {
            scholarship.sourceUrl =
              linkElement.href || linkElement.getAttribute("href");
            scholarship.applicationLink = scholarship.sourceUrl;
            break;
          }
        }

        // Extract category
        for (const categorySelector of strategy.selectors.category) {
          const categoryElement = element.querySelector(categorySelector);
          if (categoryElement && categoryElement.textContent.trim()) {
            scholarship.category = categoryElement.textContent.trim();
            break;
          }
        }

        // Extract provider
        for (const providerSelector of strategy.selectors.provider) {
          const providerElement = element.querySelector(providerSelector);
          if (providerElement && providerElement.textContent.trim()) {
            scholarship.provider = providerElement.textContent.trim();
            break;
          }
        }

        // Only add if we have minimum required data
        if (scholarship.title && scholarship.title.length > 3) {
          // Set defaults
          scholarship.description =
            scholarship.description || "No description available";
          scholarship.amount = scholarship.amount || "Amount not specified";
          scholarship.deadline =
            scholarship.deadline || "No deadline specified";
          scholarship.category = scholarship.category || "Other";
          scholarship.provider = scholarship.provider || "Unknown";
          scholarship.sourceUrl = scholarship.sourceUrl || window.location.href;
          scholarship.applicationLink =
            scholarship.applicationLink || scholarship.sourceUrl;
          scholarship.eligibility = "Please check the scholarship details";
          scholarship.isActive = true;

          scholarships.push(scholarship);
        }
      });

      return scholarships;
    }, strategy);
  }

  // Find next page with multiple strategies
  async findNextPage(page, paginationSelectors) {
    for (const selector of paginationSelectors) {
      try {
        const nextLink = await page.$(selector);
        if (nextLink) {
          const href = await page.evaluate((el) => el.href, nextLink);
          if (href && href !== page.url()) {
            return href;
          }
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  // Intelligent delay based on site performance
  async intelligentDelay(domain) {
    const metrics = this.performanceMetrics.get(domain) || {
      avgResponseTime: 2000,
    };

    // Base delay + adaptive component
    const baseDelay = 1000;
    const adaptiveDelay = Math.min(metrics.avgResponseTime * 0.5, 3000);
    const randomDelay = Math.random() * 1000;

    const totalDelay = baseDelay + adaptiveDelay + randomDelay;

    scrapingLogger.info(
      `⏳ Intelligent delay: ${Math.round(totalDelay)}ms for ${domain}`
    );
    await new Promise((resolve) => setTimeout(resolve, totalDelay));
  }

  // Enhance scholarships with AI
  async enhanceScholarshipsWithAI(scholarships) {
    scrapingLogger.info(
      `🤖 Enhancing ${scholarships.length} scholarships with AI`
    );

    const enhanced = [];

    for (const scholarship of scholarships) {
      try {
        // Validate and correct links
        const linkCorrected = await this.aiAnalyzer.validateAndCorrectLinks(
          scholarship
        );

        // Enhance content with AI
        const contentEnhanced = await this.aiAnalyzer.enhanceScholarshipContent(
          linkCorrected
        );

        enhanced.push(contentEnhanced);

        // Small delay to avoid overwhelming AI service
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        scrapingLogger.error(
          `❌ Failed to enhance scholarship: ${error.message}`
        );
        enhanced.push(scholarship);
      }
    }

    return enhanced;
  }

  // Update performance metrics
  updatePerformanceMetrics(domain, successCount) {
    const current = this.performanceMetrics.get(domain) || {
      totalRequests: 0,
      successfulScrapes: 0,
      avgResponseTime: 2000,
    };

    current.totalRequests++;
    current.successfulScrapes += successCount > 0 ? 1 : 0;

    this.performanceMetrics.set(domain, current);
  }

  // Get scraping performance report
  getPerformanceReport() {
    const report = {};

    for (const [domain, metrics] of this.performanceMetrics.entries()) {
      report[domain] = {
        ...metrics,
        successRate: (metrics.successfulScrapes / metrics.totalRequests) * 100,
      };
    }

    return report;
  }
}

export default IntelligentScrapingManager;
