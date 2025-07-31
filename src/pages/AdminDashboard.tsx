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
} from "lucide-react";

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: string;
  services: {
    database: string;
    scrapers: string;
  };
  lastScraping: string | null;
  circuitBreakers: Record<
    string,
    {
      state: string;
      failureCount: number;
      lastFailureTime: number | null;
    }
  >;
  memory: {
    used: number;
    total: number;
  };
  features: Record<string, boolean>;
}

interface Metrics {
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  database: {
    connected: boolean;
    readyState: number;
  };
  timestamp: string;
}

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

interface ScholarshipStats {
  total: number;
  active: number;
  recentlyAdded: number;
  linksValidated: number;
  averageQualityScore: number;
  lastUpdate: string;
}

const AdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus | null>(
    null
  );
  const [circuitBreakers, setCircuitBreakers] =
    useState<CircuitBreakerStatus | null>(null);
  const [scholarshipStats, setScholarshipStats] =
    useState<ScholarshipStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  const API_BASE = "http://localhost:5000/api";

  const fetchHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch health status");
      console.error("Health fetch error:", err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/metrics`);
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error("Metrics fetch error:", err);
    }
  };

  const fetchScrapingStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/scraping/status`);
      const data = await response.json();
      setScrapingStatus(data);
    } catch (err) {
      console.error("Scraping status fetch error:", err);
    }
  };

  const fetchCircuitBreakers = async () => {
    try {
      const response = await fetch(`${API_BASE}/scraping/circuit-breakers`);
      const data = await response.json();
      setCircuitBreakers(data);
    } catch (err) {
      console.error("Circuit breakers fetch error:", err);
    }
  };

  const fetchScholarshipStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/scholarships/stats/overview`);
      const data = await response.json();
      setScholarshipStats(data);
    } catch (err) {
      console.error("Scholarship stats fetch error:", err);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchHealth(),
      fetchMetrics(),
      fetchScrapingStatus(),
      fetchCircuitBreakers(),
      fetchScholarshipStats(),
    ]);
  };

  const triggerScraping = async () => {
    setScrapingLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/scraping/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Scraping triggered successfully! Found ${
            data.result?.totalScholarships || 0
          } scholarships from ${data.result?.successfulScrapers || 0} sources.`
        );
        // Refresh all data after scraping
        setTimeout(() => {
          fetchAllData();
        }, 2000);
      } else {
        setError(data.error || "Scraping failed");
      }
    } catch (err) {
      setError("Failed to trigger scraping");
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
      const response = await fetch(
        `${API_BASE}/scraping/reset-circuit-breakers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("All circuit breakers reset successfully!");
        setTimeout(() => {
          fetchCircuitBreakers();
          fetchScrapingStatus();
        }, 1000);
      } else {
        setError(data.error || "Failed to reset circuit breakers");
      }
    } catch (err) {
      setError("Failed to reset circuit breakers");
      console.error("Circuit breaker reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchAllData();

    // Set up real-time updates every 30 seconds
    let interval: NodeJS.Timeout;
    if (realTimeUpdates) {
      interval = setInterval(() => {
        fetchAllData();
      }, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [realTimeUpdates]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
      case "OK":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getCircuitBreakerStatus = (state: string) => {
    switch (state) {
      case "CLOSED":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Healthy
          </span>
        );
      case "OPEN":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Failed
          </span>
        );
      case "HALF_OPEN":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Testing
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            ScholarHub Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage the scholarship scraping system
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={triggerScraping}
            disabled={scrapingLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw
              className={`h-5 w-5 ${scrapingLoading ? "animate-spin" : ""}`}
            />
            {scrapingLoading ? "Triggering..." : "Trigger Scraping"}
          </button>

          <button
            onClick={resetCircuitBreakers}
            disabled={loading}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            Reset Circuit Breakers
          </button>

          <button
            onClick={() => {
              fetchHealth();
              fetchMetrics();
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Health Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Server className="h-6 w-6 text-blue-600" />
              System Health
            </h2>

            {health ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Overall Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.status)}
                    <span
                      className={`font-medium ${
                        health.status === "OK"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {health.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.services.database)}
                    <span className="capitalize">
                      {health.services.database}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Scrapers</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.services.scrapers)}
                    <span className="capitalize">
                      {health.services.scrapers}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {health.uptime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Scraping</span>
                  <span className="text-sm">
                    {health.lastScraping
                      ? new Date(health.lastScraping).toLocaleString()
                      : "Never"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading health status...</div>
            )}
          </div>

          {/* System Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Cpu className="h-6 w-6 text-green-600" />
              System Metrics
            </h2>

            {metrics ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Memory Usage</span>
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4" />
                    <span>
                      {metrics.memory.heapUsed}MB / {metrics.memory.heapTotal}MB
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (metrics.memory.heapUsed / metrics.memory.heapTotal) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">RSS Memory</span>
                  <span>{metrics.memory.rss}MB</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">External Memory</span>
                  <span>{metrics.memory.external}MB</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database State</span>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span
                      className={
                        metrics.database.connected
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {metrics.database.connected
                        ? "Connected"
                        : "Disconnected"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading metrics...</div>
            )}
          </div>
        </div>

        {/* Circuit Breakers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-orange-600" />
            Circuit Breakers
          </h2>

          {health?.circuitBreakers ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(health.circuitBreakers).map(
                ([name, breaker]: [
                  string,
                  {
                    state: string;
                    failureCount: number;
                    lastFailureTime: number | null;
                  }
                ]) => (
                  <div
                    key={name}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">{name}</h3>
                      {getCircuitBreakerStatus(breaker.state)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Failures: {breaker.failureCount || 0}</div>
                      <div>
                        Last Failure:{" "}
                        {breaker.lastFailureTime
                          ? new Date(breaker.lastFailureTime).toLocaleString()
                          : "None"}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-gray-500">
              Loading circuit breaker status...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
