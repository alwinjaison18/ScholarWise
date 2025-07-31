import { useState } from "react";
import { Search, Calendar, MapPin, DollarSign, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useScholarships } from "../hooks/useScholarships";

const ScholarshipsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Scholarships
          </h1>
          <p className="text-lg text-gray-600">
            Discover scholarship opportunities that match your profile and goals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search scholarships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

        {/* Results */}
        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800 font-medium">
                Failed to load scholarships
              </p>
              <p className="text-red-600 mt-2">{error}</p>
              <button
                onClick={() => fetchScholarships(currentPage, 10, filters)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading scholarships...</p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Scholarships Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No scholarships are currently available in the database. This
              could be because:
            </p>
            <div className="text-left max-w-md mx-auto mb-6">
              <ul className="list-disc text-gray-600 space-y-1">
                <li>The web scrapers haven't been run yet</li>
                <li>No scholarships match your current filters</li>
                <li>The database is being updated</li>
              </ul>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </button>
              <p className="text-sm text-gray-500">
                Or try adjusting your search filters above
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {scholarships.length} scholarships
              </p>
            </div>

            <div className="space-y-6">
              {scholarships.map((scholarship) => (
                <div
                  key={scholarship._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        <Link
                          to={`/scholarship/${scholarship._id}`}
                          className="hover:text-primary-600 transition-colors duration-200"
                        >
                          {scholarship.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {scholarship.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{scholarship.amount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Deadline: {formatDate(scholarship.deadline)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{scholarship.state}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 text-right">
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                          getTimeLeft(scholarship.deadline).includes("Expired")
                            ? "bg-red-100 text-red-800"
                            : getTimeLeft(scholarship.deadline).includes("day")
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {getTimeLeft(scholarship.deadline)}
                      </div>
                      <div className="text-sm text-gray-500">
                        by {scholarship.provider}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-medium">
                      {scholarship.category}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                      {scholarship.educationLevel}
                    </span>
                    {scholarship.targetGroup.map((group, index) => (
                      <span
                        key={index}
                        className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded text-xs font-medium"
                      >
                        {group}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <Link
                      to={`/scholarship/${scholarship._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details →
                    </Link>
                    <a
                      href={scholarship.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === page
                            ? "bg-primary-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
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
