"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Send, Bot, User, Sparkles, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";

const WELCOME_MESSAGE = {
  role: "model",
  text: "Hey there! 👋 I'm the YourShop AI Assistant. I know everything about our current inventory — ask me about products, recommendations, pricing, or anything else!",
};

const DEFAULT_PROMPTS = [
  "What products do you have?",
  "Suggest something under $50",
  "What's trending right now?",
];

export default function ChatPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState(DEFAULT_PROMPTS);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isStreaming) return;

    const userMsg = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSuggestedPrompts([]);
    setIsStreaming(true);

    // Build history (last 10 turns)
    const allMessages = [...messages, userMsg];
    const history = allMessages.slice(-10).map((m) => ({
      role: m.role,
      text: m.text,
    }));

    // Add placeholder for model response
    setMessages((prev) => [...prev, { role: "model", text: "" }]);

    try {
      const tokenRes = await fetch("/api/auth/get-session", {
        credentials: "include",
      });
      const tokenData = await tokenRes.json();
      const token = tokenData?.session?.token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: text.trim(), history }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("Chat request failed with status:", res.status, "and body:", errText);
        throw new Error("Chat request failed: " + errText);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload);
              if (parsed.text) {
                fullText += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "model",
                    text: fullText,
                  };
                  return updated;
                });
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Ignore JSON parse errors for partial chunks
            }
          }
        }
      }

      // Parse and strip suggested prompts from the response
      const suggestMatch = fullText.match(/SUGGEST_JSON:\s*(\[.*?\])/s);
      if (suggestMatch) {
        try {
          const prompts = JSON.parse(suggestMatch[1]);
          setSuggestedPrompts(prompts);
        } catch {
          setSuggestedPrompts(DEFAULT_PROMPTS);
        }
        // Remove the SUGGEST_JSON block from displayed text
        const cleanText = fullText.replace(/SUGGEST_JSON:\s*\[.*?\]/s, "").trim();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "model", text: cleanText };
          return updated;
        });
      } else {
        setSuggestedPrompts(DEFAULT_PROMPTS);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "model",
          text: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
      setSuggestedPrompts(DEFAULT_PROMPTS);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }, [isStreaming, messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] pt-20 pb-4 flex flex-col">
      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col px-4">
        {/* Header */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
            <Sparkles size={16} />
            Powered by AI
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Chat with YourShop AI
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Ask about products, get recommendations, or explore our catalog.
          </p>
        </div>

        {/* Chat Window */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-1 pr-2 pb-4 min-h-[400px] max-h-[calc(100vh-340px)]"
          style={{ scrollBehavior: "smooth" }}
        >
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {/* Typing Indicator */}
          {isStreaming && messages[messages.length - 1]?.text === "" && (
            <div className="flex items-start gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="flex items-center gap-1.5 bg-[#1E293B] rounded-2xl px-4 py-3 border border-white/5">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        {suggestedPrompts.length > 0 && !isStreaming && (
          <div className="flex flex-wrap gap-2 justify-center py-3">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="px-4 py-2 text-sm rounded-full bg-[#1E293B] text-zinc-300 border border-white/10 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="sticky bottom-4 mt-2 flex items-end gap-3 bg-[#1E293B] border border-white/10 rounded-2xl p-3 shadow-xl shadow-black/20"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about our products..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 resize-none text-sm leading-6 max-h-32"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 px-4 py-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-gradient-to-tr from-emerald-500 to-teal-600"
            : "bg-gradient-to-tr from-blue-500 to-purple-600"
        }`}
      >
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot size={16} className="text-white" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-[#1E293B] text-zinc-200 border border-white/5 rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-2">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
