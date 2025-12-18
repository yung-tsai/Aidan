import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";

const SplashScreenPage = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState(0);
  const [showReplay, setShowReplay] = useState(false);

  const handleComplete = () => {
    setShowReplay(true);
  };

  const handleReplay = () => {
    setShowReplay(false);
    setKey((prev) => prev + 1);
  };

  return (
    <div className="relative">
      <SplashScreen key={key} onComplete={handleComplete} />
      
      {showReplay && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4">
          <button
            onClick={handleReplay}
            className="px-6 py-2 bg-primary/20 border border-primary text-primary font-mono text-sm hover:bg-primary/30 transition-colors"
          >
            [ REPLAY ]
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-muted/20 border border-muted-foreground text-muted-foreground font-mono text-sm hover:bg-muted/30 transition-colors"
          >
            [ HOME ]
          </button>
        </div>
      )}
    </div>
  );
};

export default SplashScreenPage;
