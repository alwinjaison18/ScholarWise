import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware for optional authentication (doesn't require login)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Generate email verification token
export const generateEmailVerificationToken = () => {
  return jwt.sign({ type: 'email-verification' }, JWT_SECRET, { expiresIn: '24h' });
};

// Generate password reset token
export const generatePasswordResetToken = (email) => {
  return jwt.sign({ email, type: 'password-reset' }, JWT_SECRET, { expiresIn: '1h' });
};

// Verify email verification token
export const verifyEmailToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'email-verification') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired verification token');
  }
};

// Verify password reset token
export const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'password-reset') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};
