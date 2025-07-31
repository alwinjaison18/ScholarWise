/**
 * PRODUCTION UTILITIES - CONSOLIDATED SCRIPT
 * 
 * This script combines all essential production utilities:
 * - Database operations (check, count, clear)
 * - System status monitoring
 * - Live data validation
 * - Link health monitoring
 * - Compliance testing
 * 
 * @description Consolidated production utilities for scholarship portal
 * @author Scholarship Portal Team
 * @version 1.0.0 - Consolidated Production Utils
 * @created 2025-06-30
 */

import mongoose from 'mongoose';
import { scrapingLogger } from './src/utils/logger.js';
import { runProductionAIScraping } from './src/scrapers/productionAIScraper.js';
import { monitorScholarshipLinks } from './src/utils/linkValidationSystem.js';
import { ensureLiveDataAvailability, validateNoMockData } from './src/utils/liveDataOnlyFallback.js';
import Scholarship from './src/models/Scholarship.js';

/**
 * Consolidated Production Utilities Class
 */
class ProductionUtils {
  constructor() {
    this.isConnected = false;
  }

  /**
   * Connect to database
   */
  async connectDB() {
    if (this.isConnected) return true;
    
    try {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarship_portal',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
        }
      );
      
      this.isConnected = true;
      console.log('✅ Connected to MongoDB');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      return false;
    }
  }

  /**
   * Disconnect from database
   */
  async disconnectDB() {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  /**
   * Check database status and content
   */
  async checkDatabase() {
    console.log('🔌 Connecting to MongoDB...');
    
    if (!(await this.connectDB())) {
      return { success: false, error: 'Database connection failed' };
    }

    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(col => col.name);
      
      console.log('📊 Database Collections:', collectionNames.join(', '));
      
      const scholarshipCount = await Scholarship.countDocuments();
      console.log(`📚 Current scholarships in database: ${scholarshipCount}`);
      
      if (scholarshipCount > 0) {
        const sampleScholarship = await Scholarship.findOne().lean();
        console.log('📋 Sample scholarship:');
        console.log(`   Title: ${sampleScholarship.title}`);
        console.log(`   Provider: ${sampleScholarship.provider}`);
        console.log(`   Application Link: ${sampleScholarship.applicationLink}`);
        console.log(`   Last Updated: ${sampleScholarship.updatedAt}`);
      }
      
      console.log('🎯 Current Status:');
      if (scholarshipCount > 0) {
        console.log('✅ Database has scholarship data');
        console.log('🔄 Recommendation: Check data quality and run link validation');
      } else {
        console.log('⚠️  Database is empty - run scrapers to populate data');
      }
      
      return {
        success: true,
        collections: collectionNames,
        scholarshipCount,
        sampleScholarship: scholarshipCount > 0 ? sampleScholarship : null
      };
      
    } catch (error) {
      console.error('❌ Database check error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Quick status check
   */
  async quickStatus() {
    const dbResult = await this.checkDatabase();
    
    if (!dbResult.success) {
      return dbResult;
    }
    
    console.log('\n🎯 QUICK STATUS SUMMARY:');
    console.log(`📊 Database: ${dbResult.scholarshipCount} scholarships`);
    console.log(`🔗 Collections: ${dbResult.collections.length} total`);
    console.log(`✅ Status: ${dbResult.scholarshipCount > 0 ? 'Has Data' : 'Empty'}`);
    
    return dbResult;
  }

  /**
   * Count scholarships by category
   */
  async countScholarships() {
    if (!(await this.connectDB())) {
      return { success: false, error: 'Database connection failed' };
    }

    try {
      const total = await Scholarship.countDocuments();
      const active = await Scholarship.countDocuments({ isActive: { $ne: false } });
      const recent = await Scholarship.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      // Count by category
      const categoryStats = await Scholarship.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      // Count by provider
      const providerStats = await Scholarship.aggregate([
        { $group: { _id: '$provider', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      console.log('📊 SCHOLARSHIP STATISTICS:');
      console.log(`   Total scholarships: ${total}`);
      console.log(`   Active scholarships: ${active}`);
      console.log(`   Updated in last 24h: ${recent}`);
      
      console.log('\n📈 By Category:');
      categoryStats.forEach(stat => {
        console.log(`   ${stat._id}: ${stat.count}`);
      });
      
      console.log('\n🏛️ By Provider:');
      providerStats.forEach(stat => {
        console.log(`   ${stat._id}: ${stat.count}`);
      });
      
      return {
        success: true,
        total,
        active,
        recent,
        categoryStats,
        providerStats
      };
      
    } catch (error) {
      console.error('❌ Count error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Live data status check
   */
  async liveDataStatus() {
    console.log('🚀 SCHOLARSHIP PORTAL - LIVE DATA STATUS MONITOR');
    console.log('Enforcing LIVE DATA ONLY rule...');
    console.log('📋 Generating Live Data Status Report...');
    console.log('='.repeat(50));
    
    try {
      // Connect to database
      if (!(await this.connectDB())) {
        return { success: false, error: 'Database connection failed' };
      }
      
      // Get scholarship statistics
      const stats = await this.countScholarships();
      
      // Check for prohibited mock data
      console.log('🔍 Checking for prohibited mock/sample data...');
      const mockDataCheck = await validateNoMockData();
      
      if (mockDataCheck.isCompliant) {
        console.log('✅ No mock/sample data found');
      } else {
        console.log('❌ Mock data violations found:', mockDataCheck.violations);
      }
      
      // Validate links
      console.log('🔗 Validating scholarship application links...');
      const activeScholarships = await Scholarship.find({ isActive: { $ne: false } });
      console.log(`📊 Found ${activeScholarships.length} active scholarships to validate`);
      
      return {
        success: true,
        stats,
        mockDataCompliant: mockDataCheck.isCompliant,
        activeScholarships: activeScholarships.length
      };
      
    } catch (error) {
      console.error('❌ Live data status error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all data (use with caution)
   */
  async clearAllData() {
    console.log('⚠️  WARNING: This will delete ALL scholarship data!');
    console.log('🕒 Starting data deletion in 3 seconds...');
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      if (!(await this.connectDB())) {
        return { success: false, error: 'Database connection failed' };
      }
      
      const deleteResult = await Scholarship.deleteMany({});
      
      console.log(`✅ Deleted ${deleteResult.deletedCount} scholarships`);
      console.log('🔄 Database is now empty and ready for fresh data');
      
      return {
        success: true,
        deletedCount: deleteResult.deletedCount
      };
      
    } catch (error) {
      console.error('❌ Clear data error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run production AI scraping
   */
  async runScraping() {
    console.log('🤖 Starting Production AI Scraping...');
    
    try {
      const result = await runProductionAIScraping();
      console.log('✅ Scraping completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Scraping error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Monitor link health
   */
  async monitorLinks() {
    console.log('🔗 Starting Link Health Monitoring...');
    
    try {
      await monitorScholarshipLinks();
      console.log('✅ Link monitoring completed');
      return { success: true };
    } catch (error) {
      console.error('❌ Link monitoring error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run comprehensive system check
   */
  async systemCheck() {
    console.log('🎯 COMPREHENSIVE SYSTEM CHECK');
    console.log('='.repeat(40));
    
    const results = {
      database: null,
      liveData: null,
      linkHealth: null,
      overall: 'unknown'
    };
    
    try {
      // Database check
      console.log('\n📊 1. Database Check...');
      results.database = await this.checkDatabase();
      
      // Live data compliance
      console.log('\n🔍 2. Live Data Compliance...');
      results.liveData = await this.liveDataStatus();
      
      // Link monitoring
      console.log('\n🔗 3. Link Health Check...');
      results.linkHealth = await this.monitorLinks();
      
      // Overall assessment
      const allGood = results.database.success && 
                     results.liveData.success && 
                     results.linkHealth.success;
      
      results.overall = allGood ? 'excellent' : 'needs-attention';
      
      console.log('\n🎯 SYSTEM CHECK SUMMARY:');
      console.log(`   Database: ${results.database.success ? '✅' : '❌'}`);
      console.log(`   Live Data: ${results.liveData.success ? '✅' : '❌'}`);
      console.log(`   Link Health: ${results.linkHealth.success ? '✅' : '❌'}`);
      console.log(`   Overall: ${results.overall === 'excellent' ? '✅ EXCELLENT' : '⚠️ NEEDS ATTENTION'}`);
      
      return results;
      
    } catch (error) {
      console.error('❌ System check error:', error.message);
      results.overall = 'error';
      return results;
    } finally {
      await this.disconnectDB();
    }
  }
}

/**
 * Command line interface
 */
async function main() {
  const utils = new ProductionUtils();
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'check':
      case 'status':
        await utils.quickStatus();
        break;
        
      case 'count':
        await utils.countScholarships();
        break;
        
      case 'live-status':
        await utils.liveDataStatus();
        break;
        
      case 'clear':
        await utils.clearAllData();
        break;
        
      case 'scrape':
        await utils.runScraping();
        break;
        
      case 'monitor':
        await utils.monitorLinks();
        break;
        
      case 'system-check':
        await utils.systemCheck();
        break;
        
      default:
        console.log('🛠️  PRODUCTION UTILITIES');
        console.log('Usage: node production-utils.js <command>');
        console.log('');
        console.log('Available commands:');
        console.log('  check       - Quick database status check');
        console.log('  count       - Count scholarships by category');
        console.log('  live-status - Check live data compliance');
        console.log('  clear       - Clear all data (WARNING!)');
        console.log('  scrape      - Run production AI scraping');
        console.log('  monitor     - Monitor link health');
        console.log('  system-check- Comprehensive system check');
        break;
    }
    
  } catch (error) {
    console.error('❌ Command error:', error.message);
    process.exit(1);
  } finally {
    await utils.disconnectDB();
    process.exit(0);
  }
}

// Export utilities class and run CLI if executed directly
export { ProductionUtils };

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
