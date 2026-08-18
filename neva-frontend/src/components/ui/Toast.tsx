'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ToastProps {
    message: string | null;
}

export default function Toast({ message }: ToastProps) {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="fixed top-20 left-6 z-[110] flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-zinc-900/90 px-5 py-4 text-white shadow-2xl backdrop-blur-xl"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                        <Sparkles className="h-4 w-4 fill-violet-400 text-violet-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Notification</span>
                        <span className="text-sm font-semibold text-zinc-100">{message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
