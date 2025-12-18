import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DeviceHeader from "@/components/braun/DeviceHeader";
import ModeSwitch from "@/components/braun/ModeSwitch";
import BreathingGuide from "@/components/braun/BreathingGuide";
import FocusTimer from "@/components/braun/FocusTimer";
import ReflectionPrompt from "@/components/braun/ReflectionPrompt";
import AmbientSoundPlayer from "@/components/braun/AmbientSoundPlayer";
import ThemeSlider from "@/components/braun/ThemeSlider";
import useSessionStats from "@/hooks/useSessionStats";

type Mode = "breathe" | "focus" | "reflect";

const Home = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<Mode>("breathe");
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingStartTime, setBreathingStartTime] = useState<number | null>(null);
  const [focusTimeRemaining, setFocusTimeRemaining] = useState<string | null>(null);
  const [breathCount, setBreathCount] = useState(0);
  
  const { logBreathingSession, logFocusSession, logReflection } = useSessionStats();

  const modes: { id: Mode; label: string }[] = [
    { id: "breathe", label: "BREATHE" },
    { id: "focus", label: "FOCUS" },
    { id: "reflect", label: "REFLECT" },
  ];

  const handleStartJournal = useCallback(() => {
    logReflection();
    navigate("/chat");
  }, [logReflection, navigate]);

  const handleBreathingToggle = useCallback(() => {
    if (isBreathing) {
      if (breathingStartTime) {
        const minutes = Math.round((Date.now() - breathingStartTime) / 60000);
        if (minutes >= 1) {
          logBreathingSession(minutes);
        }
      }
      setBreathingStartTime(null);
      setBreathCount(0);
    } else {
      setBreathingStartTime(Date.now());
    }
    setIsBreathing(!isBreathing);
  }, [isBreathing, breathingStartTime, logBreathingSession]);

  const handleFocusComplete = useCallback((minutes: number) => {
    logFocusSession(minutes);
    setFocusTimeRemaining(null);
  }, [logFocusSession]);

  const showAmbientSounds = activeMode === "breathe" || activeMode === "focus";
  const isSessionActive = (activeMode === "breathe" && isBreathing) || activeMode === "focus";

  // Contextual status text
  const getStatusText = () => {
    if (activeMode === "breathe" && isBreathing) {
      return breathCount > 0 ? `BREATH ${breathCount}` : "BREATHING";
    }
    if (activeMode === "focus" && focusTimeRemaining) {
      return focusTimeRemaining;
    }
    return null;
  };

  const statusText = getStatusText();

  return (
    <main 
      className="min-h-screen min-h-[100dvh] bg-background flex items-center justify-center p-3 sm:p-4 md:p-8"
      role="main"
      aria-label="Reflect - Personal mindfulness device"
    >
      <div className="braun-device w-full max-w-md">
        <DeviceHeader />

        {/* Mode selector */}
        <nav className="flex justify-center px-4 sm:px-6 py-4 sm:py-5 bg-device-face" aria-label="Mode selection">
          <ModeSwitch
            modes={modes}
            activeMode={activeMode}
            onChange={(mode) => {
              if (navigator.vibrate) navigator.vibrate(5);
              if (activeMode === "breathe" && isBreathing) {
                handleBreathingToggle();
              }
              setActiveMode(mode as Mode);
            }}
          />
        </nav>

        <div className="braun-divider mx-4 sm:mx-6" aria-hidden="true" />

        {/* Ambient sound player */}
        {showAmbientSounds && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-device-face">
            <AmbientSoundPlayer isPlaying={isSessionActive} />
          </div>
        )}

        {/* Main display area */}
        <div className="lcd-display mx-3 sm:mx-6 my-3 sm:my-4 min-h-[300px] sm:min-h-[340px] flex items-center justify-center overflow-hidden">
          {activeMode === "breathe" && (
            <BreathingGuide
              isActive={isBreathing}
              onToggle={handleBreathingToggle}
              onCycleComplete={() => setBreathCount(c => c + 1)}
            />
          )}
          {activeMode === "focus" && (
            <FocusTimer 
              onComplete={handleFocusComplete}
              onTimeUpdate={setFocusTimeRemaining}
            />
          )}
          {activeMode === "reflect" && (
            <ReflectionPrompt onStartJournal={handleStartJournal} />
          )}
        </div>

        {/* Contextual status - only when active */}
        {statusText && (
          <div 
            className="flex justify-center pb-3 sm:pb-4 bg-device-face animate-fade-in"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <div className="indicator-light active" aria-hidden="true" />
              <span className="braun-mono text-xs text-foreground tracking-wider tabular-nums">
                {statusText}
              </span>
            </div>
          </div>
        )}

        {/* Theme rocker at bottom */}
        <ThemeSlider />
      </div>
    </main>
  );
};

export default Home;
