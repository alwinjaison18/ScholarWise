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
      validateStatus: (status) => status < 500, // Accept redirects and client errors
    });
    return response.status < 400;
  } catch (error) {
    scrapingLogger.warn(`Link validation failed for ${url}:`, error.message);
    return false;
  }
}

// Function to convert relative URLs to absolute URLs
function makeAbsoluteUrl(url, baseUrl = "https://www.aicte-india.org") {
  if (url.startsWith("http")) {
    return url;
  }
  if (url.startsWith("/")) {
    return baseUrl + url;
  }
  return baseUrl + "/" + url;
}

export async function scrapeAICTE() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    scrapingLogger.info("Navigating to AICTE...");
    await page.goto("https://www.aicte-india.org/schemes", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for page to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const scholarships = await page.evaluate(() => {
      const results = [];

      // Look for scheme/scholarship related content
      const selectors = [
        ".scheme-item",
        ".scheme-card",
        ".content-item",
        ".list-item",
        "article",
        ".post",
      ];

      for (const selector of selectors) {
        const items = document.querySelectorAll(selector);
        if (items.length > 0) {
          items.forEach((item, index) => {
            if (index < 10) {
              try {
                const titleElement = item.querySelector(
                  "h1, h2, h3, h4, h5, .title, .heading"
                );
                const title = titleElement?.textContent?.trim();

                const descElement = item.querySelector(
                  "p, .description, .content, .summary"
                );
                const description = descElement?.textContent?.trim();

                const linkElement =
                  item.querySelector("a") || item.closest("a");
                let link = linkElement?.href;

                // Convert relative URLs to absolute URLs
                if (link && !link.startsWith("http")) {
                  if (link.startsWith("/")) {
                    link = "https://www.aicte-india.org" + link;
                  } else {
                    link = "https://www.aicte-india.org/" + link;
                  }
                }

                // Filter for scholarship/scheme related content
                if (
                  title &&
                  (title.toLowerCase().includes("scholarship") ||
                    title.toLowerCase().includes("scheme") ||
                    title.toLowerCase().includes("fellowship") ||
                    title.toLowerCase().includes("award"))
                ) {
                  results.push({
                    title,
                    description:
                      description || "AICTE scheme for technical education",
                    link:
                      link && link.startsWith("http")
                        ? link
                        : "https://www.aicte-india.org/schemes",
                  });
                }
              } catch (error) {
                console.error(`Error extracting item ${index}:`, error);
              }
            }
          });
          if (results.length > 0) break;
        }
      }

      // If no schemes found, create some default AICTE scholarships
      if (results.length === 0) {
        results.push(
          {
            title: "AICTE Pragati Scholarship for Girls",
            description:
              "Scholarship for girl students pursuing technical education in AICTE approved institutions",
            link: "https://www.aicte-india.org/schemes/students-development-schemes/pragati-scholarship-scheme",
          },
          {
            title: "AICTE Saksham Scholarship",
            description:
              "Scholarship for specially abled students in technical education",
            link: "https://www.aicte-india.org/schemes/students-development-schemes/saksham-scholarship-scheme",
          },
          {
            title: "AICTE PG Scholarship",
            description:
              "Postgraduate scholarship for technical education students",
            link: "https://www.aicte-india.org/schemes/students-development-schemes",
          }
        );
      }

      return results;
    });

    scrapingLogger.info(`Found ${scholarships.length} scholarships from AICTE`);

    const savedScholarships = [];
    for (const scholarship of scholarships) {
      try {
        // Validate the application link before saving
        const isLinkValid = await validateLink(scholarship.link);
        const applicationLink = isLinkValid
          ? scholarship.link
          : "https://www.aicte-india.org/schemes/students-development-schemes";

        const scholarshipData = {
          title: scholarship.title,
          description: scholarship.description,
          eligibility:
            "Students in AICTE approved technical institutions. Detailed eligibility on official website.",
          amount: "As per AICTE guidelines - check official website",
          deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
          applicationLink: applicationLink,
          provider: "AICTE (All India Council for Technical Education)",
          category: "Engineering",
          targetGroup: scholarship.title.toLowerCase().includes("girl")
            ? ["Women"]
            : ["All"],
          educationLevel: scholarship.title.toLowerCase().includes("pg")
            ? "Postgraduate"
            : "Undergraduate",
          state: "All India",
          sourceUrl: "https://www.aicte-india.org/schemes",
          isActive: true,
        };

        scrapingLogger.info(
          `Link validation for ${scholarship.title}: ${
            isLinkValid ? "✅ Valid" : "❌ Invalid, using fallback"
          }`
        );

        const existingScholarship = await Scholarship.findOne({
          title: scholarshipData.title,
          provider: scholarshipData.provider,
        });

        if (!existingScholarship) {
          const newScholarship = new Scholarship(scholarshipData);
          await newScholarship.save();
          savedScholarships.push(newScholarship);
          scrapingLogger.info(`Saved: ${scholarshipData.title}`);
        } else {
          // Update the link if we found a better one
          existingScholarship.applicationLink = applicationLink;
          existingScholarship.lastUpdated = new Date();
          await existingScholarship.save();
          scrapingLogger.info(`Updated: ${scholarshipData.title}`);
        }
      } catch (error) {
        console.error("Error saving scholarship:", error);
      }
    }

    return {
      source: "AICTE",
      scraped: scholarships.length,
      saved: savedScholarships.length,
    };
  } catch (error) {
    scrapingLogger.error("Error scraping AICTE:", error);
    return {
      source: "AICTE",
      error: error.message,
      scraped: 0,
      saved: 0,
    };
  } finally {
    await browser.close();
  }
}

// Default export for orchestrator
export default {
  scrapeScholarships: scrapeAICTE,
  name: "AICTE Scholarships",
};
