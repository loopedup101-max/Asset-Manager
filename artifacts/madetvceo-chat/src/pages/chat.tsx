import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "wouter";
import { useGetConversation, useListMessages, getListMessagesQueryKey, getListConversationsQueryKey, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/chat/sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Bot, User, Loader2, Zap, Clock, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mascotImg from "@/assets/mascot.png";

interface ChatMessage {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  streaming?: boolean;
}

function MascotWelcome() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-background">
      <div className="bg-orb w-[600px] h-[600px] bg-primary/10 top-0 left-[-100px]" style={{ animationDelay: '0s' }} />
      <div className="bg-orb w-[500px] h-[500px] bg-cyan-400/10 bottom-[-100px] right-[-50px]" style={{ animationDelay: '1s' }} />
      <div className="bg-orb w-[400px] h-[400px] bg-indigo-500/10 top-1/4 right-1/4" style={{ animationDelay: '2s' }} />
      
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="w-52 h-52 mb-8 relative flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-[-10%] border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-[-30%] border border-cyan-400/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

        <img
          src={mascotImg}
          alt="Made Super AI agent"
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_12px_30px_rgba(76,29,149,0.45)]"
          draggable={false}
        />
      </motion.div>

      <h1 className="text-5xl font-display font-extrabold mb-3 tracking-tight gradient-text relative z-10">
        MADE SUPER AI AGENT
      </h1>
      <p className="text-base font-semibold text-primary mb-6 relative z-10 tracking-wide">
        Ready to help.
      </p>
      
      <div className="flex gap-4 mb-8 relative z-10 flex-wrap justify-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 text-sm font-medium">
          <Zap className="w-4 h-4 text-primary" /> Lightning Fast
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400/10 to-transparent border border-cyan-400/20 text-sm font-medium">
          <Clock className="w-4 h-4 text-cyan-500" /> Always On
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/20 text-sm font-medium">
          <Lightbulb className="w-4 h-4 text-indigo-500" /> Knows Everything
        </div>
      </div>
      
      <p className="text-xl text-muted-foreground max-w-md relative z-10 font-medium tracking-wide">
        Your intelligent partner. Ask anything — tech, life, the universe, whatever.
      </p>
    </div>
  );
}

