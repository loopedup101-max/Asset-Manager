import mascotImg from "@/assets/mascot.png";

export function Mascot() {
  return (
    <div className="pointer-events-none fixed bottom-0 right-2 z-40 hidden md:block select-none">
      <img
        src={mascotImg}
        alt="Made Super AI agent"
        className="w-16 lg:w-20 drop-shadow-[0_8px_20px_rgba(76,29,149,0.35)] animate-float"
        draggable={false}
      />
    </div>
  );
}
