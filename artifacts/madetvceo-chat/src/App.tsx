import { lazy, Suspense, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
  useAuth,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import {
  Switch,
  Route,
  Redirect,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import {
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/chat/sidebar";
import { Ticker } from "@/components/Ticker";
import { Mascot } from "@/components/Mascot";
import { PreviewBanner } from "@/components/PreviewBanner";
import { useMe } from "@/hooks/useMe";
import { ChatPage } from "@/pages/chat";
import { LandingPage } from "@/pages/landing";
import NotFound from "@/pages/not-found";

// Heavy tool pages and secondary screens are split into their own chunks so the
// first load only downloads what's needed. They stream in on navigation.
const SettingsPage = lazy(() => import("@/pages/settings").then((m) => ({ default: m.SettingsPage })));
const SocialPage = lazy(() => import("@/pages/social").then((m) => ({ default: m.SocialPage })));
const EmailPage = lazy(() => import("@/pages/email").then((m) => ({ default: m.EmailPage })));
const ToolsPage = lazy(() => import("@/pages/tools").then((m) => ({ default: m.ToolsPage })));
const StudioPage = lazy(() => import("@/pages/studio").then((m) => ({ default: m.StudioPage })));
const BuilderPage = lazy(() => import("@/pages/builder").then((m) => ({ default: m.BuilderPage })));
const TermsPage = lazy(() => import("@/pages/terms").then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import("@/pages/privacy").then((m) => ({ default: m.PrivacyPage })));
const PricingPage = lazy(() => import("@/pages/pricing").then((m) => ({ default: m.PricingPage })));
const AccountPage = lazy(() => import("@/pages/account").then((m) => ({ default: m.AccountPage })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#070711]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

// REQUIRED — copy verbatim.
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// REQUIRED — copy verbatim. Empty in dev, auto-set in prod.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#7c3aed",
    colorForeground: "#f8fafc",
    colorMutedForeground: "#94a3b8",
    colorDanger: "#f87171",
    colorBackground: "#0b1020",
    colorInput: "#141a2e",
    colorInputForeground: "#f8fafc",
    colorNeutral: "#cbd5e1",
    fontFamily: "'Outfit', system-ui, sans-serif",
    borderRadius: "0.85rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-[#0b1020] border border-white/10 rounded-2xl w-[440px] max-w-full overflow-hidden shadow-[0_0_60px_rgba(124,58,237,0.25)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white",
    headerSubtitle: "text-slate-400",
    socialButtonsBlockButton:
      "border border-white/15 bg-white/5 hover:bg-white/10",
    socialButtonsBlockButtonText: "text-white",
    dividerText: "text-slate-500",
    dividerLine: "bg-white/10",
    formFieldLabel: "text-slate-300",
    formFieldInput:
      "bg-[#141a2e] border border-white/10 text-white",
    formButtonPrimary:
      "bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:opacity-90 text-white",
    footerActionLink: "text-cyan-300 hover:text-cyan-200",
    footerActionText: "text-slate-400",
    identityPreviewEditButton: "text-cyan-300",
    formFieldSuccessText: "text-green-400",
    formFieldErrorText: "text-red-400",
    alertText: "text-slate-200",
    otpCodeFieldInput: "bg-[#141a2e] border border-white/10 text-white",
    logoImage: "h-10",
    main: "gap-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#070711] px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#070711] px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full bg-background overflow-hidden">
      <Sidebar className="hidden md:flex w-72 shrink-0" />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Ticker />
        {children}
      </main>
      <Mascot />
    </div>
  );
}

// Signed-in only (any tier). Signed-out users go to the public landing.
function RequireSignIn({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
      <Show when="signed-in">{children}</Show>
    </>
  );
}

// A paid tool: ANY signed-in user can open and see the tool. Without an active
// plan they get a preview banner inviting them to upgrade, and the tool's
// actions prompt for a plan when used. The free chat always stays available.
function ToolRoute({ children }: { children: React.ReactNode }) {
  return (
    <RequireSignIn>
      <AppLayout>
        <ToolPreviewGate>{children}</ToolPreviewGate>
      </AppLayout>
    </RequireSignIn>
  );
}

function ToolPreviewGate({ children }: { children: React.ReactNode }) {
  const { data } = useMe();
  const showUpgrade = !!data && !data.entitled;
  return (
    <>
      {showUpgrade && <PreviewBanner />}
      {children}
    </>
  );
}

// Home: public landing for signed-out, the free chat for any signed-in user.
function HomeRoute() {
  return (
    <>
      <Show when="signed-out">
        <LandingPage />
      </Show>
      <Show when="signed-in">
        <AppLayout>
          <ChatPage />
        </AppLayout>
      </Show>
    </>
  );
}

// Account is reachable by any signed-in user (even without a subscription).
function AccountRoute() {
  return (
    <>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
      <Show when="signed-in">
        <AppLayout>
          <AccountPage />
        </AppLayout>
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

// Logs users out when they return in a BRAND-NEW browser session (i.e. they
// closed the browser and came back), while keeping multiple tabs of the SAME
// session signed in. sessionStorage is wiped when the browser closes, so a
// missing flag means "fresh session" — but before signing out we ask any other
// open tabs (via BroadcastChannel) whether a session is already alive.
const SESSION_FLAG = "app_browser_session";

function SessionOnlyAuthGuard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const decidedRef = useRef(false);

  // Persistent responder: reply "alive" to any newly-opened tab if this tab is
  // part of an active in-browser session.
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("app-session");
      channel.onmessage = (e) => {
        if (
          e.data === "ping" &&
          sessionStorage.getItem(SESSION_FLAG) === "1"
        ) {
          channel?.postMessage("alive");
        }
      };
    } catch {
      channel = null;
    }
    return () => channel?.close();
  }, []);

  // One-time decision once Clerk has loaded.
  useEffect(() => {
    if (!isLoaded || decidedRef.current) return;
    decidedRef.current = true;

    // Same tab continuing (a reload or in-app navigation) — leave them be.
    if (sessionStorage.getItem(SESSION_FLAG) === "1") return;

    let answered = false;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("app-session");
      channel.onmessage = (e) => {
        if (e.data === "alive") {
          answered = true;
          sessionStorage.setItem(SESSION_FLAG, "1");
        }
      };
      channel.postMessage("ping");
    } catch {
      channel = null;
    }

    const timer = setTimeout(() => {
      if (!answered) {
        // No other tab vouched for an active session → this is a fresh browser
        // session. Mark it active and sign out any lingering login.
        sessionStorage.setItem(SESSION_FLAG, "1");
        if (isSignedIn) void signOut();
      }
      channel?.close();
    }, 200);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, signOut]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your AI super agent",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Unlock your AI super agent",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <SessionOnlyAuthGuard />
        <TooltipProvider>
          <Suspense fallback={<PageFallback />}>
          <Switch>
            <Route path="/" component={HomeRoute} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/account" component={AccountRoute} />
            <Route path="/c/:id">
              {() => (
                <RequireSignIn>
                  <AppLayout>
                    <ChatPage />
                  </AppLayout>
                </RequireSignIn>
              )}
            </Route>
            <Route path="/social">
              {() => (
                <ToolRoute>
                  <SocialPage />
                </ToolRoute>
              )}
            </Route>
            <Route path="/email">
              {() => (
                <ToolRoute>
                  <EmailPage />
                </ToolRoute>
              )}
            </Route>
            <Route path="/builder">
              {() => (
                <ToolRoute>
                  <BuilderPage />
                </ToolRoute>
              )}
            </Route>
            <Route path="/studio">
              {() => (
                <ToolRoute>
                  <StudioPage />
                </ToolRoute>
              )}
            </Route>
            <Route path="/tools">
              {() => (
                <ToolRoute>
                  <ToolsPage />
                </ToolRoute>
              )}
            </Route>
            <Route path="/settings">
              {() => (
                <RequireSignIn>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </RequireSignIn>
              )}
            </Route>
            <Route path="/terms" component={TermsPage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route component={NotFound} />
          </Switch>
          </Suspense>
        </TooltipProvider>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
