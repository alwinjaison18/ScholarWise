import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import EnhancedHomePage from "./pages/EnhancedHomePage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import ScholarshipDetailsPage from "./pages/ScholarshipDetailsPage";
import EnhancedAdminDashboard from "./pages/EnhancedAdminDashboard";
import SavedPage from "./pages/SavedPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<EnhancedHomePage />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
          <Route path="/scholarship/:id" element={<ScholarshipDetailsPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/admin" element={<EnhancedAdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      {!isLandingPage && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
