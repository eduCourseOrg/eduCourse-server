import express from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
import path from "path";
import { errorHandler } from "../Middlewares/index.js";
import { instructorCollection } from "../allCollections/index.js";

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
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});// File filter to check valid file types
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const allowedDocTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

  if (file.fieldname === "profile" && !allowedImageTypes.includes(file.mimetype)) {
    return cb(new Error("Profile picture must be an image (JPG, PNG, WEBP)"), false);
  }

  if (file.fieldname === "resume" && ![...allowedDocTypes, ...allowedImageTypes].includes(file.mimetype)) {
    return cb(new Error("Resume must be a PDF, DOC, DOCX, or an image"), false);
  }

  cb(null, true);
};

// Configure multer
const upload = multer({ storage: storage, fileFilter: fileFilter });

/** 🟢 GET: Fetch all instructors **/
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

/** 🔴 POST: Submit instructor data with file upload **/
router.post("/", upload.fields([{ name: "profile" }, { name: "resume" }]), async (req, res) => {
  try {
    const instructorData = req.body;

    // Ensure files exist before adding to response
    if (req.files.profile && req.files.profile.length > 0) {
      instructorData.profileUrl = `/uploads/${req.files.profile[0].filename}`;
    }
    if (req.files.resume && req.files.resume.length > 0) {
      instructorData.resumeUrl = `/uploads/${req.files.resume[0].filename}`;
    }

    // Insert instructor data into the database
    const result = await instructorCollection.insertOne(instructorData);

    res.status(201).send({
      success: true,
      message: "Instructor data submitted successfully!",
      insertedId: result.insertedId,
      profileUrl: instructorData.profileUrl || null,
      resumeUrl: instructorData.resumeUrl || null,
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

/** 🔵 GET: Fetch instructor by ID **/
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id, "instructor id");
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
