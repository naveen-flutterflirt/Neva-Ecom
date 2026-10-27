'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Sparkles, Copy, Check, Percent, Gift, ChevronRight } from 'lucide-react';
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

export default function InteractiveCouponStrip() {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCoupons = async () => {
      try {
        const res = await apiClient('/coupons/public');
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCoupons(res.data);
        } else if (isMounted) {
          // Fallback popular coupons if API is empty
          setCoupons([
            { id: '1', code: 'WELCOME50', description: 'Flat ₹50 OFF on first purchase', discountType: 'flat', discountValue: 50 },
            { id: '2', code: 'OFFER50', description: 'Flat ₹50 OFF storewide', discountType: 'flat', discountValue: 50 },
            { id: '3', code: 'FLAT100', description: 'Flat ₹100 OFF on orders above ₹999', discountType: 'flat', discountValue: 100, minOrderAmount: 999 }
          ]);
        }
      } catch (err) {
        if (isMounted) {
          setCoupons([
            { id: '1', code: 'WELCOME50', description: 'Flat ₹50 OFF on first purchase', discountType: 'flat', discountValue: 50 },
            { id: '2', code: 'OFFER50', description: 'Flat ₹50 OFF storewide', discountType: 'flat', discountValue: 50 }
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

      // Auto-apply in localStorage for seamless cart / checkout experience
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
      }, 2500);
    } catch (e) {
      setCopiedCode(coupon.code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  if (!isLoading && coupons.length === 0) return null;

  return (
    <div className="w-full my-4">
      {/* Interactive Container */}
      <div className="relative rounded-2xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 backdrop-blur-md p-3 sm:p-4 shadow-sm">
        {/* Strip Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center shadow-xs">
              <Tag className="h-3.5 w-3.5 fill-zinc-950" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                Active Store Promo Codes
                <Sparkles className="h-3 w-3 fill-amber-500 text-amber-500" />
              </span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Click any coupon to copy & auto-apply at checkout
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/40 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
            {coupons.length} Deals Live
          </span>
        </div>

        {/* Coupon Cards Horizontal Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {coupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            const discountLabel = coupon.discountType === 'flat' 
              ? `₹${Number(coupon.discountValue)} OFF` 
              : `${Number(coupon.discountValue)}% OFF`;

            return (
              <motion.button
                key={coupon.id || coupon.code}
                type="button"
                onClick={() => handleCopy(coupon)}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`relative group flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCopied
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                    : 'bg-white/90 dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-xs'
                }`}
              >
                {/* Left Ticket Stub design */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs transition-colors ${
                    isCopied 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950'
                  }`}>
                    {coupon.discountType === 'percentage' ? (
                      <Percent className="h-4 w-4" />
                    ) : (
                      <Gift className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs text-zinc-900 dark:text-zinc-100 tracking-wider">
                        {coupon.code}
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                        {discountLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[160px] sm:max-w-[140px] lg:max-w-[160px]">
                      {coupon.description || (coupon.minOrderAmount ? `Min order ₹${coupon.minOrderAmount}` : 'Storewide coupon')}
                    </p>
                  </div>
                </div>

                {/* Right Copy / Copied Action pill */}
                <div className="shrink-0 ml-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    isCopied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-amber-400 group-hover:text-zinc-950'
                  }`}>
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Tap to Apply</span>
                      </>
                    )}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
