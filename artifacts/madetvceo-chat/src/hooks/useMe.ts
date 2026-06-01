import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";

export type PlanTier = "owner" | "business" | "pro" | "basic" | "free";

export type Usage = {
  used: number;
  limit: number | null;
  remaining: number | null;
  unlimited: boolean;
};

export type Trial = {
  startedAt: string | null;
  totalSeconds: number;
  secondsRemaining: number;
  expired: boolean;
  nextResetAt: string | null;
};

export type Me = {
  user: { id: string; email: string | null; role: string };
  entitled: boolean;
  plan: "owner" | "paid" | null;
  tier: PlanTier | null;
  status: string | null;
  subscription: unknown;
  usage: Usage;
  trial: Trial | null;
};

export function useMe() {
  const { isSignedIn, isLoaded } = useAuth();
  return useQuery<Me>({
    queryKey: ["me"],
    enabled: isLoaded && Boolean(isSignedIn),
    staleTime: 30_000,
    queryFn: async () => {
      const res = await fetch("/api/me", {
        headers: { accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Failed to load account (${res.status})`);
      }
      return (await res.json()) as Me;
    },
  });
}
