import { useState, useEffect } from "react";
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">("landing");

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const handleNavigateToIndex = () => {
    setShowContent(false);
    setIsAnimating(true);
    setTimeout(() => {
      navigate("/index");
    }, 300);
  };

  const handleEnterClick = () => {
    setShowContent(false);
    setTimeout(() => {
      setViewMode("dashboard");
      setShowContent(true);
    }, 300);
  };

  const handleBackToLanding = () => {
    setViewMode("landing");
  };

  // Dashboard View
  if (viewMode === "dashboard") {
    return (
      <div className="bg-insights-bg min-h-screen py-12">
        <div className="max-w-[760px] mx-auto px-6">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={handleBackToLanding}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
              >
                <img src={arrowBtn} alt="Back" className="w-full h-full" />
              </button>
              <h1 className="font-mono font-medium text-2xl text-insights-dark">Insights</h1>
            </div>
            <p className="font-ibm text-sm text-insights-gray-light ml-12">
              AI-generated patterns from your recent journal entries.
            </p>
          </header>

          {/* Section 2: Summary Card */}
          <section className="mb-12">
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
          <section className="mb-12">
            <MoodOscilloscope />
          </section>

          {/* Section 4: Theme Stacks */}
          <section className="mb-12">
            <InsightCard title="What You Write About Most">
              <ThemeStacksChart />
            </InsightCard>
          </section>

          {/* Section 5: Likes vs Drains Matrix */}
          <section className="mb-12">
            <LikesDrainsMatrix />
          </section>

          {/* Section 6: Time Heatmap */}
          <section className="mb-12">
            <InsightCard title="When Your Mood Peaks & Drops">
              <TimeHeatmap />
            </InsightCard>
          </section>

          {/* Section 7: People Radar */}
          <section className="mb-12">
            <InsightCard title="People You Mention Most">
              <PeopleRadar />
            </InsightCard>
          </section>
        </div>
      </div>
    );
  }

  // Landing View
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col justify-center items-center gap-5 w-[302px]">
        {/* Title */}
        <h1 className="w-full font-mono font-medium text-[22px] leading-4 flex items-center justify-center text-text-primary">
          Insights
        </h1>

        {/* Controls Row */}
        <div className="flex flex-row items-center gap-5 w-[302px]">
          {/* Left Arrow Button - back to Index Finder */}
          <button
            onClick={handleNavigateToIndex}
            className="w-10 h-10 flex-shrink-0 relative flex items-center justify-center"
          >
            <img src={arrowBtn} alt="Back" className="w-full h-full" />
          </button>

          {/* Empty space where illustration would be */}
          <div 
            className={`w-[182px] h-[120px] flex items-center justify-center transition-all duration-300 ${
              isAnimating ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
            }`}
          >
            {/* Minimal decorative element instead of illustration */}
            <div className="w-16 h-16 border border-insights-border rotate-45" />
          </div>

          {/* Right Arrow Button (hidden - end of carousel) */}
          <div className="w-10 h-10 flex-shrink-0 opacity-0" />
        </div>

        {/* Options Container */}
        <div
          className={`flex flex-row justify-center items-start w-[210px] transition-opacity duration-300 ${
            showContent ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col justify-center items-center gap-5 w-[210px]">
            <div className="flex flex-col items-start gap-2.5 w-full">
              <p className="w-full font-ibm font-extralight text-sm leading-[19px] flex items-center text-text-primary">
                AI-generated patterns from your journal
              </p>
            </div>
            <button
              onClick={handleEnterClick}
              className="flex flex-row justify-center items-center px-2.5 py-[5px] pb-2 w-[62px] h-[29px] bg-white border border-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <span className="font-ibm font-medium text-sm leading-4 text-black">
                Enter
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
