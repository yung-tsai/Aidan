interface ModeSwitchProps {
  modes: { id: string; label: string; icon?: React.ReactNode }[];
  activeMode: string;
  onChange: (mode: string) => void;
}

const ModeSwitch = ({ modes, activeMode, onChange }: ModeSwitchProps) => {
  return (
    <div 
      className="inline-flex gap-1 p-1 rounded-full bg-muted/50 border border-border/30"
      role="tablist"
      aria-label="Mode selection"
    >
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm tracking-wider uppercase transition-all duration-200
            ${activeMode === mode.id 
              ? "bg-foreground text-background shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
            }`}
          role="tab"
          aria-selected={activeMode === mode.id}
          aria-controls={`${mode.id}-panel`}
        >
          {mode.icon}
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSwitch;
