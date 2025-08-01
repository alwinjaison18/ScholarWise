import { useState } from "react";
import { 
  Search, 
  Calendar, 
  MapPin, 
  DollarSign, 
  RefreshCw, 
  Filter,
  Grid,
  List,
  Award,
  Clock,
  ExternalLink,
  Users,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useScholarships } from "../hooks/useScholarships";

const ScholarshipsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('deadline');
  const [filters, setFilters] = useState({
    category: "",
    educationLevel: "",
    targetGroup: "",
    state: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { scholarships, isLoading, error, totalPages, fetchScholarships } =
    useScholarships();

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      search: searchTerm.trim(),
    };
    fetchScholarships(currentPage, 10, searchFilters);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);

    const searchFilters = {
      ...newFilters,
      search: searchTerm.trim(),
    };
    fetchScholarships(1, 10, searchFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const searchFilters = {
      ...filters,
      search: searchTerm.trim(),
    };
    fetchScholarships(page, 10, searchFilters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section with Statistics */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Discover Your Perfect Scholarship
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Explore thousands of verified scholarship opportunities with our AI-powered platform. 
              Find funding that matches your academic goals and background.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Award, label: "Active Scholarships", value: "2,500+", color: "text-yellow-300" },
              { icon: DollarSign, label: "Total Worth", value: "₹50 Cr+", color: "text-green-300" },
              { icon: Users, label: "Students Helped", value: "10,000+", color: "text-blue-300" },
              { icon: Shield, label: "Verified Sources", value: "100%", color: "text-purple-300" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <Icon className={`h-8 w-8 ${stat.color} mb-3 group-hover:scale-110 transition-transform duration-300`} />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Controls */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8 sticky top-4 z-10">
          {/* Search Bar with Advanced Options */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, category, or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Search
            </button>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="amount">Sort by Amount</option>
                <option value="latest">Sort by Latest</option>
                <option value="alphabetical">Sort A-Z</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 animate-in slide-in-from-top duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    <option value="Merit-based">Merit-based</option>
                    <option value="Need-based">Need-based</option>
                    <option value="Sports">Sports</option>
                    <option value="Arts">Arts</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Medical">Medical</option>
                    <option value="Research">Research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Level
                  </label>
                  <select
                    value={filters.educationLevel}
                    onChange={(e) =>
                      handleFilterChange("educationLevel", e.target.value)
                    }
                    className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Levels</option>
                    <option value="School">School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Doctoral">Doctoral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Group
                  </label>
                  <select
                    value={filters.targetGroup}
                    onChange={(e) =>
                      handleFilterChange("targetGroup", e.target.value)
                    }
                    className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Groups</option>
                    <option value="General">General</option>
                    <option value="SC/ST">SC/ST</option>
                    <option value="OBC">OBC</option>
                    <option value="Minority">Minority</option>
                    <option value="Women">Women</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange("state", e.target.value)}
                    className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All India</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Results Section */}
        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">
                Failed to load scholarships
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchScholarships(currentPage, 10, filters)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Finding Perfect Scholarships
            </h3>
            <p className="text-gray-500">
              Searching through our verified database...
            </p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Scholarships Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No scholarships match your current search criteria. Try adjusting your filters or search terms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-blue-50 p-4 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-800">Broaden your search criteria</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-800">Check back for new scholarships</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800">All listings are verified</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Page
            </button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {scholarships.length} Scholarships Found
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  All Verified
                </div>
              </div>
            </div>

            {/* Enhanced Scholarship Cards */}
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
            }`}>
              {scholarships.map((scholarship, index) => (
                <div
                  key={scholarship._id}
                  className={`group bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02] ${
                    viewMode === 'grid' ? 'p-6' : 'p-8'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-500">
                          by {scholarship.provider}
                        </span>
                      </div>
                      <h3 className={`font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 ${
                        viewMode === 'grid' ? 'text-lg' : 'text-xl'
                      }`}>
                        <Link
                          to={`/scholarship/${scholarship._id}`}
                          className="hover:underline"
                        >
                          {scholarship.title}
                        </Link>
                      </h3>
                    </div>

                    {/* Urgency Badge */}
                    <div className={`ml-4 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      getTimeLeft(scholarship.deadline).includes("Expired")
                        ? "bg-red-100 text-red-800"
                        : getTimeLeft(scholarship.deadline).includes("day") && !getTimeLeft(scholarship.deadline).includes("days")
                        ? "bg-yellow-100 text-yellow-800"
                        : parseInt(getTimeLeft(scholarship.deadline)) <= 7
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      <Clock className="h-3 w-3 inline mr-1" />
                      {getTimeLeft(scholarship.deadline)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-gray-600 mb-4 leading-relaxed ${
                    viewMode === 'grid' ? 'text-sm' : ''
                  }`}>
                    {viewMode === 'grid' && scholarship.description.length > 120 
                      ? scholarship.description.substring(0, 120) + '...'
                      : scholarship.description
                    }
                  </p>

                  {/* Key Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-sm text-green-600 font-medium">Amount</div>
                        <div className="text-green-800 font-semibold">{scholarship.amount}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-blue-600 font-medium">Deadline</div>
                        <div className="text-blue-800 font-semibold">{formatDate(scholarship.deadline)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="text-sm text-purple-600 font-medium">Location</div>
                        <div className="text-purple-800 font-semibold">{scholarship.state}</div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {scholarship.category}
                    </span>
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {scholarship.educationLevel}
                    </span>
                    {scholarship.targetGroup.slice(0, 2).map((group, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {group}
                      </span>
                    ))}
                    {scholarship.targetGroup.length > 2 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        +{scholarship.targetGroup.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      to={`/scholarship/${scholarship._id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 group/btn"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </Link>
                    <a
                      href={scholarship.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Apply Now
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-lg rounded-2xl p-2 shadow-lg border border-white/20">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let page;
                    if (totalPages <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      page = totalPages - 6 + i;
                    } else {
                      page = currentPage - 3 + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScholarshipsPage;
