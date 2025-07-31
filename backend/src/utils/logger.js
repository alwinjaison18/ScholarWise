/**
 * PRODUCTION LOGGING SYSTEM
 *
 * Comprehensive logging system for the scholarship portal with different
 * log levels, structured logging, and production-ready configuration.
 *
 * @description Production-grade logging for scholarship portal
 * @author Scholarship Portal Team
 * @version 2.0.0 - Production Ready
 * @created 2025-06-30
 */

import fs from "fs";
import path from "path";

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * Logger Class
 */
class Logger {
  constructor(name, logLevel = "INFO") {
    this.name = name;
    this.logLevel = LOG_LEVELS[logLevel] || LOG_LEVELS.INFO;
    this.logDir = path.join(process.cwd(), "logs");

    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      logger: this.name,
      message,
      ...meta,
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Write log to file
   */
  writeToFile(level, formattedMessage) {
    const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
    const logLine = formattedMessage + "\n";

    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error("Failed to write to log file:", error.message);
    }
  }

  /**
   * Log to console with colors
   */
  logToConsole(level, message, meta = {}) {
    const colors = {
      ERROR: "\x1b[31m", // Red
      WARN: "\x1b[33m", // Yellow
      INFO: "\x1b[36m", // Cyan
      DEBUG: "\x1b[35m", // Magenta
    };

    const reset = "\x1b[0m";
    const timestamp = new Date().toISOString();
    const color = colors[level] || "";

    console.log(
      `${color}[${timestamp}] ${level} [${this.name}]:${reset} ${message}`
    );

    if (Object.keys(meta).length > 0) {
      console.log(`${color}  Meta:${reset}`, meta);
    }
  }

  /**
   * Generic log method
   */
  log(level, message, meta = {}) {
    const levelValue = LOG_LEVELS[level];

    if (levelValue <= this.logLevel) {
      const formattedMessage = this.formatMessage(level, message, meta);

      // Log to console
      this.logToConsole(level, message, meta);

      // Log to file
      this.writeToFile(level, formattedMessage);
    }
  }

  /**
   * Error logging
   */
  error(message, meta = {}) {
    this.log("ERROR", message, meta);
  }

  /**
   * Warning logging
   */
  warn(message, meta = {}) {
    this.log("WARN", message, meta);
  }

  /**
   * Info logging
   */
  info(message, meta = {}) {
    this.log("INFO", message, meta);
  }

  /**
   * Debug logging
   */
  debug(message, meta = {}) {
    this.log("DEBUG", message, meta);
  }
}

// Create logger instances
const mainLogger = new Logger("MAIN");
const scrapingLogger = new Logger("SCRAPING");
const apiLogger = new Logger("API");
const validationLogger = new Logger("VALIDATION");

// Export loggers
export { mainLogger as logger, scrapingLogger, apiLogger, validationLogger };
export default mainLogger;
