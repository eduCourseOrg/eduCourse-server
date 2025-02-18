import express from "express";
import { ObjectId } from "mongodb";
const router = express.Router();

import { courseCollection } from "../allCollections/index.js";
import { errorHandler } from "../Middlewares/index.js";

router.get("/", async (req, res) => {
  try {
    const result = await courseCollection.find({}).toArray();
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
    console.log(id, "id");
    const result = await courseCollection.findOne({ _id: new ObjectId(id) });
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
