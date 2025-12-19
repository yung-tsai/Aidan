import { useEffect } from "react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal = ({ isOpen, onClose }: KeyboardShortcutsModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "F1", action: "STATUS MODULE" },
    { key: "F2", action: "ENTRY MODULE" },
    { key: "F3", action: "INDEX MODULE" },
    { key: "F4", action: "INSIGHTS MODULE" },
    { key: "F5", action: "AIDEN MODULE" },
    { key: "F6", action: "TROPHIES MODULE" },
    { key: "F7", action: "PURGE MODULE", danger: true },
    { key: "T", action: "CYCLE THEME" },
    { key: "?", action: "SHOW THIS HELP" },
    { key: "ESC", action: "CLOSE MODAL" },
    { key: "CTRL+S", action: "SAVE ENTRY" },
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="terminal-container crt-vignette w-full max-w-md relative overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="terminal-scanlines" />
        
        <div className="crt-sweep crt-flicker relative">
          {/* Header */}
          <div className="terminal-header">
            <div className="flex items-center gap-2">
              <span className="font-vt323 text-terminal-glow">▶</span>
              <span className="font-vt323 text-lg text-terminal-text tracking-widest">
                KEYBOARD SHORTCUTS
              </span>
            </div>
            <button 
              onClick={onClose}
              className="font-vt323 text-terminal-dim hover:text-terminal-glow transition-colors"
            >
              [ × ]
            </button>
          </div>

          {/* ASCII Art Header */}
          <div className="p-4 border-b border-terminal-border bg-terminal-surface/30">
            <pre className="font-vt323 text-terminal-dim text-xs text-center leading-tight">
{`┌─────────────────────────────┐
│   SYSTEM COMMAND REFERENCE  │
│      MU/TH/UR INTERFACE     │
└─────────────────────────────┘`}
            </pre>
          </div>

          {/* Shortcuts List */}
          <div className="p-4 space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div 
                key={shortcut.key}
                className="flex items-center justify-between py-2 border-b border-terminal-border/50 last:border-0"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className={`terminal-btn text-xs py-0.5 px-2 ${shortcut.danger ? "terminal-btn-danger" : ""}`}>
                  {shortcut.key}
                </span>
                <span className={`font-vt323 text-sm tracking-wider ${shortcut.danger ? "text-status-error" : "text-terminal-text"}`}>
                  {shortcut.action}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="terminal-status-bar">
            <span className="font-vt323 text-xs">PRESS ESC TO CLOSE</span>
            <span className="font-vt323 text-xs text-terminal-glow">■ ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
