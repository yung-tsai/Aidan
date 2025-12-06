import { useNavigate } from "react-router-dom";
import arrowBtn from "@/assets/arrow-btn.png";
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
    <div className="bg-insights-bg min-h-screen py-6 sm:py-8 md:py-12">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <header className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <button
              onClick={() => navigate("/")}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <img src={arrowBtn} alt="Back" className="w-full h-full" />
            </button>
            <h1 className="font-mono font-medium text-xl sm:text-2xl text-insights-dark">Insights</h1>
          </div>
          <p className="font-ibm text-xs sm:text-sm text-insights-gray-light ml-11 sm:ml-12">
            AI-generated patterns from your recent journal entries.
          </p>
        </header>

        {/* Section 2: Summary Card */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <InsightCard title="This Month's Story">
            <p className="font-ibm text-sm text-insights-gray-mid leading-relaxed mb-4">
              {mockSummary.text}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 font-ibm text-xs bg-insights-hover border border-insights-border text-insights-gray-mid">
                Top Mood: {mockSummary.topMood}
              </span>
              <span className="px-2 py-1 font-ibm text-xs bg-insights-hover border border-insights-border text-insights-gray-mid">
                Frequent Theme: {mockSummary.frequentTheme}
              </span>
              <span className="px-2 py-1 font-ibm text-xs bg-insights-hover border border-insights-border text-insights-gray-mid">
                Energizer: {mockSummary.energizer}
              </span>
            </div>
          </InsightCard>
        </section>

        {/* Section 3: Mood Oscilloscope */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <MoodOscilloscope />
        </section>

        {/* Section 4: Theme Stacks */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <InsightCard title="What You Write About Most">
            <ThemeStacksChart />
          </InsightCard>
        </section>

        {/* Section 5: Likes vs Drains Matrix */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <LikesDrainsMatrix />
        </section>

        {/* Section 6: Time Heatmap */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <InsightCard title="When Your Mood Peaks & Drops">
            <TimeHeatmap />
          </InsightCard>
        </section>

        {/* Section 7: People Radar */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <InsightCard title="People You Mention Most">
            <PeopleRadar />
          </InsightCard>
        </section>
      </div>
    </div>
  );
};

export default Insights;
