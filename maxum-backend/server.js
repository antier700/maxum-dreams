require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const planRoutes = require("./routes/planRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// Connect Database
// ======================
connectDB();

// ======================
// Middleware (✅ FIXED)
// ======================
const allowedOrigins = [
  "https://maxum-dreams.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked origin: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// ✅ IMPORTANT (preflight fix)
app.options("*", cors());

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ======================
// Root Route
// ======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Maxum Backend API Running",
  });
});

// ======================
// Health Check
// ======================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is healthy",
  });
});

// ======================
// API Routes
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/contact", contactRoutes);

// ======================
// 404 Route Handler
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ======================
// Global Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ======================
// Start Server
// ======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;