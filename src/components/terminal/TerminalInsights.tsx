import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, format, subDays, isWithinInterval } from "date-fns";

interface InsightData {
  entriesThisMonth: number;
  avgWordsPerEntry: number;
  streakDays: number;
  themes: { name: string; percentage: number }[];
  weekActivity: { day: string; entries: number }[];
  topTags: string[];
}

const TerminalInsights = () => {
  const [data, setData] = useState<InsightData>({
    entriesThisMonth: 0,
    avgWordsPerEntry: 0,
    streakDays: 0,
    themes: [],
    weekActivity: [],
    topTags: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data: entries, error } = await supabase
          .from("journal_entries")
          .select("created_at, content, tags")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const allEntries = entries || [];

        // Calculate entries this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const entriesThisMonth = allEntries.filter(
          (e) => new Date(e.created_at) >= startOfMonth
        ).length;

        // Calculate average words
        const totalWords = allEntries.reduce((sum, entry) => {
          const plainText = entry.content.replace(/<[^>]*>/g, "");
          return sum + plainText.split(/\s+/).filter(Boolean).length;
        }, 0);
        const avgWordsPerEntry = allEntries.length > 0 
          ? Math.round(totalWords / allEntries.length) 
          : 0;

        // Calculate streak
        let streakDays = 0;
        if (allEntries.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const dates = allEntries.map((e) => {
            const d = new Date(e.created_at);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
          });
          
          const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
          const todayTime = today.getTime();
          const yesterdayTime = todayTime - 86400000;
          
          if (uniqueDates[0] === todayTime || uniqueDates[0] === yesterdayTime) {
            streakDays = 1;
            for (let i = 1; i < uniqueDates.length; i++) {
              if (uniqueDates[i - 1] - uniqueDates[i] === 86400000) {
                streakDays++;
              } else {
                break;
              }
            }
          }
        }

        // Calculate tag distribution
        const tagCounts: Record<string, number> = {};
        allEntries.forEach((entry) => {
          entry.tags?.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        const totalTagged = Object.values(tagCounts).reduce((a, b) => a + b, 0);
        const themes = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({
            name: name.toUpperCase(),
            percentage: totalTagged > 0 ? Math.round((count / totalTagged) * 100) : 0,
          }));

        // Calculate weekly activity
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
        const weekActivity = days.map((day, i) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + i);
          const dayStart = new Date(dayDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayDate);
          dayEnd.setHours(23, 59, 59, 999);

          const entriesOnDay = allEntries.filter((e) => {
            const entryDate = new Date(e.created_at);
            return isWithinInterval(entryDate, { start: dayStart, end: dayEnd });
          }).length;

          return { day, entries: entriesOnDay };
        });

        // Get top tags
        const topTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([tag]) => tag.toUpperCase());

        setData({
          entriesThisMonth,
          avgWordsPerEntry,
          streakDays,
          themes,
          weekActivity,
          topTags,
        });
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="terminal-box p-4 h-24" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="terminal-box p-3 h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-tab-enter">
      {/* Summary */}
      <div className="terminal-box p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-terminal-glow font-vt323">▶</span>
          <span className="font-vt323 text-lg text-terminal-glow terminal-glow-subtle">
            ANALYSIS SUMMARY
          </span>
        </div>
        <p className="text-terminal-text font-ibm text-sm leading-relaxed">
          {data.entriesThisMonth > 0 ? (
            <>
              You've written <span className="text-terminal-glow">{data.entriesThisMonth} entries</span> this month
              with an average of <span className="text-terminal-glow">{data.avgWordsPerEntry} words</span> per entry.
              {data.streakDays > 0 && (
                <> Your current streak is <span className="text-terminal-glow">{data.streakDays} days</span>.</>
              )}
              {data.topTags.length > 0 && (
                <> Your most common topics are {data.topTags.join(", ")}.</>
              )}
            </>
          ) : (
            <>No entries recorded yet. Start writing to see your insights!</>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="terminal-box p-3 text-center">
          <div className="text-terminal-dim font-vt323 text-xs mb-1">ENTRIES</div>
          <div className="text-terminal-glow terminal-glow font-vt323 text-2xl">
            {data.entriesThisMonth}
          </div>
        </div>
        <div className="terminal-box p-3 text-center">
          <div className="text-terminal-dim font-vt323 text-xs mb-1">AVG WORDS</div>
          <div className="text-terminal-glow terminal-glow font-vt323 text-2xl">
            {data.avgWordsPerEntry}
          </div>
        </div>
        <div className="terminal-box p-3 text-center">
          <div className="text-terminal-dim font-vt323 text-xs mb-1">STREAK</div>
          <div className="text-terminal-glow terminal-glow font-vt323 text-2xl">
            {data.streakDays}D
          </div>
        </div>
      </div>

      {/* Theme Distribution */}
      <div className="terminal-box p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-terminal-glow font-vt323">▶</span>
          <span className="font-vt323 text-lg text-terminal-glow terminal-glow-subtle">
            TAG DISTRIBUTION
          </span>
        </div>
        {data.themes.length > 0 ? (
          <div className="space-y-2">
            {data.themes.map((theme) => (
              <div key={theme.name} className="flex items-center gap-3">
                <span className="font-vt323 text-terminal-text w-28 text-sm truncate">
                  #{theme.name}
                </span>
                <div className="flex-1 h-3 bg-terminal-muted overflow-hidden">
                  <div
                    className="h-full bg-terminal-accent transition-all duration-500"
                    style={{ width: `${theme.percentage}%` }}
                  />
                </div>
                <span className="font-vt323 text-terminal-dim w-10 text-right text-sm">
                  {theme.percentage}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-ibm text-terminal-dim text-sm">
            No tags used yet. Add tags to your entries to see distribution.
          </p>
        )}
      </div>

      {/* Weekly Activity */}
      <div className="terminal-box p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-terminal-glow font-vt323">▶</span>
          <span className="font-vt323 text-lg text-terminal-glow terminal-glow-subtle">
            THIS WEEK
          </span>
        </div>
        <div className="flex items-end justify-between gap-2 h-20">
          {data.weekActivity.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col-reverse">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-full h-5 border border-terminal-border ${
                      i < day.entries
                        ? "bg-terminal-accent"
                        : "bg-terminal-muted/30"
                    }`}
                  />
                ))}
              </div>
              <span className="font-vt323 text-terminal-dim text-xs">
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      {data.topTags.length > 0 && (
        <div className="terminal-box p-3">
          <div className="flex items-center justify-between">
            <span className="font-vt323 text-terminal-dim text-xs">TOP TOPICS:</span>
            <div className="flex gap-2">
              {data.topTags.map((tag) => (
                <span
                  key={tag}
                  className="terminal-tag-small"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalInsights;