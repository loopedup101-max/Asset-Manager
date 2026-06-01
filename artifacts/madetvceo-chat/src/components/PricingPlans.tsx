import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useLocation } from "wouter";
import { Check, Zap, Rocket, Loader2, Sparkles, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanTier } from "@/hooks/useMe";

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

type TierKey = "basic" | "pro" | "business";

const PLAN_COPY: Record<
  TierKey,
  {
    tagline: string;
    icon: typeof Zap;
    highlight?: boolean;
    features: string[];
  }
> = {
  basic: {
    tagline: "For getting started",
    icon: Gauge,
    features: [
      "Full app access",
      "100 AI actions / month",
      "App Builder, Video Studio & Social Hub",
      "System Tools",
      "Upgrade anytime",
    ],
  },
  pro: {
    tagline: "For creators shipping fast",
    icon: Zap,
    highlight: true,
    features: [
      "Everything in Basic",
      "Unlimited AI actions",
      "Priority generation",
      "Standard support",
    ],
  },
  business: {
    tagline: "For teams that scale",
    icon: Rocket,
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
  if (/business/i.test(name)) return "business";
  if (/basic/i.test(name)) return "basic";
  return "pro";
}

function formatPrice(amount: number | null, currency: string): string {
  if (amount == null) return "—";
  const symbol = currency?.toLowerCase() === "usd" ? "$" : "";
  const dollars = amount / 100;
  const value = Number.isInteger(dollars)
    ? dollars.toFixed(0)
    : dollars.toFixed(2);
  return `${symbol}${value}`;
}

export function PricingPlans({
  currentTier,
}: {
  currentTier?: PlanTier | null;
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

  const hasSub =
    currentTier === "basic" ||
    currentTier === "pro" ||
    currentTier === "business";

  async function handleSelect(priceId: string, isCurrent: boolean) {
    setError(null);
    if (isCurrent) return;
    if (!isSignedIn) {
      setLocation("/sign-up");
      return;
    }
    setLoadingId(priceId);
    try {
      // Existing subscribers change plans in the Stripe billing portal so we
      // never create a second subscription. New users go through checkout.
      if (hasSub) {
        const res = await fetch("/api/stripe/portal", {
          method: "POST",
          headers: { "content-type": "application/json" },
        });
        const out = (await res.json()) as { url?: string; error?: string };
        if (res.ok && out.url) {
          window.location.href = out.url;
          return;
        }
        setError(out.error ?? "Could not open billing portal. Please try again.");
      } else {
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
      }
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

  const currentAmount =
    products.find((p) => tierKey(p.name) === currentTier)?.prices[0]
      ?.unit_amount ?? null;

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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
        {products.map((product) => {
          const key = tierKey(product.name);
          const copy = PLAN_COPY[key];
          const price = product.prices[0];
          const Icon = copy.icon;
          const isLoadingThis = loadingId === price.id;
          const isCurrent = currentTier === key;
          const isOwner = currentTier === "owner";
          const amount = price.unit_amount ?? 0;

          let label: string;
          if (isOwner) label = "Included";
          else if (isCurrent) label = "Current plan";
          else if (hasSub)
            label =
              currentAmount != null && amount > currentAmount
                ? "Upgrade"
                : "Switch plan";
          else label = isSignedIn ? "Subscribe" : "Get started";

          const disabled = isLoadingThis || isCurrent || isOwner;

          return (
            <div
              key={product.id}
              className={cn(
                "relative flex flex-col rounded-3xl border p-6 md:p-7 backdrop-blur-sm transition-all",
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

              <div className="flex items-end gap-1 mb-5 md:mb-6">
                <span className="text-4xl md:text-5xl font-display font-extrabold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  {formatPrice(price.unit_amount, price.currency)}
                </span>
                <span className="text-slate-400 mb-2 text-sm">/month</span>
              </div>

              <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-7 flex-1">
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
                disabled={disabled}
                onClick={() => handleSelect(price.id, isCurrent)}
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
                ) : (
                  label
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
