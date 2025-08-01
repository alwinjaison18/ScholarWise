import express from "express";
import User from "../models/User.js";
import Scholarship from "../models/Scholarship.js";
import { authenticateToken, optionalAuth } from "../utils/auth.js";

const router = express.Router();

// Get user's saved scholarships
router.get("/saved-scholarships", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("savedScholarships")
      .select("savedScholarships");

    res.json({
      success: true,
      data: {
        savedScholarships: user.savedScholarships,
        count: user.savedScholarships.length,
      },
    });
  } catch (error) {
    console.error("Get saved scholarships error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get saved scholarships",
      error: error.message,
    });
  }
});

// Save a scholarship
router.post(
  "/save-scholarship/:scholarshipId",
  authenticateToken,
  async (req, res) => {
    try {
      const { scholarshipId } = req.params;
      const userId = req.user._id;

      // Check if scholarship exists
      const scholarship = await Scholarship.findById(scholarshipId);
      if (!scholarship) {
        return res.status(404).json({
          success: false,
          message: "Scholarship not found",
        });
      }

      // Check if already saved
      const user = await User.findById(userId);
      if (user.savedScholarships.includes(scholarshipId)) {
        return res.status(400).json({
          success: false,
          message: "Scholarship already saved",
        });
      }

      // Add to saved scholarships
      user.savedScholarships.push(scholarshipId);
      await user.save();

      res.json({
        success: true,
        message: "Scholarship saved successfully",
      });
    } catch (error) {
      console.error("Save scholarship error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save scholarship",
        error: error.message,
      });
    }
  }
);

// Remove saved scholarship
router.delete(
  "/save-scholarship/:scholarshipId",
  authenticateToken,
  async (req, res) => {
    try {
      const { scholarshipId } = req.params;
      const userId = req.user._id;

      const user = await User.findById(userId);
      user.savedScholarships = user.savedScholarships.filter(
        (id) => id.toString() !== scholarshipId
      );
      await user.save();

      res.json({
        success: true,
        message: "Scholarship removed from saved list",
      });
    } catch (error) {
      console.error("Remove saved scholarship error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove saved scholarship",
        error: error.message,
      });
    }
  }
);

// Get user's applied scholarships
router.get("/applied-scholarships", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("appliedScholarships.scholarshipId")
      .select("appliedScholarships");

    res.json({
      success: true,
      data: {
        appliedScholarships: user.appliedScholarships,
        count: user.appliedScholarships.length,
      },
    });
  } catch (error) {
    console.error("Get applied scholarships error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get applied scholarships",
      error: error.message,
    });
  }
});

// Mark scholarship as applied
router.post(
  "/apply-scholarship/:scholarshipId",
  authenticateToken,
  async (req, res) => {
    try {
      const { scholarshipId } = req.params;
      const { notes } = req.body;
      const userId = req.user._id;

      // Check if scholarship exists
      const scholarship = await Scholarship.findById(scholarshipId);
      if (!scholarship) {
        return res.status(404).json({
          success: false,
          message: "Scholarship not found",
        });
      }

      const user = await User.findById(userId);

      // Check if already applied
      const alreadyApplied = user.appliedScholarships.some(
        (app) => app.scholarshipId.toString() === scholarshipId
      );

      if (alreadyApplied) {
        return res.status(400).json({
          success: false,
          message: "Already applied to this scholarship",
        });
      }

      // Add to applied scholarships
      user.appliedScholarships.push({
        scholarshipId,
        appliedAt: new Date(),
        status: "applied",
        notes,
      });

      await user.save();

      res.json({
        success: true,
        message: "Scholarship application recorded successfully",
      });
    } catch (error) {
      console.error("Apply scholarship error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to record scholarship application",
        error: error.message,
      });
    }
  }
);

// Update application status
router.put(
  "/applied-scholarship/:scholarshipId",
  authenticateToken,
  async (req, res) => {
    try {
      const { scholarshipId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user._id;

      const user = await User.findById(userId);
      const application = user.appliedScholarships.find(
        (app) => app.scholarshipId.toString() === scholarshipId
      );

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      if (status) application.status = status;
      if (notes !== undefined) application.notes = notes;

      await user.save();

      res.json({
        success: true,
        message: "Application updated successfully",
      });
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update application",
        error: error.message,
      });
    }
  }
);

