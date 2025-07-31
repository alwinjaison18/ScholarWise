import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

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
      const response = await api.get("/scholarships/deadlines/upcoming");
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
      return (
        response.data || {
          total: 0,
          active: 0,
          recentlyAdded: 0,
          averageAmount: 0,
        }
      );
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
};

export { scholarshipService };
export default scholarshipService;
