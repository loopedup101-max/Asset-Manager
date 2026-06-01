import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/chat/sidebar";
import { Ticker } from "@/components/Ticker";
import { Mascot } from "@/components/Mascot";
import { ChatPage } from "@/pages/chat";
import { SettingsPage } from "@/pages/settings";
import { SocialPage } from "@/pages/social";
import { ToolsPage } from "@/pages/tools";
import { StudioPage } from "@/pages/studio";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
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

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ChatPage} />
        <Route path="/c/:id" component={ChatPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/social" component={SocialPage} />
        <Route path="/tools" component={ToolsPage} />
        <Route path="/studio" component={StudioPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
