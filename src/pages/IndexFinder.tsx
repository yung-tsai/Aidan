import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import filingCabinet from "@/assets/filing-cabinet.png";
import arrowBtn from "@/assets/arrow-btn.png";

const IndexFinder = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const handleNavigateToHome = () => {
    setShowContent(false);
    setIsAnimating(true);
    setTimeout(() => {
      navigate("/");
    }, 300);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center">
      {/* Container */}
      <div className="flex flex-col justify-center items-center gap-5 w-[302px]">
        {/* Title */}
        <h1 className="w-full font-mono font-medium text-[22px] leading-4 flex items-center justify-center text-[#1F2A37]">
          Index Finder
        </h1>

        {/* Controls Row */}
        <div className="flex flex-row items-center gap-5 w-[302px]">
          {/* Left Arrow Button */}
          <button
            onClick={handleNavigateToHome}
            className="w-10 h-10 flex-shrink-0 relative flex items-center justify-center"
          >
            <img 
              src={arrowBtn} 
              alt="Back" 
              className="w-full h-full"
            />
          </button>

          {/* Filing Cabinet Image */}
          <img 
            src={filingCabinet} 
            alt="Filing Cabinet" 
            className={`w-[182px] h-[271.71px] object-contain transition-all duration-300 ${
              isAnimating ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            }`}
          />

          {/* Right Arrow Button (hidden) */}
          <div 
            className="w-10 h-10 flex-shrink-0 opacity-0"
            style={{ transform: "rotate(-180deg)" }}
          />
        </div>

        {/* Options Container */}
        <div className={`flex flex-row justify-center items-start w-[210px] transition-opacity duration-300 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Option */}
          <div className="flex flex-col justify-center items-center gap-5 w-[210px]">
            {/* Option Info */}
            <div className="flex flex-col items-start gap-2.5 w-full">
              {/* Description */}
              <p className="w-full font-ibm font-extralight text-sm leading-[19px] flex items-center text-[#010101]">
                Find past journal entries
              </p>
            </div>
            {/* Button (non-functional placeholder) */}
            <button
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

export default IndexFinder;
