import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DeviceHeader from "@/components/braun/DeviceHeader";
import StatusBar from "@/components/braun/StatusBar";
import ModeSwitch from "@/components/braun/ModeSwitch";
import ClockDisplay from "@/components/braun/ClockDisplay";
import BreathingGuide from "@/components/braun/BreathingGuide";
import FocusTimer from "@/components/braun/FocusTimer";
import ReflectionPrompt from "@/components/braun/ReflectionPrompt";
import StatsDisplay from "@/components/braun/StatsDisplay";
import JournalHistory from "@/components/braun/JournalHistory";
import AmbientSoundPlayer from "@/components/braun/AmbientSoundPlayer";
import useSessionStats from "@/hooks/useSessionStats";

type Mode = "clock" | "breathe" | "focus" | "reflect" | "stats" | "journal";

const Home = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<Mode>("clock");
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingStartTime, setBreathingStartTime] = useState<number | null>(null);
  
  const { stats, logBreathingSession, logFocusSession, logReflection } = useSessionStats();

  const modes = [
    { id: "clock", label: "TIME" },
    { id: "breathe", label: "BREATHE" },
    { id: "focus", label: "FOCUS" },
    { id: "reflect", label: "REFLECT" },
    { id: "stats", label: "STATS" },
    { id: "journal", label: "JOURNAL" },
  ];

  const handleStartJournal = useCallback(() => {
    logReflection();
    navigate("/chat");
  }, [logReflection, navigate]);

  const handleBreathingToggle = useCallback(() => {
    if (isBreathing) {
      // Stopping - log the session
      if (breathingStartTime) {
        const minutes = Math.round((Date.now() - breathingStartTime) / 60000);
        if (minutes >= 1) {
          logBreathingSession(minutes);
        }
      }
      setBreathingStartTime(null);
    } else {
      // Starting
      setBreathingStartTime(Date.now());
    }
    setIsBreathing(!isBreathing);
  }, [isBreathing, breathingStartTime, logBreathingSession]);

  const handleFocusComplete = useCallback((minutes: number) => {
    logFocusSession(minutes);
  }, [logFocusSession]);

  // Show ambient sounds for breathing and focus modes
  const showAmbientSounds = activeMode === "breathe" || activeMode === "focus";
  const isSessionActive = (activeMode === "breathe" && isBreathing) || activeMode === "focus";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="braun-device w-full max-w-lg">
        <DeviceHeader />

        {/* Mode selector */}
        <div className="flex justify-center px-4 py-4 bg-device-face overflow-x-auto">
          <ModeSwitch
            modes={modes}
            activeMode={activeMode}
            onChange={(mode) => {
              // Stop breathing if switching away
              if (activeMode === "breathe" && isBreathing) {
                handleBreathingToggle();
              }
              setActiveMode(mode as Mode);
            }}
          />
        </div>

        <div className="braun-divider mx-6" />

        {/* Ambient sound player for breathing/focus modes */}
        {showAmbientSounds && (
          <div className="px-6 py-4 bg-device-face border-b border-control-border">
            <div className="braun-label text-center mb-3">AMBIENT SOUND</div>
            <AmbientSoundPlayer isPlaying={isSessionActive} />
          </div>
        )}

        {/* Main display area */}
        <div className="px-6 py-8 bg-device-face min-h-[380px] flex items-center justify-center overflow-y-auto braun-scrollbar">
          {activeMode === "clock" && <ClockDisplay />}
          {activeMode === "breathe" && (
            <BreathingGuide
              isActive={isBreathing}
              onToggle={handleBreathingToggle}
            />
          )}
          {activeMode === "focus" && (
            <FocusTimer onComplete={() => handleFocusComplete(25)} />
          )}
          {activeMode === "reflect" && (
            <ReflectionPrompt onStartJournal={handleStartJournal} />
          )}
          {activeMode === "stats" && (
            <StatsDisplay
              breathingSessions={stats.breathingSessions}
              breathingMinutes={stats.breathingMinutes}
              focusSessions={stats.focusSessions}
              focusMinutes={stats.focusMinutes}
              reflectionCount={stats.reflectionCount}
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
            />
          )}
          {activeMode === "journal" && <JournalHistory />}
        </div>

        <StatusBar
          leftContent={
            <div className="flex items-center gap-2">
              <div className={`indicator-light ${isSessionActive ? "active" : "success"}`} />
              <span className="braun-label">
                {isSessionActive ? "IN SESSION" : "READY"}
              </span>
            </div>
          }
          rightContent={
            <div className="flex items-center gap-3">
              {stats.currentStreak > 0 && (
                <span className="braun-label text-braun-orange">
                  🔥 {stats.currentStreak}d
                </span>
              )}
              <span className="braun-label text-muted-foreground">
                V1.0
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Home;
