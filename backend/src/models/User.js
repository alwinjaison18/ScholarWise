import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  // Basic user information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password required only if not Google auth
    },
    minlength: 6,
  },

  // Profile information
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },

  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },

  // User preferences and profile
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer-not-to-say"],
  },

  // Education details
  educationLevel: {
    type: String,
    enum: ["high-school", "undergraduate", "postgraduate", "phd", "other"],
  },
  fieldOfStudy: {
    type: String,
  },
  institution: {
    type: String,
  },
  graduationYear: {
    type: Number,
  },

  // Location
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
    default: "India",
  },

  // Scholarship preferences
  interestedCategories: [
    {
      type: String,
      enum: [
        "merit-based",
        "need-based",
        "sports",
        "arts",
        "science",
        "engineering",
        "medical",
        "other",
      ],
    },
  ],

  // User activity
  savedScholarships: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scholarship",
    },
  ],
  appliedScholarships: [
    {
      scholarshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scholarship",
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["applied", "under-review", "accepted", "rejected"],
        default: "applied",
      },
      notes: String,
    },
  ],

  // Notifications and preferences
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  pushNotifications: {
    type: Boolean,
    default: true,
  },
  weeklyDigest: {
    type: Boolean,
    default: true,
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ educationLevel: 1, interestedCategories: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Get profile completion percentage
userSchema.methods.getProfileCompletion = function () {
  const fields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "dateOfBirth",
    "educationLevel",
    "fieldOfStudy",
    "institution",
    "state",
    "city",
  ];

  const completedFields = fields.filter(
    (field) => this[field] && this[field] !== ""
  );
  return Math.round((completedFields.length / fields.length) * 100);
};

// Get user's scholarship recommendations
userSchema.methods.getRecommendationCriteria = function () {
  return {
    educationLevel: this.educationLevel,
    categories: this.interestedCategories,
    state: this.state,
    fieldOfStudy: this.fieldOfStudy,
  };
};

export default mongoose.model("User", userSchema);
