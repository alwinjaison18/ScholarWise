import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Activity,
  Globe,
  Heart,
  TrendingUp,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Monitor,
  Wifi,
  WifiOff,
} from "lucide-react";
import { scholarshipService } from "../services/scholarshipService";
import { formatDateTimeIndian } from "../utils/dateUtils";

interface SystemHealth {
  status: string;
  database: boolean;
  lastScrapeStatus: string;
  performance?: {
    cpuUsage: number;
    memoryUsage: number;
  };
}

interface ScrapingStatus {
  status: {
    activeScrapers: number;
    totalScrapers: number;
    circuitBreakersOpen: number;
    lastUpdate: string;
  };
  details: any[];
}

interface Metrics {
  recent24h: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
  };
  uptime: number;
}

const EnhancedAdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus | null>(
    null
  );
  const [circuitBreakers, setCircuitBreakers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // AI-Enhanced Scraping State
  const [aiSessionStatus, setAiSessionStatus] = useState<any>(null);
  const [_aiMetrics, setAiMetrics] = useState<any>(null);
  const [aiSessionLoading, setAiSessionLoading] = useState(false);
  const [quickDiscoveryLoading, setQuickDiscoveryLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (realTimeUpdates) {
      interval = setInterval(fetchAllData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeUpdates]);

  const fetchScrapingStatus = async () => {
    try {
      const data = await scholarshipService.getScrapingStatus();
      setScrapingStatus(data);
    } catch (err) {
      console.error("Scraping status fetch error:", err);
    }
  };

  const fetchCircuitBreakers = async () => {
    try {
      // Circuit breakers data - mock for now since API method doesn't exist
      setCircuitBreakers([]);
    } catch (err) {
      console.error("Circuit breakers fetch error:", err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const data = await scholarshipService.getSystemMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Metrics fetch error:", err);
    }
  };

  const fetchHealth = async () => {
    try {
      const data = await scholarshipService.getSystemHealth();
      setHealth(data);
    } catch (err) {
      console.error("Health fetch error:", err);
      setError("Failed to fetch system health");
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchScrapingStatus(),
        fetchCircuitBreakers(),
        fetchMetrics(),
        fetchHealth(),
        fetchAISessionStatus(),
        fetchAIMetrics(),
      ]);
      setLastUpdate(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setError(null);
    } catch (err) {
      setError("Failed to fetch system data");
    } finally {
      setLoading(false);
    }
  };

  // AI-Enhanced Scraping Methods
  const fetchAISessionStatus = async () => {
    try {
      const data = await scholarshipService.getAISessionStatus();
      setAiSessionStatus(data.status);
    } catch (err) {
      console.error("AI session status fetch error:", err);
    }
  };

  const fetchAIMetrics = async () => {
    try {
      const data = await scholarshipService.getAIScrapingMetrics();
      setAiMetrics(data.metrics);
    } catch (err) {
      console.error("AI metrics fetch error:", err);
    }
  };

  const startAIEnhancedSession = async () => {
    setAiSessionLoading(true);
    setMessage(
      "🤖 Starting AI-Enhanced Scraping Session... This will discover new scholarship websites and scrape them intelligently!"
    );
    setError(null);

    try {
      const result = await scholarshipService.startAIEnhancedSession({
        maxWebsites: 30,
        maxTargets: 20,
      });

      setMessage(
        `🚀 AI-Enhanced session started! Session ID: ${result.sessionId}. This will take 15-30 minutes to complete. Monitor progress below.`
      );

      // Start polling for status updates
      const statusInterval = setInterval(async () => {
        try {
          const status = await scholarshipService.getAISessionStatus();
          setAiSessionStatus(status.status);

          if (!status.status.isRunning) {
            clearInterval(statusInterval);
            fetchAllData(); // Refresh all data when session completes
            setMessage(
              "✅ AI-Enhanced scraping session completed! Check the results below."
            );
          }
        } catch (err) {
          console.error("Status polling error:", err);
        }
      }, 10000); // Poll every 10 seconds

      setTimeout(() => clearInterval(statusInterval), 30 * 60 * 1000); // Stop polling after 30 minutes
    } catch (err: any) {
      setError(err.message || "Failed to start AI-enhanced scraping session");
      console.error("AI session start error:", err);
    } finally {
      setAiSessionLoading(false);
    }
  };

  const runQuickDiscovery = async () => {
    setQuickDiscoveryLoading(true);
    setMessage(
      "⚡ Running Quick AI Discovery... Finding and scraping 10 high-priority websites!"
    );
    setError(null);

    try {
      const result = await scholarshipService.runQuickDiscovery(10);
      setMessage(
        `⚡ Quick discovery completed! Found ${
          result.result?.scholarshipsFound || 0
        } scholarships from ${result.result?.websitesScraped || 0} websites.`
      );
      setTimeout(fetchAllData, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to run quick discovery");
      console.error("Quick discovery error:", err);
    } finally {
      setQuickDiscoveryLoading(false);
    }
  };

  const triggerScraping = async () => {
    setScrapingLoading(true);
    setMessage("🚀 Starting live scraping... This may take 1-2 minutes.");
    setError(null);

    try {
      const result = await scholarshipService.triggerScraping();
      setMessage(
        `✅ Scraping completed! Found ${
          result.result?.totalScholarships || 0
        } scholarships from ${result.result?.successfulScrapers || 0}/${
          result.result?.totalScrapers || 0
        } sources.`
      );
      setTimeout(fetchAllData, 2000);
    } catch (err: any) {
      if (err.message.includes("taking longer than expected")) {
        setError(
          "⏰ Scraping is taking longer than expected. Check scraping status for progress."
        );
      } else {
        setError(err.message || "Failed to trigger scraping");
      }
      console.error("Scraping trigger error:", err);
    } finally {
      setScrapingLoading(false);
    }
  };

  const resetCircuitBreakers = async () => {
    setLoading(true);
    setMessage("🔄 Resetting circuit breakers...");
    setError(null);

    try {
      await scholarshipService.resetCircuitBreakers();
      setMessage("✅ Circuit breakers reset successfully!");
      setTimeout(fetchAllData, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to reset circuit breakers");
      console.error("Circuit breaker reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getCircuitBreakerColor = (isOpen: boolean, failureCount: number) => {
    if (isOpen) return "text-red-500 bg-red-50";
    if (failureCount > 0) return "text-yellow-500 bg-yellow-50";
    return "text-green-500 bg-green-50";
  };

  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes)}MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Monitor className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Admin Control Center
                </h1>
                <p className="text-blue-100 mt-1 text-lg">
                  Real-time system monitoring & management
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    health?.status === "healthy" ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  System {health?.status === "healthy" ? "Healthy" : "Issues"}
                </span>
              </div>

              {/* Live Updates Toggle */}
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  realTimeUpdates
                    ? "bg-green-500/20 text-green-100 border border-green-400/30"
                    : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                }`}
              >
                {realTimeUpdates ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {realTimeUpdates ? "Live Updates" : "Manual Mode"}
                </span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 border border-white/30"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Last Update Info */}
          <div className="mt-6 flex items-center gap-2 text-blue-100">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Last updated: {lastUpdate || "Never"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alert Messages with Enhanced Styling */}
        {message && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div
            onClick={triggerScraping}
            className={`group cursor-pointer p-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${
              scrapingLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-colors duration-200">
                <Zap
                  className={`h-6 w-6 ${
                    scrapingLoading
                      ? "animate-pulse"
                      : "group-hover:animate-bounce"
                  }`}
                />
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-blue-100">
                  Traditional
                </div>
                <div className="text-xs text-blue-200">Manual</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">
                {scrapingLoading ? "Scraping..." : "Traditional Scraping"}
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Run existing scrapers on known scholarship websites
              </p>
            </div>
          </div>

          <div
            onClick={startAIEnhancedSession}
            className={`group cursor-pointer p-6 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${
              aiSessionLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-colors duration-200">
                <Monitor
                  className={`h-6 w-6 ${
                    aiSessionLoading
                      ? "animate-pulse"
                      : "group-hover:animate-bounce"
                  }`}
                />
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-purple-100">
                  AI-Powered
                </div>
                <div className="text-xs text-purple-200">Full Session</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">
                {aiSessionLoading ? "AI Running..." : "AI-Enhanced Session"}
              </h3>
              <p className="text-purple-100 text-sm leading-relaxed">
                Discover new websites & scrape with AI intelligence
              </p>
              {aiSessionStatus?.isRunning && (
                <div className="text-xs text-purple-200 bg-white/10 px-2 py-1 rounded">
                  {aiSessionStatus.phase}: {aiSessionStatus.progress}%
                </div>
              )}
            </div>
          </div>

          <div
            onClick={runQuickDiscovery}
            className={`group cursor-pointer p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${
              quickDiscoveryLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-colors duration-200">
                <TrendingUp
                  className={`h-6 w-6 ${
                    quickDiscoveryLoading
                      ? "animate-pulse"
                      : "group-hover:animate-bounce"
                  }`}
                />
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-emerald-100">
                  Quick
                </div>
                <div className="text-xs text-emerald-200">Discovery</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">
                {quickDiscoveryLoading ? "Discovering..." : "Quick Discovery"}
              </h3>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Fast AI discovery & scraping of top 10 websites
              </p>
            </div>
          </div>

          <div
            onClick={resetCircuitBreakers}
            className={`group cursor-pointer p-6 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-colors duration-200">
                <Shield
                  className={`h-6 w-6 ${
                    loading ? "animate-pulse" : "group-hover:animate-bounce"
                  }`}
                />
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-orange-100">
                  System
                </div>
                <div className="text-xs text-orange-200">Recovery</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Reset Breakers</h3>
              <p className="text-orange-100 text-sm leading-relaxed">
                Reset failed scraper protection systems
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* System Status Card */}
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl border border-white/50 transition-all duration-300 hover:border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl transition-colors duration-200 ${
                    health?.status === "healthy"
                      ? "bg-green-100 text-green-600 group-hover:bg-green-200"
                      : "bg-red-100 text-red-600 group-hover:bg-red-200"
                  }`}
                >
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    System Status
                  </p>
                  <p className="text-xs text-gray-500">Core Health</p>
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  health?.status === "healthy" ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                {health?.status === "healthy" ? "Healthy" : "Issues"}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(health?.database || false)}
                  <span>Database Connected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Scrapers Card */}
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl border border-white/50 transition-all duration-300 hover:border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-600 group-hover:bg-blue-200 rounded-2xl transition-colors duration-200">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Scrapers
                  </p>
                  <p className="text-xs text-gray-500">Data Sources</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600 font-medium">Live</div>
                <div className="text-xs text-gray-500">monitoring</div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {scrapingStatus?.status?.activeScrapers || 0} /{" "}
                {scrapingStatus?.status?.totalScrapers || 0}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div
                  className={`h-2 w-2 rounded-full ${
                    scrapingStatus?.status?.circuitBreakersOpen === 0
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span>
                  {scrapingStatus?.status?.circuitBreakersOpen || 0} breakers
                  open
                </span>
              </div>
            </div>
          </div>

          {/* Recent Scholarships Card */}
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl border border-white/50 transition-all duration-300 hover:border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 rounded-2xl transition-colors duration-200">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Recent Added
                  </p>
                  <p className="text-xs text-gray-500">Last 24 Hours</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-600 font-medium">
                  Fresh
                </div>
                <div className="text-xs text-gray-500">content</div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200">
                {metrics?.recent24h || 0}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span>Auto-updated</span>
              </div>
            </div>
          </div>

          {/* System Performance Card */}
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl border border-white/50 transition-all duration-300 hover:border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 text-purple-600 group-hover:bg-purple-200 rounded-2xl transition-colors duration-200">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    System Load
                  </p>
                  <p className="text-xs text-gray-500">Performance</p>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  (health?.performance?.cpuUsage || 0) < 70
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {(health?.performance?.cpuUsage || 0) < 70 ? "Optimal" : "High"}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                {Math.round(health?.performance?.cpuUsage || 0)}%
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Monitor className="h-4 w-4 text-purple-500" />
                <span>
                  {formatMemory(health?.performance?.memoryUsage || 0)} RAM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Detailed Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scraper Status */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Scraper Status
                </h3>
                <p className="text-gray-600">
                  Real-time data collection monitoring
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {scrapingStatus?.details && scrapingStatus.details.length > 0 ? (
                scrapingStatus.details.map((scraper: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {scraper.name || `Scraper ${index + 1}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {scraper.url || "No URL specified"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(
                          scraper.status === "active" || scraper.isHealthy
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            scraper.status === "active" || scraper.isHealthy
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {scraper.status ||
                            (scraper.isHealthy ? "Active" : "Inactive")}
                        </span>
                      </div>
                    </div>
                    {scraper.lastRun && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last run: {formatDateTimeIndian(scraper.lastRun)}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No scraper data available</p>
                  <p className="text-xs mt-1">
                    Run the scraping system to see active scrapers
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Circuit Breaker Status */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Circuit Breaker Status
                </h3>
                <p className="text-gray-600">System protection monitoring</p>
              </div>
            </div>
            <div className="space-y-4">
              {circuitBreakers?.length > 0 ? (
                circuitBreakers.map((breaker: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {breaker.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Failures: {breaker.failureCount}/{breaker.threshold}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getCircuitBreakerColor(
                            breaker.isOpen,
                            breaker.failureCount
                          )}`}
                        >
                          {breaker.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </div>
                    {breaker.lastFailure && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last failure:{" "}
                        {formatDateTimeIndian(breaker.lastFailure)}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No circuit breaker data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
          <p className="font-medium">
            Scholarship Portal Admin Dashboard - Live Data Only System
          </p>
          <p className="mt-2 flex items-center justify-center gap-2">
            {realTimeUpdates ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-600">Real-time updates active</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Manual refresh mode</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
