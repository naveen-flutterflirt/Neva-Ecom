'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  Cpu,
  ShieldCheck,
  Zap,
  Truck,
  Layers,
  Sparkles,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  Box,
  CreditCard,
  Target
} from 'lucide-react';

const goals = [
  {
    icon: Sparkles,
    title: 'Custom Vision Realized',
    description: 'Send us your idea, and we design and print it exactly the way you imagine it.',
    badge: '100% Tailored',
  },
  {
    icon: Layers,
    title: 'Premium Engineering Materials',
    description: "We work with PLA, Carbon Fibre, and other quality filaments to match your product's need for strength, finish, or flexibility.",
    badge: 'Carbon Fibre & PLA',
  },
  {
    icon: Box,
    title: 'Infinite Printed Possibilities',
    description: 'From home decor and jewelry stands to anime standees, photo frames, and keychains — if it can be printed, we can make it.',
    badge: 'Decor to Anime',
  },
  {
    icon: Target,
    title: 'Layer-by-Layer Precision',
    description: 'Every product is made-to-order with additive precision, quality checks, and care.',
    badge: 'Made-to-Order',
  },
  {
    icon: Truck,
    title: 'Pan-India Express & UPI Checkout',
    description: 'Delivered to your doorstep anywhere in India with simple, instant UPI-based checkout.',
    badge: 'Doorstep Delivery',
  },
];

const stats = [
  { label: 'Design & Production Hub', value: 'Indrapuri, Bhopal', subtext: 'Direct Production Office', icon: MapPin },
  { label: 'Premium Materials', value: 'PLA & Carbon Fibre', subtext: 'Engineering Quality', icon: Layers },
  { label: 'Doorstep Delivery', value: 'Pan-India Shipping', subtext: 'Nationwide Express', icon: Truck },
  { label: 'Secure Checkout', value: 'Instant UPI & Cards', subtext: 'Safe Payments', icon: CreditCard },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-12">

        {/* Navigation Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>

        {/* Hero Section - Split 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Brand Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 rounded-full text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider">
              About NIVASHOP
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight">
              If You Can Imagine It, We Can Create It
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong className="text-zinc-900 dark:text-zinc-100 font-bold">Nivashop</strong> is a Bhopal-based brand specializing in custom 3D-printed products — crafted in PLA, Carbon Fibre, and other premium materials — along with smart IoT-based products.
            </p>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              From home decor to everyday personal favourites — jewellery stands, anime standees, photo frames, keychains, and much more — we design and print exactly what you imagine.
            </p>

            <div className="p-4 bg-violet-50/80 dark:bg-violet-950/20 border border-violet-200/80 dark:border-violet-800/40 rounded-2xl space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                Our Biggest USP
              </span>
              <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Complete customization. Whatever you want to get made — just send it to us, and we'll design and print it for you, tailored to your exact vision.
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              We don't operate out of a physical store; we work directly from our design and production office in <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">Indrapuri, Bhopal</strong>, keeping our process lean, custom-focused, and quality-driven. With pan-India shipping and a growing community of happy customers, Nivashop.in is built on one simple promise: <em className="text-violet-600 dark:text-violet-400 font-semibold">if you can imagine it, we can create it.</em>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/custom-product"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/20 transition uppercase tracking-wider"
              >
                Send Custom Idea / CAD
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/3d-product"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-[#111218] border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold transition uppercase tracking-wider"
              >
                Browse Product Catalog
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Specs Showcase Card */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">

              {/* Top Card Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                    <Printer className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white">Design &amp; Production Studio</h3>
                    <span className="text-[10px] text-zinc-400 font-medium">Indrapuri, Bhopal (M.P.)</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">
                  Direct Office
                </span>
              </div>

              {/* Specs Feature List */}
              <div className="space-y-3">
                {[
                  { title: 'Core Specialization', detail: 'Custom 3D Printing & Smart IoT' },
                  { title: 'Filament Grades', detail: 'PLA, Carbon Fibre, Flexible' },
                  { title: 'Custom Products', detail: 'Decor, Anime, Keychains, Frames' },
                  { title: 'Dispatch & Checkout', detail: 'Pan-India + Instant UPI' },
                ].map((spec) => (
                  <div key={spec.title} className="flex justify-between items-center bg-zinc-50 dark:bg-white/[0.02] p-3 rounded-xl border border-zinc-100 dark:border-white/5 text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">{spec.title}</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{spec.detail}</span>
                  </div>
                ))}
              </div>

              {/* Guarantee Box */}
              <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/30 p-3.5 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0" />
                <span className="text-[11px] font-semibold text-violet-900 dark:text-violet-200">
                  Custom-focused, lean manufacturing tailored to your exact vision.
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Metrics Grid Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-2 hover:border-violet-300 dark:hover:border-violet-800/60 transition-all"
              >
                <div className="h-8 w-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white block tracking-tight">
                  {stat.value}
                </span>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider block">
                    {stat.label}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium block">
                    {stat.subtext}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Our Goals Section (Structured Inside Cards / Boxes) */}
        <div className="space-y-6 pt-4">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Our Vision &amp; Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Our Core Goals &amp; Promises
            </h2>
          </div>

          {/* Cards Grid for Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((g, idx) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.title}
                  className="bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md hover:border-violet-300 dark:hover:border-violet-800/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="px-2.5 py-0.5 bg-violet-100/70 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 text-[10px] font-bold rounded-md">
                        {g.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                      Goal {idx + 1}: {g.title}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      "{g.description}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action Card */}
        <div className="bg-white dark:bg-[#111218] border border-zinc-200/90 dark:border-violet-500/30 rounded-3xl p-8 sm:p-10 text-zinc-900 dark:text-white shadow-lg shadow-violet-500/5 dark:shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Turn Your Ideas Into Reality
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Have a custom product idea or design?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Send it to us directly from Indrapuri, Bhopal studio, and we'll print &amp; ship it anywhere in India.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/custom-product"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-violet-600/20 uppercase tracking-wider whitespace-nowrap"
            >
              Send Custom Request
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
