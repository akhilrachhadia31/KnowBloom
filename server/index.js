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

app.use(
  "/api/v1/purchaseCourse/webhook",
  express.raw({ type: "application/json" })
);

app.use((req, res, next) => {
  console.log("Incoming request origin:", req.headers.origin);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "https://knowbloom.onrender.com",
    credentials: true,
  })
);

app.use(helmet());

app.use(
  session({
    secret: process.env.SECRET_KEY || "your-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none", // Required for cross-site cookies (Render uses 2 domains)
      secure: true, // Required for HTTPS
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRouter);
app.use("/api/v1/progress", courseProgressRoute);

app.get("/", (req, res) => {
  res.send("KnowBloom backend is running!");
});

// Serve static React frontend assets
const __dirname = path.resolve();
app.use(
  history({
    index: "/index.html",
    verbose: true,
  })
);
app.use(express.static(path.join(__dirname, "../client/dist"))); // Adjust path if needed

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler for API or other undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});
