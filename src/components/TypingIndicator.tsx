const TypingIndicator = () => {
  return (
    <div className="flex gap-1 items-center">
      <span className="w-2 h-2 bg-[#4B5563] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
      <span className="w-2 h-2 bg-[#4B5563] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
      <span className="w-2 h-2 bg-[#4B5563] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
    </div>
  );
};

export default TypingIndicator;
