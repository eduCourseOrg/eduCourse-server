import { Collection } from "mongodb";
import { instructorCollection } from "../allCollections";
import { buildFilter, buildSort } from "../utils/filterUtils";

const express = require("express");
const router = express.Router();

router.get("/instructors", async (req, res) => {
  try {
    const {
      searchTerm = "",
      selectedSkills = "",
      sortBy = "",
      page = 1,
      limit = 10,
    } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;

    const filter = buildFilter(searchTerm, selectedSkills);
    const sort = buildSort(sortBy);

    const [instructors, totalCount] = await Promise.all([
      instructorCollection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitInt)
        .toArray(),
      Collection.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      message: "Instructors data retrieved successfully",
      data: instructors,
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
