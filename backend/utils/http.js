// Forward asynchronous errors to the application's JSON error handler.
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve().then(() => handler(req, res, next)).catch(next);
const fail = (status, message) => Object.assign(new Error(message), { status, expose: true });
const objectId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
const requireId = (value) => { if (!objectId(value)) throw fail(400, "Invalid ID."); return value; };
const emailValue = (value) => {
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) throw fail(400, "A valid email is required.");
  return value.trim().toLowerCase();
};
const passwordValid = (value) => typeof value === "string" && Buffer.byteLength(value) <= 72 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
const pagination = (req) => {
  const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(page) || page < 1 || page > 10000) throw fail(400, "Invalid page or limit (maximum 100).");
  return { limit, skip: (page - 1) * limit };
};

// Keep database details and internal exceptions out of public responses.
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.code === 11000 ? 409 : ["ValidationError", "CastError", "StrictModeError"].includes(err.name) ? 400 : err.status || 500;
  if (status >= 500) console.error("Request failed:", err.message);
  res.status(status).json({ message: status >= 500 && !err.expose ? "Internal server error." : err.code === 11000 ? "Record already exists." : err.message });
};
module.exports = { asyncHandler, fail, objectId, requireId, emailValue, passwordValid, pagination, errorHandler };
