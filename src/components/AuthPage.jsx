import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { login, register, googleLogin, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    licenceId: "", // ✅ NEW
  });

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ NGO LICENCE VALIDATION
    if (tab === "register" && role === "ngo" && !form.licenceId) {
      addToast("Licence ID is required for NGOs", "error");
      return;
    }

    setLoading(true);

    try {
      if (tab === "login") {
        await login(form.email, form.password);
        addToast("Login successful", "success");
      } else {
        await register(
          form.email,
          form.password,
          form.name,
          role,
          form.licenceId // ✅ PASS TO BACKEND
        );
        addToast("Account created", "success");
      }
      navigate("/dashboard");
    } catch {
      addToast("Authentication error", "error");
    }

    setLoading(false);
  };

  return (
    <section className="page-section relative">
      <div className="absolute inset-0 -z-10 bg-orange-100" />

      <div className="page-container flex justify-center">
        <div className="w-full max-w-md p-10 rounded-3xl bg-white shadow-xl">

          {/* ROLE */}
          <div className="flex justify-center gap-4 mb-6">
            {["user", "ngo"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-6 py-2 rounded-xl font-semibold ${
                  role === r ? "bg-orange-600 text-white" : "bg-gray-100"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* TABS */}
          <div className="flex justify-around mb-6">
            <button onClick={() => setTab("login")}>Login</button>
            <button onClick={() => setTab("register")}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {tab === "register" && (
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full p-3 border rounded"
              />
            )}

            {/* ✅ NGO LICENCE ID */}
            {tab === "register" && role === "ngo" && (
              <input
                placeholder="NGO Licence ID"
                value={form.licenceId}
                onChange={(e) =>
                  setForm({ ...form, licenceId: e.target.value })
                }
                className="w-full p-3 border rounded"
              />
            )}

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full p-3 border rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full p-3 border rounded"
            />

            <button className="w-full bg-orange-600 text-white p-3 rounded">
              {loading ? "Please wait..." : "Submit"}
            </button>
          </form>

          <button
            onClick={() => googleLogin(role)}
            className="w-full mt-4 p-3 border rounded"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </section>
  );
}