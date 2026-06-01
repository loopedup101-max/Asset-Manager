import { AlertTriangle, Info, Shield, Scale, Activity, MessageSquare, ListTodo } from "lucide-react";
import { Sidebar } from "@/components/chat/sidebar";
import { useHealthCheck, useGetStatsSummary } from "@workspace/api-client-react";

export function SettingsPage() {
  const { data: health } = useHealthCheck();
  const { data: stats } = useGetStatsSummary();

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/50">
      <div className="md:hidden p-4 border-b flex items-center bg-background shrink-0">
        <Sidebar isMobile />
        <span className="ml-4 font-medium">Settings & Terms</span>
      </div>

      <div className="max-w-4xl mx-auto w-full p-6 md:p-12 space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your experience and read our policies.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4 text-amber-900 shadow-sm">
          <AlertTriangle className="w-8 h-8 shrink-0 text-amber-600 mt-1" />
          <div>
            <h3 className="font-semibold text-lg text-amber-800 mb-1">AI Use Warning</h3>
            <p className="leading-relaxed">
              AI responses may be inaccurate. Do not rely on this AI for legal, medical, financial, or safety-critical decisions. Always verify important information with qualified professionals.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-semibold">{stats?.totalMessages || 0}</p>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversations</p>
              <p className="text-2xl font-semibold">{stats?.totalConversations || 0}</p>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages Today</p>
              <p className="text-2xl font-semibold">{stats?.todayMessages || 0}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <Scale className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-display font-semibold">Terms & Conditions</h2>
              </div>
              
              <div className="prose prose-sm max-w-none text-slate-600 space-y-4">
                <p><strong>1. Acceptance of Terms:</strong> By accessing and using Made Super AI Agent, you agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using the application.</p>
                
                <p><strong>2. AI Disclaimer:</strong> The AI provided is an advanced experimental tool. It is not infallible and its outputs do not constitute professional advice. We make no representations or warranties regarding the accuracy or completeness of the information provided.</p>

                <p><strong>3. Data Usage:</strong> Your conversations may be processed to improve the service. Do not share sensitive personal information, passwords, or confidential trade secrets in your prompts.</p>

                <p><strong>4. Prohibited Uses:</strong> You may not use this application to generate illegal, harmful, or abusive content. Reverse engineering or attempting to manipulate the underlying AI models is strictly prohibited.</p>

                <p><strong>5. Limitation of Liability:</strong> In no event shall Made Super AI Agent or its creators be liable for any indirect, consequential, or special damages arising out of your use or inability to use the service.</p>

                <p><strong>6. Governing Law:</strong> These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the application is hosted.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">App Info</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-emerald-600">{health?.status || "Checking..."}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theme</span>
                  <span className="font-medium">Bright</span>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Privacy</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data is stored securely. We prioritize transparency and user control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
