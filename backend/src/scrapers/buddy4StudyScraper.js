import puppeteer from "puppeteer";
import Scholarship from "../models/Scholarship.js";
import axios from "axios";
import { scrapingLogger } from "../utils/logger.js";

// Function to validate if a link is accessible
async function validateLink(url) {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });
    return response.status < 400;
  } catch (error) {
    scrapingLogger.warn(`Link validation failed for ${url}:`, error.message);
    return false;
  }
}

export async function scrapeBuddy4Study() {
  let browser;
  try {
    scrapingLogger.info("Starting Buddy4Study scraping...");

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );

    // Navigate to Buddy4Study scholarships page
    await page.goto("https://www.buddy4study.com/scholarships", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for content to load
    await page.waitForSelector(".scholarship-item", { timeout: 10000 });

    // Extract scholarship data
    const scholarships = await page.evaluate(() => {
      const items = document.querySelectorAll(".scholarship-item");
      const results = [];

      items.forEach((item) => {
        try {
          const titleElement = item.querySelector(
            ".scholarship-title, h3, .title"
          );
          const linkElement = item.querySelector("a");
          const descriptionElement = item.querySelector(
            ".description, .excerpt, p"
          );
          const amountElement = item.querySelector(".amount, .prize, .value");
          const deadlineElement = item.querySelector(".deadline, .last-date");

          if (titleElement && linkElement) {
            const title = titleElement.textContent.trim();
            const link = linkElement.href;
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
              });
            }
          }
        } catch (error) {
          console.warn("Error processing scholarship item:", error);
        }
      });

      return results;
    });

    scrapingLogger.info(
      `Found ${scholarships.length} scholarships on Buddy4Study`
    );

    let savedCount = 0;
    const processedScholarships = [];

    for (const scholarship of scholarships) {
      try {
        // Validate the application link
        const isValidLink = await validateLink(scholarship.applicationLink);

        if (!isValidLink) {
          scrapingLogger.warn(
            `Invalid link for scholarship: ${scholarship.title}`
          );
          continue;
        }

        // Check if scholarship already exists
        const existingScholarship = await Scholarship.findOne({
          $or: [
            { title: scholarship.title },
            { applicationLink: scholarship.applicationLink },
          ],
        });

        if (existingScholarship) {
          // Update existing scholarship
          existingScholarship.lastUpdated = new Date();
          existingScholarship.isActive = true;
          await existingScholarship.save();
          scrapingLogger.info(
            `Updated existing scholarship: ${scholarship.title}`
          );
        } else {
          // Create new scholarship
          const newScholarship = new Scholarship({
            title: scholarship.title,
            description:
              scholarship.description ||
              "Scholarship opportunity from Buddy4Study",
            eligibility: "Check website for eligibility criteria",
            amount: scholarship.amount,
            deadline: scholarship.deadline,
            applicationLink: scholarship.applicationLink,
            provider: "Buddy4Study",
            category: "General",
            targetGroup: ["All"],
            educationLevel: "All levels",
            state: "All India",
            sourceUrl: scholarship.sourceUrl,
            isActive: true,
            isRealTime: true,
            lastUpdated: new Date(),
            scrapedAt: new Date(),
          });

          await newScholarship.save();
          savedCount++;
          processedScholarships.push(newScholarship);
          scrapingLogger.info(`Saved new scholarship: ${scholarship.title}`);
        }
      } catch (error) {
        scrapingLogger.error(
          `Error processing scholarship ${scholarship.title}:`,
          error
        );
      }
    }

    scrapingLogger.info(
      `Buddy4Study scraping completed. Saved ${savedCount} new scholarships.`
    );

    return {
      source: "Buddy4Study",
      scholarships: processedScholarships,
      scraped: scholarships.length,
      saved: savedCount,
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
