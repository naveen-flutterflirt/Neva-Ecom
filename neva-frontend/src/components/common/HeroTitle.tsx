'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import localFont from 'next/font/local';
import { titleWords } from '../../data/heroContent';

const minecraftFont = localFont({
    src: '../../../public/fonts/MinecraftTen-VGORe.ttf',
    display: 'swap',
});

export default function HeroTitle() {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
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
                                        className="inline-block text-[6.8vw] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-wide leading-none text-zinc-900 dark:text-white"
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
    );
}
