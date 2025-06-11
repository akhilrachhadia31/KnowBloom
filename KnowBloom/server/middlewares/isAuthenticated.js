import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({
        message: "User not authorized. Token missing.",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded?.userId) {
      return res.status(401).json({
        message: "Invalid token structure.",
        success: false,
      });
    }

    req.id = decoded.userId; // Attach userId to request
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token.",
      success: false,
    });
  }
};

export default isAuthenticated;
