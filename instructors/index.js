import { instructorCollection } from "../allCollections";

const express = require("express");
const router = express.Router();

try {
  router.get("/instructors", async (req, res) => {
    const result = await instructorCollection.find({}).toArray();
    res.send({
      success: true,
      message: "Instructors data retrieved successfully",
      data: result,
    });
  });
} catch (error) {
  console.log({ error: error.message });
}
export default router;
