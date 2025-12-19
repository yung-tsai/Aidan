import React from "react";
import AsciiKeyboard from "./AsciiKeyboard";

interface MonitorFrameProps {
  children: React.ReactNode;
}

const MonitorFrame = ({ children }: MonitorFrameProps) => {
  return (
    <div className="monitor-outer">
      {/* Monitor bezel */}
      <div className="monitor-bezel">
        {/* Screen recess */}
        <div className="monitor-screen-inset">
          {children}
        </div>
        
        {/* Bottom controls */}
        <div className="monitor-controls">
          <span className="monitor-brand">AIDEN-CRT</span>
          <div className="flex items-center gap-3">
            <span className="monitor-model">MODEL 1984</span>
            <div className="monitor-led" />
          </div>
        </div>
      </div>
      
      {/* Keyboard preview */}
      <AsciiKeyboard />
    </div>
  );
};

export default MonitorFrame;
