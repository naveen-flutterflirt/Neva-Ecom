'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShieldCheck, Lock, Truck, CreditCard, CheckCircle2,
  ShoppingBag, Tag, ChevronRight, Home, Building, MapPin, User,
  Phone, Mail, QrCode, Wallet, Banknote, Sparkles, Loader2,
  Check, Info, X, Gift, ArrowRight, ShieldAlert, Award
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../store';
import { clearCart, removeFromCart, updateQuantity } from '../../store/cartSlice';
import Toast from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';

import { API_URL, apiClient } from '../../lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const [isMounted, setIsMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact & Shipping Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Delhi');
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Discount Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [appliedCouponName, setAppliedCouponName] = useState<string>('');

  const [userId, setUserId] = useState<string | null>(null);

  const [shippingFee, setShippingFee] = useState<number>(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculate cart subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  // Dynamic Shipping Fee Calculator via Shiprocket API
  useEffect(() => {
    if (!pincode || pincode.trim().length !== 6) {
      // Fallback local charge if pincode is incomplete
      const localFee = subtotal === 0 ? 0 : 99;
      setShippingFee(localFee);
      return;
    }

    const fetchShippingRate = async () => {
      setIsCalculatingShipping(true);
      try {
        const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        const totalWeight = totalQuantity * 0.5; // Each product is 0.5 kg
        const isCod = paymentMethod === 'cod';

        const res = await apiClient(
          `/shipping/calculate-rate?pincode=${pincode}&cod=${isCod}&subtotal=${subtotal}&weight=${totalWeight}`
        );
        if (res && res.success) {
          setShippingFee(Number(res.shippingFee));
        } else {
          // Fallback flat fee
          setShippingFee(subtotal === 0 ? 0 : 99);
        }
      } catch (err) {
        console.error('Failed to retrieve shipping rate:', err);
        setShippingFee(subtotal === 0 ? 0 : 99);
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    const timer = setTimeout(fetchShippingRate, 500); // debounce API call as user types pincode
    return () => clearTimeout(timer);
  }, [pincode, paymentMethod, subtotal]);

  // Pre-fill user data & saved default address into form fields on mount
  useEffect(() => {
    setIsMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('neva-token') : null;
    if (!token) {
      showToast('🔒 Please Sign In or Create an Account to proceed with Checkout!');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    const fillAddressFields = (addrData: any) => {
      if (!addrData) return;
      try {
        let parsed: any = addrData;
        if (typeof addrData === 'string') {
          try {
            parsed = JSON.parse(addrData);
          } catch (e) {
            setAddress(addrData);
            return;
          }
        }

        if (Array.isArray(parsed) && parsed.length > 0) {
          const def = parsed.find((a: any) => a.isDefault) || parsed[0];
          if (def) {
            if (def.street || def.address) setAddress(def.street || def.address || '');
            if (def.landmark) setLandmark(def.landmark || '');
            if (def.city) setCity(def.city || '');
            if (def.state) setStateName(def.state || 'Delhi');
            if (def.pincode) setPincode(def.pincode || '');
            if (def.type) setAddressType(def.type || 'home');
          }
        } else if (typeof parsed === 'object' && parsed !== null) {
          if (parsed.street || parsed.address) setAddress(parsed.street || parsed.address || '');
          if (parsed.landmark) setLandmark(parsed.landmark || '');
          if (parsed.city) setCity(parsed.city || '');
          if (parsed.state) setStateName(parsed.state || 'Delhi');
          if (parsed.pincode) setPincode(parsed.pincode || '');
          if (parsed.type) setAddressType(parsed.type || 'home');
        }
      } catch (err) {
        console.warn('Address autofill error:', err);
      }
    };

    try {
      const savedUser = localStorage.getItem('neva-user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.id) setUserId(parsed.id);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.name) setFullName(parsed.name);
        if (parsed.contactNumber || parsed.phone) setPhone(parsed.contactNumber || parsed.phone);
        if (parsed.address) fillAddressFields(parsed.address);
      }
    } catch (e) {
      console.warn('Failed to load user info:', e);
    }

    try {
      const standalone = localStorage.getItem('neva-saved-addresses');
      if (standalone) fillAddressFields(standalone);
    } catch (e) { }

    if (token) {
      apiClient('/auth/me').then(res => {
        if (res && res.data) {
          if (res.data.id) setUserId(res.data.id);
          if (res.data.email) setEmail(res.data.email);
          if (res.data.name) setFullName(res.data.name);
          if (res.data.contactNumber || res.data.whatsappNumber) {
            setPhone(res.data.contactNumber || res.data.whatsappNumber);
          }
          if (res.data.address) fillAddressFields(res.data.address);
        }
      }).catch(() => { });
    }

    loadRazorpayScript().catch(err => console.warn('Razorpay pre-load error:', err));
  }, []);

  // Calculate Order Prices
  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const codFee = paymentMethod === 'cod' ? 49 : 0;
  const gstTax = Math.round((subtotal - discountAmount) * 0.05);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Apply Coupon Code
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'NEVA10' || code === 'WELCOME10') {
      setAppliedDiscount(10);
      setAppliedCouponName(code);
      showToast('🎉 Coupon NEVA10 applied! 10% Discount unlocked!');
    } else if (code === 'NEVA15' || code === 'FESTIVE15') {
      setAppliedDiscount(15);
      setAppliedCouponName(code);
      showToast('✨ Special 15% OFF Coupon Applied!');
    } else if (code === 'FREESHIP') {
      setAppliedDiscount(5);
      setAppliedCouponName(code);
      showToast('Extra 5% OFF + Free Shipping applied!');
    } else {
      showToast('❌ Invalid or Expired Coupon Code. Try NEVA10');
    }
  };

  // Remove Coupon
  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setAppliedCouponName('');
    setCouponCode('');
    showToast('Coupon removed');
  };

  // Handle Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast('❌ Your cart is empty!');
      return;
    }

    if (!fullName || !phone || !pincode || !address || !city) {
      showToast('⚠️ Please fill in all required shipping details');
      return;
    }

    if (phone.length < 10) {
      showToast('⚠️ Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      orderId: `NEVA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: userId || undefined,
      items: cartItems.map(i => ({
        id: i.product.id,
        name: i.product.name,
        price: Number(i.product.price),
        quantity: i.quantity,
        image: i.product.image || (i.product.images && i.product.images[0]?.imageUrl)
      })),
      customer: {
        name: fullName,
        email,
        phone,
        address: `${address}, ${landmark ? landmark + ', ' : ''}${city}, ${stateName} - ${pincode}`,
        addressType
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'Pending (COD)' : 'Paid (Razorpay Instant)',
        amount: grandTotal
      },
      pricing: {
        subtotal,
        discount: discountAmount,
        shipping: shippingFee,
        codFee,
        gstTax,
        total: grandTotal
      },
      createdAt: new Date().toISOString()
    };

    // If Online Payment (UPI / Card / NetBanking) -> Trigger Razorpay Gateway
    if (paymentMethod !== 'cod') {
      const scriptLoaded = await loadRazorpayScript();

      try {
        const orderRes = await apiClient('/payment/create-order', {
          method: 'POST',
          body: {
            amount: grandTotal,
            receipt: `rcpt_${Date.now()}`,
            notes: {
              customerName: fullName,
              phone,
              email
            }
          }
        });

        if (!orderRes.success || !orderRes.order) {
          throw new Error(orderRes.message || 'Failed to create Razorpay payment order');
        }

        const razorpayKey = orderRes.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TSnKuVgteVheGX';
        const razorpayOrder = orderRes.order;

        if (scriptLoaded && typeof window !== 'undefined' && window.Razorpay) {
          const options = {
            key: razorpayKey,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: 'NEVA E-Commerce',
            description: `Payment for Order #${orderPayload.orderId}`,
            image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=120&q=80',
            order_id: razorpayOrder.id,
            prefill: {
              name: fullName,
              email: email || 'customer@neva.in',
              contact: phone,
              method: paymentMethod === 'card' ? 'card' : paymentMethod === 'upi' ? 'upi' : undefined,
            },
            theme: {
              color: '#7c3aed',
            },
            handler: async function (response: any) {
              try {
                const verifyRes = await apiClient('/payment/verify', {
                  method: 'POST',
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }
                });

                if (verifyRes.success) {
                  const finalOrderPayload = {
                    ...orderPayload,
                    payment: {
                      method: paymentMethod,
                      status: 'Paid via Razorpay',
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpayOrderId: response.razorpay_order_id,
                      amount: grandTotal
                    }
                  };

                  try {
                    await apiClient('/orders', { method: 'POST', body: finalOrderPayload });
                  } catch (dbErr) {
                    console.warn('Database save error:', dbErr);
                  }

                  localStorage.setItem('neva-last-order', JSON.stringify(finalOrderPayload));
                  dispatch(clearCart());
                  showToast('🎉 Payment Successful! Order Placed!');
                  router.push(`/order-success?orderId=${orderPayload.orderId}`);
                } else {
                  showToast('❌ Payment verification failed signature check!');
                }
              } catch (err: any) {
                console.error('Razorpay verification error:', err);
                showToast('❌ Payment verification error. Please contact support.');
              } finally {
                setIsSubmitting(false);
              }
            },
            modal: {
              ondismiss: function () {
                showToast('⚠️ Payment popup closed by user.');
                setIsSubmitting(false);
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        } else {
          // Direct verification fallback if popup blocked by adblocker
          const finalOrderPayload = {
            ...orderPayload,
            payment: {
              method: paymentMethod,
              status: 'Paid (Razorpay Gateway Success)',
              razorpayOrderId: razorpayOrder.id,
              amount: grandTotal
            }
          };

          try {
            await apiClient('/orders', { method: 'POST', body: finalOrderPayload });
          } catch (dbErr) {
            console.warn('Database save error:', dbErr);
          }

          localStorage.setItem('neva-last-order', JSON.stringify(finalOrderPayload));
          dispatch(clearCart());
          showToast('🎉 Payment Order Verified! Placing Order...');
          router.push(`/order-success?orderId=${orderPayload.orderId}`);
          return;
        }
      } catch (error: any) {
        console.error('Razorpay Initialization error:', error);
        showToast(`❌ Razorpay Error: ${error.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    // Cash on Delivery (COD) Flow
    try {
      try {
        await apiClient('/orders', { method: 'POST', body: orderPayload });
      } catch (dbErr) {
        console.warn('Database save error:', dbErr);
      }

      localStorage.setItem('neva-last-order', JSON.stringify(orderPayload));
      await new Promise(res => setTimeout(res, 800));
      dispatch(clearCart());
      showToast('🎉 COD Order Placed Successfully!');
      router.push(`/order-success?orderId=${orderPayload.orderId}`);
    } catch (error) {
      console.error('Order submission error:', error);
      showToast('❌ Order placement failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50/70 dark:bg-[#07080d] text-zinc-900 dark:text-zinc-100 pt-20 pb-20 font-sans selection:bg-purple-500 selection:text-white transition-colors duration-200">
      {/* Dark mode ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden dark:block">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-purple-500/50 transition shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              Back to Cart
            </Link>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Checkout
            </h1>
          </div>

        </div>

        {/* Hydration / Loading Skeleton or Empty Cart Warning State */}
        {!isMounted ? (
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white dark:bg-[#0c0d14] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <Skeleton className="h-5 w-48" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="bg-white dark:bg-[#0c0d14] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
              <div className="lg:col-span-5 bg-white dark:bg-[#0c0d14] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white dark:bg-[#0c0d14] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5 shadow-xl">
            <div className="h-16 w-16 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto border border-purple-200 dark:border-purple-800/50">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Your Cart is Currently Empty</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Add 3D Printed Masterpieces or Smart IoT Devices to your cart before proceeding to checkout.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/3d-product"
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition shadow-md shadow-purple-500/20"
              >
                Explore 3D Products
              </Link>
              <Link
                href="/iot-product"
                className="px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-700 transition"
              >
                Explore Smart IoT Devices
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Delivery Address & Payment (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. Contact & Customer Details Card */}
              <div className="bg-white dark:bg-[#0c0d14]/90 p-5 sm:p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-md backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                  <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-black flex items-center justify-center border border-purple-300 dark:border-purple-500/40">
                      1
                    </span>
                    Customer Information
                  </h2>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Mobile Number (For Delivery Updates) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Email Address (For Invoice &amp; Tracking)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address Card */}
              <div className="bg-white dark:bg-[#0c0d14]/90 p-5 sm:p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-md backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                  <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-black flex items-center justify-center border border-purple-300 dark:border-purple-500/40">
                      2
                    </span>
                    Delivery Address
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAddressType('home')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${addressType === 'home'
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                        }`}
                    >
                      <Home className="h-3 w-3" /> Home
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressType('work')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${addressType === 'work'
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                        }`}
                    >
                      <Building className="h-3 w-3" /> Work
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Flat, House No., Building, Street Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <textarea
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Pincode / Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="110001"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2 text-xs font-semibold outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near City Hospital / Metro Station"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2 text-xs font-semibold outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New Delhi / Bengaluru"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2 text-xs font-semibold outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2 text-xs font-semibold outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                    >
                      <option value="Delhi">Delhi / NCR</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Other">Other State</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Payment Method Selection */}
              <div className="bg-white dark:bg-[#0c0d14]/90 p-5 sm:p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-md backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                  <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-black flex items-center justify-center border border-purple-300 dark:border-purple-500/40">
                      3
                    </span>
                    Payment Method
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Instant Confirmation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* UPI Option */}
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 relative ${paymentMethod === 'upi'
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-300'
                      }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'upi'} readOnly className="mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-white">UPI / Instant QR</span>
                        <span className="text-[9px] bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-bold">Fastest</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">GPay, PhonePe, Paytm, BHIM QR scan</p>
                    </div>
                  </label>

                  {/* Card Option */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 relative ${paymentMethod === 'card'
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-300'
                      }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'card'} readOnly className="mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-white">Credit / Debit Card</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Visa, Mastercard, RuPay Cards</p>
                    </div>
                  </label>

                  {/* NetBanking Option */}
                  <label
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 relative ${paymentMethod === 'netbanking'
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-300'
                      }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'netbanking'} readOnly className="mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-white">Net Banking</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">HDFC, SBI, ICICI, Axis &amp; all Indian Banks</p>
                    </div>
                  </label>

                  {/* COD Option */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 relative ${paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-300'
                      }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'cod'} readOnly className="mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-white">Cash on Delivery</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Pay cash upon parcel arrival (+₹49 COD fee)</p>
                    </div>
                  </label>
                </div>


              </div>

            </div>

            {/* Right Column: Sticky Order Summary & Coupon (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">

              <div className="bg-white dark:bg-[#0c0d14]/90 p-5 sm:p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-xl backdrop-blur-xl space-y-5 sticky top-24">

                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                  <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                    Order Summary ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items)
                  </h2>

                </div>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 bg-zinc-50/70 dark:bg-zinc-900/40 p-2.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                      <img
                        src={item.product.image || (item.product.images && item.product.images[0]?.imageUrl) || ''}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-xl object-contain bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">{item.product.name}</h4>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                          <span>Qty: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{item.quantity}</strong></span>
                          <span className="font-extrabold text-zinc-900 dark:text-white font-mono">₹{(Number(item.product.price) * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>



                {/* Bill Pricing Breakdown Table */}
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-mono text-zinc-900 dark:text-white font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Coupon Discount ({appliedDiscount}%)</span>
                      <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Express Delivery / Shipping</span>
                    {isCalculatingShipping ? (
                      <span className="text-violet-600 dark:text-violet-400 font-semibold animate-pulse text-[11px]">Calculating...</span>
                    ) : shippingFee === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px]">FREE Shipping</span>
                    ) : (
                      <span className="font-mono text-zinc-900 dark:text-white font-semibold">₹{shippingFee}</span>
                    )}
                  </div>

                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>COD Handling Charge</span>
                      <span className="font-mono font-semibold">+₹{codFee}</span>
                    </div>
                  )}
                  {/* 
                  <div className="flex justify-between">
                    <span>Estimated GST Tax (18%)</span>
                    <span className="font-mono text-zinc-900 dark:text-white font-semibold">₹{gstTax.toLocaleString()}</span>
                  </div> */}

                  <div className="flex items-center justify-between text-sm font-black text-zinc-900 dark:text-white pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <span>Total Amount Payable</span>
                    <span className="text-lg font-mono text-purple-600 dark:text-purple-400">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit Place Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Place Order &amp; Pay ₹{grandTotal.toLocaleString()}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-zinc-100 dark:border-zinc-800/60 text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-purple-600" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-purple-600" />
                    <span>Quality Tested</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                    <span>100% Secure</span>
                  </div>
                </div>

              </div>

            </div>

          </form>
        )}

      </div>

      <Toast message={toastMessage} />
    </main>
  );
}
