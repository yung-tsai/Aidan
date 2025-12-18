import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BootSequence from "@/components/BootSequence";
import ThemeToggle from "@/components/ThemeToggle";
import TerminalEntry from "@/components/terminal/TerminalEntry";
import TerminalIndex from "@/components/terminal/TerminalIndex";
import TerminalInsights from "@/components/terminal/TerminalInsights";
import { Monitor, FileText, FolderOpen, BarChart3, Wifi, WifiOff } from "lucide-react";

type TabId = "entry" | "index" | "insights";

const Home = () => {
  const navigate = useNavigate();
  const [isBooting, setIsBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("entry");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wordCount, setWordCount] = useState(0);
  const [systemStatus, setSystemStatus] = useState("NOMINAL");

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if boot has been shown this session
  useEffect(() => {
    const hasBooted = sessionStorage.getItem("hasBooted");
    if (hasBooted) {
      setIsBooting(false);
    }
  }, []);

  useEffect(() => {
    if (!isBooting) {
      sessionStorage.setItem("hasBooted", "true");
    }
  }, [isBooting]);

  const tabs = [
    { id: "entry" as TabId, label: "ENTRY", icon: FileText },
    { id: "index" as TabId, label: "INDEX", icon: FolderOpen },
    { id: "insights" as TabId, label: "INSIGHTS", icon: BarChart3 },
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

  if (isBooting) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className="min-h-screen bg-crt-shadow flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* CRT Monitor Frame */}
      <div className="crt-monitor w-full max-w-4xl">
        {/* CRT Screen */}
        <div className="crt-screen bg-terminal-bg crt-flicker">
          {/* Scanlines */}
          <div className="terminal-scanlines" />
          
          {/* Sweep line effect */}
          <div className="crt-sweep relative">
            {/* Header Bar */}
            <div className="terminal-header">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5" />
                <span className="terminal-title">PERSONAL TERMINAL</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <div className="w-3 h-3 bg-terminal-glow animate-glow-pulse" />
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-terminal-border bg-terminal-surface/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`terminal-tab flex items-center gap-2 ${
                    activeTab === tab.id ? "terminal-tab-active" : ""
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
              <div className="flex-1" />
              {/* Mini status in tab bar */}
              <div className="flex items-center gap-4 px-4 text-terminal-dim font-vt323 text-sm">
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px] max-h-[60vh] overflow-auto terminal-scrollbar p-4">
              {activeTab === "entry" && (
                <TerminalEntry onWordCountChange={setWordCount} />
              )}
              {activeTab === "index" && <TerminalIndex />}
              {activeTab === "insights" && <TerminalInsights />}
            </div>

            {/* Status Bar */}
            <div className="terminal-status-bar">
              <div className="flex items-center gap-6">
                <div className="terminal-status-item">
                  <div className="status-indicator" />
                  <span>SYS: {systemStatus}</span>
                </div>
                <div className="terminal-status-item">
                  <WifiOff className="w-3 h-3" />
                  <span>NET: ISOLATED</span>
                </div>
                <div className="terminal-status-item">
                  <span>WORDS: {wordCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="terminal-status-item">
                  <span>{formatDate(currentTime)}</span>
                </div>
                <div className="terminal-status-item">
                  <span>MEM: 64K FREE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
