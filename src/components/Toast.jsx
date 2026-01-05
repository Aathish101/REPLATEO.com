import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function Toast({ message, type = "success" }) {
  // Icons for different toast types
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  // Color theme for each type
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-600",
    info: "bg-blue-600",
  };

  return (
    <div
      className={`
        toast-card
        flex items-center gap-3 text-white shadow-lg rounded-xl
        ${colors[type] || colors.success}
      `}
    >
      {icons[type] || icons.success}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
