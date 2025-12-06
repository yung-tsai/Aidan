import { useNavigate } from "react-router-dom";
import classicMac from "@/assets/classic-mac.png";
import filingCabinet from "@/assets/filing-cabinet.png";
import aidenRobot from "@/assets/aiden-robot.png";
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
      image: aidenRobot,
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
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="flex flex-col justify-center items-center w-full max-w-[900px]">
        {/* Options Row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-10 sm:gap-8 md:gap-12 w-full">
          {options.map((option) => (
            <div 
              key={option.title}
              onClick={() => navigate(option.route)}
              className="flex flex-col items-center gap-4 w-[180px] sm:w-[160px] md:w-[180px] cursor-pointer group"
            >
              {/* Image */}
              <div className="h-[140px] sm:h-[120px] md:h-[150px] flex items-end justify-center transition-transform duration-200 group-hover:scale-110">
                <img 
                  src={option.image} 
                  alt={option.title} 
                  className="w-[110px] sm:w-[100px] md:w-[120px] h-auto object-contain"
                />
              </div>
              {/* Title */}
              <h2 className="font-mono font-medium text-[16px] sm:text-[18px] leading-4 text-center text-[#010101] transition-colors duration-200 group-hover:text-[#374151]">
                {option.title}
              </h2>
              {/* Description */}
              <p className="font-ibm font-extralight text-xs sm:text-sm leading-[17px] sm:leading-[19px] text-center text-[#010101] min-h-[34px] sm:min-h-[38px]">
                {option.description}
              </p>
              {/* Button */}
              <button
                className="flex flex-row justify-center items-center px-2.5 py-[5px] pb-2 w-[71px] h-[29px] bg-white border border-black shadow-[4px_4px_0px_#000000] group-hover:shadow-[2px_2px_0px_#000000] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all"
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
