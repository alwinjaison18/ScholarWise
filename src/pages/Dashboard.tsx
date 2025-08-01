import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, Heart, FileText, User, Award, Clock } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName || "User"}!
              </h1>
              <p className="text-gray-600">
                Manage your scholarship applications and discover new
                opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Available Scholarships
                </p>
                <p className="text-2xl font-bold text-gray-900">250+</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applied</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.appliedScholarships?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.savedScholarships?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Profile Complete
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.profileCompletion || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <a
                href="/scholarships"
                className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-blue-700 font-medium">
                  Browse All Scholarships
                </span>
              </a>
              <a
                href="/profile"
                className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <User className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-700 font-medium">
                  Complete Your Profile
                </span>
              </a>
              <a
                href="/applications"
                className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <FileText className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-purple-700 font-medium">
                  View Applications
                </span>
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    Welcome to ScholarWise India!
                  </p>
                  <p className="text-xs text-gray-500">
                    Start by completing your profile
                  </p>
                </div>
              </div>

              {user?.appliedScholarships?.length === 0 &&
                user?.savedScholarships?.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400">
                      Start exploring scholarships to see your activity here
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Profile Completion Banner */}
        {(user?.profileCompletion || 0) < 80 && (
          <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Complete Your Profile</h3>
                <p className="text-blue-100">
                  A complete profile helps us recommend better scholarships for
                  you
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {user?.profileCompletion || 0}%
                </div>
                <a
                  href="/profile"
                  className="inline-block mt-2 bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Complete Now
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
