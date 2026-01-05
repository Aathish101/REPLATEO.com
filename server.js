import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { analyzeFoodImage } from "./foodAnalyzer.js";
import { logAnalysis } from "./csvStorage.js";

dotenv.config();

const app = express();

/**
 * ✅ FIXED CORS (MUST BE HERE)
 */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://replateocom-production.up.railway.app",
      "https://replateo.web.app",
      "https://replateo.firebaseapp.com",
    ],
    methods: ["GET", "POST"],
  })
);

/**
 * Body parsers (AFTER CORS)
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Multer Configuration (in-memory upload)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images allowed."));
    }
  },
});

/**
 * ✅ Health Check
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "food-safety-analyzer-node",
  });
});

/**
 * 🍱 Analyze Food Endpoint
 */
app.post("/api/analyze-food", upload.single("image"), async (req, res) => {
  try {
    // Validate image
    if (!req.file) {
      return res.status(400).json({
        classification: "NOT-EDIBLE",
        confidence: 0,
        reasoning: "Image file is required",
      });
    }

    const { preparationTime, packageTime } = req.body;

    // Validate times
    if (!preparationTime || !packageTime) {
      return res.status(400).json({
        classification: "NOT-EDIBLE",
        confidence: 0,
        reasoning: "Preparation time and package time are required",
      });
    }

    // Analyze with AI
    const result = await analyzeFoodImage(
      req.file.buffer,
      preparationTime,
      packageTime,
      req.file.mimetype
    );

    // Log result
    await logAnalysis({
      imageFilename: req.file.originalname,
      preparationTime,
      packageTime,
      analysisResult: result,
    });

    // Send response
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Analysis Error:", error);
    res.status(500).json({
      classification: "NOT-EDIBLE",
      confidence: 0,
      reasoning: error.message || "Server error during analysis",
    });
  }
});

/**
 * 🚀 Start Server
 */
app.listen(PORT, () => {
  console.log(`✅ Food Safety API running on http://localhost:${PORT}`);
  console.log(`🌍 CORS enabled for http://localhost:5173`);
});
