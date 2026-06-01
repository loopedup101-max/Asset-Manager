import { useLocation } from "wouter";
import { useMe } from "@/hooks/useMe";
import { useToast } from "@/hooks/use-toast";

/**
 * Gate a tool's *action* behind an active plan. Any signed-in user can open and
 * see a tool page, but actually running it (generating, building, posting, etc.)
 * requires a subscription. Call `requirePlan()` at the top of an action handler:
 * if the user isn't entitled it shows an upgrade toast, sends them to pricing,
 * and returns false so the caller can bail out. The free "Ask Me Anything" chat
 * is the only feature that consumes usage credits — tools never do.
 */
export function usePaidAction() {
  const { data } = useMe();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const entitled = data?.entitled ?? false;

  const requirePlan = (): boolean => {
    if (entitled) return true;
    toast({
      title: "Upgrade to use this tool",
      description:
        "Pick a plan to run it. The Ask Me Anything chat always stays free.",
    });
    setLocation("/pricing");
    return false;
  };

  return { entitled, requirePlan };
}
