// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

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
connectDB();
configureCloudinary();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ["http://localhost:3000", "http://192.168.1.38:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello from Tingitingi Backend Root!");
});

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

app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});
