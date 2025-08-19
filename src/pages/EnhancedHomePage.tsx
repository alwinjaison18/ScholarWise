import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Clock,
  BookOpen,
  Globe,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Target,
  Zap,
  Award,
  ArrowRight,
  Star,
  Heart,
  Calendar,
  MapPin,
  GraduationCap,
  CheckCircle,
  Eye,
  Bookmark,
  Shield,
} from "lucide-react";
import type { Scholarship } from "../services/scholarshipService";
import { scholarshipService } from "../services/scholarshipService";
import { useAuth } from "../contexts/AuthContext";
import { formatDeadlineDisplay } from "../utils/dateUtils";

const EnhancedHomePage: React.FC = () => {
  const [featuredScholarships, setFeaturedScholarships] = useState<
    Scholarship[]
  >([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Scholarship[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    recentlyAdded: 0,
    averageAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [scholarshipResponse, deadlines, statistics] = await Promise.all([
        scholarshipService.getScholarships(1, 6),
        scholarshipService.getUpcomingDeadlines(),
        scholarshipService.getStatistics(),
      ]);

      setFeaturedScholarships(scholarshipResponse.scholarships || []);
      setUpcomingDeadlines(deadlines || []);
      setStats(
        statistics || {
          total: 0,
          active: 0,
          recentlyAdded: 0,
          averageAmount: 0,
        }
      );
    } catch (err) {
      setError(
        "Unable to load latest scholarship data. Please try again later."
      );
      console.error("Homepage data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const numAmount = parseInt(amount.replace(/[^\d]/g, ""));
    if (numAmount >= 100000) {
      return `₹${(numAmount / 100000).toFixed(1)}L`;
    } else if (numAmount >= 1000) {
      return `₹${(numAmount / 1000).toFixed(1)}K`;
    }
    return `₹${numAmount}`;
  };

  const formatDeadline = (deadline: string) => {
    return formatDeadlineDisplay(deadline);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section with Enhanced Visual Design */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900"></div>

          {/* Floating elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
          <div
            className="absolute top-1/4 right-20 w-48 h-48 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
          <div
            className="absolute bottom-10 right-1/3 w-36 h-36 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"
            style={{ animationDelay: "6s" }}
          ></div>

          {/* Geometric patterns */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-ping"></div>
            <div
              className="absolute top-40 right-40 w-1 h-1 bg-yellow-300 rounded-full animate-ping"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-40 left-40 w-1.5 h-1.5 bg-green-300 rounded-full animate-ping"
              style={{ animationDelay: "3s" }}
            ></div>
            <div
              className="absolute bottom-20 right-20 w-2 h-2 bg-purple-300 rounded-full animate-ping"
              style={{ animationDelay: "5s" }}
            ></div>
          </div>
        </div>

        <div className="relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div
              className={`text-center transform transition-all duration-1000 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              {/* Enhanced Welcome Message */}
              {user && (
                <div className="mb-8 animate-fade-in">
                  <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
                    <Star className="w-5 h-5 text-yellow-300 mr-2" />
                    <p className="text-blue-200 text-body font-medium">
                      Welcome back,
                    </p>
                  </div>
                  <h1 className="text-display font-bold bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 bg-clip-text text-transparent mt-2">
                    {user.firstName}!
                  </h1>
                </div>
              )}

              <div className="mb-12 space-y-8">
                <h1
                  className={`font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-tight ${
                    user
                      ? "text-display-sm md:text-display lg:text-display-lg"
                      : "text-display md:text-display-lg lg:text-6xl"
                  }`}
                >
                  {user
                    ? "Your Scholarship Dashboard"
                    : "Unlock Your Academic Future"}
                </h1>

                <div className="space-y-6">
                  <p className="text-body-lg md:text-heading-sm lg:text-heading mb-8 max-w-4xl mx-auto leading-relaxed text-blue-100/90">
                    Discover{" "}
                    <span className="relative">
                      <span className="text-yellow-300 font-semibold bg-yellow-300/20 px-2 py-1 rounded-lg">
                        verified scholarships
                      </span>
                    </span>{" "}
                    for Indian students. All application links{" "}
                    <span className="relative">
                      <span className="text-green-300 font-semibold bg-green-300/20 px-2 py-1 rounded-lg">
                        tested and validated
                      </span>
                    </span>{" "}
                    for your success.
                  </p>

                  {/* Trust indicators */}
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200/80">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-300" />
                      <span>100% Verified Links</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-300" />
                      <span>Real-time Updates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-pink-300" />
                      <span>AI-Powered Matching</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Stats Banner */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 max-w-6xl mx-auto">
                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-yellow-400/20 rounded-xl">
                      <BookOpen className="w-6 h-6 text-yellow-300" />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-yellow-300 mb-2">
                    {stats.total}+
                  </div>
                  <div className="text-sm lg:text-body text-blue-200 font-medium">
                    Live Scholarships
                  </div>
                </div>

                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-green-400/20 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-300" />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-green-300 mb-2">
                    {stats.active}
                  </div>
                  <div className="text-sm lg:text-body text-blue-200 font-medium">
                    Active Today
                  </div>
                </div>

                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-purple-400/20 rounded-xl">
                      <Award className="w-6 h-6 text-purple-300" />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-purple-300 mb-2">
                    ₹50Cr+
                  </div>
                  <div className="text-sm lg:text-body text-blue-200 font-medium">
                    Total Value
                  </div>
                </div>

                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-orange-400/20 rounded-xl">
                      <Globe className="w-6 h-6 text-orange-300" />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-orange-300 mb-2">
                    6
                  </div>
                  <div className="text-sm lg:text-body text-blue-200 font-medium">
                    Verified Sources
                  </div>
                </div>
              </div>

              {/* Enhanced CTAs */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
                <Link
                  to="/scholarships"
                  className="group relative bg-gradient-to-r from-white to-blue-50 text-blue-600 px-8 py-4 rounded-2xl text-body font-semibold hover:from-blue-50 hover:to-white transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 border border-white/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Search className="h-5 w-5 group-hover:rotate-12 transition-transform relative z-10" />
                  <span className="relative z-10">Explore Scholarships</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </Link>

                <Link
                  to="/dashboard"
                  className="group relative border-2 border-white/30 text-white px-8 py-4 rounded-2xl text-body font-semibold hover:bg-white/10 backdrop-blur-md transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
                >
                  <Award className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  <span>My Dashboard</span>
                  <TrendingUp className="h-5 w-5 group-hover:translate-y-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Live Statistics */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-5 py-3 rounded-full text-body-sm font-medium mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
            <h2 className="text-display-sm font-bold text-gray-900 mb-6">
              Real-time Scholarship Statistics
            </h2>
            <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
              Updated every hour from our verified scholarship database with
              comprehensive validation
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-sm animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-heading font-semibold text-gray-900 mb-4">
                Unable to Load Data
              </h3>
              <p className="text-body text-gray-600 mb-8 max-w-md mx-auto">
                {error}
              </p>
              <button
                onClick={fetchHomePageData}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white text-body font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Try Again</span>
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  label: "Total Scholarships",
                  value: stats.total.toLocaleString(),
                  icon: BookOpen,
                  color: "blue",
                  gradient: "from-blue-500 to-blue-600",
                },
                {
                  label: "Active Today",
                  value: stats.active.toLocaleString(),
                  icon: Zap,
                  color: "green",
                  gradient: "from-green-500 to-green-600",
                },
                {
                  label: "Added This Week",
                  value: stats.recentlyAdded.toLocaleString(),
                  icon: TrendingUp,
                  color: "purple",
                  gradient: "from-purple-500 to-purple-600",
                },
                {
                  label: "Verified Sources",
                  value: "6",
                  icon: CheckCircle,
                  color: "indigo",
                  gradient: "from-indigo-500 to-indigo-600",
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${stat.gradient} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white group`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <Icon className="h-10 w-10 text-white/80 group-hover:text-white transition-colors" />
                      <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-display-sm font-bold mb-3">
                      {stat.value}
                    </div>
                    <div className="text-white/90 text-body font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Featured Scholarships */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-body-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              <span>Featured Opportunities</span>
            </div>
            <h2 className="text-display-sm font-bold text-gray-900 mb-6">
              Latest Verified Scholarships
            </h2>
            <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
              Fresh opportunities with{" "}
              <span className="text-green-600 font-semibold">
                verified application links
              </span>{" "}
              and{" "}
              <span className="text-blue-600 font-semibold">
                real-time validation
              </span>
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl p-2 shadow-lg border">
              {["all", "undergraduate", "postgraduate", "phd"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-medium capitalize transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {tab === "all" ? "All Levels" : tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-8 animate-pulse shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded mt-6"></div>
                </div>
              ))}
            </div>
          ) : featuredScholarships.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <BookOpen className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-heading font-semibold text-gray-900 mb-4">
                Scholarships Loading
              </h3>
              <p className="text-body-lg text-gray-600 mb-8 max-w-md mx-auto">
                Our AI scrapers are working to fetch the latest verified
                scholarships for you.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/admin"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Globe className="h-4 w-4" />
                  <span>Check System Status</span>
                </Link>
                <button
                  onClick={fetchHomePageData}
                  className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredScholarships.map((scholarship, index) => (
                <div
                  key={scholarship._id}
                  className={`bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 group ${
                    index < 3 ? "ring-2 ring-blue-500/20" : ""
                  }`}
                >
                  {/* Scholarship Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-body-sm rounded-full font-medium">
                        {scholarship.category}
                      </span>
                      {index < 3 && (
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-caption font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-green-600">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-caption font-medium">
                          Verified
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Scholarship Content */}
                  <h3 className="text-heading font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {scholarship.title}
                  </h3>

                  <p className="text-body text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                    {scholarship.description}
                  </p>

                  {/* Scholarship Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Award className="h-4 w-4" />
                        <span className="text-body-sm">Amount</span>
                      </div>
                      <span className="font-bold text-green-600 text-body-lg">
                        {formatCurrency(scholarship.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-body-sm">Deadline</span>
                      </div>
                      <span className="font-semibold text-red-600">
                        {formatDeadline(scholarship.deadline)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <GraduationCap className="h-4 w-4" />
                        <span className="text-body-sm">Level</span>
                      </div>
                      <span className="text-gray-700 capitalize font-medium">
                        {scholarship.educationLevel}
                      </span>
                    </div>
                    {scholarship.state && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span className="text-body-sm">Location</span>
                        </div>
                        <span className="text-gray-700 font-medium">
                          {scholarship.state}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Link
                      to={`/scholarship/${scholarship._id}`}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 group"
                    >
                      <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>View Details</span>
                    </Link>
                    <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <Bookmark className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-16">
            <Link
              to="/scholarships"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-body-lg"
            >
              <Search className="h-6 w-6" />
              <span>Explore All Scholarships</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-display-sm font-bold text-gray-900 mb-6">
              Why Choose ScholarWise India?
            </h2>
            <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
              We ensure every scholarship is{" "}
              <span className="text-blue-600 font-semibold">real</span>,
              <span className="text-green-600 font-semibold"> verified</span>,
              and
              <span className="text-purple-600 font-semibold"> accessible</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Globe,
                title: "Live Data Only",
                description:
                  "All scholarships scraped in real-time from verified sources. No fake or outdated information.",
                color: "blue",
                gradient: "from-blue-500 to-blue-600",
                features: [
                  "Real-time scraping",
                  "No mock data",
                  "6 verified sources",
                ],
              },
              {
                icon: Target,
                title: "Verified Links",
                description:
                  "Every application link tested and validated to ensure you can actually apply for the scholarship.",
                color: "green",
                gradient: "from-green-500 to-green-600",
                features: [
                  "100% tested links",
                  "Link validation",
                  "Quality scoring",
                ],
              },
              {
                icon: Zap,
                title: "AI-Powered Updates",
                description:
                  "Continuous monitoring and AI-enhanced updates ensure you never miss a deadline or opportunity.",
                color: "purple",
                gradient: "from-purple-500 to-purple-600",
                features: [
                  "AI monitoring",
                  "Smart alerts",
                  "Deadline tracking",
                ],
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div
                    className={`bg-gradient-to-br ${feature.gradient} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-heading font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-body text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center space-x-2 text-body-sm text-gray-500"
                      >
                        <CheckCircle
                          className={`h-4 w-4 text-${feature.color}-500`}
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Urgent Deadlines Section */}
      {upcomingDeadlines.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-body-sm font-medium mb-6">
                <AlertCircle className="w-4 h-4" />
                <span>Urgent Deadlines</span>
              </div>
              <h2 className="text-display-sm font-bold text-red-900 mb-6">
                ⚠️ Don't Miss These Opportunities
              </h2>
              <p className="text-body-lg text-red-700 max-w-3xl mx-auto">
                Scholarships with approaching deadlines - apply now before it's
                too late!
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingDeadlines.slice(0, 3).map((scholarship) => (
                <div
                  key={scholarship._id}
                  className="bg-white border-2 border-red-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
                >
                  {/* Urgency Indicator */}
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-2 rounded-bl-2xl text-body-sm font-bold">
                    URGENT
                  </div>

                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-red-100 p-3 rounded-xl">
                      <Clock className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <div className="text-red-600 font-bold text-body-lg">
                        {formatDeadline(scholarship.deadline)}
                      </div>
                      <div className="text-red-500 text-body-sm">
                        Application deadline
                      </div>
                    </div>
                  </div>

                  <h3 className="text-heading font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {scholarship.title}
                  </h3>

                  <p className="text-body text-gray-600 mb-6 line-clamp-3">
                    {scholarship.description}
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-body-lg font-bold text-green-600">
                      {formatCurrency(scholarship.amount)}
                    </div>
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-body-sm">Verified</span>
                    </div>
                  </div>

                  <Link
                    to={`/scholarship/${scholarship._id}`}
                    className="block w-full text-center px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-bold text-body-lg shadow-lg hover:shadow-xl"
                  >
                    Apply Now
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/scholarships?filter=deadline"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg font-semibold"
              >
                <Calendar className="h-5 w-5" />
                <span>View All Urgent Deadlines</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-2xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl animate-float animation-delay-2000"></div>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-display md:text-display-lg font-bold text-white mb-6">
              Ready to Find Your Scholarship?
            </h2>
            <p className="text-body-lg md:text-heading-sm text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join{" "}
              <span className="text-yellow-300 font-bold">
                thousands of students
              </span>{" "}
              who have found their perfect educational funding through our
              verified platform
            </p>
          </div>

          {/* Success Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { number: "10,000+", label: "Students Helped" },
              { number: "₹50Cr+", label: "Total Scholarships" },
              { number: "6", label: "Verified Sources" },
              { number: "99%", label: "Link Accuracy" },
            ].map((metric, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="text-heading font-bold text-yellow-300 mb-2">
                  {metric.number}
                </div>
                <div className="text-blue-200 text-body-sm">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/scholarships"
              className="group bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-body-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3"
            >
              <Search className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              <span>Start Your Search</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="group border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-body-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3"
            >
              <Award className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              <span>My Dashboard</span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-200 text-body-sm mb-4">
              Trusted by students from
            </p>
            <div className="flex flex-wrap justify-center items-center space-x-8 text-white/80">
              <span>IIT • NIT • AIIMS • DU • JNU • BHU</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedHomePage;
