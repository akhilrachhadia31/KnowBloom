const isGuest = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    return res.status(403).json({ message: "Already logged in." });
  }

  next();

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const isGuest = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY);
    return res.status(403).json({ message: "Already logged in." });
  } catch (_) {
    res.cookie("token", "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
    });
    next();
  }
>>>>>>> e0bb359b91c4b7263b1c50098be3c68aee652981
};

export default isGuest;
