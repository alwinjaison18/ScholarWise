import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Clock,
  Award,
  BookOpen,
  Users,
  Globe,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  scholarshipService,
  Scholarship,
} from "../services/scholarshipService";

const HomePage: React.FC = () => {
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
        scholarshipService.getScholarships(1, 6), // Get first 6 scholarships
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
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Scholarship
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover thousands of scholarships available for Indian students.
              From merit-based to need-based opportunities - your education
              funding starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/scholarships"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Browse Scholarships</span>
              </Link>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200">
                How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ScholarHub India?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make scholarship discovery simple and accessible for every
              Indian student
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-gray-600">
                Advanced filters to find scholarships that match your profile,
                education level, and requirements.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Stay updated with the latest scholarship opportunities and
                deadline reminders.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Verified Information
              </h3>
              <p className="text-gray-600">
                All scholarship information is automatically verified and
                updated from official sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {loading ? (
                  <RefreshCw className="animate-spin h-6 w-6 mx-auto" />
                ) : (
                  stats.active
                )}
                +
              </div>
              <div className="text-gray-600">Active Scholarships</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {loading ? (
                  <RefreshCw className="animate-spin h-6 w-6 mx-auto" />
                ) : (
                  formatCurrency(stats.averageAmount)
                )}
                +
              </div>
              <div className="text-gray-600">Total Funding Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {loading ? (
                  <RefreshCw className="animate-spin h-6 w-6 mx-auto" />
                ) : (
                  stats.recentlyAdded
                )}
                +
              </div>
              <div className="text-gray-600">Students Helped</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {loading ? (
                  <RefreshCw className="animate-spin h-6 w-6 mx-auto" />
                ) : (
                  stats.total
                )}
                +
              </div>
              <div className="text-gray-600">Partner Organizations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Scholarship Categories
            </h2>
            <p className="text-lg text-gray-600">
              Explore scholarships by category to find the best fit for your
              field of study
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Engineering",
                icon: "⚙️",
                color: "bg-blue-100 text-blue-600",
              },
              { name: "Medical", icon: "🏥", color: "bg-red-100 text-red-600" },
              {
                name: "Arts & Literature",
                icon: "🎨",
                color: "bg-purple-100 text-purple-600",
              },
              {
                name: "Sports",
                icon: "🏆",
                color: "bg-green-100 text-green-600",
              },
              {
                name: "Research",
                icon: "🔬",
                color: "bg-indigo-100 text-indigo-600",
              },
              {
                name: "Minority",
                icon: "👥",
                color: "bg-pink-100 text-pink-600",
              },
              {
                name: "Women",
                icon: "👩‍🎓",
                color: "bg-orange-100 text-orange-600",
              },
              {
                name: "SC/ST/OBC",
                icon: "📚",
                color: "bg-teal-100 text-teal-600",
              },
            ].map((category) => (
              <Link
                key={category.name}
                to={`/scholarships?category=${encodeURIComponent(
                  category.name
                )}`}
                className="block p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div
                  className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mb-3 text-2xl`}
                >
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Scholarship Journey?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of students who have found their perfect scholarship
            match with us.
          </p>
          <Link
            to="/scholarships"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>Start Searching Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
