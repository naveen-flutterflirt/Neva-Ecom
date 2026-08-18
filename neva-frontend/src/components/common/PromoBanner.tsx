'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { promos } from '../../data/heroContent';

export default function PromoBanner() {
    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

    useEffect(() => {
        const promoInterval = setInterval(() => {
            setCurrentPromoIndex(prev => (prev + 1) % promos.length);
        }, 4000);

        return () => {
            clearInterval(promoInterval);
        };
    }, []);

    return (
        <div className="z-20 mt-6 w-full py-2.5 text-center text-xs font-semibold tracking-wide text-zinc-300 backdrop-blur-md">
            <span className="inline-flex items-center gap-0">
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
    );
}
