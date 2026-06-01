import { Link } from "wouter";
import { useAuth } from "@clerk/react";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { PricingPlans } from "@/components/PricingPlans";
import { useMe } from "@/hooks/useMe";

export function PricingPage() {
  const { isSignedIn } = useAuth();
  const { data: me } = useMe();

  return (
    <div className="min-h-[100dvh] w-full bg-[#070711] relative overflow-hidden">
      {/* ambient orbs */}
      <div className="bg-orb w-[600px] h-[600px] bg-primary/20 top-[-160px] left-[-140px]" />
      <div className="bg-orb w-[500px] h-[500px] bg-cyan-400/15 bottom-[-160px] right-[-100px]" style={{ animationDelay: "1s" }} />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.35) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at top, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at top, black 20%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-5 py-8 md:py-14">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <Link href={isSignedIn ? "/account" : "/"}>
            <span className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
            <span className="font-display font-bold tracking-wider text-white">
              MADE SUPER AI
            </span>
          </div>
        </div>

        <div className="text-center mb-8 md:mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/15 text-primary text-[11px] font-mono uppercase tracking-[0.2em] mb-4 md:mb-5">
            <ShieldCheck className="w-3 h-3" /> Unlock the full agent
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white via-primary to-cyan-300 bg-clip-text text-transparent mb-3 md:mb-4">
            Choose your plan
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto px-2">
            Pick a plan to unlock the App Builder, Video Studio, Social Hub, and
            System Tools — everything your AI super agent can build and run.
          </p>
        </div>

        <PricingPlans currentTier={me?.tier} />

        <p className="text-center text-xs text-slate-500 mt-10">
          Secure checkout powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
