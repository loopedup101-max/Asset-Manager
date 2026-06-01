import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { usePaidAction } from "@/hooks/usePaidAction";
import { useSearch } from "wouter";
import { renderVideo, type RenderScene } from "@/lib/videoRenderer";
import {
  Clapperboard, Sparkles, Wand2, Download, Loader2, Upload, Trash2,
  Video, Monitor, Camera, Circle, Square, ImagePlus, GripVertical, Film, Mic
} from "lucide-react";
import { cn } from "@/lib/utils";

const API = `${import.meta.env.BASE_URL}api`;

interface Scene {
  id: string;
  kind: "image" | "video";
  src: string;
  title: string;
  caption: string;
  narration: string;
  narrationUrl?: string;
  durationSec?: number;
  source: "ai" | "upload";
}

const VOICES = [
  { id: "nova", label: "Nova (warm female)" },
  { id: "alloy", label: "Alloy (neutral)" },
  { id: "echo", label: "Echo (male)" },
  { id: "fable", label: "Fable (storyteller)" },
  { id: "onyx", label: "Onyx (deep male)" },
  { id: "shimmer", label: "Shimmer (bright female)" },
];

const STYLES = [
  "Cinematic & modern",
  "Bright & energetic",
  "Minimal & elegant",
  "Bold & colorful",
  "Documentary realistic",
  "Retro vintage",
  "Futuristic neon",
];

const REEL_COLORS = [
  "from-fuchsia-500 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-amber-400 to-orange-500",
  "from-violet-500 to-purple-600",
  "from-emerald-400 to-teal-500",
  "from-rose-500 to-red-500",
];

