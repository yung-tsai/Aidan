import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

const mockPeople = [
  { name: "Lindsay", score: 3, frequency: 85 },
  { name: "Mike", score: -2, frequency: 60 },
  { name: "Dex", score: 1, frequency: 45 },
  { name: "Sarah", score: 2, frequency: 70 },
  { name: "Alex", score: 0, frequency: 30 },
];

const radarData = mockPeople.map(p => ({
  name: p.name,
  value: p.frequency,
}));

const PeopleRadar = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
      {/* Radar Chart */}
      <div className="w-full sm:w-1/2 h-[160px] sm:h-[180px] md:h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2A2A2A" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fill: "#666", fontSize: 10 }}
            />
            <Radar
              dataKey="value"
              stroke="#444"
              fill="#222"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* People List */}
      <div className="flex-1 space-y-1.5 sm:space-y-2">
        <h3 className="font-ibm text-[10px] sm:text-xs text-insights-gray-light mb-2 sm:mb-3">Sentiment Scores</h3>
        {mockPeople.map((person) => (
          <div key={person.name} className="flex items-center justify-between">
            <span className="font-ibm text-xs sm:text-sm text-insights-gray-mid">{person.name}</span>
            <span className={`font-mono text-xs sm:text-sm ${
              person.score > 0 
                ? "text-insights-gray-mid" 
                : person.score < 0 
                  ? "text-insights-gray-light" 
                  : "text-insights-gray-light"
            }`}>
              {person.score > 0 ? "+" : ""}{person.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeopleRadar;
