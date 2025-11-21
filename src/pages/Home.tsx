import { useNavigate } from "react-router-dom";
import classicMac from "@/assets/classic-mac.png";
import arrowBtn from "@/assets/arrow-btn.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="journal-gradient min-h-screen flex flex-col items-center justify-center">
      {/* Container */}
      <div className="flex flex-col justify-center items-center gap-5 w-[460px]">
        {/* Title */}
        <h1 className="w-full font-mono font-medium text-[22px] leading-4 flex items-center justify-center text-[#1F2A37]">
          Journal Entry
        </h1>

        {/* Image Section */}
        <div className="flex flex-col items-center w-[460px]">
          {/* Controls Row */}
          <div className="flex flex-row justify-center items-center w-[360px] h-[262px]">
            {/* Left Arrow Button (hidden) */}
            <div className="w-10 h-10 opacity-0 flex-shrink-0" />

            {/* Mac Computer Image */}
            <img 
              src={classicMac} 
              alt="Classic Mac" 
              className="w-[280px] h-[262px] object-contain"
            />

            {/* Right Arrow Button */}
            <button
              onClick={() => navigate("/index")}
              className="w-10 h-10 flex-shrink-0 relative flex items-center justify-center"
              style={{ transform: "rotate(180deg)" }}
            >
              <img 
                src={arrowBtn} 
                alt="Next" 
                className="w-full h-full"
              />
            </button>
          </div>
        </div>

        {/* Options Container */}
        <div className="flex flex-row items-start gap-10 w-[460px]">
          {/* Classic Option */}
          <div className="flex flex-col justify-center items-end gap-5 w-[210px]">
            {/* Option Info */}
            <div className="flex flex-col items-start gap-2.5 w-full">
              {/* Title */}
              <h2 className="w-full font-mono font-medium text-[18px] leading-4 flex items-center text-right text-[#010101]">
                Classic
              </h2>
              {/* Description */}
              <p className="w-full font-ibm font-extralight text-sm leading-[19px] flex items-center text-right text-[#010101]">
                Type out an entry the classic way
              </p>
            </div>
            {/* Button */}
            <button
              onClick={() => navigate("/new-entry")}
              className="flex flex-row justify-center items-center px-2.5 py-[5px] pb-2 w-[71px] h-[29px] bg-white border border-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <span className="font-ibm font-medium text-sm leading-4 text-black">
                Select
              </span>
            </button>
          </div>

          {/* Aiden Option */}
          <div className="flex flex-col justify-center items-start gap-5 w-[210px]">
            {/* Option Info */}
            <div className="flex flex-col items-start gap-2.5 w-full">
              {/* Title */}
              <h2 className="w-full font-mono font-medium text-[18px] leading-4 flex items-center text-[#010101]">
                Aiden
              </h2>
              {/* Description */}
              <p className="w-full font-ibm font-extralight text-sm leading-[19px] flex items-center text-[#010101]">
                Chat with Aiden to get a summary entry.
              </p>
            </div>
            {/* Button */}
            <button
              onClick={() => navigate("/chat")}
              className="flex flex-row justify-center items-center px-2.5 py-[5px] pb-2 w-[71px] h-[29px] bg-white border border-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <span className="font-ibm font-medium text-sm leading-4 text-black">
                Select
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
