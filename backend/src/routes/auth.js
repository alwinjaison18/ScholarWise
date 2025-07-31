import express from 'express';
import User from '../models/User.js';
import { 
  generateToken, 
  generateRefreshToken, 
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyEmailToken,
  verifyPasswordResetToken,
  authenticateToken 
} from '../utils/auth.js';
import passport from '../config/passport.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// User registration
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone,
      educationLevel,
      fieldOfStudy,
      state,
      city 
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      educationLevel,
      fieldOfStudy,
      state,
      city,
      emailVerificationToken: generateEmailVerificationToken()
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// User login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    async (req, res) => {
      try {
        const user = req.user;
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Redirect to frontend with tokens
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendURL}/auth/callback?token=${token}&refresh=${refreshToken}`);
      } catch (error) {
        console.error('Google callback error:', error);
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendURL}/auth/error?message=Authentication failed`);
      }
    }
  );
} else {
  router.get('/google', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured on this server'
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured on this server'
    });
  });
}

// Google OAuth credential verification route (for @react-oauth/google)
router.post('/google/callback', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Decode the JWT token from Google
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google credential'
      });
    }

    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.profilePicture = picture;
        user.isEmailVerified = true;
        await user.save();
      } else {
        // Create new user
        user = new User({
          email: email.toLowerCase(),
          firstName: firstName || '',
          lastName: lastName || '',
          googleId,
          profilePicture: picture,
          isEmailVerified: true,
          authProvider: 'google'
        });
        await user.save();
      }
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        user,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Google OAuth verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const profileCompletion = user.getProfileCompletion();

    res.json({
      success: true,
      data: {
        user,
        profileCompletion,
        recommendationCriteria: user.getRecommendationCriteria()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.googleId;
    delete updateData.isActive;
    delete updateData.isEmailVerified;

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password (only if user has a password)
    if (user.password) {
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Logout (client-side token removal is sufficient for JWT)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Verify email (placeholder for email verification implementation)
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Verify token
    verifyEmailToken(token);

    // In a real implementation, you'd find the user by email and mark as verified
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }
});

// Request password reset
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If the email exists, a reset link will be sent'
      });
    }

    const resetToken = generatePasswordResetToken(email);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // In a real implementation, send email here
    res.json({
      success: true,
      message: 'If the email exists, a reset link will be sent',
      resetToken // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    const decoded = verifyPasswordResetToken(token);
    const user = await User.findOne({ 
      email: decoded.email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }
});

export default router;
