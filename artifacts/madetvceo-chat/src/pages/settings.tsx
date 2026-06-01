import { AlertTriangle, Info, Shield, Scale, Activity, MessageSquare, ListTodo } from "lucide-react";
import { Sidebar } from "@/components/chat/sidebar";
import { useHealthCheck, useGetStatsSummary } from "@workspace/api-client-react";

export function SettingsPage() {
  const { data: health } = useHealthCheck();
  const { data: stats } = useGetStatsSummary();

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/50">
      <div className="md:hidden p-4 border-b flex items-center bg-sidebar shrink-0 text-white">
        <Sidebar isMobile />
        <span className="ml-4 font-display font-bold">Settings</span>
      </div>

      <div className="max-w-4xl mx-auto w-full p-6 md:p-12 space-y-8">
        <h1 className="text-4xl font-display font-extrabold gradient-text tracking-tight">System Settings</h1>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500 border-y border-r border-amber-200/50 rounded-xl p-6 flex gap-5 text-amber-900 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
          <AlertTriangle className="w-10 h-10 shrink-0 text-amber-600 mt-1 relative z-10 drop-shadow-sm" />
          <div className="relative z-10">
            <h3 className="font-bold text-amber-800 mb-2 text-lg">AI Use Warning</h3>
            <p className="text-sm leading-relaxed font-medium">
              AI responses may be inaccurate. Do not rely on this AI for legal, medical, financial, or safety-critical decisions. Always verify with qualified professionals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500 opacity-80" />
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalMessages ?? 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-80" />
            <div className="flex items-center gap-5">
              <div className="p-4 bg-cyan-500/10 rounded-xl text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                <ListTodo className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Conversations</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalConversations ?? 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-primary opacity-80" />
            <div className="flex items-center gap-5">
              <div className="p-4 bg-indigo-500/10 rounded-xl text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Today</p>
                <p className="text-3xl font-bold text-foreground">{stats?.todayMessages ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white border border-border rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 px-8 py-5 border-b border-border flex items-center gap-4">
                <Scale className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-display font-bold">Terms & Conditions</h2>
              </div>
              <div className="p-8 text-sm text-slate-600 space-y-6 leading-relaxed">
                <p><strong className="text-foreground text-base block mb-1">1. Acceptance of Terms</strong>By using Made Super AI Agent, you agree to these Terms. If you do not agree, do not use this application.</p>
                <p><strong className="text-foreground text-base block mb-1">2. AI Disclaimer</strong>Responses from the AI are not professional advice. We make no guarantees about accuracy or completeness.</p>
                <p><strong className="text-foreground text-base block mb-1">3. Data Usage</strong>Your conversations may be processed to improve the service. Do not share passwords or confidential information.</p>
                <p><strong className="text-foreground text-base block mb-1">4. Prohibited Uses</strong>You may not use this application to generate illegal, harmful, or abusive content.</p>
                <p><strong className="text-foreground text-base block mb-1">5. Limitation of Liability</strong>Made Super AI Agent and its creators are not liable for any damages arising from your use of the service.</p>
                <p><strong className="text-foreground text-base block mb-1">6. Governing Law</strong>These terms are governed by the laws of the jurisdiction in which the application is hosted.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-border rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">App Info</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">App</span>
                  <span className="font-bold">Made Super AI</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Version</span>
                  <span className="font-bold">2.0.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Status</span>
                  <span className={`font-bold flex items-center gap-2 ${health?.status === "ok" ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {health?.status === "ok" && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                    {health?.status === "ok" ? "Online" : "Checking..."}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-6 shadow-lg text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <Shield className="w-5 h-5 text-white" />
                <h3 className="font-bold text-lg">Privacy Secured</h3>
              </div>
              <p className="text-sm text-white/90 relative z-10 leading-relaxed font-medium">
                Your data is stored securely. We do not sell or share your conversations with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}