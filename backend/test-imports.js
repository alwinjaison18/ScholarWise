/**
 * Test individual scraper imports
 */

console.log("🔍 Testing scraper imports individually...");

const scrapers = [
  "./src/scrapers/aicteScraper.js",
  "./src/scrapers/buddy4StudyScraper.js", 
  "./src/scrapers/nationalScholarshipPortalScraper.js",
  "./src/scrapers/scholarshipsIndiaScraper.js",
  "./src/scrapers/ugcScraper.js",
  "./src/scrapers/vidhyaLakshmiScraper.js"
];

async function testImports() {
  for (const scraperPath of scrapers) {
    try {
      console.log(`Testing ${scraperPath}...`);
      const scraper = await import(scraperPath);
      console.log(`✅ ${scraperPath} imported successfully`);
      console.log(`   Default export:`, typeof scraper.default);
    } catch (error) {
      console.log(`❌ ${scraperPath} failed:`, error.message);
    }
  }
  
  console.log("\n🔍 Testing logger import...");
  try {
    const logger = await import("./src/utils/logger.js");
    console.log("✅ Logger imported successfully");
  } catch (error) {
    console.log("❌ Logger failed:", error.message);
  }
  
  console.log("\n🏁 Import test completed!");
}

testImports();
