import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Calendar,
  MapPin,
  DollarSign,
  GraduationCap,
  ExternalLink,
  ArrowLeft,
  Clock,
  Award,
  Users,
  Share2,
  Bookmark,
  AlertCircle,
  CheckCircle,
  Info,
  Globe,
  Shield,
  Heart,
  Download,
  Phone,
  Mail,
  Building,
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
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      fetchScholarship(id);
      checkIfSaved(id);
    }
  }, [id]);

  const fetchScholarship = async (scholarshipId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/scholarships/${scholarshipId}`
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

  const checkIfSaved = (scholarshipId: string) => {
    try {
      const saved = localStorage.getItem("savedScholarships");
      if (saved) {
        const parsedSaved = JSON.parse(saved);
        const isAlreadySaved = parsedSaved.some(
          (s: any) => s._id === scholarshipId
        );
        setIsSaved(isAlreadySaved);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSaveScholarship = () => {
    if (!scholarship) return;

    try {
      const saved = localStorage.getItem("savedScholarships");
      let parsedSaved = saved ? JSON.parse(saved) : [];

      if (isSaved) {
        // Remove from saved
        parsedSaved = parsedSaved.filter((s: any) => s._id !== scholarship._id);
        setIsSaved(false);
        toast.success("Scholarship removed from saved!");
      } else {
        // Add to saved
        const scholarshipToSave = {
          ...scholarship,
          savedAt: new Date().toISOString(),
        };
        parsedSaved.push(scholarshipToSave);
        setIsSaved(true);
        toast.success("Scholarship saved successfully!");
      }

      localStorage.setItem("savedScholarships", JSON.stringify(parsedSaved));
    } catch (error) {
      console.error("Error saving scholarship:", error);
      toast.error("Failed to save scholarship");
    }
  };

  const handleSaveAndNavigate = () => {
    if (!isSaved) {
      handleSaveScholarship();
    }
    // Navigate to saved page
    setTimeout(() => {
      navigate("/saved");
    }, 1000); // Small delay to show the toast
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Scholarship Details
          </h3>
          <p className="text-gray-500">
            Fetching detailed information about this scholarship...
          </p>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Scholarship Not Found
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The scholarship you're looking for doesn't exist or has been
            removed. This could happen if the scholarship has expired or the
            link is incorrect.
          </p>
          <div className="space-y-3">
            <Link
              to="/scholarships"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse All Scholarships
            </Link>
            <p className="text-sm text-gray-500">
              Or contact support if you believe this is an error
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Button */}
        <div className="mb-8">
          <Link
            to="/scholarships"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Scholarships</span>
          </Link>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Enhanced Header Section */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
            {/* Header Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 rounded-full translate-y-24 -translate-x-24"></div>
            </div>

            <div className="relative p-8 md:p-12">
              {/* Provider Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-blue-100">Provided by</div>
                  <div className="text-lg font-semibold">
                    {scholarship.provider}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                {scholarship.title}
              </h1>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <DollarSign className="h-6 w-6 text-green-300 mb-2" />
                  <div className="text-2xl font-bold">{scholarship.amount}</div>
                  <div className="text-sm text-blue-100">Award Amount</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Clock className="h-6 w-6 text-yellow-300 mb-2" />
                  <div className="text-2xl font-bold">
                    {getTimeLeft(scholarship.deadline)}
                  </div>
                  <div className="text-sm text-blue-100">Time Left</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <GraduationCap className="h-6 w-6 text-purple-300 mb-2" />
                  <div className="text-2xl font-bold">
                    {scholarship.educationLevel}
                  </div>
                  <div className="text-sm text-blue-100">Education Level</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <MapPin className="h-6 w-6 text-orange-300 mb-2" />
                  <div className="text-2xl font-bold">{scholarship.state}</div>
                  <div className="text-sm text-blue-100">Location</div>
                </div>
              </div>

              {/* Tags and Urgency */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-white/30">
                  {scholarship.category}
                </span>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border ${
                    getTimeLeft(scholarship.deadline).includes("Expired")
                      ? "bg-red-500/20 border-red-300/50 text-red-100"
                      : getTimeLeft(scholarship.deadline).includes("day") &&
                        !getTimeLeft(scholarship.deadline).includes("days")
                      ? "bg-yellow-500/20 border-yellow-300/50 text-yellow-100"
                      : "bg-green-500/20 border-green-300/50 text-green-100"
                  }`}
                >
                  <Clock className="h-4 w-4 inline mr-2" />
                  {getTimeLeft(scholarship.deadline)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <a
                  href={scholarship.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ExternalLink className="h-5 w-5" />
                  Apply Now
                </a>
                <button
                  onClick={handleSaveScholarship}
                  className={`inline-flex items-center gap-2 px-6 py-4 backdrop-blur-sm border rounded-xl font-medium transition-all duration-200 ${
                    isSaved
                      ? "bg-pink-500/20 border-pink-300/30 text-pink-100 hover:bg-pink-500/30"
                      : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  }`}
                >
                  {isSaved ? (
                    <Heart className="h-5 w-5 fill-current" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                  {isSaved ? "Saved" : "Save"}
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl font-medium hover:bg-white/30 transition-all duration-200">
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Content Sections */}
          <div className="p-8 md:p-12">
            {/* Key Information Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="group bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-right">
                    <div className="text-sm text-green-600 font-medium">
                      Award Amount
                    </div>
                    <div className="text-xl font-bold text-green-800">
                      {scholarship.amount}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-green-700">
                  Financial assistance provided
                </div>
              </div>

              <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-right">
                    <div className="text-sm text-blue-600 font-medium">
                      Application Deadline
                    </div>
                    <div className="text-xl font-bold text-blue-800">
                      {formatDate(scholarship.deadline)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-blue-700">
                  Don't miss the deadline
                </div>
              </div>

              <div className="group bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <GraduationCap className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-right">
                    <div className="text-sm text-purple-600 font-medium">
                      Education Level
                    </div>
                    <div className="text-xl font-bold text-purple-800">
                      {scholarship.educationLevel}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-purple-700">
                  Required academic level
                </div>
              </div>

              <div className="group bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <MapPin className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-right">
                    <div className="text-sm text-orange-600 font-medium">
                      Location
                    </div>
                    <div className="text-xl font-bold text-orange-800">
                      {scholarship.state}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-orange-700">
                  Geographic preference
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content - Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Info className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      About This Scholarship
                    </h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {scholarship.description}
                    </p>
                  </div>
                </div>

                {/* Eligibility Section */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-600 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Eligibility Criteria
                    </h2>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {scholarship.eligibility}
                    </p>
                  </div>
                </div>

                {/* Target Groups */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-600 rounded-xl">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Target Groups
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {scholarship.targetGroup.map((group, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 bg-white/70 text-purple-800 px-4 py-2 rounded-full text-sm font-medium border border-purple-200 hover:bg-white transition-all duration-200"
                      >
                        <Users className="h-4 w-4" />
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar - Right Column */}
              <div className="space-y-6">
                {/* Quick Apply Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-lg sticky top-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Ready to Apply?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Start your application process now
                    </p>
                  </div>

                  <div className="space-y-4">
                    <a
                      href={scholarship.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <ExternalLink className="h-5 w-5" />
                      Apply Now
                    </a>

                    <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/70 text-green-700 rounded-xl font-medium border border-green-200 hover:bg-white transition-all duration-200">
                      <Download className="h-4 w-4" />
                      Download Info
                    </button>

                    <button
                      onClick={handleSaveScholarship}
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all duration-200 ${
                        isSaved
                          ? "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
                          : "bg-white/70 text-green-700 border-green-200 hover:bg-white"
                      }`}
                    >
                      {isSaved ? (
                        <Heart className="h-4 w-4 fill-current" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                      {isSaved ? "Saved ✓" : "Save Scholarship"}
                    </button>
                  </div>

                  <div className="mt-4 p-4 bg-white/50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Verified & Secure</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Official application portal
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Need Help?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        support@ScholarWise.in
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        24/7 Support Available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Share Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Share with Friends
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Help others discover this opportunity
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      WhatsApp
                    </button>
                    <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                      Facebook
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Section */}
            <div className="mt-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">
                Don't Miss This Opportunity!
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Applications are being processed on a first-come, first-served
                basis. Start your application today to secure your future.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href={scholarship.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ExternalLink className="h-5 w-5" />
                  Start Application
                </a>
                <button
                  onClick={handleSaveAndNavigate}
                  className={`inline-flex items-center gap-2 px-6 py-4 backdrop-blur-sm border rounded-xl font-medium transition-all duration-200 ${
                    isSaved
                      ? "bg-pink-500/20 border-pink-300/30 text-pink-100 hover:bg-pink-500/30"
                      : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  }`}
                >
                  {isSaved ? (
                    <Heart className="h-5 w-5 fill-current" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                  {isSaved ? "View Saved" : "Save for Later"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailsPage;
