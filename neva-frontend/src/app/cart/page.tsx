'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { removeFromCart, updateQuantity, clearCart } from '../../store/cartSlice';
import Toast from '../../components/ui/Toast';

export default function CartPage() {
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.items);
    const [couponCode, setCouponCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0); // in percentage
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (couponCode.toUpperCase() === 'NIVAIOT') {
            setAppliedDiscount(10);
            showToast('10% Discount applied successfully! ⚡');
        } else {
            showToast('Invalid Coupon Code! ❌');
        }
    };

    // Calculate invoice totals
    const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
    const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
    const gst = Math.round((subtotal - discountAmount) * 0.18);
    const orderTotal = subtotal - discountAmount + shipping + gst;

    const handleRemoveFromCart = (id: string, name: string) => {
        dispatch(removeFromCart(id));
        showToast(`${name} deleted from Cart! 🗑️`);
    };

    const handleClearCart = () => {
        dispatch(clearCart());
        showToast('All products deleted from Cart! 🗑️');
    };

    const handleCheckout = () => {
        showToast('Processing order checkout... 🚀');
        setTimeout(() => {
            dispatch(clearCart());
            showToast('Order placed successfully! Thank you. 🎉');
        }, 2000);
    };

    return (
        <div className="relative min-h-screen bg-transparent pt-28 pb-20 text-zinc-900 dark:text-zinc-50 overflow-hidden">
            {/* Ambient background styling */}
            <div className="pointer-events-none absolute -left-[10%] top-[10%] h-[350px] w-[350px] rounded-full bg-violet-600/5 blur-[100px]" />
            <div className="pointer-events-none absolute -right-[10%] bottom-[10%] h-[350px] w-[350px] rounded-full bg-pink-500/5 blur-[100px]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header Back Button */}
                <div className="mb-10 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-semibold transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Shopping
                    </Link>
                    <h1 className="text-2xl font-black uppercase tracking-wider text-zinc-900 dark:text-white">Your Cart</h1>
                </div>

                <AnimatePresence mode="wait">
                    {cartItems.length === 0 ? (
                        /* Empty state */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800/80 bg-white/30 dark:bg-zinc-900/10 backdrop-blur-md rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-2xl"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-500 mb-6">
                                <ShoppingBag className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">Shopping Cart is Empty</h2>
                            <p className="text-zinc-500 text-sm max-w-sm mb-8">
                                Looks like you haven't added anything to your cart yet. Explore our latest PLA Filaments and Smart IoT modules!
                            </p>
                            <Link
                                href="/"
                                className="rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-bold text-sm px-8 py-3.5 transition-all duration-200 shadow-lg shadow-violet-600/10"
                            >
                                Shop New Arrivals
                            </Link>
                        </motion.div>
                    ) : (
                        /* Active Items List & Invoice Grid split panel */
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                        >
                            {/* Left: Cart Items List */}
                            <div className="lg:col-span-8 space-y-4">
                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item.product.id}
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="flex flex-col sm:flex-row items-center gap-5 border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-5 rounded-2xl backdrop-blur-sm"
                                    >
                                        {/* Product Thumbnail */}
                                        <div className="h-20 w-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Info Block */}
                                        <div className="flex-1 text-center sm:text-left">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                                                {item.product.category}
                                            </span>
                                            <h3 className="font-bold text-zinc-900 dark:text-white text-base mt-0.5 line-clamp-1">
                                                {item.product.name}
                                            </h3>
                                            <span className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                                                Unit Price: ₹{item.product.price}
                                            </span>
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="flex items-center border border-zinc-200 dark:border-zinc-850 bg-zinc-100/40 dark:bg-zinc-950/40 rounded-xl px-2 py-1">
                                            <button
                                                onClick={() => dispatch(updateQuantity({ id: item.product.id, quantity: item.quantity - 1 }))}
                                                className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="px-3 font-bold text-sm w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => dispatch(updateQuantity({ id: item.product.id, quantity: item.quantity + 1 }))}
                                                className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        {/* Total Product Price */}
                                        <div className="text-right min-w-[70px] hidden sm:block">
                                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Total</span>
                                            <span className="font-black text-zinc-900 dark:text-white text-base">₹{item.product.price * item.quantity}</span>
                                        </div>

                                        {/* Remove Action */}
                                        <button
                                            onClick={() => handleRemoveFromCart(item.product.id, item.product.name)}
                                            className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-rose-500 transition-colors self-center rounded-xl hover:bg-rose-500/10"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="h-4.5 w-4.5" />
                                        </button>
                                    </motion.div>
                                ))}

                                {/* Clear Cart and Coupon Panel */}
                                <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    <button
                                        onClick={handleClearCart}
                                        className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-rose-550 transition-colors"
                                    >
                                        Clear Cart List
                                    </button>

                                    <form onSubmit={handleApplyCoupon} className="flex gap-2 w-full sm:w-auto">
                                        <input
                                            type="text"
                                            placeholder="Promo Code NIVAIOT"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-violet-500/50 w-full sm:w-44 placeholder-zinc-400 dark:placeholder-zinc-600"
                                        />
                                        <button
                                            type="submit"
                                            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-xs font-bold text-zinc-750 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
                                        >
                                            Apply
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Right: Checkout Pricing Panel */}
                            <div className="lg:col-span-4">
                                <div className="border border-zinc-200 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/20 backdrop-blur-md p-6 rounded-3xl shadow-2xl">
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-5 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-850 pb-3 flex items-center gap-2">
                                        <CreditCard className="h-4.5 w-4.5 text-violet-400" />
                                        Order Summary
                                    </h3>

                                    {/* Breakdown items */}
                                    <div className="space-y-3.5 text-sm mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-850">
                                        <div className="flex justify-between text-zinc-650 dark:text-zinc-400 font-medium">
                                            <span>Subtotal</span>
                                            <span className="text-zinc-800 dark:text-zinc-200">₹{subtotal}</span>
                                        </div>

                                        {appliedDiscount > 0 && (
                                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="h-3.5 w-3.5 fill-emerald-600 dark:fill-emerald-400" />
                                                    Discount ({appliedDiscount}%)
                                                </span>
                                                <span>-₹{discountAmount}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-zinc-650 dark:text-zinc-400 font-medium">
                                            <span>Shipping Charges</span>
                                            <span className="text-zinc-800 dark:text-zinc-200">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                        </div>

                                        <div className="flex justify-between text-zinc-650 dark:text-zinc-400 font-medium">
                                            <span>GST (18% tax)</span>
                                            <span className="text-zinc-800 dark:text-zinc-200">₹{gst}</span>
                                        </div>
                                    </div>

                                    {/* Net total amount */}
                                    <div className="flex justify-between items-baseline mb-8">
                                        <span className="text-sm font-bold uppercase text-zinc-500 dark:text-zinc-400">Total Payable</span>
                                        <span className="text-2xl font-black text-zinc-900 dark:text-white">₹{orderTotal}</span>
                                    </div>

                                    {/* Checkout Trigger */}
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-bold text-sm py-4 transition-all duration-200 shadow-lg shadow-violet-600/10 cursor-pointer"
                                    >
                                        Place Your Order
                                    </button>

                                    {shipping > 0 && (
                                        <p className="mt-4 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed flex gap-1 items-start">
                                            <AlertCircle className="h-3 w-3 text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5" />
                                            Add products worth ₹{1500 - subtotal} more to receive Free Shipping across India!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global success/error toasts */}
            <Toast message={toastMessage} />
        </div>
    );
}
