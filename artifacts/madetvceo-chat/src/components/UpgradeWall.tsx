import { Link } from "wouter";
import { Lock, Sparkles, MessageSquare, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAID_PERKS = [
  "Unlimited app, video & social tools",
  "More AI actions every month",
  "Priority autonomous agent runs",
];

/**
 * Shown in place of a paid tool when a signed-in user has no active plan. They
 * can still SEE what the tool does, but are prompted to upgrade. The free
 * "Ask Me Anything" chat stays one click away.
 */
export function UpgradeWall({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center relative overflow-hidden bg-[#070711]">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.35) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 75%)",
        }}
      />
      <div className="bg-orb w-[500px] h-[500px] bg-primary/25 top-[-120px] left-[-100px]" />
      <div className="bg-orb w-[420px] h-[420px] bg-cyan-400/20 bottom-[-140px] right-[-70px]" />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-8 md:p-10 shadow-[0_0_60px_rgba(124,58,237,0.25)]">
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/40 to-cyan-400/20 border border-white/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-cyan-300" />
        </div>

        <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5" /> Paid tool
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-3 tracking-tight bg-gradient-to-r from-white via-primary to-cyan-300 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-slate-300 font-medium mb-7 max-w-md mx-auto">
          {description}
        </p>

        <ul className="text-left space-y-2.5 mb-8 max-w-sm mx-auto">
          {PAID_PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-sm text-slate-200">
              <span className="w-5 h-5 shrink-0 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
              {perk}
            </li>
          ))}
        </ul>

        <Link href="/pricing">
          <Button className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(91,33,182,0.5)] border-0">
            <Sparkles className="w-5 h-5 mr-1.5" /> See plans & upgrade
          </Button>
        </Link>

        <Link href="/">
          <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">
            <MessageSquare className="w-4 h-4" /> Keep using the free chat
          </button>
        </Link>
      </div>
    </div>
  );
}
