const express = require("express");
const router = express.Router();

try {
  router.get("/courses", async (req, res) => {
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
export default router;
