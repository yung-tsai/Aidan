import { ReactNode } from "react";

interface CRTMonitorFrameProps {
  children: ReactNode;
}

const CRTMonitorFrame = ({ children }: CRTMonitorFrameProps) => {
  return (
    <div className="crt-monitor-wrapper">
      {/* Outer bezel - gray plastic frame */}
      <div className="crt-outer-bezel">
        {/* Inner bezel - thick black border */}
        <div className="crt-inner-bezel">
          {/* Screen area with inset effect */}
          <div className="crt-screen-inset">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRTMonitorFrame;
