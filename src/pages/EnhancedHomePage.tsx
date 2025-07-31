import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Clock,
  BookOpen,
  Users,
  Globe,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import type { Scholarship } from "../services/scholarshipService";
import { scholarshipService } from "../services/scholarshipService";

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

  useEffect(() => {
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
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Deadline passed";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Scholarship
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover verified scholarships for Indian students. All
              application links tested and validated for your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/scholarships"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Browse Live Scholarships</span>
              </Link>
              <Link
                to="/admin"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Globe className="h-5 w-5" />
                <span>System Status</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Live Scholarship Data
            </h2>
            <p className="text-gray-600">
              Real-time statistics from our verified scholarship database
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl shadow-sm animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchHomePageData}
                className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Scholarships
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Today
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.active.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Added This Week
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.recentlyAdded.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Verified Sources
                    </p>
                    <p className="text-3xl font-bold text-indigo-600">6</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <Globe className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Scholarships */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Latest Verified Scholarships
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fresh opportunities with verified application links
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-xl p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : featuredScholarships.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Scholarships Loading
              </h3>
              <p className="text-gray-500 mb-6">
                Our scrapers are working to fetch the latest scholarships for
                you.
              </p>
              <Link
                to="/admin"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Globe className="h-4 w-4" />
                <span>Check System Status</span>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredScholarships.map((scholarship) => (
                <div
                  key={scholarship._id}
                  className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {scholarship.category}
                    </span>
                    <div className="flex items-center space-x-1 text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs">Verified</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {scholarship.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {scholarship.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(scholarship.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Deadline:</span>
                      <span className="font-semibold text-red-600">
                        {formatDeadline(scholarship.deadline)}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/scholarship/${scholarship._id}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/scholarships"
              className="inline-flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="h-5 w-5" />
              <span>View All Scholarships</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We ensure every scholarship is real, verified, and accessible
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Live Data Only
              </h3>
              <p className="text-gray-600">
                All scholarships scraped in real-time from verified sources. No
                fake or outdated information.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Verified Links
              </h3>
              <p className="text-gray-600">
                Every application link tested and validated to ensure you can
                actually apply for the scholarship.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Real-time Updates
              </h3>
              <p className="text-gray-600">
                Continuous monitoring and updates ensure you never miss a
                deadline or new opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <section className="py-16 bg-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-red-900 mb-4">
                ⚠️ Urgent Deadlines
              </h2>
              <p className="text-lg text-red-700 max-w-2xl mx-auto">
                Don't miss these scholarships with approaching deadlines
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingDeadlines.slice(0, 3).map((scholarship) => (
                <div
                  key={scholarship._id}
                  className="bg-white border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-5 w-5 text-red-500" />
                    <span className="text-red-600 font-semibold">
                      {formatDeadline(scholarship.deadline)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {scholarship.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {scholarship.description}
                  </p>

                  <Link
                    to={`/scholarship/${scholarship._id}`}
                    className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Apply Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Scholarship?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have found their perfect educational
            funding
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/scholarships"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Start Searching</span>
            </Link>
            <Link
              to="/admin"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Users className="h-5 w-5" />
              <span>System Monitor</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedHomePage;
