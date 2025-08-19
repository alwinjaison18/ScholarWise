import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface Scholarship {
  _id: string;
  title: string;
  description: string;
  eligibility: string;
  amount: string;
  deadline: string;
  provider: string;
  category: string;
  targetGroup: string[];
  educationLevel: string;
  state: string;
  applicationLink: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipFilters {
  category?: string;
  educationLevel?: string;
  targetGroup?: string;
  state?: string;
  search?: string;
  deadline?: string;
}

export interface ScholarshipResponse {
  scholarships: Scholarship[];
  totalPages: number;
  currentPage: number;
  total: number;
  message?: string;
  isEmpty?: boolean;
}

const scholarshipService = {
  // Get all scholarships with filters and pagination
  getScholarships: async (
    page = 1,
    limit = 10,
    filters: ScholarshipFilters = {}
  ): Promise<ScholarshipResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([, value]) => value && value.trim() !== ""
          )
        ),
      });

      const response = await api.get(`/scholarships?${params}`);

      // Handle empty results with proper messaging
      if (
        !response.data.scholarships ||
        response.data.scholarships.length === 0
      ) {
        return {
          scholarships: [],
          totalPages: 0,
          currentPage: page,
          total: 0,
          message:
            "No scholarships found. Our scrapers are continuously working to find new opportunities.",
          isEmpty: true,
        };
      }

      return {
        ...response.data,
        isEmpty: false,
      };
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      throw new Error("Failed to fetch scholarships. Please try again later.");
    }
  },

  // Get scholarship by ID with enhanced error handling
  getScholarshipById: async (id: string): Promise<Scholarship> => {
    try {
      const response = await api.get(`/scholarships/${id}`);
      if (!response.data) {
        throw new Error("Scholarship not found");
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching scholarship:", error);
      throw new Error("Scholarship not found or temporarily unavailable");
    }
  },

  // Get upcoming deadlines with fallback
  getUpcomingDeadlines: async (): Promise<Scholarship[]> => {
    try {
      const response = await api.get(
        "/scholarships/deadlines/upcoming?days=365"
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching upcoming deadlines:", error);
      return [];
    }
  },

  // Get statistics with fallback
  getStatistics: async () => {
    try {
      const response = await api.get("/scholarships/stats/overview");
      const data = response.data;
      return {
        total: data?.overview?.total || 0,
        active: data?.overview?.total || 0, // Assuming all are active for now
        recentlyAdded: 0, // Not provided by API
        averageAmount: 0, // Not provided by API
      };
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return {
        total: 0,
        active: 0,
        recentlyAdded: 0,
        averageAmount: 0,
        error: "Statistics temporarily unavailable",
      };
    }
  },

  // Enhanced scraping trigger with real-time feedback
  triggerScraping: async () => {
    try {
      // Use extended timeout for scraping (2 minutes)
      const response = await api.post(
        "/scraping/trigger",
        {},
        {
          timeout: 120000, // 2 minutes timeout for scraping
        }
      );
      return {
        success: true,
        message: response.data.message || "Scraping triggered successfully",
        result: response.data.result || {},
      };
    } catch (error: any) {
      console.error("Error triggering scraping:", error);
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Scraping is taking longer than expected. Please check the scraping status."
        );
      }
      throw new Error("Failed to trigger scraping. Please try again.");
    }
  },

  // Get real-time scraping status
  getScrapingStatus: async () => {
    try {
      const response = await api.get("/scraping/status");
      return response.data;
    } catch (error) {
      console.error("Error fetching scraping status:", error);
      return {
        success: false,
        status: {
          totalScrapers: 0,
          activeScrapers: 0,
          circuitBreakersOpen: 0,
          scrapers: {},
          lastUpdate: new Date().toISOString(),
        },
        error: "Status temporarily unavailable",
      };
    }
  },

  // Get circuit breaker status
  getCircuitBreakerStatus: async () => {
    try {
      const response = await api.get("/scraping/circuit-breakers");
      return response.data;
    } catch (error) {
      console.error("Error fetching circuit breaker status:", error);
      return {
        success: false,
        circuitBreakers: {},
        error: "Circuit breaker status unavailable",
      };
    }
  },

  // Reset circuit breakers
  resetCircuitBreakers: async () => {
    try {
      const response = await api.post("/scraping/reset-circuit-breakers");
      return {
        success: true,
        message: response.data.message || "Circuit breakers reset successfully",
      };
    } catch (error) {
      console.error("Error resetting circuit breakers:", error);
      throw new Error("Failed to reset circuit breakers. Please try again.");
    }
  },

  // Get system health
  getSystemHealth: async () => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      console.error("Error fetching system health:", error);
      return {
        status: "unhealthy",
        database: false,
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      };
    }
  },

  // Get system metrics
  getSystemMetrics: async () => {
    try {
      const response = await api.get("/metrics");
      return response.data;
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      return {
        uptime: 0,
        memory: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
        database: { connected: false, readyState: 0 },
        timestamp: new Date().toISOString(),
        error: "Metrics unavailable",
      };
    }
  },

  // === AI-Enhanced Scraping Methods ===

  // Start AI-enhanced full scraping session
  startAIEnhancedSession: async (options?: {
    maxWebsites?: number;
    maxTargets?: number;
  }) => {
    try {
      const response = await api.post(
        "/ai-enhanced/start-full-session",
        options
      );
      return response.data;
    } catch (error) {
      console.error("Error starting AI-enhanced session:", error);
      throw new Error("Failed to start AI-enhanced scraping session");
    }
  },

  // Run quick AI discovery
  runQuickDiscovery: async (maxWebsites = 10) => {
    try {
      const response = await api.post("/ai-enhanced/quick-discovery", {
        maxWebsites,
      });
      return response.data;
    } catch (error) {
      console.error("Error running quick discovery:", error);
      throw new Error("Failed to run quick discovery");
    }
  },

  // Get AI scraping session status
  getAISessionStatus: async () => {
    try {
      const response = await api.get("/ai-enhanced/session-status");
      return response.data;
    } catch (error) {
      console.error("Error getting session status:", error);
      return {
        success: false,
        status: { isRunning: false },
        error: "Failed to get session status",
      };
    }
  },

  // Stop current AI scraping session
  stopAISession: async () => {
    try {
      const response = await api.post("/ai-enhanced/stop-session");
      return response.data;
    } catch (error) {
      console.error("Error stopping AI session:", error);
      throw new Error("Failed to stop AI scraping session");
    }
  },

  // Get AI-enhanced scraping metrics
  getAIScrapingMetrics: async () => {
    try {
      const response = await api.get("/ai-enhanced/metrics");
      return response.data;
    } catch (error) {
      console.error("Error getting AI scraping metrics:", error);
      return {
        success: false,
        metrics: {
          sessionsRun: 0,
          totalWebsitesDiscovered: 0,
          totalScholarshipsFound: 0,
          averageQualityScore: 0,
        },
        error: "Failed to get metrics",
      };
    }
  },

  // Discover new scholarship websites
  discoverScholarshipWebsites: async (maxResults = 20) => {
    try {
      const response = await api.post("/ai-enhanced/discover-websites", {
        maxResults,
      });
      return response.data;
    } catch (error) {
      console.error("Error discovering websites:", error);
      throw new Error("Failed to discover new scholarship websites");
    }
  },

  // Scrape specific URLs
  scrapeSpecificUrls: async (urls: string[]) => {
    try {
      const response = await api.post("/ai-enhanced/scrape-specific-urls", {
        urls,
      });
      return response.data;
    } catch (error) {
      console.error("Error scraping specific URLs:", error);
      throw new Error("Failed to scrape specified URLs");
    }
  },

  // Get prioritized scraping targets
  getScrapingTargets: async (limit = 20) => {
    try {
      const response = await api.get(
        `/ai-enhanced/scraping-targets?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting scraping targets:", error);
      throw new Error("Failed to get scraping targets");
    }
  },

  // Get AI scraping system health
  getAIScrapingHealth: async () => {
    try {
      const response = await api.get("/ai-enhanced/health");
      return response.data;
    } catch (error) {
      console.error("Error getting AI scraping health:", error);
      return {
        success: false,
        health: {
          systemStatus: "unknown",
          aiDiscoveryEnabled: false,
          universalScrapingEnabled: false,
          rateLimitingEnabled: false,
        },
        error: "Health check failed",
      };
    }
  },

  // Schedule recurring AI scraping sessions
  scheduleAISession: async (schedule: {
    frequency: "daily" | "weekly" | "monthly";
    time: string;
    maxWebsites?: number;
    maxTargets?: number;
  }) => {
    try {
      const response = await api.post(
        "/ai-enhanced/schedule-session",
        schedule
      );
      return response.data;
    } catch (error) {
      console.error("Error scheduling AI session:", error);
      throw new Error("Failed to schedule AI scraping session");
    }
  },
};

export { scholarshipService };
export default scholarshipService;
