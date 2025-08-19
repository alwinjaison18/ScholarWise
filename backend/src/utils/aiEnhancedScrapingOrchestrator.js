/**
 * AI-Enhanced Scraping Orchestrator
 * Coordinates website discovery, scraping, and database updates
 */

import ScholarshipDiscoveryAI from "../utils/scholarshipDiscoveryAI.js";
import RateLimitedUniversalScraper from "../utils/rateLimitedUniversalScraper.js";
import Scholarship from "../models/Scholarship.js";
import { scrapingLogger as logger } from "../utils/logger.js";
import { GeminiAIService } from "../utils/geminiAIService.js";

class AIEnhancedScrapingOrchestrator {
  constructor() {
    this.discoveryAI = new ScholarshipDiscoveryAI();
    this.universalScraper = new RateLimitedUniversalScraper();
    this.geminiAI = new GeminiAIService();

    this.isRunning = false;
    this.currentSession = null;

    this.metrics = {
      sessionsRun: 0,
      totalWebsitesDiscovered: 0,
      totalWebsitesScraped: 0,
      totalScholarshipsFound: 0,
      totalScholarshipsSaved: 0,
      averageQualityScore: 0,
      lastRunDate: null,
      bestPerformingDomains: [],
      discoverySuccessRate: 0,
      scrapingSuccessRate: 0,
    };
  }

  /**
   * Run complete AI-enhanced scraping session
   */
  async runEnhancedScrapingSession(options = {}) {
    if (this.isRunning) {
      throw new Error("Scraping session already in progress");
    }

    this.isRunning = true;
    this.currentSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      status: "starting",
      phase: "initialization",
      progress: 0,
      websites: [],
      scholarships: [],
      errors: [],
    };

    logger.info("🚀 Starting AI-Enhanced Scholarship Scraping Session");
    logger.info(`Session ID: ${this.currentSession.id}`);

