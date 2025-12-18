import ThemeToggle from "../ThemeToggle";

interface DeviceHeaderProps {
  title?: string;
  showThemeToggle?: boolean;
  rightContent?: React.ReactNode;
}

const DeviceHeader = ({ 
  title = "REFLECT", 
  showThemeToggle = true,
  rightContent 
}: DeviceHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-device-inset border-b border-control-border">
      <div className="flex items-center gap-4">
        {/* Brand indicator */}
        <div className="flex items-center gap-2">
          <div className="indicator-light active" />
        </div>
        
        {/* Title */}
        <h1 className="braun-title text-lg tracking-wide text-foreground">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {rightContent}
        {showThemeToggle && <ThemeToggle />}
      </div>
    </div>
  );
};

export default DeviceHeader;
