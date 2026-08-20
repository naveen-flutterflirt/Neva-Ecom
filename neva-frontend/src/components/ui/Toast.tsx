'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
    message: string | null;
}

export default function Toast({ message }: ToastProps) {
    let bgStyle = 'bg-white border-zinc-200 text-zinc-800';
    
    if (message) {
        const lowerMessage = message.toLowerCase();
        if (
            lowerMessage.includes('delete') || 
            lowerMessage.includes('fail') || 
            lowerMessage.includes('invalid') || 
            lowerMessage.includes('❌') || 
            lowerMessage.includes('🗑️')
        ) {
            bgStyle = 'bg-red-50 border-red-200 text-red-800';
        } else if (
            lowerMessage.includes('success') || 
            lowerMessage.includes('create') || 
            lowerMessage.includes('update') || 
            lowerMessage.includes('applied') || 
            lowerMessage.includes('🎉') || 
            lowerMessage.includes('🛒') || 
            lowerMessage.includes('⚡')
        ) {
            bgStyle = 'bg-emerald-50 border-emerald-250 text-emerald-800';
        }
    }

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, x: 10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className={`fixed top-6 right-6 z-[110] flex items-center rounded-xl border px-4 py-3 text-xs font-semibold shadow-md ${bgStyle}`}
                >
                    <span>{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
