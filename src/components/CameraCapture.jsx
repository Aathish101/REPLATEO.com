import { useState, useRef, useEffect } from "react";
import { Camera, X, RotateCcw, Check, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function CameraCapture({ onCapture, onClose }) {
    const { addToast } = useToast();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize Camera
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setIsLoading(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }, // Prefer rear camera on mobile
                audio: false,
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsLoading(false);
        } catch (err) {
            console.error("Camera access error:", err);
            addToast(
                "Could not access camera. Please check permissions or use file upload.",
                "error"
            );
            onClose();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            // Match canvas size to video resolution
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get data URL for preview
            const dataUrl = canvas.toDataURL("image/jpeg");
            setCapturedImage(dataUrl);
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
    };

    const confirmPhoto = () => {
        if (canvasRef.current) {
            canvasRef.current.toBlob((blob) => {
                if (blob) {
                    // Convert blob to File object
                    const file = new File([blob], `camera_capture_${Date.now()}.jpg`, {
                        type: "image/jpeg",
                    });
                    onCapture(file);
                    onClose();
                }
            }, "image/jpeg", 0.9);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
            {/* Header */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={onClose}
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                {capturedImage ? (
                    // Preview State
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="max-w-full max-h-[80vh] object-contain"
                    />
                ) : (
                    // Live Camera State
                    <>
                        {isLoading && (
                            <div className="absolute text-white flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin" size={32} />
                                <p>Accessing camera...</p>
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="max-w-full max-h-[80vh] object-cover"
                            onLoadedMetadata={() => setIsLoading(false)}
                        />
                    </>
                )}

                {/* Hidden Canvas for Capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Controls */}
                <div className="absolute bottom-8 w-full flex items-center justify-center gap-8">
                    {capturedImage ? (
                        <>
                            <button
                                onClick={retakePhoto}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full font-semibold hover:bg-gray-700"
                            >
                                <RotateCcw size={20} />
                                Retake
                            </button>
                            <button
                                onClick={confirmPhoto}
                                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700"
                            >
                                <Check size={20} />
                                Use Photo
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={capturePhoto}
                            disabled={isLoading}
                            className={`p-1 rounded-full border-4 border-white ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                                } transition-transform`}
                        >
                            <div className="w-16 h-16 bg-white rounded-full" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
