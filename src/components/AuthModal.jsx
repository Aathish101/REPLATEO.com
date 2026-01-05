import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AuthModal({ open, onClose }) {
  const { login, register } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Reset when opened
  useEffect(() => {
    if (open) {
      setForm({ name: "", email: "", password: "" });
      setMode("login");
    }
  }, [open]);

  if (!open) return null;

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setForm({ name: "", email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        await login(form.email, form.password);
        addToast("Logged in successfully!", "success");
      } else {
        await register(form.email, form.password, form.name);
        addToast("Account created!", "success");
      }

      onClose();
    } catch (err) {
      addToast(
        err?.message?.replace("Firebase:", "").trim() || "Authentication error",
        "error"
      );
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
      
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-fadeIn">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {mode === "login" ? "Login to Replateo" : "Create an Account"}
          </h2>

          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === "register" && (
            <input
              type="text"
              required
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}

          <input
            type="email"
            required
            placeholder="Email Address"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold"
          >
            {loading ? "Processing..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        {/* SWITCH MODE */}
        <p className="text-center text-sm mt-4">
          {mode === "login" ? "Don’t have an account?" : "Already have an account?"}

          <button
            className="text-orange-600 ml-1 font-semibold hover:underline"
            onClick={switchMode}
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>

      </div>
    </div>
  );
}