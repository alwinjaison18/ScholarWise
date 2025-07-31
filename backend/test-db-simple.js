const mongoose = require('mongoose');

// Create a simple schema for testing
const ScholarshipSchema = new mongoose.Schema({
  title: String,
  description: String,
  deadline: Date,
  source: String
});

const Scholarship = mongoose.model('Scholarship', ScholarshipSchema);

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/scholarship-portal');
    console.log('✅ Connected to MongoDB');
    
    // Count documents
    const count = await Scholarship.countDocuments();
    console.log(`📊 Total scholarships in database: ${count}`);
    
    // Get some sample data
    const scholarships = await Scholarship.find().limit(5).select('title source');
    console.log('📝 Sample scholarships:');
    scholarships.forEach((scholarship, index) => {
      console.log(`  ${index + 1}. ${scholarship.title} (Source: ${scholarship.source || 'Unknown'})`);
    });
    
    // Check for recent data
    const recentCount = await Scholarship.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    console.log(`🕒 Scholarships added in last 24 hours: ${recentCount}`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit();
  }
}

checkDatabase();
