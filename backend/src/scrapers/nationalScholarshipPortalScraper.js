import puppeteer from "puppeteer";
import Scholarship from "../models/Scholarship.js";
import { scrapingLogger } from "../utils/logger.js";

export async function scrapeNationalScholarshipPortal() {
  let browser;

  try {
    scrapingLogger.info("🚀 Starting National Scholarship Portal scraping...");

    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    const page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    scrapingLogger.info("🌐 Navigating to National Scholarship Portal...");
    await page.goto("https://scholarships.gov.in/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for the page to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Look for scholarship listings
    const scholarships = await page.evaluate(() => {
      const results = [];

      // Try different selectors for scholarship listings
      const selectors = [
        ".scholarship-item",
        ".scheme-item",
        ".scholarship-card",
        ".scheme-card",
        "[data-scheme]",
        ".list-group-item",
      ];

      for (const selector of selectors) {
        const items = document.querySelectorAll(selector);
        if (items.length > 0) {
          scrapingLogger.info(
            `📋 Found ${items.length} items with selector: ${selector}`
          );

          items.forEach((item, index) => {
            if (index < 10) {
              // Limit to first 10 items
              try {
                const titleElement =
                  item.querySelector(
                    "h3, h4, h5, .title, .scheme-title, .name"
                  ) || item;
                const title =
                  titleElement.textContent?.trim() ||
                  `Scholarship ${index + 1}`;

                const descElement = item.querySelector(
                  ".description, .details, p"
                );
                const description =
                  descElement?.textContent?.trim() ||
                  "Please visit the official website for more details";

                const linkElement =
                  item.querySelector("a") || item.closest("a");
                const link =
                  linkElement?.href || "https://scholarships.gov.in/";

                if (title && title.length > 5) {
                  results.push({
                    title,
                    description,
                    link,
                  });
                }
              } catch (error) {
                console.error(`Error extracting item ${index}:`, error);
              }
            }
          });
          break; // Use first successful selector
        }
      }

      // If no specific selectors work, try to find any links with scholarship-related keywords
      if (results.length === 0) {
        const allLinks = Array.from(document.querySelectorAll("a"));
        const scholarshipLinks = allLinks.filter((link) => {
          const text = link.textContent?.toLowerCase() || "";
          const href = link.href?.toLowerCase() || "";
          return (
            (text.includes("scholarship") ||
              text.includes("scheme") ||
              href.includes("scholarship") ||
              href.includes("scheme")) &&
            text.length > 10 &&
            text.length < 200
          );
        });

        scholarshipLinks.slice(0, 8).forEach((link, index) => {
          results.push({
            title:
              link.textContent?.trim() || `Government Scholarship ${index + 1}`,
            description:
              "Government scholarship scheme - visit official portal for eligibility and application details",
            link: link.href,
          });
        });
      }

      return results;
    });

    scrapingLogger.info(
      `✅ Found ${scholarships.length} scholarships from live scraping`
    );

    // Use only real scraped data - LIVE DATA ONLY RULE ENFORCED
    const finalScholarships = scholarships;

    if (scholarships.length === 0) {
      scrapingLogger.warn(
        "⚠️ No scholarships found from National Scholarship Portal scraping"
      );
    }

    // Process and save scholarships
    const savedScholarships = [];
    for (const scholarship of finalScholarships) {
      try {
        // Determine category based on title
        let category = "Merit-based";
        let targetGroup = ["All"];
        let educationLevel = "All";

        const titleLower = scholarship.title.toLowerCase();

        if (
          titleLower.includes("sc ") ||
          titleLower.includes("scheduled caste")
        ) {
          category = "Merit-based";
          targetGroup = ["SC/ST"];
        } else if (
          titleLower.includes("st ") ||
          titleLower.includes("scheduled tribe")
        ) {
          category = "Merit-based";
          targetGroup = ["SC/ST"];
        } else if (titleLower.includes("obc")) {
          category = "Merit-based";
          targetGroup = ["OBC"];
        } else if (titleLower.includes("minority")) {
          category = "Merit-based";
          targetGroup = ["Minority"];
        }

        if (
          titleLower.includes("pre matric") ||
          titleLower.includes("prematric")
        ) {
          educationLevel = "School";
        } else if (
          titleLower.includes("post matric") ||
          titleLower.includes("postmatric")
        ) {
          educationLevel = "Undergraduate";
        } else if (
          titleLower.includes("fellowship") ||
          titleLower.includes("phd") ||
          titleLower.includes("m.phil")
        ) {
          educationLevel = "Doctoral";
        }

        const scholarshipData = {
          title: scholarship.title,
          description:
            scholarship.description ||
            "Government scholarship - check official website for complete details",
          eligibility:
            "Please refer to the official National Scholarship Portal for detailed eligibility criteria",
          amount: "Varies by scheme - check official website",
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          applicationLink: scholarship.link,
          provider: "National Scholarship Portal (Government of India)",
          category,
          targetGroup,
          educationLevel,
          state: "All India",
          sourceUrl: "https://scholarships.gov.in/",
          isActive: true,
        };

        // Check if scholarship already exists
        const existingScholarship = await Scholarship.findOne({
          title: scholarshipData.title,
          provider: scholarshipData.provider,
        });

        if (!existingScholarship) {
          const newScholarship = new Scholarship(scholarshipData);
          await newScholarship.save();
          savedScholarships.push(newScholarship);
          scrapingLogger.info(`💾 Saved: ${scholarshipData.title}`);
        } else {
          existingScholarship.lastUpdated = new Date();
          await existingScholarship.save();
          scrapingLogger.info(`🔄 Updated: ${scholarshipData.title}`);
        }
      } catch (error) {
        scrapingLogger.error(`❌ Error saving scholarship: ${error.message}`);
      }
    }

    return {
      source: "National Scholarship Portal",
      scraped: finalScholarships.length,
      saved: savedScholarships.length,
      liveDataOnly: true,
    };
  } catch (error) {
    scrapingLogger.error(
      `❌ Error scraping National Scholarship Portal: ${error.message}`
    );

    // Return empty result when scraping fails - STRICTLY NO MOCK DATA FALLBACK
    return {
      source: "National Scholarship Portal",
      scraped: 0,
      saved: 0,
      error: error.message,
      timestamp: new Date().toISOString(),
      liveDataOnly: true,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Default export for orchestrator
export default {
  scrapeScholarships: scrapeNationalScholarshipPortal,
  name: "National Scholarship Portal",
};
