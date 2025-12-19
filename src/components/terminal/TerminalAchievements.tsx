import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAchievements } from "@/hooks/useAchievements";
import { formatDistanceToNow } from "date-fns";

type FilterType = "all" | "unlocked" | "locked";

const TerminalAchievements = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const getOrCreateSession = async () => {
      const storedSessionId = localStorage.getItem("journalSessionId");
      if (storedSessionId) {
        setSessionId(storedSessionId);
        return;
      }

      const { data, error } = await supabase
        .from("sessions")
        .insert({ completed: false })
        .select()
        .single();

      if (!error && data) {
        localStorage.setItem("journalSessionId", data.id);
        setSessionId(data.id);
      }
    };

    getOrCreateSession();
  }, []);

  const { achievements, stats, loading } = useAchievements(sessionId);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const filteredAchievements = achievements.filter((a) => {
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked") return !a.unlocked;
    return true;
  });

  const getProgress = (key: string): number => {
    switch (key) {
      case "FIRST_LOG":
        return stats.totalEntries > 0 ? 100 : 0;
      case "TEN_ENTRIES":
        return Math.min((stats.totalEntries / 10) * 100, 100);
      case "FIFTY_ENTRIES":
        return Math.min((stats.totalEntries / 50) * 100, 100);
      case "CENTURY":
        return Math.min((stats.totalEntries / 100) * 100, 100);
      case "WEEK_STREAK":
        return Math.min((stats.currentStreak / 7) * 100, 100);
      case "MONTH_STREAK":
        return Math.min((stats.currentStreak / 30) * 100, 100);
      case "TAG_MASTER":
        return Math.min((stats.uniqueTags / 10) * 100, 100);
      default:
        return 0;
    }
  };

  const getProgressText = (key: string): string => {
    switch (key) {
      case "FIRST_LOG":
        return stats.totalEntries > 0 ? "1/1" : "0/1";
      case "TEN_ENTRIES":
        return `${Math.min(stats.totalEntries, 10)}/10`;
      case "FIFTY_ENTRIES":
        return `${Math.min(stats.totalEntries, 50)}/50`;
      case "CENTURY":
        return `${Math.min(stats.totalEntries, 100)}/100`;
      case "WEEK_STREAK":
        return `${Math.min(stats.currentStreak, 7)}/7 days`;
      case "MONTH_STREAK":
        return `${Math.min(stats.currentStreak, 30)}/30 days`;
      case "TAG_MASTER":
        return `${Math.min(stats.uniqueTags, 10)}/10 tags`;
      default:
        return "Special";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="terminal-box p-4 text-center">
        <pre className="font-vt323 text-terminal-glow text-xs sm:text-sm leading-tight">
{`╔═══════════════════════════════════════════╗
║         ◈ ACHIEVEMENT ARCHIVE ◈           ║
║            TROPHY COLLECTION              ║
╚═══════════════════════════════════════════╝`}
        </pre>
      </div>

      {/* Progress Overview */}
      <div className="terminal-box p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-vt323 text-terminal-text">COLLECTION PROGRESS</span>
          <span className="font-vt323 text-terminal-glow terminal-glow-subtle">
            {loading ? "..." : `${unlockedCount}/${achievements.length}`}
          </span>
        </div>
        <div className="h-3 bg-terminal-border rounded overflow-hidden">
          <div
            className="h-full bg-terminal-glow transition-all duration-700"
            style={{ width: loading ? "0%" : `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 font-vt323 text-terminal-dim text-xs">
          <span>0%</span>
          <span>{loading ? "..." : `${Math.round((unlockedCount / achievements.length) * 100)}% COMPLETE`}</span>
          <span>100%</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "unlocked", "locked"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`terminal-btn px-4 py-2 ${filter === f ? "bg-terminal-glow/20 border-terminal-glow" : ""}`}
          >
            <span className="font-vt323 uppercase">
              {f === "all" ? "ALL" : f === "unlocked" ? "★ UNLOCKED" : "○ LOCKED"}
            </span>
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="terminal-box p-8 text-center">
          <span className="font-vt323 text-terminal-dim animate-pulse">LOADING ACHIEVEMENTS...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAchievements.map((ach) => {
            const progress = getProgress(ach.key);
            const progressText = getProgressText(ach.key);

            return (
              <div
                key={ach.key}
                className={`terminal-box p-4 transition-all ${
                  ach.unlocked
                    ? "border-terminal-glow/50 bg-terminal-glow/5"
                    : "opacity-75"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`text-3xl flex-shrink-0 ${
                      ach.unlocked ? "" : "grayscale opacity-50"
                    }`}
                  >
                    {ach.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-vt323 text-lg text-terminal-text truncate">
                        {ach.name}
                      </h3>
                      <span
                        className={`font-vt323 text-sm flex-shrink-0 ${
                          ach.unlocked ? "text-terminal-glow" : "text-terminal-dim"
                        }`}
                      >
                        {ach.unlocked ? "★ UNLOCKED" : "○ LOCKED"}
                      </span>
                    </div>

                    <p className="font-ibm text-terminal-dim text-sm mb-3">
                      {ach.description}
                    </p>

                    {/* Progress Bar (only for locked achievements) */}
                    {!ach.unlocked && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-vt323">
                          <span className="text-terminal-dim">PROGRESS</span>
                          <span className="text-terminal-text">{progressText}</span>
                        </div>
                        <div className="h-2 bg-terminal-border rounded overflow-hidden">
                          <div
                            className="h-full bg-terminal-glow/60 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Unlock Date (only for unlocked achievements) */}
                    {ach.unlocked && ach.unlockedAt && (
                      <div className="flex items-center gap-2 text-xs font-vt323 text-terminal-dim">
                        <span className="text-status-success">●</span>
                        <span>
                          UNLOCKED {formatDistanceToNow(new Date(ach.unlockedAt), { addSuffix: true }).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAchievements.length === 0 && (
        <div className="terminal-box p-8 text-center">
          <pre className="font-vt323 text-terminal-dim text-xs mb-3">
{`    ┌─────────────┐
    │  NO MATCH   │
    │   FOUND     │
    └─────────────┘`}
          </pre>
          <p className="font-ibm text-terminal-dim text-sm">
            No achievements match the current filter
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center">
        <span className="font-vt323 text-terminal-dim text-xs">
          ACHIEVEMENT SYSTEM ◈ TRACK YOUR PROGRESS ◈ COLLECT THEM ALL
        </span>
      </div>
    </div>
  );
};

export default TerminalAchievements;
