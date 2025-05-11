import express from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
import path from "path";
import { errorHandler } from "../Middlewares/index.js";
import { instructorCollection } from "../allCollections/index.js";
import { buildBlogFilter, buildSort } from "../utils/filterUtils.js";

const router = express.Router();

// Serve uploaded files statically
router.use("/uploads", express.static("uploads"));

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder for uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
}); // File filter to check valid file types
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];
  const allowedDocTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (
    file.fieldname === "profile" &&
    !allowedImageTypes.includes(file.mimetype)
  ) {
    return cb(
      new Error("Profile picture must be an image (JPG, PNG, WEBP)"),
      false
    );
  }

  if (
    file.fieldname === "resume" &&
    ![...allowedDocTypes, ...allowedImageTypes].includes(file.mimetype)
  ) {
    return cb(new Error("Resume must be a PDF, DOC, DOCX, or an image"), false);
  }

  cb(null, true);
};

// Configure multer
const upload = multer({ storage: storage, fileFilter: fileFilter });

/** 🟢 GET: Fetch all instructors **/
// router.get("/", async (req, res) => {
//   try {
//     const result = await instructorCollection.find({}).toArray();
//     res.send({
//       success: true,
//       message: "Successfully retrieved data",
//       data: result,
//     });
//   } catch (error) {
//     errorHandler(error, res);
//   }
// });
router.get("/", async (req, res) => {
  try {
    const {
      searchTerm = "",
      selectedCategory = "",
      sortBy = "ratings:desc",
      page = 1,
      limit = 10,
    } = req.query;
    // console.log(req.query);
    console.log(sortBy, "sortBy");

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;
    const sort = buildSort(sortBy);
    const filter = buildBlogFilter(searchTerm, selectedCategory);
    console.log("blog-filter", filter);

    console.log("aggriatae", filter);
    const result = await blogCollection
      .aggregate([
        {
          $facet: {
            // Paginated results (affected by filters)
            paginatedResults: [
              { $match: filter }, // Applied filters
              { $sort: { publishedAt: -1 } },
              { $skip: skip },
              { $limit: limitInt },
              {
                $project: {
                  title: 1,
                  slug: 1,
                  excerpt: 1,
                  publishedAt: 1,
                  authorName: 1,
                  "category.categoryName": 1,
                  "category.categoryId": 1,
                  thumbnailUrl: 1,
                  tags: 1,
                },
              },
            ],
            // Total count (affected by filters)
            totalCount: [{ $match: filter }, { $count: "count" }],
            // All categories (UNFILTERED - shows all possible categories)
            categories: [
              {
                $group: {
                  _id: "$category.categoryId",
                  categoryName: { $first: "$category.categoryName" },
                  count: { $sum: 1 }, // Total count across all documents
                },
              },
              { $sort: { categoryName: 1 } },
              {
                $project: {
                  _id: 0,
                  value: "$_id",
                  label: "$categoryName",
                  count: 1,
                },
              },
            ],
            // All tags (UNFILTERED - shows all possible tags)
            tags: [
              { $unwind: "$tags" },
              {
                $group: {
                  _id: "$tags",
                  count: { $sum: 1 }, // Total count across all documents
                },
              },
              { $sort: { _id: 1 } },
              {
                $project: {
                  _id: 0,
                  value: "$_id",
                  label: "$_id",
                  count: 1,
                },
              },
            ],
            // Archives (UNFILTERED - shows all date groupings)
            archives: [
              {
                $project: {
                  year: { $year: "$publishedAt" },
                  month: { $month: "$publishedAt" },
                },
              },
              {
                $group: {
                  _id: { year: "$year", month: "$month" },
                  count: { $sum: 1 }, // Total count across all documents
                },
              },
              { $sort: { "_id.year": -1, "_id.month": -1 } },
              {
                $project: {
                  _id: 0,
                  year: "$_id.year",
                  month: "$_id.month",
                  count: 1,
                },
              },
            ],
          },
        },
      ])
      .toArray();

    const { paginationResults, totalCount, allSkill } = result[0];
    console.log(allSkill, "allSkill");

    const total = totalCount[0]?.count || 0;
    res.status(200).json({
      success: true,
      message: "Blog data retrieved successfully",
      data: paginationResults,
      filterOptions: {
        skills: allSkill || [],
      },

      total: totalCount[0]?.count || 0,
      pagination: {
        totalCount: total,
        page: pageInt,
        limit: limitInt,
        totalPages: Math.ceil(totalCount / limitInt),
      },
    });
  } catch (error) {
    console.error(`Error fetching blogs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
    });
  }
});

/** 🔴 POST: Submit instructor data with file upload **/
router.post(
  "/",
  upload.fields([{ name: "profile" }, { name: "resume" }]),
  async (req, res) => {
    try {
      const blogData = req.body;

      // Ensure files exist before adding to response
      if (req.files.profile && req.files.profile.length > 0) {
        blogData.profileUrl = `/uploads/${req.files.profile[0].filename}`;
      }
      if (req.files.resume && req.files.resume.length > 0) {
        blogData.resumeUrl = `/uploads/${req.files.resume[0].filename}`;
      }

      // Insert instructor data into the database
      const result = await blogCollection.insertOne(blogData);

      res.status(201).send({
        success: true,
        message: "Instructor data submitted successfully!",
        insertedId: result.insertedId,
        profileUrl: blogData.profileUrl || null,
        resumeUrl: blogData.resumeUrl || null,
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

/** 🔵 GET: Fetch instructor by ID **/
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id, "blog id");
    const result = await blogCollection.findOne({
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
