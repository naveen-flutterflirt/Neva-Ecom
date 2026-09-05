'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard,
  Sparkles, AlertCircle, ArrowRight, ShieldCheck, Tag, X, Check, Truck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store';
import { removeFromCart, updateQuantity, clearCart } from '../../store/cartSlice';
import Toast from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const [isMounted, setIsMounted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // percentage
  const [appliedCouponName, setAppliedCouponName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'NIVA10' || code === 'WELCOME10' || code === 'NIVAIOT') {
      setAppliedDiscount(10);
      setAppliedCouponName(code);
      showToast('🎉 10% Discount Coupon Applied Successfully!');
    } else if (code === 'NIVA15' || code === 'FESTIVE15') {
      setAppliedDiscount(15);
      setAppliedCouponName(code);
      showToast('✨ 15% OFF Special Coupon Applied!');
    } else {
      showToast('❌ Invalid Coupon Code. Try NIVA10');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setAppliedCouponName('');
    setCouponCode('');
    showToast('Coupon removed');
  };

  // Calculate invoice totals
  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0);
  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const freeShippingThreshold = 300;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 50;
  const gstTax = Math.round((subtotal - discountAmount) * 0.18);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleRemoveFromCart = (id: string, name: string) => {
    dispatch(removeFromCart(id));
    showToast(`Removed "${name}" from cart`);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    showToast('Cart cleared completely!');
  };

  const handleCheckout = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('neva-token') : null;
    if (!token) {
      showToast('🔒 Please Sign In or Create an Account to proceed with Checkout!');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }
    router.push('/checkout');
  };

  return (
    <main className="min-h-screen bg-zinc-50/70 dark:bg-[#07080d] text-zinc-900 dark:text-zinc-100 pt-20 pb-28 sm:pb-20 font-sans selection:bg-purple-500 selection:text-white transition-colors duration-200">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden dark:block">
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              Back to Store
            </Link>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Shopping Cart
            </h1>
          </div>

          {isMounted && cartItems.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                {cartItems.reduce((a, b) => a + b.quantity, 0)} Items Selected
              </span>
              <button
                onClick={handleClearCart}
                className="text-xs font-extrabold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* Hydration Guard / Loading Skeleton or Cart Contents */}
        {!isMounted ? (
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <Skeleton className="h-64 w-full rounded-3xl" />
              </div>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#0c0d14] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 shadow-xl my-8"
          >
            <div className="h-20 w-20 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto border border-purple-200 dark:border-purple-800/50 shadow-inner">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Your Shopping Cart is Empty</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                You haven't added any products to your cart yet. Discover our premium 3D Printed Models and Smart IoT Electronics!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/3d-product"
                className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-lg shadow-purple-600/25"
              >
                Browse 3D Products
              </Link>
              <Link
                href="/iot-product"
                className="px-6 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-800 transition"
              >
                Explore Smart IoT
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Active Cart Grid split layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

            {/* Left Column: Ultra-Sleek Product Items List (8 Cols) */}
            <div className="lg:col-span-8 space-y-3.5">



              {/* Cart Product Item Cards */}
              <AnimatePresence>
                {cartItems.map((item) => {
                  const categoryLabel = typeof item.product.category === 'object' && item.product.category !== null
                    ? (item.product.category as any).name || 'Store Item'
                    : (item.product.category || 'Store Item');

                  const itemPrice = Number(item.product.price);
                  const itemTotal = itemPrice * item.quantity;
                  const itemImg = item.product.image || (item.product.images && item.product.images[0]?.imageUrl) || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=120&q=80';

                  return (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-[#0c0d14]/90 p-4 rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs backdrop-blur-xl transition hover:border-purple-300 dark:hover:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 flex items-center justify-center p-1">
                          <img
                            src={itemImg}
                            alt={item.product.name}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800/40 inline-block">
                            {categoryLabel}
                          </span>
                          <h3 className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-white truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 font-mono">
                            Unit Price: ₹{itemPrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper, Item Total & Delete */}
                      {(() => {
                        const prodId = String(item.product.id || (item.product as any)._id || '');
                        return (
                          <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/60 shrink-0">
                            {/* Stepper */}
                            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                              <button
                                type="button"
                                onClick={() => dispatch(updateQuantity({ id: prodId, quantity: item.quantity - 1 }))}
                                className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition shadow-xs cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center font-extrabold text-xs text-zinc-900 dark:text-white font-mono">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => dispatch(updateQuantity({ id: prodId, quantity: item.quantity + 1 }))}
                                className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition shadow-xs cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right min-w-[85px]">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Item Total</span>
                              <span className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400 font-mono">
                                ₹{itemTotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {/* Delete Icon */}
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(prodId, item.product.name)}
                              className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })()}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right Column: Order Summary & Price Breakdown (4 Cols) */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">

              <div className="bg-white dark:bg-[#0c0d14]/90 p-5 sm:p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-md backdrop-blur-xl space-y-5">
                <h2 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  PRICE DETAILS
                </h2>



                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-medium">
                    <span>Price ({cartItems.length} items)</span>
                    <span className="font-mono text-zinc-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Coupon Discount ({appliedDiscount}%)</span>
                      <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-medium">
                    <span>Delivery Charges</span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">FREE Delivery</span>
                    ) : (
                      <span className="font-mono text-zinc-900 dark:text-white">₹{shippingFee}</span>
                    )}
                  </div>

                  {/* <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-[11px]">
                    <span>Estimated GST (18%)</span>
                    <span className="font-mono">₹{gstTax.toLocaleString('en-IN')}</span>
                  </div> */}

                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-sm font-extrabold text-zinc-900 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-lg font-mono text-purple-600 dark:text-purple-400">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Desktop Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  PROCEED TO CHECKOUT <ArrowRight className="h-4 w-4" />
                </button>


              </div>

            </div>

            {/* Mobile Sticky Bottom Action Bar (Flipkart Style) */}


          </div>
        )}
      </div>
    </main>
  );
}
