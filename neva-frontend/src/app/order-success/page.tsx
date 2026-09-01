'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Package, ArrowRight, Home, ShieldCheck,
  ShoppingBag, Truck, Calendar, Copy, Check
} from 'lucide-react';

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem('neva-last-order');
      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }
    } catch (e) {
      console.warn('Failed to parse order details:', e);
    }
  }, []);

  const handleCopyOrderId = () => {
    if (order?.orderId) {
      navigator.clipboard.writeText(order.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50/70 dark:bg-[#07080d] text-zinc-900 dark:text-zinc-100 pt-20 pb-20 font-sans selection:bg-purple-500 selection:text-white transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden dark:block">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 space-y-6">

        {/* Celebration Header Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="bg-white dark:bg-[#0c0d14]/90 p-8 sm:p-10 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-2xl backdrop-blur-xl text-center space-y-5"
        >
          {/* Professional Solid Success Badge */}
          <div className="h-20 w-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/15 shrink-0">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Order Confirmed Successfully! 🎉
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              Thank you for shopping with NEVA E-Commerce. Your order has been placed and is currently being processed by our team.
            </p>
          </div>

          {/* Order ID Tag */}
          {order?.orderId && (
            <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-2xl text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              <span>Order Ref: {order.orderId}</span>
              <button
                onClick={handleCopyOrderId}
                className="hover:text-purple-700 dark:hover:text-purple-300 transition"
                title="Copy Order ID"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}

          {/* Order Summary Details */}
          {order && (
            <div className="text-left bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
                <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-purple-600" /> Purchased Items ({order.items?.length || 0})
                </span>
                <span className="text-xs font-mono font-black text-purple-600 dark:text-purple-400">
                  ₹{order.pricing?.total?.toLocaleString()}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[240px]">
                      {item.name} <span className="text-zinc-400 font-normal">x{item.quantity}</span>
                    </span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Address & Status */}
              <div className="border-t border-zinc-200/60 dark:border-zinc-800 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Shipping Address</span>
                  <p className="text-zinc-700 dark:text-zinc-300 font-medium pt-0.5 line-clamp-2">{order.customer?.address}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Payment Details</span>
                  <p className="text-zinc-700 dark:text-zinc-300 font-bold uppercase pt-0.5">{order.payment?.method || 'Razorpay Gateway'} ({order.payment?.status || 'Paid'})</p>
                  {(order.payment?.razorpayOrderId || order.razorpayOrderId) && (
                    <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold pt-0.5">
                      RZP Order: {order.payment?.razorpayOrderId || order.razorpayOrderId}
                    </p>
                  )}
                  {(order.payment?.razorpayPaymentId || order.razorpayPaymentId) && (
                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      Pay ID: {order.payment?.razorpayPaymentId || order.razorpayPaymentId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
            >
              <Home className="h-4 w-4" />
              Continue Shopping
            </Link>
            <Link
              href="/profile?tab=my_orders"
              className="px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-extrabold text-xs border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center gap-1.5"
            >
              <ShoppingBag className="h-4 w-4" />
              View My Orders
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
