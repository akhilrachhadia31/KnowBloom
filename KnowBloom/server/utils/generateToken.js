import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign(
    { id: user._id }, // ← use `id` so your auth middleware can read req.id
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );

  const isProd = process.env.NODE_ENV === "production";

  // set cookie with proper SameSite & secure flags
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd, // HTTPS-only in production
    sameSite: isProd ? "none" : "lax", // cross-site in prod, lax for localhost
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return res.status(200).json({
    success: true,
    message,
    user,
  });
};
