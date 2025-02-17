import express from "express";
import { ObjectId } from "mongodb";
const router = express.Router();

// import { studentCollection } from "../allCollections";
import { errorHandler } from "../Middlewares/index.js";

router.get("/", async (req, res) => {
  try {
    const result = await studentCollection.find({}).toArray();
    res.send({
      success: true,
      message: "Successfully retrieved data",
      data: result,
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await studentCollection.find({ _id: new ObjectId(id) });
    res.send({
      success: true,
      message: "Successfully retrieved data",
      data: result,
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

export default router;
