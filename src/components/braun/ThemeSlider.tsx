import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "ice";

const ThemeSlider = () => {
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

  const selectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (navigator.vibrate) navigator.vibrate(3);
  };

  const themes: { id: Theme; label: string }[] = [
    { id: "light", label: "DAY" },
    { id: "dark", label: "DUSK" },
    { id: "ice", label: "NIGHT" },
  ];

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Theme selection">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => selectTheme(t.id)}
          className={`px-3 py-1.5 rounded-full text-[10px] tracking-wider uppercase transition-all duration-200
            ${theme === t.id 
              ? "bg-foreground text-background" 
              : "text-muted-foreground hover:text-foreground"
            }`}
          role="radio"
          aria-checked={theme === t.id}
          aria-label={`${t.label} theme`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default ThemeSlider;
