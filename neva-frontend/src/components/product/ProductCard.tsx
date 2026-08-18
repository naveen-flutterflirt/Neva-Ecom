'use client';

import React from 'react';
import { Eye, Star, Cpu, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../types/product';

interface ProductCardProps {
    product: Product;
    onQuickShop: (product: Product) => void;
    onQuickView: (product: Product) => void;
    onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onQuickShop, onQuickView, onAddToCart }: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(109,40,217,0.15)]"
        >
            {/* Product Badge */}
            {product.badge && (
                <div className="absolute left-3 top-3 z-10 rounded-lg bg-white/85 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-400 backdrop-blur-sm shadow-md">
                    {product.badge}
                </div>
            )}

            {/* Image Showcase */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-100/80 dark:from-zinc-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-center pb-6">
                    <div className="flex gap-2.5">
                        <button
                            onClick={() => onQuickView(product)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
                            title="Quick View Details"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Details Content */}
            <div className="flex flex-1 flex-col p-4">
                {/* Category Badge */}
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
                    {product.isIoT ? (
                        <Cpu className="h-3 w-3 text-pink-400" />
                    ) : (
                        <Layers className="h-3 w-3 text-violet-400" />
                    )}
                    {product.category}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-violet-400 transition-colors duration-200 line-clamp-1 mb-1.5">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{product.rating}</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-600">(12 reviews)</span>
                </div>

                {/* Price / Action Spacer */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800/60">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Price</span>
                        <span className="text-lg font-black text-zinc-900 dark:text-white">₹{product.price}</span>
                    </div>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 cursor-pointer text-white font-bold text-xs px-4 py-2.5 transition-all duration-200"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
