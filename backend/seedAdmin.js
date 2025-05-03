import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import AdminUser from "./models/AdminUser.js";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const seedAdmin = async () => {
  let connection;
  try {
    await connectDB();
    const adminExists = await AdminUser.findOne({ email: ADMIN_EMAIL });

    if (adminExists) {
      console.log(`Admin user with email ${ADMIN_EMAIL} already exists.`);
      return;
    }

    console.log(`Creating admin user ${ADMIN_EMAIL}...`);
    const newAdmin = new AdminUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    await newAdmin.save();

    console.log(`Admin user ${ADMIN_EMAIL} created successfully!`);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    }
  }
};

seedAdmin();
