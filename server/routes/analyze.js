import path from "path";

import express from "express";
import multer from "multer";

import { analyzeStlBuffer } from "../utils/stlParser.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (extension !== ".stl") {
      cb(
        Object.assign(new Error("Only .stl files are supported."), {
          statusCode: 400,
        }),
      );
      return;
    }

    cb(null, true);
  },
});

router.post("/", (req, res, next) => {
  upload.single("file")(req, res, async (error) => {
    if (error) {
      next(error);
      return;
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Please upload an STL file in the `file` field.",
        });
      }

      const geometry = await analyzeStlBuffer(req.file.buffer);

      return res.json({
        file_name: req.file.originalname,
        file_size_bytes: req.file.size,
        geometry,
      });
    } catch (parseError) {
      return next({
        statusCode: 422,
        message:
          parseError instanceof Error
            ? `STL parse failed: ${parseError.message}`
            : "STL parse failed.",
      });
    }
  });
});

export default router;
