import { useState } from "react";
import { format } from "date-fns";
import { Sidebar } from "@/components/chat/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePaidAction } from "@/hooks/usePaidAction";
import { Copy, Plus, Send, RefreshCw, BarChart3, AlertCircle, Link2, CalendarClock, LayoutGrid, CheckCircle2, MoreVertical, Trash2, Zap } from "lucide-react";
import { SiX, SiYoutube, SiInstagram, SiTiktok, SiFacebook } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa6";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListSocialAccounts, 
  getListSocialAccountsQueryKey,
  useConnectSocialAccount,
  useDisconnectSocialAccount,
  useListSocialPosts,
  getListSocialPostsQueryKey,
  useCreateSocialPost,
  useDeleteSocialPost,
  useGenerateSocialContent,
  useGetSocialStats,
  SocialAccountInputPlatform,
  SocialPostInputPostType,
  ContentGenerateInputContentType,
  ContentGenerateInputTone,
  SocialPostInputStatus,
  getGetSocialStatsQueryKey
} from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "twitter", name: "Twitter / X", icon: SiX, color: "text-slate-900", bg: "bg-slate-900" },
  { id: "youtube", name: "YouTube", icon: SiYoutube, color: "text-[#FF0000]", bg: "bg-[#FF0000]" },
  { id: "instagram", name: "Instagram", icon: SiInstagram, color: "text-[#E1306C]", bg: "bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045]" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "text-black", bg: "bg-black" },
  { id: "facebook", name: "Facebook", icon: SiFacebook, color: "text-[#1877F2]", bg: "bg-[#1877F2]" },
  { id: "linkedin", name: "LinkedIn", icon: FaLinkedinIn, color: "text-[#0A66C2]", bg: "bg-[#0A66C2]" }
];