    try {
      // Phase 1: AI Website Discovery
      this.currentSession.phase = "discovery";
      this.currentSession.progress = 10;
      logger.info("🔍 Phase 1: AI-Powered Website Discovery");

      const discoveryResults =
        await this.discoveryAI.discoverScholarshipWebsites(
          options.maxWebsites || 30
        );

      this.currentSession.websites = discoveryResults.qualitySites;
      this.currentSession.progress = 30;
      this.metrics.totalWebsitesDiscovered += discoveryResults.totalDiscovered;

      logger.info(
        `✅ Discovery complete: Found ${discoveryResults.qualitySites.length} high-quality websites`
      );
      logger.info(`   Government: ${discoveryResults.summary.government}`);
      logger.info(`   Private: ${discoveryResults.summary.private}`);
      logger.info(`   Educational: ${discoveryResults.summary.educational}`);
      logger.info(`   Corporate: ${discoveryResults.summary.corporate}`);

      // Phase 2: Prioritize and Prepare Scraping Targets
      this.currentSession.phase = "preparation";
      this.currentSession.progress = 40;
      logger.info("📋 Phase 2: Preparing Scraping Targets");

      const scrapingTargets =
        await this.discoveryAI.getPrioritizedScrapingTargets(
          options.maxTargets || 20
        );

      logger.info(
        `🎯 Prepared ${scrapingTargets.length} prioritized scraping targets`
      );

      // Phase 3: Rate-Limited Universal Scraping
      this.currentSession.phase = "scraping";
      this.currentSession.progress = 50;
      logger.info("🕷️ Phase 3: Rate-Limited Universal Scraping");

      const scrapingResults =
        await this.universalScraper.scrapeDiscoveredWebsites(scrapingTargets);

      this.currentSession.progress = 80;
      this.metrics.totalWebsitesScraped += scrapingResults.totalWebsites;
      this.metrics.totalScholarshipsFound += scrapingResults.scholarshipsFound;

      logger.info(`📊 Scraping Results:`);
      logger.info(`   Websites Scraped: ${scrapingResults.totalWebsites}`);
      logger.info(`   Successful: ${scrapingResults.successfulScrapes}`);
      logger.info(`   Failed: ${scrapingResults.failedScrapes}`);
      logger.info(
        `   Scholarships Found: ${scrapingResults.scholarshipsFound}`
      );
      logger.info(
        `   Valid Scholarships: ${scrapingResults.validScholarships}`
      );

      // Phase 4: Database Integration and AI Enhancement
      this.currentSession.phase = "database_integration";
      this.currentSession.progress = 85;
      logger.info("💾 Phase 4: Database Integration");

      const savedScholarships = await this.integrateWithDatabase(
        scrapingResults
      );

      this.currentSession.scholarships = savedScholarships;
      this.currentSession.progress = 95;
      this.metrics.totalScholarshipsSaved += savedScholarships.length;

      // Phase 5: Session Completion and Analytics
      this.currentSession.phase = "completion";
      this.currentSession.progress = 100;
      this.currentSession.status = "completed";
      this.currentSession.endTime = new Date();

      const sessionSummary = this.generateSessionSummary();
      this.updateGlobalMetrics(sessionSummary);

      logger.info("🎉 AI-Enhanced Scraping Session Completed Successfully!");
      logger.info(`📈 Session Summary:`);
      logger.info(`   Duration: ${sessionSummary.duration} minutes`);
      logger.info(`   New Scholarships: ${sessionSummary.newScholarships}`);
      logger.info(
        `   Updated Scholarships: ${sessionSummary.updatedScholarships}`
      );
      logger.info(
        `   Quality Score: ${sessionSummary.averageQualityScore}/100`
      );
      logger.info(`   Success Rate: ${sessionSummary.overallSuccessRate}%`);

      return {
        success: true,
        sessionId: this.currentSession.id,
        summary: sessionSummary,
        scholarships: savedScholarships,
        discoveryResults,
        scrapingResults,
      };
    } catch (error) {
      this.currentSession.status = "failed";
      this.currentSession.error = error.message;
      this.currentSession.endTime = new Date();

      logger.error("❌ AI-Enhanced Scraping Session Failed:", error);

      return {
        success: false,
        sessionId: this.currentSession.id,
        error: error.message,
        partialResults: this.currentSession.scholarships || [],
      };
    } finally {
      this.isRunning = false;
      this.currentSession = null;
    }
  }

  /**
   * Integrate scraping results with database
   */
  async integrateWithDatabase(scrapingResults) {
    const savedScholarships = [];
    let newCount = 0;
    let updatedCount = 0;

    for (const result of scrapingResults.scrapingResults) {
      if (result.status === "success" && result.scholarships.length > 0) {
        for (const scholarship of result.scholarships) {
          try {
            // Check if scholarship already exists
            const existing = await Scholarship.findOne({
              $or: [
                { title: scholarship.title, provider: scholarship.provider },
                { sourceUrl: scholarship.sourceUrl, title: scholarship.title },
                { applicationLink: scholarship.applicationLink },
              ],
            });

            if (existing) {
              // Update existing scholarship with new information
              const updated = await this.updateExistingScholarship(
                existing,
                scholarship
              );
              if (updated) {
                savedScholarships.push(updated);
                updatedCount++;
                logger.info(`🔄 Updated: ${scholarship.title}`);
              }
            } else {
              // Create new scholarship
              const newScholarship = await this.createNewScholarship(
                scholarship
              );
              if (newScholarship) {
                savedScholarships.push(newScholarship);
                newCount++;
                logger.info(`✨ New: ${scholarship.title}`);
              }
            }
          } catch (error) {
            logger.error(
              `Failed to save scholarship: ${scholarship.title}`,
              error.message
            );
            this.currentSession.errors.push({
              scholarship: scholarship.title,
              error: error.message,
            });
          }
        }
      }
    }

    logger.info(
      `💾 Database Integration Complete: ${newCount} new, ${updatedCount} updated`
    );

    return savedScholarships;
  }

  /**
   * Update existing scholarship with new data
   */
  async updateExistingScholarship(existing, newData) {
    const updateFields = {};
    let hasUpdates = false;

    // Update fields if new data is more comprehensive
    if (
      newData.description &&
      newData.description.length > existing.description.length
    ) {
      updateFields.description = newData.description;
      hasUpdates = true;
    }

    if (
      newData.amount &&
      newData.amount !== "Amount not specified" &&
      (!existing.amount || existing.amount === "Amount not specified")
    ) {
      updateFields.amount = newData.amount;
      hasUpdates = true;
    }

    if (
      newData.deadline &&
      newData.deadline !== "Deadline not specified" &&
      (!existing.deadline || existing.deadline === "Deadline not specified")
    ) {
      updateFields.deadline = newData.deadline;
      hasUpdates = true;
    }

    if (
      newData.eligibility &&
      newData.eligibility !== "Eligibility criteria not specified" &&
      (!existing.eligibility ||
        existing.eligibility === "Eligibility criteria not specified")
    ) {
      updateFields.eligibility = newData.eligibility;
      hasUpdates = true;
    }

    if (
      newData.applicationLink &&
      newData.applicationLink !== existing.applicationLink
    ) {
      updateFields.applicationLink = newData.applicationLink;
      hasUpdates = true;
    }

    if (hasUpdates) {
      updateFields.lastScraped = new Date();
      updateFields.isActive = true;

      const updated = await Scholarship.findByIdAndUpdate(
        existing._id,
        { $set: updateFields },
        { new: true }
      );

      return updated;
    }

    return null;
  }

  /**
   * Create new scholarship in database
   */
  async createNewScholarship(scholarshipData) {
    try {
      // Enhance with AI if available
      let enhancedData = scholarshipData;
      if (this.geminiAI.isEnabled()) {
        enhancedData = await this.geminiAI.enhanceScholarshipContent(
          scholarshipData
        );
      }

      // Create new scholarship
      const scholarship = new Scholarship({
        ...enhancedData,
        isActive: true,
        verified: false,
        aiEnhanced: this.geminiAI.isEnabled(),
        lastScraped: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const saved = await scholarship.save();
      return saved;
    } catch (error) {
      logger.error(
        `Failed to create scholarship: ${scholarshipData.title}`,
        error
      );
      return null;
    }
  }

  /**
   * Generate session summary
   */
  generateSessionSummary() {
    const session = this.currentSession;
    const duration = session.endTime
      ? Math.round((session.endTime - session.startTime) / 1000 / 60)
      : 0;

    const newScholarships = session.scholarships.filter(
      (s) => !s.lastScraped || s.lastScraped.getTime() === s.createdAt.getTime()
    ).length;
    const updatedScholarships = session.scholarships.length - newScholarships;

    const qualityScores = session.scholarships
      .filter((s) => s.qualityScore)
      .map((s) => s.qualityScore);
    const averageQualityScore =
      qualityScores.length > 0
        ? Math.round(
            qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
          )
        : 0;

    const overallSuccessRate =
      session.websites.length > 0
        ? Math.round(
            (session.scholarships.length / session.websites.length) * 100
          )
        : 0;

    return {
      sessionId: session.id,
      duration,
      websitesDiscovered: session.websites.length,
      scholarshipsFound: session.scholarships.length,
      newScholarships,
      updatedScholarships,
      averageQualityScore,
      overallSuccessRate,
      errors: session.errors.length,
      startTime: session.startTime,
      endTime: session.endTime,
    };
  }

  /**
   * Update global metrics
   */
  updateGlobalMetrics(sessionSummary) {
    this.metrics.sessionsRun++;
    this.metrics.lastRunDate = sessionSummary.endTime;

    // Update averages
    const totalSessions = this.metrics.sessionsRun;
    this.metrics.averageQualityScore = Math.round(
      (this.metrics.averageQualityScore * (totalSessions - 1) +
        sessionSummary.averageQualityScore) /
        totalSessions
    );

    // Track best performing domains
    const domainPerformance = new Map();
    sessionSummary.websitesDiscovered.forEach((website) => {
      if (website.domain) {
        domainPerformance.set(
          website.domain,
          (domainPerformance.get(website.domain) || 0) + 1
        );
      }
    });

    this.metrics.bestPerformingDomains = Array.from(domainPerformance.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, scholarships: count }));
  }

  /**
   * Get current session status
   */
  getCurrentSessionStatus() {
    if (!this.currentSession) {
      return { isRunning: false };
    }

    return {
      isRunning: this.isRunning,
      sessionId: this.currentSession.id,
      status: this.currentSession.status,
      phase: this.currentSession.phase,
      progress: this.currentSession.progress,
      startTime: this.currentSession.startTime,
      websitesFound: this.currentSession.websites.length,
      scholarshipsFound: this.currentSession.scholarships.length,
      errors: this.currentSession.errors.length,
    };
  }

  /**
   * Get historical metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      scrapingMetrics: this.universalScraper.getMetrics(),
      currentSession: this.getCurrentSessionStatus(),
    };
  }

  /**
   * Stop current session
   */
  async stopCurrentSession() {
    if (this.isRunning && this.currentSession) {
      this.currentSession.status = "stopped";
      this.currentSession.endTime = new Date();
      this.isRunning = false;

      logger.info(
        `🛑 Scraping session ${this.currentSession.id} stopped by user`
      );

      return {
        success: true,
        sessionId: this.currentSession.id,
        partialResults: this.currentSession.scholarships || [],
      };
    }

    return { success: false, message: "No active session to stop" };
  }

  /**
   * Run lightweight discovery for quick results
   */
  async runQuickDiscovery(maxWebsites = 10) {
    logger.info("⚡ Running Quick Discovery Session");

    try {
      const targets = await this.discoveryAI.getPrioritizedScrapingTargets(
        maxWebsites
      );
      const results = await this.universalScraper.scrapeDiscoveredWebsites(
        targets
      );

      return {
        success: true,
        websitesScraped: results.totalWebsites,
        scholarshipsFound: results.scholarshipsFound,
        validScholarships: results.validScholarships,
        duration: "Quick scan completed",
      };
    } catch (error) {
      logger.error("Quick discovery failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default AIEnhancedScrapingOrchestrator;
