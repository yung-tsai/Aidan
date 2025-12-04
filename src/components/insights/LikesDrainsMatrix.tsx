const mockData = {
  energizers: ["Morning coffee", "Exercise", "Family dinner", "Creative work"],
  gems: ["Reading before bed", "Solo walks", "Journaling"],
  drains: ["Late meetings", "Traffic", "Social media scrolling"],
  noise: ["News", "Email notifications", "Multitasking"],
};

interface QuadrantProps {
  title: string;
  items: string[];
  position: "tl" | "tr" | "bl" | "br";
}

const Quadrant = ({ title, items, position }: QuadrantProps) => {
  // Border classes that work for both single-column mobile and 2-column desktop
  const borderClasses = {
    tl: "border-b sm:border-r",
    tr: "border-b",
    bl: "border-b sm:border-b-0 sm:border-r",
    br: "",
  };
  
  return (
    <div className={`p-3 sm:p-4 ${borderClasses[position]} border-insights-border`}>
      <h3 className="font-ibm text-xs sm:text-sm font-medium text-insights-dark mb-2 sm:mb-3">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span 
            key={item}
            className="inline-block px-2 py-0.5 font-ibm text-[10px] sm:text-xs text-insights-gray-mid bg-insights-hover border border-insights-border"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const LikesDrainsMatrix = () => {
  return (
    <div className="w-full border border-insights-border bg-insights-bg p-3 sm:p-4 md:p-5 rounded transition-colors hover:bg-insights-hover">
      <h2 className="font-mono font-medium text-base sm:text-lg text-insights-dark mb-3 sm:mb-4">Likes vs Drains</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <Quadrant title="Big Energizers" items={mockData.energizers} position="tl" />
        <Quadrant title="Hidden Gems" items={mockData.gems} position="tr" />
        <Quadrant title="Big Drains" items={mockData.drains} position="bl" />
        <Quadrant title="Noise" items={mockData.noise} position="br" />
      </div>
    </div>
  );
};

export default LikesDrainsMatrix;
