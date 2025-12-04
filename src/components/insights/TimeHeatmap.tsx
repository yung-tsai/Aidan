const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const times = ["M", "A", "E", "LN"]; // Morning, Afternoon, Evening, Late Night
const timeLabels = ["Morning", "Afternoon", "Evening", "Late Night"];

// Generate mock heatmap data (0-100 intensity)
const mockHeatmapData = [
  [70, 65, 60, 55, 50, 80, 75], // Morning
  [50, 55, 45, 60, 65, 70, 60], // Afternoon
  [40, 45, 50, 55, 45, 55, 50], // Evening
  [30, 35, 25, 40, 35, 45, 25], // Late Night
];

const TimeHeatmap = () => {
  const getIntensityColor = (value: number) => {
    // Map 0-100 to grayscale (darker = higher intensity/better mood)
    const grayValue = 95 - (value * 0.7); // 95% (light) to 25% (dark)
    return `hsl(0, 0%, ${grayValue}%)`;
  };
  
  return (
    <div>
      {/* Grid */}
      <div className="flex gap-1">
        {/* Time labels column */}
        <div className="flex flex-col gap-1 mr-1 sm:mr-2">
          <div className="h-6 sm:h-5 md:h-[18px]" /> {/* Spacer for day labels */}
          {times.map((time, i) => (
            <div 
              key={time} 
              className="h-6 sm:h-5 md:h-[18px] flex items-center font-ibm text-[9px] sm:text-[10px] text-insights-gray-light"
              title={timeLabels[i]}
            >
              {time}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        <div className="flex-1">
          {/* Day labels */}
          <div className="flex gap-1 mb-1">
            {days.map((day) => (
              <div 
                key={day} 
                className="w-6 sm:w-5 md:w-[18px] font-ibm text-[9px] sm:text-[10px] text-insights-gray-light text-center"
              >
                {day.charAt(0)}
              </div>
            ))}
          </div>
          
          {/* Grid cells */}
          {mockHeatmapData.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 mb-1">
              {row.map((value, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-6 h-6 sm:w-5 sm:h-5 md:w-[18px] md:h-[18px] border border-insights-border transition-colors hover:scale-110"
                  style={{ backgroundColor: getIntensityColor(value) }}
                  title={`${days[colIndex]} ${timeLabels[rowIndex]}: ${value}%`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Caption */}
      <p className="font-ibm text-[10px] sm:text-xs text-insights-gray-light mt-3 sm:mt-4 italic">
        Sunday late nights trend anxious. Sunday mornings are your peak.
      </p>
    </div>
  );
};

export default TimeHeatmap;
