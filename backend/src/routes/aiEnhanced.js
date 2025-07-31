import express from "express";
import { AIContentAnalyzer } from "../utils/aiContentAnalyzer.js";
import IntelligentScrapingManager from "../utils/intelligentScraper.js";
import { LinkFixerScraper } from "../scrapers/linkFixerScraper.js";
import Scholarship from "../models/Scholarship.js";
import { scrapingLogger } from "../utils/logger.js";

const router = express.Router();
const aiAnalyzer = new AIContentAnalyzer();
const intelligentScraper = new IntelligentScrapingManager();
const linkFixer = new LinkFixerScraper();

// Validate and fix scholarship links
router.post("/validate-links", async (req, res) => {
  try {
    const { scholarshipIds } = req.body;

    if (!scholarshipIds || !Array.isArray(scholarshipIds)) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of scholarship IDs",
      });
    }

    const results = [];

    for (const id of scholarshipIds) {
      try {
        const scholarship = await Scholarship.findById(id);
        if (!scholarship) {
          results.push({
            id,
            status: "not_found",
            error: "Scholarship not found",
          });
          continue;
        }

        // Validate and potentially fix the link
        const linkValidation = await aiAnalyzer.validateAndFixLinks([
          scholarship.link,
        ]);
        const validatedLink = linkValidation.validatedLinks[0];

        let updated = false;
        if (
          validatedLink.status === "corrected" &&
          validatedLink.correctedUrl
        ) {
          scholarship.link = validatedLink.correctedUrl;
          scholarship.lastValidated = new Date();
          await scholarship.save();
          updated = true;
        }

        results.push({
          id,
          originalLink: scholarship.link,
          validationResult: validatedLink,
          updated,
          title: scholarship.title,
        });
      } catch (error) {
        scrapingLogger.error(`Error validating scholarship ${id}:`, error);
        results.push({
          id,
          status: "error",
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      results,
      summary: {
        total: scholarshipIds.length,
        validated: results.filter((r) => r.validationResult?.status === "valid")
          .length,
        corrected: results.filter((r) => r.updated).length,
        errors: results.filter((r) => r.status === "error").length,
      },
    });
  } catch (error) {
    scrapingLogger.error("Link validation endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Enhance scholarship content with AI
router.post("/enhance-content", async (req, res) => {
  try {
    const { scholarshipId, fields } = req.body;

    if (!scholarshipId) {
      return res.status(400).json({
        success: false,
        error: "Please provide a scholarship ID",
      });
    }

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: "Scholarship not found",
      });
    }

    // Enhance content using AI
    const enhancementResult = await aiAnalyzer.enhanceContent(scholarship, {
      enhanceDescription: fields?.includes("description") !== false,
      extractEligibility: fields?.includes("eligibility") !== false,
      categorizeAmount: fields?.includes("amount") !== false,
      normalizeDeadline: fields?.includes("deadline") !== false,
    });

    // Update scholarship with enhanced content
    let updated = false;
    if (
      enhancementResult.enhancedDescription &&
      enhancementResult.enhancedDescription !== scholarship.description
    ) {
      scholarship.description = enhancementResult.enhancedDescription;
      updated = true;
    }

    if (
      enhancementResult.extractedEligibility &&
      enhancementResult.extractedEligibility.length > 0
    ) {
      scholarship.eligibility = enhancementResult.extractedEligibility;
      updated = true;
    }

    if (
      enhancementResult.normalizedAmount &&
      enhancementResult.normalizedAmount !== scholarship.amount
    ) {
      scholarship.amount = enhancementResult.normalizedAmount;
      updated = true;
    }

    if (
      enhancementResult.normalizedDeadline &&
      enhancementResult.normalizedDeadline !== scholarship.deadline
    ) {
      scholarship.deadline = enhancementResult.normalizedDeadline;
      updated = true;
    }

    if (updated) {
      scholarship.lastEnhanced = new Date();
      await scholarship.save();
    }

    res.json({
      success: true,
      scholarshipId,
      enhancementResult,
      updated,
      scholarship: {
        title: scholarship.title,
        description: scholarship.description,
        eligibility: scholarship.eligibility,
        amount: scholarship.amount,
        deadline: scholarship.deadline,
      },
    });
  } catch (error) {
    scrapingLogger.error("Content enhancement endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Detect and merge duplicate scholarships
router.post("/detect-duplicates", async (req, res) => {
  try {
    const { limit = 100 } = req.body;

    // Get recent scholarships to check for duplicates
    const scholarships = await Scholarship.find({})
      .sort({ createdAt: -1 })
      .limit(limit);

    const duplicateGroups = await aiAnalyzer.detectDuplicates(scholarships);

    res.json({
      success: true,
      duplicateGroups,
      summary: {
        totalChecked: scholarships.length,
        duplicateGroups: duplicateGroups.length,
        totalDuplicates: duplicateGroups.reduce(
          (sum, group) => sum + group.scholarships.length - 1,
          0
        ),
      },
    });
  } catch (error) {
    scrapingLogger.error("Duplicate detection endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Intelligent scraping with adaptive strategies
router.post("/intelligent-scrape", async (req, res) => {
  try {
    const { url, strategy } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Please provide a URL to scrape",
      });
    }

    const scrapingResult =
      await intelligentScraper.scrapeWithMultipleStrategies(url, {
        preferredStrategy: strategy,
        maxRetries: 3,
        adaptiveTimeout: true,
      });

    res.json({
      success: true,
      url,
      result: scrapingResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    scrapingLogger.error("Intelligent scraping endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get AI performance metrics
router.get("/metrics", async (req, res) => {
  try {
    const metrics = {
      contentAnalyzer: aiAnalyzer.getMetrics(),
      intelligentScraper: intelligentScraper.getMetrics(),
      linkFixer: linkFixer.getStats(),
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    scrapingLogger.error("AI metrics endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Run comprehensive improvement process
router.post("/improve-database", async (req, res) => {
  try {
    const {
      batchSize = 25,
      fixLinks = true,
      enhanceContent = true,
      detectDuplicates = true,
      skipRecentlyProcessed = true,
    } = req.body;

    // Start the improvement process (run in background for large datasets)
    const improvementPromise = linkFixer.runComprehensiveImprovement({
      batchSize,
      fixLinks,
      enhanceContent,
      detectDuplicates,
      skipRecentlyProcessed,
    });

    // For small batches, wait for completion
    if (batchSize <= 50) {
      const results = await improvementPromise;
      res.json({
        success: true,
        message: "Database improvement completed",
        results,
        stats: linkFixer.getStats(),
      });
    } else {
      // For large batches, return immediately and run in background
      improvementPromise.catch((error) => {
        scrapingLogger.error("Background improvement process failed:", error);
      });

      res.json({
        success: true,
        message: "Database improvement started in background",
        estimatedTime: `${Math.ceil(batchSize / 10)} minutes`,
        currentStats: linkFixer.getStats(),
      });
    }
  } catch (error) {
    scrapingLogger.error("Database improvement endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Fix specific broken links
router.post("/fix-broken-links", async (req, res) => {
  try {
    const { scholarshipIds, limit = 100 } = req.body;

    let scholarships;
    if (scholarshipIds && Array.isArray(scholarshipIds)) {
      scholarships = await Scholarship.find({ _id: { $in: scholarshipIds } });
    } else {
      // Find scholarships with potentially broken links
      scholarships = await Scholarship.find({
        $or: [
          {
            lastValidated: {
              $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          { lastValidated: { $exists: false } },
          { link: { $regex: /404|error|not.found/i } },
        ],
      }).limit(limit);
    }

    const results = await linkFixer.fixBrokenLinks(scholarships);

    res.json({
      success: true,
      message: `Processed ${scholarships.length} scholarships`,
      results,
      summary: {
        total: scholarships.length,
        fixed: results.filter((r) => r.status === "fixed").length,
        alreadyValid: results.filter((r) => r.status === "already_valid")
          .length,
        notFixable: results.filter((r) => r.status === "not_fixable").length,
        errors: results.filter((r) => r.status === "error").length,
      },
    });
  } catch (error) {
    scrapingLogger.error("Fix broken links endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
