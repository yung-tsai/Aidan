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
  };

  const themes: { id: Theme; label: string }[] = [
    { id: "light", label: "DAY" },
    { id: "dark", label: "DUSK" },
    { id: "ice", label: "NIGHT" },
  ];

  return (
    <div className="flex items-center justify-center gap-1 py-4 px-6 bg-device-inset border-t border-control-border">
      <div className="theme-rocker">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => selectTheme(t.id)}
            className={`theme-rocker-option ${theme === t.id ? "active" : ""}`}
            aria-label={`Switch to ${t.label} theme`}
          >
            <span className="braun-label text-[10px]">{t.label}</span>
          </button>
        ))}
        {/* Sliding indicator */}
        <div 
          className="theme-rocker-indicator"
          style={{
            transform: `translateX(${themes.findIndex(t => t.id === theme) * 100}%)`
          }}
        />
      </div>
    </div>
  );
};

export default ThemeSlider;
