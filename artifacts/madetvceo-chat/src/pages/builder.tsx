import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Blocks, Sparkles, Loader2, Download, Code2, Monitor, ExternalLink,
  Wand2, RefreshCw, Smartphone, Tablet, Maximize2
} from "lucide-react";

const API = `${import.meta.env.BASE_URL}api`;

const EXAMPLES = [
  "A Pomodoro focus timer with work/break cycles, sound, and a task list saved to my browser",
  "A snake game with score, increasing speed, and a high-score leaderboard",
  "A personal budget tracker with categories, a pie chart, and monthly totals",
  "A markdown notes app with live preview and local saving",
  "A tip calculator that splits the bill between people",
  "A weather-style dashboard UI with animated cards and a dark/light toggle",
];

type Device = "desktop" | "tablet" | "mobile";

export function BuilderPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [building, setBuilding] = useState(false);
  const [html, setHtml] = useState("");
  const [title, setTitle] = useState("");
  const [view, setView] = useState<"preview" | "code">("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [changeReq, setChangeReq] = useState("");
  const [progressChars, setProgressChars] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    document.title = "App Builder — Made Super AI";
    return () => abortRef.current?.abort();
  }, []);

  const build = async (instruction: string, iterate: boolean) => {
    if (!instruction.trim()) {
      toast({ title: "Describe your app", description: "Tell the AI what to build.", variant: "destructive" });
      return;
    }
    setBuilding(true);
    setProgressChars(0);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch(`${API}/builder/app`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: instruction,
          currentHtml: iterate && html ? html : undefined,
        }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Build failed" }));
        throw new Error(err.error || "Build failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result: { html: string; title: string } | null = null;
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Normalize CRLF framing so SSE event parsing is robust.
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

        // SSE events are separated by a blank line.
        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);

          let eventName = "message";
          let dataStr = "";
          for (const line of rawEvent.split("\n")) {
            if (line.startsWith("event:")) eventName = line.slice(6).trim();
            else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
          }
          if (!dataStr) continue;

          try {
            const payload = JSON.parse(dataStr);
            if (eventName === "progress") {
              setProgressChars(payload.chars ?? 0);
            } else if (eventName === "done") {
              result = payload;
            } else if (eventName === "error") {
              streamError = payload.error || "Build failed";
            }
          } catch {
            // ignore malformed event
          }
        }
      }

      if (streamError) throw new Error(streamError);
      if (!result) throw new Error("The build ended unexpectedly. Please try again.");

      setHtml(result.html);
      setTitle(result.title);
      setView("preview");
      if (iterate) setChangeReq("");
      toast({ title: iterate ? "App updated!" : "App built!", description: result.title });
    } catch (e) {
      // Ignore aborts (component unmounted or a new build started).
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast({ title: "Build failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      setBuilding(false);
    }
  };

  const download = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "app").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openInNewTab = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const deviceWidth = device === "mobile" ? "390px" : device === "tablet" ? "768px" : "100%";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#070711] relative">
      <div className="bg-orb w-[500px] h-[500px] bg-primary/20 top-[-140px] left-[-120px]" />
      <div className="bg-orb w-[420px] h-[420px] bg-cyan-400/15 bottom-[-160px] right-[-80px]" style={{ animationDelay: "1s" }} />

      <div className="p-6 border-b border-white/10 bg-white/[0.02] backdrop-blur-md shrink-0 relative z-10">
        <h1 className="text-3xl font-display font-extrabold flex items-center gap-3 bg-gradient-to-r from-white via-primary to-cyan-300 bg-clip-text text-transparent">
          <Blocks className="w-8 h-8 text-cyan-300" />
          App Builder
        </h1>
        <p className="text-slate-300 mt-1 font-medium">
          Describe any app and the AI builds it for real — fully working, live preview, downloadable.
        </p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10">
        {/* Left: prompt + controls */}
        <div className="lg:w-[380px] shrink-0 border-r border-white/10 bg-white/[0.02] overflow-y-auto p-5 space-y-4">
          <div className="space-y-2">
            <label className="font-semibold text-sm text-slate-300">What app should I build?</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A habit tracker where I add habits, check them off daily, and see a streak counter — saved in my browser"
              className="min-h-[120px] resize-none bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
            <Button
              onClick={() => build(prompt, false)}
              disabled={building}
              className="w-full gap-2 font-bold h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(91,33,182,0.5)] border-0"
            >
              {building && !html ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {building && !html ? "Building your app..." : "Build App"}
            </Button>
          </div>

          {!html && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Try one of these</p>
              <div className="space-y-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="w-full text-left text-sm p-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm text-slate-300 hover:border-primary/40 hover:bg-primary/[0.06] transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {html && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-cyan-300" /> Refine your app
              </p>
              <Textarea
                value={changeReq}
                onChange={(e) => setChangeReq(e.target.value)}
                placeholder="e.g. Add a dark mode toggle, make the buttons rounded, add a reset button"
                className="min-h-[80px] resize-none text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={() => build(changeReq, true)}
                disabled={building}
                variant="outline"
                className="w-full gap-2 font-semibold bg-white/5 border border-white/15 text-white hover:bg-white/10 hover:text-white"
              >
                {building ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {building ? "Updating..." : "Apply Change"}
              </Button>
            </div>
          )}
        </div>

        {/* Right: preview / code */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.02] shrink-0 flex-wrap">
            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => setView("preview")}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-colors", view === "preview" ? "bg-gradient-to-r from-primary to-blue-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}
              >
                <Monitor className="w-4 h-4" /> Preview
              </button>
              <button
                onClick={() => setView("code")}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-colors", view === "code" ? "bg-gradient-to-r from-primary to-blue-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}
              >
                <Code2 className="w-4 h-4" /> Code
              </button>
            </div>

            {view === "preview" && html && (
              <div className="flex rounded-lg border border-white/10 overflow-hidden">
                {([["desktop", Maximize2], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, Icon]) => (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={cn("px-2.5 py-1.5 transition-colors", device === d ? "bg-white/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-white")}
                    title={d}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              {html && (
                <>
                  <Button size="sm" variant="outline" onClick={openInNewTab} className="gap-1.5 bg-white/5 border border-white/15 text-white hover:bg-white/10 hover:text-white">
                    <ExternalLink className="w-4 h-4" /> Open
                  </Button>
                  <Button size="sm" onClick={download} className="gap-1.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white border-0">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto relative">
            {building && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070711]/80 backdrop-blur-sm gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-300" />
                <p className="font-semibold text-white">{html ? "Updating your app..." : "Building your app..."}</p>
                <p className="text-sm text-slate-400">
                  {progressChars > 0
                    ? `Writing real, working code — ${progressChars.toLocaleString()} characters so far...`
                    : "Writing real, working code. This can take a moment."}
                </p>
              </div>
            )}

            {!html && !building && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Blocks className="w-16 h-16 mb-4 opacity-20 text-cyan-300" />
                <p className="font-medium max-w-md text-slate-300">Describe an app on the left and the AI will build a complete, working version you can use right here and download.</p>
              </div>
            )}

            {html && view === "preview" && (
              <div className="h-full flex justify-center p-4">
                <iframe
                  ref={iframeRef}
                  title="App preview"
                  srcDoc={html}
                  sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                  className="bg-white rounded-xl shadow-[0_0_40px_rgba(124,58,237,0.12)] border border-white/10 h-full transition-all"
                  style={{ width: deviceWidth, maxWidth: "100%" }}
                />
              </div>
            )}

            {html && view === "code" && (
              <pre className="text-xs leading-relaxed p-4 font-mono text-slate-300 whitespace-pre-wrap break-words">
                {html}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
