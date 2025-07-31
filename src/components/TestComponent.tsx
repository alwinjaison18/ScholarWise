import React from "react";

const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🎓 ScholarHub India
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Frontend is working! The scholarship portal is loading...
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Quick Status Check</h2>
          <div className="space-y-2 text-left">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>React Components: ✅ Working</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>Tailwind CSS: ✅ Working</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>TypeScript: ✅ Working</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              <span>Backend API: 🔄 Testing...</span>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={() => (window.location.href = "/scholarships")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Go to Scholarships
          </button>
          <button
            onClick={() => (window.location.href = "/admin")}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
