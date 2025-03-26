const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

//USER ID MIDDLEWARE
const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.storeSession;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized. Please login" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    req.userId = decoded.user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = { authMiddleware };
