// Bounded, per-process throttling for account and messaging endpoints.
// Multi-instance deployments should replace this with a shared gateway/store.
const rateLimit = (limit = 20, windowMs = 15 * 60 * 1000) => {
  const clients = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of clients) if (value.until <= now) clients.delete(key);
    const key = req.ip;
    const entry = clients.get(key) || { count: 0, until: now + windowMs };
    if (!clients.has(key) && clients.size >= 10000) return res.status(429).json({ message: "Please try again later." });
    entry.count++;
    clients.set(key, entry);
    if (entry.count > limit) { res.set("Retry-After", String(Math.ceil((entry.until - now) / 1000))); return res.status(429).json({ message: "Too many requests. Please try again later." }); }
    next();
  };
};
module.exports = rateLimit;
