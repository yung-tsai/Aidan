interface StatusBarProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const StatusBar = ({ leftContent, rightContent }: StatusBarProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-device-inset border-t border-control-border">
      <div className="flex items-center gap-3">
        {leftContent}
      </div>
      <div className="flex items-center gap-3">
        {rightContent}
      </div>
    </div>
  );
};

export default StatusBar;
