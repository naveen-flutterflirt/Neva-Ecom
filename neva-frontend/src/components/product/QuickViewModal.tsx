'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Cpu, Layers, Info, ShoppingCart } from 'lucide-react';
import { Product } from '../../types/product';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function QuickViewModal({ product, onClose, onAddToCart }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const getImage = () => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(i => i.isPrimary) || product.images[0];
      return primary.imageUrl;
    }
    return product.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  };

  const categoryName = typeof product.category === 'object' && product.category !== null
    ? product.category.name
    : (product.category || (product.isIoT ? 'IoT Product' : '3D Product'));

  const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const numDiscountPrice = product.discountPrice ? (typeof product.discountPrice === 'string' ? parseFloat(product.discountPrice) : product.discountPrice) : null;
  const isIoT = product.isIoT || (typeof categoryName === 'string' && categoryName.toLowerCase().includes('iot'));
  const specsObj = product.specifications || product.specs || {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Card Panel */}
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative z-10 flex flex-col md:flex-row w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-xl shadow-2xl max-h-[90vh] md:max-h-[80vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-90 transition-all duration-200"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Side: Product Image Display */}
          <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:h-auto overflow-hidden bg-zinc-100 dark:bg-zinc-950">
            <img
              src={getImage()}
              alt={product.name}
              className="h-full w-full object-cover"
            />

            {product.badge && (
              <div className="absolute left-4 top-4 rounded-lg bg-white/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-400 backdrop-blur-sm shadow-md">
                {product.badge}
              </div>
            )}
          </div>

          {/* Right Side: Specifications and Description Info */}
          <div className="flex-1 p-5 md:p-7 overflow-y-auto flex flex-col justify-between space-y-4">
            <div>
              {/* Category */}
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
                {isIoT ? (
                  <Cpu className="h-4 w-4 text-pink-500" />
                ) : (
                  <Layers className="h-4 w-4 text-violet-500" />
                )}
                {categoryName}
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-4">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {product.rating || 4.9}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
                <span className="text-xs font-medium text-violet-500 dark:text-violet-400">
                  SKU: {product.sku || 'N/A'}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-zinc-650 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed mb-4">
                  {product.description}
                </p>
              )}

              {/* Technical Specs List (IoT Products) */}
              {isIoT && Object.keys(specsObj).length > 0 && (
                <div className="mb-5 space-y-2">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <Info className="h-4 w-4 text-pink-500" />
                    Product Specifications
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-3 rounded-2xl">
                    {Object.entries(specsObj).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          {key}
                        </span>
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer: Quantity, Price and Action Button */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-center justify-between mt-auto">
              <div className="flex flex-col w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                    ₹{(numDiscountPrice || numPrice).toLocaleString()}
                  </span>
                  {numDiscountPrice && (
                    <span className="text-xs text-zinc-400 line-through font-mono">
                      ₹{numPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Toggle */}
              <div className="flex items-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl px-2 py-1 w-full sm:w-auto justify-between">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold transition-colors"
                >
                  -
                </button>

                <span className="px-3 font-bold text-sm w-8 text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-bold text-sm px-6 py-3 w-full sm:w-auto transition-all duration-200 shadow-lg shadow-violet-600/10 uppercase tracking-wider"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}