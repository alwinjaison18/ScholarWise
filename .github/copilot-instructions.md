---
applyTo: "**"
---

# Scholarship Portal Development Instructions

This is a full-stack scholarship portal application for Indian students with advanced AI-powered web scraping capabilities.

## Core Development Principles

### 1. LIVE DATA ONLY RULE

- **NEVER create, use, or suggest mock/sample/test data**
- **ALWAYS work with real scraped data from legitimate sources**
- **DELETE any existing mock data files immediately when found**
- If no live data exists, show appropriate "No data available" messages
- Use empty states with proper user guidance instead of fake data

### 2. Intelligent Web Scraping Strategy

- **Analyze website structure first** using AI-powered page analysis
- **Adapt scrapers to actual DOM structure** rather than hardcoded selectors
- **Use probability scoring** to identify scholarship content intelligently
- **Extract structured data** from unstructured content using NLP
- **MANDATORY: Validate and verify ALL scraped links** before saving to database
- **Test every application link** to ensure it leads to actual scholarship application pages
- **Verify link accessibility** - check for 404s, redirects, and broken pages
- **Validate link relevance** - ensure "Apply Now" buttons lead to correct scholarship forms
- **Implement real-time link health monitoring** with automatic cleanup of dead links
- **Implement respectful scraping** with delays and rate limiting
- **Handle dynamic content** with Puppeteer when needed

## CRITICAL: Link Validation Requirements

### 1. POST-SCRAPING LINK VERIFICATION (MANDATORY)

Every scraped scholarship MUST undergo comprehensive link validation:

```javascript
// MANDATORY: Link validation after scraping
async function validateScholarshipLinks(scholarship) {
  const validationResults = {
    applicationLinkValid: false,
    sourceUrlValid: false,
    leadsToCorrectPage: false,
    applicationFormPresent: false,
    scholarshipNameMatches: false,
    errors: [],
  };

  // Test application link accessibility
  const linkResponse = await testLinkAccessibility(scholarship.applicationLink);
  if (linkResponse.status === 200) {
    validationResults.applicationLinkValid = true;

    // Verify the link leads to correct scholarship page
    const pageContent = await analyzeLinkContent(scholarship.applicationLink);
    validationResults.leadsToCorrectPage = pageContent.containsScholarshipInfo;
    validationResults.applicationFormPresent = pageContent.hasApplicationForm;
    validationResults.scholarshipNameMatches = pageContent.titleMatches;
  }

  return validationResults;
}
```

### 2. Link Validation Standards

- **HTTP Status Verification**: All links must return 200 status code
- **Content Relevance Check**: Page content must match scholarship title/description
- **Application Form Detection**: Must contain actual application forms or registration links
- **Redirect Validation**: Follow redirects and verify final destination is valid
- **Mobile Compatibility**: Ensure links work on mobile devices
- **SSL Certificate Check**: Verify HTTPS and valid certificates for security

### 3. Link Quality Scoring

Implement AI-powered link quality assessment:

```javascript
// REQUIRED: Link quality scoring
function calculateLinkQuality(validationResults, pageContent) {
  let score = 0;

  // Accessibility (40 points)
  if (validationResults.applicationLinkValid) score += 40;

  // Relevance (30 points)
  if (validationResults.leadsToCorrectPage) score += 20;
  if (validationResults.scholarshipNameMatches) score += 10;

  // Functionality (30 points)
  if (validationResults.applicationFormPresent) score += 20;
  if (pageContent.hasContactInfo) score += 5;
  if (pageContent.hasDeadlineInfo) score += 5;

  return score; // Must be >= 70 to save scholarship
}
```

### 4. MANDATORY Link Validation Workflow

