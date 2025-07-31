/**
 * SIMPLE TEST SERVER
 * Basic server to test if the project structure works
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "ScholarHub India Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working correctly!",
    environment: process.env.NODE_ENV || "development",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
