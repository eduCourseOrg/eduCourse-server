import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import courseRoutes from "./Routes/courseRouter.js";
import instructorRouter from "./Routes/instructorRouter.js";
import studentRouter from "./Routes/studentRouter.js";
dotenv.config();

import bodyParser from "body-parser";
const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

app.get("/", (req, res) => {
  res.send("Your eduCourse server is running");
});
app.use("/courses", courseRoutes);
app.use("/instructors", instructorRouter);
app.use("/students", studentRouter);
app.use("/uploads", express.static("uploads"));


app.all("*", (req, res, next) => {
  return res
    .status(500)
    .json({ message: "Server is shutting down due to unauthorized access" });
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  // await client.close();
  process.exit(0);
});

const server = app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