// Lively animated film strip — the "making videos" energy.
function FilmStrip({ active }: { active?: boolean }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      <div className="flex gap-2 p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "h-16 flex-1 rounded-lg bg-gradient-to-br shadow-lg",
              REEL_COLORS[i % REEL_COLORS.length],
            )}
            animate={
              active
                ? { opacity: [0.35, 1, 0.35], scale: [0.96, 1, 0.96] }
                : { opacity: [0.55, 0.9, 0.55] }
            }
            transition={{
              repeat: Infinity,
              duration: active ? 1.1 : 2.4,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {/* sprocket holes */}
      <div className="flex justify-between px-3 pb-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="w-2.5 h-2.5 rounded-sm bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export function StudioPage() {
  const { toast } = useToast();
  const { requirePlan, entitled } = usePaidAction();
  const studioSearch = useSearch();

  // ---- AI Video Maker state ----
  const [topic, setTopic] = useState(() => new URLSearchParams(studioSearch).get("topic") || "");
  const [style, setStyle] = useState(STYLES[0]);
  const [aspect, setAspect] = useState<"16:9" | "9:16">("16:9");
  const [voice, setVoice] = useState("nova");
  const [sceneCount, setSceneCount] = useState(5);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [genStage, setGenStage] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderLabel, setRenderLabel] = useState("");
  const [resultUrl, setResultUrl] = useState<string>("");

  const uploadRef = useRef<HTMLInputElement>(null);

  // ---- Recorder state ----
  const [recording, setRecording] = useState(false);
  const [recordMode, setRecordMode] = useState<"camera" | "screen">("camera");
  const [recordUrl, setRecordUrl] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const livePreviewRef = useRef<HTMLVideoElement>(null);
  const recordChunks = useRef<BlobPart[]>([]);

  const scenesRef = useRef<Scene[]>([]);
  const resultUrlRef = useRef<string>("");
  const recordUrlRef = useRef<string>("");
  useEffect(() => { scenesRef.current = scenes; }, [scenes]);
  useEffect(() => { resultUrlRef.current = resultUrl; }, [resultUrl]);
  useEffect(() => { recordUrlRef.current = recordUrl; }, [recordUrl]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      scenesRef.current.forEach((s) => {
        if (s.src.startsWith("blob:")) URL.revokeObjectURL(s.src);
      });
      if (resultUrlRef.current.startsWith("blob:")) URL.revokeObjectURL(resultUrlRef.current);
      if (recordUrlRef.current.startsWith("blob:")) URL.revokeObjectURL(recordUrlRef.current);
    };
  }, []);

  const apiPost = async <T,>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }
    return res.json();
  };

  // ---- AI generation pipeline ----
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Add a topic", description: "Tell me what the video should be about.", variant: "destructive" });
      return;
    }
    if (!requirePlan()) return;
    setGenerating(true);
    if (resultUrl.startsWith("blob:")) URL.revokeObjectURL(resultUrl);
    setResultUrl("");
    scenes.forEach((s) => { if (s.src.startsWith("blob:")) URL.revokeObjectURL(s.src); });
    setScenes([]);
    try {
      setGenStage("Writing your script...");
      const script = await apiPost<{ title: string; scenes: { title: string; narration: string; imagePrompt: string; caption: string }[] }>(
        "/video/script",
        { topic, style, sceneCount, aspectRatio: aspect },
      );
      setVideoTitle(script.title);

      const built: Scene[] = [];
      for (let i = 0; i < script.scenes.length; i++) {
        const sc = script.scenes[i];
        setGenStage(`Generating image ${i + 1} of ${script.scenes.length}...`);
        const img = await apiPost<{ image: string }>("/video/image", { prompt: sc.imagePrompt });

        setGenStage(`Recording narration ${i + 1} of ${script.scenes.length}...`);
        let narrationUrl: string | undefined;
        try {
          const narr = await apiPost<{ audio: string }>("/video/narration", { text: sc.narration, voice });
          narrationUrl = narr.audio;
        } catch {
          // narration optional
        }

        built.push({
          id: `ai-${Date.now()}-${i}`,
          kind: "image",
          src: img.image,
          title: sc.title,
          caption: sc.caption,
          narration: sc.narration,
          narrationUrl,
          source: "ai",
        });
        setScenes([...built]);
      }
      setGenStage("");
      toast({ title: "Storyboard ready!", description: "Review your scenes, then render the video." });
    } catch (e) {
      toast({ title: "Generation failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setGenerating(false);
      setGenStage("");
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const added: Scene[] = [];
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video/");
      added.push({
        id: `up-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        kind: isVideo ? "video" : "image",
        src: url,
        title: "",
        caption: file.name.replace(/\.[^.]+$/, ""),
        narration: "",
        durationSec: isVideo ? undefined : 4,
        source: "upload",
      });
    }
    setScenes((prev) => [...prev, ...added]);
    if (uploadRef.current) uploadRef.current.value = "";
    toast({ title: `Added ${added.length} item${added.length !== 1 ? "s" : ""}`, description: "Your media is now part of the video." });
  };

  const updateScene = (id: string, patch: Partial<Scene>) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeScene = (id: string) => {
    setScenes((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target && target.src.startsWith("blob:") && target.src !== recordUrlRef.current) {
        URL.revokeObjectURL(target.src);
      }
      return prev.filter((s) => s.id !== id);
    });
  };

  const moveScene = (id: string, dir: -1 | 1) => {
    setScenes((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const regenNarration = async (id: string) => {
    const scene = scenes.find((s) => s.id === id);
    if (!scene || !scene.narration.trim()) {
      toast({ title: "Add narration text first", variant: "destructive" });
      return;
    }
    if (!requirePlan()) return;
    try {
      const narr = await apiPost<{ audio: string }>("/video/narration", { text: scene.narration, voice });
      updateScene(id, { narrationUrl: narr.audio });
      toast({ title: "Voiceover updated" });
    } catch (e) {
      toast({ title: "Narration failed", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const handleRender = async () => {
    if (scenes.length === 0) {
      toast({ title: "No scenes", description: "Generate or upload media first.", variant: "destructive" });
      return;
    }
    setRendering(true);
    if (resultUrl.startsWith("blob:")) URL.revokeObjectURL(resultUrl);
    setResultUrl("");
    setRenderProgress(0);
    try {
      const renderScenes: RenderScene[] = scenes.map((s) => ({
        kind: s.kind,
        src: s.src,
        title: s.title || undefined,
        caption: s.caption || undefined,
        narrationUrl: s.narrationUrl,
        durationSec: s.durationSec,
      }));
      const blob = await renderVideo(renderScenes, {
        aspectRatio: aspect,
        watermark: !entitled,
        onProgress: (f, label) => {
          setRenderProgress(Math.round(f * 100));
          setRenderLabel(label);
        },
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      toast({
        title: "Video rendered!",
        description: entitled
          ? "Preview it below and download."
          : "Free videos include a MadeTV watermark — upgrade to remove it.",
      });
    } catch (e) {
      toast({ title: "Render failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setRendering(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${(videoTitle || "made-super-ai-video").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.webm`;
    a.click();
  };

  // ---- Recorder ----
  const startRecording = async () => {
    try {
      let stream: MediaStream;
      if (recordMode === "camera") {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      }
      streamRef.current = stream;
      if (livePreviewRef.current) {
        livePreviewRef.current.srcObject = stream;
        livePreviewRef.current.play().catch(() => {});
      }
      recordChunks.current = [];
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      rec.ondataavailable = (e) => e.data.size > 0 && recordChunks.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(recordChunks.current, { type: "video/webm" });
        setRecordUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        if (livePreviewRef.current) livePreviewRef.current.srcObject = null;
        setRecording(false);
      };
      // If the user ends screen-share via the browser UI, stop cleanly
      stream.getVideoTracks().forEach((t) => {
        t.onended = () => {
          if (rec.state !== "inactive") rec.stop();
        };
      });
      recorderRef.current = rec;
      if (recordUrl.startsWith("blob:") && recordUrl !== recordUrlRef.current) URL.revokeObjectURL(recordUrl);
      rec.start();
      setRecording(true);
      setRecordUrl("");
    } catch (e) {
      toast({ title: "Could not start recording", description: e instanceof Error ? e.message : "Permission denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const addRecordingToStudio = () => {
    if (!recordUrl) return;
    setScenes((prev) => [...prev, {
      id: `rec-${Date.now()}`,
      kind: "video",
      src: recordUrl,
      title: "",
      caption: "My Recording",
      narration: "",
      source: "upload",
    }]);
    toast({ title: "Added to video", description: "Your recording is now a scene in the AI Video Maker." });
  };

  const inputDark = "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-fuchsia-500/40";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#070711] relative">
      {/* ambient color */}
      <div className="bg-orb w-[520px] h-[520px] bg-fuchsia-500/20 top-[-160px] left-[-120px]" />
      <div className="bg-orb w-[460px] h-[460px] bg-cyan-400/20 top-[40px] right-[-120px]" style={{ animationDelay: "1s" }} />
      <div className="bg-orb w-[420px] h-[420px] bg-amber-400/15 bottom-[-160px] left-[30%]" style={{ animationDelay: "2s" }} />

      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/[0.02] backdrop-blur-md shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(217,70,239,0.5)]"
          >
            <Clapperboard className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Video Studio
            </h1>
            <p className="text-slate-300 mt-0.5 font-medium text-sm">
              Lights, camera, AI — script, images, and voiceover, all making your video in real time.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative z-10">
        <Tabs defaultValue="maker" className="h-full flex flex-col">
          <div className="px-6 pt-4 border-b border-white/10 bg-white/[0.02] shrink-0">
            <TabsList className="h-11 bg-white/5 border border-white/10">
              <TabsTrigger value="maker" className="gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-300">
                <Wand2 className="w-4 h-4" /> AI Video Maker
              </TabsTrigger>
              <TabsTrigger value="record" className="gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-300">
                <Video className="w-4 h-4" /> Record
              </TabsTrigger>
            </TabsList>
          </div>

          {/* AI VIDEO MAKER */}
          <TabsContent value="maker" className="flex-1 overflow-auto m-0">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
              {/* Controls */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 space-y-4 shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                <div className="space-y-2">
                  <Label className="font-semibold text-white">What should the video be about?</Label>
                  <Textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. A 30-second promo for a coffee shop that roasts its own beans, warm and inviting"
                    className={cn("min-h-[80px] resize-none", inputDark)}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-300">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className={inputDark}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-300">Format</Label>
                    <Select value={aspect} onValueChange={(v) => setAspect(v as "16:9" | "9:16")}>
                      <SelectTrigger className={inputDark}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">Landscape 16:9</SelectItem>
                        <SelectItem value="9:16">Vertical 9:16 (Reels/Shorts)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-300">Voice</Label>
                    <Select value={voice} onValueChange={setVoice}>
                      <SelectTrigger className={inputDark}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {VOICES.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-300">Scenes</Label>
                    <Select value={String(sceneCount)} onValueChange={(v) => setSceneCount(Number(v))}>
                      <SelectTrigger className={inputDark}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8].map((n) => <SelectItem key={n} value={String(n)}>{n} scenes</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="gap-2 font-bold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 hover:opacity-90 text-white shadow-[0_0_20px_rgba(217,70,239,0.5)] flex-1 min-w-[200px] h-12 border-0"
                  >
                    {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {generating ? genStage || "Generating..." : "Generate Video with AI"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => uploadRef.current?.click()}
                    className="gap-2 font-semibold h-12 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white"
                  >
                    <Upload className="w-4 h-4" /> Upload Photos / Videos
                  </Button>
                  <input
                    ref={uploadRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    hidden
                    onChange={handleUpload}
                  />
                </div>
              </div>

              {/* Live production visual while generating */}
              {generating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-cyan-400/10 p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-2 border-fuchsia-500/30" />
                      <Film className="w-10 h-10 text-fuchsia-300 animate-[spin_3s_linear_infinite]" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-white">Your video is being made…</div>
                      <div className="text-sm text-cyan-200">{genStage || "Warming up the studio"}</div>
                    </div>
                  </div>
                  <FilmStrip active />
                </motion.div>
              )}

              {/* Storyboard */}
              {scenes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-xl flex items-center gap-2 text-white">
                      <Film className="w-5 h-5 text-fuchsia-400" />
                      {videoTitle || "Your Storyboard"}
                      <span className="text-sm font-medium text-slate-400">({scenes.length} scenes)</span>
                    </h2>
                  </div>

                  <div className="grid gap-4">
                    {scenes.map((scene, idx) => (
                      <div key={scene.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-64 shrink-0 relative bg-black aspect-video md:aspect-auto">
                            {scene.kind === "image" ? (
                              <img src={scene.src} alt={scene.title} className="w-full h-full object-cover" />
                            ) : (
                              <video src={scene.src} className="w-full h-full object-cover" muted />
                            )}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                                SCENE {idx + 1}
                              </span>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold text-white",
                                scene.source === "ai" ? "bg-gradient-to-r from-fuchsia-500 to-purple-600" : "bg-gradient-to-r from-amber-500 to-orange-500"
                              )}>
                                {scene.source === "ai" ? "AI" : "UPLOAD"}
                              </span>
                            </div>
                            {scene.kind === "video" && (
                              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold flex items-center gap-1">
                                <Video className="w-3 h-3" /> VIDEO
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-4 space-y-2.5">
                            <Input
                              value={scene.title}
                              onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                              placeholder="On-screen heading"
                              className={cn("font-semibold h-9", inputDark)}
                            />
                            <Input
                              value={scene.caption}
                              onChange={(e) => updateScene(scene.id, { caption: e.target.value })}
                              placeholder="Caption overlay"
                              className={cn("h-9 text-sm", inputDark)}
                            />
                            <div className="flex gap-2">
                              <Textarea
                                value={scene.narration}
                                onChange={(e) => updateScene(scene.id, { narration: e.target.value })}
                                placeholder="Voiceover narration (optional)"
                                className={cn("text-sm resize-none min-h-[60px] flex-1", inputDark)}
                              />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button size="sm" variant="outline" onClick={() => regenNarration(scene.id)} className="gap-1.5 text-xs h-8 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
                                <Mic className="w-3.5 h-3.5" /> {scene.narrationUrl ? "Re-voice" : "Add voiceover"}
                              </Button>
                              {scene.narrationUrl && (
                                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" /> Voiceover ready
                                </span>
                              )}
                              <div className="ml-auto flex items-center gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => moveScene(scene.id, -1)} disabled={idx === 0}>
                                  <GripVertical className="w-4 h-4 rotate-90" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/15" onClick={() => removeScene(scene.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Render bar */}
                  <div className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-500/10 to-cyan-400/10 backdrop-blur-sm sticky bottom-0 p-4">
                    {rendering ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm font-semibold text-white">
                          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-fuchsia-300" /> {renderLabel}</span>
                          <span className="text-cyan-300">{renderProgress}%</span>
                        </div>
                        <Progress value={renderProgress} className="h-2" />
                        <p className="text-xs text-slate-400">Keep this tab open and in focus while rendering.</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 flex-wrap">
                        <Button onClick={handleRender} className="gap-2 font-bold h-11 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 hover:opacity-90 text-white shadow-[0_0_20px_rgba(217,70,239,0.5)] flex-1 min-w-[180px] border-0">
                          <Film className="w-5 h-5" /> Render Final Video
                        </Button>
                        <Button variant="outline" onClick={() => uploadRef.current?.click()} className="gap-2 h-11 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
                          <ImagePlus className="w-4 h-4" /> Add More Media
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Result */}
              {resultUrl && (
                <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/5 backdrop-blur-sm p-5 space-y-4">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2 text-emerald-300">
                    <Sparkles className="w-5 h-5" /> Your video is ready!
                  </h3>
                  <video
                    src={resultUrl}
                    controls
                    autoPlay
                    className={cn("w-full rounded-xl bg-black", aspect === "9:16" ? "max-w-sm mx-auto" : "")}
                  />
                  <Button onClick={downloadResult} className="gap-2 font-bold w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                    <Download className="w-5 h-5" /> Download Video
                  </Button>
                </div>
              )}

              {scenes.length === 0 && !generating && (
                <div className="space-y-6 py-6">
                  <FilmStrip />
                  <div className="text-center text-slate-300">
                    <p className="font-medium max-w-md mx-auto">
                      Describe your video above and watch the studio build it scene by scene — or upload your own photos and videos to start.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* RECORD */}
          <TabsContent value="record" className="flex-1 overflow-auto m-0">
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              <div className="flex gap-3">
                <button
                  onClick={() => !recording && setRecordMode("camera")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl font-semibold border-2 transition-all",
                    recordMode === "camera" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "border-white/15 text-slate-300 hover:border-cyan-400/40 bg-white/5"
                  )}
                  disabled={recording}
                >
                  <Camera className="w-5 h-5" /> Webcam + Mic
                </button>
                <button
                  onClick={() => !recording && setRecordMode("screen")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl font-semibold border-2 transition-all",
                    recordMode === "screen" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "border-white/15 text-slate-300 hover:border-cyan-400/40 bg-white/5"
                  )}
                  disabled={recording}
                >
                  <Monitor className="w-5 h-5" /> Screen Recording
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="relative bg-black aspect-video flex items-center justify-center">
                  <video ref={livePreviewRef} className="w-full h-full object-contain" muted playsInline />
                  {!recording && !streamRef.current && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-2">
                      <Video className="w-12 h-12" />
                      <span className="text-sm font-medium">Preview appears here</span>
                    </div>
                  )}
                  {recording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-sm font-bold animate-pulse">
                      <Circle className="w-3 h-3 fill-white" /> REC
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                {!recording ? (
                  <Button onClick={startRecording} className="gap-2 font-bold h-14 px-8 text-base bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] border-0">
                    <Circle className="w-5 h-5 fill-white" /> Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} className="gap-2 font-bold h-14 px-8 text-base bg-slate-800 text-white shadow-lg border border-white/10">
                    <Square className="w-5 h-5 fill-white" /> Stop Recording
                  </Button>
                )}
              </div>

              {recordUrl && (
                <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/5 backdrop-blur-sm p-5 space-y-4">
                  <h3 className="font-display font-bold text-lg text-emerald-300 flex items-center gap-2">
                    <Video className="w-5 h-5" /> Recording complete
                  </h3>
                  <video src={recordUrl} controls className="w-full rounded-xl bg-black" />
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = recordUrl;
                        a.download = `recording-${Date.now()}.webm`;
                        a.click();
                      }}
                      className="gap-2 font-bold flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"
                    >
                      <Download className="w-4 h-4" /> Download
                    </Button>
                    <Button onClick={addRecordingToStudio} variant="outline" className="gap-2 font-semibold flex-1 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
                      <ImagePlus className="w-4 h-4" /> Add to AI Video Maker
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
