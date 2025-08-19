/**
 * Robust HTTP Client Utility
 * Provides SSL-bypass enabled HTTP clients for scraping
 */

import axios from "axios";
import https from "https";
import { scrapingLogger } from "./logger.js";

// Create HTTPS agent that bypasses SSL certificate verification
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureProtocol: "TLSv1_2_method",
  ciphers: "ALL",
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  maxFreeSockets: 10,
});

/**
 * Create a robust HTTP client with SSL bypass and error handling
 */
export function createRobustHttpClient(customConfig = {}) {
  const defaultConfig = {
    timeout: 30000,
    maxRedirects: 5,
    httpsAgent: httpsAgent,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      DNT: "1",
      "Upgrade-Insecure-Requests": "1",
    },
    validateStatus: function (status) {
      return status < 500; // Accept any status code less than 500
    },
  };

  const config = { ...defaultConfig, ...customConfig };
  return axios.create(config);
}

/**
 * Make a robust HTTP request with retry logic
 */
export async function robustHttpRequest(url, options = {}) {
  const {
    method = "GET",
    maxRetries = 3,
    retryDelay = 2000,
    ...axiosOptions
  } = options;

  const httpClient = createRobustHttpClient(axiosOptions);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      scrapingLogger.info(
        `🔗 HTTP ${method} ${url} (Attempt ${attempt}/${maxRetries})`
      );

      const response = await httpClient.request({
        method,
        url,
        ...axiosOptions,
      });

      // Log status
      if (response.status >= 200 && response.status < 300) {
        scrapingLogger.info(`✅ HTTP ${response.status}: ${url}`);
      } else if (response.status >= 300 && response.status < 400) {
        scrapingLogger.warn(`🔄 HTTP ${response.status} (Redirect): ${url}`);
      } else if (response.status >= 400 && response.status < 500) {
        scrapingLogger.warn(
          `⚠️ HTTP ${response.status} (Client Error): ${url}`
        );
        // For 4xx errors, still return response if it has content
        if (!response.data || response.data.length < 100) {
          throw new Error(
            `HTTP ${response.status}: ${getStatusMessage(response.status)}`
          );
        }
      }

      return response;
    } catch (error) {
      scrapingLogger.warn(
        `❌ Attempt ${attempt}/${maxRetries} failed for ${url}: ${error.message}`
      );

      if (attempt >= maxRetries) {
        throw new Error(
          `All ${maxRetries} attempts failed for ${url}: ${error.message}`
        );
      }

      // Wait before retry with exponential backoff
      const delay = Math.min(retryDelay * attempt, 10000);
      scrapingLogger.info(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Robust Puppeteer configuration for SSL bypass
 */
export function getRobustPuppeteerConfig() {
  return {
    headless: true,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--ignore-certificate-errors",
      "--ignore-ssl-errors",
      "--ignore-certificate-errors-spki-list",
      "--ignore-certificate-errors-spki-list-verify",
      "--ignore-ssl-errors-spki-list",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-sync",
      "--disable-translate",
      "--hide-scrollbars",
      "--metrics-recording-only",
      "--mute-audio",
      "--no-default-browser-check",
      "--safebrowsing-disable-auto-update",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  };
}

/**
 * Get human-readable status message
 */
function getStatusMessage(status) {
  const statusMessages = {
    200: "OK",
    201: "Created",
    301: "Moved Permanently",
    302: "Found",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return statusMessages[status] || `HTTP ${status}`;
}

/**
 * Validate if a URL is accessible
 */
export async function validateLinkRobust(url) {
  try {
    const response = await robustHttpRequest(url, {
      method: "HEAD",
      timeout: 10000,
      maxRetries: 2,
    });
    return response.status < 400;
  } catch (error) {
    scrapingLogger.warn(`Link validation failed for ${url}: ${error.message}`);
    return false;
  }
}

export default {
  createRobustHttpClient,
  robustHttpRequest,
  getRobustPuppeteerConfig,
  validateLinkRobust,
  httpsAgent,
};
