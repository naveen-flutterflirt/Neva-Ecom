'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types/product';
import ProductCard from './ProductCard';
import QuickViewModal from './QuickViewModal';
import Toast from '../ui/Toast';
import { ProductCardSkeleton } from '../ui/Skeleton';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart } from '../../store/cartSlice';
import { apiClient } from '../../lib/api';

export default function NewArrivals() {
    const [liveProducts, setLiveProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const cartItems = useAppSelector((state) => state.cart.items);

    const scroll = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const containerWidth = sliderRef.current.clientWidth;
            // Scroll roughly one card width (card + gap: ~364px) or half container
            const cardWidth = 340 + 24;
            const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        // Fetch real live new arrival products from backend API (No dummy mock fallback)
        apiClient('/products/new-arrivals')
            .then(res => {
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    setLiveProducts(res.data);
                } else {
                    return apiClient('/products').then(allRes => {
                        if (allRes && allRes.success && Array.isArray(allRes.data)) {
                            const newArrivalTagged = allRes.data.filter((p: any) => p.isNewArrival === true || p.status === 'active');
                            setLiveProducts(newArrivalTagged.slice(0, 10));
                        }
                    });
                }
            })
            .catch(err => console.warn('Failed to fetch new arrivals from API:', err))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    const handleAddToCart = (product: Product) => {
        const alreadyInCart = cartItems.some(item => item.product.id === product.id);
        if (alreadyInCart) {
            showToast(`${product.name} is already added to Cart! ⚠️`);
        } else {
            dispatch(addToCart({ product, quantity: 1 }));
            showToast(`Added ${product.name} to Cart! 🛒`);
        }
    };

    const handleQuickView = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleBuyNow = (product: Product) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('neva-token') : null;
        if (!token) {
            showToast('🔒 Please Sign In or Create an Account to proceed with Buy Now!');
            setTimeout(() => {
                router.push('/login');
            }, 1500);
            return;
        }

        localStorage.setItem('neva-buynow-item', JSON.stringify({
            product,
            quantity: 1
        }));
        router.push('/checkout?buyNow=true');
    };

    // If API loaded and no live products exist, don't show dummy data
    if (!loading && liveProducts.length === 0) {
        return null;
    }

    return (
        <section className="relative bg-transparent pt-8 pb-20 text-zinc-900 dark:text-zinc-50 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[120px]" />
            <div className="pointer-events-none absolute -right-[10%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-pink-500/5 blur-[120px]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header with Navigation Controls */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
                    <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-pink-600 dark:text-pink-400 flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                            Fresh Catalog Additions
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent">
                            New Arrivals
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <a
                            href="/iot-product"
                            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors mr-2"
                        >
                            View All Products &rarr;
                        </a>

                        {/* User manual slide navigation controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scroll('left')}
                                aria-label="Slide Left"
                                className="h-9 w-9 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs flex items-center justify-center transition-all active:scale-95 text-zinc-700 dark:text-zinc-300"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                aria-label="Slide Right"
                                className="h-9 w-9 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs flex items-center justify-center transition-all active:scale-95 text-zinc-700 dark:text-zinc-300"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Manual Slide Carousel */}
                {loading ? (
                    <div className="flex items-stretch gap-6 overflow-hidden py-2">
                        {[1, 2, 3, 4].map((idx) => (
                            <div key={idx} className="w-[85vw] sm:w-[320px] lg:w-[340px] shrink-0 flex">
                                <ProductCardSkeleton />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        ref={sliderRef}
                        className="flex items-stretch gap-6 overflow-x-auto scroll-smooth py-3 px-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        {liveProducts.map((product) => (
                            <div
                                key={product.id}
                                className="w-[85vw] sm:w-[320px] lg:w-[340px] shrink-0 flex select-none"
                            >
                                <ProductCard
                                    product={product}
                                    onQuickShop={handleAddToCart}
                                    onQuickView={handleQuickView}
                                    onAddToCart={handleAddToCart}
                                    onBuyNow={handleBuyNow}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick View Details Modal Popup */}
            <QuickViewModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={() => { }}
            />

            {/* Custom Premium Toast Notification */}
            <Toast message={toastMessage} />
        </section>
    );
}
