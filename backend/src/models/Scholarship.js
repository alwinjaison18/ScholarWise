import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    eligibility: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    applicationLink: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Merit-based",
        "Need-based",
        "Sports",
        "Arts",
        "Engineering",
        "Medical",
        "Research",
        "Minority",
        "Other",
      ],
      default: "Other",
    },
    targetGroup: {
      type: [String],
      enum: ["SC/ST", "OBC", "General", "Minority", "Women", "Disabled", "All"],
      default: ["All"],
    },
    educationLevel: {
      type: String,
      enum: ["School", "Undergraduate", "Postgraduate", "Doctoral", "All"],
      default: "All",
    },
    state: {
      type: String,
      default: "All India",
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isRealTime: {
      type: Boolean,
      default: false,
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient searching
scholarshipSchema.index({
  title: "text",
  description: "text",
  eligibility: "text",
});
scholarshipSchema.index({ deadline: 1 });
scholarshipSchema.index({ category: 1 });
scholarshipSchema.index({ targetGroup: 1 });
scholarshipSchema.index({ educationLevel: 1 });

export default mongoose.model("Scholarship", scholarshipSchema);
