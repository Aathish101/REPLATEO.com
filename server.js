import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { analyzeFoodImage } from "./foodAnalyzer.js";
import { logAnalysis } from "./csvStorage.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
}));

// Configure Multer for memory storage (files are processed in memory)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP"));
        }
    }
});

// Middleware for parsing JSON and form data not handled by multer
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health Check Endpoint
 */
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "food-safety-analyzer-node"
    });
});

/**
 * Analyze Food Endpoint
 */
app.post("/api/analyze-food", (req, res, next) => {
    // Wrap in try-catch block is not enough for multer middlewares, so we wrap the upload call
    // Actually standard pattern is `upload.single('image')` as middleware
    // We will use a wrapper to handle multer errors gracefully
    const uploadSingle = upload.single("image");

    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                error: err.message,
                classification: "NOT-EDIBLE",
                confidence: 0.0,
                reasoning: "Invalid file or upload error"
            });
        }

        try {
            // Validate Image
            if (!req.file) {
                return res.status(400).json({
                    error: "No image file provided",
                    classification: "NOT-EDIBLE",
                    confidence: 0.0,
                    reasoning: "Image is required for food safety analysis"
                });
            }

            // Validate Form Data
            const { preparationTime, packageTime } = req.body;

            if (!preparationTime) {
                return res.status(400).json({
                    error: "Preparation time is required",
                    classification: "NOT-EDIBLE",
                    confidence: 0.0,
                    reasoning: "Preparation time is needed for time-temperature analysis"
                });
            }

            if (!packageTime) {
                return res.status(400).json({
                    error: "Package time is required",
                    classification: "NOT-EDIBLE",
                    confidence: 0.0,
                    reasoning: "Package time is needed for time-temperature analysis"
                });
            }

            // Analyze
            const result = await analyzeFoodImage(
                req.file.buffer,
                preparationTime,
                packageTime,
                req.file.mimetype
            );

            // Log
            await logAnalysis({
                imageFilename: req.file.originalname,
                preparationTime,
                packageTime,
                analysisResult: result
            });

            // Return
            return res.status(200).json(result);

        } catch (error) {
            console.error("Server Error:", error);
            return res.status(500).json({
                error: error.message,
                classification: "NOT-EDIBLE",
                confidence: 0.0,
                reasoning: `Analysis failed due to server error: ${error.message}`
            });
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Starting Food Safety Analysis API (Node.js) on port ${PORT}`);
    console.log(`CORS enabled for: http://localhost:5173`);
});
