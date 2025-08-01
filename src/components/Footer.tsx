import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Mail,
  Phone,
  ExternalLink,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Github,
  Heart,
  Shield,
  Award,
  Zap,
  Globe,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";

const Footer: React.FC = () => {
  const location = useLocation();

  // Don't show footer on landing page, login, and register pages
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Twitter,
      href: "https://twitter.com/scholarhubindia",
      label: "Twitter",
    },
    {
      icon: Facebook,
      href: "https://facebook.com/scholarhubindia",
      label: "Facebook",
    },
    {
      icon: Instagram,
      href: "https://instagram.com/scholarhubindia",
      label: "Instagram",
    },
    {
      icon: Linkedin,
      href: "https://linkedin.com/company/scholarhubindia",
      label: "LinkedIn",
    },
    {
      icon: Github,
      href: "https://github.com/scholarhubindia",
      label: "GitHub",
    },
  ];

  const quickLinks = [
    { label: "Home", href: "/home" },
    { label: "Scholarships", href: "/scholarships" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Profile", href: "/profile" },
    { label: "Help Center", href: "/help" },
  ];

  const scholarshipSources = [
    {
      label: "National Scholarship Portal",
      href: "https://scholarships.gov.in/",
      verified: true,
    },
    {
      label: "Buddy4Study",
      href: "https://www.buddy4study.com/",
      verified: true,
    },
    {
      label: "UGC Scholarships",
      href: "https://www.ugc.ac.in/",
      verified: true,
    },
    {
      label: "AICTE Scholarships",
      href: "https://www.aicte-india.org/",
      verified: true,
    },
    {
      label: "Vidya Lakshmi Portal",
      href: "https://www.vidyalakshmi.co.in/",
      verified: true,
    },
    {
      label: "Scholarships India",
      href: "https://www.scholarshipsindia.com/",
      verified: true,
    },
  ];

  const supportLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact Us", href: "/contact" },
    { label: "System Status", href: "/admin" },
    { label: "API Documentation", href: "/api-docs" },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Logo and Description - Spans 5 columns */}
            <div className="lg:col-span-5">
              <Link
                to="/home"
                className="inline-flex items-center space-x-3 mb-4 group"
              >
                <div className="relative">
                  <BookOpen className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl group-hover:text-blue-300 transition-colors duration-200">
                    ScholarHub India
                  </span>
                  <span className="text-xs text-blue-300">
                    AI-Powered Scholarship Platform
                  </span>
                </div>
              </Link>

              <p className="text-gray-300 mb-4 leading-relaxed">
                Empowering Indian students with{" "}
                <span className="text-blue-400 font-semibold">
                  verified scholarship opportunities
                </span>
                . Our AI-powered platform connects you with legitimate
                scholarships from trusted sources across India.
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  {
                    icon: Shield,
                    label: "100% Verified Links",
                    color: "text-green-400",
                  },
                  {
                    icon: Zap,
                    label: "Real-time Updates",
                    color: "text-yellow-400",
                  },
                  {
                    icon: Award,
                    label: "₹50Cr+ Available",
                    color: "text-purple-400",
                  },
                  {
                    icon: Users,
                    label: "10,000+ Students",
                    color: "text-blue-400",
                  },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <Icon className={`h-4 w-4 ${feature.color}`} />
                      <span className="text-sm text-gray-300">
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Email Us</div>
                    <a
                      href="mailto:info@scholarhub.in"
                      className="text-white hover:text-blue-300 transition-colors"
                    >
                      info@scholarhub.in
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <Phone className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Call Us</div>
                    <a
                      href="tel:+919876543210"
                      className="text-white hover:text-green-300 transition-colors"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links - Spans 2 columns */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group"
                    >
                      <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scholarship Sources - Spans 3 columns */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-bold mb-4 text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-400" />
                Verified Sources
              </h3>
              <ul className="space-y-2">
                {scholarshipSources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group"
                    >
                      <div className="flex items-center flex-1">
                        {source.verified && (
                          <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
                        )}
                        <span className="group-hover:text-blue-300 transition-colors">
                          {source.label}
                        </span>
                      </div>
                      <ExternalLink className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Legal - Spans 2 columns */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold mb-4 text-white">
                Support & Legal
              </h3>
              <ul className="space-y-2">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group"
                    >
                      <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Newsletter Signup */}
              <div className="mt-4 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h4 className="text-sm font-semibold mb-1 text-white">
                  Stay Updated
                </h4>
                <p className="text-xs text-gray-300 mb-2">
                  Get latest scholarships in your inbox
                </p>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright and Credits */}
            <div className="flex flex-col lg:flex-row items-center space-y-1 lg:space-y-0 lg:space-x-4">
              <div className="text-gray-400 text-sm">
                © {currentYear} ScholarHub India. All rights reserved.
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Made with</span>
                <Heart className="h-3 w-3 text-red-400 animate-pulse" />
                <span className="text-gray-400">for Indian students</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-1">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 group"
                  >
                    <Icon className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors duration-200" />
                  </a>
                );
              })}
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">
                  Live Data
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-blue-400" />
                <span className="text-blue-400 text-xs font-medium">
                  AI Powered
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-yellow-400 text-xs font-medium">
                  4.9/5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
