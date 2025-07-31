import express from "express";
import Scholarship from "../models/Scholarship.js";
import { triggerImmediateScraping } from "../scrapers/realTimeOrchestrator.js";

const router = express.Router();

// Get all scholarships with advanced filtering and real-time data priority
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      targetGroup,
      educationLevel,
      state,
      search,
      deadline,
      forceRefresh = false,
    } = req.query;

    const filter = { isActive: true };

    // Add filters
    if (category) filter.category = category;
    if (targetGroup) filter.targetGroup = { $in: [targetGroup] };
    if (educationLevel) filter.educationLevel = educationLevel;
    if (state && state !== "All India") filter.state = state;
    if (deadline) {
      filter.deadline = { $gte: new Date(deadline) };
    }

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { provider: { $regex: search, $options: "i" } },
      ];
    }

    let scholarships, total;

    try {
      // Check if we need fresh data
      const lastUpdate = await Scholarship.findOne(
        {},
        {},
        { sort: { lastUpdated: -1 } }
      );
      const shouldRefresh =
        forceRefresh ||
        !lastUpdate ||
        Date.now() - new Date(lastUpdate.lastUpdated).getTime() >
          6 * 60 * 60 * 1000; // 6 hours

      // Trigger real-time scraping if needed (non-blocking)
      if (shouldRefresh) {
        console.log("🔄 Triggering background real-time scraping...");
        triggerImmediateScraping().catch((error) => {
          console.error("Background scraping error:", error);
        });
      }

      // Get scholarships from database
      scholarships = await Scholarship.find(filter)
        .sort({ lastUpdated: -1, deadline: 1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      total = await Scholarship.countDocuments(filter);

      // If no scholarships found, we'll return empty array instead of mock data
      if (total === 0) {
        console.log("⚠️ No scholarships found in database");
        return res.json({
          scholarships: [],
          totalPages: 0,
          currentPage: parseInt(page),
          total: 0,
          message:
            "No scholarships found. Our scrapers are working to fetch the latest data.",
          lastUpdated: lastUpdate ? lastUpdate.lastUpdated : null,
        });
      }

      console.log(
        `✅ Serving ${scholarships.length} scholarships from database`
      );
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return res.status(500).json({
        error: "Database error",
        message: "Unable to fetch scholarships at the moment",
      });
    }

    res.json({
      scholarships,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      dataSource: "database",
      lastUpdated: scholarships.length > 0 ? scholarships[0].lastUpdated : null,
    });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Force refresh endpoint - triggers immediate real-time scraping
router.post("/refresh", async (req, res) => {
  try {
    console.log("🔥 Manual refresh triggered");
    const result = await triggerImmediateScraping();

    res.json({
      success: true,
      message: "Real-time scraping completed",
      result,
    });
  } catch (error) {
    console.error("Manual refresh error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to refresh scholarship data",
    });
  }
});

// Get scholarship by ID
router.get("/:id", async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ error: "Scholarship not found" });
    }

    res.json(scholarship);
  } catch (error) {
    console.error("Get scholarship by ID error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get scholarship statistics
router.get("/stats/overview", async (req, res) => {
  try {
    const stats = await Scholarship.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          categories: { $addToSet: "$category" },
          providers: { $addToSet: "$provider" },
          avgAmount: {
            $avg: { $toDouble: { $regex: { input: "$amount", regex: /\d+/ } } },
          },
        },
      },
    ]);

    const categoryStats = await Scholarship.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const providerStats = await Scholarship.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$provider", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const targetGroupStats = await Scholarship.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$targetGroup" },
      { $group: { _id: "$targetGroup", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const educationLevelStats = await Scholarship.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$educationLevel", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      overview: stats[0] || { total: 0, categories: [], providers: [] },
      categories: categoryStats,
      providers: providerStats,
      targetGroups: targetGroupStats,
      educationLevels: educationLevelStats,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent scholarships
router.get("/recent/latest", async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const recentScholarships = await Scholarship.find({ isActive: true })
      .sort({ lastUpdated: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select("title provider category deadline lastUpdated");

    res.json(recentScholarships);
  } catch (error) {
    console.error("Recent scholarships error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get deadline-based scholarships
router.get("/deadlines/upcoming", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date(
      Date.now() + parseInt(days) * 24 * 60 * 60 * 1000
    );

    const upcomingDeadlines = await Scholarship.find({
      isActive: true,
      deadline: { $gte: new Date(), $lte: futureDate },
    })
      .sort({ deadline: 1 })
      .limit(20)
      .select("title provider deadline amount");

    res.json(upcomingDeadlines);
  } catch (error) {
    console.error("Upcoming deadlines error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
router.get("/health/check", async (req, res) => {
  try {
    const dbConnection = await Scholarship.findOne().lean();
    const totalScholarships = await Scholarship.countDocuments({
      isActive: true,
    });
    const lastUpdate = await Scholarship.findOne(
      {},
      {},
      { sort: { lastUpdated: -1 } }
    );

    res.json({
      status: "healthy",
      database: dbConnection ? "connected" : "disconnected",
      totalScholarships,
      lastUpdate: lastUpdate ? lastUpdate.lastUpdated : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
