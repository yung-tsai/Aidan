import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import FilterPill from "./FilterPill";

// Mock data for the mood chart
const generateMockData = (days: number) => {
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    mood: Math.floor(Math.random() * 40) + 30, // 30-70 range
    energy: Math.floor(Math.random() * 40) + 30,
  }));
};

const MoodOscilloscope = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [metric, setMetric] = useState<"mood" | "energy">("mood");
  
  const getDays = () => {
    switch (timeRange) {
      case "7d": return 7;
      case "30d": return 30;
      case "90d": return 90;
      case "all": return 120;
    }
  };
  
  const data = generateMockData(getDays());
  
  return (
    <div className="relative w-full p-5 rounded bg-insights-dark border border-dashed border-insights-gray-mid">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 insights-scanlines rounded pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="font-mono font-medium text-lg text-white mb-1">Mood Over Time</h2>
        <p className="font-ibm text-xs text-insights-gray-light mb-4">Past {getDays()} days</p>
        
        {/* Chart */}
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                stroke="#444" 
                tick={{ fill: "#666", fontSize: 10 }}
                axisLine={{ stroke: "#333" }}
              />
              <YAxis 
                stroke="#444" 
                tick={{ fill: "#666", fontSize: 10 }}
                axisLine={{ stroke: "#333" }}
                domain={[0, 100]}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#666" }}
                itemStyle={{ color: "#6BFFFA" }}
              />
              <Line 
                type="monotone" 
                dataKey={metric} 
                stroke="#6BFFFA" 
                strokeWidth={2}
                dot={false}
                className="insights-neon-glow"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between mt-4 gap-3">
          {/* Time filters */}
          <div className="flex gap-2">
            {(["7d", "30d", "90d", "all"] as const).map((range) => (
              <FilterPill
                key={range}
                label={range === "all" ? "All" : range}
                active={timeRange === range}
                onClick={() => setTimeRange(range)}
                variant="dark"
              />
            ))}
          </div>
          
          {/* Metric toggle */}
          <div className="flex gap-2">
            <FilterPill
              label="Mood"
              active={metric === "mood"}
              onClick={() => setMetric("mood")}
              variant="dark"
            />
            <FilterPill
              label="Energy"
              active={metric === "energy"}
              onClick={() => setMetric("energy")}
              variant="dark"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodOscilloscope;
