import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const [isBooting, setIsBooting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get the last message for typewriter effect
  const lastMessage = messages[messages.length - 1];
  const shouldAnimate = isLoading && lastMessage?.role === "assistant";
  const { text: animatedContent, isTyping, showCursor } = useTypewriter(
    shouldAnimate ? lastMessage.content : "",
    45
  );

  // Boot sequence animation
  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
    }, 2000);
    return () => clearTimeout(bootTimer);
  }, []);

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
    setTimeout(() => inputRef.current?.focus(), 0);
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
    
    // Scroll to bottom after response completes
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
    <div className="journal-gradient min-h-screen flex flex-col items-center pt-20 sm:pt-[100px] md:pt-[150px] pb-20 sm:pb-[100px] md:pb-[168px] px-4 gap-[50px] sm:gap-[75px] md:gap-[100px]">
      {/* Terminal Window */}
      <div className="w-full max-w-[580px] retro-window">
        {/* Title Bar */}
        <div className="h-8 flex items-center px-2 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] border-b border-[#1a1a1a]">
          {/* Window Controls */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e33e32] retro-button" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#e09e1a] retro-button" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab2c] retro-button" />
          </div>
          {/* Title */}
          <div className="flex-1 text-center">
            <span className="font-vt323 text-sm text-[#cccccc] tracking-wider">
              AIDEN TERMINAL v1.0
            </span>
          </div>
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="status-indicator" />
            <span className="font-vt323 text-xs text-terminal-accent">ONLINE</span>
          </div>
        </div>

        {/* Terminal Screen */}
        <div className="relative terminal-bg">
          {/* Scanline Overlay */}
          <div className="absolute inset-0 terminal-scanlines z-10" />
          
          {/* Messages Container */}
          <div 
            ref={messagesContainerRef} 
            className="relative z-0 min-h-[320px] max-h-[400px] overflow-y-auto overflow-x-hidden p-4 crt-flicker"
          >
            {isBooting ? (
              <div className="font-vt323 text-lg text-terminal-glow terminal-glow">
                <p>Initializing AIDEN...</p>
                <p className="mt-2">Loading neural networks... <span className="boot-cursor">█</span></p>
                <div className="mt-4 flex items-center gap-2">
                  <span>▓▓▓▓▓▓▓▓░░</span>
                  <span>80%</span>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isLastMessage = idx === messages.length - 1;
                const showTypewriter = isLastMessage && shouldAnimate;
                const displayContent = showTypewriter ? animatedContent : msg.content;
                const showBlinkingCursor = showTypewriter && isTyping && showCursor;
                
                return (
                  <div key={idx} className="mb-4 font-ibm text-sm leading-relaxed">
                    {msg.role === "assistant" ? (
                      <div>
                        <span className="text-terminal-accent font-bold">AIDEN@system</span>
                        <span className="text-terminal-text">:</span>
                        <span className="text-[#58a6ff]">~</span>
                        <span className="text-terminal-text">$ </span>
                        <span className="text-terminal-glow terminal-glow">
                          {displayContent}
                          {showBlinkingCursor && <span className="terminal-cursor">█</span>}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[#f78166] font-bold">user@local</span>
                        <span className="text-terminal-text">:</span>
                        <span className="text-[#58a6ff]">~</span>
                        <span className="text-terminal-text">$ </span>
                        <span className="text-terminal-text">{displayContent}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Status Bar */}
          <div className="h-6 px-3 flex items-center justify-between bg-terminal-surface border-t border-terminal-border">
            <div className="flex items-center gap-4">
              <span className="font-vt323 text-xs text-terminal-accent">● CONNECTED</span>
              <span className="font-vt323 text-xs text-terminal-text">Session: {sessionId?.slice(0, 8) || '...'}</span>
            </div>
            <span className="font-vt323 text-xs text-terminal-text">{messages.length} msgs</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex items-stretch bg-terminal-surface border-t-2 border-terminal-border">
          {/* Terminal Prompt Input */}
          <div className="flex-1 flex items-center px-4 py-2 retro-inset bg-terminal-bg">
            <span className="font-vt323 text-terminal-accent mr-2">&gt;</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              className="flex-1 font-ibm text-sm terminal-input placeholder:text-terminal-border"
            />
            {showCursor && !input && (
              <span className="terminal-cursor">█</span>
            )}
          </div>
          
          {/* Save Button */}
          <button
            onClick={handleSendAndNavigate}
            disabled={isLoading}
            className="w-12 flex items-center justify-center bg-terminal-surface border-l border-terminal-border retro-button hover:bg-terminal-bg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M14.25 15.75H3.75C3.33579 15.75 3 15.4142 3 15V3C3 2.58579 3.33579 2.25 3.75 2.25H10.5L15 6.75V15C15 15.4142 14.6642 15.75 14.25 15.75Z" stroke="hsl(140 70% 70%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15.75V10.5H6V15.75" stroke="hsl(140 70% 70%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 2.25V6.75H10.5" stroke="hsl(140 70% 70%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;