```javascript
// REQUIRED: Complete validation workflow
async function processScrapedScholarship(rawScholarship) {
  try {
    // Step 1: Basic data validation
    if (!rawScholarship.applicationLink || !rawScholarship.title) {
      throw new Error("Missing required fields");
    }

    // Step 2: MANDATORY link validation
    const linkValidation = await validateScholarshipLinks(rawScholarship);

    // Step 3: Quality scoring
    const qualityScore = calculateLinkQuality(linkValidation);

    // Step 4: Only save high-quality, verified scholarships
    if (qualityScore >= 70 && linkValidation.applicationLinkValid) {
      const enrichedScholarship = await enrichScholarshipData(rawScholarship);
      return await saveVerifiedScholarship(enrichedScholarship);
    } else {
      logger.warn(
        `Rejected scholarship: ${rawScholarship.title} - Quality score: ${qualityScore}`
      );
      return null;
    }
  } catch (error) {
    logger.error(`Validation failed: ${error.message}`);
    return null;
  }
}
```

### 5. Real-Time Link Monitoring

Implement continuous monitoring of saved links:

```javascript
// REQUIRED: Periodic link health checks
async function monitorScholarshipLinks() {
  const activeScholarships = await Scholarship.find({ isActive: true });

  for (const scholarship of activeScholarships) {
    const healthCheck = await performLinkHealthCheck(
      scholarship.applicationLink
    );

    if (!healthCheck.isHealthy) {
      // Mark as inactive or attempt link repair
      await handleBrokenLink(scholarship, healthCheck.error);
    }
  }
}

// Schedule daily link monitoring
cron.schedule("0 2 * * *", monitorScholarshipLinks); // Run at 2 AM daily
```

### 6. Link Validation Error Handling

```javascript
// REQUIRED: Comprehensive error handling for link validation
async function handleBrokenLink(scholarship, error) {
  logger.warn(`Broken link detected: ${scholarship.title} - ${error}`);

  try {
    // Attempt automatic link repair
    const repairedLink = await attemptLinkRepair(scholarship);

    if (repairedLink.success) {
      scholarship.applicationLink = repairedLink.newUrl;
      scholarship.lastValidated = new Date();
      await scholarship.save();
      logger.info(`Link repaired: ${scholarship.title}`);
    } else {
      // Mark as inactive but keep for manual review
      scholarship.isActive = false;
      scholarship.linkStatus = "broken";
      scholarship.lastValidated = new Date();
      await scholarship.save();
      logger.error(`Could not repair link: ${scholarship.title}`);
    }
  } catch (repairError) {
    logger.error(`Link repair failed: ${repairError.message}`);
  }
}
```

## AI-Powered Development Approach

### 1. Website Analysis First

- Always analyze the complete website structure before writing scrapers
- Use AI to identify content patterns and extract selectors
- Implement adaptive scraping that learns from website changes
- Create probability-based content detection

### 2. Content Intelligence

- Use NLP for text analysis and categorization
- Implement semantic similarity for duplicate detection
- Extract structured data from unstructured content
- Validate and enrich scraped data automatically

### 3. Smart Error Recovery

- Implement circuit breakers for failed scrapers
- Use fallback strategies that don't involve mock data
- Learn from failures and adapt scraping strategies
- Provide meaningful error messages to users

## File Management Rules

### Files to DELETE immediately if found:

- Any file containing mock/sample/test data
- Hardcoded scholarship data files
- Demo data generators
- Test data seeders
- Example/placeholder content files

### Required File Structure:

```
backend/
├── src/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── scrapers/         # AI-powered scrapers
│   ├── utils/            # AI analyzers, validators
│   ├── middleware/       # Auth, validation, logging
│   └── server.js         # Main server file
├── logs/                 # Application logs
└── package.json

frontend/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript definitions
│   └── assets/          # Static assets
└── package.json
```

## Performance and Scalability

### 1. Scraping Performance

- Implement concurrent scraping with rate limiting
- Use intelligent caching for frequently accessed data
- Optimize database queries with proper indexing
- Implement lazy loading for large datasets

### 2. Frontend Performance

- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Optimize images and assets
- Use code splitting for better load times

### 3. Monitoring and Analytics

