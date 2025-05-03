import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";

const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET not defined in environment variables!");
        return res
          .status(500)
          .json({ message: "Server configuration error (JWT Secret)" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({
            message: "Not authorized, token failed (invalid signature)",
          });
      }
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Not authorized, token expired" });
      }
      return res
        .status(401)
        .json({ message: "Not authorized, token verification failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

export { protectAdmin };
