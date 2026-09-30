"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Sparkles,
  TrendingUp,
  FileText,
  Briefcase,
  User,
  GraduationCap,
  Award,
  ChartBar,
  Link2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserContext {
  name?: string;
  email?: string;
  profile?: Record<string, unknown> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats?: any;
  appliedJobs?: string[];
  recommendedCount?: number;
  rejectedCount?: number;
}

interface Message {
  role: "user" | "agent";
  content: string;
}

const suggestions = [
  { icon: ChartBar, label: "My stats", query: "Give me my stats summary" },
  { icon: Award, label: "My fit score", query: "What's my fit score?" },
  { icon: Briefcase, label: "Applications", query: "Which jobs have I applied to?" },
  { icon: TrendingUp, label: "Trending skills", query: "What are trending skills right now?" },
  { icon: User, label: "My profile", query: "What are my skills?" },
  { icon: FileText, label: "Improve profile", query: "How can I improve my profile?" },
  { icon: GraduationCap, label: "Education", query: "Where did I study?" },
  { icon: Link2, label: "My links", query: "Show my portfolio links" },
];

export function AgentBox({ context }: { context: UserContext }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = useCallback(
    async (query?: string) => {
      const text = (query || input).trim();
      if (!text || isStreaming) return;

      // Abort any ongoing stream
      abortRef.current?.abort();

      setInput("");
      const userMsg: Message = { role: "user", content: text };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsStreaming(true);
      setStreamingContent("");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Only send recent history + context
        const historyForApi = updatedMessages.slice(-20);

        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyForApi,
            context,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullContent = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const json = JSON.parse(line.slice(6));
              if (json.content) {
                fullContent += json.content;
                setStreamingContent(fullContent);
              }
              if (json.done) {
                // Stream complete
              }
              if (json.error) {
                throw new Error(json.error);
              }
            } catch (e: any) {
              if (e.message && !e.message.includes("JSON")) throw e;
            }
          }
        }

        // Add final agent message
        if (fullContent) {
          setMessages((prev) => [...prev, { role: "agent", content: fullContent }]);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        const errorMsg = err.message || "Something went wrong";
        setMessages((prev) => [
          ...prev,
          { role: "agent", content: `⚠️ ${errorMsg}. Please try again.` },
        ]);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        abortRef.current = null;
      }
    },
    [input, isStreaming, messages, context]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden flex flex-col h-full min-h-[340px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-secondary/80 border-b border-border shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-[11px] text-muted-foreground font-mono">
            career-copilot<span className="text-primary/60"> — ask anything</span>
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSend(s.query)}
                disabled={isStreaming}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium
                  bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground
                  border border-border/60 transition-colors disabled:opacity-50"
              >
                <s.icon className="h-3 w-3" />
                {s.label}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2 text-xs",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "agent" && (
              <div className="shrink-0 mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "rounded-xl px-3 py-2 max-w-[85%] leading-relaxed whitespace-pre-line",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary/80 border border-border/50 rounded-bl-sm"
              )}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="shrink-0 mt-0.5">
                <div className="h-3.5 w-3.5 rounded-full bg-secondary/60" />
              </div>
            )}
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex gap-2 text-xs justify-start">
            <div className="shrink-0 mt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            </div>
            <div className="rounded-xl px-3 py-2 max-w-[85%] leading-relaxed whitespace-pre-line bg-secondary/80 border border-border/50 rounded-bl-sm">
              {streamingContent}
              <span className="inline-block w-1.5 h-3.5 bg-primary/60 ml-0.5 animate-pulse align-middle" />
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex gap-2 text-xs justify-start">
            <div className="shrink-0 mt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            </div>
            <div className="rounded-xl px-3 py-2 bg-secondary/80 border border-border/50 rounded-bl-sm">
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-[10px]">
                <Loader2 className="h-3 w-3 animate-spin" />
                thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2 bg-secondary/60 rounded-lg px-3 py-2 border border-border/40 focus-within:border-primary/40 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your profile, skills, or career..."
            disabled={isStreaming}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none border-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
