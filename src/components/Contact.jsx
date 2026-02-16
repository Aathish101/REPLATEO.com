import { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast("Your message has been sent!", "success");

    setForm({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <section className="page-section relative">

      {/* ORANGE GLASS GRADIENT BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200" />

      <div className="page-container">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h2 className="text-5xl font-extrabold text-orange-800 drop-shadow-sm">
            Contact & Support
          </h2>
          <p className="text-lg text-orange-700 mt-3 max-w-2xl mx-auto">
            Have questions, need help, or want to partner with us?  
            We’re here to support you.
          </p>
        </div>

        {/* FORM CARD */}
        <div
          className="
            max-w-xl mx-auto p-10 rounded-3xl
            bg-gradient-to-br from-white/40 to-white/20
            backdrop-blur-xl border border-white/30
            shadow-xl shadow-orange-300/30
          "
        >
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NAME */}
            <div>
              <label className="text-orange-800 font-semibold">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
                className="
                  w-full p-3 mt-1 rounded-xl 
                  bg-white/50 border border-white/40
                  focus:ring-2 focus:ring-orange-400 
                  focus:bg-white/70 transition
                "
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-orange-800 font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter your email"
                className="
                  w-full p-3 mt-1 rounded-xl 
                  bg-white/50 border border-white/40
                  focus:ring-2 focus:ring-orange-400 
                  focus:bg-white/70 transition
                "
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="text-orange-800 font-semibold">Message</label>
              <textarea
                rows="5"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we assist you?"
                className="
                  w-full p-3 mt-1 rounded-xl 
                  bg-white/50 border border-white/40
                  focus:ring-2 focus:ring-orange-400 
                  focus:bg-white/70 transition
                "
              ></textarea>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="
                w-full py-3 rounded-xl font-semibold text-white 
                bg-orange-600 hover:bg-orange-700 
                shadow-lg shadow-orange-400/40 
                transition
              "
            >
              Send Message
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
