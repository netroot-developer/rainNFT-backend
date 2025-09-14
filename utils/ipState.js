/* -------- Hard 5-min IP block support (in-memory) -------- */
const ipState = new Map(); // ip -> { blockedUntil: number }
exports.ipBlocker = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const s = ipState.get(ip);
  if (s && s.blockedUntil && now < s.blockedUntil) {
    const secs = Math.ceil((s.blockedUntil - now) / 1000);
    res.setHeader("Retry-After", secs);
    return res.status(429).json({ success: false, message: `Too many requests. Try again in ${secs}s.` });
  }
  next();
}