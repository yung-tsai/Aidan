import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import BootSequence from "@/components/BootSequence";
import ThemeToggle from "@/components/ThemeToggle";
import TerminalEntry from "@/components/terminal/TerminalEntry";
import TerminalIndex from "@/components/terminal/TerminalIndex";
import TerminalInsights from "@/components/terminal/TerminalInsights";
import TerminalAiden from "@/components/terminal/TerminalAiden";
import AsciiPyramid from "@/components/AsciiCube";

type TabId = "entry" | "index" | "insights" | "aiden";
type StartupPhase = "splash" | "boot" | "ready";

const Home = () => {
  const navigate = useNavigate();
  const [startupPhase, setStartupPhase] = useState<StartupPhase>("splash");
  const [activeTab, setActiveTab] = useState<TabId>("entry");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wordCount, setWordCount] = useState(0);
  const [systemStatus, setSystemStatus] = useState("NOMINAL");

  const handleSplashComplete = useCallback(() => {
    setStartupPhase("boot");
  }, []);

  const handleBootComplete = useCallback(() => {
    setStartupPhase("ready");
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if startup has been shown this session
  useEffect(() => {
    const hasBooted = sessionStorage.getItem("hasBooted");
    if (hasBooted) {
      setStartupPhase("ready");
    }
  }, []);

  useEffect(() => {
    if (startupPhase === "ready") {
      sessionStorage.setItem("hasBooted", "true");
    }
  }, [startupPhase]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        setActiveTab("entry");
      } else if (e.key === "F2") {
        e.preventDefault();
        setActiveTab("index");
      } else if (e.key === "F3") {
        e.preventDefault();
        setActiveTab("insights");
      } else if (e.key === "F4") {
        e.preventDefault();
        setActiveTab("aiden");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const tabs = [
    { id: "entry" as TabId, label: "ENTRY", key: "F1" },
    { id: "index" as TabId, label: "INDEX", key: "F2" },
    { id: "insights" as TabId, label: "INSIGHTS", key: "F3" },
    { id: "aiden" as TabId, label: "AIDEN", key: "F4" },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour12: false, 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "2-digit" 
    }).toUpperCase();
  };

  if (startupPhase === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (startupPhase === "boot") {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Terminal Container - No monitor frame */}
      <div className="terminal-container crt-vignette w-full max-w-4xl relative overflow-hidden">
        {/* Scanlines */}
        <div className="terminal-scanlines" />
        
        {/* Main content with sweep effect */}
        <div className="crt-sweep crt-flicker relative flex flex-col min-h-[600px]">
          
          {/* Header */}
          <div className="terminal-header">
            <div className="flex items-center gap-4">
              <AsciiPyramid />
              <span className="font-vt323 text-terminal-dim text-sm">├──</span>
              <span className="font-vt323 text-lg text-terminal-text tracking-widest">
                JOURNAL TERMINAL
              </span>
              <span className="font-vt323 text-terminal-dim text-sm">v2.1</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-terminal-dim font-vt323 text-sm">{formatTime(currentTime)}</span>
              <ThemeToggle />
              <div className="status-indicator" />
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="flex flex-1 min-h-0">
            {/* Left Navigation Panel */}
            <div className="terminal-nav-panel">
              <div className="p-3 border-b border-terminal-border">
                <span className="text-terminal-dim text-xs font-vt323 tracking-widest">[ MODULES ]</span>
              </div>
              
              <nav className="flex-1 py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`terminal-nav-item ${
                      activeTab === tab.id ? "terminal-nav-item-active" : ""
                    }`}
                  >
                    <span className="font-vt323 text-lg w-4">
                      {activeTab === tab.id ? "▸" : " "}
                    </span>
                    <span className="terminal-nav-key">{tab.key}</span>
                    <span>[ {tab.label} ]</span>
                  </button>
                ))}
              </nav>

              {/* System Info */}
              <div className="mt-auto border-t border-terminal-border p-3 space-y-2">
                <div className="text-terminal-dim text-xs font-vt323 space-y-1">
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span className="text-terminal-text">{formatDate(currentTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WORDS:</span>
                    <span className="text-terminal-text">{wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MEM:</span>
                    <span className="text-terminal-text">64K</span>
                  </div>
                </div>
                
                {/* ASCII decoration */}
                <div className="text-terminal-muted text-xs font-vt323 text-center pt-2 opacity-40">
                  ┌─────────┐<br/>
                  │ MU/TH/UR │<br/>
                  └─────────┘
                </div>
              </div>
            </div>

            {/* Right Content Panel */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Content Header */}
              <div className="px-4 py-2 border-b border-terminal-border bg-terminal-surface/30">
                <div className="flex items-center gap-2">
                  <span className="text-terminal-dim font-vt323">▶</span>
                  <span className="font-vt323 text-terminal-glow terminal-glow-subtle">
                    {tabs.find(t => t.id === activeTab)?.label} MODULE
                  </span>
                  <span className="text-terminal-dim font-vt323 text-xs ml-auto">
                    ────────────────
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-auto terminal-scrollbar p-4">
                {activeTab === "entry" && (
                  <TerminalEntry onWordCountChange={setWordCount} />
                )}
                {activeTab === "index" && <TerminalIndex />}
                {activeTab === "insights" && <TerminalInsights />}
                {activeTab === "aiden" && <TerminalAiden />}
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="terminal-status-bar">
            <div className="flex items-center gap-6">
              <div className="terminal-status-item">
                <span className="text-terminal-glow">●</span>
                <span>SYS: {systemStatus}</span>
              </div>
              <div className="terminal-status-item">
                <span className="text-terminal-dim">○</span>
                <span>NET: ISOLATED</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-terminal-dim text-xs">
              <span>[ F1-F4: NAV ]</span>
              <span>[ CTRL+S: SAVE ]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
