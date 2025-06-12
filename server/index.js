import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRouter from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import passport from "passport";
import session from "express-session";
import helmet from "helmet";
import "./passport.js";
import history from "connect-history-api-fallback";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Trust proxy for secure cookies (needed on Render or reverse proxy)
app.set("trust proxy", 1);

// 🧾 Stripe webhook route (must be raw)
app.use(
  "/api/v1/purchaseCourse/webhook",
  express.raw({ type: "application/json" })
);

// 🌍 Enable CORS for frontend
app.use(
  cors({
    origin: "https://knowbloom.onrender.com", // replace with your frontend domain
    credentials: true,
  })
);

// 🧱 Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🛡️ Secure headers
app.use(helmet());

// 🔐 Session and Passport setup
app.use(
  session({
    secret: process.env.SECRET_KEY || "your-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none",
      secure: true,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 🧪 Log request origin (for debugging)
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

// 🔗 API routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRouter);
app.use("/api/v1/progress", courseProgressRoute);

// 🔘 Basic health route
app.get("/", (req, res) => {
  res.send("KnowBloom backend is running!");
});

// 📦 Serve frontend (static build)
const __dirname = path.resolve();
app.use(
  history({
    index: "/index.html",
    verbose: true,
  })
);
app.use(express.static(path.join(__dirname, "../client/dist")));

// ❌ Error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});
