import express from "express";
import { ObjectId } from "mongodb";
const router = express.Router();

import { courseCollection } from "../allCollections/index.js";
import { errorHandler } from "../Middlewares/index.js";

// router.get("/", async (req, res) => {
//   try {
//     const result = await courseCollection.find({}).toArray();
//     res.send({
//       success: true,
//       message: "Successfully retrieved data",
//       data: result,
//     });
//   } catch (error) {
//     errorHandler(error, res);
//   }
// });
router.get("/courses", async (req, res) => {
  try {
    const {
      searchTerm = "",
      selectedCategory = "",
      selectedCheckboxes = "",
      selectedLevelCheckboxes = "",
      page = 1,
      limit = 10,
    } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;

    const filter = buildCourseFilter(
      searchTerm,
      selectedCategory,
      selectedCheckboxes,
      selectedLevelCheckboxes
    );

    const [courses, totalCount] = await Promise.all([
      courseCollection.find(filter).skip(skip).limit(limitInt).toArray(),
      courseCollection.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      message: "Course data retrieved successfully",
      data: courses,
      pagination: {
        totalCount: totalCount,
        page: pageInt,
        limit: limitInt,
        totalPages: Math.ceil(totalCount / limitInt),
      },
    });
  } catch (error) {
    console.error(`Error fetching instructors: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching instructors",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
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
