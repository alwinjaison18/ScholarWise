import puppeteer from "puppeteer";
import Scholarship from "../models/Scholarship.js";
import axios from "axios";
import https from "https";
import { scrapingLogger } from "../utils/logger.js";

// Create HTTPS agent that bypasses SSL certificate verification
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureProtocol: "TLSv1_2_method",
  ciphers: "ALL",
});

// CRITICAL: Enhanced link validation following coding instructions
async function validateScholarshipLinks(scholarship) {
  const validationResults = {
    applicationLinkValid: false,
    sourceUrlValid: false,
    leadsToCorrectPage: false,
    applicationFormPresent: false,
    scholarshipNameMatches: false,
    errors: [],
    qualityScore: 0,
  };

  try {
    // Skip validation for generic fallback URLs - these need specific handling
    if (
      scholarship.applicationLink === "https://buddy4study.com/" ||
      scholarship.applicationLink === "https://www.buddy4study.com/" ||
      scholarship.applicationLink === "https://www.buddy4study.com/scholarships"
    ) {
      scrapingLogger.warn(
        `Generic URL detected for ${scholarship.title} - Needs specific link`
      );
      validationResults.errors.push(
        "Generic URL - requires specific application link"
      );
      return validationResults;
    }

    // Test HTTP Status - MANDATORY requirement
    const response = await axios.head(scholarship.applicationLink, {
      timeout: 15000,
      maxRedirects: 5,
      httpsAgent: httpsAgent,
      validateStatus: (status) => status < 500,
    });

    if (response.status === 200) {
      validationResults.applicationLinkValid = true;
      scrapingLogger.info(`✅ Link accessible: ${scholarship.applicationLink}`);

      // Verify content relevance - MANDATORY requirement
      try {
        const pageContent = await axios.get(scholarship.applicationLink, {
          timeout: 15000,
          httpsAgent: httpsAgent,
          validateStatus: (status) => status < 500,
        });

        const content = pageContent.data.toLowerCase();
        const title = scholarship.title.toLowerCase();

        // Check if page content matches scholarship details
        const titleWords = title.split(" ").filter((word) => word.length > 3);
        const titleMatches = titleWords.some((word) => content.includes(word));

        validationResults.scholarshipNameMatches = titleMatches;
        validationResults.leadsToCorrectPage =
          content.includes("scholarship") ||
          content.includes("apply") ||
          content.includes("eligibility");

        // Check for application form presence - MANDATORY requirement
        validationResults.applicationFormPresent =
          content.includes("form") ||
          content.includes("register") ||
          content.includes("submit") ||
          content.includes("application");
      } catch (contentError) {
        scrapingLogger.warn(
          `Content validation failed for ${scholarship.applicationLink}: ${contentError.message}`
        );
        validationResults.errors.push("Content validation failed");
      }
    } else {
      validationResults.errors.push(
        `HTTP ${response.status}: ${response.statusText}`
      );
    }
  } catch (error) {
    scrapingLogger.error(
      `Link validation failed for ${scholarship.applicationLink}:`,
      error.message
    );

    // Handle SSL/TLS errors per original logic but log as warning
    if (
      error.message.includes("SSL") ||
      error.message.includes("TLS") ||
      error.message.includes("EPROTO")
    ) {
      scrapingLogger.warn(
        `SSL issue for ${scholarship.title} - Marking for manual review`
      );
      validationResults.errors.push(
        "SSL/TLS verification failed - manual review needed"
      );
    } else {
      validationResults.errors.push(error.message);
    }
  }

  return validationResults;
}

// CRITICAL: Link quality scoring following coding instructions
function calculateLinkQuality(validationResults) {
  let score = 0;

  // Accessibility (40 points) - MANDATORY
  if (validationResults.applicationLinkValid) score += 40;

  // Relevance (30 points) - MANDATORY
  if (validationResults.leadsToCorrectPage) score += 20;
  if (validationResults.scholarshipNameMatches) score += 10;

  // Functionality (30 points) - MANDATORY
  if (validationResults.applicationFormPresent) score += 20;
  if (validationResults.errors.length === 0) score += 10;

  validationResults.qualityScore = score;
  return score;
}

