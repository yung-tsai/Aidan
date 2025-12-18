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

  useEffect(() => {
    // Pick a random prompt on mount
    setCurrentPrompt(Math.floor(Math.random() * prompts.length));
  }, []);

  const nextPrompt = () => {
    setIsRevealed(false);
    setTimeout(() => {
      setCurrentPrompt((prev) => (prev + 1) % prompts.length);
      setIsRevealed(true);
    }, 200);
  };

  const revealPrompt = () => {
    setIsRevealed(true);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Prompt card */}
      <div 
        className={`lcd-display w-full max-w-md p-8 cursor-pointer transition-all duration-300 ${
          isRevealed ? "opacity-100" : "opacity-70"
        }`}
        onClick={!isRevealed ? revealPrompt : undefined}
      >
        {isRevealed ? (
          <p className="lcd-text text-xl md:text-2xl font-medium text-center leading-relaxed">
            {prompts[currentPrompt]}
          </p>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-display-bg border-2 border-dashed border-display-dim flex items-center justify-center mb-4">
              <span className="text-2xl">?</span>
            </div>
            <p className="braun-label lcd-text-dim">
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
              className="braun-button"
            >
              ANOTHER
            </button>
            <button
              onClick={onStartJournal}
              className="braun-button braun-button-primary"
            >
              REFLECT
            </button>
          </div>
          
          {/* Prompt counter */}
          <div className="flex gap-1">
            {prompts.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentPrompt ? "bg-braun-orange" : "bg-control-border"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReflectionPrompt;
