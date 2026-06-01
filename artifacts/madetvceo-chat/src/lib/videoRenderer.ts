export interface RenderScene {
  kind: "image" | "video";
  src: string;
  title?: string;
  caption?: string;
  narrationUrl?: string;
  durationSec?: number;
}

export interface RenderOptions {
  aspectRatio: "16:9" | "9:16";
  onProgress?: (fraction: number, label: string) => void;
  accentColor?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = false;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = src;
  });
}

async function decodeAudio(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return await ctx.decodeAudioData(buf);
}

function pickMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
  }
  return "video/webm";
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  media: HTMLImageElement | HTMLVideoElement,
  cw: number,
  ch: number,
  scale: number,
  panX: number,
  panY: number,
) {
  const mw = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
  const mh = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;
  if (!mw || !mh) return;
  const targetRatio = cw / ch;
  const mediaRatio = mw / mh;
  let dw: number, dh: number;
  if (mediaRatio > targetRatio) {
    dh = ch * scale;
    dw = dh * mediaRatio;
  } else {
    dw = cw * scale;
    dh = dw / mediaRatio;
  }
  const dx = (cw - dw) / 2 + panX;
  const dy = (ch - dh) / 2 + panY;
  ctx.drawImage(media, dx, dy, dw, dh);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderVideo(scenes: RenderScene[], opts: RenderOptions): Promise<Blob> {
  const W = opts.aspectRatio === "16:9" ? 1280 : 720;
  const H = opts.aspectRatio === "16:9" ? 720 : 1280;
  const accent = opts.accentColor ?? "#6d28d9";
  const fps = 30;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (audioCtx.state === "suspended") await audioCtx.resume();
  const audioDest = audioCtx.createMediaStreamDestination();

  // Preload all assets
  type Loaded = {
    scene: RenderScene;
    image?: HTMLImageElement;
    video?: HTMLVideoElement;
    narration?: AudioBuffer;
    duration: number;
  };
  const loaded: Loaded[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    opts.onProgress?.(i / scenes.length * 0.3, `Loading scene ${i + 1}...`);
    let image: HTMLImageElement | undefined;
    let video: HTMLVideoElement | undefined;
    let narration: AudioBuffer | undefined;
    let duration = s.durationSec ?? 4;
    if (s.kind === "image") {
      image = await loadImage(s.src);
    } else {
      video = await loadVideo(s.src);
      duration = Math.min(s.durationSec ?? (video.duration || 6), 20);
    }
    if (s.narrationUrl) {
      try {
        narration = await decodeAudio(audioCtx, s.narrationUrl);
        duration = Math.max(duration, narration.duration + 0.6);
      } catch {
        // narration optional
      }
    }
    loaded.push({ scene: s, image, video, narration, duration });
  }

  // Background music-free: set up recorder combining canvas video + audio dest
  const canvasStream = canvas.captureStream(fps);
  const mixedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((t) => mixedStream.addTrack(t));
  audioDest.stream.getAudioTracks().forEach((t) => mixedStream.addTrack(t));

  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(mixedStream, { mimeType, videoBitsPerSecond: 6_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  const cleanup = () => {
    try {
      canvasStream.getTracks().forEach((t) => t.stop());
      mixedStream.getTracks().forEach((t) => t.stop());
    } catch {
      // ignore
    }
    loaded.forEach((l) => {
      if (l.video) {
        try {
          l.video.pause();
          l.video.removeAttribute("src");
          l.video.load();
        } catch {
          // ignore
        }
      }
    });
    if (audioCtx.state !== "closed") {
      audioCtx.close().catch(() => {});
    }
  };

  try {
    recorder.start();

    const totalDuration = loaded.reduce((s, l) => s + l.duration, 0);
    let elapsedBefore = 0;

    for (let i = 0; i < loaded.length; i++) {
    const l = loaded[i];
    const sceneDuration = l.duration;

    // Schedule narration audio for this scene
    if (l.narration) {
      const srcNode = audioCtx.createBufferSource();
      srcNode.buffer = l.narration;
      srcNode.connect(audioDest);
      srcNode.start();
    }

    // Play uploaded video with its own audio routed to recording
    if (l.video) {
      try {
        l.video.currentTime = 0;
        const vidSource = audioCtx.createMediaElementSource(l.video);
        vidSource.connect(audioDest);
      } catch {
        // element source may already exist; ignore
      }
      try {
        await l.video.play();
      } catch (err) {
        console.warn("Video scene playback failed; rendering static frame", err);
      }
    }

    const sceneStart = performance.now();
    await new Promise<void>((resolve) => {
      const frame = () => {
        const t = (performance.now() - sceneStart) / 1000;
        const progress = Math.min(t / sceneDuration, 1);

        ctx.fillStyle = "#0b1020";
        ctx.fillRect(0, 0, W, H);

        // Ken Burns zoom for images
        const scale = l.image ? 1.04 + progress * 0.08 : 1.0;
        const panX = l.image ? -progress * 24 : 0;
        const media = l.image ?? l.video;
        if (media) drawCover(ctx, media, W, H, scale, panX, 0);

        // Cinematic gradient overlay for text legibility
        const grad = ctx.createLinearGradient(0, H * 0.45, 0, H);
        grad.addColorStop(0, "rgba(8,12,28,0)");
        grad.addColorStop(1, "rgba(8,12,28,0.85)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Fade in/out
        let alpha = 1;
        const fade = 0.45;
        if (t < fade) alpha = t / fade;
        else if (t > sceneDuration - fade) alpha = Math.max(0, (sceneDuration - t) / fade);

        const textIn = Math.min(1, t / 0.6);

        // Title
        if (l.scene.title) {
          const fontSize = Math.round(W * 0.045);
          ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
          ctx.textBaseline = "top";
          const tx = W * 0.07;
          const ty = H * 0.07 + (1 - textIn) * 20;
          ctx.globalAlpha = alpha * textIn;
          // accent bar
          ctx.fillStyle = accent;
          roundRect(ctx, tx, ty + 2, 6, fontSize, 3);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "rgba(0,0,0,0.6)";
          ctx.shadowBlur = 12;
          ctx.fillText(l.scene.title, tx + 20, ty);
          ctx.shadowBlur = 0;
        }

        // Caption (bottom)
        if (l.scene.caption) {
          const fontSize = Math.round(W * 0.055);
          ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
          ctx.textBaseline = "bottom";
          const maxW = W * 0.86;
          const lines = wrapText(ctx, l.scene.caption, maxW);
          const lineH = fontSize * 1.2;
          let by = H * 0.92 - (lines.length - 1) * lineH;
          ctx.globalAlpha = alpha;
          ctx.textAlign = "center";
          for (const ln of lines) {
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 16;
            ctx.fillText(ln, W / 2, by);
            by += lineH;
          }
          ctx.shadowBlur = 0;
          ctx.textAlign = "left";
        }

        ctx.globalAlpha = 1;

        const globalFraction = (elapsedBefore + t) / totalDuration;
        opts.onProgress?.(0.3 + globalFraction * 0.65, `Rendering scene ${i + 1} of ${loaded.length}...`);

        if (progress >= 1) {
          resolve();
        } else {
          requestAnimationFrame(frame);
        }
      };
      requestAnimationFrame(frame);
    });

    if (l.video) {
      l.video.pause();
    }
    elapsedBefore += sceneDuration;
    }

    opts.onProgress?.(0.97, "Finalizing video...");
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;

    opts.onProgress?.(1, "Done");
    return new Blob(chunks, { type: mimeType.split(";")[0] });
  } finally {
    if (recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        // ignore
      }
    }
    cleanup();
  }
}