// Get personalized scholarship recommendations
router.get("/recommendations", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const criteria = user.getRecommendationCriteria();

    // Build query based on user preferences
    const query = {
      isActive: true,
    };

    if (criteria.educationLevel) {
      query.educationLevel = { $in: [criteria.educationLevel, "all"] };
    }

    if (criteria.categories && criteria.categories.length > 0) {
      query.category = { $in: criteria.categories };
    }

    if (criteria.state) {
      query.$or = [
        { targetStates: { $in: [criteria.state] } },
        { targetStates: { $size: 0 } },
        { targetStates: { $exists: false } },
      ];
    }

    // Get recommendations
    const recommendations = await Scholarship.find(query)
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        criteria,
      },
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
      error: error.message,
    });
  }
});

// Search scholarships with user context
router.get("/search", optionalAuth, async (req, res) => {
  try {
    const {
      q,
      category,
      educationLevel,
      amount,
      deadline,
      state,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Education level filter
    if (educationLevel) {
      query.educationLevel = { $in: [educationLevel, "all"] };
    }

    // Amount filter
    if (amount) {
      const amountNum = parseInt(amount);
      query.$or = [
        { amountNumber: { $gte: amountNum } },
        { amount: { $regex: amount, $options: "i" } },
      ];
    }

    // Deadline filter
    if (deadline) {
      query.deadline = { $gte: new Date(deadline) };
    }

    // State filter
    if (state) {
      query.$or = [
        { targetStates: { $in: [state] } },
        { targetStates: { $size: 0 } },
        { targetStates: { $exists: false } },
      ];
    }

    const skip = (page - 1) * limit;

    const scholarships = await Scholarship.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ relevanceScore: -1, createdAt: -1 });

    const total = await Scholarship.countDocuments(query);

    // Add user-specific data if authenticated
    let userSavedIds = [];
    let userAppliedIds = [];

    if (req.user) {
      const user = await User.findById(req.user._id).select(
        "savedScholarships appliedScholarships"
      );

      userSavedIds = user.savedScholarships.map((id) => id.toString());
      userAppliedIds = user.appliedScholarships.map((app) =>
        app.scholarshipId.toString()
      );
    }

    const scholarshipsWithUserData = scholarships.map((scholarship) => ({
      ...scholarship.toObject(),
      isSaved: userSavedIds.includes(scholarship._id.toString()),
      isApplied: userAppliedIds.includes(scholarship._id.toString()),
    }));

    res.json({
      success: true,
      data: {
        scholarships: scholarshipsWithUserData,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Search scholarships error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search scholarships",
      error: error.message,
    });
  }
});

// Get user dashboard data
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("savedScholarships")
      .populate("appliedScholarships.scholarshipId");

    const criteria = user.getRecommendationCriteria();

    // Get recent recommendations
    const recentRecommendations = await Scholarship.find({
      isActive: true,
      educationLevel: { $in: [criteria.educationLevel, "all"] },
    })
      .limit(5)
      .sort({ createdAt: -1 });

    // Get deadlines coming up
    const upcomingDeadlines = await Scholarship.find({
      _id: { $in: user.savedScholarships },
      deadline: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    }).sort({ deadline: 1 });

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          profileCompletion: user.getProfileCompletion(),
        },
        stats: {
          savedCount: user.savedScholarships.length,
          appliedCount: user.appliedScholarships.length,
          pendingApplications: user.appliedScholarships.filter(
            (app) => app.status === "applied" || app.status === "under-review"
          ).length,
        },
        recentRecommendations,
        upcomingDeadlines,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: error.message,
    });
  }
});

// Update notification preferences
router.put("/notifications", authenticateToken, async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, weeklyDigest } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        emailNotifications,
        pushNotifications,
        weeklyDigest,
        updatedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Notification preferences updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
      error: error.message,
    });
  }
});

export default router;
