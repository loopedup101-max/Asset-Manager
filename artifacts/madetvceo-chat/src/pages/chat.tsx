import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useGetConversation, useListMessages, useCreateConversation, getListMessagesQueryKey, getListConversationsQueryKey, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/chat/sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Bot, User, Loader2, Sparkles, Code2, Video, Share2, Database, Cpu, Wand2, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mascotImg from "@/assets/mascot.webp";
import { useMe } from "@/hooks/useMe";

interface ChatMessage {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  streaming?: boolean;
}

const AGENT_CAPABILITIES = [
  { icon: Code2, label: "Build Working Apps", desc: "Full-stack, deployed" },
  { icon: Video, label: "Create & Post Videos", desc: "Script to upload" },
  { icon: Share2, label: "Run Your Socials", desc: "Auto-post everywhere" },
  { icon: Database, label: "Design Databases", desc: "Schemas & queries" },
  { icon: Cpu, label: "Write REST APIs", desc: "Production-ready" },
  { icon: Wand2, label: "Automate Anything", desc: "Just ask" },
];

function MascotWelcome() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center relative overflow-hidden bg-[#070711]">
      {/* HUD grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.35) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
        }}
      />
      <div className="bg-orb w-[600px] h-[600px] bg-primary/25 top-[-140px] left-[-120px]" style={{ animationDelay: '0s' }} />
      <div className="bg-orb w-[500px] h-[500px] bg-cyan-400/20 bottom-[-160px] right-[-80px]" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#070711] to-transparent" />

      {/* status HUD */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 mb-8 text-[11px] font-mono uppercase tracking-[0.2em]"
      >
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-400/30 bg-green-400/10 text-green-300">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" /> System Online
        </span>
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
          <Cpu className="w-3 h-3" /> Neural Core Active
        </span>
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/15 text-primary">
          <ShieldCheck className="w-3 h-3" /> Autonomous Mode
        </span>
      </motion.div>

      {/* agent core */}
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="w-44 h-44 md:w-56 md:h-56 mb-6 relative flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-[-12%] border border-primary/30 rounded-full animate-[spin_12s_linear_infinite]" />
        <div className="absolute inset-[-28%] border border-cyan-400/20 rounded-full animate-[spin_18s_linear_infinite_reverse]" />
        <div className="absolute inset-[-46%] border border-dashed border-primary/15 rounded-full animate-[spin_34s_linear_infinite]" />
        <img
          src={mascotImg}
          alt="Made Super AI agent"
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_16px_44px_rgba(124,58,237,0.65)]"
          draggable={false}
        />
      </motion.div>

      <h1 className="text-4xl md:text-6xl font-display font-extrabold mb-3 tracking-tight relative z-10 bg-gradient-to-r from-white via-primary to-cyan-300 bg-clip-text text-transparent">
        MADE SUPER AI AGENT
      </h1>
      <p className="text-base md:text-lg text-slate-300 max-w-xl relative z-10 font-medium mb-10">
        Your autonomous AI agent — it doesn't just chat, it{" "}
        <span className="text-cyan-300 font-semibold">builds, ships, and runs</span> things for you. Ready to help.
      </p>

      {/* capability matrix */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl w-full mb-10">
        {AGENT_CAPABILITIES.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="group flex items-center gap-3 p-3 md:p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm text-left hover:border-primary/40 hover:bg-primary/[0.06] transition-all"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/30 to-cyan-400/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <c.icon className="w-4 h-4 md:w-5 md:h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{c.label}</div>
              <div className="text-[11px] text-slate-400 truncate">{c.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 flex items-center gap-2 text-sm text-slate-400 font-medium"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        Hit <span className="text-white font-semibold">New Chat</span> and tell your agent what to build
        <ArrowRight className="w-4 h-4 text-cyan-300 animate-pulse" />
      </motion.div>
    </div>
  );
}

function MessageContent({ content, role }: { content: string; role: "user" | "assistant" }) {
  const [, navigate] = useLocation();
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href && href.startsWith("/")) {
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(href);
                  }}
                  className="not-prose inline-flex items-center gap-1.5 my-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-semibold no-underline shadow-md hover:scale-[1.03] transition-transform cursor-pointer"
                >
                  {children}
                </a>
              );
            }
            return (
              <a href={href} target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Carries the first message across the navigation from the welcome screen to the
// freshly-created conversation route, so "Ask Me Anything" sends from home.
let pendingFirstMessage: { convId: number; content: string } | null = null;

export function ChatPage() {
  const { id } = useParams();
  const convId = id ? parseInt(id) : null;
  const [content, setContent] = useState("");
  const [streamingMessages, setStreamingMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  const [, setLocation] = useLocation();
  const createConversation = useCreateConversation();
  const { data: me } = useMe();

  const usage = me?.usage;
  const unlimited = usage?.unlimited ?? false;
  const remaining = !unlimited && usage ? usage.remaining : null;
  const isFreeTier = me?.tier === "free";
  const outOfFree = isFreeTier && remaining === 0;
  const showUsageNudge = !unlimited && remaining !== null && remaining <= 2;

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

  const sendMessage = useCallback(
    async (text: string, targetConvId: number) => {
      setIsStreaming(true);
      abortRef.current = new AbortController();

      try {
        const response = await fetch(
          `/api/conversations/${targetConvId}/messages/stream`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: text }),
            signal: abortRef.current.signal,
          },
        );

        if (!response.ok || !response.body) {
          let msg = "Something went wrong. Please try again.";
          try {
            const err = await response.json();
            if (err?.error) msg = err.error;
          } catch {
            /* non-JSON error body */
          }
          const note =
            response.status === 402
              ? `⚠️ ${msg}\n\nOpen **Pricing** from the sidebar to choose a plan.`
              : msg;
          setStreamingMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              conversationId: targetConvId,
              role: "assistant" as const,
              content: note,
              createdAt: new Date().toISOString(),
            },
          ]);
          setIsStreaming(false);
          if (response.status === 402) {
            queryClient.invalidateQueries({ queryKey: ["me"] });
          }
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let assistantMsgId: number | null = null;
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          // SSE frames are separated by a blank line. Keep the last,
          // possibly-incomplete frame in the buffer until more data arrives.
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const line = frame.split("\n").find(l => l.startsWith("data: "));
            if (!line) continue;
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
                      conversationId: targetConvId,
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
                queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(targetConvId) });
                queryClient.invalidateQueries({ queryKey: ["me"] });
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
    },
    [queryClient, scrollToBottom],
  );

  const handleSend = useCallback(() => {
    const text = content.trim();
    if (!text || !convId || isStreaming) return;
    setContent("");
    void sendMessage(text, convId);
  }, [content, convId, isStreaming, sendMessage]);

  // From the welcome screen: create a conversation, then auto-send the first
  // message once we land on the new /c/:id route.
  const handleWelcomeSend = useCallback(async () => {
    const text = content.trim();
    if (!text || creatingChat || isStreaming) return;
    if (outOfFree) {
      setLocation("/pricing");
      return;
    }
    setCreatingChat(true);
    try {
      const created = await createConversation.mutateAsync({
        data: { title: text.slice(0, 40) || "New Conversation" },
      });
      pendingFirstMessage = { convId: created.id, content: text };
      setContent("");
      queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      setLocation(`/c/${created.id}`);
    } catch (err) {
      console.error("Could not start chat", err);
      setCreatingChat(false);
    }
  }, [content, creatingChat, isStreaming, outOfFree, createConversation, queryClient, setLocation]);

  useEffect(() => {
    if (convId && pendingFirstMessage && pendingFirstMessage.convId === convId) {
      const text = pendingFirstMessage.content;
      pendingFirstMessage = null;
      void sendMessage(text, convId);
    }
  }, [convId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!convId) {
    return (
      <div className="flex-1 flex flex-col relative h-full bg-[#070711]">
        <div className="md:hidden p-4 border-b border-white/10 flex items-center bg-sidebar text-white">
          <Sidebar isMobile />
          <span className="ml-4 font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-primary/80">Made Super AI</span>
        </div>
        <MascotWelcome />
        <div className="shrink-0 px-4 md:px-6 pb-6 pt-2 relative z-10">
          <div className="max-w-3xl mx-auto">
            {outOfFree ? (
              <Link href="/pricing">
                <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/25 to-cyan-400/10 px-5 py-4 cursor-pointer hover:from-primary/35 transition-all text-center">
                  <Sparkles className="w-5 h-5 text-cyan-300 shrink-0" />
                  <span className="text-sm md:text-base font-semibold text-white">
                    You've used your free questions — get a plan to keep chatting & unlock every tool
                  </span>
                </div>
              </Link>
            ) : (
              <>
                {isFreeTier && remaining !== null && (
                  <div className="mb-2 text-center text-xs font-medium text-cyan-300/80">
                    {remaining} free {remaining === 1 ? "question" : "questions"} left ·{" "}
                    <Link href="/pricing">
                      <span className="underline cursor-pointer hover:text-cyan-200">Get a plan</span>
                    </Link>{" "}
                    for credits & all tools
                  </div>
                )}
                <div className="relative flex items-end shadow-[0_0_30px_rgba(124,58,237,0.25)] border border-white/15 rounded-2xl bg-white/[0.04] backdrop-blur-md overflow-hidden focus-within:border-primary/50 transition-all">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleWelcomeSend();
                      }
                    }}
                    placeholder="Ask me anything — code, ideas, your next big project..."
                    className="min-h-[60px] max-h-48 resize-none border-0 focus-visible:ring-0 rounded-none shadow-none py-5 px-5 text-base font-medium bg-transparent text-white placeholder:text-white/40"
                  />
                  <Button
                    size="icon"
                    onClick={handleWelcomeSend}
                    disabled={!content.trim() || creatingChat}
                    className="mb-3 mr-3 shrink-0 h-12 w-12 rounded-xl shadow-lg bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-all border-0 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {creatingChat ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-6 h-6" />}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
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
        {showUsageNudge && (
          <div className="max-w-4xl mx-auto mb-3">
            <Link href="/pricing">
              <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 cursor-pointer hover:bg-primary/10 transition-all">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground">
                  {remaining === 0
                    ? isFreeTier
                      ? "You're out of free questions — get a plan to keep going"
                      : "You're out of credits — upgrade for more"
                    : `Only ${remaining} ${remaining === 1 ? "message" : "messages"} left — ${isFreeTier ? "get a plan" : "upgrade"} for more`}
                </span>
              </div>
            </Link>
          </div>
        )}
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
          Made Super AI — Powered by GPT
        </div>
        <div className="text-center mt-1 text-[10px] font-normal text-muted-foreground/70 normal-case tracking-normal">
          Made Super AI can make mistakes. Please double-check important information.
        </div>
      </div>
    </div>
  );
}
