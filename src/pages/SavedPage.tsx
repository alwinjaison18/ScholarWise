import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Award,
  ExternalLink,
  ChevronRight,
  Trash2,
  Search,
  Grid,
  List,
} from "lucide-react";
import { formatDateLong, getTimeLeftFromDeadline } from "../utils/dateUtils";

interface SavedScholarship {
  _id: string;
  title: string;
  description: string;
  amount: string;
  deadline: string;
  provider: string;
  category: string;
  targetGroup: string[];
  educationLevel: string;
  state: string;
  applicationLink: string;
  savedAt: string;
}

const SavedPage: React.FC = () => {
  const [savedScholarships, setSavedScholarships] = useState<
    SavedScholarship[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    loadSavedScholarships();
  }, []);

  const loadSavedScholarships = () => {
    setLoading(true);
    try {
      // Get saved scholarships from localStorage
      const saved = localStorage.getItem("savedScholarships");
      if (saved) {
        const parsedSaved = JSON.parse(saved);
        setSavedScholarships(parsedSaved);
      }
    } catch (error) {
      console.error("Error loading saved scholarships:", error);
    }
    setLoading(false);
  };

  const removeSavedScholarship = (scholarshipId: string) => {
    try {
      const saved = localStorage.getItem("savedScholarships");
      if (saved) {
        const parsedSaved = JSON.parse(saved);
        const updated = parsedSaved.filter(
          (s: SavedScholarship) => s._id !== scholarshipId
        );
        localStorage.setItem("savedScholarships", JSON.stringify(updated));
        setSavedScholarships(updated);
      }
    } catch (error) {
      console.error("Error removing saved scholarship:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateLong(dateString);
  };

  const getTimeLeft = (deadline: string) => {
    return getTimeLeftFromDeadline(deadline);
  };

  const filteredScholarships = savedScholarships.filter((scholarship) => {
    const matchesSearch =
      scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filterCategory || scholarship.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(savedScholarships.map((s) => s.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Your Saved Scholarships
          </h3>
          <p className="text-gray-500">
            Fetching your bookmarked opportunities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-12 w-12 text-pink-300" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Saved Scholarships
              </h1>
            </div>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Your bookmarked scholarship opportunities. Keep track of deadlines
              and never miss an application.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {savedScholarships.length}
                </div>
                <div className="text-sm text-purple-100">Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {
                    savedScholarships.filter(
                      (s) => !getTimeLeft(s.deadline).includes("Expired")
                    ).length
                  }
                </div>
                <div className="text-sm text-purple-100">Active</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {
                    savedScholarships.filter((s) => {
                      const days = getTimeLeft(s.deadline);
                      return days.includes("day") && parseInt(days) <= 7;
                    }).length
                  }
                </div>
                <div className="text-sm text-purple-100">Urgent</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search saved scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredScholarships.length} of {savedScholarships.length}{" "}
              scholarships
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredScholarships.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {savedScholarships.length === 0
                ? "No Saved Scholarships"
                : "No Results Found"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {savedScholarships.length === 0
                ? "Start saving scholarships you're interested in. Click the heart icon on any scholarship to add it here."
                : "Try adjusting your search or filter criteria to find what you're looking for."}
            </p>
            <Link
              to="/scholarships"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search className="h-5 w-5 mr-2" />
              Browse Scholarships
            </Link>
          </div>
        ) : (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }`}
          >
            {filteredScholarships.map((scholarship, index) => (
              <div
                key={scholarship._id}
                className={`group bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02] ${
                  viewMode === "grid" ? "p-6" : "p-8"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-500">
                        by {scholarship.provider}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-200">
                      <Link
                        to={`/scholarship/${scholarship._id}`}
                        className="hover:underline"
                      >
                        {scholarship.title}
                      </Link>
                    </h3>
                  </div>

                  <button
                    onClick={() => removeSavedScholarship(scholarship._id)}
                    className="ml-4 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200 group/remove"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-4 w-4 group-hover/remove:scale-110 transition-transform duration-200" />
                  </button>
                </div>

                {/* Urgency Badge */}
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                    getTimeLeft(scholarship.deadline).includes("Expired")
                      ? "bg-red-100 text-red-800"
                      : getTimeLeft(scholarship.deadline).includes("day") &&
                        !getTimeLeft(scholarship.deadline).includes("days")
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  <Clock className="h-3 w-3 inline mr-1" />
                  {getTimeLeft(scholarship.deadline)}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {viewMode === "grid" && scholarship.description.length > 120
                    ? scholarship.description.substring(0, 120) + "..."
                    : scholarship.description}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
                    <div className="text-xs text-green-600 font-medium">
                      Amount
                    </div>
                    <div className="text-sm text-green-800 font-semibold">
                      {scholarship.amount}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <Calendar className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <div className="text-xs text-blue-600 font-medium">
                      Deadline
                    </div>
                    <div className="text-sm text-blue-800 font-semibold">
                      {formatDate(scholarship.deadline)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <MapPin className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                    <div className="text-xs text-purple-600 font-medium">
                      Location
                    </div>
                    <div className="text-sm text-purple-800 font-semibold">
                      {scholarship.state}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {scholarship.category}
                  </span>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {scholarship.educationLevel}
                  </span>
                </div>

                {/* Actions */}
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Apply Now
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;
