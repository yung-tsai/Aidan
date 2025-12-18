interface DeviceHeaderProps {
  title?: string;
}

const DeviceHeader = ({ title = "REFLECT" }: DeviceHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-5 bg-device-inset border-b border-control-border">
      <div className="flex items-center gap-3">
        {/* Power indicator */}
        <div className="indicator-light active" />
        
        {/* Brand */}
        <h1 className="braun-title text-base tracking-[0.2em] text-foreground uppercase">
          {title}
        </h1>
      </div>
      
      {/* Speaker grille detail */}
      <div className="speaker-grille w-12 h-4" />
    </div>
  );
};

export default DeviceHeader;
