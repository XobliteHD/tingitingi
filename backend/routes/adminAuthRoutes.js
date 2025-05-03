// backend/routes/adminAuthRoutes.js
import express from "express";
import AdminUser from "../models/AdminUser.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables.");
    return null;
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  try {
    const adminUser = await AdminUser.findOne({ email: email.toLowerCase() });

    if (adminUser && (await adminUser.matchPassword(password))) {
      const token = generateToken(adminUser._id);

      if (!token) {
        return res
          .status(500)
          .json({ message: "Server configuration error (JWT)" });
      }

      res.status(200).json({
        _id: adminUser._id,
        email: adminUser.email,
        token: token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

export default router;