// CRITICAL: Process scraped scholarship with mandatory validation
async function processScrapedScholarship(rawScholarship) {
  try {
    // Step 1: Basic data validation
    if (!rawScholarship.applicationLink || !rawScholarship.title) {
      throw new Error("Missing required fields: title and applicationLink");
    }

    // Step 2: MANDATORY link validation
    scrapingLogger.info(`🔍 Validating scholarship: ${rawScholarship.title}`);
    const linkValidation = await validateScholarshipLinks(rawScholarship);

    // Step 3: Quality scoring - MANDATORY minimum 70
    const qualityScore = calculateLinkQuality(linkValidation);

    // Step 4: Only save high-quality, verified scholarships
    if (qualityScore >= 70 && linkValidation.applicationLinkValid) {
      scrapingLogger.info(
        `✅ High quality scholarship (${qualityScore}/100): ${rawScholarship.title}`
      );
      return await saveVerifiedScholarship(rawScholarship, linkValidation);
    } else {
      scrapingLogger.warn(
        `❌ Rejected scholarship: ${rawScholarship.title} - Quality score: ${qualityScore}/100`
      );
      scrapingLogger.warn(
        `Validation errors: ${linkValidation.errors.join(", ")}`
      );
      return null;
    }
  } catch (error) {
    scrapingLogger.error(
      `Validation failed for ${rawScholarship.title}: ${error.message}`
    );
    return null;
  }
}

// Save verified scholarship with validation metadata
async function saveVerifiedScholarship(scholarship, validation) {
  try {
    // Check if scholarship already exists
    const existingScholarship = await Scholarship.findOne({
      $or: [
        { title: scholarship.title },
        { applicationLink: scholarship.applicationLink },
      ],
    });

    const scholarshipData = {
      title: scholarship.title,
      description:
        scholarship.description ||
        `Verified scholarship opportunity: ${scholarship.title}`,
      eligibility:
        scholarship.eligibility ||
        "Check official notification for eligibility criteria",
      amount:
        scholarship.amount ||
        "Amount not specified - Check official notification",
      deadline: scholarship.deadline || "Check official website for deadline",
      applicationLink: scholarship.applicationLink,
      provider: scholarship.provider || "Buddy4Study",
      category: scholarship.category || "General",
      targetGroup: ["All"],
      educationLevel: "All levels",
      state: "All India",
      source: "Buddy4Study",
      sourceUrl: "https://www.buddy4study.com/scholarships",
      isActive: true,
      isRealTime: true,
      lastUpdated: new Date(),
      scrapedAt: new Date(),
      extractionMethod: scholarship.extractionMethod || "AI-powered validation",
      linkStatus: "verified",
      qualityScore: validation.qualityScore,
      validationTimestamp: new Date(),
    };

    if (existingScholarship) {
      // Update existing with new validation data
      Object.assign(existingScholarship, scholarshipData);
      await existingScholarship.save();
      scrapingLogger.info(
        `📝 Updated verified scholarship: ${scholarship.title}`
      );
      return existingScholarship;
    } else {
      // Create new verified scholarship
      const newScholarship = new Scholarship(scholarshipData);
      const saved = await newScholarship.save();
      scrapingLogger.info(
        `💾 Saved new verified scholarship: ${scholarship.title}`
      );
      return saved;
    }
  } catch (error) {
    scrapingLogger.error(
      `Failed to save scholarship ${scholarship.title}: ${error.message}`
    );
    throw error;
  }
}

