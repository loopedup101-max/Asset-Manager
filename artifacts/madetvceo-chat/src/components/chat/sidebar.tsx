import { formatDistanceToNow } from "date-fns";
import { Plus, MessageSquare, Settings, Trash2, Menu } from "lucide-react";
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
      <div className="p-4 flex items-center justify-between">
        <Link href="/">
          <div className="font-display font-bold text-xl text-primary tracking-tight cursor-pointer">
            Made Super AI
          </div>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="text-sidebar-foreground">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <div className="px-4 pb-4">
        <Button onClick={handleNew} disabled={createConversation.isPending} className="w-full justify-start gap-2 shadow-sm font-medium h-12 text-md">
          <Plus className="w-5 h-5" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {isLoading ? (
          <div className="px-2 py-4 text-sm text-muted-foreground animate-pulse">Loading conversations...</div>
        ) : conversations?.length === 0 ? (
          <div className="px-2 py-8 text-center text-sm text-muted-foreground">
            No conversations yet. Start one!
          </div>
        ) : (
          conversations?.map((conv) => (
            <Link key={conv.id} href={`/c/${conv.id}`}>
              <div
                className={cn(
                  "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200",
                  activeId === conv.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                )}
              >
                <MessageSquare className={cn("w-5 h-5 mt-0.5 shrink-0", activeId === conv.id ? "opacity-100" : "opacity-70")} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">
                    {conv.title || "New Conversation"}
                  </div>
                  {conv.lastMessage && (
                    <div className={cn("text-xs truncate mt-0.5", activeId === conv.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {conv.lastMessage}
                    </div>
                  )}
                  <div className={cn("text-[10px] mt-1", activeId === conv.id ? "text-primary-foreground/60" : "text-muted-foreground/60")}>
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className={cn(
                    "p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                    activeId === conv.id ? "hover:bg-primary-foreground/20" : "hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))
        )}
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
        <SheetContent side="left" className="p-0 w-80">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return content;
}
