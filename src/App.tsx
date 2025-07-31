import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import EnhancedHomePage from "./pages/EnhancedHomePage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import ScholarshipDetailsPage from "./pages/ScholarshipDetailsPage";
import EnhancedAdminDashboard from "./pages/EnhancedAdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
