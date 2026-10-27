'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Check, Sparkles, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { apiClient } from '../../lib/api';

export interface PublicCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number | string;
  maxDiscountAmount?: number | string | null;
  minOrderAmount: number | string;
  applicableUser: 'all' | 'new_customer';
}

interface CouponSectionProps {
  subtotal: number;
  userId?: string | null;
  customerEmail?: string;
  appliedCoupon: {
    code: string;
    discountAmount: number;
    description?: string;
  } | null;
  onApplyCoupon: (couponData: { code: string; discountAmount: number; description?: string }) => void;
  onRemoveCoupon: () => void;
}

export default function CouponSection({
  subtotal,
  userId,
  customerEmail,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CouponSectionProps) {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(true);

  // Fetch available public coupons on mount
  useEffect(() => {
    apiClient('/coupons/public')
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          setCoupons(res.data);
        }
      })
      .catch((err) => console.warn('Could not load public coupons:', err));
  }, []);

  const handleApply = async (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Please enter a coupon code');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await apiClient('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code,
          subtotal,
          userId: userId || null,
          customerEmail: customerEmail || null,
        }),
      });

      if (res && res.success && res.data) {
        onApplyCoupon({
          code: res.data.code,
          discountAmount: res.data.discountAmount,
          description: res.data.description,
        });
        setSuccessMsg(res.message || `Coupon "${code}" applied successfully!`);
        setInputCode('');
      } else {
        setErrorMsg(res?.message || 'Invalid or expired coupon');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to apply coupon');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3.5 bg-zinc-50/80 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
          <Tag className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>Apply Promo Code</span>
        </div>
        {coupons.length > 0 && !appliedCoupon && (
          <button
            type="button"
            onClick={() => setIsListExpanded(!isListExpanded)}
            className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            {isListExpanded ? 'Hide Offers' : `View Offers (${coupons.length})`}
            {isListExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Applied Coupon Banner */}
      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-300 block truncate">
                {appliedCoupon.code} APPLIED
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                Saved ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')} with this offer
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onRemoveCoupon();
              setSuccessMsg(null);
            }}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
          >
            Remove
          </button>
        </div>
      ) : (
        /* Coupon Input & Dropdown Form */
        <div className="space-y-2.5">
          {/* Quick Select Coupon Dropdown */}
          {coupons.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                Select from Available Coupons:
              </label>
              <select
                value={inputCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputCode(val);
                  setErrorMsg(null);
                  if (val) {
                    handleApply(val);
                  }
                }}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:border-purple-600 transition cursor-pointer"
              >
                <option value="">-- Choose a Coupon Code --</option>
                {coupons.map((c) => (
                  <option key={c.id} value={c.code}>
                    🏷️ {c.code} — {c.discountType === 'flat' ? `Flat ₹${Number(c.discountValue)} OFF` : `${c.discountValue}% OFF`} {c.description ? `(${c.description})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Manual Input Form */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Or type coupon code (e.g. OFFER50)"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  setErrorMsg(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApply(inputCode);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition"
              />
              {inputCode && (
                <button
                  type="button"
                  onClick={() => setInputCode('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <button
              type="button"
              disabled={isLoading || !inputCode.trim()}
              onClick={() => handleApply(inputCode)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {isLoading ? 'Checking...' : 'Apply'}
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400 animate-in fade-in">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}
          {successMsg && (
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span>{successMsg}</span>
            </p>
          )}

          {/* Available Public Coupons List (Drawer / Cards) */}
          {isListExpanded && coupons.length > 0 && (
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">
                Available Offers for You
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {coupons.map((c) => {
                  const minReq = Number(c.minOrderAmount) || 0;
                  const isEligibleBySubtotal = subtotal >= minReq;

                  return (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isEligibleBySubtotal
                          ? 'bg-white dark:bg-zinc-900 border-purple-200/80 dark:border-purple-900/40 hover:border-purple-400'
                          : 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/60 opacity-75'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/50 px-2 py-0.5 rounded-md">
                            {c.code}
                          </span>
                          {c.discountType === 'percentage' ? (
                            <span className="text-xs font-black text-zinc-900 dark:text-white">
                              {c.discountValue}% OFF
                              {c.maxDiscountAmount ? ` (Max ₹${Number(c.maxDiscountAmount)})` : ''}
                            </span>
                          ) : (
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              FLAT ₹{Number(c.discountValue)} OFF
                            </span>
                          )}
                          {c.applicableUser === 'new_customer' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800/50">
                              <Sparkles className="h-2 w-2" /> 1st Order
                            </span>
                          )}
                        </div>

                        {c.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {c.description}
                          </p>
                        )}

                        {minReq > 0 && !isEligibleBySubtotal && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            Add ₹{(minReq - subtotal).toLocaleString('en-IN')} more to unlock
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApply(c.code)}
                        className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-purple-100 hover:bg-purple-600 text-purple-700 hover:text-white dark:bg-purple-950/80 dark:text-purple-300 dark:hover:bg-purple-600 dark:hover:text-white transition cursor-pointer shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