function MessageContent({ content, role }: { content: string; role: "user" | "assistant" }) {
  if (role === "user") {
    return <span className="whitespace-pre-wrap leading-relaxed">{content}</span>;
  }
  return (
    <div className="prose prose-sm max-w-none leading-relaxed
      prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-4 prose-headings:mb-2
      prose-p:my-1.5 prose-p:leading-relaxed
      prose-code:bg-primary/8 prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:my-3 prose-pre:overflow-x-auto
      prose-strong:font-bold prose-strong:text-foreground
      prose-ul:my-2 prose-ul:pl-5 prose-ol:my-2 prose-ol:pl-5
      prose-li:my-0.5
      prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
      prose-a:text-primary prose-a:underline
      prose-hr:border-border">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export function ChatPage() {
  const { id } = useParams();
  const convId = id ? parseInt(id) : null;
  const [content, setContent] = useState("");
  const [streamingMessages, setStreamingMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const { data: conversation } = useGetConversation(convId!, { query: { enabled: !!convId, queryKey: getGetConversationQueryKey(convId!) } });
  const { data: dbMessages, isLoading: messagesLoading } = useListMessages(convId!, { query: { enabled: !!convId, queryKey: getListMessagesQueryKey(convId!) } });

  const allMessages: ChatMessage[] = streamingMessages.length > 0 ? streamingMessages : (dbMessages as ChatMessage[] ?? []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, isStreaming, scrollToBottom]);

  useEffect(() => {
    if (dbMessages) {
      setStreamingMessages(dbMessages as ChatMessage[]);
    }
  }, [dbMessages]);

  const handleSend = useCallback(async () => {
    if (!content.trim() || !convId || isStreaming) return;

    const messageContent = content.trim();
    setContent("");
    setIsStreaming(true);

    abortRef.current = new AbortController();

    try {
      const response = await fetch(`/api/conversations/${convId}/messages/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        setIsStreaming(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let assistantMsgId: number | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "user_message") {
              setStreamingMessages(prev => [...prev, { ...event.message, role: "user" as const }]);
            } else if (event.type === "delta") {
              assistantContent += event.content;
              if (assistantMsgId === null) {
                const tempId = Date.now();
                assistantMsgId = tempId;
                setStreamingMessages(prev => [
                  ...prev,
                  {
                    id: tempId,
                    conversationId: convId,
                    role: "assistant" as const,
                    content: assistantContent,
                    createdAt: new Date().toISOString(),
                    streaming: true,
                  },
                ]);
              } else {
                setStreamingMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: assistantContent, streaming: true }
                      : m
                  )
                );
              }
              scrollToBottom();
            } else if (event.type === "done") {
              setStreamingMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...event.message, role: "assistant" as const, streaming: false }
                    : m
                )
              );
              queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
              queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(convId) });
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Streaming error", err);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [content, convId, isStreaming, queryClient, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!convId) {
    return (
      <div className="flex-1 flex flex-col relative h-full">
        <div className="md:hidden p-4 border-b flex items-center bg-sidebar text-white">
          <Sidebar isMobile />
          <span className="ml-4 font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-primary/80">Made Super AI</span>
        </div>
        <MascotWelcome />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
      <div className="bg-orb w-[400px] h-[400px] bg-primary/5 top-0 left-[-50px]" style={{ animationDelay: '0s' }} />
      <div className="bg-orb w-[300px] h-[300px] bg-cyan-400/5 bottom-1/4 right-[-50px]" style={{ animationDelay: '1s' }} />

      <div className="p-4 border-b flex items-center bg-white/80 backdrop-blur-md shrink-0 relative z-10 shadow-sm">
        <div className="md:hidden mr-4">
          <Sidebar isMobile />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          <span className="font-semibold text-lg tracking-tight">{conversation?.title ?? "Conversation"}</span>
        </div>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-2 text-xs text-primary font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10" ref={scrollRef}>
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col text-center opacity-80">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center mb-6 shadow-lg border border-primary/10">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3 gradient-text">Ready to help</h2>
            <p className="text-muted-foreground max-w-sm font-medium">Ask me anything — code, life advice, trivia, your social media strategy. I got you.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-4">
            <AnimatePresence initial={false}>
              {allMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-5",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                    msg.role === "user" ? "bg-primary text-white" : "bg-gradient-to-br from-primary to-blue-500 text-white"
                  )}>
                    {msg.role === "user" ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                  </div>
                  <div className={cn(
                    "px-6 py-4 max-w-[80%] leading-relaxed",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-primary to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md"
                      : "bg-white text-foreground rounded-2xl rounded-tl-sm shadow-sm border border-border border-l-4 border-l-primary"
                  )}>
                    <MessageContent content={msg.content} role={msg.role} />
                    {msg.streaming && (
                      <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm align-middle" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isStreaming && allMessages[allMessages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-500 text-white shadow-lg flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="px-6 py-5 bg-white text-foreground rounded-2xl rounded-tl-sm shadow-sm border border-border border-l-4 border-l-primary flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 bg-white/80 backdrop-blur-xl border-t shrink-0 relative z-20">
        <div className="max-w-4xl mx-auto relative flex items-end shadow-md border border-border rounded-2xl bg-white overflow-hidden focus-within:glow-ring transition-all duration-300">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything — tech, life, the universe..."
            className="min-h-[60px] max-h-60 resize-none border-0 focus-visible:ring-0 rounded-none shadow-none py-5 px-5 text-base font-medium"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!content.trim() || isStreaming}
            className="mb-3 mr-3 shrink-0 h-12 w-12 rounded-xl shadow-lg bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-all border-0 disabled:opacity-50 disabled:hover:scale-100"
          >
            <SendHorizontal className="w-6 h-6" />
          </Button>
        </div>
        <div className="text-center mt-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Made Super AI — Powered by GPT. Verify critical info.
        </div>
      </div>
    </div>
  );
}
