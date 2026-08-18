'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { mockProducts } from '../../data/mockProducts';
import { Product } from '../../types/product';
import ProductCard from './ProductCard';
import QuickViewModal from './QuickViewModal';
import Toast from '../ui/Toast';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart } from '../../store/cartSlice';

export default function NewArrivals() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const cartItems = useAppSelector((state) => state.cart.items);

    const showToast = (message: string) => {
        setToastMessage(message);
        // Automatically dismiss after 3
        const timer = setTimeout(() => {
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

    return (
        <section className="relative bg-transparent pt-8 pb-24 text-zinc-900 dark:text-zinc-50 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[120px]" />
            <div className="pointer-events-none absolute -right-[10%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-pink-500/5 blur-[120px]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent"
                    >
                        New Arrivals
                    </motion.h2>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {mockProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onQuickShop={handleAddToCart}
                            onQuickView={handleQuickView}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>
            </div>

            {/* Quick View Details Modal Popup */}
            <QuickViewModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={() => {}}
            />

            {/* Custom Premium Toast Notification */}
            <Toast message={toastMessage} />
        </section>
    );
}
