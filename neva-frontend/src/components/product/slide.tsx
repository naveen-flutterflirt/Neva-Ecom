const marqueeItems = [
  'Pan-India Delivery',
  'Secure UPI Payments',
  'Fully customisable',
  'Whatshapp Support',
];

export default function MarqueeSlide() {
  return (
    <div className="relative my-0 py-2 sm:py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-full border border-violet-500/30 bg-[#080d1c] shadow-[0_0_30px_rgba(99,102,241,0.12)] backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_right,_rgba(168,85,247,0.18),transparent_32%)]" />

          <div className="marquee-track relative flex w-max min-w-full items-center gap-5 whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-200/90 sm:gap-7 sm:text-xs md:text-sm">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-5 sm:gap-7">
                <span>{item}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
