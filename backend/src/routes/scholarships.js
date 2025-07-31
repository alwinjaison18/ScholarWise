import express from "express";
import Scholarship from "../models/Scholarship.js";
import { scrapingLogger } from "../utils/logger.js";

const router = express.Router();

// Get all scholarships with filtering and pagination
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
      filter.$text = { $search: search };
    }

    // Get data from database only
    const scholarships = await Scholarship.find(filter)
      .sort({ deadline: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Scholarship.countDocuments(filter);

    scrapingLogger.info(`Found ${total} scholarships in database`);

    res.json({
      scholarships,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    scrapingLogger.error(`Error in GET /scholarships: ${error.message}`);
    res.status(500).json({
      error: "Database error",
      message:
        "No scholarships available. Please run scrapers to populate data.",
      scholarships: [],
      total: 0,
      totalPages: 0,
      currentPage: parseInt(req.query.page || 1),
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
    scrapingLogger.error(`Error in GET /scholarships/:id: ${error.message}`);
    res
      .status(500)
      .json({ error: "Database error", message: "Scholarship not found" });
  }
});

// Get upcoming deadlines
router.get("/deadlines/upcoming", async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const scholarships = await Scholarship.find({
      isActive: true,
      deadline: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow,
      },
    })
      .sort({ deadline: 1 })
      .limit(10);

    res.json(scholarships);
  } catch (error) {
    scrapingLogger.error(
      `Error in GET /scholarships/upcoming: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get("/stats/overview", async (req, res) => {
  try {
    const totalScholarships = await Scholarship.countDocuments({
      isActive: true,
    });
    const activeDeadlines = await Scholarship.countDocuments({
      isActive: true,
      deadline: { $gte: new Date() },
    });

    const categoryCounts = await Scholarship.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalScholarships,
      activeDeadlines,
      categoryCounts,
    });
  } catch (error) {
    scrapingLogger.error(`Error in GET /scholarships/stats: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;
