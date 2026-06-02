const CAPABILITIES = [
  { icon: "🧱", text: "Build Working Web Apps" },
  { icon: "⚡", text: "Write REST API Code" },
  { icon: "🎬", text: "Create Videos with AI" },
  { icon: "🏗️", text: "Design Database Schemas" },
  { icon: "📲", text: "Write Social Media Posts" },
  { icon: "🎥", text: "Generate Video Scripts" },
  { icon: "💻", text: "Write Full-Stack Code" },
  { icon: "💬", text: "Draft Comment Replies" },
  { icon: "📅", text: "Write Posts for Any Platform" },
  { icon: "🐛", text: "Debug Your Code" },
  { icon: "🤳", text: "Plan Your Content" },
  { icon: "🎭", text: "Generate AI Content" },
  { icon: "🔐", text: "Write Authentication Code" },
  { icon: "📊", text: "Build Dashboards" },
  { icon: "🎵", text: "Write Reels & Shorts Scripts" },
  { icon: "🤖", text: "Get Step-by-Step Help" },
  { icon: "🗄️", text: "Optimize SQL Queries" },
  { icon: "📱", text: "Build Web Apps" },
  { icon: "🌟", text: "Brainstorm Content Ideas" },
  { icon: "🔧", text: "Configure Dev Environments" },
  { icon: "🏆", text: "Build Your Brand" },
  { icon: "📝", text: "Write Documentation" },
  { icon: "🧠", text: "Answer Any Question" },
  { icon: "🎨", text: "Design UI Components" },
  { icon: "☁️", text: "Plan Cloud Architecture" },
  { icon: "📸", text: "Generate Social Captions" },
  { icon: "📦", text: "Write Production Code" },
  { icon: "🎤", text: "Write Podcast Scripts" },
  { icon: "🛡️", text: "Security Best Practices" },
  { icon: "✍️", text: "Write Marketing Copy" },
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
