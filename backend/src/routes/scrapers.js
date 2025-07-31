import express from "express";
import { runAllScrapers } from "../scrapers/runScrapers.js";

const router = express.Router();

// Trigger manual scraping
router.post("/run", async (req, res) => {
  try {
    const result = await runAllScrapers();
    res.json({
      message: "Scraping completed",
      result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scraper status
router.get("/status", async (req, res) => {
  try {
    // In a real application, you might track scraper runs in a database
    res.json({
      status: "ready",
      lastRun: new Date().toISOString(),
      availableScrapers: [
        "scholarshipsindia",
        "vidhyaLakshmi",
        "nationalScholarshipPortal",
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
