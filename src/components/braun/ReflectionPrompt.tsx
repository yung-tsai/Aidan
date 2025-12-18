import { useState, useEffect } from "react";

interface ReflectionPromptProps {
  onStartJournal?: () => void;
}

const prompts = [
  "What made you smile today?",
  "What's one thing you're grateful for?",
  "What would make today great?",
  "What's occupying your mind right now?",
  "What did you learn today?",
  "How are you really feeling?",
  "What's one small win from today?",
  "What do you need to let go of?",
  "Who made a difference in your day?",
  "What's something you're looking forward to?",
];

const ReflectionPrompt = ({ onStartJournal }: ReflectionPromptProps) => {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPressed, setIsPressed] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPrompt(Math.floor(Math.random() * prompts.length));
  }, []);

  const nextPrompt = () => {
    if (navigator.vibrate) navigator.vibrate(5);
    setIsRevealed(false);
    setTimeout(() => {
      setCurrentPrompt((prev) => (prev + 1) % prompts.length);
      setIsRevealed(true);
    }, 200);
  };

  const revealPrompt = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setIsRevealed(true);
  };

  const handleStartJournal = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    onStartJournal?.();
  };

  return (
    <div 
      className="flex flex-col items-center gap-6 py-6 px-4 w-full"
      role="region"
      aria-label="Reflection prompt"
    >
      {/* Prompt card */}
      <div 
        className={`w-full max-w-sm p-6 rounded-lg bg-device-inset transition-all duration-300 ${
          isRevealed ? "opacity-100" : "opacity-70 cursor-pointer"
        }`}
        onClick={!isRevealed ? revealPrompt : undefined}
        onKeyDown={!isRevealed ? (e) => e.key === "Enter" && revealPrompt() : undefined}
        tabIndex={!isRevealed ? 0 : undefined}
        role={!isRevealed ? "button" : undefined}
        aria-label={!isRevealed ? "Tap to reveal prompt" : undefined}
      >
        {isRevealed ? (
          <p 
            className="text-lg md:text-xl font-medium text-center leading-relaxed text-foreground"
            aria-live="polite"
          >
            {prompts[currentPrompt]}
          </p>
        ) : (
          <div className="text-center py-4">
            <div 
              className="w-14 h-14 mx-auto rounded-full bg-control-bg border-2 border-dashed border-control-border flex items-center justify-center mb-3"
              aria-hidden="true"
            >
              <span className="text-2xl text-muted-foreground">?</span>
            </div>
            <p className="braun-label text-muted-foreground">
              TAP TO REVEAL
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {isRevealed && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex gap-3">
            <button
              onClick={nextPrompt}
              onMouseDown={() => setIsPressed("another")}
              onMouseUp={() => setIsPressed(null)}
              onMouseLeave={() => setIsPressed(null)}
              onTouchStart={() => setIsPressed("another")}
              onTouchEnd={() => setIsPressed(null)}
              className={`braun-button touch-feedback ${isPressed === "another" ? "pressed" : ""}`}
              aria-label="Get another prompt"
            >
              ANOTHER
            </button>
            <button
              onClick={handleStartJournal}
              onMouseDown={() => setIsPressed("reflect")}
              onMouseUp={() => setIsPressed(null)}
              onMouseLeave={() => setIsPressed(null)}
              onTouchStart={() => setIsPressed("reflect")}
              onTouchEnd={() => setIsPressed(null)}
              className={`braun-button braun-button-primary touch-feedback ${isPressed === "reflect" ? "pressed" : ""}`}
              aria-label="Start reflecting on this prompt"
            >
              REFLECT
            </button>
          </div>
          
          {/* Prompt counter */}
          <div className="flex gap-1.5" role="list" aria-label={`Prompt ${currentPrompt + 1} of ${prompts.length}`}>
            {prompts.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentPrompt ? "bg-braun-orange scale-125" : "bg-control-border"
                }`}
                role="listitem"
                aria-current={i === currentPrompt ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReflectionPrompt;
