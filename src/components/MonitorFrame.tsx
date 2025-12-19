import React, { useState, useEffect } from "react";
import AsciiKeyboard from "./AsciiKeyboard";
import { supabase } from "@/integrations/supabase/client";

interface MonitorFrameProps {
  children: React.ReactNode;
}

const MonitorFrame = ({ children }: MonitorFrameProps) => {
  const [monitorImage, setMonitorImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const cachedImage = sessionStorage.getItem('monitor-frame-image');
    if (cachedImage) {
      setMonitorImage(cachedImage);
      setIsLoading(false);
      return;
    }

    const generateImage = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-monitor-image', {
          body: { type: 'monitor' }
        });

        if (error) {
          console.error('Error generating monitor image:', error);
          setUseFallback(true);
        } else if (data?.imageUrl) {
          setMonitorImage(data.imageUrl);
          sessionStorage.setItem('monitor-frame-image', data.imageUrl);
        } else {
          setUseFallback(true);
        }
      } catch (err) {
        console.error('Failed to generate monitor image:', err);
        setUseFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    generateImage();
  }, []);

  // CSS fallback version
  if (useFallback || isLoading) {
    return (
      <div className="monitor-outer">
        <div className="monitor-bezel">
          <div className="monitor-screen-inset">
            {children}
          </div>
          <div className="monitor-controls">
            <span className="monitor-brand">AIDEN-CRT</span>
            <div className="flex items-center gap-3">
              <span className="monitor-model">MODEL 1984</span>
              <div className="monitor-led" />
            </div>
          </div>
        </div>
        <AsciiKeyboard />
      </div>
    );
  }

  // AI-generated image version
  return (
    <div className="monitor-ai-wrapper">
      <div className="monitor-ai-container">
        {/* Monitor frame image */}
        <img 
          src={monitorImage!} 
          alt="" 
          className="monitor-ai-frame"
        />
        
        {/* Terminal content positioned inside the screen area */}
        <div className="monitor-ai-screen">
          {children}
        </div>
      </div>
      
      {/* Keyboard below */}
      <AsciiKeyboard />
    </div>
  );
};

export default MonitorFrame;
