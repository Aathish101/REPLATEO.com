import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

export default function ForgotPassword() {
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      addToast("Reset link sent to your email!", "success");
      setEmail("");
    } catch (err) {
      addToast("Error sending reset email", "error");
    }

    setLoading(false);
  };

  return (
    <section className="page-section">
      <div className="page-container flex justify-center">

        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

          <h2 className="text-3xl font-bold text-center mb-6">Reset Password</h2>

          <form onSubmit={handleReset} className="space-y-6">

            <div>
              <label className="font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/auth" className="text-orange-600 hover:underline">
              Back to Login
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
