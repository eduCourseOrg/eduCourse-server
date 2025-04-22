import express from "express";
import { ObjectId } from "mongodb";
const router = express.Router();

import { courseCollection } from "../allCollections/index.js";
import { errorHandler } from "../Middlewares/index.js";
import { buildCourseFilter } from "../utils/filterUtils.js";


router.get("/", async (req, res) => {
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
  
      // Run aggregation with independent facets
      const result = await courseCollection.aggregate([
        {
          $facet: {
            // Filtered results for pagination
            paginatedResults: [
              { $match: filter },
              { $skip: skip },
              { $limit: limitInt },
              {
                $project: {
                  name: 1,
                  category: 1,
                  courseLevel: 1,
                  description: 1,
                  ratings: 1,
                  enrolledCount: 1,
                  banner: 1,
                  // Include other fields you need
                },
              },
            ],
            // Total count for pagination (uses the same filter)
            totalCount: [
              { $match: filter },
              { $count: "count" },
            ],
            // All categories (unfiltered)
            allCategories: [
              { $group: { _id: "$category" } },
              { $sort: { _id: 1 } }, // Optional: sort alphabetically
              { $project: { _id: 0, value: "$_id", label: "$_id" } }, // Better format for frontend
            ],
            // All levels (unfiltered)
            allLevels: [
              { $group: { _id: "$courseLevel" } },
              { $sort: { _id: 1 } }, // Optional: sort alphabetically
              { $project: { _id: 0, value: "$_id", label: "$_id" } }, // Better format for frontend
            ],
          },
        },
      ]).toArray();
  
      const { paginatedResults, totalCount, allCategories, allLevels } = result[0];
      const total = totalCount[0]?.count || 0;
      const totalPages = Math.ceil(total / limitInt);
  
      res.status(200).json({
        success: true,
        message: "Course data retrieved successfully",
        data: paginatedResults,
        filterOptions: {
          categories: allCategories || [],
          levels: allLevels || [],
        },
        pagination: {
          totalCount: total,
          page: pageInt,
          limit: limitInt,
          totalPages,
        },
      });
    } catch (error) {
      console.error(`Error fetching Courses: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Error fetching Courses",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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



  