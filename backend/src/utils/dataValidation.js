import Joi from "joi";

// Scholarship data validation schema
export const scholarshipSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).max(1000).required(),
  eligibility: Joi.string().min(5).max(500).required(),
  amount: Joi.string().required(),
  deadline: Joi.date().greater("now").required(),
  applicationLink: Joi.string().uri().required(),
  provider: Joi.string().min(2).max(100).required(),
  category: Joi.string()
    .valid(
      "Merit-based",
      "Need-based",
      "Sports",
      "Arts",
      "Engineering",
      "Medical",
      "Research",
      "Minority",
      "Other"
    )
    .default("Other"),
  targetGroup: Joi.array()
    .items(
      Joi.string().valid(
        "SC/ST",
        "OBC",
        "General",
        "Minority",
        "Women",
        "Disabled",
        "All"
      )
    )
    .default(["All"]),
  educationLevel: Joi.string()
    .valid("School", "Undergraduate", "Postgraduate", "Doctoral", "All")
    .default("All"),
  state: Joi.string().default("All India"),
  sourceUrl: Joi.string().uri().required(),
  isActive: Joi.boolean().default(true),
  isRealTime: Joi.boolean().default(true),
});

// Validate scraped scholarship data
export const validateScholarshipData = (data) => {
  const { error, value } = scholarshipSchema.validate(data, {
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    throw new Error(
      `Scholarship validation failed: ${error.details[0].message}`
    );
  }

  return value;
};

// Clean and normalize scholarship data
export const cleanScholarshipData = (rawData) => {
  return {
    title: rawData.title?.trim().replace(/\s+/g, " ") || "",
    description: rawData.description?.trim().replace(/\s+/g, " ") || "",
    eligibility: rawData.eligibility?.trim().replace(/\s+/g, " ") || "",
    amount: rawData.amount?.trim() || "Amount varies",
    deadline: parseDeadline(rawData.deadline),
    applicationLink:
      rawData.applicationLink?.trim() || rawData.link?.trim() || "",
    provider: rawData.provider?.trim() || "",
    sourceUrl: rawData.sourceUrl?.trim() || "",
    isRealTime: true,
    lastUpdated: new Date(),
    scrapedAt: new Date(),
  };
};

// Parse deadline from various formats
const parseDeadline = (deadlineStr) => {
  if (!deadlineStr || typeof deadlineStr !== "string") {
    // Default to 60 days from now if no deadline provided or invalid type
    return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  }

  // Try different date formats
  const formats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = deadlineStr.match(format);
    if (match) {
      let day, month, year;
      if (format === formats[0]) {
        // Assume DD/MM/YYYY for Indian context
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1; // JS months are 0-indexed
        year = parseInt(match[3]);
      } else if (format === formats[1]) {
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else {
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
      }

      const deadline = new Date(year, month, day);
      if (deadline > new Date()) {
        return deadline;
      }
    }
  }

  // If parsing fails, default to 60 days from now
  return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
};

// Check if scholarship data is duplicate
export const isDuplicateScholarship = (
  newScholarship,
  existingScholarships
) => {
  const titleWords = newScholarship.title.toLowerCase().split(" ");
  const titleKey = titleWords.slice(0, 3).join(" ");

  return existingScholarships.some((existing) => {
    const existingTitleKey = existing.title
      .toLowerCase()
      .split(" ")
      .slice(0, 3)
      .join(" ");
    return (
      existingTitleKey === titleKey &&
      existing.provider.toLowerCase() === newScholarship.provider.toLowerCase()
    );
  });
};

export default {
  scholarshipSchema,
  validateScholarshipData,
  cleanScholarshipData,
  isDuplicateScholarship,
};
