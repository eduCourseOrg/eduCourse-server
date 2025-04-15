import { courseCollection } from "../allCollections";
import { buildCourseFilter } from "../utils/filterUtils";

const express = require("express");
const router = express.Router();

// router.get("/courses",isAdmin, async (req, res) => {
//   console.log("inside courses where i use mid isAdmin",req.cookies)
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

export default router;
