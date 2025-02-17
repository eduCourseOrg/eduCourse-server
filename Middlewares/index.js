import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from header

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.SECURITY_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user; // Attach user info to request
    next();
  });
};