- Implement comprehensive logging for all operations
- Track scraping success rates and performance metrics
- Monitor API response times and error rates
- Set up alerts for critical failures

## Security and Compliance

### 1. Data Protection

- Sanitize all user inputs and scraped content
- Implement rate limiting on APIs
- Use HTTPS for all communications
- Validate and verify all external links

### 2. Scraping Ethics

- Respect robots.txt files
- Implement proper delays between requests
- Use appropriate user agents
- Monitor for IP blocking and adapt accordingly

## Testing Strategy

### 1. Live Data Testing

- Test with real scholarship websites
- Verify data accuracy and completeness
- Test error scenarios with actual failures
- Validate link accessibility and correctness

### 2. Integration Testing

- Test complete scraping workflows
- Verify database operations with real data
- Test API endpoints with actual scraped content
- Ensure frontend handles real data scenarios

## Development Workflow

### 1. Before Writing Code

- Analyze the target website structure
- Identify the specific data requirements
- Plan the scraping strategy using AI analysis
- Design error handling and recovery mechanisms

### 2. During Development

- Write code that adapts to website changes
- Implement proper logging and monitoring
- Test with real websites and data
- Validate extracted data quality

### 3. After Implementation

- Monitor scraping success rates
- Update selectors and logic as needed
- Optimize performance based on real usage
- Maintain and improve AI models

## Quality Assurance Checklist

- [ ] No mock/sample data anywhere in the codebase
- [ ] All scrapers use intelligent, adaptive strategies
- [ ] Proper error handling and logging implemented
- [ ] **CRITICAL: All application links validated and verified working**
- [ ] **CRITICAL: Every "Apply Now" button leads to correct scholarship application**
- [ ] **CRITICAL: Link quality score >= 70 for all saved scholarships**
- [ ] **CRITICAL: Real-time link monitoring implemented**
- [ ] **CRITICAL: Broken link detection and automatic cleanup**
- [ ] Frontend handles empty states gracefully
- [ ] Database contains only live, verified data
- [ ] Performance optimizations implemented
- [ ] Security measures in place
- [ ] Code follows TypeScript best practices
- [ ] Mobile responsiveness verified

## CRITICAL Link Validation Requirements Summary

### Before Saving ANY Scholarship:

1. **Test HTTP Status**: Link must return 200 OK
2. **Verify Content Relevance**: Page content must match scholarship details
3. **Check Application Form**: Must contain actual application mechanism
4. **Test Mobile Compatibility**: Link must work on mobile devices
5. **Validate SSL/Security**: Ensure secure HTTPS connections
6. **Score Link Quality**: Must achieve minimum 70/100 quality score

### Ongoing Link Maintenance:

1. **Daily Health Checks**: Automated monitoring of all active links
2. **Broken Link Detection**: Immediate flagging of non-working links
3. **Automatic Repair**: AI-powered link fixing where possible
4. **Manual Review Queue**: Flag problematic links for human verification
5. **User Feedback Integration**: Allow users to report broken links

## When AI Should Suggest Refactoring

Immediately suggest cleanup when you detect:

- **Unvalidated links being saved to database**
- **Missing link verification in scrapers**
- **Hardcoded selectors that could break**
- Mock data being used anywhere
- Missing error handling
- Performance bottlenecks
- Security vulnerabilities
- Code duplication
- Outdated dependencies
- Missing TypeScript types

## Emergency Link Validation Protocol

If AI detects scholarships with unvalidated links:

1. **IMMEDIATE STOP**: Halt all scraping operations
2. **QUARANTINE**: Move unvalidated scholarships to review queue
3. **VALIDATE**: Run comprehensive link validation on all data
4. **CLEAN**: Remove or fix all broken/invalid links
5. **VERIFY**: Manual spot-check of fixed links
6. **RESUME**: Only restart scraping after validation is complete

Remember: This is a production scholarship portal for real Indian students. Every piece of data must be accurate, every link must work, and every feature must provide genuine value to users seeking educational opportunities.
