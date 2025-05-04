// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import houseApiRoutes from "./routes/houseRoutes.js";
import otherApiRoutes from "./routes/otherRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminBookingRoutes from "./routes/adminBookingRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminHouseRoutes from "./routes/adminHouseRoutes.js";
import adminOtherRoutes from "./routes/adminOtherRoutes.js";

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
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.options("*", cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use("/api/houses", houseApiRoutes);

app.use("/api/others", otherApiRoutes);

app.use("/api/bookings", bookingRoutes);

const setUploadType = (type) => (req, res, next) => {
  console.log(`Setting req.uploadType = ${type}`);
  req.uploadType = type;
  next();
};

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", protectAdmin);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/houses", setUploadType("house"), adminHouseRoutes);
app.use("/api/admin/others", setUploadType("other"), adminOtherRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
  console.log(`Serving static files from: ${frontendDistPath}`);

  app.use(express.static(frontendDistPath));

  app.get(/^\/(?!api).*/, (req, res) => {
    console.log(`Serving index.html for non-API GET request: ${req.path}`);
    res.sendFile(path.resolve(frontendDistPath, "index.html"));
  });
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
