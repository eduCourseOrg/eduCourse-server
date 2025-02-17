const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 5000;

const {
  courseCollection,
  instructorCollection,
  studentCollection,
  paymentCollection,
} = require("./allCollections");

const { isAdmin } = require("./Middlewares");

export const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Your eduCourse server is running");
});

try {
  app.get("/courses", async (req, res) => {
    const result = await courseCollection.find({}).toArray();
    res.send({
      success: true,
      message: "Successfully Get data",
      data: result,
    });
  });
} catch (error) {
  console.log({ error: error.message });
}

app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
