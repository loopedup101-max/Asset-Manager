const CAPABILITIES = [
  { icon: "⚡", text: "Build REST APIs" },
  { icon: "🏗️", text: "Design Databases" },
  { icon: "🌐", text: "Set Up Custom Domains" },
  { icon: "💻", text: "Write Full-Stack Apps" },
  { icon: "🔌", text: "Integrate Third-Party APIs" },
  { icon: "🐛", text: "Debug Your Code" },
  { icon: "🚀", text: "Deploy to Production" },
  { icon: "🔐", text: "Implement Authentication" },
  { icon: "📊", text: "Build Dashboards" },
  { icon: "🤖", text: "Automate Workflows" },
  { icon: "🗄️", text: "Optimize SQL Queries" },
  { icon: "📱", text: "Build Mobile Apps" },
  { icon: "🔧", text: "Configure Dev Environments" },
  { icon: "📝", text: "Write Documentation" },
  { icon: "🧠", text: "Explain Complex Concepts" },
  { icon: "🎨", text: "Design UI Components" },
  { icon: "☁️", text: "Cloud Architecture" },
  { icon: "🔗", text: "Webhook Integrations" },
  { icon: "📦", text: "Package & Publish Code" },
  { icon: "🛡️", text: "Security Best Practices" },
];

const DOUBLED = [...CAPABILITIES, ...CAPABILITIES];

export function Ticker() {
  return (
    <div
      className="w-full overflow-hidden shrink-0 border-b"
      style={{
        background: "linear-gradient(90deg, hsl(250 85% 55%) 0%, #2563eb 100%)",
        height: "36px",
      }}
      data-testid="ticker-bar"
    >
      <div className="ticker-track h-full items-center flex">
        {DOUBLED.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 px-5 whitespace-nowrap text-white text-sm font-medium"
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.text}</span>
            <span className="ml-4 text-white/40 text-xs">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
