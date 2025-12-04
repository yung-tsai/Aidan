interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "light" | "dark";
}

const FilterPill = ({ label, active, onClick, variant = "light" }: FilterPillProps) => {
  const isDark = variant === "dark";
  
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1 font-ibm text-xs transition-all
        ${active 
          ? isDark 
            ? "bg-white text-insights-dark" 
            : "bg-insights-dark text-white"
          : isDark
            ? "bg-transparent text-insights-gray-light border border-insights-gray-mid hover:border-white"
            : "bg-transparent text-insights-gray-mid border border-insights-border hover:border-insights-dark"
        }
      `}
    >
      {label}
    </button>
  );
};

export default FilterPill;
