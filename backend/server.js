// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import houseApiRoutes from "./routes/houseRoutes.js";
import spaceApiRoutes from "./routes/spaceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminBookingRoutes from "./routes/adminBookingRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminHouseRoutes from "./routes/adminHouseRoutes.js";
import adminSpaceRoutes from "./routes/adminSpaceRoutes.js";
import adminArticleRoutes from "./routes/adminArticleRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

import { protectAdmin } from "./middleware/authMiddleware.js";

import { configureCloudinary } from "./config/cloudinaryConfig.js";

import "./config/mailConfig.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();
configureCloudinary();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.1.38:3000",
  "http://localhost:5000",
  "http://26.159.109.192:3000",
];

const productionFrontendUrl = process.env.FRONTEND_URL;

if (productionFrontendUrl) {
  console.log(
    `Adding production frontend URL to CORS allowed origins: ${productionFrontendUrl}`
  );
  allowedOrigins.push(productionFrontendUrl);
} else {
  console.log("Production FRONTEND_URL not set in environment variables.");
}

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS check: Request Origin Header ->", origin);
      console.log("CORS check: Allowed Origins ->", allowedOrigins);

      if (!origin || allowedOrigins.includes(origin)) {
        console.log("CORS check: Origin ALLOWED");
        callback(null, true);
      } else {
        console.error(
          `CORS check: Origin DENIED - ${origin} is not in allowedOrigins.`
        );
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);


app.use(express.json());

app.use(express.urlencoded({ extended: false }));

console.log("DEBUG: Defining routes START");

app.use("/api/houses", houseApiRoutes);

app.use("/api/spaces", spaceApiRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/blog", articleRoutes);

const setUploadType = (type) => (req, res, next) => {
  console.log(`Setting req.uploadType = ${type}`);
  req.uploadType = type;
  next();
};

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", protectAdmin);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/houses", setUploadType("house"), adminHouseRoutes);
app.use("/api/admin/spaces", setUploadType("space"), adminSpaceRoutes);
app.use("/api/admin/blog", setUploadType("blog"), adminArticleRoutes);

console.log("DEBUG: Defining routes END");

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
  console.log(`Serving static files from: ${frontendDistPath}`);

  app.get(/^\/(?!api).*/, (req, res, next) => {
    if (
      path.extname(req.path).length > 0 &&
      path.extname(req.path) !== ".html"
    ) {
      console.log(
        `DEBUG: Static asset check PASSED for ${req.path}, calling next().`
      );
      return next();
    }
    console.log(
      `DEBUG: Serving index.html for non-API GET request: ${req.path}`
    );
    const indexHtmlPath = path.resolve(frontendDistPath, "index.html");
    res.sendFile(indexHtmlPath, (err) => {});
  });

  app.use(express.static(frontendDistPath));
} else {
  app.get("/", (req, res) => {
    res.send("API is running in development mode...");
  });
}

app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});
