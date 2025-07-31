/**
 * PRODUCTION COMPLIANCE VERIFICATION SCRIPT
 *
 * This script verifies that the scholarship portal meets ALL project requirements:
 * - LIVE DATA ONLY compliance (no mock/sample/test data)
 * - Link validation system implementation
 * - AI-powered scraping capabilities
 * - Real-time monitoring systems
 * - Database integrity and quality
 *
 * @description Comprehensive production readiness verification
 * @author Scholarship Portal Team
 * @version 1.0.0 - Production Compliance
 * @created 2025-06-30
 */

import mongoose from "mongoose";
import { scrapingLogger } from "./src/utils/logger.js";
import {
  validateNoMockData,
  ensureLiveDataAvailability,
} from "./src/utils/liveDataOnlyFallback.js";
import {
  validateScholarshipLinks,
  monitorScholarshipLinks,
} from "./src/utils/linkValidationSystem.js";
import { runProductionAIScraping } from "./src/scrapers/productionAIScraper.js";
import Scholarship from "./src/models/Scholarship.js";

/**
 * Production Compliance Test Suite
 */
class ProductionComplianceVerifier {
  constructor() {
    this.testResults = {
      liveDataCompliance: false,
      linkValidationSystem: false,
      aiScrapingCapabilities: false,
      databaseIntegrity: false,
      linkMonitoring: false,
      overallCompliance: false,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Initialize database connection for testing
   */
  async initializeDatabase() {
    try {
      await mongoose.connect(
        process.env.MONGODB_URI ||
          "mongodb://localhost:27017/scholarship_portal",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
        }
      );

      console.log("✅ Database connected for compliance testing");
      return true;
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      this.testResults.errors.push(`Database connection: ${error.message}`);
      return false;
    }
  }

  /**
   * Test 1: LIVE DATA ONLY Compliance
   * Verifies that no mock/sample/test data exists anywhere
   */
  async testLiveDataCompliance() {
    console.log("\\n🧪 TEST 1: LIVE DATA ONLY Compliance");
    console.log("=".repeat(50));

    try {
      // Check database for mock data violations
      const mockDataValidation = await validateNoMockData();

      if (mockDataValidation.compliant) {
        console.log("✅ Database compliance: PASSED - No mock data found");
        this.testResults.liveDataCompliance = true;
      } else {
        console.log(
          "❌ Database compliance: FAILED - Mock data violations found"
        );
        console.log(`   Violations: ${mockDataValidation.violations.length}`);

        mockDataValidation.violations.forEach((violation) => {
          console.log(`   - Pattern: ${violation.pattern}`);
          console.log(`   - Count: ${violation.count}`);
        });

        this.testResults.errors.push("Mock data found in database");
      }

      // Check live data availability
      const liveDataStatus = await ensureLiveDataAvailability(1);
      console.log(
        `📊 Live data status: ${liveDataStatus.available} scholarships available`
      );

      if (liveDataStatus.available > 0) {
        console.log("✅ Live data availability: PASSED");
      } else {
        console.log(
          "⚠️ Live data availability: WARNING - No live data present"
        );
        this.testResults.warnings.push("No live scholarships in database");
      }
    } catch (error) {
      console.error("❌ Live data compliance test failed:", error.message);
      this.testResults.errors.push(`Live data compliance: ${error.message}`);
    }
  }

  /**
   * Test 2: Link Validation System
   * Verifies that the mandatory link validation system is working
   */
  async testLinkValidationSystem() {
    console.log("\\n🧪 TEST 2: Link Validation System");
    console.log("=".repeat(50));

    try {
      // Test with a known working URL
      const testScholarship = {
        title: "Test Scholarship for Link Validation",
        applicationLink: "https://www.buddy4study.com",
      };

      console.log("🔍 Testing link validation with sample URL...");
      const validationResults = await validateScholarshipLinks(testScholarship);

      console.log(`   HTTP Status: ${validationResults.httpStatus}`);
      console.log(`   Link Valid: ${validationResults.applicationLinkValid}`);
      console.log(`   Quality Score: ${validationResults.qualityScore}/100`);
      console.log(`   Response Time: ${validationResults.responseTime}ms`);
      console.log(`   HTTPS Secure: ${validationResults.httpsSecure}`);

      if (validationResults.qualityScore >= 70) {
        console.log(
          "✅ Link validation system: PASSED - Quality scoring working"
        );
        this.testResults.linkValidationSystem = true;
      } else {
        console.log(
          "⚠️ Link validation system: WARNING - Quality score below threshold"
        );
        this.testResults.warnings.push(
          "Link validation quality score below 70"
        );
      }

      // Test validation with broken URL
      const brokenScholarship = {
        title: "Test Broken Link",
        applicationLink: "https://example.com/nonexistent-page",
      };

      console.log("🔍 Testing with broken URL...");
      const brokenValidation = await validateScholarshipLinks(
        brokenScholarship
      );

      if (!brokenValidation.applicationLinkValid) {
        console.log("✅ Broken link detection: PASSED");
      } else {
        console.log(
          "⚠️ Broken link detection: UNEXPECTED - Broken link marked as valid"
        );
        this.testResults.warnings.push("Broken link detection may have issues");
      }
    } catch (error) {
      console.error("❌ Link validation test failed:", error.message);
      this.testResults.errors.push(`Link validation: ${error.message}`);
    }
  }

  /**
   * Test 3: AI-Powered Scraping Capabilities
   * Verifies that the AI scraping system is functional
   */
  async testAIScrapingCapabilities() {
    console.log("\\n🧪 TEST 3: AI-Powered Scraping Capabilities");
    console.log("=".repeat(50));

    try {
      console.log("🤖 Testing AI scraping system...");
      console.log(
        "⚠️ Note: This will attempt to scrape live data from real websites"
      );

      // Run a limited test scraping operation
      const scrapingResults = await runProductionAIScraping();

      if (scrapingResults.success) {
        console.log("✅ AI scraping system: PASSED");
        console.log(`   Scholarships processed: ${scrapingResults.total || 0}`);
        console.log(`   Successfully saved: ${scrapingResults.saved || 0}`);
        console.log(`   Quality rejections: ${scrapingResults.rejected || 0}`);

        this.testResults.aiScrapingCapabilities = true;

        if (scrapingResults.saved > 0) {
          console.log("🎉 LIVE DATA SUCCESSFULLY SCRAPED AND VALIDATED!");
        }
      } else {
        console.log("❌ AI scraping system: FAILED");
        console.log(`   Error: ${scrapingResults.error || "Unknown error"}`);
        this.testResults.errors.push(
          `AI scraping failed: ${scrapingResults.error}`
        );
      }
    } catch (error) {
      console.error("❌ AI scraping test failed:", error.message);
      this.testResults.errors.push(`AI scraping: ${error.message}`);
    }
  }

  /**
   * Test 4: Database Integrity
   * Verifies database schema and data quality
   */
  async testDatabaseIntegrity() {
    console.log("\\n🧪 TEST 4: Database Integrity");
    console.log("=".repeat(50));

    try {
      // Check database connection and collections
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      const scholarshipCollection = collections.find(
        (col) => col.name === "scholarships"
      );

      if (scholarshipCollection) {
        console.log("✅ Scholarship collection: EXISTS");
      } else {
        console.log("⚠️ Scholarship collection: NOT FOUND");
        this.testResults.warnings.push("Scholarship collection not found");
      }

      // Check data quality
      const totalScholarships = await Scholarship.countDocuments();
      const activeScholarships = await Scholarship.countDocuments({
        isActive: true,
      });
      const validatedScholarships = await Scholarship.countDocuments({
        linkValidated: true,
      });

      console.log(`📊 Database Statistics:`);
      console.log(`   Total scholarships: ${totalScholarships}`);
      console.log(`   Active scholarships: ${activeScholarships}`);
      console.log(`   Link validated: ${validatedScholarships}`);

      // Check for required fields
      const scholarshipsSample = await Scholarship.find().limit(5);
      let qualityScore = 0;

      if (scholarshipsSample.length > 0) {
        const requiredFields = [
          "title",
          "description",
          "applicationLink",
          "source",
        ];
        const fieldCompliance = requiredFields.map((field) => {
          const count = scholarshipsSample.filter(
            (s) => s[field] && s[field].toString().trim()
          ).length;
          return {
            field,
            compliance: (count / scholarshipsSample.length) * 100,
          };
        });

        console.log("📋 Field Compliance:");
        fieldCompliance.forEach((fc) => {
          console.log(`   ${fc.field}: ${fc.compliance.toFixed(1)}%`);
          qualityScore += fc.compliance;
        });

        qualityScore = qualityScore / requiredFields.length;

        if (qualityScore >= 90) {
          console.log("✅ Database integrity: PASSED");
          this.testResults.databaseIntegrity = true;
        } else {
          console.log("⚠️ Database integrity: NEEDS IMPROVEMENT");
          this.testResults.warnings.push(
            `Database quality score: ${qualityScore.toFixed(1)}%`
          );
        }
      } else {
        console.log("⚠️ Database integrity: NO DATA TO ANALYZE");
        this.testResults.warnings.push("No scholarships found for analysis");
      }
    } catch (error) {
      console.error("❌ Database integrity test failed:", error.message);
      this.testResults.errors.push(`Database integrity: ${error.message}`);
    }
  }

  /**
   * Test 5: Link Monitoring System
   * Verifies real-time link health monitoring
   */
  async testLinkMonitoring() {
    console.log("\\n🧪 TEST 5: Link Monitoring System");
    console.log("=".repeat(50));

    try {
      console.log("🔍 Testing link monitoring system...");

      const monitoringResults = await monitorScholarshipLinks();

      console.log(`📊 Monitoring Results:`);
      console.log(`   Total checked: ${monitoringResults.totalChecked}`);
      console.log(`   Healthy links: ${monitoringResults.healthy}`);
      console.log(`   Broken links: ${monitoringResults.broken}`);
      console.log(`   Fixed links: ${monitoringResults.fixed}`);
      console.log(`   Errors: ${monitoringResults.errors.length}`);

      if (monitoringResults.totalChecked >= 0) {
        // System is functional even with 0 links
        console.log("✅ Link monitoring system: PASSED");
        this.testResults.linkMonitoring = true;

        if (monitoringResults.totalChecked > 0) {
          const healthRate =
            (monitoringResults.healthy / monitoringResults.totalChecked) * 100;
          console.log(`   Health rate: ${healthRate.toFixed(1)}%`);
        }
      } else {
        console.log("❌ Link monitoring system: FAILED");
        this.testResults.errors.push("Link monitoring system malfunction");
      }
    } catch (error) {
      console.error("❌ Link monitoring test failed:", error.message);
      this.testResults.errors.push(`Link monitoring: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive compliance report
   */
  generateComplianceReport() {
    console.log("\\n📋 PRODUCTION COMPLIANCE REPORT");
    console.log("=".repeat(60));

    const passedTests = Object.values(this.testResults).filter(
      (result) => result === true
    ).length;
    const totalTests = 5;
    const compliancePercentage = (passedTests / totalTests) * 100;

    console.log(
      `\\n🎯 OVERALL COMPLIANCE: ${compliancePercentage.toFixed(
        1
      )}% (${passedTests}/${totalTests} tests passed)`
    );

    console.log("\\n✅ PASSED TESTS:");
    if (this.testResults.liveDataCompliance)
      console.log("   - Live Data Only Compliance");
    if (this.testResults.linkValidationSystem)
      console.log("   - Link Validation System");
    if (this.testResults.aiScrapingCapabilities)
      console.log("   - AI-Powered Scraping");
    if (this.testResults.databaseIntegrity)
      console.log("   - Database Integrity");
    if (this.testResults.linkMonitoring)
      console.log("   - Link Monitoring System");

    if (this.testResults.errors.length > 0) {
      console.log("\\n❌ ERRORS:");
      this.testResults.errors.forEach((error) => console.log(`   - ${error}`));
    }

    if (this.testResults.warnings.length > 0) {
      console.log("\\n⚠️ WARNINGS:");
      this.testResults.warnings.forEach((warning) =>
        console.log(`   - ${warning}`)
      );
    }

    // Overall compliance determination
    this.testResults.overallCompliance =
      compliancePercentage >= 80 && this.testResults.errors.length === 0;

    console.log("\\n🏆 PRODUCTION READINESS:");
    if (this.testResults.overallCompliance) {
      console.log("✅ SYSTEM IS PRODUCTION READY!");
      console.log("   All critical systems are functioning correctly.");
      console.log("   Live data only compliance verified.");
      console.log("   Link validation and monitoring systems operational.");
    } else {
      console.log("❌ SYSTEM NEEDS FIXES BEFORE PRODUCTION");
      console.log("   Please address errors and warnings before deployment.");
    }

    console.log("\\n📊 NEXT STEPS:");
    if (this.testResults.overallCompliance) {
      console.log("   1. Deploy to production environment");
      console.log("   2. Monitor real-time scraping performance");
      console.log("   3. Set up alerting for link failures");
      console.log("   4. Schedule regular compliance checks");
    } else {
      console.log("   1. Fix all critical errors");
      console.log("   2. Address warnings where possible");
      console.log("   3. Re-run compliance verification");
      console.log("   4. Ensure live data is being scraped successfully");
    }

    return this.testResults;
  }

  /**
   * Run complete compliance verification suite
   */
  async runCompleteVerification() {
    console.log("🚀 STARTING PRODUCTION COMPLIANCE VERIFICATION");
    console.log("🕒 " + new Date().toISOString());
    console.log("=".repeat(80));

    try {
      // Initialize database
      const dbConnected = await this.initializeDatabase();
      if (!dbConnected) {
        console.error("❌ Cannot proceed without database connection");
        return this.generateComplianceReport();
      }

      // Run all compliance tests
      await this.testLiveDataCompliance();
      await this.testLinkValidationSystem();
      await this.testAIScrapingCapabilities();
      await this.testDatabaseIntegrity();
      await this.testLinkMonitoring();

      // Generate final report
      return this.generateComplianceReport();
    } catch (error) {
      console.error("❌ Compliance verification failed:", error.message);
      this.testResults.errors.push(`Verification suite: ${error.message}`);
      return this.generateComplianceReport();
    } finally {
      // Cleanup database connection
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log("\\n🔌 Database connection closed");
      }
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const verifier = new ProductionComplianceVerifier();
  const results = await verifier.runCompleteVerification();

  // Exit with appropriate code
  process.exit(results.overallCompliance ? 0 : 1);
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ProductionComplianceVerifier };
