import { useNavigate } from "react-router-dom";
import InsightCard from "@/components/insights/InsightCard";
import MoodOscilloscope from "@/components/insights/MoodOscilloscope";
import ThemeStacksChart from "@/components/insights/ThemeStacksChart";
import TimeHeatmap from "@/components/insights/TimeHeatmap";
import LikesDrainsMatrix from "@/components/insights/LikesDrainsMatrix";
import PeopleRadar from "@/components/insights/PeopleRadar";

// Mock summary data
const mockSummary = {
  text: "This month, you've been reflective and focused on work-life balance. Your energy peaks on weekend mornings, and family time consistently lifts your mood. Late-night screen time remains a pattern worth watching.",
  topMood: "Reflective",
  frequentTheme: "Work",
  energizer: "Family time",
};

const Insights = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="terminal-container mb-6">
          <div className="terminal-scanlines" />
          <div className="terminal-header">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="font-vt323 text-terminal-dim hover:text-terminal-text transition-colors"
              >
                [ ← BACK ]
              </button>
              <span className="text-terminal-dim">│</span>
              <span className="font-vt323 text-lg text-terminal-text tracking-widest">
                INSIGHTS ANALYSIS
              </span>
            </div>
          </div>
          <div className="p-4 bg-terminal-bg/50">
            <p className="font-ibm text-sm text-terminal-dim">
              AI-generated patterns from your recent journal entries.
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="terminal-box p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-terminal-glow font-vt323">▶</span>
            <span className="font-vt323 text-lg text-terminal-glow terminal-glow-subtle">
              THIS MONTH'S STORY
            </span>
          </div>
          <p className="font-ibm text-sm text-terminal-text leading-relaxed mb-4">
            {mockSummary.text}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 font-vt323 text-xs bg-terminal-surface border border-terminal-border text-terminal-dim">
              TOP MOOD: {mockSummary.topMood.toUpperCase()}
            </span>
            <span className="px-2 py-1 font-vt323 text-xs bg-terminal-surface border border-terminal-border text-terminal-dim">
              THEME: {mockSummary.frequentTheme.toUpperCase()}
            </span>
            <span className="px-2 py-1 font-vt323 text-xs bg-terminal-surface border border-terminal-border text-terminal-dim">
              ENERGIZER: {mockSummary.energizer.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-6">
          <section>
            <MoodOscilloscope />
          </section>

          <section>
            <InsightCard title="WHAT YOU WRITE ABOUT MOST">
              <ThemeStacksChart />
            </InsightCard>
          </section>

          <section>
            <LikesDrainsMatrix />
          </section>

          <section>
            <InsightCard title="WHEN YOUR MOOD PEAKS & DROPS">
              <TimeHeatmap />
            </InsightCard>
          </section>

          <section>
            <InsightCard title="PEOPLE YOU MENTION MOST">
              <PeopleRadar />
            </InsightCard>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Insights;
