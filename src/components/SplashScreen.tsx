import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const asciiLogo = [
  "     ██╗ ██████╗ ██╗   ██╗██████╗ ███╗   ██╗ █████╗ ██╗     ",
  "     ██║██╔═══██╗██║   ██║██╔══██╗████╗  ██║██╔══██╗██║     ",
  "     ██║██║   ██║██║   ██║██████╔╝██╔██╗ ██║███████║██║     ",
  "██   ██║██║   ██║██║   ██║██╔══██╗██║╚██╗██║██╔══██║██║     ",
  "╚█████╔╝╚██████╔╝╚██████╔╝██║  ██║██║ ╚████║██║  ██║███████╗",
  " ╚════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝",
];

const terminalFrame = [
  "┌──────────────────────────────────────────────────────────────────┐",
  "│                                                                  │",
  "│                                                                  │",
  "│                                                                  │",
  "│                                                                  │",
  "│                                                                  │",
  "│                                                                  │",
  "│                                                                  │",
  "│                                                                  │",
  "│                                                                  │",
  "│                                                                  │",
  "└──────────────────────────────────────────────────────────────────┘",
];

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0);
  const [frameVisible, setFrameVisible] = useState(false);
  const [logoLines, setLogoLines] = useState<number[]>([]);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    // Phase 0: Show frame
    const frameTimer = setTimeout(() => {
      setFrameVisible(true);
      setPhase(1);
    }, 200);

    // Phase 1: Reveal logo lines one by one
    const logoTimers: NodeJS.Timeout[] = [];
    asciiLogo.forEach((_, index) => {
      const timer = setTimeout(() => {
        setLogoLines((prev) => [...prev, index]);
      }, 400 + index * 150);
      logoTimers.push(timer);
    });

    // Phase 2: Show subtitle
    const subtitleTimer = setTimeout(() => {
      setShowSubtitle(true);
      setPhase(2);
    }, 1400);

    // Glitch effect
    const glitchTimer = setTimeout(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 1800);

    // Phase 3: Show prompt
    const promptTimer = setTimeout(() => {
      setShowPrompt(true);
      setPhase(3);
    }, 2000);

    // Complete and transition
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(frameTimer);
      logoTimers.forEach(clearTimeout);
      clearTimeout(subtitleTimer);
      clearTimeout(glitchTimer);
      clearTimeout(promptTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-terminal-bg z-50 flex items-center justify-center overflow-hidden">
      {/* Scanlines */}
      <div className="terminal-scanlines absolute inset-0" />
      
      {/* CRT vignette */}
      <div className="crt-vignette absolute inset-0" />

      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")"
        }}
      />

      {/* Main content */}
      <div 
        className={`relative z-10 font-vt323 text-center transition-all duration-100 ${
          glitchActive ? "translate-x-1 skew-x-1" : ""
        }`}
      >
        {/* Terminal frame */}
        <div 
          className={`text-terminal-border text-xs leading-none transition-opacity duration-300 ${
            frameVisible ? "opacity-40" : "opacity-0"
          }`}
          style={{ fontFamily: "monospace" }}
        >
          {terminalFrame.map((line, i) => (
            <div key={i} className="whitespace-pre">{line}</div>
          ))}
        </div>

        {/* Logo overlay - positioned inside frame */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* ASCII Logo */}
          <div className="mb-4">
            {asciiLogo.map((line, index) => (
              <div
                key={index}
                className={`text-terminal-glow terminal-glow whitespace-pre text-xs sm:text-sm transition-all duration-200 ${
                  logoLines.includes(index) 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 -translate-y-2"
                }`}
                style={{
                  textShadow: logoLines.includes(index)
                    ? "0 0 10px hsl(var(--terminal-glow)), 0 0 20px hsl(var(--terminal-glow) / 0.5)"
                    : "none",
                }}
              >
                {line}
              </div>
            ))}
          </div>

          {/* Subtitle */}
          <div
            className={`text-terminal-text text-lg tracking-[0.3em] mb-6 transition-all duration-500 ${
              showSubtitle ? "opacity-100" : "opacity-0"
            }`}
          >
            ─────── PERSONAL TERMINAL ───────
          </div>

          {/* Version info */}
          <div
            className={`text-terminal-dim text-sm mb-8 transition-all duration-500 delay-200 ${
              showSubtitle ? "opacity-100" : "opacity-0"
            }`}
          >
            SEEGSON SYSTEMS v2.4.1 | 2187
          </div>

          {/* Loading prompt */}
          <div
            className={`transition-all duration-300 ${
              showPrompt ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2 text-terminal-glow text-base">
              <span className="animate-pulse">▶</span>
              <span>PRESS ANY KEY TO CONTINUE</span>
              <span className="animate-blink">_</span>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className={`mt-6 flex items-center gap-2 transition-all duration-300 ${
              showPrompt ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-terminal-dim text-xs">LOADING</span>
            <div className="flex gap-0.5">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-3 transition-all duration-150 ${
                    i < 8 ? "bg-terminal-glow" : "bg-terminal-muted"
                  }`}
                  style={{
                    boxShadow: i < 8 ? "0 0 4px hsl(var(--terminal-glow) / 0.5)" : "none",
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
            <span className="text-terminal-dim text-xs">80%</span>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-2 left-2 text-terminal-border text-xs opacity-50">╔═</div>
        <div className="absolute top-2 right-2 text-terminal-border text-xs opacity-50">═╗</div>
        <div className="absolute bottom-2 left-2 text-terminal-border text-xs opacity-50">╚═</div>
        <div className="absolute bottom-2 right-2 text-terminal-border text-xs opacity-50">═╝</div>
      </div>

      {/* Ambient glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, hsl(var(--terminal-glow) / 0.03) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

export default SplashScreen;
