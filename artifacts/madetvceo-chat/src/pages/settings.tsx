import { Info, Shield, Scale, Activity, MessageSquare, ListTodo } from "lucide-react";
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

      <div className="bg-orb w-[360px] h-[360px] bg-primary/15 top-[-120px] left-[-100px]" />

      <div className="relative z-10 max-w-3xl mx-auto w-full p-5 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-white">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Your account activity and app information.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-cyan-300 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium text-slate-400">Messages</span>
            </div>
            <p className="text-xl font-bold text-white">{stats?.totalMessages ?? 0}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-cyan-300 mb-2">
              <ListTodo className="w-4 h-4" />
              <span className="text-xs font-medium text-slate-400">Chats</span>
            </div>
            <p className="text-xl font-bold text-white">{stats?.totalConversations ?? 0}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-cyan-300 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium text-slate-400">Today</span>
            </div>
            <p className="text-xl font-bold text-white">{stats?.todayMessages ?? 0}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-cyan-300" />
              <h3 className="font-semibold text-sm text-white">App Info</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">App</span>
                <span className="font-medium text-white">Made Super AI</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Version</span>
                <span className="font-medium text-white">2.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className={`font-medium flex items-center gap-1.5 ${health?.status === "ok" ? "text-emerald-400" : "text-slate-400"}`}>
                  {health?.status === "ok" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  {health?.status === "ok" ? "Online" : "Checking..."}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-cyan-300" />
              <h3 className="font-semibold text-sm text-white">Privacy</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your data is stored securely. We do not sell or share your conversations with third parties.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-300" />
            <h2 className="text-sm font-semibold text-white">Terms &amp; Conditions</h2>
          </div>
          <div className="p-5 text-sm text-slate-400 space-y-3 leading-relaxed">
            <p><strong className="text-slate-200 font-medium">1. Acceptance of Terms.</strong> By using Made Super AI Agent, you agree to these Terms. If you do not agree, do not use this application.</p>
            <p><strong className="text-slate-200 font-medium">2. AI Disclaimer.</strong> Responses from the AI are not professional advice. We make no guarantees about accuracy or completeness.</p>
            <p><strong className="text-slate-200 font-medium">3. Data Usage.</strong> Your conversations may be processed to improve the service. Do not share passwords or confidential information.</p>
            <p><strong className="text-slate-200 font-medium">4. Prohibited Uses.</strong> You may not use this application to generate illegal, harmful, or abusive content.</p>
            <p><strong className="text-slate-200 font-medium">5. Limitation of Liability.</strong> Made Super AI Agent and its creators are not liable for any damages arising from your use of the service.</p>
            <p><strong className="text-slate-200 font-medium">6. Governing Law.</strong> These terms are governed by the laws of the jurisdiction in which the application is hosted.</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed pt-1 pb-4">
          Note: AI responses may be inaccurate. Please don't rely on this AI for legal, medical, financial, or
          safety-critical decisions — always verify with a qualified professional.
        </p>
      </div>
    </div>
  );
}
