process.env.JWT_SECRET = "access-test-secret-that-is-not-for-production";
process.env.JWT_REFRESH_SECRET = "refresh-test-secret-that-is-not-for-production";
process.env.CLIENT_URL = "http://localhost:5173";
const request = require("supertest");
const { app } = require("../index");

// HTTP-level checks catch missing middleware imports and CORS registration errors.
test("Vite receives credentialed CORS headers", async () => {
  const result = await request(app).get("/health/live").set("Origin", "http://localhost:5173");
  expect(result.status).toBe(200);
  expect(result.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  expect(result.headers["access-control-allow-credentials"]).toBe("true");
});
test("untrusted browser origins are rejected", async () => {
  const result = await request(app).post("/api/auth/logout").set("Origin", "https://untrusted.example");
  expect(result.status).toBe(403);
});
test.each(["/api/users", "/api/orders", "/api/cart", "/api/wishlist", "/api/address/user"])("private endpoint %s rejects anonymous access", async path => {
  expect((await request(app).get(path)).status).toBe(401);
});
test.each(["/api/products/add-new", "/api/brands/add", "/api/flashsale/add", "/api/promo/add", "/api/notifications", "/api/phone"])("management endpoint %s rejects anonymous writes", async path => {
  expect((await request(app).post(path).send({})).status).toBe(401);
});
test("readiness remains unavailable without a database connection", async () => {
  expect((await request(app).get("/health/ready")).status).toBe(503);
});
