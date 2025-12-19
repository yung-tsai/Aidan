import { useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "ice";

const THEMES: Theme[] = ["light", "dark", "ice"];

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    
    if (savedTheme && THEMES.includes(savedTheme)) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    document.documentElement.classList.remove("dark", "ice");
    if (newTheme !== "light") {
      document.documentElement.classList.add(newTheme);
    }
  };

  const cycleTheme = useCallback(() => {
    setTheme((current) => {
      const currentIndex = THEMES.indexOf(current);
      const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
      applyTheme(nextTheme);
      localStorage.setItem("theme", nextTheme);
      return nextTheme;
    });
  }, []);

  const getThemeLabel = () => {
    switch (theme) {
      case "light": return "LIGHT";
      case "dark": return "AMBER";
      case "ice": return "ICE";
    }
  };

  return { theme, cycleTheme, themeLabel: getThemeLabel() };
};
