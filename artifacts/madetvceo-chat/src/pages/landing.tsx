import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Cpu,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Blocks,
  Clapperboard,
  Share2,
  Wrench,
  MessageSquare,
  Zap,
} from "lucide-react";
import mascotImg from "@/assets/mascot.webp";
import chatImg from "@/assets/features/chat.webp";
import builderImg from "@/assets/features/builder.webp";
import studioImg from "@/assets/features/studio.webp";
import socialImg from "@/assets/features/social.webp";
import { PricingPlans } from "@/components/PricingPlans";

const CAPABILITIES = [
  { icon: MessageSquare, label: "AI Agent Chat", desc: "Ask anything, get answers" },
  { icon: Blocks, label: "App Builder", desc: "Ship apps from a prompt" },
  { icon: Clapperboard, label: "Video Studio", desc: "Generate videos on demand" },
  { icon: Share2, label: "Social Hub", desc: "Create & schedule posts" },
  { icon: Wrench, label: "System Tools", desc: "Automate the busywork" },
  { icon: Cpu, label: "Autonomous", desc: "It builds, ships, and runs" },
];

const SHOWCASE = [
  {
    img: chatImg,
    icon: MessageSquare,
    title: "AI Agent Chat",
    desc: "Ask anything and get instant, intelligent answers — your always-on AI assistant.",
  },
  {
    img: builderImg,
    icon: Blocks,
    title: "App Builder",
    desc: "Describe what you want and watch it build working apps from a single prompt.",
  },
  {
    img: studioImg,
    icon: Clapperboard,
    title: "Video Studio",
    desc: "Generate scroll-stopping videos with AI narration, on demand.",
  },
  {
    img: socialImg,
    icon: Share2,
    title: "Social Hub",
    desc: "Create, schedule, and publish social content across every platform.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#070711] relative overflow-hidden">
      {/* HUD grid */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.35) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
        }}
      />
      <div className="bg-orb w-[620px] h-[620px] bg-primary/25 top-[-160px] left-[-140px]" />
      <div className="bg-orb w-[520px] h-[520px] bg-cyan-400/20 bottom-[-180px] right-[-100px]" style={{ animationDelay: "1s" }} />

      {/* nav */}
      <header className="relative z-10 max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
          <span className="font-display font-bold tracking-wider text-white">
            MADE SUPER AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <span className="px-4 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              Sign in
            </span>
          </Link>
          <Link href="/sign-up">
            <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-[0_0_18px_rgba(91,33,182,0.5)] transition-all cursor-pointer">
              Get started
            </span>
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 pt-10 md:pt-16 pb-16 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-center gap-2.5 mb-8 text-[11px] font-mono uppercase tracking-[0.2em]"
        >
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-400/30 bg-green-400/10 text-green-300">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" /> System Online
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            <Cpu className="w-3 h-3" /> Neural Core Active
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/15 text-primary">
            <ShieldCheck className="w-3 h-3" /> Autonomous Mode
          </span>
        </motion.div>

        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="w-40 h-40 md:w-52 md:h-52 mb-6 relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute inset-[-12%] border border-primary/30 rounded-full animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-[-28%] border border-cyan-400/20 rounded-full animate-[spin_18s_linear_infinite_reverse]" />
          <img
            src={mascotImg}
            alt="Made Super AI agent"
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_16px_44px_rgba(124,58,237,0.65)]"
            draggable={false}
          />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-display font-extrabold mb-4 tracking-tight bg-gradient-to-r from-white via-primary to-cyan-300 bg-clip-text text-transparent">
          Your AI Super Agent
        </h1>
        <p className="text-base md:text-lg text-slate-300 max-w-xl font-medium mb-9">
          It doesn't just chat — it{" "}
          <span className="text-cyan-300 font-semibold">builds, ships, and runs</span>{" "}
          things for you. Apps, videos, social content, and more.
        </p>

        <div className="flex items-center justify-center mb-14">
          <Link href="/sign-up">
            <span className="inline-flex items-center justify-center gap-2 h-12 px-12 sm:px-16 md:px-24 rounded-xl font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(91,33,182,0.5)] transition-all cursor-pointer">
              Start now <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* capability matrix */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl w-full">
          {CAPABILITIES.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="group flex items-center gap-3 p-3 md:p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm text-left hover:border-primary/40 hover:bg-primary/[0.06] transition-all"
            >
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/30 to-cyan-400/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <c.icon className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{c.label}</div>
                <div className="text-[11px] text-slate-400 truncate">{c.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* product showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3">
            One agent. Every tool.
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            See what your AI super agent can build, create, and run for you.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
          {SHOWCASE.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08 }}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-primary/40 transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070711] via-[#070711]/30 to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/30 to-cyan-400/20 border border-white/10 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-cyan-300" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">{s.title}</h3>
                </div>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* pricing */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3">
            Simple, premium pricing
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Unlock the full agent and every tool. Cancel anytime.
          </p>
        </div>
        <PricingPlans />
        <div className="text-center mt-10">
          <Link href="/pricing">
            <span className="inline-flex items-center gap-2 h-12 px-7 rounded-xl font-semibold border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer">
              <Sparkles className="w-4 h-4" /> Compare all plans
            </span>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-[11px] text-white/30">
          © {new Date().getFullYear()} MadeTVProducts. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
