import { formatDistanceToNow } from "date-fns";
import { Plus, MessageSquare, Settings, Trash2, Menu, Zap, Share2, Wrench, Clapperboard, Blocks, Lock, Crown, LogOut, User as UserIcon, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useListConversations, useCreateConversation, useDeleteConversation, getListConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMe } from "@/hooks/useMe";

const NAV_ITEMS = [
  { href: "/social", label: "Social Hub", icon: Share2 },
  { href: "/builder", label: "App Builder", icon: Blocks },
  { href: "/studio", label: "Video Studio", icon: Clapperboard },
  { href: "/tools", label: "System Tools", icon: Wrench },
];

export function Sidebar({ className, isMobile = false }: { className?: string, isMobile?: boolean }) {
  const { data: conversations, isLoading } = useListConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const { data: me } = useMe();
  const { signOut } = useClerk();

  const entitled = me?.entitled ?? false;
  const isOwner = me?.plan === "owner";
  const email = me?.user.email ?? "";
  const tier = me?.tier ?? null;
  const usage = me?.usage;
  const showUsage = tier === "basic" && usage && !usage.unlimited;

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
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = location.startsWith(href);
          const locked = !entitled;
          return (
            <Link key={href} href={href}>
              <div className={cn("group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent", active ? "bg-gradient-to-r from-primary/30 to-blue-600/10 text-white border-primary/30 shadow-[0_0_15px_rgba(91,33,182,0.2)]" : "hover:bg-white/5 text-white/70 border-white/5")}>
                <Icon className={cn("w-5 h-5 shrink-0", active ? "text-cyan-400" : "text-white/40")} />
                <span className={cn("font-medium text-sm flex-1", active && "text-white font-semibold")}>{label}</span>
                {locked && <Lock className="w-3.5 h-3.5 text-white/30 shrink-0" />}
              </div>
            </Link>
          );
        })}
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

      {/* Account footer */}
      <div className="p-3 mt-auto border-t border-white/5 space-y-2">
        {!entitled && (
          <Link href="/pricing">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer bg-gradient-to-r from-primary/25 to-cyan-400/10 border border-primary/30 hover:from-primary/35 transition-all">
              <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
              <span className="text-sm font-semibold text-white">Upgrade to unlock</span>
            </div>
          </Link>
        )}

        {showUsage && usage && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-white/50 font-semibold uppercase tracking-wide">
                AI usage
              </span>
              <span className="text-white/80 font-semibold">
                {usage.used}/{usage.limit}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  usage.remaining === 0
                    ? "bg-gradient-to-r from-red-500 to-orange-400"
                    : "bg-gradient-to-r from-cyan-400 to-primary",
                )}
                style={{
                  width: `${Math.min(100, (usage.used / (usage.limit || 1)) * 100)}%`,
                }}
              />
            </div>
            <Link href="/pricing">
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer transition-colors">
                <Sparkles className="w-3.5 h-3.5" /> Upgrade for unlimited
              </div>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/40 to-cyan-400/20 border border-white/10 flex items-center justify-center text-sm font-display font-bold text-white shrink-0">
            {(email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">{email || "Account"}</div>
            <div className="flex items-center gap-1">
              {isOwner ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                  <Crown className="w-3 h-3" /> Owner
                </span>
              ) : tier ? (
                <span className="text-[10px] font-bold uppercase tracking-wide text-cyan-300 capitalize">{tier}</span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wide text-white/40">Free</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/account" className="flex-1">
            <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-semibold text-white/80">
              <UserIcon className="w-3.5 h-3.5" /> Account
            </div>
          </Link>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/15 hover:border-red-400/30 hover:text-red-300 transition-all text-xs font-semibold text-white/80"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>

        <div className="px-1 text-center pt-1">
          <Link href="/terms">
            <span className="text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-pointer">
              Terms &amp; Conditions
            </span>
          </Link>
          <p className="text-[10px] text-white/30 mt-0.5">
            © {new Date().getFullYear()} MadeTVProducts. All rights reserved.
          </p>
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
