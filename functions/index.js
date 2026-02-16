import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import functions from "firebase-functions";

import { analyzeFoodImage } from "./foodAnalyzer.js";
import { logAnalysis } from "./csvStorage.js";

// Load env (only for local emulator)
dotenv.config();

const app = express();

/* =========================
   CORS CONFIG
========================= */
app.use(
  cors({
    origin: true, // allow all (web + mobile)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================
   BODY PARSERS
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   MULTER CONFIG
========================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = file.originalname.toLowerCase().split(".").pop();
    const validExt = allowedTypes.test(ext);
    const validMime = allowedTypes.test(file.mimetype);

    if (validExt && validMime) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Use JPG, PNG, GIF, WEBP"));
    }
  },
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "replateo-food-safety-api",
  });
});

/* =========================
   ANALYZE FOOD
========================= */
app.post("/api/analyze-food", (req, res) => {
  const uploadSingle = upload.single("image");

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        error: err.message,
        classification: "NOT-EDIBLE",
        confidence: 0.0,
        reasoning: "File upload error",
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Image required",
          classification: "NOT-EDIBLE",
          confidence: 0.0,
        });
      }

      const { preparationTime, packageTime } = req.body;

      if (!preparationTime || !packageTime) {
        return res.status(400).json({
          error: "Times required",
          classification: "NOT-EDIBLE",
          confidence: 0.0,
        });
      }

      const result = await analyzeFoodImage(
        req.file.buffer,
        preparationTime,
        packageTime,
        req.file.mimetype
      );

      await logAnalysis({
        imageFilename: req.file.originalname,
        preparationTime,
        packageTime,
        analysisResult: result,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Server Error:", error);
      return res.status(500).json({
        error: error.message,
        classification: "NOT-EDIBLE",
        confidence: 0.0,
      });
    }
  });
});

/* =========================
   EXPORT FOR FIREBASE
========================= */
export const api = functions.https.onRequest(app);
