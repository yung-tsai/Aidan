import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAchievements } from "@/hooks/useAchievements";
import { useDailyGoal } from "@/hooks/useDailyGoal";
import { formatDistanceToNow } from "date-fns";

interface TerminalStatusProps {
  onNavigate: (tab: string) => void;
}

const TerminalStatus = ({ onNavigate }: TerminalStatusProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

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
  const { goal, loading: goalLoading, updateTarget } = useDailyGoal(sessionId);

  const targetOptions = [250, 500, 750, 1000, 1500];

  useEffect(() => {
    const fetchRecentEntries = async () => {
      const { data } = await supabase
        .from("journal_entries")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentEntries(data || []);
    };

    fetchRecentEntries();
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const nearAchievements = achievements
    .filter((a) => !a.unlocked)
    .slice(0, 3);

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="terminal-box p-4 text-center">
        <pre className="font-vt323 text-terminal-glow text-xs sm:text-sm leading-tight">
{`╔═══════════════════════════════════════════╗
║     JOURNAL TERMINAL v2.0 - STATUS        ║
║         ◈ SYSTEM OPERATIONAL ◈            ║
╚═══════════════════════════════════════════╝`}
        </pre>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="terminal-box p-3 text-center">
          <div className="font-vt323 text-terminal-dim text-xs mb-1">ENTRIES</div>
          <div className="font-vt323 text-terminal-glow text-2xl terminal-glow-subtle">
            {loading ? "..." : stats.totalEntries}
          </div>
        </div>
        <div className="terminal-box p-3 text-center">
          <div className="font-vt323 text-terminal-dim text-xs mb-1">WORDS</div>
          <div className="font-vt323 text-terminal-glow text-2xl terminal-glow-subtle">
            {loading ? "..." : stats.totalWords.toLocaleString()}
          </div>
        </div>
        <div className="terminal-box p-3 text-center">
          <div className="font-vt323 text-terminal-dim text-xs mb-1">STREAK</div>
          <div className="font-vt323 text-terminal-glow text-2xl terminal-glow-subtle">
            {loading ? "..." : `${stats.currentStreak}d`}
          </div>
        </div>
        <div className="terminal-box p-3 text-center">
          <div className="font-vt323 text-terminal-dim text-xs mb-1">ACHIEVEMENTS</div>
          <div className="font-vt323 text-terminal-glow text-2xl terminal-glow-subtle">
            {loading ? "..." : `${unlockedCount}/${achievements.length}`}
          </div>
        </div>
      </div>

      {/* Daily Goal Section */}
      <div className="terminal-box p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-terminal-glow font-vt323">▶</span>
          <span className="font-vt323 text-terminal-text tracking-wide">DAILY WORD GOAL</span>
        </div>

        {goalLoading ? (
          <div className="font-vt323 text-terminal-dim text-sm animate-pulse">
            LOADING GOAL...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Goal Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-vt323 text-terminal-text">
                  {goal.todayWords.toLocaleString()} / {goal.targetWords.toLocaleString()} WORDS
                </span>
                <span className={`font-vt323 text-sm ${goal.isComplete ? "text-status-success" : "text-terminal-dim"}`}>
                  {goal.isComplete ? "★ GOAL MET!" : `${Math.round(goal.progress)}%`}
                </span>
              </div>
              
              {/* ASCII Progress Bar */}
              <div className="font-vt323 text-sm">
                <span className="text-terminal-dim">[</span>
                <span className="text-terminal-glow">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i}>{i < Math.floor(goal.progress / 5) ? "█" : "░"}</span>
                  ))}
                </span>
                <span className="text-terminal-dim">]</span>
              </div>
            </div>

            {/* Target Selector */}
            <div className="space-y-2">
              <span className="font-vt323 text-terminal-dim text-xs">SET TARGET:</span>
              <div className="flex flex-wrap gap-2">
                {targetOptions.map((target) => (
                  <button
                    key={target}
                    onClick={() => updateTarget(target)}
                    className={`terminal-btn px-3 py-1 text-xs ${
                      goal.targetWords === target
                        ? "bg-terminal-glow/20 border-terminal-glow text-terminal-glow"
                        : ""
                    }`}
                  >
                    <span className="font-vt323">{target}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Complete Celebration */}
            {goal.isComplete && (
              <div className="text-center py-2 border-t border-terminal-border/50">
                <pre className="font-vt323 text-status-success text-xs leading-tight">
{`◆◆◆ DAILY GOAL ACHIEVED ◆◆◆
    Keep up the momentum!`}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Achievement Progress */}
        <div className="terminal-box p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-terminal-glow font-vt323">▶</span>
            <span className="font-vt323 text-terminal-text tracking-wide">ACHIEVEMENT PROGRESS</span>
          </div>

          {loading ? (
            <div className="font-vt323 text-terminal-dim text-sm animate-pulse">
              LOADING ACHIEVEMENTS...
            </div>
          ) : nearAchievements.length === 0 ? (
            <div className="font-vt323 text-terminal-dim text-sm">
              ALL ACHIEVEMENTS UNLOCKED! ★
            </div>
          ) : (
            <div className="space-y-3">
              {nearAchievements.map((ach) => {
                let progress = 0;
                if (ach.key === "FIRST_LOG") progress = stats.totalEntries > 0 ? 100 : 0;
                else if (ach.key === "TEN_ENTRIES") progress = Math.min((stats.totalEntries / 10) * 100, 100);
                else if (ach.key === "FIFTY_ENTRIES") progress = Math.min((stats.totalEntries / 50) * 100, 100);
                else if (ach.key === "CENTURY") progress = Math.min((stats.totalEntries / 100) * 100, 100);
                else if (ach.key === "WEEK_STREAK") progress = Math.min((stats.currentStreak / 7) * 100, 100);
                else if (ach.key === "MONTH_STREAK") progress = Math.min((stats.currentStreak / 30) * 100, 100);
                else if (ach.key === "TAG_MASTER") progress = Math.min((stats.uniqueTags / 10) * 100, 100);

                return (
                  <div key={ach.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-vt323 text-terminal-text text-sm">
                        {ach.icon} {ach.name}
                      </span>
                      <span className="font-vt323 text-terminal-dim text-xs">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-terminal-border rounded overflow-hidden">
                      <div
                        className="h-full bg-terminal-glow transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="font-ibm text-terminal-dim text-xs">
                      {ach.description}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Unlocked Achievements */}
          {unlockedCount > 0 && (
            <div className="mt-4 pt-3 border-t border-terminal-border">
              <div className="font-vt323 text-terminal-dim text-xs mb-2">UNLOCKED:</div>
              <div className="flex flex-wrap gap-2">
                {achievements
                  .filter((a) => a.unlocked)
                  .map((ach) => (
                    <span
                      key={ach.key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-terminal-glow/20 border border-terminal-glow/30 rounded text-xs font-vt323 text-terminal-glow"
                      title={ach.description}
                    >
                      {ach.icon} {ach.name}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="terminal-box p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-terminal-glow font-vt323">▶</span>
            <span className="font-vt323 text-terminal-text tracking-wide">RECENT ACTIVITY</span>
          </div>

          {recentEntries.length === 0 ? (
            <div className="text-center py-6">
              <pre className="font-vt323 text-terminal-dim text-xs mb-3">
{`    ┌─────────────┐
    │  NO LOGS    │
    │   FOUND     │
    └─────────────┘`}
              </pre>
              <p className="font-ibm text-terminal-dim text-sm">
                Start your first journal entry
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2 border-b border-terminal-border/50 last:border-0"
                >
                  <span className="font-vt323 text-terminal-text text-sm truncate flex-1 mr-2">
                    ◇ {entry.title}
                  </span>
                  <span className="font-ibm text-terminal-dim text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="terminal-box p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-terminal-glow font-vt323">▶</span>
          <span className="font-vt323 text-terminal-text tracking-wide">QUICK ACTIONS</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate("entry")}
            className="terminal-btn py-3 text-center"
          >
            <span className="font-vt323">[ NEW ENTRY ]</span>
          </button>
          <button
            onClick={() => onNavigate("index")}
            className="terminal-btn py-3 text-center"
          >
            <span className="font-vt323">[ BROWSE INDEX ]</span>
          </button>
          <button
            onClick={() => onNavigate("insights")}
            className="terminal-btn py-3 text-center"
          >
            <span className="font-vt323">[ VIEW INSIGHTS ]</span>
          </button>
          <button
            onClick={() => onNavigate("aiden")}
            className="terminal-btn py-3 text-center"
          >
            <span className="font-vt323">[ TALK TO AIDEN ]</span>
          </button>
        </div>
      </div>

      {/* System Info Footer */}
      <div className="text-center">
        <span className="font-vt323 text-terminal-dim text-xs">
          MU/TH/UR 6000 INTERFACE ◈ TERMINAL ACTIVE ◈ ALL SYSTEMS NOMINAL
        </span>
      </div>
    </div>
  );
};

export default TerminalStatus;
