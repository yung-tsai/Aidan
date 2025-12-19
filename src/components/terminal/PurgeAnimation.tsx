import { useState, useEffect, useCallback } from "react";

export type PurgeMethod = "airlock" | "degauss" | "incinerate";

interface PurgeAnimationProps {
  entryTitle: string;
  entryContent: string;
  method: PurgeMethod;
  isActive: boolean;
  onComplete: () => void;
}

const PurgeAnimation = ({ 
  entryTitle, 
  entryContent, 
  method, 
  isActive, 
  onComplete 
}: PurgeAnimationProps) => {
  const [phase, setPhase] = useState<"idle" | "animating" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const [scrambledText, setScrambledText] = useState(entryContent);
  const [emberParticles, setEmberParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const plainContent = stripHtml(entryContent).substring(0, 200);

  // Scramble text effect for degauss
  const scrambleText = useCallback((text: string, intensity: number) => {
    const chars = "█▓▒░╔╗╚╝║═┌┐└┘│─┼├┤┬┴@#$%^&*";
    return text.split("").map((char, i) => {
      if (char === " " || char === "\n") return char;
      if (Math.random() < intensity) {
        return chars[Math.floor(Math.random() * chars.length)];
      }
      return char;
    }).join("");
  }, []);

  // Run animation when activated
  useEffect(() => {
    if (!isActive || phase !== "idle") return;
    
    setPhase("animating");
    
    const duration = method === "degauss" ? 2000 : method === "incinerate" ? 2500 : 1800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (method === "degauss") {
        setScrambledText(scrambleText(plainContent, newProgress));
      }

      if (method === "incinerate" && newProgress > 0.3) {
        // Add ember particles
        if (Math.random() > 0.7) {
          setEmberParticles(prev => [...prev.slice(-20), {
            id: Date.now(),
            x: Math.random() * 100,
            y: (1 - newProgress) * 100
          }]);
        }
      }

      if (newProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setPhase("complete");
        setTimeout(onComplete, 300);
      }
    };

    requestAnimationFrame(animate);
  }, [isActive, phase, method, plainContent, scrambleText, onComplete]);

  if (!isActive && phase === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-lg p-4">
        {/* Method Label */}
        <div className="text-center mb-4">
          <span className={`font-vt323 text-lg tracking-widest ${
            method === "airlock" ? "text-cyan-400" :
            method === "degauss" ? "text-purple-400" :
            "text-orange-400"
          }`}>
            {method === "airlock" && "◈ AIRLOCK JETTISON SEQUENCE ◈"}
            {method === "degauss" && "◈ DEGAUSS SEQUENCE ◈"}
            {method === "incinerate" && "◈ INCINERATION SEQUENCE ◈"}
          </span>
        </div>

        {/* Animation Container */}
        <div className={`
          terminal-box relative overflow-hidden
          ${method === "airlock" ? "purge-airlock" : ""}
          ${method === "degauss" ? "purge-degauss" : ""}
          ${method === "incinerate" ? "purge-incinerate" : ""}
        `} style={{
          "--purge-progress": progress,
        } as React.CSSProperties}>
          
          {/* Airlock Chamber Effect */}
          {method === "airlock" && (
            <>
              <div className="airlock-chamber" style={{ transform: `translateX(${progress * 150}%)`, opacity: 1 - progress }}>
                <div className="p-4">
                  <h3 className="font-vt323 text-terminal-glow text-lg mb-2">{entryTitle}</h3>
                  <p className="font-ibm text-terminal-dim text-sm">{plainContent}...</p>
                </div>
              </div>
              <div className="airlock-vacuum" style={{ opacity: progress * 0.8 }} />
              {progress > 0.5 && (
                <div className="airlock-stars">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="star" 
                      style={{ 
                        left: `${Math.random() * 100}%`, 
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.5}s`
                      }} 
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Degauss Effect */}
          {method === "degauss" && (
            <div className="degauss-container" style={{ 
              filter: `hue-rotate(${progress * 360}deg) saturate(${1 + progress * 2})`,
              transform: `scale(${1 - progress * 0.1}) skewX(${Math.sin(progress * 20) * 5}deg)`
            }}>
              <div className="p-4">
                <h3 className="font-vt323 text-terminal-glow text-lg mb-2" style={{
                  textShadow: `${Math.sin(progress * 30) * 10}px 0 hsl(${progress * 360}, 100%, 50%)`
                }}>
                  {scrambleText(entryTitle, progress * 0.8)}
                </h3>
                <p className="font-ibm text-terminal-dim text-sm whitespace-pre-wrap">
                  {scrambledText}
                </p>
              </div>
              <div className="degauss-warp" style={{ opacity: progress }} />
            </div>
          )}

          {/* Incinerate Effect */}
          {method === "incinerate" && (
            <div className="incinerate-container">
              <div className="p-4 relative">
                <h3 className="font-vt323 text-terminal-glow text-lg mb-2">{entryTitle}</h3>
                <p className="font-ibm text-terminal-dim text-sm">{plainContent}...</p>
                
                {/* Burn mask from bottom */}
                <div 
                  className="burn-mask" 
                  style={{ height: `${progress * 100}%` }}
                />
                
                {/* Ember particles */}
                {emberParticles.map(p => (
                  <div 
                    key={p.id} 
                    className="ember-particle"
                    style={{ left: `${p.x}%`, bottom: `${100 - p.y}%` }}
                  />
                ))}
              </div>
              
              {/* Fire glow at burn line */}
              <div 
                className="fire-line" 
                style={{ bottom: `${(1 - progress) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-1 bg-terminal-border rounded overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ${
                method === "airlock" ? "bg-cyan-400" :
                method === "degauss" ? "bg-purple-400" :
                "bg-orange-400"
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-vt323 text-terminal-dim text-sm">
              {phase === "complete" ? "PURGE COMPLETE" : "PURGING..."}
            </span>
            <span className="font-vt323 text-terminal-dim text-sm">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurgeAnimation;
