'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Sparkles, Copy, Check, Percent, Gift, X, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../lib/api';

interface PublicCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number | string;
  maxDiscountAmount?: number | string | null;
  minOrderAmount?: number | string;
  applicableUser?: string;
}

export default function FloatingCouponDrawer() {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCoupons = async () => {
      try {
        const res = await apiClient('/coupons/public');
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCoupons(res.data);
        } else if (isMounted) {
          // Fallback defaults if database has none
          setCoupons([
            { id: '1', code: 'WELCOME50', description: 'Flat ₹50 OFF on your first purchase', discountType: 'flat', discountValue: 50 },
            { id: '2', code: 'OFFER50', description: 'Flat ₹50 OFF on all store products', discountType: 'flat', discountValue: 50 },
            { id: '3', code: 'FLAT100', description: 'Flat ₹100 OFF on orders above ₹999', discountType: 'flat', discountValue: 100, minOrderAmount: 999 }
          ]);
        }
      } catch (err) {
        if (isMounted) {
          setCoupons([
            { id: '1', code: 'WELCOME50', description: 'Flat ₹50 OFF on your first purchase', discountType: 'flat', discountValue: 50 },
            { id: '2', code: 'OFFER50', description: 'Flat ₹50 OFF on all store products', discountType: 'flat', discountValue: 50 }
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCoupons();
    return () => { isMounted = false; };
  }, []);

  const handleCopy = (coupon: PublicCoupon) => {
    try {
      navigator.clipboard.writeText(coupon.code);
      setCopiedCode(coupon.code);
      setToastText(`✓ Code "${coupon.code}" copied & auto-applied! 🎉`);

      // Store in localStorage for checkout / cart auto-application
      localStorage.setItem(
        'neva-applied-coupon',
        JSON.stringify({
          code: coupon.code.toUpperCase(),
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue),
          minOrderAmount: Number(coupon.minOrderAmount || 0),
          maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
        })
      );

      setTimeout(() => {
        setCopiedCode(null);
        setToastText(null);
      }, 2500);
    } catch (e) {
      setCopiedCode(coupon.code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  if (!isLoading && coupons.length === 0) return null;

  return (
    <>
      {/* Floating Interactive Badge (Positioned at bottom-right with smooth floating up-down animation) */}
      <div className="fixed bottom-6 right-6 z-40 select-none">
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          whileHover={{ scale: 1.06, y: -4 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-2.5 rounded-full bg-slate-950 dark:bg-zinc-900 border border-amber-400/40 px-4 py-2.5 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.25)] text-white backdrop-blur-xl group cursor-pointer"
        >
          {/* Subtle Golden Glow Dot */}


          <div className="h-7 w-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-black">
            <Tag className="h-3.5 w-3.5 fill-slate-950 text-slate-950" />
          </div>

          <div className="text-left pr-1">
            <span className="block text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              Active Offers
              <Sparkles className="h-3 w-3 fill-amber-400 text-amber-400" />
            </span>
            <span className="block text-[10px] text-zinc-300 font-semibold font-mono">
              {coupons.length} Coupons Available
            </span>
          </div>
        </motion.button>
      </div>

      {/* Slide-in Premium Coupon Drawer / Modal (Aligned to Right side) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full sm:max-w-md max-h-[85vh] sm:rounded-3xl rounded-t-3xl bg-white dark:bg-[#0c0d14] border border-zinc-200 dark:border-zinc-800 shadow-2xl z-10 flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="relative p-5 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-slate-900 dark:bg-zinc-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Flame className="h-5 w-5 fill-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                      Store Coupons & Discounts
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Tap any coupon code to copy & auto-apply!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
                  aria-label="Close coupons"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Toast Feedback banner */}
              <AnimatePresence>
                {toastText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-500 text-white text-xs font-bold py-2 px-4 text-center shadow-inner"
                  >
                    {toastText}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Coupons List */}
              <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[60vh] scrollbar-none">
                {coupons.map((coupon) => {
                  const isCopied = copiedCode === coupon.code;
                  const discountLabel = coupon.discountType === 'flat'
                    ? `₹${Number(coupon.discountValue)} OFF`
                    : `${Number(coupon.discountValue)}% OFF`;

                  return (
                    <div
                      key={coupon.id || coupon.code}
                      onClick={() => handleCopy(coupon)}
                      className={`group relative rounded-2xl border p-4 transition-all cursor-pointer ${isCopied
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 ring-2 ring-emerald-500/30'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-amber-950/10'
                        }`}
                    >
                      {/* Ticket Perforation Mock circles */}
                      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-[#0c0d14] border-r border-zinc-200 dark:border-zinc-800" />
                      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-[#0c0d14] border-l border-zinc-200 dark:border-zinc-800" />

                      <div className="flex items-center justify-between gap-3 pl-2 pr-2">
                        <div className="space-y-1 min-w-0">
                          {/* Code Badge */}
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black tracking-wider px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs">
                              {coupon.code}
                            </span>
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md">
                              {discountLabel}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium pt-1">
                            {coupon.description || 'Valid on all catalog items'}
                          </p>

                          {coupon.minOrderAmount && Number(coupon.minOrderAmount) > 0 && (
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">
                              Min. order amount: ₹{Number(coupon.minOrderAmount)}
                            </span>
                          )}
                        </div>

                        {/* Copy button */}
                        <div className="shrink-0">
                          <button
                            type="button"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-950 text-white hover:bg-amber-400 hover:text-slate-950 dark:bg-white dark:text-slate-950 dark:hover:bg-amber-400'
                              }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                                <span>Applied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Footer */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/40 text-center">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  🎁 Discount will automatically calculate in your cart & checkout summary!
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
