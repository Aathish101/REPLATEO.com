import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Utility to get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const ANALYSIS_LOG_FILE = path.join(DATA_DIR, 'food_analysis_log.csv');

const CSV_HEADERS = [
    { id: 'timestamp', title: 'timestamp' },
    { id: 'image_filename', title: 'image_filename' },
    { id: 'preparation_time', title: 'preparation_time' },
    { id: 'package_time', title: 'package_time' },
    { id: 'classification', title: 'classification' },
    { id: 'decision', title: 'decision' },
    { id: 'risk_level', title: 'risk_level' },
    { id: 'confidence', title: 'confidence' },
    { id: 'reasoning_summary', title: 'reasoning_summary' },
    { id: 'advisory', title: 'advisory' },
    { id: 'error', title: 'error' }
];

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function ensureCsvFile() {
    ensureDataDir();
    if (!fs.existsSync(ANALYSIS_LOG_FILE)) {
        // Create file with headers
        const headerLine = CSV_HEADERS.map(h => h.title).join(',') + '\n';
        fs.writeFileSync(ANALYSIS_LOG_FILE, headerLine, 'utf8');
    }
}

/**
 * Log analysis result to CSV
 * @param {object} params
 * @param {string} params.imageFilename
 * @param {string} params.preparationTime
 * @param {string} params.packageTime
 * @param {object} params.analysisResult
 */
export async function logAnalysis({ imageFilename, preparationTime, packageTime, analysisResult }) {
    try {
        ensureCsvFile();

        // Extract reasoning summary
        let reasoningSummary = '';
        const reasoning = analysisResult.reasoning || {};
        if (typeof reasoning === 'object') {
            reasoningSummary = reasoning.final_assessment || JSON.stringify(reasoning);
        } else {
            reasoningSummary = String(reasoning);
        }

        // Truncate logic
        if (reasoningSummary.length > 500) {
            reasoningSummary = reasoningSummary.substring(0, 497) + '...';
        }

        const record = {
            timestamp: new Date().toISOString(),
            image_filename: imageFilename,
            preparation_time: preparationTime,
            package_time: packageTime,
            classification: analysisResult.classification || 'UNKNOWN',
            decision: analysisResult.decision || 'UNKNOWN',
            risk_level: analysisResult.risk_level || 'UNKNOWN',
            confidence: analysisResult.confidence || 0.0,
            reasoning_summary: reasoningSummary,
            advisory: analysisResult.advisory || '',
            error: analysisResult.error || false
        };

        const csvWriter = createObjectCsvWriter({
            path: ANALYSIS_LOG_FILE,
            header: CSV_HEADERS,
            append: true
        });

        await csvWriter.writeRecords([record]);
        return true;

    } catch (error) {
        console.error('Error logging analysis:', error);
        return false;
    }
}

/**
 * Get analysis statistics
 * @returns {object} statistics
 */
export async function getStatistics() {
    // Basic implementation for parity - reading not strictly required for the immediate task 
    // but useful for maintaining full feature set if the frontend uses it (it doesn't seem to use stats endpoint yet).
    // For now we'll implement a basic read or skip.
    // The Python code had `get_statistics` but it wasn't exposed in `app.py`? 
    // Checking `app.py`... it DOES NOT expose stats endpoint. It only imports `log_analysis`.
    // So `getStatistics` in Python was unused dead code or reserved for future.
    // I will implement a stub or simple read if needed, but strictly I only need `logAnalysis`.
    return { error: "Not implemented" };
}
