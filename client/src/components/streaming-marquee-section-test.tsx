export default function StreamingMarqueeSection() {
  return (
    <div className="overflow-hidden relative">
      <div className="flex animate-marquee-left space-x-8 py-4">
        <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center">
          <span className="text-white">Test Logo 1</span>
        </div>
        <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center">
          <span className="text-white">Test Logo 2</span>
        </div>
        <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center">
          <span className="text-white">Test Logo 3</span>
        </div>
        <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center">
          <span className="text-white">Test Logo 1</span>
        </div>
        <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center">
          <span className="text-white">Test Logo 2</span>
        </div>
        <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center">
          <span className="text-white">Test Logo 3</span>
        </div>
      </div>
    </div>
  );
}