export function SocialPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: stats } = useGetSocialStats();
  const { data: accounts } = useListSocialAccounts();
  const { data: posts } = useListSocialPosts();
  
  const connectMutation = useConnectSocialAccount();
  const disconnectMutation = useDisconnectSocialAccount();
  const createPostMutation = useCreateSocialPost();
  const deletePostMutation = useDeleteSocialPost();
  const generateMutation = useGenerateSocialContent();

  const [activeTab, setActiveTab] = useState("connect");

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/50">
      <div className="md:hidden p-4 border-b flex items-center bg-sidebar shrink-0 text-white">
        <Sidebar isMobile />
        <span className="ml-4 font-display font-bold">Social Hub</span>
      </div>

      <div className="max-w-6xl mx-auto w-full p-6 md:p-12 space-y-8">
        <div>
          <h1 className="text-4xl font-display font-extrabold gradient-text tracking-tight mb-2">Social Command Center</h1>
          <p className="text-muted-foreground font-medium">Manage, create, and schedule content across all platforms.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1.5 bg-slate-200/50 rounded-xl">
            <TabsTrigger value="connect" className="py-2.5 rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <Link2 className="w-4 h-4 mr-2" /> Connect
            </TabsTrigger>
            <TabsTrigger value="create" className="py-2.5 rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <Zap className="w-4 h-4 mr-2" /> AI Creator
            </TabsTrigger>
            <TabsTrigger value="schedule" className="py-2.5 rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <CalendarClock className="w-4 h-4 mr-2" /> Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-0 shadow-sm bg-white overflow-hidden relative group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500" />
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <BarChart3 className="w-6 h-6 text-primary mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-muted-foreground font-medium mb-1">Total Posts</p>
                  <p className="text-2xl font-bold">{stats?.totalPosts || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white overflow-hidden relative group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <CalendarClock className="w-6 h-6 text-blue-500 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-muted-foreground font-medium mb-1">Scheduled</p>
                  <p className="text-2xl font-bold">{stats?.scheduled || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white overflow-hidden relative group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-muted-foreground font-medium mb-1">Published</p>
                  <p className="text-2xl font-bold">{stats?.published || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white overflow-hidden relative group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <LayoutGrid className="w-6 h-6 text-indigo-500 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-muted-foreground font-medium mb-1">Connected Accounts</p>
                  <p className="text-2xl font-bold">{stats?.connectedAccounts || 0}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const account = accounts?.find(a => a.platform === platform.id);
                const isConnected = !!account?.connected;
                
                return (
                  <Card key={platform.id} className="border border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10 bg-slate-50/50 border-b">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-lg flex items-center justify-center text-white shadow-sm", platform.bg)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-display font-bold">{platform.name}</CardTitle>
                      </div>
                      <div className={cn("text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border", 
                        isConnected ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {isConnected ? "Connected" : "Disconnected"}
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 flex-1 flex flex-col justify-center relative z-10">
                      {isConnected ? (
                        <div className="text-center space-y-1">
                          <p className="text-sm text-muted-foreground">Operating as</p>
                          <p className="font-semibold text-foreground">@{account.username}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">
                          Connect your {platform.name} account to schedule and publish posts directly.
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 border-t border-slate-100 mt-auto bg-slate-50/50">
                      {isConnected ? (
                        <Button 
                          variant="outline" 
                          className="w-full text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20"
                          onClick={() => {
                            if (account) {
                              disconnectMutation.mutate({ id: account.id }, {
                                onSuccess: () => {
                                  toast({ title: "Account Disconnected", description: `Disconnected ${platform.name}` });
                                  queryClient.invalidateQueries({ queryKey: getListSocialAccountsQueryKey() });
                                  queryClient.invalidateQueries({ queryKey: getGetSocialStatsQueryKey() });
                                }
                              });
                            }
                          }}
                          disabled={disconnectMutation.isPending}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <ConnectPlatformSheet platform={platform} />
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6 animate-in fade-in-50 duration-500">
            <CreateContentTab />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 animate-in fade-in-50 duration-500">
            <ScheduleTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ConnectPlatformSheet({ platform }: { platform: typeof PLATFORMS[0] }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { requirePlan } = usePaidAction();
  const connectMutation = useConnectSocialAccount();

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirePlan()) return;
    connectMutation.mutate({
      data: {
        platform: platform.id as SocialAccountInputPlatform,
        username,
        apiKey,
        apiSecret,
        accessToken
      }
    }, {
      onSuccess: () => {
        toast({ title: "Account Connected", description: `Successfully connected ${platform.name}` });
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: getListSocialAccountsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSocialStatsQueryKey() });
      },
      onError: () => {
        toast({ title: "Connection Failed", description: "Could not connect account. Please check your credentials.", variant: "destructive" });
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90">Connect {platform.name}</Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("p-2 rounded-lg text-white", platform.bg)}>
              <platform.icon className="w-5 h-5" />
            </div>
            <SheetTitle>Connect {platform.name}</SheetTitle>
          </div>
          <SheetDescription>
            Enter your API credentials to allow Made Super AI to post on your behalf.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleConnect} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username / Handle</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key / Client ID</Label>
              <Input id="apiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret / Client Secret</Label>
              <Input id="apiSecret" type="password" value={apiSecret} onChange={e => setApiSecret(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input id="accessToken" type="password" value={accessToken} onChange={e => setAccessToken(e.target.value)} />
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Your credentials are encrypted and stored securely. We will never post without your explicit schedule or confirmation.</p>
          </div>
          <Button type="submit" className="w-full" disabled={connectMutation.isPending || !username}>
            {connectMutation.isPending ? "Connecting..." : "Save Connection"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function CreateContentTab() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<string>("twitter");
  const [contentType, setContentType] = useState<ContentGenerateInputContentType>("post");
  const [tone, setTone] = useState<ContentGenerateInputTone>("professional");
  
  const generateMutation = useGenerateSocialContent();
  const createPostMutation = useCreateSocialPost();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { requirePlan } = usePaidAction();

  const handleGenerate = () => {
    if (!topic) return;
    if (!requirePlan()) return;
    generateMutation.mutate({
      data: {
        topic,
        platform,
        contentType,
        tone
      }
    });
  };

  const handleSaveDraft = (content: string) => {
    if (!requirePlan()) return;
    createPostMutation.mutate({
      data: {
        platform,
        content,
        status: "draft",
        postType: contentType === "video_script" ? "video" : "text"
      }
    }, {
      onSuccess: () => {
        toast({ title: "Draft Saved", description: "Content saved to your schedule as a draft." });
        queryClient.invalidateQueries({ queryKey: getListSocialPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSocialStatsQueryKey() });
      }
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Content copied to clipboard." });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Content Parameters</CardTitle>
            <CardDescription>Tell the AI what you want to create.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">What do you want to post about?</Label>
              <Textarea 
                placeholder="e.g., A launch announcement for our new AI feature..." 
                className="resize-none h-24 focus-visible:ring-primary"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">Target Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <p.icon className={cn("w-4 h-4", p.color)} />
                        <span>{p.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">Content Type</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "post", label: "Post" },
                  { id: "video_script", label: "Video Script" },
                  { id: "caption", label: "Caption" },
                  { id: "thread", label: "Thread" }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setContentType(type.id as ContentGenerateInputContentType)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      contentType === type.id 
                        ? "bg-primary text-white border-primary shadow-md" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">Tone of Voice</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "professional", label: "Professional" },
                  { id: "casual", label: "Casual" },
                  { id: "energetic", label: "Energetic" },
                  { id: "educational", label: "Educational" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id as ContentGenerateInputTone)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      tone === t.id 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/80 border-t p-4">
            <Button 
              className="w-full font-bold h-12 text-md shadow-md gap-2" 
              onClick={handleGenerate}
              disabled={!topic || generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Generating...</>
              ) : (
                <><Zap className="w-5 h-5" /> Generate with AI</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        {generateMutation.data ? (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <Card className="border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Zap className="w-4 h-4" />
                    <span>Generated Content</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(generateMutation.data.content)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-medium">
                  {generateMutation.data.content}
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t bg-slate-50">
                <Button className="w-full" onClick={() => handleSaveDraft(generateMutation.data.content)}>
                  Save as Draft
                </Button>
              </CardFooter>
            </Card>

            {generateMutation.data.suggestions && generateMutation.data.suggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Alternative Angles</h3>
                {generateMutation.data.suggestions.map((suggestion, i) => (
                  <Card key={i} className="bg-white hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-4 flex gap-4 items-start">
                      <div className="flex-1 text-sm text-slate-600 line-clamp-3">
                        {suggestion}
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(suggestion)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleSaveDraft(suggestion)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-400 mb-2">Awaiting Instructions</h3>
            <p className="text-slate-500 max-w-xs text-sm">
              Fill out the parameters on the left and hit generate to see AI-crafted content appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleTab() {
  const { data: posts } = useListSocialPosts();
  const deletePostMutation = useDeleteSocialPost();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState("all");

  const filteredPosts = posts?.filter(p => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const handleDelete = (id: number) => {
    deletePostMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Post Deleted" });
        queryClient.invalidateQueries({ queryKey: getListSocialPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSocialStatsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm">
          {["all", "draft", "scheduled", "published"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                filter === f 
                  ? "bg-slate-100 text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        
        <NewPostDialog />
      </div>

      <div className="grid gap-4">
        {filteredPosts?.length === 0 ? (
          <div className="text-center p-12 border rounded-xl bg-white border-dashed">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No posts found in this category.</p>
          </div>
        ) : (
          filteredPosts?.map(post => {
            const platform = PLATFORMS.find(p => p.id === post.platform);
            const Icon = platform?.icon || SiX;
            
            return (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row">
                  <div className={cn("sm:w-2 bg-slate-200", platform?.bg || "bg-slate-200")} />
                  <div className="p-5 flex-1 flex flex-col sm:flex-row gap-5 items-start">
                    <div className={cn("p-2 rounded-lg text-white shrink-0 shadow-sm", platform?.bg || "bg-slate-800")}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                          post.status === "published" && "bg-emerald-100 text-emerald-700",
                          post.status === "scheduled" && "bg-blue-100 text-blue-700",
                          post.status === "draft" && "bg-slate-100 text-slate-600",
                          post.status === "failed" && "bg-red-100 text-red-700",
                        )}>
                          {post.status}
                        </span>
                        {(post.scheduledAt || post.publishedAt) && (
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <CalendarClock className="w-3.5 h-3.5" />
                            {post.scheduledAt ? format(new Date(post.scheduledAt), "PPp") : ""}
                            {post.publishedAt ? format(new Date(post.publishedAt), "PPp") : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="shrink-0 pt-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function NewPostDialog() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<string>("twitter");
  const [date, setDate] = useState("");
  
  const createPostMutation = useCreateSocialPost();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSave = (status: SocialPostInputStatus) => {
    createPostMutation.mutate({
      data: {
        platform,
        content,
        status,
        scheduledAt: date ? new Date(date).toISOString() : undefined,
        postType: "text"
      }
    }, {
      onSuccess: () => {
        toast({ title: status === "draft" ? "Draft Saved" : "Post Scheduled" });
        setOpen(false);
        setContent("");
        queryClient.invalidateQueries({ queryKey: getListSocialPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSocialStatsQueryKey() });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-white shadow-sm font-semibold">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compose Post</DialogTitle>
          <DialogDescription>Create a new post for your social channels.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <p.icon className={cn("w-4 h-4", p.color)} />
                      <span>{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
              placeholder="What's on your mind?"
            />
          </div>

          <div className="space-y-2">
            <Label>Schedule Date/Time (Optional)</Label>
            <Input 
              type="datetime-local" 
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center w-full sm:w-auto">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={!content || createPostMutation.isPending}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSave("scheduled")} disabled={!content || createPostMutation.isPending} className="bg-primary">
            Schedule Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
