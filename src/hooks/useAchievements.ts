import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
}

interface UserAchievement {
  achievement_key: string;
  unlocked_at: string;
  progress: number;
}

interface AchievementWithProgress extends Achievement {
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

export const useAchievements = (sessionId: string | null) => {
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalWords: 0,
    currentStreak: 0,
    uniqueTags: 0,
    lastEntryDate: null as string | null,
  });

  const fetchAchievements = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Fetch all achievements
      const { data: allAchievements, error: achError } = await supabase
        .from("achievements")
        .select("*");

      if (achError) throw achError;

      // Fetch user's unlocked achievements
      const { data: userAchievements, error: userError } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("session_id", sessionId);

      if (userError) throw userError;

      // Merge achievements with user progress
      const merged: AchievementWithProgress[] = (allAchievements || []).map((ach) => {
        const userAch = (userAchievements || []).find(
          (ua: UserAchievement) => ua.achievement_key === ach.key
        );
        return {
          ...ach,
          unlocked: !!userAch,
          unlockedAt: userAch?.unlocked_at,
          progress: userAch?.progress || 0,
        };
      });

      setAchievements(merged);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  }, [sessionId]);

  const fetchStats = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Get all entries for this session
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("created_at, content, tags")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const totalEntries = entries?.length || 0;
      
      // Calculate total words
      const totalWords = entries?.reduce((sum, entry) => {
        const plainText = entry.content.replace(/<[^>]*>/g, "");
        return sum + plainText.split(/\s+/).filter(Boolean).length;
      }, 0) || 0;

      // Calculate unique tags
      const allTags = new Set<string>();
      entries?.forEach((entry) => {
        entry.tags?.forEach((tag: string) => allTags.add(tag));
      });

      // Calculate streak
      let currentStreak = 0;
      if (entries && entries.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dates = entries.map((e) => {
          const d = new Date(e.created_at);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });
        
        const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
        
        // Check if there's an entry today or yesterday
        const todayTime = today.getTime();
        const yesterdayTime = todayTime - 86400000;
        
        if (uniqueDates[0] === todayTime || uniqueDates[0] === yesterdayTime) {
          currentStreak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            if (uniqueDates[i - 1] - uniqueDates[i] === 86400000) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

      setStats({
        totalEntries,
        totalWords,
        currentStreak,
        uniqueTags: allTags.size,
        lastEntryDate: entries?.[0]?.created_at || null,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const unlockAchievement = useCallback(
    async (achievementKey: string) => {
      if (!sessionId) return;

      // Check if already unlocked
      const existing = achievements.find(
        (a) => a.key === achievementKey && a.unlocked
      );
      if (existing) return;

      try {
        const { error } = await supabase.from("user_achievements").insert({
          session_id: sessionId,
          achievement_key: achievementKey,
          progress: 1,
        });

        if (error) throw error;

        const achievement = achievements.find((a) => a.key === achievementKey);
        if (achievement) {
          toast.success(`Achievement Unlocked: ${achievement.name}`, {
            description: achievement.description,
            icon: achievement.icon,
          });
        }

        await fetchAchievements();
      } catch (error) {
        console.error("Error unlocking achievement:", error);
      }
    },
    [sessionId, achievements, fetchAchievements]
  );

  const checkAchievements = useCallback(
    async (entryContent?: string, entryTags?: string[]) => {
      if (!sessionId) return;

      // Refresh stats first
      await fetchStats();

      // Check FIRST_LOG
      if (stats.totalEntries === 0 || stats.totalEntries === 1) {
        await unlockAchievement("FIRST_LOG");
      }

      // Check entry count achievements
      if (stats.totalEntries >= 10) await unlockAchievement("TEN_ENTRIES");
      if (stats.totalEntries >= 50) await unlockAchievement("FIFTY_ENTRIES");
      if (stats.totalEntries >= 100) await unlockAchievement("CENTURY");

      // Check streak achievements
      if (stats.currentStreak >= 7) await unlockAchievement("WEEK_STREAK");
      if (stats.currentStreak >= 30) await unlockAchievement("MONTH_STREAK");

      // Check tag achievements
      if (stats.uniqueTags >= 10) await unlockAchievement("TAG_MASTER");

      // Check WORDSMITH for current entry
      if (entryContent) {
        const plainText = entryContent.replace(/<[^>]*>/g, "");
        const wordCount = plainText.split(/\s+/).filter(Boolean).length;
        if (wordCount >= 1000) {
          await unlockAchievement("WORDSMITH");
        }
      }

      // Check time-based achievements
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 0 && hour < 5) {
        await unlockAchievement("NIGHT_OWL");
      }
      if (hour >= 5 && hour < 6) {
        await unlockAchievement("EARLY_BIRD");
      }
    },
    [sessionId, stats, fetchStats, unlockAchievement]
  );

  useEffect(() => {
    if (sessionId) {
      fetchAchievements();
      fetchStats();
    }
  }, [sessionId, fetchAchievements, fetchStats]);

  return {
    achievements,
    stats,
    loading,
    checkAchievements,
    unlockAchievement,
    refetch: () => {
      fetchAchievements();
      fetchStats();
    },
  };
};
