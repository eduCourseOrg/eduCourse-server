import express from "express";
import { bucket } from "../allCollections/index.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { video, filename } = req.body;
    if (!video || !filename) {
      res.status(400).json({ error: "Missing video or filename" });
    }
    const buffer = Buffer.from(video, "base64");
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: "video/mp4",
    });
    uploadStream.end(buffer);
    uploadStream.on("finish", () => {
      res.json({
        message: "Video uploaded Successfully",
        id: uploadStream.id.toString(),
      });
    });
  } catch (error) {
    console.error("upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
