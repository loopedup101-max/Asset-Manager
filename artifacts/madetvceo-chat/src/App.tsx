import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
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
import { Loader2 } from "lucide-react";
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
import { UpgradeWall } from "@/components/UpgradeWall";
import { useMe } from "@/hooks/useMe";
import { ChatPage } from "@/pages/chat";
import { SettingsPage } from "@/pages/settings";
import { SocialPage } from "@/pages/social";
import { ToolsPage } from "@/pages/tools";
import { StudioPage } from "@/pages/studio";
import { BuilderPage } from "@/pages/builder";
import { TermsPage } from "@/pages/terms";
import { PrivacyPage } from "@/pages/privacy";
import { LandingPage } from "@/pages/landing";
import { PricingPage } from "@/pages/pricing";
import { AccountPage } from "@/pages/account";
import NotFound from "@/pages/not-found";

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

function LoaderScreen() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#070711]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

// A paid tool: signed-in users see it, but without an active plan they get an
// upgrade wall instead of the tool. The free chat always stays available.
function PaidRoute({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <RequireSignIn>
      <AppLayout>
        <PaidGate title={title} description={description}>
          {children}
        </PaidGate>
      </AppLayout>
    </RequireSignIn>
  );
}

function PaidGate({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const { data, isLoading, isError } = useMe();
  if (isLoading || (!data && !isError)) return <LoaderScreen />;
  if (data?.entitled) return <>{children}</>;
  return <UpgradeWall title={title} description={description} />;
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
        <TooltipProvider>
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
                <PaidRoute
                  title="Social Hub"
                  description="Auto-post and run all your social accounts from one place — your AI agent writes, schedules, and publishes everywhere."
                >
                  <SocialPage />
                </PaidRoute>
              )}
            </Route>
            <Route path="/builder">
              {() => (
                <PaidRoute
                  title="App Builder"
                  description="Describe an app and your agent builds and ships a full-stack, deployable product for you."
                >
                  <BuilderPage />
                </PaidRoute>
              )}
            </Route>
            <Route path="/studio">
              {() => (
                <PaidRoute
                  title="Video Studio"
                  description="Go from script to finished, ready-to-upload videos — your agent handles the whole pipeline."
                >
                  <StudioPage />
                </PaidRoute>
              )}
            </Route>
            <Route path="/tools">
              {() => (
                <PaidRoute
                  title="System Tools"
                  description="Advanced automation and power tools for your AI agent to run any task end to end."
                >
                  <ToolsPage />
                </PaidRoute>
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
