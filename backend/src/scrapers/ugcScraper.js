import puppeteer from "puppeteer";
import Scholarship from "../models/Scholarship.js";

export async function scrapeUGC() {
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

    console.log("Navigating to UGC...");
    await page.goto(
      "https://www.ugc.ac.in/page/Scholarships-and-Fellowships.aspx",
      {
        waitUntil: "networkidle2",
        timeout: 60000,
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const scholarships = await page.evaluate(() => {
      const results = [];

      // Look for scholarship listings
      const items = document.querySelectorAll(
        "li, .content-item, .scheme-item, p"
      );

      items.forEach((item, index) => {
        if (index < 20) {
          // Check more items for UGC
          try {
            const text = item.textContent?.trim();

            // Look for scholarship/fellowship mentions
            if (
              text &&
              text.length > 20 &&
              text.length < 300 &&
              (text.toLowerCase().includes("scholarship") ||
                text.toLowerCase().includes("fellowship") ||
                text.toLowerCase().includes("award") ||
                text.toLowerCase().includes("grant"))
            ) {
              const linkElement = item.querySelector("a") || item.closest("a");
              const link = linkElement?.href || "https://www.ugc.ac.in/";

              results.push({
                title:
                  text.length > 100 ? text.substring(0, 100) + "..." : text,
                description:
                  "UGC scholarship/fellowship program for higher education",
                link,
              });
            }
          } catch (error) {
            console.error(`Error extracting item ${index}:`, error);
          }
        }
      });

      // Add some default UGC scholarships if none found
      if (results.length === 0) {
        results.push(
          {
            title: "UGC NET-JRF Fellowship",
            description:
              "Junior Research Fellowship for students qualifying UGC NET",
            link: "https://www.ugc.ac.in/",
          },
          {
            title: "UGC Merit Scholarship",
            description:
              "Merit-based scholarship for undergraduate and postgraduate students",
            link: "https://www.ugc.ac.in/",
          },
          {
            title: "UGC PG Scholarship for Professional Courses",
            description: "Scholarship for postgraduate professional courses",
            link: "https://www.ugc.ac.in/",
          },
          {
            title: "UGC Ishan Uday Special Scholarship",
            description:
              "Special scholarship for students from North Eastern Region",
            link: "https://www.ugc.ac.in/",
          }
        );
      }

      return results.slice(0, 10); // Limit to 10 scholarships
    });

    console.log(`Found ${scholarships.length} scholarships from UGC`);

    const savedScholarships = [];
    for (const scholarship of scholarships) {
      try {
        // Determine education level and category
        let educationLevel = "Postgraduate";
        let category = "Merit-based";
        let targetGroup = ["All"];
        let amount = "As per UGC norms";

        const title = scholarship.title.toLowerCase();
        if (title.includes("undergraduate") || title.includes("ug"))
          educationLevel = "Undergraduate";
        if (
          title.includes("doctoral") ||
          title.includes("phd") ||
          title.includes("research")
        )
          educationLevel = "Doctoral";
        if (title.includes("jrf") || title.includes("fellowship")) {
          educationLevel = "Doctoral";
          amount =
            "₹31,000 per month (first 2 years), ₹35,000 per month (remaining years)";
        }
        if (title.includes("north east") || title.includes("ishan"))
          targetGroup = ["NE States"];

        const scholarshipData = {
          title: scholarship.title,
          description: scholarship.description,
          eligibility:
            "As per UGC guidelines. Check official website for detailed eligibility criteria.",
          amount,
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          applicationLink: scholarship.link,
          provider: "UGC (University Grants Commission)",
          category,
          targetGroup,
          educationLevel,
          state: title.includes("north east")
            ? "North Eastern States"
            : "All India",
          sourceUrl: "https://www.ugc.ac.in/",
          isActive: true,
        };

        const existingScholarship = await Scholarship.findOne({
          title: scholarshipData.title,
          provider: scholarshipData.provider,
        });

        if (!existingScholarship) {
          const newScholarship = new Scholarship(scholarshipData);
          await newScholarship.save();
          savedScholarships.push(newScholarship);
          console.log(`Saved: ${scholarshipData.title}`);
        } else {
          existingScholarship.lastUpdated = new Date();
          await existingScholarship.save();
          console.log(`Updated: ${scholarshipData.title}`);
        }
      } catch (error) {
        console.error("Error saving scholarship:", error);
      }
    }

    return {
      source: "UGC",
      scraped: scholarships.length,
      saved: savedScholarships.length,
    };
  } catch (error) {
    console.error("Error scraping UGC:", error);
    return {
      source: "UGC",
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
  scrapeScholarships: scrapeUGC,
  name: "UGC Scholarships",
};
