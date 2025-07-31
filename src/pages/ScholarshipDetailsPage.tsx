import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  DollarSign,
  GraduationCap,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

interface Scholarship {
  _id: string;
  title: string;
  description: string;
  eligibility: string;
  amount: string;
  deadline: string;
  provider: string;
  category: string;
  targetGroup: string[];
  educationLevel: string;
  state: string;
  applicationLink: string;
}

const ScholarshipDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchScholarship(id);
    }
  }, [id]);

  const fetchScholarship = async (scholarshipId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/scholarships/${scholarshipId}`
      );
      if (response.ok) {
        const data = await response.json();
        setScholarship(data);
      }
    } catch (error) {
      console.error("Error fetching scholarship:", error);
    }
    setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scholarship details...</p>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Scholarship Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The scholarship you're looking for doesn't exist or has been
            removed.
          </p>
          <Link
            to="/scholarships"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Browse Other Scholarships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/scholarships"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Scholarships</span>
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8">
            <h1 className="text-3xl font-bold mb-4">{scholarship.title}</h1>
            <p className="text-primary-100 text-lg">
              by {scholarship.provider}
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  getTimeLeft(scholarship.deadline).includes("Expired")
                    ? "bg-red-500 text-white"
                    : getTimeLeft(scholarship.deadline).includes("day")
                    ? "bg-yellow-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {getTimeLeft(scholarship.deadline)}
              </div>
              <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
                {scholarship.category}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-8">
            {/* Quick Info */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Amount</h3>
                <p className="text-gray-600">{scholarship.amount}</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Deadline</h3>
                <p className="text-gray-600">
                  {formatDate(scholarship.deadline)}
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <GraduationCap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Level</h3>
                <p className="text-gray-600">{scholarship.educationLevel}</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Location</h3>
                <p className="text-gray-600">{scholarship.state}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Scholarship
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {scholarship.description}
              </p>
            </div>

            {/* Eligibility */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Eligibility Criteria
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  {scholarship.eligibility}
                </p>
              </div>
            </div>

            {/* Target Groups */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Target Groups
              </h2>
              <div className="flex flex-wrap gap-2">
                {scholarship.targetGroup.map((group, index) => (
                  <span
                    key={index}
                    className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={scholarship.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Apply for this Scholarship</span>
                  <ExternalLink className="h-5 w-5" />
                </a>

                <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                  Share Scholarship
                </button>
              </div>

              <p className="text-center text-gray-500 text-sm mt-4">
                You will be redirected to the official application portal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailsPage;
