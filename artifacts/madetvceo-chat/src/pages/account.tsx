import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Crown,
  CheckCircle2,
  CreditCard,
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useMe } from "@/hooks/useMe";

export function AccountPage() {
  const { user } = useUser();
  const { data: me, isLoading } = useMe();
  const queryClient = useQueryClient();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSubscribed, setJustSubscribed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setJustSubscribed(true);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [queryClient]);

  async function openPortal() {
    setError(null);
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const out = (await res.json()) as { url?: string; error?: string };
      if (res.ok && out.url) {
        window.location.href = out.url;
        return;
      }
      setError(out.error ?? "Could not open billing portal.");
    } catch {
      setError("Network error. Please try again.");
    }
    setPortalLoading(false);
  }

  const isOwner = me?.plan === "owner";
  const entitled = me?.entitled ?? false;
  const email = me?.user.email ?? user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <div className="flex-1 overflow-y-auto bg-[#070711] relative">
      <div className="bg-orb w-[460px] h-[460px] bg-primary/20 top-[-120px] right-[-80px]" />
      <div className="relative z-10 max-w-3xl mx-auto px-5 py-12 md:py-16">
        <div className="mb-10">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-300/80">
            Account
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mt-1">
            Your subscription
          </h1>
        </div>

        {justSubscribed && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-400/30 bg-green-400/10 px-5 py-4 text-green-200">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">
              You're all set — your subscription is active. Welcome aboard!
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* identity card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/40 to-cyan-400/20 border border-white/10 flex items-center justify-center text-xl font-display font-bold text-white">
              {(email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold truncate">{email}</div>
              <div className="text-sm text-slate-400">Signed in</div>
            </div>
          </div>
        </div>

        {/* plan status */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-3 text-primary" />
            Loading…
          </div>
        ) : isOwner ? (
          <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-400/[0.12] to-transparent p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-7 h-7 text-amber-300" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-1">
              Owner Access
            </h2>
            <p className="text-slate-300">
              You have free, unlimited access to everything. No subscription
              needed.
            </p>
          </div>
        ) : entitled ? (
          <div className="rounded-3xl border border-primary/40 bg-gradient-to-b from-primary/[0.12] to-transparent p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/40 to-cyan-400/20 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">
                  Subscription active
                </h2>
                <p className="text-sm text-slate-400 capitalize">
                  Status: {me?.status ?? "active"}
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-6">
              You have full access to the App Builder, Video Studio, Social Hub,
              and System Tools.
            </p>
            <button
              type="button"
              onClick={openPortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-semibold text-sm bg-white/5 border border-white/15 hover:bg-white/10 text-white transition-all disabled:opacity-60"
            >
              {portalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Manage billing
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-1">
              No active subscription
            </h2>
            <p className="text-slate-300 mb-6">
              Subscribe to unlock the App Builder, Video Studio, Social Hub, and
              System Tools.
            </p>
            <Link href="/pricing">
              <span className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(91,33,182,0.5)] transition-all cursor-pointer">
                View plans <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
