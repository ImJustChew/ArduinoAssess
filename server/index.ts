// Main Hono server entry point for ArduinoAssess
// Serves both API and static frontend

import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// Import routes
import assessmentRoutes from "./routes/assessment";
import questionRoutes from "./routes/questions";
import analyticsRoutes from "./routes/analytics";
import instructorRoutes from "./routes/instructor";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: process.env.NODE_ENV === "production"
      ? "*"
      : ["http://localhost:5173"],
    credentials: true,
  }),
);

// API Routes
console.log("📍 Registering routes:");
console.log("  - /api/assessment/*");
app.route("/api/assessment", assessmentRoutes);
console.log("  - /api/questions/*");
app.route("/api/questions", questionRoutes);
console.log("  - /api/analytics/*");
app.route("/api/analytics", analyticsRoutes);
console.log("  - /api/instructor/*");
app.route("/api/instructor", instructorRoutes);

// Health check
app.get("/api/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Serve static assets
app.use("/assets/*", serveStatic({ root: "./dist/public" }));

// Serve index.html for all other routes (SPA routing)
app.get("/*", async (c) => {
  const path = c.req.path;
  if (path.startsWith("/api/")) {
    return c.json({ error: "Not found" }, 404);
  }
  try {
    return c.html(await Bun.file("./dist/public/index.html").text());
  } catch (error) {
    return c.json(
      { error: "Frontend not built. Run: bun run build:frontend" },
      500,
    );
  }
});

// 404 handler for API routes only
app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json(
    {
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
    500,
  );
});

// Start server
const port = parseInt(process.env.PORT || "3000");

console.log(`🚀 ArduinoAssess server starting on port ${port}`);
console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);

export default {
  fetch: app.fetch,
  port,
};
