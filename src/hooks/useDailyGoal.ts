import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DailyGoal {
  targetWords: number;
  todayWords: number;
  progress: number;
  isComplete: boolean;
}

export const useDailyGoal = (sessionId: string | null) => {
  const [goal, setGoal] = useState<DailyGoal>({
    targetWords: 500,
    todayWords: 0,
    progress: 0,
    isComplete: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchGoalAndProgress = useCallback(async () => {
    try {
      // Fetch goal target (use localStorage key for consistency)
      const storedSessionId = localStorage.getItem("journalSessionId");
      
      let targetWords = 500;
      if (storedSessionId) {
        const { data: goalData } = await supabase
          .from("daily_goals")
          .select("target_words")
          .eq("session_id", storedSessionId)
          .single();
        targetWords = goalData?.target_words || 500;
      }

      // Fetch today's entries and calculate words (all entries, not session-specific)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: entries } = await supabase
        .from("journal_entries")
        .select("content, created_at")
        .gte("created_at", today.toISOString());

      const todayWords = entries?.reduce((sum, entry) => {
        const plainText = entry.content.replace(/<[^>]*>/g, "");
        return sum + plainText.split(/\s+/).filter(Boolean).length;
      }, 0) || 0;

      const progress = Math.min((todayWords / targetWords) * 100, 100);

      setGoal({
        targetWords,
        todayWords,
        progress,
        isComplete: todayWords >= targetWords,
      });
    } catch (error) {
      console.error("Error fetching daily goal:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTarget = useCallback(async (newTarget: number) => {
    const storedSessionId = localStorage.getItem("journalSessionId");
    if (!storedSessionId) return;

    try {
      const { error } = await supabase
        .from("daily_goals")
        .upsert({
          session_id: storedSessionId,
          target_words: newTarget,
        }, {
          onConflict: "session_id",
        });

      if (error) throw error;

      setGoal((prev) => ({
        ...prev,
        targetWords: newTarget,
        progress: Math.min((prev.todayWords / newTarget) * 100, 100),
        isComplete: prev.todayWords >= newTarget,
      }));
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  }, []);

  useEffect(() => {
    fetchGoalAndProgress();
  }, [fetchGoalAndProgress]);

  return {
    goal,
    loading,
    updateTarget,
    refetch: fetchGoalAndProgress,
  };
};
