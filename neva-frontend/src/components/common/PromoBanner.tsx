'use client';

import React from 'react';
import Link from 'next/link';
import { trendingProducts } from '../../data/heroContent';
import { Flame, ArrowRight } from 'lucide-react';

export default function PromoBanner() {
    // Duplicate 25 products to create a seamless infinite marquee scroll
    const tickerItems = [...trendingProducts, ...trendingProducts];

    return (
        <div className="z-20 w-full overflow-hidden py-1.5 mb-2.5 bg-transparent">
            <div className="relative flex w-full items-center">
                {/* Left Fixed "TRENDING" Pill */}


                {/* Left Gradient Fade Mask */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 sm:w-16 bg-gradient-to-r from-transparent to-transparent" />

                {/* Right Gradient Fade Mask */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 sm:w-16 bg-gradient-to-l from-transparent to-transparent" />

                {/* Continuous Infinite Marquee Track (Pauses on Hover) */}
                <div className="flex w-full overflow-hidden">
                    <div className="product-marquee-track items-center gap-2.5 py-0.5 pl-3">
                        {tickerItems.map((item, idx) => (
                            <Link
                                key={`${item.id}-${idx}`}
                                href={item.link || '/iot-product'}
                                className="group flex shrink-0 items-center gap-2 rounded-full border border-zinc-300/80 bg-zinc-100/90 dark:border-zinc-800 dark:bg-zinc-900/90 px-3.5 py-1 text-xs transition-all hover:border-violet-500 hover:scale-[1.02] shadow-sm"
                            >
                                {/* Product Name */}
                                <span className="font-semibold text-zinc-900 transition group-hover:text-violet-600 dark:text-zinc-200 dark:group-hover:text-violet-300">
                                    {item.name}
                                </span>

                                {/* NIVASHOP Price */}
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                    ₹{item.nivaPrice.toLocaleString('en-IN')}
                                </span>

                                {/* Market Price (Strikethrough) */}
                                {item.marketPrice && (
                                    <span className="text-[10px] text-zinc-400 line-through">
                                        ₹{item.marketPrice.toLocaleString('en-IN')}
                                    </span>
                                )}

                                <ArrowRight className="h-3 w-3 text-zinc-400 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-violet-500" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
