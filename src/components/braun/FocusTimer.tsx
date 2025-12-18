import { useState, useEffect, useCallback, useRef } from "react";

interface FocusTimerProps {
  onComplete?: (minutes: number) => void;
  onTimeUpdate?: (timeString: string | null) => void;
}

const FocusTimer = ({ onComplete, onTimeUpdate }: FocusTimerProps) => {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPressed, setIsPressed] = useState<string | null>(null);
  const durationRef = useRef(duration);

  const presets = [5, 15, 25, 45];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    if (!isRunning) {
      onTimeUpdate?.(null);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          onComplete?.(durationRef.current);
          onTimeUpdate?.(null);
          // Haptic feedback on complete
          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          return 0;
        }
        const newTime = prev - 1;
        onTimeUpdate?.(formatTime(newTime));
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onComplete, onTimeUpdate]);

  const handlePresetClick = useCallback((minutes: number) => {
    if (isRunning) return;
    if (navigator.vibrate) navigator.vibrate(5);
    setDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsComplete(false);
  }, [isRunning]);

  const toggleTimer = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    if (isComplete) {
      setTimeLeft(duration * 60);
      setIsComplete(false);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setIsComplete(false);
  };

  const progress = 1 - timeLeft / (duration * 60);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div 
      className="flex flex-col items-center gap-5 p-4"
      role="region"
      aria-label="Focus timer"
    >
      {/* Timer display with circular progress */}
      <div 
        className="relative w-48 h-48 md:w-56 md:h-56"
        role="timer"
        aria-live="polite"
        aria-label={`${formatTime(timeLeft)} remaining`}
      >
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="hsl(var(--control-border))"
            strokeWidth="3"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="hsl(var(--braun-orange))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-space font-bold text-4xl md:text-5xl tracking-wider tabular-nums ${
            isComplete ? "text-braun-orange animate-pulse" : "text-foreground"
          }`}>
            {formatTime(timeLeft)}
          </div>
          <div className="braun-label mt-2 text-muted-foreground">
            {isComplete ? "COMPLETE" : isRunning ? "FOCUSING" : "SET DURATION"}
          </div>
        </div>
      </div>

      {/* Duration presets */}
      <div className="mode-selector" role="radiogroup" aria-label="Timer duration">
        {presets.map((mins) => (
          <button
            key={mins}
            onClick={() => handlePresetClick(mins)}
            className={`mode-option ${duration === mins ? "active" : ""}`}
            disabled={isRunning}
            role="radio"
            aria-checked={duration === mins}
            aria-label={`${mins} minutes`}
          >
            {mins}m
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          onMouseDown={() => setIsPressed("reset")}
          onMouseUp={() => setIsPressed(null)}
          onMouseLeave={() => setIsPressed(null)}
          onTouchStart={() => setIsPressed("reset")}
          onTouchEnd={() => setIsPressed(null)}
          className={`braun-button-round touch-feedback ${isPressed === "reset" ? "pressed" : ""}`}
          disabled={!isRunning && timeLeft === duration * 60}
          aria-label="Reset timer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        <button
          onClick={toggleTimer}
          onMouseDown={() => setIsPressed("play")}
          onMouseUp={() => setIsPressed(null)}
          onMouseLeave={() => setIsPressed(null)}
          onTouchStart={() => setIsPressed("play")}
          onTouchEnd={() => setIsPressed(null)}
          className={`braun-button-round large touch-feedback ${isRunning ? "braun-button-primary" : ""} ${isPressed === "play" ? "pressed" : ""}`}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
          aria-pressed={isRunning}
        >
          {isRunning ? (
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

      {/* Session info */}
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {isComplete 
          ? "Take a short break, then continue."
          : "Focus on one thing. Everything else can wait."}
      </p>
    </div>
  );
};

export default FocusTimer;
