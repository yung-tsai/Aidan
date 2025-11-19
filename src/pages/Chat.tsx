import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TypingIndicator from "@/components/TypingIndicator";
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerateSummary = async () => {
    if (!sessionId) return;
    
    // Mark session as completed
    await supabase
      .from("sessions")
      .update({ completed: true })
      .eq("id", sessionId);

    navigate(`/journal/${sessionId}`);
  };

  return (
    <div className="journal-gradient min-h-screen flex flex-col items-center pt-[150px] pb-[168px] px-[420px] gap-[100px]">
      {/* Chat Container */}
      <div className="w-[600px] h-[400px] flex flex-col">
        {/* Messages Container */}
        <div ref={messagesContainerRef} className="w-[600px] h-[332px] flex flex-col p-5 gap-2.5 bg-chat-bg border border-foreground border-b-0 rounded-t-lg overflow-y-auto">
          {messages.map((msg, idx) => {
            const isLastMessage = idx === messages.length - 1;
            const showTypewriter = isLastMessage && shouldAnimate;
            const displayContent = showTypewriter ? animatedContent : msg.content;
            
            return (
              <div key={idx} className="w-full min-h-[16px] flex flex-row items-start gap-2.5">
                <span
                  className={`font-mono text-xs leading-4 ${
                    msg.role === "assistant"
                      ? "text-text-secondary font-normal"
                      : "text-text-primary font-medium"
                  }`}
                >
                  {msg.role === "assistant" && displayContent === "" && isLoading ? (
                    <TypingIndicator />
                  ) : (
                    displayContent
                  )}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div className="w-[600px] h-[68px] flex flex-row items-center px-5 py-2.5 bg-input-bg border border-foreground rounded-b-lg">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say anything"
            disabled={isLoading}
            className="flex-1 font-mono text-xs text-text-secondary bg-transparent border-none outline-none resize-none placeholder:text-text-secondary"
            rows={2}
          />
        </div>
      </div>

      {/* Generate Summary Button */}
      <Button
        onClick={handleGenerateSummary}
        disabled={messages.length < 3}
        className="font-mono text-sm"
      >
        Generate Journal Summary
      </Button>
    </div>
  );
};

export default Chat;