const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Your eduCourse server is running");
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
  const courseCollection = client.db("eduCourse").collection("courses");
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
