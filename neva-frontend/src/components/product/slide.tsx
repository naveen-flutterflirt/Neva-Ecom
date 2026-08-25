'use client';

import React from 'react';
import { Truck, ShieldCheck, Sparkles, MessageCircle, Box } from 'lucide-react';

const marqueeItems = [
  { text: 'Pan-India Express Delivery', icon: Truck, color: 'text-violet-500' },
  { text: 'Secure UPI & Card Payments', icon: ShieldCheck, color: 'text-emerald-500' },
  { text: 'Fully Customisable Prints', icon: Sparkles, color: 'text-amber-500' },
  { text: '24/7 WhatsApp Support', icon: MessageCircle, color: 'text-emerald-400' },
  { text: 'Premium 3D & Smart IoT', icon: Box, color: 'text-cyan-500' },
];

export default function MarqueeSlide() {
  const displayItems = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div className="relative my-4 py-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-violet-200/80 bg-white/80 py-3 shadow-[0_4px_25px_rgba(124,58,237,0.06)] backdrop-blur-md transition-colors duration-300 dark:border-violet-500/30 dark:bg-[#0a0d18]/90 dark:shadow-[0_0_35px_rgba(99,102,241,0.14)]">
          {/* Subtle Radial Gradient Overlay for Light and Dark Modes */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(168,85,247,0.08),transparent_35%),radial-gradient(circle_at_right,_rgba(34,211,238,0.08),transparent_35%)] dark:bg-[radial-gradient(circle_at_left,_rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_right,_rgba(34,211,238,0.18),transparent_35%)]" />

          <div className="marquee-track relative flex w-max min-w-full items-center gap-8 whitespace-nowrap px-4 text-xs font-black uppercase tracking-[0.24em] text-zinc-800 hover:[animation-play-state:paused] dark:text-zinc-100 sm:gap-10 sm:text-sm">
            {displayItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={`${item.text}-${index}`} className="flex items-center gap-8 sm:gap-10">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${item.color} shrink-0`} />
                    <span className="font-extrabold">{item.text}</span>
                  </div>
                  {/* Glowing Separator Dot */}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
