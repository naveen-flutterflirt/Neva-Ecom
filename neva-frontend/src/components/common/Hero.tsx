'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Cpu, Layers, Box, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import PromoBanner from './PromoBanner';
import HeroTitle from './HeroTitle';

export default function Hero() {
    const heroVideoClassName = 'h-full w-full object-contain object-top transform -translate-y-8 lg:translate-y-0 lg:object-cover lg:object-center';

    const [isUnmuted, setIsUnmuted] = useState(true);
    const introVideoRef = useRef<HTMLVideoElement>(null);
    const idleVideoRef = useRef<HTMLVideoElement>(null);

    const contentVariants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(12px)', scale: 0.96 },
        visible: (customDelay: number) => ({
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            transition: {
                duration: 0.9,
                delay: 0.5 + customDelay,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            },
        }),
    };

    useEffect(() => {
        const introVideo = introVideoRef.current;
        if (!introVideo) return;

        // Play Yeti video with sound (unmuted) when page opens or refreshes
        introVideo.muted = false;
        introVideo.play().catch(() => {
            // Fallback for Chrome autoplay policy prior to first click
            introVideo.muted = true;
            introVideo.play().catch(() => {});

            const enableHeroAudio = () => {
                if (introVideoRef.current) {
                    introVideoRef.current.muted = false;
                    introVideoRef.current.play().catch(() => {});
                }
            };
            window.addEventListener('click', enableHeroAudio, { once: true });
            window.addEventListener('touchstart', enableHeroAudio, { once: true });
        });
    }, []);

    return (
        <div className="relative flex w-full flex-col items-center overflow-hidden bg-transparent pb-0 pt-8 lg:pb-12 lg:pt-10 text-zinc-950 dark:text-white">

            {/* Promo Banner Carousel overlay */}
            <PromoBanner />

            {/* Glowing background circles */}
            <motion.div
                className="pointer-events-none absolute left-[10%] top-16 h-[550px] w-[550px] rounded-full bg-violet-600/10 blur-[150px]"
                animate={{ x: [0, 55, 0], y: [0, -30, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="pointer-events-none absolute -bottom-10 right-[8%] h-[480px] w-[480px] rounded-full bg-fuchsia-500/10 blur-[140px]"
                animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1.05, 0.92, 1.05] }}
                transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/5 blur-[100px]"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Main Grid Section */}
            <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-6 pt-1 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pb-20 lg:pt-2">

                {/* LEFT COLUMN: Animated Headers and CTAs */}
                <div className="relative z-20 flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">

                    {/* Category Pill Badges */}
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.88 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="inline-flex cursor-default items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-violet-400 backdrop-blur-md"
                        >
                            <Box className="h-3.5 w-3.5 text-violet-400" />
                            3D Printing
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.88 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="inline-flex cursor-default items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-pink-400 backdrop-blur-md"
                        >
                            <Cpu className="h-3.5 w-3.5 text-pink-400" />
                            Smart IoT
                        </motion.div>
                    </div>

                    {/* Responsive Character Title lines */}
                    <HeroTitle />

                    {/* Sub description */}
                    <motion.p
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        variants={contentVariants}
                        className="mt-6 max-w-lg text-base font-medium leading-relaxed text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] dark:text-zinc-400 dark:drop-shadow-none sm:text-lg"
                    >
                        NIVASHOP is the ultimate launchpad for creators. Get top-grade 3D filaments and smart microcontrollers. Built for developers, hackers, and makers.
                    </motion.p>

                    {/* Bullet Info Pills */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        custom={0.15}
                        variants={contentVariants}
                        className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
                    >
                        <motion.span
                            whileHover={{ y: -3, scale: 1.04 }}
                            className="flex cursor-default items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 backdrop-blur-sm"
                        >
                            <Layers className="h-3.5 w-3.5 text-violet-400" />
                            Eco PLA Filaments
                        </motion.span>

                        <motion.span
                            whileHover={{ y: -3, scale: 1.04 }}
                            className="flex cursor-default items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 backdrop-blur-sm"
                        >
                            <Cpu className="h-3.5 w-3.5 text-pink-400" />
                            Dev-Ready IoT
                        </motion.span>

                        <motion.span
                            whileHover={{ y: -3, scale: 1.04 }}
                            className="flex cursor-default items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 backdrop-blur-sm"
                        >
                            <Box className="h-3.5 w-3.5 text-amber-400" />
                            Custom Products
                        </motion.span>
                    </motion.div>

                    {/* Action buttons */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        custom={0.3}
                        variants={contentVariants}
                        className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
                    >
                        <motion.a
                            href="/shop?category=pla"
                            whileHover={{ y: -3, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white px-8 py-4 text-sm font-bold text-white dark:text-black shadow-[4px_4px_0px_0px_rgba(109,40,217,1)] transition-shadow hover:shadow-none sm:w-auto"
                        >
                            Shop PLA Products
                            <ArrowRight className="h-4 w-4" />
                        </motion.a>

                        <motion.a
                            href="/shop?category=iot"
                            whileHover={{ y: -3, scale: 1.02, backgroundColor: 'rgba(39,39,42,0.85)' }}
                            whileTap={{ scale: 0.97 }}
                            className="flex w-full items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 px-8 py-4 text-sm font-bold text-black dark:text-zinc-300 backdrop-blur-sm transition-colors hover:bg-white hover:text-white dark:hover:bg-zinc-900/60 sm:w-auto"
                        >
                            Shop IoT Products
                        </motion.a>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: Hero Video Player */}
                <motion.div
                    className="absolute inset-0 w-full h-full lg:relative lg:col-span-5 lg:flex lg:items-center lg:justify-center mt-0 lg:mt-0 z-0 lg:z-10"
                >
                    <div className="relative overflow-hidden w-full h-full lg:max-w-[640px] lg:h-[580px]">

                        {/* HERO VIDEO - PLAYS 1 TIME ON OPEN/REFRESH (MUTED, NO ICON) */}
                        <video
                            ref={introVideoRef}
                            src="/yeti_dada.webm"
                            autoPlay
                            muted
                            playsInline
                            preload="auto"
                            className={`${heroVideoClassName} absolute inset-0 z-10 transition-opacity duration-500`}
                        />

                        {/* Mobile backdrop blur overlay */}
                        <div className="absolute inset-0 z-20 bg-white/30 dark:bg-zinc-950/85 backdrop-blur-[1px] lg:hidden pointer-events-none" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}