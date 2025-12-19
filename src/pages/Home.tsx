import { useState, useEffect, useCallback, useRef } from "react";
import SplashScreen from "@/components/SplashScreen";
import BootSequence from "@/components/BootSequence";
import TerminalStatus from "@/components/terminal/TerminalStatus";
import TerminalEntry from "@/components/terminal/TerminalEntry";
import TerminalIndex from "@/components/terminal/TerminalIndex";
import TerminalInsights from "@/components/terminal/TerminalInsights";
import TerminalAiden from "@/components/terminal/TerminalAiden";
import TerminalPurge from "@/components/terminal/TerminalPurge";
import AsciiLogo from "@/components/AsciiLogo";
import AsciiTypewriter from "@/components/terminal/AsciiTypewriter";
import KeyboardShortcutsModal from "@/components/terminal/KeyboardShortcutsModal";
import { useTheme } from "@/hooks/useTheme";

type TabId = "status" | "entry" | "index" | "insights" | "aiden" | "purge";
type StartupPhase = "splash" | "boot" | "ready";

const Home = () => {
  const [startupPhase, setStartupPhase] = useState<StartupPhase>("splash");
  const [activeTab, setActiveTab] = useState<TabId>("status");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wordCount, setWordCount] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevTabRef = useRef<TabId>(activeTab);
  const { cycleTheme, themeLabel } = useTheme();

  // Tab transition flicker
  useEffect(() => {
    if (activeTab !== prevTabRef.current) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        prevTabRef.current = activeTab;
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [activeTab]);

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
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Don't trigger if in contenteditable
      if ((e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      
      if (e.key === "F1") {
        e.preventDefault();
        setActiveTab("status");
      } else if (e.key === "F2") {
        e.preventDefault();
        setActiveTab("entry");
      } else if (e.key === "F3") {
        e.preventDefault();
        setActiveTab("index");
      } else if (e.key === "F4") {
        e.preventDefault();
        setActiveTab("insights");
      } else if (e.key === "F5") {
        e.preventDefault();
        setActiveTab("aiden");
      } else if (e.key === "F6") {
        e.preventDefault();
        setActiveTab("purge");
      } else if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts(true);
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        cycleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cycleTheme]);

  const tabs = [
    { id: "status" as TabId, label: "STATUS" },
    { id: "entry" as TabId, label: "ENTRY" },
    { id: "index" as TabId, label: "INDEX" },
    { id: "insights" as TabId, label: "INSIGHTS" },
    { id: "aiden" as TabId, label: "AIDEN" },
    { id: "purge" as TabId, label: "PURGE", danger: true },
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
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />

      {/* Terminal Container */}
      <div className="terminal-container crt-vignette w-full max-w-4xl relative overflow-hidden">
        {/* Scanlines */}
        <div className="terminal-scanlines" />
        
        {/* Main content with sweep effect */}
        <div className="crt-sweep crt-flicker relative flex flex-col min-h-[600px]">
          
          {/* Header */}
          <div className="terminal-header">
            <div className="flex items-center gap-3">
              <AsciiLogo />
              <span className="font-vt323 text-lg text-terminal-text tracking-widest">
                JOURNAL TERMINAL
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-terminal-dim font-vt323 text-sm">{formatTime(currentTime)}</span>
              <div className="status-indicator" />
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="flex flex-1 min-h-0">
            {/* Left Navigation Panel */}
            <div className="terminal-nav-panel">
              <nav className="flex-1 py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`terminal-nav-item ${
                      activeTab === tab.id ? "terminal-nav-item-active" : ""
                    } ${tab.danger ? "terminal-nav-item-danger" : ""}`}
                  >
                    <span className="font-vt323 text-lg w-4">
                      {activeTab === tab.id ? "▸" : " "}
                    </span>
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
                </div>
                
                {/* ASCII Typewriter Word Count */}
                <div className="pt-2 border-t border-terminal-border/50">
                  <AsciiTypewriter wordCount={wordCount} />
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
                    {tabs.find(t => t.id === activeTab)?.label}
                  </span>
                </div>
              </div>

              {/* Content Area with transition */}
              <div className={`flex-1 overflow-auto terminal-scrollbar p-4 ${isTransitioning ? 'tab-transitioning' : ''}`}>
                <div key={activeTab} className="h-full">
                  {activeTab === "status" && (
                    <TerminalStatus onNavigate={(tab) => setActiveTab(tab as TabId)} />
                  )}
                  {activeTab === "entry" && (
                    <TerminalEntry onWordCountChange={setWordCount} />
                  )}
                  {activeTab === "index" && <TerminalIndex />}
                  {activeTab === "insights" && <TerminalInsights />}
                  {activeTab === "aiden" && <TerminalAiden />}
                  {activeTab === "purge" && <TerminalPurge />}
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="terminal-status-bar">
            <div className="flex items-center gap-4">
              <div className="terminal-status-item">
                <span className="text-terminal-glow">●</span>
                <span>SYS: NOMINAL</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button 
                onClick={() => setShowShortcuts(true)}
                className="text-terminal-dim hover:text-terminal-text transition-colors"
              >
                [ ? ] HELP
              </button>
              <button 
                onClick={cycleTheme}
                className="text-terminal-dim hover:text-terminal-text transition-colors"
              >
                [ T ] {themeLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
