import { useEffect, useRef, useState } from "react";
import NET from "vanta/dist/vanta.net.min";
import * as THREE from "three";

export default function VantaBackground() {
  const vantaRef = useRef(null);
  const [effect, setEffect] = useState(null);

  useEffect(() => {
    if (!effect) {
      setEffect(
        NET({
          el: vantaRef.current,
          THREE,

          mouseControls: true,
          touchControls: true,
          gyroControls: false,

          // 🔥 LIGHT THEME GEOMETRIC COLORS
          backgroundColor: 0xfffaf5, // light cream
          color: 0xff6600,           // orange lines
          color2: 0xff9d5c,          // lighter glow

          points: 10,
          maxDistance: 22,
          spacing: 18,
          showDots: true,

          scale: 1.0,
          scaleMobile: 1.0,
        })
      );
    }
    return () => effect && effect.destroy();
  }, [effect]);

  return (
    <div
      ref={vantaRef}
      className="absolute inset-0 -z-40"
    />
  );
}
