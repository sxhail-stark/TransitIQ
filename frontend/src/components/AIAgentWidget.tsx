import React, { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIAgentWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your TransitIQ AI Coprocessor. Ask me anything about your vehicles, drivers, or dispatches!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userQuery = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);

    try {
      const response = await api.post("/ai/query", { query: userQuery });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an error fetching that intelligence for you."
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-lg right-lg z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary-container text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer relative group"
        >
          <div className="absolute -inset-1 bg-primary/20 rounded-full blur-[6px] group-hover:blur-[8px]"></div>
          <span className="material-symbols-outlined text-[30px] relative z-10">smart_toy</span>
        </button>
      )}

      {/* Floating Chat Box */}
      {isOpen && (
        <div className="w-80 h-96 glass-panel-heavy rounded-xl border border-surface-variant flex flex-col justify-between shadow-2xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-md bg-surface-container-high border-b border-surface-variant flex justify-between items-center">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
              <span className="font-semibold text-on-background text-sm">AI Coprocessor</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-on-background cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-md overflow-y-auto space-y-sm bg-surface-container-lowest">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-sm max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className={`p-sm rounded-lg text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-surface-container-high border border-surface-variant text-on-background rounded-tr-none"
                    : "bg-surface-dim border border-surface-variant/40 text-on-background rounded-tl-none"
                }`}>
                  {/* Basic parser */}
                  <div dangerouslySetInnerHTML={{ 
                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") 
                  }} />
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-sm max-w-[80%] mr-auto items-center">
                <span className="material-symbols-outlined text-[14px] text-primary animate-spin">sync</span>
                <span className="text-[10px] text-on-surface-variant">Thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-sm bg-surface-container-high border-t border-surface-variant flex gap-sm">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-surface-container-low border border-surface-variant rounded py-1 px-2 text-on-background text-xs focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="px-3 bg-primary hover:bg-primary-container text-black font-semibold rounded text-xs transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
