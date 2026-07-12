import React, { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql_executed?: string | null;
  data?: any;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your **TransitIQ AI Fleet Assistant**. I have real-time secure database link access.\n\nYou can query operations details like:\n- *Which vehicle has the highest maintenance cost?*\n- *Show trips completed today.*\n- *Drivers with expiring licenses.*\n- *Suggest next maintenance.*"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userQuery = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    // Push user message
    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);

    try {
      const response = await api.post("/ai/query", { query: userQuery });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
          sql_executed: response.sql_executed,
          data: response.data
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an operations error compiling your query details."
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col justify-between bg-surface-container border border-surface-variant rounded-xl overflow-hidden shadow-xl font-sans">
      {/* Top Header */}
      <div className="p-md bg-surface-container-high border-b border-surface-variant flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[28px]">smart_toy</span>
          <div>
            <h3 className="font-semibold text-on-background text-[15px]">AI Fleet Assistant</h3>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">
              Groq Llama-3-8B Coprocessor Link Active
            </span>
          </div>
        </div>
        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
      </div>

      {/* Messages list */}
      <div className="flex-1 p-md overflow-y-auto space-y-md bg-surface-container-lowest">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-md max-w-2xl ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
              msg.role === "user" 
                ? "bg-primary-container text-black" 
                : "bg-surface-variant border border-surface-variant text-primary"
            }`}>
              {msg.role === "user" ? "U" : "AI"}
            </div>

            {/* Content Box */}
            <div className={`p-md rounded-xl border font-body-md text-sm ${
              msg.role === "user"
                ? "bg-surface-container-high border-surface-variant text-on-background rounded-tr-none"
                : "glass-panel text-on-background rounded-tl-none border-surface-variant/40"
            }`}>
              {/* Simple Markdown Bold parser */}
              <div className="whitespace-pre-line space-y-xs leading-relaxed">
                {msg.content.split("\n").map((line, idx) => {
                  // Replace **text** with <strong>text</strong>
                  const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                  return <p key={idx} dangerouslySetInnerHTML={{ __html: formatted }} />;
                })}
              </div>

              {/* Show SQL execution log if present */}
              {msg.sql_executed && (
                <div className="mt-md p-sm bg-surface-container-lowest rounded border border-surface-variant/60 font-mono text-[11px] text-primary/80 overflow-x-auto">
                  <span className="text-[9px] text-on-surface-variant uppercase tracking-wider block mb-xs">
                    SQL Executed on Registry:
                  </span>
                  <code>{msg.sql_executed}</code>
                </div>
              )}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex gap-md max-w-md mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-sm">
              AI
            </div>
            <div className="px-lg py-3 rounded-xl glass-panel text-on-surface-variant text-sm flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              <span>Scanning database...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input box form */}
      <form onSubmit={handleSend} className="p-md bg-surface-container-high border-t border-surface-variant flex gap-sm">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask fleet details (e.g. 'Show trips completed today')..."
          className="flex-1 bg-surface-container-low border border-surface-variant rounded-md py-2 px-3 text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isSending}
          className="px-lg bg-primary hover:bg-primary-container text-black font-semibold rounded-md transition-colors flex items-center justify-center gap-xs cursor-pointer shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
};
