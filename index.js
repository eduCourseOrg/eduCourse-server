import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import courseRoutes from "./Routes/courseRouter.js";
import instructorRouter from "./Routes/instructorRouter.js";
import studentRouter from "./Routes/studentRouter.js";
import { isAdmin } from "./Middlewares/index.js";

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Your eduCourse server is running");
});
app.use("/courses", courseRoutes);
app.use("/instructors", instructorRouter);
app.use("/students", studentRouter);

app.all("*", (req, res, next) => {
  return res
    .status(500)
    .json({ message: "Server is shutting down due to unauthorized access" })
    .end(() =>
      server.close(() => {
        console.log("Server closed due to unauthorized access.");
        process.exit(1);
        // setTimeout(() => {
        //   console.log("Restarting server...");
        //   const { spawn } = require("child_process");
        //   const nodemon = spawn("nodemon", ["index.js"]);

        //   nodemon.stdout.on("data", (data) => {
        //     console.log(`stdout: ${data}`);
        //   });

        //   nodemon.stderr.on("data", (data) => {
        //     console.error(`stderr: ${data}`);
        //   });

        //   nodemon.on("close", (code) => {
        //     console.log(`child process exited with code ${code}`);
        //   });
        // }, 10000);
      })
    );
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  // await client.close();
  process.exit(0);
});

const server = app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
