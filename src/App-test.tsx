import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import TestComponent from "./components/TestComponent";
import Navbar from "./components/Navbar";
import EnhancedHomePage from "./pages/EnhancedHomePage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import ScholarshipDetailsPage from "./pages/ScholarshipDetailsPage";
import EnhancedAdminDashboard from "./pages/EnhancedAdminDashboard";
import Footer from "./components/Footer";

function App() {
  // Check if we want to show the test page
  const showTest = window.location.search.includes("test=true");

  if (showTest) {
    return <TestComponent />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<EnhancedHomePage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route
              path="/scholarship/:id"
              element={<ScholarshipDetailsPage />}
            />
            <Route path="/admin" element={<EnhancedAdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
