import { useState } from "react";

import { X, Upload, AlertTriangle, CheckCircle, Loader2, Camera, MapPin } from "lucide-react";
import CameraCapture from "./CameraCapture";
import { getCurrentLocation, getAddressFromCoordinates } from "../utils/LocationService";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const API_BASE_URL = "http://localhost:5000";

export default function DonationModal({ open, onClose, type = "food" }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // Food-specific states for AI analysis
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [preparationTime, setPreparationTime] = useState("");
  const [packageTime, setPackageTime] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  if (!open) return null;

  const config = {
    food: {
      heading: "Donate Food",
      title: "Food Title",
      category: "edible",
    },
    medications: {
      heading: "Donate Medications",
      title: "Medicine Name",
      category: "products",
      subCategory: "medications",
    },
    accessories: {
      heading: "Donate Accessories",
      title: "Accessory Name",
      category: "products",
      subCategory: "accessories",
    },
    clothes: {
      heading: "Donate Clothes",
      title: "Clothing Item",
      category: "products",
      subCategory: "resalable-clothes",
    },
    "non-edible": {
      heading: "Donate Non-Edible Items",
      title: "Item Name",
      category: "non-edible",
    },
  };

  const current = config[type] || config.food;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setAnalysisResult(null); // Reset analysis when new image selected
    }
  };

  // Handle capture from camera
  const handleCameraCapture = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysisResult(null);
  };

  const handleLocationClick = async () => {
    setIsLocating(true);
    try {
      const { lat, lng } = await getCurrentLocation();
      const addressString = await getAddressFromCoordinates(lat, lng);
      setAddress(addressString);
      addToast("Location retrieved successfully", "success");
    } catch (error) {
      console.error("Location error:", error);
      addToast(error.message, "error");
    } finally {
      setIsLocating(false);
    }
  };

  const analyzeFood = async () => {
    if (!imageFile) {
      addToast("Please upload a food image", "error");
      return null;
    }

    if (!preparationTime || !packageTime) {
      addToast("Please provide preparation and package times", "error");
      return null;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("preparationTime", preparationTime);
      formData.append("packageTime", packageTime);

      const response = await fetch(`${API_BASE_URL}/api/analyze-food`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setAnalysisResult(result);
      return result;
    } catch (err) {
      console.error("Analysis error:", err);
      const errorResult = {
        classification: "NOT-EDIBLE",
        confidence: 0,
        reasoning: "Failed to connect to food safety analysis service. Please try again.",
        error: true,
      };
      setAnalysisResult(errorResult);
      return errorResult;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitDonation = async () => {
    if (!user) {
      addToast("Please login to donate", "error");
      return;
    }

    if (!title || !quantity || !address) {
      addToast("Please fill required fields", "error");
      return;
    }

    if (type === "medications" && !expiryDate) {
      addToast("Please select expiry date", "error");
      return;
    }

    // For food donations, check AI analysis
    if (type === "food") {
      if (!imageFile) {
        addToast("Please upload a food image for safety analysis", "error");
        return;
      }

      if (!preparationTime || !packageTime) {
        addToast("Please provide preparation and package times", "error");
        return;
      }

      // Use existing analysis result if available, otherwise run analysis
      let analysis = analysisResult;
      if (!analysis) {
        analysis = await analyzeFood();
      }

      if (!analysis) {
        addToast("Please wait for food safety analysis to complete", "error");
        return;
      }

      // Check if food is safe - accept EDIBLE classification OR safe decisions
      const isEdible = analysis.classification === "EDIBLE";
      const isSafeByDecision = analysis.decision === "SAFE_FOR_DONATION" || analysis.decision === "SAFE_WITH_ADVISORY";

      if (!isEdible && !isSafeByDecision) {
        addToast("Food safety check failed. See details below.", "error");
        return;
      }

      // Food is safe, proceed to save with AI analysis data
      try {
        // Prepare document data with fallbacks to prevent undefined values
        const docData = {
          title: title || "Untitled",
          quantity: quantity || "1",
          pickupAddress: address || "",
          notes: notes || "",
          image: imagePreview || "",

          type: "donation",
          category: current.category || "edible",
          subCategory: current.subCategory || null,
          status: "available",

          userId: user.uid,
          createdBy: {
            name: user.name || user.email || "Anonymous",
            email: user.email || "",
            address: address || "",
          },

          // AI Analysis data - ensure no undefined values
          aiAnalysis: {
            classification: analysis.classification || "UNKNOWN",
            confidence: analysis.confidence ?? 0,
            reasoning: analysis.reasoning || {},
            decision: analysis.decision || "UNKNOWN",
            riskLevel: analysis.risk_level || "UNKNOWN",
            advisory: analysis.advisory || null,
            analyzedAt: analysis.analyzedAt || new Date().toISOString(),
          },

          preparationTime: preparationTime || "",
          packageTime: packageTime || "",

          claimedBy: null,
          createdAt: serverTimestamp(),
        };

        console.log("Submitting to Firestore:", docData);

        await addDoc(collection(db, "food_listings"), docData);

        addToast("Food donation submitted successfully!", "success");
        resetForm();
        onClose();
      } catch (err) {
        console.error("Firestore error:", err);
        console.error("Error code:", err.code);
        console.error("Error message:", err.message);
        addToast(`Error submitting donation: ${err.message || "Unknown error"}`, "error");
      }
    } else {
      // Non-food donations (original behavior)
      try {
        await addDoc(collection(db, "food_listings"), {
          title,
          quantity,
          pickupAddress: address,
          notes,
          image,

          expiryDate: type === "medications" ? expiryDate : null,

          type: "donation",
          category: current.category,
          subCategory: current.subCategory || null,
          status: "available",

          userId: user.uid,
          createdBy: {
            name: user.name || user.email,
            email: user.email,
            address: address,
          },

          claimedBy: null,
          createdAt: serverTimestamp(),
        });

        addToast("Donation submitted successfully!", "success");
        resetForm();
        onClose();
      } catch (err) {
        addToast("Error submitting donation", "error");
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setQuantity("");
    setAddress("");
    setNotes("");
    setImage("");
    setExpiryDate("");
    setImageFile(null);
    setImagePreview(null);
    setPreparationTime("");
    setPackageTime("");
    setAnalysisResult(null);
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    const isEdible = analysisResult.classification === "EDIBLE";

    return (
      <div
        className={`p-4 rounded-xl border-2 ${isEdible
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
          }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {isEdible ? (
            <CheckCircle className="text-green-600" size={24} />
          ) : (
            <AlertTriangle className="text-red-600" size={24} />
          )}
          <span
            className={`font-bold text-lg ${isEdible ? "text-green-700" : "text-red-700"
              }`}
          >
            {isEdible ? "Safe for Donation" : "Not Safe for Donation"}
          </span>
        </div>

        <div className="text-sm text-gray-700 mb-2">
          <span className="font-medium">Confidence:</span>{" "}
          {Math.round((analysisResult.confidence || 0) * 100)}%
        </div>

        {analysisResult.risk_level && (
          <div className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Risk Level:</span>{" "}
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${analysisResult.risk_level === "VERY_LOW" || analysisResult.risk_level === "LOW"
                ? "bg-green-100 text-green-800"
                : analysisResult.risk_level === "MODERATE"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
                }`}
            >
              {analysisResult.risk_level}
            </span>
          </div>
        )}

        {!isEdible && analysisResult.reasoning && (
          <div className="mt-3 p-3 bg-white rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Reasoning:</p>
            {typeof analysisResult.reasoning === "string" ? (
              <p className="text-sm text-gray-600">{analysisResult.reasoning}</p>
            ) : (
              <p className="text-sm text-gray-600">
                {analysisResult.reasoning.final_assessment || JSON.stringify(analysisResult.reasoning)}
              </p>
            )}
          </div>
        )}

        {analysisResult.advisory && (
          <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
            <span className="font-medium">Advisory:</span> {analysisResult.advisory}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 relative shadow-xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-3xl font-extrabold text-orange-700 mb-6">
          {current.heading}
        </h2>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <input
            className="w-full p-3 border rounded-xl"
            placeholder={current.title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="w-full p-3 border rounded-xl"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />



          <div className="relative">
            <input
              className="w-full p-3 border rounded-xl pr-12"
              placeholder="Pickup Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button
              onClick={handleLocationClick}
              disabled={isLocating}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition disabled:opacity-50"
              title="Use Current Location"
            >
              {isLocating ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <MapPin size={20} />
              )}
            </button>
          </div>

          {type === "medications" && (
            <input
              type="date"
              className="w-full p-3 border rounded-xl"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          )}

          {/* Food-specific fields */}
          {type === "food" ? (
            <>
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Food Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition">
                    <Upload size={20} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition"
                  >
                    <Camera size={20} />
                    <span>Take Photo</span>
                  </button>

                  {imageFile && (
                    <span className="text-sm text-gray-600 truncate max-w-[150px]">
                      {imageFile.name}
                    </span>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Food preview"
                      className="w-full h-48 object-cover rounded-xl border"
                    />
                  </div>
                )}
              </div>

              {/* Preparation Time */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Preparation Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-3 border rounded-xl"
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                />
              </div>

              {/* Package Time */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Package Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-3 border rounded-xl"
                  value={packageTime}
                  onChange={(e) => setPackageTime(e.target.value)}
                />
              </div>

              {/* Analysis Result */}
              {renderAnalysisResult()}
            </>
          ) : (
            <input
              className="w-full p-3 border rounded-xl"
              placeholder="Image URL (optional)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          )}

          <textarea
            className="w-full p-3 border rounded-xl"
            placeholder="Additional notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            onClick={submitDonation}
            disabled={isAnalyzing}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${isAnalyzing
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#C3E5E7] text-black hover:bg-[#B1DBDD]"
              }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyzing Food Safety...
              </>
            ) : (
              "Submit Donation"
            )}
          </button>
           
        </div>
      </div>

      {isCameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
}