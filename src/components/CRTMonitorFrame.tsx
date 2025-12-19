import { ReactNode } from "react";
import crtFrame from "@/assets/crt-frame.png";

interface CRTMonitorFrameProps {
  children: ReactNode;
}

const CRTMonitorFrame = ({ children }: CRTMonitorFrameProps) => {
  return (
    <div className="crt-monitor-wrapper">
      {/* The CRT frame image */}
      <img 
        src={crtFrame} 
        alt="" 
        className="crt-monitor-image"
        aria-hidden="true"
      />
      
      {/* The screen content area - positioned to fit inside the gray area */}
      <div className="crt-monitor-screen">
        {children}
      </div>
    </div>
  );
};

export default CRTMonitorFrame;
