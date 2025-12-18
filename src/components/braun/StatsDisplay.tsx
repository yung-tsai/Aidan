interface StatsDisplayProps {
  breathingSessions: number;
  breathingMinutes: number;
  focusSessions: number;
  focusMinutes: number;
  reflectionCount: number;
  currentStreak: number;
  longestStreak: number;
}

const StatsDisplay = ({
  breathingSessions,
  breathingMinutes,
  focusSessions,
  focusMinutes,
  reflectionCount,
  currentStreak,
  longestStreak,
}: StatsDisplayProps) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const stats = [
    {
      label: "BREATHING",
      primary: breathingSessions.toString(),
      secondary: formatTime(breathingMinutes),
      unit: "sessions",
    },
    {
      label: "FOCUS TIME",
      primary: formatTime(focusMinutes),
      secondary: `${focusSessions} sessions`,
      unit: "",
    },
    {
      label: "REFLECTIONS",
      primary: reflectionCount.toString(),
      secondary: "total",
      unit: "entries",
    },
    {
      label: "STREAK",
      primary: currentStreak.toString(),
      secondary: `best: ${longestStreak}`,
      unit: "days",
      highlight: currentStreak >= 3,
    },
  ];

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="braun-title text-2xl text-foreground mb-2">Your Progress</h2>
        <p className="text-sm text-muted-foreground">
          Every session counts. Keep going.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`lcd-display p-4 text-center ${
              stat.highlight ? "ring-2 ring-braun-orange ring-opacity-50" : ""
            }`}
          >
            <div className="braun-label lcd-text-dim mb-2">{stat.label}</div>
            <div className="lcd-text text-3xl font-bold font-space">
              {stat.primary}
            </div>
            <div className="text-xs lcd-text-dim mt-1">
              {stat.secondary} {stat.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Motivational message based on stats */}
      <div className="text-center pt-4">
        {currentStreak >= 7 ? (
          <p className="text-braun-orange font-medium">
            🔥 One week streak! You're on fire.
          </p>
        ) : currentStreak >= 3 ? (
          <p className="text-braun-orange font-medium">
            Great momentum! Keep the streak alive.
          </p>
        ) : focusMinutes >= 60 ? (
          <p className="text-muted-foreground">
            Over an hour of focus time. Impressive.
          </p>
        ) : breathingSessions >= 5 ? (
          <p className="text-muted-foreground">
            {breathingSessions} breathing sessions. Finding your calm.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Start a session to begin tracking.
          </p>
        )}
      </div>

      {/* Progress bars */}
      <div className="space-y-4 pt-2">
        <div>
          <div className="flex justify-between mb-1">
            <span className="braun-label">WEEKLY FOCUS GOAL</span>
            <span className="text-xs text-muted-foreground">
              {Math.min(focusMinutes, 300)}/300 min
            </span>
          </div>
          <div className="h-2 bg-device-inset rounded-full overflow-hidden">
            <div
              className="h-full bg-braun-orange transition-all duration-500"
              style={{ width: `${Math.min((focusMinutes / 300) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="braun-label">BREATHING GOAL</span>
            <span className="text-xs text-muted-foreground">
              {Math.min(breathingSessions, 10)}/10 sessions
            </span>
          </div>
          <div className="h-2 bg-device-inset rounded-full overflow-hidden">
            <div
              className="h-full bg-braun-orange transition-all duration-500"
              style={{ width: `${Math.min((breathingSessions / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
