import { formatDistanceToNow } from "date-fns";
import { Plus, MessageSquare, Settings, Trash2, Menu, Zap, Share2, Wrench, Clapperboard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useListConversations, useCreateConversation, useDeleteConversation, getListConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Sidebar({ className, isMobile = false }: { className?: string, isMobile?: boolean }) {
  const { data: conversations, isLoading } = useListConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  const activeId = location.startsWith("/c/") ? parseInt(location.split("/")[2]) : null;

  const handleNew = () => {
    createConversation.mutate(
      { data: { title: "New Conversation" } },
      {
        onSuccess: (conv) => {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          setLocation(`/c/${conv.id}`);
        }
      }
    );
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteConversation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          if (activeId === id) setLocation("/");
        }
      }
    );
  };

  const content = (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border w-full", className)}>
      <div className="p-5 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
            <div className="font-display font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-primary/80">
              MADE SUPER AI
            </div>
          </div>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <div className="px-4 pb-6">
        <Button 
          onClick={handleNew} 
          disabled={createConversation.isPending} 
          className="w-full justify-center gap-2 font-semibold h-12 text-md rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(91,33,182,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all border-0"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </Button>
      </div>

      <div className="px-3 mb-4 space-y-1">
        <Link href="/">
          <div className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent", (location === "/" || location.startsWith("/c/")) ? "bg-gradient-to-r from-primary/30 to-blue-600/10 text-white border-primary/30 shadow-[0_0_15px_rgba(91,33,182,0.2)]" : "hover:bg-white/5 text-white/70 border-white/5")}>
            <MessageSquare className={cn("w-5 h-5 shrink-0", (location === "/" || location.startsWith("/c/")) ? "text-cyan-400" : "text-white/40")} />
            <span className={cn("font-medium text-sm", (location === "/" || location.startsWith("/c/")) && "text-white font-semibold")}>Chat</span>
          </div>
        </Link>
        <Link href="/social">
          <div className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent", location.startsWith("/social") ? "bg-gradient-to-r from-primary/30 to-blue-600/10 text-white border-primary/30 shadow-[0_0_15px_rgba(91,33,182,0.2)]" : "hover:bg-white/5 text-white/70 border-white/5")}>
            <Share2 className={cn("w-5 h-5 shrink-0", location.startsWith("/social") ? "text-cyan-400" : "text-white/40")} />
            <span className={cn("font-medium text-sm", location.startsWith("/social") && "text-white font-semibold")}>Social Hub</span>
          </div>
        </Link>
        <Link href="/studio">
          <div className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent", location.startsWith("/studio") ? "bg-gradient-to-r from-primary/30 to-blue-600/10 text-white border-primary/30 shadow-[0_0_15px_rgba(91,33,182,0.2)]" : "hover:bg-white/5 text-white/70 border-white/5")}>
            <Clapperboard className={cn("w-5 h-5 shrink-0", location.startsWith("/studio") ? "text-cyan-400" : "text-white/40")} />
            <span className={cn("font-medium text-sm", location.startsWith("/studio") && "text-white font-semibold")}>Video Studio</span>
          </div>
        </Link>
        <Link href="/tools">
          <div className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent", location.startsWith("/tools") ? "bg-gradient-to-r from-primary/30 to-blue-600/10 text-white border-primary/30 shadow-[0_0_15px_rgba(91,33,182,0.2)]" : "hover:bg-white/5 text-white/70 border-white/5")}>
            <Wrench className={cn("w-5 h-5 shrink-0", location.startsWith("/tools") ? "text-cyan-400" : "text-white/40")} />
            <span className={cn("font-medium text-sm", location.startsWith("/tools") && "text-white font-semibold")}>System Tools</span>
          </div>
        </Link>
      </div>

      <div className="px-3 pb-2 text-xs font-semibold text-white/30 uppercase tracking-wider">Conversations</div>

      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {isLoading ? (
          <div className="px-2 py-4 text-sm text-sidebar-foreground/50 animate-pulse font-medium">Loading network...</div>
        ) : conversations?.length === 0 ? (
          <div className="px-2 py-8 text-center text-sm text-sidebar-foreground/50 font-medium">
            No secure connections yet. Initialize one!
          </div>
        ) : (
          conversations?.map((conv) => (
            <Link key={conv.id} href={`/c/${conv.id}`}>
              <div
                className={cn(
                  "group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent",
                  activeId === conv.id
                    ? "bg-gradient-to-r from-primary/30 to-blue-600/10 text-white border-primary/30 shadow-[0_0_15px_rgba(91,33,182,0.2)]"
                    : "hover:bg-white/5 text-white/70 border-white/5"
                )}
              >
                <MessageSquare className={cn("w-5 h-5 mt-0.5 shrink-0", activeId === conv.id ? "text-cyan-400" : "text-white/40")} />
                <div className="flex-1 min-w-0">
                  <div className={cn("font-medium truncate text-sm", activeId === conv.id && "text-white font-semibold")}>
                    {conv.title || "New Conversation"}
                  </div>
                  {conv.lastMessage && (
                    <div className={cn("text-xs truncate mt-1", activeId === conv.id ? "text-white/80" : "text-white/40")}>
                      {conv.lastMessage}
                    </div>
                  )}
                  <div className={cn("text-[10px] mt-1.5 font-medium tracking-wide uppercase", activeId === conv.id ? "text-cyan-400/80" : "text-white/30")}>
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className={cn(
                    "p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all",
                    activeId === conv.id ? "hover:bg-white/20 text-white" : "hover:bg-red-500/20 hover:text-red-400 text-white/30"
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="p-4 mt-auto">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          <span className="text-xs font-semibold tracking-wide uppercase text-white/60">Powered by AI</span>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80 border-sidebar-border">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return content;
}