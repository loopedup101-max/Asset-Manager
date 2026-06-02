import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Sidebar } from "@/components/chat/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePaidAction } from "@/hooks/usePaidAction";
import { Copy, Plus, RefreshCw, AlertCircle, Zap, Trash2, Save, ClipboardCheck } from "lucide-react";
import { SiX, SiYoutube, SiInstagram, SiTiktok, SiFacebook } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa6";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListSocialPosts,
  getListSocialPostsQueryKey,
  useCreateSocialPost,
  useDeleteSocialPost,
  useGenerateSocialContent,
  ContentGenerateInputContentType,
  ContentGenerateInputTone,
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

function platformName(id: string) {
  return PLATFORMS.find(p => p.id === id)?.name ?? id;
}

function HonestNotice() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
      <div className="text-amber-900 space-y-1">
        <p className="font-semibold">How this works</p>
        <p className="text-amber-800">
          This tool <strong>writes your posts for you</strong> with AI. It does <strong>not</strong> post
          to Facebook, Instagram, YouTube, X, TikTok or LinkedIn automatically — and it can't schedule
          posts to go live on its own. Generate your content, tap <strong>Copy</strong>, then paste it
          into the app you want to post on. Anything you save here is kept in your own library so you can
          grab it again later.
        </p>
      </div>
    </div>
  );
}

export function SocialPage() {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/50">
      <div className="md:hidden p-4 border-b flex items-center bg-sidebar shrink-0 text-white">
        <Sidebar isMobile />
        <span className="ml-4 font-display font-bold">Social Hub</span>
      </div>

      <div className="max-w-6xl mx-auto w-full p-6 md:p-12 space-y-8">
        <div>
          <h1 className="text-4xl font-display font-extrabold gradient-text tracking-tight mb-2">AI Social Writer</h1>
          <p className="text-muted-foreground font-medium">Write scroll-stopping posts with AI, then copy &amp; paste them wherever you post.</p>
        </div>

        <HonestNotice />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-auto p-1.5 bg-slate-200/50 rounded-xl max-w-md">
            <TabsTrigger value="create" className="py-2.5 rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <Zap className="w-4 h-4 mr-2" /> AI Creator
            </TabsTrigger>
            <TabsTrigger value="library" className="py-2.5 rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <Save className="w-4 h-4 mr-2" /> My Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6 animate-in fade-in-50 duration-500">
            <CreateContentTab />
          </TabsContent>

          <TabsContent value="library" className="space-y-6 animate-in fade-in-50 duration-500">
            <LibraryTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
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
  const socialSearch = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(socialSearch);
    const t = params.get("topic");
    const p = params.get("platform");
    if (t) setTopic(t);
    if (p) setPlatform(p);
    // prefill once from the agent's deep link
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = () => {
    if (!topic) return;
    if (!requirePlan()) return;
    generateMutation.mutate({
      data: { topic, platform, contentType, tone }
    });
  };

  const handleSave = (content: string) => {
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
        toast({ title: "Saved to My Posts", description: "Find it anytime in the My Posts tab." });
        queryClient.invalidateQueries({ queryKey: getListSocialPostsQueryKey() });
      }
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `Now paste it into ${platformName(platform)} to post.` });
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
              <Label className="text-sm font-semibold text-foreground">Which platform is this for?</Label>
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
              <p className="text-xs text-muted-foreground">The AI tailors length &amp; style for this platform. You'll copy &amp; paste it there yourself.</p>
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
                    <span>Your post is ready</span>
                  </div>
                </div>
                <CardDescription className="pt-1">
                  Copy it and paste it into {platformName(platform)} to post — this tool won't post it for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-medium">
                  {generateMutation.data.content}
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t bg-slate-50 flex gap-3">
                <Button className="flex-1 gap-2" onClick={() => handleCopy(generateMutation.data.content)}>
                  <Copy className="w-4 h-4" /> Copy to paste &amp; post
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => handleSave(generateMutation.data.content)} disabled={createPostMutation.isPending}>
                  <Save className="w-4 h-4" /> Save
                </Button>
              </CardFooter>
            </Card>

            {generateMutation.data.suggestions && generateMutation.data.suggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Alternative Angles</h3>
                {generateMutation.data.suggestions.map((suggestion, i) => (
                  <Card key={i} className="bg-white hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4 flex gap-4 items-start">
                      <div className="flex-1 text-sm text-slate-600 line-clamp-3">
                        {suggestion}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Copy" onClick={() => handleCopy(suggestion)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="Save to My Posts" onClick={() => handleSave(suggestion)}>
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

function LibraryTab() {
  const { data: posts } = useListSocialPosts();
  const deletePostMutation = useDeleteSocialPost();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deletePostMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Deleted" });
        queryClient.invalidateQueries({ queryKey: getListSocialPostsQueryKey() });
      }
    });
  };

  const handleCopy = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `Now paste it into ${platformName(platform)} to post.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-xl">Saved posts</h2>
          <p className="text-sm text-muted-foreground">Your saved drafts. Copy any one and paste it where you want to post.</p>
        </div>
        <NewPostDialog />
      </div>

      <div className="grid gap-4">
        {posts?.length === 0 ? (
          <div className="text-center p-12 border rounded-xl bg-white border-dashed">
            <Save className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No saved posts yet.</p>
            <p className="text-slate-400 text-sm">Generate one in the AI Creator tab and hit Save.</p>
          </div>
        ) : (
          posts?.map(post => {
            const platform = PLATFORMS.find(p => p.id === post.platform);
            const Icon = platform?.icon || SiX;

            return (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row">
                  <div className={cn("sm:w-2", platform?.bg || "bg-slate-200")} />
                  <div className="p-5 flex-1 flex flex-col sm:flex-row gap-5 items-start">
                    <div className={cn("p-2 rounded-lg text-white shrink-0 shadow-sm", platform?.bg || "bg-slate-800")}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {platformName(post.platform)}
                      </span>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="shrink-0 flex sm:flex-col gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleCopy(post.content, post.platform)}
                      >
                        <ClipboardCheck className="w-4 h-4" /> Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-destructive hover:bg-destructive/10"
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

  const createPostMutation = useCreateSocialPost();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSave = () => {
    createPostMutation.mutate({
      data: {
        platform,
        content,
        status: "draft",
        postType: "text"
      }
    }, {
      onSuccess: () => {
        toast({ title: "Saved to My Posts" });
        setOpen(false);
        setContent("");
        queryClient.invalidateQueries({ queryKey: getListSocialPostsQueryKey() });
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
          <DialogTitle>Write a post</DialogTitle>
          <DialogDescription>Save your own text to your library. You'll copy &amp; paste it to post — this won't post for you.</DialogDescription>
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
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={!content || createPostMutation.isPending} className="bg-primary gap-2">
            <Save className="w-4 h-4" /> Save to My Posts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
