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
      <div className="crt-monitor w-full max-w-5xl">
        {/* CRT Screen */}
        <div className="crt-screen bg-terminal-bg crt-flicker">
          {/* Scanlines */}
          <div className="terminal-scanlines" />
          
          {/* Sweep line effect */}
          <div className="crt-sweep relative flex flex-col h-full">
            {/* Header Bar */}
            <div className="terminal-header">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5" />
                <span className="terminal-title">PERSONAL TERMINAL v2.1</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-terminal-dim font-vt323 text-sm">{formatTime(currentTime)}</span>
                <ThemeToggle />
                <div className="w-3 h-3 bg-terminal-glow animate-glow-pulse" />
              </div>
            </div>

            {/* Two-Column Layout */}
            <div className="flex flex-1 min-h-0">
              {/* Left Navigation Panel */}
              <div className="terminal-nav-panel">
                <div className="p-3 border-b border-terminal-border">
                  <span className="text-terminal-dim text-xs font-vt323">NAVIGATION</span>
                </div>
                
                <nav className="flex-1 py-2">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`terminal-nav-item ${
                        activeTab === tab.id ? "terminal-nav-item-active" : ""
                      }`}
                    >
                      <span className="terminal-nav-indicator">
                        {activeTab === tab.id ? "▸" : " "}
                      </span>
                      <span className="terminal-nav-key">F{index + 1}</span>
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* System Info at bottom of nav */}
                <div className="mt-auto border-t border-terminal-border p-3 space-y-2">
                  <div className="text-terminal-dim text-xs font-vt323 space-y-1">
                    <div className="flex justify-between">
                      <span>DATE:</span>
                      <span>{formatDate(currentTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WORDS:</span>
                      <span>{wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MEM:</span>
                      <span>64K FREE</span>
                    </div>
                  </div>
                  
                  {/* ASCII decoration */}
                  <div className="text-terminal-dim text-xs font-vt323 text-center pt-2 opacity-50">
                    ╔══════════╗<br/>
                    ║ MU/TH/UR ║<br/>
                    ╚══════════╝
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="terminal-divider" />

              {/* Right Content Panel */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Content Header */}
                <div className="px-4 py-2 border-b border-terminal-border bg-terminal-surface/30">
                  <div className="flex items-center gap-2">
                    {tabs.find(t => t.id === activeTab)?.icon && (
                      <span className="text-terminal-glow">
                        {(() => {
                          const Icon = tabs.find(t => t.id === activeTab)?.icon;
                          return Icon ? <Icon className="w-4 h-4" /> : null;
                        })()}
                      </span>
                    )}
                    <span className="font-vt323 text-terminal-text">
                      {tabs.find(t => t.id === activeTab)?.label} MODULE
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
                </div>
              </div>
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
              </div>
              <div className="flex items-center gap-4 text-terminal-dim text-xs">
                <span>F1-F3: NAV</span>
                <span>ESC: MENU</span>
                <span>CTRL+S: SAVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
