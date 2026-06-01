import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useLocation } from "wouter";
import { Check, Zap, Rocket, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Price = {
  id: string;
  unit_amount: number | null;
  currency: string;
  recurring: unknown;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  prices: Price[];
};

type TierKey = "pro" | "business";

const PLAN_COPY: Record<
  TierKey,
  {
    tagline: string;
    icon: typeof Zap;
    highlight?: boolean;
    features: string[];
  }
> = {
  pro: {
    tagline: "For creators shipping fast",
    icon: Zap,
    features: [
      "Unlimited AI agent chat",
      "App Builder access",
      "Video Studio",
      "Social Hub",
      "System Tools",
      "Standard support",
    ],
  },
  business: {
    tagline: "For teams that scale",
    icon: Rocket,
    highlight: true,
    features: [
      "Everything in Pro",
      "Priority AI processing",
      "Advanced automation",
      "Higher usage limits",
      "Early access to new tools",
      "Priority support",
    ],
  },
};

function tierKey(name: string): TierKey {
  return /business/i.test(name) ? "business" : "pro";
}

function formatPrice(amount: number | null, currency: string): string {
  if (amount == null) return "—";
  const symbol = currency?.toLowerCase() === "usd" ? "$" : "";
  return `${symbol}${(amount / 100).toFixed(0)}`;
}

export function PricingPlans({
  currentPlan,
}: {
  currentPlan?: "owner" | "paid" | null;
}) {
  const { isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products-with-prices"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/products-with-prices", {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load plans");
      const json = (await res.json()) as { data: Product[] };
      return json.data ?? [];
    },
  });

  async function handleSelect(priceId: string) {
    setError(null);
    if (!isSignedIn) {
      setLocation("/sign-up");
      return;
    }
    setLoadingId(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const out = (await res.json()) as { url?: string; error?: string };
      if (res.ok && out.url) {
        window.location.href = out.url;
        return;
      }
      setError(out.error ?? "Could not start checkout. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    }
    setLoadingId(null);
  }

  const products = (data ?? [])
    .filter((p) => p.active && p.prices.length > 0)
    .sort(
      (a, b) =>
        (a.prices[0]?.unit_amount ?? 0) - (b.prices[0]?.unit_amount ?? 0),
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-3 text-primary" />
        Loading plans…
      </div>
    );
  }

  if (isError || products.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 text-center">
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">Plans are being set up</p>
        <p className="text-sm text-slate-400">
          Subscription plans will appear here shortly. Check back in a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mx-auto max-w-2xl mb-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300 text-center">
          {error}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {products.map((product) => {
          const key = tierKey(product.name);
          const copy = PLAN_COPY[key];
          const price = product.prices[0];
          const Icon = copy.icon;
          const isLoadingThis = loadingId === price.id;
          return (
            <div
              key={product.id}
              className={cn(
                "relative flex flex-col rounded-3xl border p-7 backdrop-blur-sm transition-all",
                copy.highlight
                  ? "border-primary/50 bg-gradient-to-b from-primary/[0.12] to-cyan-400/[0.04] shadow-[0_0_40px_rgba(124,58,237,0.25)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20",
              )}
            >
              {copy.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-blue-600 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
                  Most Popular
                </span>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/40 to-cyan-400/20 border border-white/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <div className="text-lg font-display font-bold text-white">
                    {product.name}
                  </div>
                  <div className="text-xs text-slate-400">{copy.tagline}</div>
                </div>
              </div>

              <div className="flex items-end gap-1 mb-6">
                <span className="text-5xl font-display font-extrabold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  {formatPrice(price.unit_amount, price.currency)}
                </span>
                <span className="text-slate-400 mb-2 text-sm">/month</span>
              </div>

              <ul className="space-y-3 mb-7 flex-1">
                {copy.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-slate-300"
                  >
                    <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-cyan-400/15 flex items-center justify-center">
                      <Check className="w-3 h-3 text-cyan-300" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isLoadingThis || currentPlan === "paid"}
                onClick={() => handleSelect(price.id)}
                className={cn(
                  "w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60",
                  copy.highlight
                    ? "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(91,33,182,0.5)]"
                    : "border border-white/15 bg-white/5 hover:bg-white/10 text-white",
                )}
              >
                {isLoadingThis ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Redirecting…
                  </>
                ) : currentPlan === "paid" ? (
                  "Current plan"
                ) : isSignedIn ? (
                  "Subscribe"
                ) : (
                  "Get started"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
