const express = require("express");
const router = express.Router();

try {
  router.get("/courses",isAdmin, async (req, res) => {
    console.log("inside courses where i use mid isAdmin",req.cookies)
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
