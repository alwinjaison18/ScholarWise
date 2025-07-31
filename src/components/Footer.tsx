import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <span className="font-bold text-xl">ScholarHub India</span>
            </Link>
            <p className="text-gray-300 mb-4">
              Empowering Indian students with verified scholarship
              opportunities. Our AI-powered platform connects you with
              legitimate scholarships from trusted sources across India.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">
                  info@scholarhub.in
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">+91 9876543210</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/scholarships"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Browse Scholarships
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://scholarships.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  National Scholarship Portal
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.buddy4study.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  Buddy4Study
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ugc.ac.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  UGC Scholarships
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 ScholarHub India. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">
              Powered by AI-driven scholarship discovery
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-sm">Live Data</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
