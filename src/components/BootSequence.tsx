import { useState, useEffect } from "react";

interface BootSequenceProps {
  onComplete: () => void;
}

const bootLines = [
  { text: "SEEGSON TERMINAL v2.4.1", delay: 0 },
  { text: "INITIALIZING SYSTEM...", delay: 200 },
  { text: "", delay: 400 },
  { text: "MEMORY CHECK.......... OK", delay: 600 },
  { text: "DISPLAY ADAPTER....... OK", delay: 800 },
  { text: "STORAGE DEVICE........ OK", delay: 1000 },
  { text: "NETWORK INTERFACE..... OFFLINE", delay: 1200 },
  { text: "", delay: 1400 },
  { text: "LOADING PERSONAL TERMINAL...", delay: 1600 },
  { text: "MOUNTING USER DATA...", delay: 2000 },
  { text: "ESTABLISHING SESSION...", delay: 2400 },
  { text: "", delay: 2600 },
  { text: "> SYSTEM READY", delay: 2800 },
  { text: "> WELCOME TO JOURNAL TERMINAL", delay: 3200 },
];

const BootSequence = ({ onComplete }: BootSequenceProps) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    bootLines.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, index]);
      }, line.delay);
      timers.push(timer);
    });

    // Complete boot sequence
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);
    timers.push(completeTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-terminal-bg z-50 flex items-center justify-center">
      {/* Scanlines overlay */}
      <div className="terminal-scanlines absolute inset-0" />
      
      {/* CRT curve effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.4) 100%)"
        }}
      />

      {/* Boot content */}
      <div className="relative z-10 p-8 max-w-2xl w-full font-vt323">
        <div className="space-y-1">
          {bootLines.map((line, index) => (
            <div
              key={index}
              className={`text-lg transition-opacity duration-100 ${
                visibleLines.includes(index) ? "opacity-100" : "opacity-0"
              }`}
            >
              {line.text === "" ? (
                <br />
              ) : (
                <span
                  className={`${
                    line.text.includes("OK")
                      ? "text-terminal-glow terminal-glow-subtle"
                      : line.text.includes("OFFLINE") || line.text.includes("ERROR")
                      ? "text-status-warning"
                      : line.text.startsWith(">")
                      ? "text-terminal-glow terminal-glow"
                      : "text-terminal-text"
                  }`}
                >
                  {line.text}
                </span>
              )}
            </div>
          ))}
          
          {/* Blinking cursor */}
          <div className="h-6 flex items-center">
            <span 
              className={`inline-block w-3 h-5 bg-terminal-glow ${
                showCursor ? "opacity-100" : "opacity-0"
              }`}
              style={{
                boxShadow: showCursor ? "0 0 8px hsl(var(--terminal-glow))" : "none"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootSequence;
