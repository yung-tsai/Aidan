interface ModeSwitchProps {
  modes: { id: string; label: string; icon?: React.ReactNode }[];
  activeMode: string;
  onChange: (mode: string) => void;
}

const ModeSwitch = ({ modes, activeMode, onChange }: ModeSwitchProps) => {
  return (
    <div className="mode-selector">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          className={`mode-option flex items-center gap-2 ${
            activeMode === mode.id ? "active" : ""
          }`}
        >
          {mode.icon}
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSwitch;
