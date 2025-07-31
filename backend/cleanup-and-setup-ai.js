/**
 * Database Cleanup and Gemini AI Integration Script
 * Removes all mock/test data and sets up Gemini AI
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Scholarship from "./src/models/Scholarship.js";
import logger from "./src/utils/logger.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/scholarship_portal";

async function cleanupDatabase() {
  console.log("🧹 Starting database cleanup...");

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Get current scholarship count
    const currentCount = await Scholarship.countDocuments();
    console.log(`📊 Current scholarships in database: ${currentCount}`);

    // Check for mock/test data patterns
    const mockPatterns = [
      { title: /test/i },
      { title: /mock/i },
      { title: /sample/i },
      { title: /dummy/i },
      { title: /placeholder/i },
      { description: /test/i },
      { description: /mock/i },
      { description: /sample/i },
      { provider: /test/i },
      { provider: /mock/i },
      { applicationLink: /test/i },
      { applicationLink: /mock/i },
      { applicationLink: /localhost/i },
      { applicationLink: /example\.com/i },
      { applicationLink: /placeholder/i },
    ];

    let totalMockDataFound = 0;

    for (const pattern of mockPatterns) {
      const mockData = await Scholarship.find(pattern);
      if (mockData.length > 0) {
        console.log(
          `🔍 Found ${mockData.length} mock entries matching pattern:`,
          pattern
        );
        totalMockDataFound += mockData.length;

        // Remove mock data
        await Scholarship.deleteMany(pattern);
        console.log(`🗑️  Removed ${mockData.length} mock entries`);
      }
    }

    // Check for suspicious patterns that might be test data
    const suspiciousData = await Scholarship.find({
      $or: [
        { amount: { $regex: /^(0|1|100|1000|99999)$/ } }, // Common test amounts
        { deadline: { $lt: new Date("2020-01-01") } }, // Very old deadlines
        { title: { $regex: /^.{1,5}$/ } }, // Very short titles
      ],
    });

    if (suspiciousData.length > 0) {
      console.log(
        `⚠️  Found ${suspiciousData.length} potentially suspicious entries`
      );
      console.log("📋 Suspicious entries (first 5):");
      suspiciousData.slice(0, 5).forEach((entry) => {
        console.log(
          `   - ${entry.title} | Amount: ${entry.amount} | Deadline: ${entry.deadline}`
        );
      });

      // Ask for confirmation before removing suspicious data
      console.log(
        "❓ These entries might be test data. Manual review recommended."
      );
    }

    // Final count after cleanup
    const finalCount = await Scholarship.countDocuments();
    console.log(`✅ Database cleanup completed!`);
    console.log(`📊 Final scholarships count: ${finalCount}`);
    console.log(`🗑️  Total mock data removed: ${totalMockDataFound}`);

    return {
      initialCount: currentCount,
      finalCount: finalCount,
      removedCount: totalMockDataFound,
      suspiciousCount: suspiciousData.length,
    };
  } catch (error) {
    console.error("❌ Database cleanup error:", error);
    throw error;
  }
}

async function validateDataQuality() {
  console.log("\n🔍 Validating data quality...");

  try {
    // Check for scholarships with invalid links
    const invalidLinks = await Scholarship.find({
      $or: [
        { applicationLink: { $regex: /^(?!https?:\/\/)/ } }, // Not starting with http/https
        {
          applicationLink: {
            $regex: /localhost|127\.0\.0\.1|example\.com|test\.com/,
          },
        }, // Test domains
        { applicationLink: "" }, // Empty links
      ],
    });

    if (invalidLinks.length > 0) {
      console.log(
        `⚠️  Found ${invalidLinks.length} scholarships with invalid links`
      );

      // Remove scholarships with invalid links
      await Scholarship.deleteMany({
        $or: [
          { applicationLink: { $regex: /^(?!https?:\/\/)/ } },
          {
            applicationLink: {
              $regex: /localhost|127\.0\.0\.1|example\.com|test\.com/,
            },
          },
          { applicationLink: "" },
        ],
      });

      console.log(
        `🗑️  Removed ${invalidLinks.length} scholarships with invalid links`
      );
    }

    // Check for expired scholarships (older than 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const expiredScholarships = await Scholarship.find({
      deadline: { $lt: oneYearAgo },
    });

    if (expiredScholarships.length > 0) {
      console.log(
        `⏰ Found ${expiredScholarships.length} expired scholarships (older than 1 year)`
      );

      // Mark as inactive instead of deleting (for historical data)
      await Scholarship.updateMany(
        { deadline: { $lt: oneYearAgo } },
        { isActive: false }
      );

      console.log(
        `📝 Marked ${expiredScholarships.length} expired scholarships as inactive`
      );
    }

    // Get final statistics
    const stats = {
      total: await Scholarship.countDocuments(),
      active: await Scholarship.countDocuments({ isActive: true }),
      inactive: await Scholarship.countDocuments({ isActive: false }),
      recentlyAdded: await Scholarship.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      }),
    };

    console.log("\n📊 Database Statistics:");
    console.log(`   Total Scholarships: ${stats.total}`);
    console.log(`   Active Scholarships: ${stats.active}`);
    console.log(`   Inactive Scholarships: ${stats.inactive}`);
    console.log(`   Recently Added (30 days): ${stats.recentlyAdded}`);

    return stats;
  } catch (error) {
    console.error("❌ Data validation error:", error);
    throw error;
  }
}

async function setupGeminiIntegration() {
  console.log("\n🤖 Setting up Gemini AI Integration...");

  try {
    // Create/update .env file with Gemini API configuration
    const envContent = `
# Database Configuration
MONGODB_URI=${MONGODB_URI}
NODE_ENV=production
PORT=5000

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.3

# Feature Flags
USE_AI_ENHANCEMENT=true
USE_LINK_VALIDATION=true
USE_CONTENT_ANALYSIS=true
USE_DUPLICATE_DETECTION=true

# Rate Limiting
AI_REQUESTS_PER_MINUTE=60
SCRAPING_RATE_LIMIT=10

# Logging
LOG_LEVEL=info
`;

    const fs = await import("fs/promises");
    await fs.writeFile(".env.example", envContent.trim());
    console.log("✅ Created .env.example with Gemini AI configuration");

    // Check if .env exists, if not create it
    try {
      await fs.access(".env");
      console.log(
        "📝 .env file exists - please update it with your Gemini API key"
      );
    } catch {
      await fs.writeFile(".env", envContent.trim());
      console.log("✅ Created .env file - please add your Gemini API key");
    }

    console.log("\n🔑 To complete Gemini AI setup:");
    console.log(
      "1. Get your Gemini API key from: https://makersuite.google.com/app/apikey"
    );
    console.log(
      "2. Replace 'your_gemini_api_key_here' in .env with your actual API key"
    );
    console.log("3. Restart the server to enable AI features");

    return true;
  } catch (error) {
    console.error("❌ Gemini setup error:", error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting Database Cleanup and AI Integration");
  console.log("=".repeat(60));

  try {
    // 1. Clean up mock data
    const cleanupResults = await cleanupDatabase();

    // 2. Validate data quality
    const validationResults = await validateDataQuality();

    // 3. Setup Gemini AI integration
    await setupGeminiIntegration();

    console.log("\n🎉 Cleanup and Setup Completed Successfully!");
    console.log("=".repeat(60));
    console.log("📊 Summary:");
    console.log(`   Mock data removed: ${cleanupResults.removedCount}`);
    console.log(`   Final scholarship count: ${cleanupResults.finalCount}`);
    console.log(`   Active scholarships: ${validationResults.active}`);
    console.log(`   Gemini AI: Ready for configuration`);

    console.log("\n🔥 Your database is now clean and ready for production!");
    console.log("📝 Next steps:");
    console.log("   1. Add your Gemini API key to .env");
    console.log("   2. Run the scrapers to populate with live data");
    console.log("   3. Test the AI features");
  } catch (error) {
    console.error("❌ Process failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
  }
}

// Run the cleanup
main().catch(console.error);
