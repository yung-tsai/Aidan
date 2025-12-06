import { useNavigate } from "react-router-dom";
import classicMac from "@/assets/classic-mac.png";
import filingCabinet from "@/assets/filing-cabinet.png";
import bubbleChat from "@/assets/bubble-chat.png";
import insightsChart from "@/assets/insights-chart.png";

const Home = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: "Classic",
      description: "Type out an entry the classic way",
      route: "/new-entry",
      image: classicMac,
    },
    {
      title: "Aiden",
      description: "Chat with Aiden to get a summary entry",
      route: "/chat",
      image: bubbleChat,
    },
    {
      title: "Index",
      description: "Browse your past journal entries",
      route: "/index",
      image: filingCabinet,
    },
    {
      title: "Insights",
      description: "View patterns from your entries",
      route: "/insights",
      image: insightsChart,
    },
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex flex-col justify-center items-center gap-8 w-full max-w-[800px]">
        {/* Title */}
        <h1 className="font-mono font-medium text-[22px] leading-4 text-[#1F2A37]">
          Journal Entry
        </h1>

        {/* Options Row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-8 sm:gap-4 md:gap-6 w-full">
          {options.map((option) => (
            <div 
              key={option.title}
              className="flex flex-col items-center gap-3 w-[160px] sm:w-[140px] md:w-[160px]"
            >
              {/* Image */}
              <div className="h-[100px] sm:h-[90px] md:h-[110px] flex items-end justify-center">
                {option.image ? (
                  <img 
                    src={option.image} 
                    alt={option.title} 
                    className="w-[80px] sm:w-[70px] md:w-[90px] h-auto object-contain"
                  />
                ) : (
                  <div className="w-[80px] sm:w-[70px] md:w-[90px] h-[80px] sm:h-[70px] md:h-[90px] border border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">TBD</span>
                  </div>
                )}
              </div>
              {/* Title */}
              <h2 className="font-mono font-medium text-[16px] sm:text-[18px] leading-4 text-center text-[#010101]">
                {option.title}
              </h2>
              {/* Description */}
              <p className="font-ibm font-extralight text-xs sm:text-sm leading-[17px] sm:leading-[19px] text-center text-[#010101] min-h-[34px] sm:min-h-[38px]">
                {option.description}
              </p>
              {/* Button */}
              <button
                onClick={() => navigate(option.route)}
                className="flex flex-row justify-center items-center px-2.5 py-[5px] pb-2 w-[71px] h-[29px] bg-white border border-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <span className="font-ibm font-medium text-sm leading-4 text-black">
                  {option.title === "Index" || option.title === "Insights" ? "Enter" : "Select"}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
