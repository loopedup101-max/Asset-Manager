import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetConversation, useListMessages, useSendMessage, getListMessagesQueryKey, getListConversationsQueryKey, useUpdateConversation, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/chat/sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Bot, User, Loader2, Zap, Clock, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function MascotWelcome() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-background">
      <div className="bg-orb w-[600px] h-[600px] bg-primary/10 top-0 left-[-100px]" style={{ animationDelay: '0s' }} />
      <div className="bg-orb w-[500px] h-[500px] bg-cyan-400/10 bottom-[-100px] right-[-50px]" style={{ animationDelay: '1s' }} />
      <div className="bg-orb w-[400px] h-[400px] bg-indigo-500/10 top-1/4 right-1/4" style={{ animationDelay: '2s' }} />
      
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="w-40 h-40 mb-10 relative"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-[-20%] border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-[-40%] border border-cyan-400/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        
        <motion.div
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-full h-full relative z-10"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id="robotGrad" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <rect x="20" y="30" width="60" height="45" rx="12" fill="url(#robotGrad)" />
            <path d="M50 15V30" stroke="url(#robotGrad)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="12" r="5" fill="#06b6d4" className="animate-pulse" />
            <circle cx="35" cy="48" r="6" fill="white" className="animate-pulse" />
            <circle cx="65" cy="48" r="6" fill="white" className="animate-pulse" />
            <path d="M40 62C45 66 55 66 60 62" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </motion.div>
      </motion.div>
      
      <h1 className="text-5xl font-display font-extrabold mb-6 tracking-tight gradient-text relative z-10">
        MADE SUPER AI AGENT
      </h1>
      
      <div className="flex gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 text-sm font-medium">
          <Zap className="w-4 h-4 text-primary" /> Lightning Fast
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400/10 to-transparent border border-cyan-400/20 text-sm font-medium">
          <Clock className="w-4 h-4 text-cyan-500" /> Always On
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/20 text-sm font-medium">
          <Lightbulb className="w-4 h-4 text-indigo-500" /> Super Smart
        </div>
      </div>
      
      <p className="text-xl text-muted-foreground max-w-md relative z-10 font-medium tracking-wide">
        Your intelligent partner. Ask anything.
      </p>
    </div>
  );
}

export function ChatPage() {
  const { id } = useParams();
  const convId = id ? parseInt(id) : null;
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversation } = useGetConversation(convId!, { query: { enabled: !!convId, queryKey: getGetConversationQueryKey(convId!) } });
  const { data: messages, isLoading: messagesLoading } = useListMessages(convId!, { query: { enabled: !!convId, queryKey: getListMessagesQueryKey(convId!) } });
  const sendMessage = useSendMessage();
  const updateConversation = useUpdateConversation();

  const isNewConversation = conversation?.title === "New Conversation" && messages?.length === 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMessage.isPending]);

  const handleSend = () => {
    if (!content.trim() || !convId) return;

    const messageContent = content.trim();
    setContent("");

    sendMessage.mutate(
      { id: convId, data: { content: messageContent } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(convId) });
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          
          if (isNewConversation) {
            updateConversation.mutate({
              id: convId,
              data: { title: messageContent.substring(0, 30) + (messageContent.length > 30 ? "..." : "") }
            }, {
              onSuccess: () => queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() })
            });
          }
        }
      }
    );
  };

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
          <span className="font-semibold text-lg tracking-tight">{conversation?.title}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10" ref={scrollRef}>
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages?.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col text-center opacity-80">
             <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center mb-6 shadow-lg border border-primary/10">
               <Bot className="w-10 h-10 text-primary" />
             </div>
             <h2 className="text-2xl font-display font-bold mb-3 gradient-text">Ready to help</h2>
             <p className="text-muted-foreground max-w-sm font-medium">Type a message below to initialize sequence.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-4">
            <AnimatePresence initial={false}>
              {messages?.map((msg) => (
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
                    "px-6 py-4 max-w-[80%] whitespace-pre-wrap leading-relaxed",
                    msg.role === "user" 
                      ? "bg-gradient-to-br from-primary to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md" 
                      : "bg-white text-foreground rounded-2xl rounded-tl-sm shadow-sm border border-border border-l-4 border-l-primary"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {sendMessage.isPending && (
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
            placeholder="Initialize query..."
            className="min-h-[60px] max-h-60 resize-none border-0 focus-visible:ring-0 rounded-none shadow-none py-5 px-5 text-base font-medium"
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!content.trim() || sendMessage.isPending}
            className="mb-3 mr-3 shrink-0 h-12 w-12 rounded-xl shadow-lg bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-all border-0 disabled:opacity-50 disabled:hover:scale-100"
          >
            <SendHorizontal className="w-6 h-6" />
          </Button>
        </div>
        <div className="text-center mt-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
          AI responses may be inaccurate. Verify critical data.
        </div>
      </div>
    </div>
  );
}