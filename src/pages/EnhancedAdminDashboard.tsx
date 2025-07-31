import React, { useState, useEffect } from "react";
import {
  Activity,
  Server,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  MemoryStick,
  Shield,
  Zap,
  Eye,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Link,
  AlertTriangle,
} from "lucide-react";
import scholarshipService from "../services/scholarshipService";

interface ScrapingStatus {
  success: boolean;
  status: {
    totalScrapers: number;
    activeScrapers: number;
    circuitBreakersOpen: number;
    scrapers: Record<
      string,
      {
        enabled: boolean;
        priority: number;
        circuitBreakerOpen: boolean;
        failureCount: number;
      }
    >;
    lastUpdate: string;
  };
  serverHealth: {
    database: boolean;
    lastScraping: string | null;
    uptime: number;
  };
  timestamp: string;
}

interface CircuitBreakerStatus {
  success: boolean;
  circuitBreakers: Record<
    string,
    {
      isOpen: boolean;
      failureCount: number;
      lastFailure: number | null;
      status: string;
    }
  >;
  timestamp: string;
}

interface SystemMetrics {
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  database: {
    connected: boolean;
    readyState: number;
  };
  timestamp: string;
}

interface HealthStatus {
  status: string;
  database: boolean;
  timestamp: string;
}

const EnhancedAdminDashboard: React.FC = () => {
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus | null>(
    null
  );
  const [circuitBreakers, setCircuitBreakers] =
    useState<CircuitBreakerStatus | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchScrapingStatus = async () => {
    try {
      const data = await scholarshipService.getScrapingStatus();
      setScrapingStatus(data);
    } catch (err) {
      console.error("Scraping status fetch error:", err);
      setError("Failed to fetch scraping status");
    }
  };

  const fetchCircuitBreakers = async () => {
    try {
      const data = await scholarshipService.getCircuitBreakerStatus();
      setCircuitBreakers(data);
    } catch (err) {
      console.error("Circuit breakers fetch error:", err);
      setError("Failed to fetch circuit breaker status");
    }
  };

  const fetchMetrics = async () => {
    try {
      const data = await scholarshipService.getSystemMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Metrics fetch error:", err);
      setError("Failed to fetch system metrics");
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
      ]);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError("Failed to fetch system data");
    } finally {
      setLoading(false);
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
    setMessage(null);
    setError(null);

    try {
      const result = await scholarshipService.resetCircuitBreakers();
      setMessage("🔄 All circuit breakers reset successfully!");
      setTimeout(fetchAllData, 1000);
    } catch (err) {
      setError(err.message || "Failed to reset circuit breakers");
      console.error("Circuit breaker reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    let interval: NodeJS.Timeout;
    if (realTimeUpdates) {
      interval = setInterval(fetchAllData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeUpdates]);

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

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes)}MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Scholarship Portal Admin
            </h1>
            <p className="text-gray-600 mt-1">
              Live monitoring and management dashboard
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Last updated: {lastUpdate}
              </span>
            </div>
            <button
              onClick={() => setRealTimeUpdates(!realTimeUpdates)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                realTimeUpdates
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {realTimeUpdates ? "Live Updates ON" : "Live Updates OFF"}
            </button>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{message}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={triggerScraping}
            disabled={scrapingLoading}
            className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all"
          >
            <Zap
              className={`h-6 w-6 ${scrapingLoading ? "animate-pulse" : ""}`}
            />
            <div className="text-left">
              <div className="font-semibold">
                {scrapingLoading
                  ? "Scraping in progress..."
                  : "Trigger Live Scraping"}
              </div>
              <div className="text-sm opacity-90">
                Fetch latest scholarships from all sources
              </div>
            </div>
          </button>

          <button
            onClick={resetCircuitBreakers}
            disabled={loading}
            className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all"
          >
            <Shield className={`h-6 w-6 ${loading ? "animate-pulse" : ""}`} />
            <div className="text-left">
              <div className="font-semibold">Reset Circuit Breakers</div>
              <div className="text-sm opacity-90">
                Reset all failed scraper protection
              </div>
            </div>
          </button>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* System Health */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Health
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {health?.status === "healthy" ? "Healthy" : "Issues"}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(health?.database || false)}
                <span className="text-sm text-gray-600">
                  Database Connected
                </span>
              </div>
            </div>
          </div>

          {/* Active Scrapers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Scrapers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {scrapingStatus?.status?.activeScrapers || 0} /{" "}
                  {scrapingStatus?.status?.totalScrapers || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    scrapingStatus?.status?.circuitBreakersOpen === 0
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {scrapingStatus?.status?.circuitBreakersOpen || 0} breakers
                  open
                </span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Memory Usage
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics ? formatMemory(metrics.memory.heapUsed) : "0MB"}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <MemoryStick className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">
                Total:{" "}
                {metrics ? formatMemory(metrics.memory.heapTotal) : "0MB"}
              </div>
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Uptime
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics ? formatUptime(metrics.uptime) : "0h 0m"}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">
                Since:{" "}
                {metrics
                  ? new Date(
                      Date.now() - metrics.uptime * 1000
                    ).toLocaleDateString()
                  : "Unknown"}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scraper Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Scraper Status
            </h3>
            <div className="space-y-3">
              {scrapingStatus?.status?.scrapers ? (
                Object.entries(scrapingStatus.status.scrapers).map(
                  ([name, status]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            status.circuitBreakerOpen
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        ></div>
                        <span className="font-medium capitalize">
                          {name.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            status.priority === 1
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          Priority {status.priority}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {status.circuitBreakerOpen ? "Offline" : "Active"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {status.failureCount} failures
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Loading scraper status...</p>
                </div>
              )}
            </div>
          </div>

          {/* Circuit Breakers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Circuit Breaker Status
            </h3>
            <div className="space-y-3">
              {circuitBreakers?.circuitBreakers ? (
                Object.entries(circuitBreakers.circuitBreakers).map(
                  ([name, breaker]) => (
                    <div
                      key={name}
                      className={`p-3 rounded-lg border ${getCircuitBreakerColor(
                        breaker.isOpen,
                        breaker.failureCount
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {breaker.isOpen ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                          <span className="font-medium capitalize">{name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {breaker.status}
                          </div>
                          <div className="text-xs opacity-75">
                            {breaker.failureCount} failures
                          </div>
                        </div>
                      </div>
                      {breaker.lastFailure && (
                        <div className="mt-2 text-xs opacity-75">
                          Last failure:{" "}
                          {new Date(breaker.lastFailure).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Loading circuit breaker status...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Scholarship Portal Admin Dashboard - Live Data Only System</p>
          <p className="mt-1">
            {realTimeUpdates
              ? "🟢 Real-time updates active"
              : "🟡 Manual refresh mode"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
