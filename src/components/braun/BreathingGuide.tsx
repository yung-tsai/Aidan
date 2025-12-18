import { useState, useEffect, useCallback, useRef } from "react";

type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

interface BreathingGuideProps {
  isActive: boolean;
  onToggle: () => void;
  onCycleComplete?: () => void;
  pattern?: [number, number, number, number]; // inhale, hold, exhale, rest
}

const BreathingGuide = ({ 
  isActive, 
  onToggle,
  onCycleComplete,
  pattern = [4, 4, 4, 4] 
}: BreathingGuideProps) => {
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [countdown, setCountdown] = useState(pattern[0]);
  const [cycles, setCycles] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const onCycleCompleteRef = useRef(onCycleComplete);

  // Keep ref updated
  useEffect(() => {
    onCycleCompleteRef.current = onCycleComplete;
  }, [onCycleComplete]);

  const phaseLabels: Record<BreathPhase, string> = {
    inhale: "BREATHE IN",
    hold: "HOLD",
    exhale: "BREATHE OUT",
    rest: "REST",
  };

  const getPhaseIndex = (p: BreathPhase): number => {
    const phases: BreathPhase[] = ["inhale", "hold", "exhale", "rest"];
    return phases.indexOf(p);
  };

  const getNextPhase = useCallback((current: BreathPhase): BreathPhase => {
    const phases: BreathPhase[] = ["inhale", "hold", "exhale", "rest"];
    const currentIndex = phases.indexOf(current);
    return phases[(currentIndex + 1) % 4];
  }, []);

  useEffect(() => {
    if (!isActive) {
      setPhase("inhale");
      setCountdown(pattern[0]);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const nextPhase = getNextPhase(phase);
          setPhase(nextPhase);
          if (nextPhase === "inhale") {
            setCycles((c) => c + 1);
            // Use setTimeout to avoid setState during render
            setTimeout(() => onCycleCompleteRef.current?.(), 0);
          }
          return pattern[getPhaseIndex(nextPhase)];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, pattern, getNextPhase]);

  const getCircleScale = () => {
    if (!isActive) return 1;
    const phaseProgress = 1 - countdown / pattern[getPhaseIndex(phase)];
    
    switch (phase) {
      case "inhale":
        return 1 + phaseProgress * 0.3;
      case "hold":
        return 1.3;
      case "exhale":
        return 1.3 - phaseProgress * 0.3;
      case "rest":
        return 1;
      default:
        return 1;
    }
  };

  const handleButtonPress = () => {
    setIsPressed(true);
    // Haptic feedback simulation via vibration API
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleButtonRelease = () => {
    setIsPressed(false);
    onToggle();
  };

  return (
    <div 
      className="flex flex-col items-center gap-6 p-4"
      role="region"
      aria-label="Breathing exercise guide"
    >
      {/* Breathing circle */}
      <div 
        className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center"
        role="img"
        aria-label={isActive ? `${phaseLabels[phase]}, ${countdown} seconds remaining` : "Ready to begin"}
      >
        {/* Outer ring */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-control-border transition-all duration-1000 ease-in-out"
          style={{ 
            transform: `scale(${getCircleScale()})`,
            borderColor: isActive ? 'hsl(var(--braun-orange))' : undefined,
            opacity: isActive ? 0.3 : 0.5,
          }}
          aria-hidden="true"
        />
        
        {/* Inner circle */}
        <div 
          className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-device-inset flex items-center justify-center transition-all duration-1000 ease-in-out"
          style={{ 
            transform: `scale(${getCircleScale()})`,
            boxShadow: isActive 
              ? '0 0 40px hsl(var(--braun-orange) / 0.2)' 
              : 'inset 0 2px 8px hsl(0 0% 0% / 0.05)',
          }}
        >
          <div className="text-center">
            {isActive ? (
              <>
                <div 
                  className="text-4xl md:text-5xl font-space font-bold text-foreground tabular-nums"
                  aria-live="polite"
                >
                  {countdown}
                </div>
                <div className="braun-label mt-2 text-braun-orange">
                  {phaseLabels[phase]}
                </div>
              </>
            ) : (
              <div className="braun-label text-muted-foreground">
                TAP TO START
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onMouseDown={handleButtonPress}
          onMouseUp={handleButtonRelease}
          onMouseLeave={() => isPressed && setIsPressed(false)}
          onTouchStart={handleButtonPress}
          onTouchEnd={handleButtonRelease}
          className={`braun-button-round large touch-feedback ${isActive ? 'braun-button-primary' : ''} ${isPressed ? 'pressed' : ''}`}
          aria-label={isActive ? "Pause breathing exercise" : "Start breathing exercise"}
          aria-pressed={isActive}
        >
          {isActive ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Cycle counter */}
      {cycles > 0 && (
        <div className="flex items-center gap-2" aria-live="polite">
          <span className="braun-label text-muted-foreground">CYCLES</span>
          <span className="font-space font-bold text-lg text-foreground tabular-nums">{cycles}</span>
        </div>
      )}

      {/* Pattern indicator */}
      <div className="flex gap-4" role="list" aria-label="Breathing pattern">
        {(["inhale", "hold", "exhale", "rest"] as const).map((p, i) => (
          <div 
            key={p} 
            className="flex flex-col items-center gap-1"
            role="listitem"
            aria-current={phase === p && isActive ? "step" : undefined}
          >
            <div 
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                phase === p && isActive 
                  ? "bg-braun-orange scale-125" 
                  : "bg-control-border"
              }`}
              aria-hidden="true"
            />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {pattern[i]}s
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BreathingGuide;
