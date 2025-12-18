// Mock data for insights
const mockData = {
  topMood: "REFLECTIVE",
  frequentTheme: "WORK",
  energizer: "FAMILY TIME",
  entriesThisMonth: 12,
  avgWordsPerEntry: 347,
  streakDays: 5,
  themes: [
    { name: "WORK", percentage: 35 },
    { name: "HEALTH", percentage: 25 },
    { name: "RELATIONSHIPS", percentage: 20 },
    { name: "CREATIVITY", percentage: 15 },
    { name: "OTHER", percentage: 5 },
  ],
  weekActivity: [
    { day: "MON", entries: 2 },
    { day: "TUE", entries: 1 },
    { day: "WED", entries: 3 },
    { day: "THU", entries: 0 },
    { day: "FRI", entries: 2 },
    { day: "SAT", entries: 1 },
    { day: "SUN", entries: 3 },
  ],
};

const TerminalInsights = () => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="terminal-box p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-terminal-glow font-vt323">▶</span>
          <span className="font-vt323 text-lg text-terminal-glow terminal-glow-subtle">
            ANALYSIS SUMMARY
          </span>
        </div>
        <p className="text-terminal-text font-ibm text-sm leading-relaxed">
          This month, you've been reflective and focused on work-life balance. 
          Your energy peaks on weekend mornings, and family time consistently 
          lifts your mood.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="terminal-box p-3 text-center">
          <div className="text-terminal-dim font-vt323 text-xs mb-1">ENTRIES</div>
          <div className="text-terminal-glow terminal-glow font-vt323 text-2xl">
            {mockData.entriesThisMonth}
          </div>
        </div>
        <div className="terminal-box p-3 text-center">
          <div className="text-terminal-dim font-vt323 text-xs mb-1">AVG WORDS</div>
          <div className="text-terminal-glow terminal-glow font-vt323 text-2xl">
            {mockData.avgWordsPerEntry}
          </div>
        </div>
        <div className="terminal-box p-3 text-center">
          <div className="text-terminal-dim font-vt323 text-xs mb-1">STREAK</div>
          <div className="text-terminal-glow terminal-glow font-vt323 text-2xl">
            {mockData.streakDays}D
          </div>
        </div>
      </div>

      {/* Theme Distribution */}
      <div className="terminal-box p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-terminal-glow font-vt323">▶</span>
          <span className="font-vt323 text-lg text-terminal-glow terminal-glow-subtle">
            THEME DISTRIBUTION
          </span>
        </div>
        <div className="space-y-2">
          {mockData.themes.map((theme) => (
            <div key={theme.name} className="flex items-center gap-3">
              <span className="font-vt323 text-terminal-text w-28 text-sm">
                {theme.name}
              </span>
              <div className="flex-1 h-3 bg-terminal-muted overflow-hidden">
                <div
                  className="h-full bg-terminal-accent transition-all duration-500"
                  style={{ width: `${theme.percentage}%` }}
                />
              </div>
              <span className="font-vt323 text-terminal-dim w-10 text-right text-sm">
                {theme.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="terminal-box p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-terminal-glow font-vt323">▶</span>
          <span className="font-vt323 text-lg text-terminal-glow terminal-glow-subtle">
            WEEKLY ACTIVITY
          </span>
        </div>
        <div className="flex items-end justify-between gap-2 h-20">
          {mockData.weekActivity.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col-reverse">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-full h-5 border border-terminal-border ${
                      i < day.entries
                        ? "bg-terminal-accent"
                        : "bg-terminal-muted/30"
                    }`}
                  />
                ))}
              </div>
              <span className="font-vt323 text-terminal-dim text-xs">
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-3 gap-3">
        <div className="terminal-box p-3">
          <div className="font-vt323 text-terminal-dim text-xs mb-1">TOP MOOD</div>
          <div className="font-vt323 text-terminal-glow terminal-glow-subtle text-sm">
            {mockData.topMood}
          </div>
        </div>
        <div className="terminal-box p-3">
          <div className="font-vt323 text-terminal-dim text-xs mb-1">MAIN THEME</div>
          <div className="font-vt323 text-terminal-glow terminal-glow-subtle text-sm">
            {mockData.frequentTheme}
          </div>
        </div>
        <div className="terminal-box p-3">
          <div className="font-vt323 text-terminal-dim text-xs mb-1">ENERGIZER</div>
          <div className="font-vt323 text-terminal-glow terminal-glow-subtle text-sm">
            {mockData.energizer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalInsights;
