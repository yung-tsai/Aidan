import { useState, useEffect } from "react";

interface ClockDisplayProps {
  showSeconds?: boolean;
  size?: "sm" | "md" | "lg";
}

const ClockDisplay = ({ showSeconds = true, size = "lg" }: ClockDisplayProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl md:text-7xl",
  };

  return (
    <div className="lcd-display p-6 md:p-8">
      <div className={`lcd-text ${sizeClasses[size]} font-space font-bold tracking-wider text-center`}>
        <span>{hours}</span>
        <span className="opacity-80 animate-pulse mx-1">:</span>
        <span>{minutes}</span>
        {showSeconds && (
          <>
            <span className="opacity-80 animate-pulse mx-1">:</span>
            <span className="opacity-70">{seconds}</span>
          </>
        )}
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <span className="braun-label lcd-text-dim">
          {time.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
        </span>
        <span className="braun-label lcd-text-dim">
          {time.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default ClockDisplay;
