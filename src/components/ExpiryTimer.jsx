import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

/**
 * Risk level to safe window mapping (in hours)
 * Based on FSSAI 2-hour/4-hour food safety guidelines
 */
const RISK_SAFE_WINDOWS = {
    VERY_LOW: 6,
    LOW: 4,
    MODERATE: 2,
    HIGH: 1,
    VERY_HIGH: 0.5,
};

/**
 * Calculate expiry timestamp based on preparation time and risk level
 */
function calculateExpiryTime(preparationTime, riskLevel) {
    if (!preparationTime) return null;

    const safeHours = RISK_SAFE_WINDOWS[riskLevel] ?? RISK_SAFE_WINDOWS.MODERATE;
    const prepDate = new Date(preparationTime);

    if (isNaN(prepDate.getTime())) return null;

    return new Date(prepDate.getTime() + safeHours * 60 * 60 * 1000);
}

/**
 * Format remaining time as human-readable string
 */
function formatTimeRemaining(ms) {
    if (ms <= 0) return null;

    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * ExpiryTimer Component
 * Displays a real-time countdown for food item expiration.
 * Only renders meaningful output for NGO users with AI-analyzed items.
 *
 * @param {string} preparationTime - ISO datetime string of when food was prepared
 * @param {string} riskLevel - AI-determined risk level (VERY_LOW, LOW, MODERATE, HIGH, VERY_HIGH)
 */
export default function ExpiryTimer({ preparationTime, riskLevel }) {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const expiryTime = calculateExpiryTime(preparationTime, riskLevel);

        if (!expiryTime) {
            setTimeRemaining(null);
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            const remaining = expiryTime.getTime() - now.getTime();

            if (remaining <= 0) {
                setIsExpired(true);
                setTimeRemaining(null);
            } else {
                setIsExpired(false);
                setTimeRemaining(formatTimeRemaining(remaining));
            }
        };

        // Initial update
        updateTimer();

        // Update every minute
        const interval = setInterval(updateTimer, 60000);

        return () => clearInterval(interval);
    }, [preparationTime, riskLevel]);

    // Don't render if no valid preparation time
    if (!preparationTime) return null;

    // Expired state
    if (isExpired) {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                <AlertTriangle size={16} />
                <span>Expired</span>
            </div>
        );
    }

    // Countdown state
    if (timeRemaining) {
        // Color based on urgency
        const isUrgent = timeRemaining.includes("m") && !timeRemaining.includes("h");
        const bgColor = isUrgent ? "bg-amber-100" : "bg-green-100";
        const textColor = isUrgent ? "text-amber-700" : "text-green-700";

        return (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 ${bgColor} ${textColor} rounded-lg text-sm font-medium`}>
                <Clock size={16} />
                <span>Expires in {timeRemaining}</span>
            </div>
        );
    }

    return null;
}
