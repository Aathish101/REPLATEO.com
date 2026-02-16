import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { getSystemPrompt } from "./systemPrompt.js";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Robust JSON extraction from AI response
 * Handles various edge cases like markdown, text wrapping, etc.
 */
function extractJsonFromResponse(responseText) {
    if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from AI");
    }

    let text = responseText.trim();
    console.log("[JSON Extraction] Input length:", text.length);

    // Method 1: Direct parse
    try {
        const result = JSON.parse(text);
        console.log("[JSON Extraction] Direct parse succeeded");
        return result;
    } catch (e) {
        // Continue
    }

    // Method 2: Remove markdown code blocks (```json ... ``` or ``` ... ```)
    const codeBlockPatterns = [
        /```json\s*([\s\S]*?)```/gi,
        /```\s*([\s\S]*?)```/gi
    ];

    for (const pattern of codeBlockPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            for (const match of matches) {
                const inner = match.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
                try {
                    const result = JSON.parse(inner);
                    console.log("[JSON Extraction] Code block extraction succeeded");
                    return result;
                } catch (e) {
                    // Try next
                }
            }
        }
    }

    // Method 3: Find JSON object by matching braces
    let braceCount = 0;
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
            if (braceCount === 0) startIndex = i;
            braceCount++;
        } else if (text[i] === '}') {
            braceCount--;
            if (braceCount === 0 && startIndex !== -1) {
                endIndex = i;
                break;
            }
        }
    }

    if (startIndex !== -1 && endIndex !== -1) {
        const jsonStr = text.substring(startIndex, endIndex + 1);
        try {
            const result = JSON.parse(jsonStr);
            console.log("[JSON Extraction] Brace matching succeeded");
            return result;
        } catch (e) {
            // Try fixing common issues
            let fixed = jsonStr;
            // Remove trailing commas before } or ]
            fixed = fixed.replace(/,(\s*[}\]])/g, "$1");
            // Fix unquoted keys (basic)
            fixed = fixed.replace(/(\{|\,)\s*(\w+)\s*:/g, '$1"$2":');
            try {
                const result = JSON.parse(fixed);
                console.log("[JSON Extraction] Fixed JSON parse succeeded");
                return result;
            } catch (e2) {
                // Continue
            }
        }
    }

    // Method 4: Regex extraction of key fields as last resort
    console.log("[JSON Extraction] Falling back to regex field extraction");
    const result = {};

    // Extract classification
    const classMatch = text.match(/["']?classification["']?\s*[:=]\s*["']?(EDIBLE|NOT-EDIBLE)["']?/i);
    if (classMatch) result.classification = classMatch[1].toUpperCase();

    // Extract decision
    const decisionMatch = text.match(/["']?decision["']?\s*[:=]\s*["']?(SAFE_FOR_DONATION|SAFE_WITH_ADVISORY|DISCARD)["']?/i);
    if (decisionMatch) result.decision = decisionMatch[1].toUpperCase().replace(/ /g, "_");

    // Extract risk level
    const riskMatch = text.match(/["']?risk_level["']?\s*[:=]\s*["']?(VERY_LOW|LOW|MODERATE|HIGH|VERY_HIGH)["']?/i);
    if (riskMatch) result.risk_level = riskMatch[1].toUpperCase();

    // Extract confidence
    const confMatch = text.match(/["']?confidence["']?\s*[:=]\s*["']?([\d.]+)["']?/);
    if (confMatch) result.confidence = parseFloat(confMatch[1]);

    // Extract final assessment
    const assessMatch = text.match(/["']?final_assessment["']?\s*[:=]\s*["']([^"']+)["']/);
    if (assessMatch) {
        result.reasoning = { final_assessment: assessMatch[1] };
    }

    if (Object.keys(result).length >= 2) {
        console.log("[JSON Extraction] Regex extraction found fields:", Object.keys(result));
        return result;
    }

    // If we got here, extraction failed completely
    console.error("[JSON Extraction] All methods failed. Raw text:", text.substring(0, 500));
    throw new Error("Could not extract valid JSON from response");
}

/**
 * Analyze food image - AI makes ALL the decisions
 */
export async function analyzeFoodImage(imageBuffer, preparationTime, packageTime, mimeType = "image/jpeg") {
    let responseText = "";

    try {
        const prepDt = new Date(preparationTime);
        const pkgDt = new Date(packageTime);
        const currentDt = new Date();

        const hoursSincePrep = (currentDt - prepDt) / (1000 * 60 * 60);
        const hoursSincePkg = (currentDt - pkgDt) / (1000 * 60 * 60);

        console.log(`[Food Analysis] Prep: ${preparationTime}, Pkg: ${packageTime}`);
        console.log(`[Food Analysis] Hours since prep: ${hoursSincePrep.toFixed(2)}h, since pkg: ${hoursSincePkg.toFixed(2)}h`);

        // Validate times - if negative, it means time is in future (clock skew or user error)
        const effectiveHoursSincePrep = Math.max(0, hoursSincePrep);
        const effectiveHoursSincePkg = Math.max(0, hoursSincePkg);

        const userPrompt = `You are analyzing a FOOD IMAGE for donation safety. Look at the attached image carefully.

CRITICAL: Base your decision primarily on what you SEE in the image.

TIME CONTEXT:
- Food was prepared: ${effectiveHoursSincePrep.toFixed(1)} hours ago
- Food was packaged: ${effectiveHoursSincePkg.toFixed(1)} hours ago

ANALYSIS REQUIRED:
1. LOOK at the food in the image - is it fresh, properly stored, showing any spoilage?
2. IDENTIFY what type of food it is
3. CONSIDER the time elapsed since preparation
4. ASSESS if it's safe for donation to others

DECISION CRITERIA:
- If food looks fresh and time is under 2 hours → SAFE_FOR_DONATION
- If food looks okay but time is 2-4 hours → SAFE_WITH_ADVISORY  
- If food shows spoilage OR time exceeds 4 hours for perishables → DISCARD

Respond with ONLY valid JSON:
{"classification":"EDIBLE","decision":"SAFE_FOR_DONATION","risk_level":"LOW","confidence":0.85,"reasoning":{"visual_inspection":"describe what you see","food_identification":"what food is this","time_temperature":"time assessment","protective_factors":"packaging quality","donation_context":"donation suitability","final_assessment":"summary"},"advisory":null}`;

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: getSystemPrompt()
        });

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: mimeType
            }
        };

        const generationConfig = {
            temperature: 0.1,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
        };

        console.log("[Food Analysis] Sending request to Gemini...");

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: userPrompt }, imagePart] }],
            generationConfig
        });

        const response = await result.response;
        responseText = response.text();

        console.log("[Food Analysis] Raw response:", responseText.substring(0, 300));

        // Parse JSON
        const analysis = extractJsonFromResponse(responseText);

        // Add timestamp
        analysis.analyzedAt = new Date().toISOString();

        console.log("[Food Analysis] Result:", {
            classification: analysis.classification,
            decision: analysis.decision,
            risk_level: analysis.risk_level,
            confidence: analysis.confidence
        });

        return analysis;

    } catch (error) {
        console.error("[Food Analysis] Error:", error.message);
        console.error("[Food Analysis] Raw response was:", responseText);

        return {
            classification: "NOT-EDIBLE",
            decision: "DISCARD",
            risk_level: "HIGH",
            confidence: 0.0,
            reasoning: {
                final_assessment: `Analysis failed: ${error.message}`
            },
            advisory: "Manual review required - automated analysis failed",
            analyzedAt: new Date().toISOString(),
            error: true
        };
    }
}
