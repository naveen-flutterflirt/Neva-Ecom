'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export default function Toast({ message, type }: ToastProps) {
  if (!message) return null;

  let toastType = type;
  if (!toastType) {
    const lower = message.toLowerCase();
    if (
      lower.includes('delete') ||
      lower.includes('fail') ||
      lower.includes('invalid') ||
      lower.includes('error') ||
      lower.includes('❌') ||
      lower.includes('🗑️')
    ) {
      toastType = 'error';
    } else if (
      lower.includes('already') ||
      lower.includes('warn') ||
      lower.includes('⚠️') ||
      lower.includes('empty')
    ) {
      toastType = 'warning';
    } else if (
      lower.includes('success') ||
      lower.includes('added') ||
      lower.includes('create') ||
      lower.includes('update') ||
      lower.includes('applied') ||
      lower.includes('🎉') ||
      lower.includes('🛒') ||
      lower.includes('✨') ||
      lower.includes('⚡')
    ) {
      toastType = 'success';
    } else {
      toastType = 'info';
    }
  }

  const styles = {
    success: 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30',
    error: 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30',
    warning: 'bg-amber-500 text-white border-amber-400 shadow-amber-500/30',
    info: 'bg-purple-600 text-white border-purple-500 shadow-purple-600/30',
  };

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />,
    error: <AlertCircle className="h-4 w-4 shrink-0 text-white" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0 text-white" />,
    info: <Info className="h-4 w-4 shrink-0 text-white" />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`fixed top-20 right-4 sm:right-6 z-[999999] flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs sm:text-sm font-extrabold shadow-2xl backdrop-blur-xl max-w-sm sm:max-w-md ${styles[toastType]}`}
      >
        {icons[toastType]}
        <span className="leading-snug">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
