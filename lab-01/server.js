// =====================================================
//  Lab 01 – Express Server
//  Course  : Backend Development Fundamentals
//  Faculty : Shiva Sai Teja
//  Step 4-6: Rewritten with Express
// =====================================================

const express = require("express");

// express() creates an Express application instance
const app = express();

// Use PORT from environment variable (for deployment) or fallback to 3000
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────
//  ROUTE 1: GET /
//  Returns a plain-text welcome message
//  Status: 200 OK
// ─────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /  →  200 OK`);
  res.status(200).send("Welcome to Lab 01 – Node.js & Express Server! 🚀");
});

// ─────────────────────────────────────────────────────────
//  ROUTE 2: GET /about
//  Returns JSON object with student name and section
//  Status: 200 OK
// ─────────────────────────────────────────────────────────
app.get("/about", (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /about  →  200 OK`);
  res.status(200).json({
    name: "Srivenkat",
    registrationNumber: "252U1R80332",
    section: "113",
    lab: "Lab 01 – Node.js and Express Server",
    course: "Backend Development Fundamentals",
    faculty: "Shiva Sai Teja",
  });
});

// ─────────────────────────────────────────────────────────
//  ROUTE 3: GET /time
//  Returns current date and time using new Date()
//  Status: 200 OK
// ─────────────────────────────────────────────────────────
app.get("/time", (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /time  →  200 OK`);
  const now = new Date();
  res.status(200).json({
    currentTime: now.toISOString(),
    readable: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    timezone: "Asia/Kolkata (IST)",
  });
});

// ─────────────────────────────────────────────────────────
//  404 HANDLER – Catches all unknown routes
//  Must be defined AFTER all valid routes
//  Status: 404 Not Found
// ─────────────────────────────────────────────────────────
app.use((req, res) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path}  →  404 Not Found`
  );
  res.status(404).json({
    error: "404 – Route Not Found",
    message: `The path '${req.path}' does not exist on this server.`,
    availableRoutes: ["GET /", "GET /about", "GET /time"],
  });
});

// ─────────────────────────────────────────────────────────
//  START SERVER
//  app.listen(PORT) binds the server to the given port
//  and starts accepting incoming HTTP connections
// ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Server running at http://localhost:${PORT}`);
  console.log("──────────────────────────────────────────");
  console.log(`  GET /        → Welcome message (200)`);
  console.log(`  GET /about   → Student info JSON (200)`);
  console.log(`  GET /time    → Current date & time (200)`);
  console.log(`  GET /*       → 404 Not Found`);
  console.log("──────────────────────────────────────────\n");
});
