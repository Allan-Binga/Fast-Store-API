// Load environment settings exactly once, before importing controllers or services.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { fail, errorHandler } = require("./utils/http");
const rateLimit = require("./middleware/rateLimit");
const app = express();

// Preserve the Vite origin and allow explicitly configured deployment origins.
const allowedOrigins = new Set(["http://localhost:5173", ...(process.env.CORS_ORIGINS || "").split(","), process.env.CLIENT_URL].filter(Boolean).map(v => v.trim()));
const corsOptions = {
  origin(origin, callback) { callback(!origin || allowedOrigins.has(origin) ? null : fail(403, "Origin is not allowed."), true); },
  credentials: true,
};
app.use(cors(corsOptions));
// Cookie-authenticated writes reject untrusted browser origins before execution.
app.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && req.get("Origin") && !allowedOrigins.has(req.get("Origin"))) return next(fail(403, "Origin is not allowed."));
  next();
});
// Stripe signature verification requires the untouched request body.
app.use("/api/webhook", require("./routes/webhook"));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// Account and messaging throttles are independent from normal browsing.
for (const prefix of ["auth", "password", "verify", "phone"]) app.use(`/api/${prefix}`, rateLimit(prefix === "auth" ? 60 : 20));
const routes = { auth: "auth", verify: "emailService", phone: "phoneService", products: "product", categories: "category", flashsale: "flashsales", promo: "promo", brands: "brand", wishlist: "wishlist", cart: "cart", users: "users", checkout: "checkout", orders: "orders", address: "address", password: "password", notifications: "notification" };
for (const [prefix, file] of Object.entries(routes)) app.use(`/api/${prefix}`, require(`./routes/${file}`));

// Liveness and readiness are separate for deployment health checks.
app.get("/health/live", (req, res) => res.json({ status: "ok" }));
app.get("/health/ready", (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ ready: mongoose.connection.readyState === 1 }));
app.use((req, res) => res.status(404).json({ message: "Endpoint not found." }));
app.use(errorHandler);

// Do not accept traffic until required configuration and MongoDB are ready.
async function start() {
  for (const key of ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "CLIENT_URL"]) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
  for (const key of ["JWT_SECRET", "JWT_REFRESH_SECRET"]) if (process.env[key].length < 32) throw new Error(`${key} must contain at least 32 characters.`);
  if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) throw new Error("Access and refresh secrets must differ.");
  await mongoose.connect(process.env.MONGO_URI, { autoIndex: process.env.NODE_ENV !== "production" });
  const server = app.listen(Number(process.env.PORT) || 5500, () => console.log("Backend is ready."));
  // Reconciliation is serialized within this process and safe across replicas via transactions.
  let reconciling = false;
  const timer = setInterval(async () => {
    if (reconciling) return;
    reconciling = true;
    try { await require("./services/reconcile").reconcileOrders(); }
    catch (err) { console.error("Order reconciliation failed:", err.message); }
    finally { reconciling = false; }
  }, 60000);
  timer.unref();
  // Stop accepting traffic before closing the database on deployment shutdown.
  const shutdown = () => { clearInterval(timer); server.close(async () => { await mongoose.disconnect(); process.exit(0); }); setTimeout(() => process.exit(1), 10000).unref(); };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
  return server;
}
if (require.main === module) start().catch(err => { console.error("Startup failed:", err.message); process.exit(1); });
module.exports = { app, start };
