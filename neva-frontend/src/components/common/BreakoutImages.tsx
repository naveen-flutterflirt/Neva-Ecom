'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { productImages } from '../../data/heroContent';

export default function BreakoutImages() {
    return (
        <div className="relative mt-8 hidden lg:flex w-full items-center justify-center lg:col-span-5 lg:mt-0">
            {/* Pulsing center glow */}
            <motion.div
                className="absolute h-[320px] w-[320px] rounded-full bg-violet-500/15 blur-[100px]"
                animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.5, 0.25] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-[80px]"
                animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Scattered breakout image layout — 520px tall scene */}
            <div className="relative h-[480px] w-[340px] sm:h-[540px] sm:w-[380px] lg:h-[580px] lg:w-[400px] xl:h-[620px] xl:w-[440px] 2xl:h-[660px] 2xl:w-[480px]">

                {/* ── IMAGE 1: Top-left, tilted left, comes from top-right ── */}
                <motion.div
                    initial={{ opacity: 0, x: 200, y: -160, rotate: 18, scale: 0.7 }}
                    animate={{ opacity: 1, x: 0, rotate: -8, scale: 1, y: [0, -8, 0] as unknown as number }}
                    transition={{
                        opacity: { duration: 0.7, delay: 0.1 },
                        x: { duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] },
                        rotate: { duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] },
                        scale: { duration: 0.9, delay: 0.1 },
                        y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 },
                    }}
                    whileHover={{ scale: 1.06, rotate: -4, zIndex: 50 }}
                    className="group absolute left-0 top-0 z-20 h-48 w-36 cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-white/15 shadow-[0_0_25px_rgba(167,139,250,0.35),6px_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_0_25px_rgba(167,139,250,0.35),6px_8px_30px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_0_35px_rgba(167,139,250,0.6)] sm:h-52 sm:w-38 lg:h-64 lg:w-44 xl:h-68 xl:w-48 2xl:h-72 2xl:w-52"
                >
                    <img src={productImages[0]} alt="Eco-friendly Violet PLA Filament" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    {/* Dynamic Label Badge */}
                    <div className="absolute bottom-3 left-3 right-3 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-30">
                        <div className="rounded-lg border border-violet-500/30 bg-white/85 dark:bg-zinc-950/85 px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-violet-400 backdrop-blur-sm">
                            Eco PLA Filament
                        </div>
                    </div>
                    {/* Glossy sweep */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </motion.div>

                {/* ── IMAGE 2: Top-right, tilted right, big, comes from right ── */}
                <motion.div
                    initial={{ opacity: 0, x: 250, y: -80, rotate: -20, scale: 0.65 }}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: 6, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.8, delay: 0.3 },
                        x: { duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
                        rotate: { duration: 1.0, delay: 0.3 },
                        scale: { duration: 1.0, delay: 0.3 },
                    }}
                    whileHover={{ scale: 1.05, rotate: 3, zIndex: 50 }}
                    className="group absolute right-0 top-8 z-30 h-48 w-36 cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-white/15 shadow-[0_0_25px_rgba(34,211,238,0.35),8px_10px_35px_rgba(0,0,0,0.15)] dark:shadow-[0_0_25px_rgba(34,211,238,0.35),8px_10px_35px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] sm:h-52 sm:w-38 lg:h-64 lg:w-44 xl:h-68 xl:w-48 2xl:h-72 2xl:w-52"
                    style={{ animation: 'floatB 5.2s ease-in-out infinite 0.9s' }}
                >
                    <img src={productImages[1]} alt="Premium Smart IoT Microcontroller Board" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    {/* Dynamic Label Badge */}
                    <div className="absolute bottom-3 left-3 right-3 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-30">
                        <div className="rounded-lg border border-cyan-500/30 bg-white/85 dark:bg-zinc-950/85 px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-cyan-400 backdrop-blur-sm">
                            ESP32 IoT Core
                        </div>
                    </div>
                    {/* Glossy sweep */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </motion.div>

                {/* ── IMAGE 3: Bottom-left, slight tilt left, comes from bottom ── */}
                <motion.div
                    initial={{ opacity: 0, x: -220, y: 200, rotate: 16, scale: 0.7 }}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: 5, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.8, delay: 0.5 },
                        x: { duration: 1.0, delay: 0.5, ease: [0.22, 1, 0.36, 1] },
                        rotate: { duration: 1.0, delay: 0.5 },
                        scale: { duration: 1.0, delay: 0.5 },
                    }}
                    whileHover={{ scale: 1.06, rotate: 2, zIndex: 50 }}
                    className="group absolute bottom-14 left-2 z-20 h-48 w-36 cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-white/15 shadow-[0_0_25px_rgba(244,114,182,0.35),6px_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_0_25px_rgba(244,114,182,0.35),6px_8px_30px_rgba(0,0,0,0.4)] transition-shadow duration-300 hover:shadow-[0_0_35px_rgba(244,114,182,0.6)] sm:h-52 sm:w-38 lg:h-64 lg:w-44 xl:h-68 xl:w-48 2xl:h-72 2xl:w-52"
                    style={{ animation: 'floatC 5.8s ease-in-out infinite 1.2s' }}
                >
                    <img src={productImages[2]} alt="Vibrant Pink PLA Filament Spool" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    {/* Dynamic Label Badge */}
                    <div className="absolute bottom-3 left-3 right-3 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-30">
                        <div className="rounded-lg border border-pink-500/30 bg-white/85 dark:bg-zinc-950/85 px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-pink-400 backdrop-blur-sm">
                            Matte PLA Spool
                        </div>
                    </div>
                    {/* Glossy sweep */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </motion.div>

                {/* ── IMAGE 4: Bottom-right, most prominent, comes from bottom-right ── */}
                <motion.div
                    initial={{ opacity: 0, x: 180, y: 200, rotate: -14, scale: 0.65 }}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: -6, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.9, delay: 0.7 },
                        x: { duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] },
                        rotate: { duration: 1.1, delay: 0.7 },
                        scale: { duration: 1.1, delay: 0.7 },
                    }}
                    whileHover={{ scale: 1.07, rotate: -3, zIndex: 50 }}
                    className="group absolute bottom-0 right-2 z-10 h-48 w-36 cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-white/15 shadow-[0_0_25px_rgba(251,191,36,0.35),8px_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_0_25px_rgba(251,191,36,0.35),8px_12px_40px_rgba(0,0,0,0.55)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] sm:h-52 sm:w-38 lg:h-64 lg:w-44 xl:h-68 xl:w-48 2xl:h-72 2xl:w-52"
                    style={{ animation: 'floatD 6s ease-in-out infinite 1.5s' }}
                >
                    <img src={productImages[3]} alt="Smart IoT Developer Expansion Module" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    {/* Dynamic Label Badge */}
                    <div className="absolute bottom-3 left-3 right-3 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-30">
                        <div className="rounded-lg border border-amber-500/30 bg-white/85 dark:bg-zinc-950/85 px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-amber-400 backdrop-blur-sm">
                            IoT Expansion Shield
                        </div>
                    </div>
                    {/* Glossy sweep */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </motion.div>

                {/* Floating accent glowing dots */}
                <motion.div
                    className="absolute right-2 top-6 z-40 h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.9)]"
                    animate={{ y: [0, -18, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-10 left-0 z-40 h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_16px_rgba(244,114,182,0.9)]"
                    animate={{ y: [0, 14, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute right-20 bottom-6 z-40 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]"
                    animate={{ y: [0, -10, 0], opacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />

            </div>

            {/* Independent float keyframes for each card */}
            <style>{`
                @keyframes floatB {
                    0%, 100% { transform: rotate(6deg) translateY(0px); }
                    50% { transform: rotate(6deg) translateY(-10px); }
                }
                @keyframes floatC {
                    0%, 100% { transform: rotate(5deg) translateY(0px); }
                    50% { transform: rotate(5deg) translateY(9px); }
                }
                @keyframes floatD {
                    0%, 100% { transform: rotate(-6deg) translateY(0px); }
                    50% { transform: rotate(-6deg) translateY(-12px); }
                }
            `}</style>
        </div>
    );
}
