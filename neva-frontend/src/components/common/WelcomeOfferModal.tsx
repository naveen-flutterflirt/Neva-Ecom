'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  ArrowRight,
  Flame,
  Tag,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';

interface ProductImage {
  id: string;
  imageUrl: string;
  isPrimary?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number | string;
  discountPrice?: number | string | null;
  sku: string;
  slug: string;
  images?: ProductImage[];
  category?: { id: string; name: string; slug: string };
}

interface PopupBannerData {
  id: string;
  title: string;
  subtitle: string | null;
  badgeText: string | null;
  productId: string | null;
  customDiscountPercentage: number | null;
  couponCode: string | null;
  buttonText: string;
  targetUrl: string | null;
  isActive: boolean;
  product?: Product | null;
}

export default function WelcomeOfferModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [banners, setBanners] = useState<PopupBannerData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // Check if user already dismissed modal in this browser session
    const dismissed = sessionStorage.getItem('neva_deal_popup_dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Fetch active deal popup banners set by Admin
    apiClient('/popup-banners/active')
      .then((res) => {
        if (res && res.success && res.data) {
          const list: PopupBannerData[] = Array.isArray(res.data) ? res.data : [res.data];
          if (list.length > 0) {
            setBanners(list);
            const timer = setTimeout(() => {
              setIsOpen(true);
            }, 1500);
            return () => clearTimeout(timer);
          }
        }
      })
      .catch((err) => console.warn('Banner fetch note:', err));
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('neva_deal_popup_dismissed', 'true');
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  if (!isOpen || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex] || banners[0];
  const product = currentBanner.product;
  const primaryImage = product?.images?.find((img) => img.isPrimary) || product?.images?.[0];

  // Pricing calculations
  const originalPrice = product ? parseFloat(String(product.price)) : 0;
  const baseDiscountPrice = product?.discountPrice ? parseFloat(String(product.discountPrice)) : originalPrice;
  const currentSellingBase = (baseDiscountPrice && baseDiscountPrice > 0) ? Math.min(originalPrice, baseDiscountPrice) : originalPrice;
  const effectivePrice = currentBanner.customDiscountPercentage && currentSellingBase
    ? Math.round(currentSellingBase * (1 - currentBanner.customDiscountPercentage / 100))
    : baseDiscountPrice;
  const savings = originalPrice > effectivePrice ? originalPrice - effectivePrice : 0;

  // Check if banner is a Combo deal or BOGO (Buy 1 Get 1)
  const isComboOffer =
    (currentBanner.badgeText && (currentBanner.badgeText.toUpperCase().includes('COMBO') || currentBanner.badgeText.toUpperCase().includes('BOGO') || currentBanner.badgeText.toUpperCase().includes('BUY 1'))) ||
    (currentBanner.title && (currentBanner.title.toUpperCase().includes('COMBO') || currentBanner.title.toUpperCase().includes('BOGO') || currentBanner.title.toUpperCase().includes('BUY 1')));

  // Target URL with deal parameters
  let targetHref = currentBanner.targetUrl || (product ? `/products/${product.id}` : '/iot-product');
  const params: string[] = [];

  if (currentBanner.customDiscountPercentage) {
    params.push(`dealDiscount=${currentBanner.customDiscountPercentage}`);
  }
  if (currentBanner.couponCode) {
    params.push(`coupon=${currentBanner.couponCode}`);
  }
  if (isComboOffer) {
    params.push('combo=true');
    params.push('qty=2');
  }

  if (params.length > 0) {
    const separator = targetHref.includes('?') ? '&' : '?';
    targetHref = `${targetHref}${separator}${params.join('&')}`;
  }

  const handleClaimDeal = () => {
    if (currentBanner.couponCode) {
      try {
        localStorage.setItem(
          'neva-applied-coupon',
          JSON.stringify({ code: currentBanner.couponCode.toUpperCase(), discountAmount: 0 })
        );
      } catch (e) { }
    }
    handleClose();
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window - Wider & Taller with max-w-2xl */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-[#080b18] border border-slate-200 dark:border-indigo-950/80 shadow-2xl z-10 my-auto"
        >
          {/* Top Banner Ribbon - Premium Royal Indigo */}
          <div className="relative bg-slate-900 dark:bg-[#0c1022] px-6 py-6 sm:py-7 text-white text-center border-b border-indigo-950/60 dark:border-indigo-900/40">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 h-9 w-9 rounded-full bg-slate-800/80 hover:bg-slate-700 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 z-20 cursor-pointer"
              aria-label="Close offer modal"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Carousel navigation arrows in header if multiple banners */}
            {banners.length > 1 && (
              <div className="absolute left-4 top-4 flex items-center gap-1.5 z-20">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="h-8 w-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition active:scale-95 cursor-pointer"
                  aria-label="Previous deal"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-amber-400 font-bold">
                  {currentIndex + 1}/{banners.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-8 w-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition active:scale-95 cursor-pointer"
                  aria-label="Next deal"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Header Badge & Title */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-widest mb-2.5 shadow-sm">
              <Sparkles className="h-3 w-3 fill-slate-950" />
              <span>{currentBanner.badgeText || 'Special Deal 🔥'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white px-8">
              {currentBanner.title}
            </h3>
            {currentBanner.subtitle && (
              <p className="text-xs sm:text-sm text-indigo-200 mt-1.5 max-w-md mx-auto font-medium">
                {currentBanner.subtitle}
              </p>
            )}
          </div>

          {/* Featured Product or Combo/Multi-Item Offer Card - Expanded layout */}
          <div className="p-5 sm:p-7 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-none bg-white dark:bg-[#080b18]">
            {product ? (
              <div className="relative flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-slate-50/80 dark:bg-[#0e1328] p-5 shadow-xs">
                {/* Product Image */}
                <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-2xl overflow-hidden bg-white dark:bg-[#131934] border border-slate-200/80 dark:border-indigo-900/60 shrink-0 shadow-sm flex items-center justify-center">
                  {primaryImage ? (
                    <img
                      src={primaryImage.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-transform hover:scale-105 duration-300"
                    />
                  ) : (
                    <ShoppingBag className="h-12 w-12 text-slate-400" />
                  )}
                  {currentBanner.customDiscountPercentage && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[11px] uppercase tracking-wider shadow-sm">
                      {currentBanner.customDiscountPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* Product Details & Live Price */}
                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    {product.category?.name || 'Featured Product'}
                  </span>
                  <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                    {product.name}
                  </h4>

                  {/* Pricing row */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                      ₹{effectivePrice.toLocaleString('en-IN')}
                    </span>
                    {originalPrice > effectivePrice && (
                      <span className="text-sm font-mono text-slate-400 dark:text-slate-500 line-through">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {savings > 0 && (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800">
                        Save ₹{savings.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Rich Combo / Multi-Item Offer Showcase Card */
              <div className="relative rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/80 bg-slate-50/90 dark:bg-[#0e1328] p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Multi-Item / Combo Graphic Icon Box */}
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-indigo-900/10 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center shrink-0 text-indigo-600 dark:text-amber-400">
                    <div className="flex items-center -space-x-3 mb-1">
                      <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md border-2 border-white dark:border-[#080b18]">
                        <Sparkles className="h-6 w-6 fill-slate-950" />
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-indigo-200 font-mono mt-1">
                      MULTI-ITEM COMBO
                    </span>
                    {currentBanner.customDiscountPercentage && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
                        {currentBanner.customDiscountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  {/* Combo Details & Value Props */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                      <span>⚡ Curated Bundle & Kit Deal</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
                      {currentBanner.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {currentBanner.subtitle || 'Get companion products, sensors and accessories bundled together at unmatched promotional pricing.'}
                    </p>

                    {/* Features checklist */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>All-in-One Complete Pack</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Instant Combo Savings</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target URL highlight badge */}
                {currentBanner.targetUrl && (
                  <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-indigo-300 font-medium">
                      Destination page:
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-amber-400 bg-white dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                      {currentBanner.targetUrl}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Optional Coupon Code Card */}
            {currentBanner.couponCode && (
              <div className="rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-[#0e142e] p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 block">
                      Extra Savings Coupon
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-indigo-300 block font-mono">
                      Applied automatically at checkout
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(currentBanner.couponCode!)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer ${copiedCode === currentBanner.couponCode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                    }`}
                >
                  {copiedCode === currentBanner.couponCode ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>{currentBanner.couponCode}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Carousel Dots if multiple offers */}
            {banners.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2 pb-1">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex
                        ? 'w-7 bg-indigo-600 dark:bg-amber-400'
                        : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Call to Action */}
          <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-indigo-950 bg-slate-50/90 dark:bg-[#0b0e20] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400 dark:text-indigo-300/80">
              *Limited stock available at deal price
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href={targetHref}
                onClick={handleClaimDeal}
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <span>{currentBanner.buttonText || 'Claim Deal & View Product'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
