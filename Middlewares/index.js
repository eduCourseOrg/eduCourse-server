import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

export const isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
console.log("inside isAdmin middleware")
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.SECURITY_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user;
    next();
  });
};

export const errorHandler = (err, res) => {
  let status = err.status || 500;

  if (err.name === "ValidationError") {
    status = 400;
  } else if (err.name === "UnauthorizedError") {
    status = 401;
  } else if (err.name === "ForbiddenError") {
    status = 403;
  }

  const stackTrace = err.stack;
  const lines = stackTrace.split("\n");
  const errorLine = lines[1];
  const match = errorLine.match(/^(.*?):(\d+):(\d+)$/);

  const stack = {};

  if (match) {
    const path = match[1];
    const lineNumber = match[2];
    const columnNumber = match[3];
    stack.Path = path;
    (stack.LineNumber = lineNumber), (stack.columnNumber = columnNumber);
  } else {
    stack.Path = "Could not found path and line number";
  }

  return res.status(status).json({
    message: err.message || "Internal Server Error",
    error: {
      name: err.name,
      stack,
    },
  });
};
