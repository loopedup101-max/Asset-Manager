import { AlertTriangle, Info, Shield, Scale, Activity, MessageSquare, ListTodo } from "lucide-react";
import { Sidebar } from "@/components/chat/sidebar";
import { useHealthCheck, useGetStatsSummary } from "@workspace/api-client-react";

export function SettingsPage() {
  const { data: health } = useHealthCheck();
  const { data: stats } = useGetStatsSummary();

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#070711] relative">
      <div className="md:hidden p-4 border-b border-white/10 flex items-center bg-sidebar shrink-0 text-white">
        <Sidebar isMobile />
        <span className="ml-4 font-display font-bold">Settings</span>
      </div>

      <div className="bg-orb w-[500px] h-[500px] bg-primary/20 top-[-140px] left-[-120px]" />
      <div className="bg-orb w-[420px] h-[420px] bg-cyan-400/15 bottom-[-160px] right-[-80px]" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-4xl mx-auto w-full p-6 md:p-12 space-y-8">
        <h1 className="text-4xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white via-primary to-cyan-300 bg-clip-text text-transparent">System Settings</h1>

        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 flex gap-5 text-amber-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
          <AlertTriangle className="w-10 h-10 shrink-0 text-amber-300 mt-1 relative z-10 drop-shadow-sm" />
          <div className="relative z-10">
            <h3 className="font-bold text-amber-100 mb-2 text-lg">AI Use Warning</h3>
            <p className="text-sm leading-relaxed font-medium">
              AI responses may be inaccurate. Do not rely on this AI for legal, medical, financial, or safety-critical decisions. Always verify with qualified professionals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500 opacity-80" />
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/30 to-cyan-400/20 border border-white/10 text-cyan-300">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-white">{stats?.totalMessages ?? 0}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-80" />
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/30 to-cyan-400/20 border border-white/10 text-cyan-300">
                <ListTodo className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Conversations</p>
                <p className="text-3xl font-bold text-white">{stats?.totalConversations ?? 0}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-primary opacity-80" />
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/30 to-cyan-400/20 border border-white/10 text-cyan-300">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Today</p>
                <p className="text-3xl font-bold text-white">{stats?.todayMessages ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-[0_0_40px_rgba(124,58,237,0.12)]">
              <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 px-8 py-5 border-b border-white/10 flex items-center gap-4">
                <Scale className="w-6 h-6 text-cyan-300" />
                <h2 className="text-2xl font-display font-bold text-white">Terms & Conditions</h2>
              </div>
              <div className="p-8 text-sm text-slate-400 space-y-6 leading-relaxed">
                <p><strong className="text-white text-base block mb-1">1. Acceptance of Terms</strong>By using Made Super AI Agent, you agree to these Terms. If you do not agree, do not use this application.</p>
                <p><strong className="text-white text-base block mb-1">2. AI Disclaimer</strong>Responses from the AI are not professional advice. We make no guarantees about accuracy or completeness.</p>
                <p><strong className="text-white text-base block mb-1">3. Data Usage</strong>Your conversations may be processed to improve the service. Do not share passwords or confidential information.</p>
                <p><strong className="text-white text-base block mb-1">4. Prohibited Uses</strong>You may not use this application to generate illegal, harmful, or abusive content.</p>
                <p><strong className="text-white text-base block mb-1">5. Limitation of Liability</strong>Made Super AI Agent and its creators are not liable for any damages arising from your use of the service.</p>
                <p><strong className="text-white text-base block mb-1">6. Governing Law</strong>These terms are governed by the laws of the jurisdiction in which the application is hosted.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
                <Info className="w-5 h-5 text-cyan-300" />
                <h3 className="font-bold text-lg text-white">App Info</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">App</span>
                  <span className="font-bold text-white">Made Super AI</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Version</span>
                  <span className="font-bold text-white">2.0.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Status</span>
                  <span className={`font-bold flex items-center gap-2 ${health?.status === "ok" ? "text-emerald-400" : "text-slate-400"}`}>
                    {health?.status === "ok" && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    {health?.status === "ok" ? "Online" : "Checking..."}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary/30 to-blue-600/20 backdrop-blur-sm p-6 shadow-[0_0_40px_rgba(124,58,237,0.12)] text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <Shield className="w-5 h-5 text-cyan-300" />
                <h3 className="font-bold text-lg text-white">Privacy Secured</h3>
              </div>
              <p className="text-sm text-slate-300 relative z-10 leading-relaxed font-medium">
                Your data is stored securely. We do not sell or share your conversations with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
