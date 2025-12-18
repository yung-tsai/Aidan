import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeviceHeader from "@/components/braun/DeviceHeader";
import StatusBar from "@/components/braun/StatusBar";
import ModeSwitch from "@/components/braun/ModeSwitch";
import ClockDisplay from "@/components/braun/ClockDisplay";
import BreathingGuide from "@/components/braun/BreathingGuide";
import FocusTimer from "@/components/braun/FocusTimer";
import ReflectionPrompt from "@/components/braun/ReflectionPrompt";

type Mode = "clock" | "breathe" | "focus" | "reflect";

const Home = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<Mode>("clock");
  const [isBreathing, setIsBreathing] = useState(false);

  const modes = [
    { id: "clock", label: "TIME" },
    { id: "breathe", label: "BREATHE" },
    { id: "focus", label: "FOCUS" },
    { id: "reflect", label: "REFLECT" },
  ];

  const handleStartJournal = () => {
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="braun-device w-full max-w-lg">
        <DeviceHeader />

        {/* Mode selector */}
        <div className="flex justify-center px-6 py-4 bg-device-face">
          <ModeSwitch
            modes={modes}
            activeMode={activeMode}
            onChange={(mode) => setActiveMode(mode as Mode)}
          />
        </div>

        <div className="braun-divider mx-6" />

        {/* Main display area */}
        <div className="px-6 py-8 bg-device-face min-h-[400px] flex items-center justify-center">
          {activeMode === "clock" && <ClockDisplay />}
          {activeMode === "breathe" && (
            <BreathingGuide
              isActive={isBreathing}
              onToggle={() => setIsBreathing(!isBreathing)}
            />
          )}
          {activeMode === "focus" && <FocusTimer />}
          {activeMode === "reflect" && (
            <ReflectionPrompt onStartJournal={handleStartJournal} />
          )}
        </div>

        <StatusBar
          leftContent={
            <div className="flex items-center gap-2">
              <div className="indicator-light success" />
              <span className="braun-label">READY</span>
            </div>
          }
          rightContent={
            <span className="braun-label text-muted-foreground">
              V1.0
            </span>
          }
        />
      </div>
    </div>
  );
};

export default Home;
