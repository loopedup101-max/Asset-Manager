import { Link } from "wouter";
import { Crown, Sparkles } from "lucide-react";

/**
 * Shown at the top of a paid tool page when a signed-in user has no active plan.
 * They can fully explore the tool ("see it all"); running an action prompts an
 * upgrade. The free "Ask Me Anything" chat stays available.
 */
export function PreviewBanner() {
  return (
    <div className="shrink-0 relative z-20 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center bg-gradient-to-r from-primary/25 via-primary/15 to-cyan-400/15 border-b border-primary/30">
      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white">
        <Crown className="w-4 h-4 text-amber-300" />
        Preview mode — upgrade to use this tool
      </span>
      <Link href="/pricing">
        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer">
          <Sparkles className="w-3.5 h-3.5" /> See plans &amp; upgrade
        </span>
      </Link>
    </div>
  );
}
