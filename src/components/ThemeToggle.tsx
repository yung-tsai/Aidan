import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "ice";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    
    if (savedTheme && ["light", "dark", "ice"].includes(savedTheme)) {
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

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "ice"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const getLabel = () => {
    switch (theme) {
      case "light": return "[ LIGHT ]";
      case "dark": return "[ AMBER ]";
      case "ice": return "[ ICE ]";
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="terminal-btn text-xs"
      aria-label={`Current theme: ${theme}. Click to cycle.`}
    >
      {getLabel()}
    </button>
  );
};

export default ThemeToggle;
