import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTypewriter } from "@/hooks/useTypewriter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get the last message for typewriter effect
  const lastMessage = messages[messages.length - 1];
  const shouldAnimate = isLoading && lastMessage?.role === "assistant";
  const animatedContent = useTypewriter(
    shouldAnimate ? lastMessage.content : "",
    45
  );

  useEffect(() => {
    // Create a new session on mount
    const createSession = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .insert({ completed: false })
        .select()
        .single();

      if (error) {
        console.error("Error creating session:", error);
        toast.error("Failed to start session");
        return;
      }

      setSessionId(data.id);
      
      // Start with AI greeting
      const greeting = "How's your day going so far?";
      setMessages([{ role: "assistant", content: greeting }]);
      
      // Save greeting to database
      await supabase.from("messages").insert({
        session_id: data.id,
        role: "assistant",
        content: greeting,
      });
    };

    createSession();
  }, []);


  const streamChat = async (userMessage: string) => {
    if (!sessionId) return;

    const conversationHistory = [...messages, { role: "user" as const, content: userMessage }];
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: conversationHistory }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantMessage = "";
      let streamDone = false;

      // Add empty assistant message that we'll update
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message to database
      if (assistantMessage) {
        await supabase.from("messages").insert({
          session_id: sessionId,
          role: "assistant",
          content: assistantMessage,
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response");
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Save user message to database
    await supabase.from("messages").insert({
      session_id: sessionId,
      role: "user",
      content: userMessage,
    });

    // Stream AI response
    await streamChat(userMessage);
    setIsLoading(false);
    
    // Scroll to bottom after response completes (with small delay to ensure DOM updates)
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSendAndNavigate = async () => {
    if (isLoading || !sessionId) return;

    // Only send message if there's input
    if (input.trim()) {
      const userMessage = input.trim();
      setInput("");
      setIsLoading(true);

      // Add user message
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

      // Save user message to database
      await supabase.from("messages").insert({
        session_id: sessionId,
        role: "user",
        content: userMessage,
      });

      // Stream AI response
      await streamChat(userMessage);
      setIsLoading(false);
      
      // Scroll to bottom after response completes (with small delay to ensure DOM updates)
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }

    // Mark session as completed and navigate
    await supabase
      .from("sessions")
      .update({ completed: true })
      .eq("id", sessionId);

    navigate(`/journal/${sessionId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="journal-gradient min-h-screen flex flex-col items-center pt-[150px] pb-[168px] px-[420px] gap-[100px]">
      {/* Chat Container */}
      <div className="w-[450px] h-[325px] flex flex-col shadow-lg">
        {/* Header */}
        <div className="w-[450px] h-[20px] flex flex-row items-center px-3 py-0.5 bg-white border border-[#2C2C2C] relative">
          {/* Control Buttons */}
          <div className="flex flex-row items-center gap-[5px] h-4">
            {/* Close Button */}
            <div className="w-[11.33px] h-[11.33px] border border-[#2C2C2C] flex items-center justify-center relative">
              <div className="absolute w-[4.66px] h-[1px] bg-[#2C2C2C] rotate-45" />
              <div className="absolute w-[4.66px] h-[1px] bg-[#2C2C2C] -rotate-45" />
            </div>
            {/* Minimize Button */}
            <div className="w-[11.33px] h-[11.3px] border border-[#2C2C2C] flex items-center justify-center">
              <div className="w-[5px] h-[1px] bg-[#2C2C2C]" />
            </div>
          </div>
          {/* Divider */}
          <div className="flex-1 h-3" />
          {/* Title */}
          <span className="font-['Rasa'] font-medium text-xs leading-4 text-[#2C2C2C]">
            Aiden Chat
          </span>
        </div>
        
        {/* Messages Container */}
        <div ref={messagesContainerRef} className="w-[450px] h-[270px] flex flex-col p-0 gap-[10px] bg-[#F7F7F7] border-l border-r border-foreground overflow-y-auto overflow-x-hidden">
          {messages.map((msg, idx) => {
            const isLastMessage = idx === messages.length - 1;
            const showTypewriter = isLastMessage && shouldAnimate;
            const displayContent = showTypewriter ? animatedContent : msg.content;
            
            return (
              <div key={idx} className="w-[450px] flex flex-row items-start pt-[10px] px-3 pb-0 gap-[5px]">
                <p className="w-full font-['IBM_Plex_Mono'] font-medium text-xs leading-5 block whitespace-normal break-words m-0">
                  <span className={msg.role === "assistant" ? "text-[#4B5563]" : "text-[#1F2A37]"}>
                    {msg.role === "assistant" ? "Aiden: " : "Me: "}
                  </span>
                  <span className={`font-normal ${msg.role === "assistant" ? "text-[#4B5563]" : "text-[#1F2A37]"}`}>
                    {displayContent}
                  </span>
                </p>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div className="w-[450px] h-[35px] flex flex-row items-stretch">
          {/* Text Input */}
          <div className="flex-1 flex items-center px-5 bg-white border border-[#374151] shadow-[0px_-2px_4px_rgba(80,80,80,0.25)]">
            <input
              ref={inputRef as any}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say anything"
              disabled={isLoading}
              className="flex-1 font-['Reddit_Mono'] font-light text-xs leading-4 text-[#4B5563] bg-transparent border-none outline-none placeholder:text-[#4B5563]"
            />
          </div>
          {/* Save Button - Send and Navigate to Edit Entry */}
          <button
            onClick={handleSendAndNavigate}
            disabled={isLoading}
            className="w-[38px] h-[35px] flex items-center justify-center bg-white border border-l-0 border-[#374151] shadow-[0px_-2px_4px_rgba(80,80,80,0.25)]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M14.25 15.75H3.75C3.33579 15.75 3 15.4142 3 15V3C3 2.58579 3.33579 2.25 3.75 2.25H10.5L15 6.75V15C15 15.4142 14.6642 15.75 14.25 15.75Z" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15.75V10.5H6V15.75" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 2.25V6.75H10.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default Chat;