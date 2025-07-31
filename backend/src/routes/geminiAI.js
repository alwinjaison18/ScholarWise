/**
 * Gemini AI Enhanced Routes
 * Provides AI-powered endpoints for content enhancement and analysis
 */

import express from "express";
import geminiAI from "../utils/geminiAIService.js";
import aiContentAnalyzer from "../utils/aiContentAnalyzer-gemini.js";
import Scholarship from "../models/Scholarship.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Rate limiting for AI operations
import rateLimit from "express-rate-limit";

const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 AI requests per windowMs
  message: {
    error: "Too many AI requests from this IP, please try again later.",
  },
});

// Apply rate limiting to all AI routes
router.use(aiRateLimit);

// GET /api/ai/status - Get AI system status
router.get("/status", async (req, res) => {
  try {
    const geminiStatus = await geminiAI.getSystemHealthStatus();
    const analyzerHealth = aiContentAnalyzer.getSystemHealth();

    res.json({
      success: true,
      aiSystems: {
        gemini: geminiStatus,
        contentAnalyzer: analyzerHealth,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("AI status error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/ai/enhance-scholarship - Enhance a single scholarship
router.post("/enhance-scholarship", async (req, res) => {
  try {
    const { scholarshipId } = req.body;

    if (!scholarshipId) {
      return res.status(400).json({
        success: false,
        error: "Scholarship ID is required",
      });
    }

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: "Scholarship not found",
      });
    }

    logger.info(`Enhancing scholarship: ${scholarship.title}`);

    const enhanced = await geminiAI.enhanceScholarshipContent(
      scholarship.toObject()
    );

    // Update the scholarship with enhanced content
    await Scholarship.findByIdAndUpdate(scholarshipId, {
      ...enhanced,
      lastUpdated: new Date(),
    });

    res.json({
      success: true,
      message: "Scholarship enhanced successfully",
      scholarship: enhanced,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Scholarship enhancement error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/ai/validate-link - Validate a scholarship link
router.post("/validate-link", async (req, res) => {
  try {
    const { url, scholarshipTitle } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    logger.info(`Validating link: ${url}`);

    const validation = await geminiAI.validateScholarshipLink(
      url,
      scholarshipTitle
    );

    res.json({
      success: true,
      validation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Link validation error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/ai/detect-duplicates - Detect duplicate scholarships
router.post("/detect-duplicates", async (req, res) => {
  try {
    const { scholarshipIds, limit = 50 } = req.body;

    let scholarships;
    if (scholarshipIds && scholarshipIds.length > 0) {
      scholarships = await Scholarship.find({ _id: { $in: scholarshipIds } });
    } else {
      scholarships = await Scholarship.find({ isActive: true })
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    logger.info(`Checking ${scholarships.length} scholarships for duplicates`);

    const duplicates = await geminiAI.detectDuplicateScholarships(scholarships);

    res.json({
      success: true,
      duplicates,
      totalChecked: scholarships.length,
      duplicateGroups: duplicates.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Duplicate detection error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/ai/optimize-search - Optimize search query
router.post("/optimize-search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    logger.info(`Optimizing search query: ${query}`);

    const optimization = await geminiAI.optimizeSearchQuery(query);

    res.json({
      success: true,
      optimization,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Search optimization error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/ai/content-summary - Generate content summary
router.get("/content-summary", async (req, res) => {
  try {
    const { limit = 20, category, educationLevel } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (educationLevel) filters.educationLevel = educationLevel;

    const scholarships = await Scholarship.find({
      isActive: true,
      ...filters,
    })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    logger.info(`Generating summary for ${scholarships.length} scholarships`);

    const summary = await geminiAI.generateContentSummary(scholarships);

    res.json({
      success: true,
      summary,
      scholarshipsAnalyzed: scholarships.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Content summary error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/ai/bulk-enhance - Enhance multiple scholarships
router.post("/bulk-enhance", async (req, res) => {
  try {
    const { limit = 10, category, skipEnhanced = true } = req.body;

    const filters = { isActive: true };
    if (category) filters.category = category;
    if (skipEnhanced) filters.aiEnhanced = { $ne: true };

    const scholarships = await Scholarship.find(filters)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    if (scholarships.length === 0) {
      return res.json({
        success: true,
        message: "No scholarships found for enhancement",
        enhanced: 0,
      });
    }

    logger.info(`Bulk enhancing ${scholarships.length} scholarships`);

    const results = {
      total: scholarships.length,
      enhanced: 0,
      failed: 0,
      errors: [],
    };

    for (const scholarship of scholarships) {
      try {
        const enhanced = await geminiAI.enhanceScholarshipContent(
          scholarship.toObject()
        );

        await Scholarship.findByIdAndUpdate(scholarship._id, {
          ...enhanced,
          lastUpdated: new Date(),
        });

        results.enhanced++;
        logger.info(`Enhanced: ${scholarship.title}`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          scholarshipId: scholarship._id,
          title: scholarship.title,
          error: error.message,
        });
        logger.error(`Failed to enhance ${scholarship.title}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Bulk enhancement completed: ${results.enhanced}/${results.total} successful`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Bulk enhancement error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/ai/cleanup-database - Remove duplicates and invalid entries
router.post("/cleanup-database", async (req, res) => {
  try {
    const { dryRun = true } = req.body;

    logger.info(`Starting database cleanup (dry run: ${dryRun})`);

    // Find potential duplicates
    const allScholarships = await Scholarship.find({ isActive: true });
    const duplicates = await geminiAI.detectDuplicateScholarships(
      allScholarships
    );

    const results = {
      totalScholarships: allScholarships.length,
      duplicateGroups: duplicates.length,
      potentialRemovals: 0,
      actualRemovals: 0,
      errors: [],
    };

    for (const duplicateGroup of duplicates) {
      if (
        duplicateGroup.confidence > 80 &&
        duplicateGroup.recommendation === "keep_first"
      ) {
        results.potentialRemovals += duplicateGroup.scholarshipIds.length - 1;

        if (!dryRun) {
          try {
            // Keep the first scholarship, remove the rest
            const idsToRemove = duplicateGroup.scholarshipIds.slice(1);
            await Scholarship.updateMany(
              { _id: { $in: idsToRemove } },
              { isActive: false, duplicateOf: duplicateGroup.scholarshipIds[0] }
            );
            results.actualRemovals += idsToRemove.length;
          } catch (error) {
            results.errors.push({
              group: duplicateGroup.scholarshipIds,
              error: error.message,
            });
          }
        }
      }
    }

    res.json({
      success: true,
      message: dryRun
        ? "Dry run completed - no changes made"
        : "Database cleanup completed",
      dryRun,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Database cleanup error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/ai/metrics - Get AI performance metrics
router.get("/metrics", async (req, res) => {
  try {
    const analyzerMetrics = aiContentAnalyzer.getMetrics();
    const geminiStatus = await geminiAI.getSystemHealthStatus();

    const aiEnhancedCount = await Scholarship.countDocuments({
      aiEnhanced: true,
    });
    const totalScholarships = await Scholarship.countDocuments({
      isActive: true,
    });

    res.json({
      success: true,
      metrics: {
        ...analyzerMetrics,
        enhancedScholarships: aiEnhancedCount,
        totalActiveScholarships: totalScholarships,
        enhancementCoverage:
          totalScholarships > 0
            ? ((aiEnhancedCount / totalScholarships) * 100).toFixed(2) + "%"
            : "0%",
        geminiStatus: geminiStatus.status,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("AI metrics error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
