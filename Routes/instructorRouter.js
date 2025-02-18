import express from "express";
import { ObjectId } from "mongodb";
const router = express.Router();

import { errorHandler } from "../Middlewares/index.js";
import { instructorCollection } from "../allCollections/index.js";

router.get("/", async (req, res) => {
  try {
    const result = await instructorCollection.find({}).toArray();
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
    const result = await instructorCollection.findOne({
      _id: new ObjectId(id),
    });
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
