const WindowHeader = () => {
  return (
    <div className="flex items-center justify-between w-[450px] h-[20px] bg-chat-header border border-chat-border px-3">
      {/* macOS traffic lights - decorative only */}
      <div className="flex gap-[2px]">
        <div className="w-3 h-3 rounded-full bg-traffic-red" />
        <div className="w-3 h-3 rounded-full bg-traffic-yellow" />
        <div className="w-3 h-3 rounded-full bg-traffic-green" />
      </div>
      
      {/* Title */}
      <span className="font-rasa text-[12px] font-medium text-chat-border">
        Aiden Chat
      </span>
    </div>
  );
};

export default WindowHeader;
