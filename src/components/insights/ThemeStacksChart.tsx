const mockThemes = [
  { name: "Work", percentage: 38 },
  { name: "Family", percentage: 25 },
  { name: "Health", percentage: 18 },
  { name: "Creativity", percentage: 12 },
  { name: "Social", percentage: 7 },
];

const ThemeStacksChart = () => {
  const maxPercentage = Math.max(...mockThemes.map(t => t.percentage));
  
  return (
    <div className="space-y-3">
      {mockThemes.map((theme, index) => {
        // Generate grayscale fill based on index
        const grayValue = 20 + (index * 15); // 20%, 35%, 50%, 65%, 80%
        
        return (
          <div key={theme.name} className="flex items-center gap-3">
            <span className="font-ibm text-xs text-insights-gray-mid w-20 flex-shrink-0">
              {theme.name}
            </span>
            <div className="flex-1 h-[18px] bg-insights-hover relative">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${(theme.percentage / maxPercentage) * 100}%`,
                  backgroundColor: `hsl(0, 0%, ${grayValue}%)`
                }}
              />
            </div>
            <span className="font-ibm text-xs text-insights-gray-mid w-10 text-right">
              {theme.percentage}%
            </span>
          </div>
        );
      })}
      
      {/* Link to view entries */}
      <a 
        href="#" 
        className="inline-block font-ibm text-sm text-insights-gray-mid hover:text-insights-dark underline mt-2 transition-colors"
      >
        View entries for {mockThemes[0].name} →
      </a>
    </div>
  );
};

export default ThemeStacksChart;
