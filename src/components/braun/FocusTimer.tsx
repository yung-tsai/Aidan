import { useState, useEffect, useCallback, useRef } from "react";

interface FocusTimerProps {
  onComplete?: (minutes: number) => void;
}

const FocusTimer = ({ onComplete }: FocusTimerProps) => {
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const durationRef = useRef(duration);

  const presets = [5, 15, 25, 45];

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          onComplete?.(durationRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onComplete]);

  const handlePresetClick = useCallback((minutes: number) => {
    if (isRunning) return;
    setDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsComplete(false);
  }, [isRunning]);

  const toggleTimer = () => {
    if (isComplete) {
      setTimeLeft(duration * 60);
      setIsComplete(false);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setIsComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = 1 - timeLeft / (duration * 60);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer display with circular progress */}
      <div className="relative w-56 h-56 md:w-72 md:h-72">
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="hsl(var(--control-border))"
            strokeWidth="4"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="hsl(var(--braun-orange))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-space font-bold text-5xl md:text-6xl tracking-wider ${
            isComplete ? "text-braun-orange" : "text-foreground"
          }`}>
            {formatTime(timeLeft)}
          </div>
          <div className="braun-label mt-2 text-muted-foreground">
            {isComplete ? "COMPLETE" : isRunning ? "FOCUSING" : "READY"}
          </div>
        </div>
      </div>

      {/* Duration presets */}
      <div className="mode-selector">
        {presets.map((mins) => (
          <button
            key={mins}
            onClick={() => handlePresetClick(mins)}
            className={`mode-option ${duration === mins ? "active" : ""}`}
            disabled={isRunning}
          >
            {mins}m
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          className="braun-button-round"
          disabled={!isRunning && timeLeft === duration * 60}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        <button
          onClick={toggleTimer}
          className={`braun-button-round large ${isRunning ? "braun-button-primary" : ""}`}
        >
          {isRunning ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Session info */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {isComplete 
            ? "Take a short break, then continue."
            : "Focus on one thing. Everything else can wait."}
        </p>
      </div>
    </div>
  );
};

export default FocusTimer;
