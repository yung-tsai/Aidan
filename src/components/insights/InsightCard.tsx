import { ReactNode } from "react";

interface InsightCardProps {
  title: string;
  subtitle?: string;
  variant?: "light" | "dark";
  dashed?: boolean;
  children: ReactNode;
}

const InsightCard = ({ 
  title, 
  subtitle, 
  variant = "light", 
  dashed = false,
  children 
}: InsightCardProps) => {
  const isDark = variant === "dark";
  
  return (
    <div 
      className={`
        relative w-full p-5 rounded
        ${isDark ? "bg-insights-dark" : "bg-insights-bg insights-dither"}
        ${dashed ? "border border-dashed border-insights-gray-mid" : "border border-insights-border"}
        transition-colors hover:bg-insights-hover
        ${isDark ? "hover:bg-insights-dark" : ""}
      `}
    >
      {isDark && <div className="absolute inset-0 insights-scanlines rounded" />}
      <div className="relative z-10">
        <h2 className={`font-mono font-medium text-lg mb-1 ${isDark ? "text-white" : "text-insights-dark"}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`font-ibm text-xs mb-4 ${isDark ? "text-insights-gray-light" : "text-insights-gray-light"}`}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default InsightCard;
