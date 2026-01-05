import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import VantaBackground from "./VantaBackground";

export default function Home() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  const bgY = useTransform(scrollY, [0, 800], [0, -160]);

  useEffect(() => {
    const move = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 60,
        y: (e.clientY / window.innerHeight - 0.5) * 60,
      });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* 🌐 BASE NETWORK */}
      <VantaBackground />

      {/* 🌈 AMBIENT GRADIENT DRIFT */}
      <motion.div
        style={{
          y: bgY,
          background:
            "radial-gradient(circle at top, #ffaf7a44, transparent 65%)", //
        }}
        className="absolute inset-0 -z-30"
      />

      {/* ☄️ AMBIENT FLOATING ENERGY ORBS */}
      {["#ff6600", "#ff781f", "#ff8b3d", "#ff9d5c"].map((color, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-40 -z-20"
          style={{
            backgroundColor: color,
            width: 420,
            height: 420,
            top: `${i * 25}%`,
            left: i % 2 === 0 ? "-140px" : "65%",
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 18 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ================= HERO ================= */}
      <div className="page-container relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20 py-36">
        {/* 🧠 LEFT – AR PARALLAX */}
        <motion.div
          initial={{ opacity: 0, y: 90 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{
            transform: `translate3d(${mouse.x / 8}px, ${mouse.y / 8}px, 0)`,
          }}
        >
          <motion.span
            animate={{
              boxShadow: [
                "0 0 0px #ff6600",
                "0 0 35px #ff660000",
                "0 0 0px #ff6600",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block px-6 py-2 rounded-full border bg-[#ff9d5c33] border-[#ff8b3d] text-[#ff6600] font-bold"
          >
            GIVING FOOD A SECOND CHANCE
          </motion.span>

          <h1 className="text-6xl font-extrabold text-[#ff6600] mt-10">
            Zero Food Waste
            <br />
            <span className="text-[#ff781f]">Share. Recycle. Sustain.</span>
          </h1>

          <p className="text-lg text-[#ff8b3d] mt-6 max-w-lg">
            A smart platform connecting surplus food, reusable products,
            and recyclables responsibly.
          </p>

          <div className="flex flex-wrap gap-6 mt-14">
            {[
              ["I Have Edible Food", "/edible", "#ff6600"],
              ["I Need Recycling", "/non-edible", "#ff781f"],
            
            ].map((b, i) => (
              <motion.a
                key={i}
                href={b[1]}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                className="px-9 py-3 rounded-2xl text-lg font-semibold"
                style={{ backgroundColor: b[2], color: "#fff" }}
              >
                {b[0]}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* 🕶️ RIGHT – VR DEPTH OBJECT */}
        <motion.div
          className="flex justify-center items-center"
          style={{
            perspective: 1600,
            transform: `translate3d(${mouse.x}px, ${mouse.y}px, 0)`,
          }}
        >
          <motion.img
            src="https://i.ibb.co/qY9dPwWD/Replateo-Soru-jpg.png"
            alt="Replateo"
            whileHover={{
              rotateY: -2,
              rotateX: 2,
              scale: 1.2,
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{
              type: "spring",
              stiffness: 90,
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full max-w-xl"
            style={{
              filter: "drop-shadow(0 50px 80px #ff781faa)",
            }}
          />
        </motion.div>
      </div>

      {/* ================= VALUE CARDS ================= */}
      <div className="py-32 relative z-10">
        <div className="page-container grid grid-cols-1 md:grid-cols-3 gap-14">
          {[
            ["Compassionate Impact", "Helping communities thrive."],
            ["Community Driven", "People helping people."],
            ["Environmental Care", "Protecting our planet."],
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -22, rotateX: 6 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl p-12 border"
              style={{
                backgroundColor: "#ff9d5c",
                borderColor: "#ffaf7a22",
                color: "#ff6600",
              }}
            >
              <h3 className="text-xl font-bold mb-4">{c[0]}</h3>
              <p className="text-[#ff8b3d]">{c[1]}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