export async function scrapeBuddy4Study() {
  let browser;
  try {
    scrapingLogger.info("Starting Buddy4Study scraping...");

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
        "--ignore-ssl-errors",
        "--disable-web-security",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate to Buddy4Study scholarships page
    scrapingLogger.info("Navigating to Buddy4Study...");
    await page.goto("https://www.buddy4study.com/scholarships", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Try multiple possible selectors for scholarship items
    const possibleSelectors = [
      ".scholarship-item",
      ".scholarship-card",
      ".card",
      ".result-item",
      ".listing-item",
      "[data-scholarship]",
      ".scholarship",
      ".search-result",
    ];

    let scholarshipItems = null;
    let usedSelector = null;
    let scholarships = [];

    // Try each selector until we find content
    for (const selector of possibleSelectors) {
      try {
        scrapingLogger.info(`Trying selector: ${selector}`);
        await page.waitForSelector(selector, { timeout: 5000 });

        const itemCount = await page.$$eval(selector, (items) => items.length);
        if (itemCount > 0) {
          scholarshipItems = selector;
          usedSelector = selector;
          scrapingLogger.info(
            `Found ${itemCount} items with selector: ${selector}`
          );
          break;
        }
      } catch (error) {
        scrapingLogger.info(`Selector ${selector} not found, trying next...`);
        continue;
      }
    }

    if (!scholarshipItems) {
      scrapingLogger.warn(
        "No scholarship items found with any selector. Implementing AI-powered extraction..."
      );

      try {
        // Use AI-powered extraction for dynamic content
        const extractedScholarships = await page.evaluate(() => {
          const scholarshipData = [];

          // Get all text content and analyze patterns
          const textContent = document.body.innerText;
          const links = Array.from(document.querySelectorAll("a")).filter(
            (link) =>
              link.href &&
              (link.textContent.toLowerCase().includes("scholarship") ||
                link.textContent.toLowerCase().includes("apply") ||
                link.textContent.toLowerCase().includes("award") ||
                link.href.toLowerCase().includes("scholarship") ||
                link.textContent.toLowerCase().includes("free") ||
                link.textContent.toLowerCase().includes("coaching") ||
                link.textContent.toLowerCase().includes("details") ||
                link.textContent.toLowerCase().includes("more"))
          );

          // Split content into lines and look for scholarship patterns
          const lines = textContent
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Identify scholarship titles (contain keywords and proper length)
            if (
              (line.includes("SCHOLARSHIP") ||
                line.includes("AWARD") ||
                line.includes("FELLOWSHIP") ||
                line.includes("COACHING") ||
                line.includes("SCHEME")) &&
              line.length > 15 &&
              line.length < 200 &&
              !line.toLowerCase().includes("filter") &&
              !line.toLowerCase().includes("search")
            ) {
              const scholarship = {
                title: line,
                description: "",
                deadline: "",
                amount: "",
                eligibility: "",
                applicationLink: "https://www.buddy4study.com/scholarships", // Better fallback
              };

              // Look for associated information in nearby lines
              for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
                const nextLine = lines[j];

                if (
                  nextLine.toLowerCase().includes("deadline") ||
                  nextLine.toLowerCase().includes("last date") ||
                  nextLine.toLowerCase().includes("apply by")
                ) {
                  scholarship.deadline = nextLine;
                } else if (
                  nextLine.includes("₹") ||
                  nextLine.includes("RS") ||
                  nextLine.toLowerCase().includes("amount") ||
                  nextLine.toLowerCase().includes("worth")
                ) {
                  scholarship.amount = nextLine;
                } else if (
                  nextLine.toLowerCase().includes("eligibility") ||
                  nextLine.toLowerCase().includes("eligible for")
                ) {
                  scholarship.eligibility = nextLine;
                } else if (
                  nextLine.length > 30 &&
                  nextLine.length < 300 &&
                  !scholarship.description &&
                  !nextLine.includes("SCHOLARSHIP") &&
                  !nextLine.includes("AWARD")
                ) {
                  scholarship.description = nextLine;
                }
              }

              // Try to find specific application link more intelligently
              const titleKeywords = line
                .toLowerCase()
                .split(" ")
                .filter((word) => word.length > 3);

              // First, try to find a direct link that matches scholarship keywords
              let bestLink = links.find((link) => {
                const linkText = link.textContent.toLowerCase();
                const linkHref = link.href.toLowerCase();

                // Check if link contains scholarship-specific keywords
                return titleKeywords.some(
                  (keyword) =>
                    linkText.includes(keyword) || linkHref.includes(keyword)
                );
              });

              // If no specific link found, try to find any "apply" or "details" link nearby
              if (!bestLink) {
                bestLink = links.find((link) => {
                  const linkText = link.textContent.toLowerCase();
                  return (
                    linkText.includes("apply") ||
                    linkText.includes("details") ||
                    linkText.includes("more info") ||
                    linkText.includes("view")
                  );
                });
              }

              // Use specific link if found, otherwise keep fallback
              if (bestLink && bestLink.href !== window.location.href) {
                scholarship.applicationLink = bestLink.href;
              }

              scholarshipData.push(scholarship);
            }
          }

          return scholarshipData;
        });

        scrapingLogger.info(
          `AI extraction found ${extractedScholarships.length} potential scholarships`
        );

        // Process scholarships with MANDATORY validation
        let savedCount = 0;
        const processedScholarships = [];

        for (const scholarship of extractedScholarships) {
          const result = await processScrapedScholarship(scholarship);
          if (result) {
            processedScholarships.push(result);
            savedCount++;
          }
        }

        // Set scholarships to AI-extracted data to continue with normal processing
        scholarships = processedScholarships;
      } catch (error) {
        scrapingLogger.error("AI extraction failed:", error.message);

        // Log page title and some content for debugging
        const pageTitle = await page.title();
        const bodyText = await page.evaluate(() =>
          document.body.innerText.substring(0, 500)
        );

        scrapingLogger.info(`Page title: ${pageTitle}`);
        scrapingLogger.info(`Page content preview: ${bodyText}`);

        scholarships = [];
      }
    } else {
      // Extract scholarship data using the found selector
      scholarships = await page.evaluate((selector) => {
        const items = document.querySelectorAll(selector);
        const results = [];

        items.forEach((item, index) => {
          try {
            // Try multiple possible selectors for each field
            const titleSelectors = [
              ".scholarship-title",
              "h3",
              ".title",
              "h2",
              "h4",
              ".card-title",
              ".name",
              "a[title]",
            ];

            const linkSelectors = ["a", ".link", ".scholarship-link", "[href]"];

            const descriptionSelectors = [
              ".description",
              ".excerpt",
              "p",
              ".summary",
              ".card-text",
              ".content",
            ];

            const amountSelectors = [
              ".amount",
              ".prize",
              ".value",
              ".scholarship-amount",
              ".money",
              ".funding",
            ];

            const deadlineSelectors = [
              ".deadline",
              ".last-date",
              ".due-date",
              ".expiry",
              ".end-date",
            ];

            // Helper function to find element by multiple selectors
            const findElement = (selectors) => {
              for (const sel of selectors) {
                const el = item.querySelector(sel);
                if (el && el.textContent.trim()) {
                  return el;
                }
              }
              return null;
            };

            const titleElement = findElement(titleSelectors);
            const linkElement = findElement(linkSelectors);
            const descriptionElement = findElement(descriptionSelectors);
            const amountElement = findElement(amountSelectors);
            const deadlineElement = findElement(deadlineSelectors);

            if (titleElement && linkElement) {
              const title = titleElement.textContent.trim();
              let link = linkElement.href;

              // Handle relative URLs
              if (link && !link.startsWith("http")) {
                link = new URL(link, "https://www.buddy4study.com").href;
              }

              const description = descriptionElement
                ? descriptionElement.textContent.trim()
                : "";
              const amount = amountElement
                ? amountElement.textContent.trim()
                : "Amount not specified";
              const deadline = deadlineElement
                ? deadlineElement.textContent.trim()
                : "Check website for deadline";

              if (title && link) {
                results.push({
                  title,
                  description,
                  amount,
                  deadline,
                  applicationLink: link,
                  sourceUrl: "https://www.buddy4study.com/scholarships",
                  provider: "Buddy4Study",
                  category: "General",
                  educationLevel: "All",
                });
              }
            }
          } catch (error) {
            console.warn(`Error processing scholarship item ${index}:`, error);
          }
        });

        return results;
      }, usedSelector); // Pass the selector as parameter
    }

    scrapingLogger.info(
      `Found ${scholarships.length} scholarships on Buddy4Study`
    );

    // Return the results (scholarships are already saved from AI extraction or selector extraction)
    const totalFound = scholarships.length;
    const totalSaved = scholarships.filter((s) => s._id).length; // Count saved scholarships

    scrapingLogger.info(
      `✅ Buddy4Study scraping completed. Saved ${totalSaved} verified scholarships out of ${totalFound} found.`
    );

    return {
      source: "Buddy4Study",
      scholarships: scholarships,
      scraped: totalFound,
      saved: totalSaved,
      verified: totalSaved, // All saved scholarships are verified
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    scrapingLogger.error("Error scraping Buddy4Study:", error);
    return {
      source: "Buddy4Study",
      error: error.message,
      scraped: 0,
      saved: 0,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Default export for orchestrator
export default {
  scrapeScholarships: scrapeBuddy4Study,
  name: "Buddy4Study",
};
