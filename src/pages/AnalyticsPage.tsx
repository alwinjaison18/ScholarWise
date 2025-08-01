import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Calendar,
  Clock,
  DollarSign,
  BookOpen,
  CheckCircle,
  Heart,
  RefreshCw,
  PieChart,
  Activity,
  Zap,
  Star,
  Globe,
} from "lucide-react";

interface AnalyticsData {
  totalScholarships: number;
  savedScholarships: number;
  appliedScholarships: number;
  successfulApplications: number;
  totalPotentialAmount: string;
  avgApplicationTime: string;
  topCategories: Array<{ name: string; count: number; percentage: number }>;
  monthlyActivity: Array<{ month: string; saved: number; applied: number }>;
  deadlineTracker: Array<{
    title: string;
    deadline: string;
    daysLeft: number;
    status: string;
  }>;
  performanceMetrics: {
    viewToSaveRate: number;
    saveToApplyRate: number;
    successRate: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    setLoading(true);

    // Simulate API call - in real app, this would fetch from backend
    setTimeout(() => {
      // Mock data based on localStorage and realistic metrics
      const savedScholarships = JSON.parse(
        localStorage.getItem("savedScholarships") || "[]"
      );

      const mockData: AnalyticsData = {
        totalScholarships: 1247,
        savedScholarships: savedScholarships.length,
        appliedScholarships: Math.floor(savedScholarships.length * 0.3),
        successfulApplications: Math.floor(savedScholarships.length * 0.1),
        totalPotentialAmount: "₹12,45,000",
        avgApplicationTime: "4.2 days",
        topCategories: [
          { name: "Merit-based", count: 156, percentage: 35 },
          { name: "Need-based", count: 124, percentage: 28 },
          { name: "Minority", count: 89, percentage: 20 },
          { name: "Sports", count: 45, percentage: 10 },
          { name: "Arts", count: 31, percentage: 7 },
        ],
        monthlyActivity: [
          { month: "Jan", saved: 12, applied: 4 },
          { month: "Feb", saved: 18, applied: 6 },
          { month: "Mar", saved: 25, applied: 8 },
          { month: "Apr", saved: 32, applied: 12 },
          { month: "May", saved: 28, applied: 10 },
          { month: "Jun", saved: 35, applied: 15 },
        ],
        deadlineTracker: savedScholarships
          .slice(0, 5)
          .map((scholarship: any, index: number) => ({
            title: scholarship.title || `Scholarship ${index + 1}`,
            deadline: scholarship.deadline || "2025-12-31",
            daysLeft: Math.floor(Math.random() * 60) + 1,
            status: Math.random() > 0.5 ? "pending" : "applied",
          })),
        performanceMetrics: {
          viewToSaveRate: 12.5,
          saveToApplyRate: 30.2,
          successRate: 8.7,
        },
      };

      setAnalyticsData(mockData);
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color: string;
    description?: string;
  }> = ({ title, value, change, icon: Icon, color, description }) => (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              change > 0
                ? "text-green-600"
                : change < 0
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {change > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : change < 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Analytics
          </h3>
          <p className="text-gray-500">Analyzing your scholarship journey...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-12 w-12 text-blue-300" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  Analytics Dashboard
                </h1>
              </div>
              <p className="text-xl text-purple-100 max-w-2xl">
                Track your scholarship journey, monitor progress, and optimize
                your application strategy with data-driven insights.
              </p>
            </div>

            <div className="flex flex-col lg:items-end gap-4">
              <div className="flex items-center gap-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="7d" className="text-gray-900">
                    Last 7 days
                  </option>
                  <option value="30d" className="text-gray-900">
                    Last 30 days
                  </option>
                  <option value="90d" className="text-gray-900">
                    Last 3 months
                  </option>
                  <option value="1y" className="text-gray-900">
                    Last year
                  </option>
                </select>
                <button
                  onClick={loadAnalyticsData}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
              <p className="text-sm text-purple-200">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Scholarships"
            value={analyticsData.totalScholarships.toLocaleString()}
            change={15.2}
            icon={Globe}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            description="Available in database"
          />
          <StatCard
            title="Saved Scholarships"
            value={analyticsData.savedScholarships}
            change={8.5}
            icon={Heart}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            description="Your bookmarked opportunities"
          />
          <StatCard
            title="Applications Submitted"
            value={analyticsData.appliedScholarships}
            change={12.3}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-green-600"
            description="Total applications sent"
          />
          <StatCard
            title="Success Rate"
            value={`${analyticsData.performanceMetrics.successRate}%`}
            change={2.1}
            icon={Award}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            description="Applications accepted"
          />
        </div>

        {/* Financial Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Financial Impact
              </h3>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-800 mb-2">
                  {analyticsData.totalPotentialAmount}
                </div>
                <div className="text-sm font-medium text-green-600">
                  Total Potential
                </div>
                <div className="text-xs text-green-500 mt-1">
                  From saved scholarships
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-800 mb-2">
                  ₹
                  {Math.floor(
                    parseInt(
                      analyticsData.totalPotentialAmount.replace(/[₹,]/g, "")
                    ) * 0.3
                  ).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-blue-600">
                  Applied For
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  Submitted applications
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="text-3xl font-bold text-purple-800 mb-2">
                  ₹
                  {Math.floor(
                    parseInt(
                      analyticsData.totalPotentialAmount.replace(/[₹,]/g, "")
                    ) * 0.087
                  ).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-purple-600">
                  Expected Return
                </div>
                <div className="text-xs text-purple-500 mt-1">
                  Based on success rate
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Performance Metrics
              </h3>
              <Target className="h-6 w-6 text-purple-600" />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    View to Save Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {analyticsData.performanceMetrics.viewToSaveRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{
                      width: `${analyticsData.performanceMetrics.viewToSaveRate}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Save to Apply Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {analyticsData.performanceMetrics.saveToApplyRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{
                      width: `${analyticsData.performanceMetrics.saveToApplyRate}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Success Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {analyticsData.performanceMetrics.successRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${analyticsData.performanceMetrics.successRate}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Category Distribution
              </h3>
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>

            <div className="space-y-4">
              {analyticsData.topCategories.map((category, index) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: [
                          "#3B82F6",
                          "#10B981",
                          "#F59E0B",
                          "#EF4444",
                          "#8B5CF6",
                        ][index],
                      }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {category.count}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Activity */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Monthly Activity
              </h3>
              <Activity className="h-6 w-6 text-blue-600" />
            </div>

            <div className="space-y-4">
              {analyticsData.monthlyActivity.map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {month.month}
                  </span>
                  <div className="flex-1 mx-4 flex gap-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(month.saved / 40) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(month.applied / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-blue-600">S: {month.saved}</span>
                    <span className="text-green-600">A: {month.applied}</span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Saved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Applied</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deadline Tracker */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Upcoming Deadlines
            </h3>
            <Calendar className="h-8 w-8 text-red-600" />
          </div>

          {analyticsData.deadlineTracker.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.deadlineTracker.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        item.daysLeft <= 7
                          ? "bg-red-100 text-red-600"
                          : item.daysLeft <= 30
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Deadline: {new Date(item.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "applied"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.status === "applied" ? "Applied" : "Pending"}
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        item.daysLeft <= 7
                          ? "text-red-600"
                          : item.daysLeft <= 30
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.daysLeft} days left
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Upcoming Deadlines
              </h4>
              <p className="text-gray-500">
                Save some scholarships to track their deadlines here.
              </p>
            </div>
          )}
        </div>

        {/* Action Items */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-8 w-8 text-yellow-300" />
            <h3 className="text-2xl font-bold">Recommended Actions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Star className="h-6 w-6 text-yellow-300 mb-3" />
              <h4 className="font-bold mb-2">Optimize Your Profile</h4>
              <p className="text-sm text-purple-100 mb-4">
                Complete your profile to match with more relevant scholarships.
              </p>
              <button className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200">
                Update Profile
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Target className="h-6 w-6 text-blue-300 mb-3" />
              <h4 className="font-bold mb-2">Apply to More Scholarships</h4>
              <p className="text-sm text-purple-100 mb-4">
                You have{" "}
                {analyticsData.savedScholarships -
                  analyticsData.appliedScholarships}{" "}
                saved scholarships pending application.
              </p>
              <button className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200">
                Start Applying
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <BookOpen className="h-6 w-6 text-green-300 mb-3" />
              <h4 className="font-bold mb-2">Explore New Categories</h4>
              <p className="text-sm text-purple-100 mb-4">
                Discover scholarships in categories you haven't explored yet.
              </p>
              <button className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200">
                Browse All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
