import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import AsciiEmptyState from "./AsciiEmptyState";
import PurgeAnimation, { PurgeMethod } from "./PurgeAnimation";

type JournalEntry = {
  id: string;
  session_id: string | null;
  title: string;
  content: string;
  created_at: string;
  tags?: string[];
};

type PurgePhase = "select" | "confirm" | "typing" | "lastwords" | "purging";

const TerminalPurge = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [purgeMethod, setPurgeMethod] = useState<PurgeMethod>("airlock");
  const [phase, setPhase] = useState<PurgePhase>("select");
  const [confirmInput, setConfirmInput] = useState("");
  const [lastWords, setLastWords] = useState("");
  const [currentPurgeEntry, setCurrentPurgeEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEntry = (id: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEntries(newSelected);
  };

  const handleInitiatePurge = () => {
    if (selectedEntries.size === 0) {
      toast.error("SELECT ENTRIES TO PURGE");
      return;
    }
    setPhase("confirm");
  };

  const handleConfirmMethod = () => {
    setPhase("typing");
  };

  const handleTypingConfirm = () => {
    if (confirmInput.toUpperCase() !== "PURGE") {
      toast.error("TYPE 'PURGE' TO CONFIRM");
      return;
    }
    setPhase("lastwords");
  };

  const handleStartPurge = () => {
    const firstId = Array.from(selectedEntries)[0];
    const entry = entries.find(e => e.id === firstId);
    if (entry) {
      setCurrentPurgeEntry(entry);
      setPhase("purging");
    }
  };

  const handlePurgeComplete = async () => {
    if (!currentPurgeEntry) return;

    try {
      // Actually delete from database
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", currentPurgeEntry.id);

      if (error) throw error;

      // Remove from local state
      setEntries(prev => prev.filter(e => e.id !== currentPurgeEntry.id));
      const newSelected = new Set(selectedEntries);
      newSelected.delete(currentPurgeEntry.id);
      setSelectedEntries(newSelected);

      // Check if more entries to purge
      if (newSelected.size > 0) {
        const nextId = Array.from(newSelected)[0];
        const nextEntry = entries.find(e => e.id === nextId);
        if (nextEntry) {
          setCurrentPurgeEntry(nextEntry);
          return;
        }
      }

      // All done
      toast.success("PURGE COMPLETE - MEMORY CLEANSED");
      setPhase("select");
      setCurrentPurgeEntry(null);
      setConfirmInput("");
      setLastWords("");
    } catch (error) {
      console.error("Error purging entry:", error);
      toast.error("PURGE FAILED - SYSTEM ERROR");
      setPhase("select");
    }
  };

  const handleCancel = () => {
    setPhase("select");
    setConfirmInput("");
    setLastWords("");
  };

  const selectedEntriesData = entries.filter(e => selectedEntries.has(e.id));

  // Purging animation overlay
  if (phase === "purging" && currentPurgeEntry) {
    return (
      <PurgeAnimation
        entryTitle={currentPurgeEntry.title}
        entryContent={currentPurgeEntry.content}
        method={purgeMethod}
        isActive={true}
        onComplete={handlePurgeComplete}
      />
    );
  }

  // Confirmation flow
  if (phase !== "select") {
    return (
      <div className="space-y-4 animate-tab-enter">
        {/* Warning Header */}
        <div className="purge-warning-box p-4">
          <pre className="font-vt323 text-sm text-center text-status-error leading-tight">
{`╔══════════════════════════════════════╗
║   ⚠ CATHARTIC PURGE MODULE ⚠        ║
║      IRREVERSIBLE OPERATION          ║
╚══════════════════════════════════════╝`}
          </pre>
        </div>

        {/* Method Selection */}
        {phase === "confirm" && (
          <div className="terminal-box p-4 space-y-4">
            <h3 className="font-vt323 text-terminal-glow text-lg">SELECT DESTRUCTION METHOD:</h3>
            
            <div className="grid gap-3">
              {[
                { id: "airlock" as PurgeMethod, name: "AIRLOCK JETTISON", desc: "Eject into the void of space", color: "text-cyan-400" },
                { id: "degauss" as PurgeMethod, name: "DEGAUSS SEQUENCE", desc: "Magnetic wipe with CRT distortion", color: "text-purple-400" },
                { id: "incinerate" as PurgeMethod, name: "INCINERATE", desc: "Burn from existence", color: "text-orange-400" },
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setPurgeMethod(method.id)}
                  className={`terminal-box p-3 text-left transition-all ${
                    purgeMethod === method.id 
                      ? "border-terminal-glow bg-terminal-glow/10" 
                      : "hover:border-terminal-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-vt323 text-lg">
                      {purgeMethod === method.id ? "◉" : "○"}
                    </span>
                    <div>
                      <span className={`font-vt323 ${method.color}`}>{method.name}</span>
                      <p className="text-terminal-dim text-xs font-ibm mt-0.5">{method.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCancel} className="terminal-btn flex-1">[ ABORT ]</button>
              <button onClick={handleConfirmMethod} className="terminal-btn terminal-btn-danger flex-1">[ PROCEED ]</button>
            </div>
          </div>
        )}

        {/* Type PURGE confirmation */}
        {phase === "typing" && (
          <div className="terminal-box p-4 space-y-4">
            <div className="text-center space-y-2">
              <p className="font-vt323 text-status-error text-lg">FINAL CONFIRMATION REQUIRED</p>
              <p className="font-ibm text-terminal-dim text-sm">
                You are about to permanently destroy {selectedEntries.size} {selectedEntries.size === 1 ? "entry" : "entries"}.
              </p>
            </div>

            <div className="terminal-box p-3">
              <p className="font-vt323 text-terminal-dim text-sm mb-2">TYPE "PURGE" TO CONFIRM:</p>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
                placeholder="_"
                className="w-full bg-transparent font-vt323 text-2xl text-terminal-glow text-center tracking-[0.5em] outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button onClick={handleCancel} className="terminal-btn flex-1">[ ABORT ]</button>
              <button 
                onClick={handleTypingConfirm} 
                disabled={confirmInput !== "PURGE"}
                className={`terminal-btn flex-1 ${confirmInput === "PURGE" ? "terminal-btn-danger" : "opacity-50 cursor-not-allowed"}`}
              >
                [ CONFIRM ]
              </button>
            </div>
          </div>
        )}

        {/* Last Words (optional) */}
        {phase === "lastwords" && (
          <div className="terminal-box p-4 space-y-4">
            <div className="text-center">
              <p className="font-vt323 text-terminal-glow text-lg">EPITAPH (OPTIONAL)</p>
              <p className="font-ibm text-terminal-dim text-sm mt-1">
                Any last words before these memories are purged?
              </p>
            </div>

            <textarea
              value={lastWords}
              onChange={(e) => setLastWords(e.target.value)}
              placeholder="[Leave blank to skip]"
              className="w-full h-24 bg-terminal-surface/50 border border-terminal-border rounded p-3 font-ibm text-terminal-text text-sm outline-none focus:border-terminal-glow resize-none"
            />

            {/* Entries to be purged */}
            <div className="space-y-2">
              <p className="font-vt323 text-terminal-dim text-sm">MARKED FOR DELETION:</p>
              <div className="max-h-32 overflow-auto terminal-scrollbar space-y-1">
                {selectedEntriesData.map(entry => (
                  <div key={entry.id} className="flex items-center gap-2 text-status-error/80 font-vt323 text-sm">
                    <span>☠</span>
                    <span>{entry.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCancel} className="terminal-btn flex-1">[ ABORT ]</button>
              <button onClick={handleStartPurge} className="terminal-btn terminal-btn-danger flex-1">
                [ EXECUTE PURGE ]
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main selection view
  return (
    <div className="space-y-4 animate-tab-enter">
      {/* Header */}
      <div className="purge-warning-box p-3">
        <div className="flex items-center gap-3">
          <span className="font-vt323 text-status-error text-2xl">☠</span>
          <div>
            <h2 className="font-vt323 text-terminal-glow text-lg">CATHARTIC PURGE</h2>
            <p className="font-ibm text-terminal-dim text-xs">Select entries to permanently destroy</p>
          </div>
        </div>
      </div>

      {/* Method preview */}
      <div className="flex gap-2">
        {[
          { id: "airlock" as PurgeMethod, icon: "◇", color: "text-cyan-400" },
          { id: "degauss" as PurgeMethod, icon: "◈", color: "text-purple-400" },
          { id: "incinerate" as PurgeMethod, icon: "◆", color: "text-orange-400" },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setPurgeMethod(m.id)}
            className={`terminal-tag ${purgeMethod === m.id ? "terminal-tag-filter-active" : ""} ${m.color}`}
          >
            {m.icon} {m.id.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Entry list with checkboxes */}
      <div className="space-y-2 max-h-[280px] overflow-auto terminal-scrollbar">
        {isLoading ? (
          <AsciiEmptyState type="loading" />
        ) : entries.length === 0 ? (
          <AsciiEmptyState type="no-entries" />
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => toggleEntry(entry.id)}
              className={`terminal-box p-3 cursor-pointer transition-all ${
                selectedEntries.has(entry.id)
                  ? "border-status-error bg-status-error/10"
                  : "hover:border-terminal-accent"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`font-vt323 text-lg ${
                  selectedEntries.has(entry.id) ? "text-status-error" : "text-terminal-dim"
                }`}>
                  {selectedEntries.has(entry.id) ? "☒" : "☐"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-vt323 text-lg truncate ${
                      selectedEntries.has(entry.id) ? "text-status-error" : "text-terminal-glow"
                    }`}>
                      {entry.title.toUpperCase()}
                    </h3>
                    <span className="text-terminal-dim font-vt323 text-sm flex-shrink-0">
                      {format(new Date(entry.created_at), "MMM dd").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-terminal-dim font-ibm text-xs line-clamp-1 mt-1">
                    {stripHtml(entry.content).substring(0, 60)}...
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between pt-2 border-t border-terminal-border">
        <span className="font-vt323 text-terminal-dim text-sm">
          {selectedEntries.size} SELECTED
        </span>
        <button
          onClick={handleInitiatePurge}
          disabled={selectedEntries.size === 0}
          className={`terminal-btn ${
            selectedEntries.size > 0 ? "terminal-btn-danger" : "opacity-50 cursor-not-allowed"
          }`}
        >
          [ INITIATE PURGE ]
        </button>
      </div>
    </div>
  );
};

export default TerminalPurge;
