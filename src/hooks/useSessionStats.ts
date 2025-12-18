import { useState, useEffect, useCallback } from "react";

interface SessionStats {
  breathingSessions: number;
  breathingMinutes: number;
  focusSessions: number;
  focusMinutes: number;
  reflectionCount: number;
  currentStreak: number;
  longestStreak: number;
  lastReflectionDate: string | null;
}

const defaultStats: SessionStats = {
  breathingSessions: 0,
  breathingMinutes: 0,
  focusSessions: 0,
  focusMinutes: 0,
  reflectionCount: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastReflectionDate: null,
};

const STORAGE_KEY = "reflect-stats";

const useSessionStats = () => {
  const [stats, setStats] = useState<SessionStats>(defaultStats);

  // Load stats from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setStats({ ...defaultStats, ...parsed });
      } catch {
        console.error("Failed to parse stats");
      }
    }
  }, []);

  // Save stats to localStorage whenever they change
  const saveStats = useCallback((newStats: SessionStats) => {
    setStats(newStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  }, []);

  const logBreathingSession = useCallback((minutes: number) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        breathingSessions: prev.breathingSessions + 1,
        breathingMinutes: prev.breathingMinutes + minutes,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logFocusSession = useCallback((minutes: number) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        focusSessions: prev.focusSessions + 1,
        focusMinutes: prev.focusMinutes + minutes,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logReflection = useCallback(() => {
    const today = new Date().toDateString();
    
    setStats((prev) => {
      const lastDate = prev.lastReflectionDate;
      let newStreak = prev.currentStreak;
      
      if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate === today) {
          // Already logged today, don't increment
          return prev;
        } else if (lastDate === yesterday.toDateString()) {
          // Consecutive day
          newStreak = prev.currentStreak + 1;
        } else {
          // Streak broken
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const updated = {
        ...prev,
        reflectionCount: prev.reflectionCount + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastReflectionDate: today,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetStats = useCallback(() => {
    saveStats(defaultStats);
  }, [saveStats]);

  return {
    stats,
    logBreathingSession,
    logFocusSession,
    logReflection,
    resetStats,
  };
};

export default useSessionStats;
