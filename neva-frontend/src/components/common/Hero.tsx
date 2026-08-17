'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Cpu, Layers, Box, Zap } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import localFont from 'next/font/local';

const minecraftFont = localFont({
    src: '../../../public/fonts/MinecraftTen-VGORe.ttf',
    display: 'swap',
});

export default function Hero() {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });

    const promos = [
        "Free delivery on all PLA products inside India 🇮🇳",
        "Get 10% off on IoT Starter Kits — Code: NIVAIOT ⚡",
        "Premium quality 3D art  & IoT modules in one place 🔥"
    ];

    const productImages = [
        "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1000&q=85",
        "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1000&q=85",
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1000&q=85"
    ];

    const titleWords = ["Make", "Cool", "Stuff.", "No", "Limits."];

    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

    useEffect(() => {
        const promoInterval = setInterval(() => {
            setCurrentPromoIndex(prev => (prev + 1) % promos.length);
        }, 4000);

        return () => {
            clearInterval(promoInterval);
        };
    }, [promos.length]);

    const letterVariants = {
        hidden: { opacity: 0, y: -60, filter: 'blur(12px)', scale: 0.8, rotateX: -30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            rotateX: 0,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 150,
                delay: 0.1 + i * 0.12, // Increased stagger so each letter falls individually
            },
        }),
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(12px)', scale: 0.96 },
        visible: (customDelay: number) => ({
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            transition: {
                duration: 0.9,
                delay: 0.5 + customDelay, // Fast entry overlapping the title animation
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            },
        }),
    };

    return (
        <div className="relative flex w-full flex-col items-center overflow-hidden bg-zinc-950 pb-12 pt-16 text-white">

            {/* ── Promo Banner ── */}
            <div className="z-20 w-full py-2.5 text-center text-xs font-semibold tracking-wide text-zinc-300 backdrop-blur-md">
                <span className="inline-flex items-center gap-1.5">
                    <motion.span
                        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Sparkles className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    </motion.span>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={currentPromoIndex}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.4 }}
                        >
                            {promos[currentPromoIndex]}
                        </motion.span>
                    </AnimatePresence>
                </span>
            </div>


            {/* ── Background Layers ── */}
            

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

            {/* ── Main Grid ── */}
            <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pb-20 lg:pt-12">

                {/* ─────────── LEFT COLUMN ─────────── */}
                <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">

                    {/* Badges replacing Level Up Your Builds */}
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
                    {/* Animated Character-by-Character Title */}
                    <h1 ref={ref} className="mt-4 flex max-w-4xl flex-col items-center lg:items-start leading-none gap-y-2">
                        {/* Line 1: Make Cool Stuff. (Enforced on a single line, fully responsive) */}
                        <div className="flex flex-nowrap justify-center lg:justify-start gap-x-2 whitespace-nowrap items-baseline">
                            {titleWords.slice(0, 3).map((word, wordIndex) => {
                                const previousLettersCount = titleWords
                                    .slice(0, wordIndex)
                                    .reduce((acc, w) => acc + w.length, 0);

                                return (
                                    <span key={wordIndex} className="inline-block py-0.5">
                                        {word.split('').map((char, charIndex) => {
                                            const globalIndex = previousLettersCount + charIndex;
                                            return (
                                                <motion.span
                                                    key={charIndex}
                                                    initial={{ opacity: 0, x: -18 }}
                                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                                    exit="hidden"
                                                    transition={{ duration: 0.5, delay: globalIndex * 0.1 }}
                                                    className="inline-block text-[6.8vw] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-wide leading-none text-white"
                                                >
                                                    {char === ' ' ? <span>&nbsp;</span> : char}
                                                </motion.span>
                                            );
                                        })}
                                    </span>
                                );
                            })}
                        </div>

                        {/* Line 2: No Limits. (Enforced on a single line, fully responsive) */}
                        <div className="flex flex-nowrap justify-center lg:justify-start gap-x-2 whitespace-nowrap items-baseline">
                            {titleWords.slice(3).map((word, wordIndexAdjusted) => {
                                const wordIndex = wordIndexAdjusted + 3;
                                const previousLettersCount = titleWords
                                    .slice(0, wordIndex)
                                    .reduce((acc, w) => acc + w.length, 0);

                                return (
                                    <span key={wordIndex} className={`inline-block py-0.5 ${word === 'No' ? 'mr-[0.25em]' : ''}`}>
                                        {word.split('').map((char, charIndex) => {
                                            const globalIndex = previousLettersCount + charIndex;
                                            return (
                                                <motion.span
                                                    key={charIndex}
                                                    initial={{ opacity: 0, y: -100 }}
                                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                                    exit="hidden"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 90,
                                                        damping: 12,
                                                        delay: globalIndex * 0.08
                                                    }}
                                                    className={`${minecraftFont.className} inline-block bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent text-[6.8vw] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-normal leading-none`}
                                                    style={{ filter: 'drop-shadow(0 0 24px rgba(168,85,247,0.22))' }}
                                                >
                                                    {char}
                                                </motion.span>
                                            );
                                        })}
                                    </span>
                                );
                            })}
                        </div>
                    </h1>

                    {/* Description */}
                    <motion.p
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        variants={contentVariants}
                        className="mt-6 max-w-lg text-base font-medium leading-relaxed text-zinc-400 sm:text-lg"
                    >
                        NIVASHOP is the ultimate launchpad for creators. Get top-grade 3D filaments and smart microcontrollers. Built for developers, hackers, and makers.
                    </motion.p>

                    {/* Feature Pills */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        custom={0.15}
                        variants={contentVariants}
                        className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
                    >
                        <motion.span
                            whileHover={{ y: -3, scale: 1.04 }}
                            className="flex cursor-default items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur-sm"
                        >
                            <Layers className="h-3.5 w-3.5 text-violet-400" />
                            Eco PLA Filaments
                        </motion.span>
                        <motion.span
                            whileHover={{ y: -3, scale: 1.04 }}
                            className="flex cursor-default items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur-sm"
                        >
                            <Cpu className="h-3.5 w-3.5 text-pink-400" />
                            Dev-Ready IoT
                        </motion.span>
                        <motion.span
                            whileHover={{ y: -3, scale: 1.04 }}
                            className="flex cursor-default items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur-sm"
                        >
                            <Box className="h-3.5 w-3.5 text-amber-400" />
                            Custom Products
                        </motion.span>
                    </motion.div>

                    {/* CTA Buttons */}
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
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white bg-white px-8 py-4 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(109,40,217,1)] transition-shadow hover:shadow-none sm:w-auto"
                        >
                            Shop PLA Products
                            <ArrowRight className="h-4 w-4" />
                        </motion.a>
                        <motion.a
                            href="/shop?category=iot"
                            whileHover={{ y: -3, scale: 1.02, backgroundColor: 'rgba(39,39,42,0.85)' }}
                            whileTap={{ scale: 0.97 }}
                            className="flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/60 px-8 py-4 text-sm font-bold text-zinc-300 backdrop-blur-sm transition-colors sm:w-auto"
                        >
                            Shop IoT Products
                        </motion.a>
                    </motion.div>
                </div>

                {/* ─────────── RIGHT COLUMN ─────────── */}
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
                    <div className="relative h-[480px] w-[340px] sm:h-[540px] sm:w-[380px] lg:h-[580px] lg:w-[420px]">

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
                            className="group absolute left-0 top-0 z-20 h-52 w-40 cursor-pointer overflow-hidden rounded-2xl border border-white/15 shadow-[6px_8px_30px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_0_35px_rgba(167,139,250,0.4)] sm:h-60 sm:w-48"
                        >
                            <img src={productImages[0]} alt="Eco-friendly Violet PLA Filament" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
                            className="group absolute right-0 top-8 z-30 h-52 w-40 cursor-pointer overflow-hidden rounded-2xl border border-white/15 shadow-[8px_10px_35px_rgba(109,40,217,0.35)] transition-shadow duration-300 hover:shadow-[0_0_35px_rgba(244,114,182,0.4)] sm:h-60 sm:w-48"
                            style={{ animation: 'floatB 5.2s ease-in-out infinite 0.9s' }}
                        >
                            <img src={productImages[1]} alt="Premium Smart IoT Microcontroller Board" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
                            className="group absolute bottom-14 left-2 z-20 h-52 w-40 cursor-pointer overflow-hidden rounded-2xl border border-white/15 shadow-[6px_8px_30px_rgba(244,114,182,0.3)] transition-shadow duration-300 hover:shadow-[0_0_35px_rgba(167,139,250,0.4)] sm:h-60 sm:w-48"
                            style={{ animation: 'floatC 5.8s ease-in-out infinite 1.2s' }}
                        >
                            <img src={productImages[2]} alt="Vibrant Pink PLA Filament Spool" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
                            className="group absolute bottom-0 right-2 z-10 h-52 w-40 cursor-pointer overflow-hidden rounded-2xl border border-white/15 shadow-[8px_12px_40px_rgba(0,0,0,0.55)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(244,114,182,0.45)] sm:h-60 sm:w-48"
                            style={{ animation: 'floatD 6s ease-in-out infinite 1.5s' }}
                        >
                            <img src={productImages[3]} alt="Smart IoT Developer Expansion Module" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
            </div>
        </div>
    );
}
