import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetConversation, useListMessages, useSendMessage, getListMessagesQueryKey, getListConversationsQueryKey, useUpdateConversation } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/chat/sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function MascotWelcome() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-background to-secondary/30">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="w-32 h-32 mb-8 relative"
      >
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-xl">
          <rect x="20" y="30" width="60" height="45" rx="12" fill="hsl(var(--primary))" />
          <path d="M50 15V30" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="12" r="4" fill="hsl(var(--accent))" />
          <circle cx="35" cy="48" r="6" fill="white" />
          <circle cx="65" cy="48" r="6" fill="white" />
          <path d="M40 62C45 66 55 66 60 62" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>
      <h1 className="text-4xl font-display font-bold text-foreground mb-4">Made Super AI Agent</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        Your brilliant advisor and strategic partner. Confident, ambitious, and ready to build the future.
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

  const { data: conversation } = useGetConversation(convId!, { query: { enabled: !!convId } });
  const { data: messages, isLoading: messagesLoading } = useListMessages(convId!, { query: { enabled: !!convId } });
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
        <div className="md:hidden p-4 border-b flex items-center">
          <Sidebar isMobile />
          <span className="ml-4 font-display font-bold text-primary">MadeTVCEO</span>
        </div>
        <MascotWelcome />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="md:hidden p-4 border-b flex items-center bg-background shrink-0">
        <Sidebar isMobile />
        <span className="ml-4 font-medium truncate">{conversation?.title}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6" ref={scrollRef}>
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : messages?.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col text-center opacity-70">
             <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
               <Bot className="w-8 h-8 text-primary" />
             </div>
             <h2 className="text-xl font-medium mb-2">How can I help you today?</h2>
             <p className="text-muted-foreground max-w-sm">I'm ready to assist with strategy, ideation, and problem-solving.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8 pb-4">
            <AnimatePresence initial={false}>
              {messages?.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    msg.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground shadow-md"
                  )}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "px-5 py-3.5 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed shadow-sm",
                    msg.role === "user" 
                      ? "bg-secondary text-secondary-foreground rounded-tr-sm" 
                      : "bg-white border border-border text-foreground rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {sendMessage.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white border border-border text-foreground rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-background border-t shrink-0">
        <div className="max-w-3xl mx-auto relative flex items-end shadow-sm border border-border rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] max-h-60 resize-none border-0 focus-visible:ring-0 rounded-none shadow-none py-4 text-base"
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!content.trim() || sendMessage.isPending}
            className="mb-2 mr-2 shrink-0 h-10 w-10 rounded-lg shadow-sm transition-all"
          >
            <SendHorizontal className="w-5 h-5" />
          </Button>
        </div>
        <div className="text-center mt-3 text-[11px] text-muted-foreground">
          AI may produce inaccurate information. Please verify important details.
        </div>
      </div>
    </div>
  );
}
