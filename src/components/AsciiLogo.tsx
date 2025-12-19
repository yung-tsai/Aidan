import { useState, useEffect } from "react";

const AsciiLogo = () => {
  const [glowPhase, setGlowPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowPhase((p) => (p + 1) % 100);
    }, 25);
    return () => clearInterval(interval);
  }, []);

  const opacity = 0.6 + 0.4 * Math.sin((glowPhase * Math.PI) / 50);
  const glowIntensity = 8 + 4 * Math.sin((glowPhase * Math.PI) / 50);

  return (
    <div className="logo-container">
      <span
        className="font-vt323 text-terminal-glow text-3xl font-bold select-none"
        style={{
          opacity,
          textShadow: `0 0 ${glowIntensity}px currentColor, 0 0 ${glowIntensity * 2}px currentColor`,
        }}
      >
        A
      </span>
      <div className="logo-scanline" />
    </div>
  );
};

export default AsciiLogo;
