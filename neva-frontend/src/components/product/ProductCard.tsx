'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Star, Cpu, Layers, ShoppingBag, Box, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../store';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onQuickShop?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickShop, onQuickView, onAddToCart, onBuyNow }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const cartItems = useAppSelector((state) => state.cart.items);
  const isInCart = cartItems.some((item) => item.product.id === product.id);

  // Helper to extract image URL
  const getDisplayImage = () => {
    if (selectedColor && product.images) {
      const colorImg = product.images.find(img => img.color && img.color.toLowerCase() === selectedColor.toLowerCase());
      if (colorImg) return colorImg.imageUrl;
    }
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.isPrimary && (img.mediaType || 'image') === 'image') || product.images[0];
      return primary.imageUrl;
    }
    return product.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  };

  // Helper to extract material information
  const getMaterialString = () => {
    if (product.materialVariants && product.materialVariants.length > 0) {
      return product.materialVariants.map(m => m.name.replace(/\s*\(Base\)/gi, '')).join(' / ');
    }
    if (product.specifications && product.specifications.material) {
      return product.specifications.material.replace(/\s*\(Base\)/gi, '');
    }
    return null;
  };

  // Helper to extract category name string
  const categoryName = typeof product.category === 'object' && product.category !== null
    ? product.category.name
    : (product.category || (product.isIoT ? 'IoT Product' : '3D Product'));

  const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const numDiscountPrice = product.discountPrice ? (typeof product.discountPrice === 'string' ? parseFloat(product.discountPrice) : product.discountPrice) : null;
  const isIoT = product.isIoT || (typeof categoryName === 'string' && categoryName.toLowerCase().includes('iot'));
  const materials = getMaterialString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}

      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#12131a] "
    >
      {/* Dynamic Image Container - Uncropped Full View */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800/50 group/img flex items-center justify-center p-2">
        <Link href={`/products/${product.id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={getDisplayImage()}
            alt={product.name}
            className="h-full w-full cursor-pointer object-contain transition-transform duration-300 group-hover/img:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Details Content */}
      <div className="flex flex-1 flex-col p-3.5 space-y-2.5">

        {/* Category Badge & Rating */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
            {isIoT ? (
              <Cpu className="h-3.5 w-3.5 text-pink-500" />
            ) : (
              <Layers className="h-3.5 w-3.5 text-violet-500" />
            )}
            {categoryName}
          </span>

          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{product.rating || 4.9}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200 line-clamp-2 cursor-pointer leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Material Badge */}
        {materials && (
          <div className="flex items-center gap-1 text-xs text-zinc-700 dark:text-zinc-300 bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/40 px-2 py-0.5 rounded-lg w-fit">
            <Box className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="text-[9px] font-extrabold text-violet-700 dark:text-violet-300 uppercase tracking-wider">Material:</span>
            <span className="text-[11px] font-semibold truncate max-w-[160px]">{materials}</span>
          </div>
        )}

        {/* Color Swatch Options */}
        {(() => {
          let parsedCols: any[] = [];
          if (product.colorOptions) {
            if (typeof product.colorOptions === 'string') {
              try { parsedCols = JSON.parse(product.colorOptions); } catch (e) { parsedCols = []; }
            } else if (Array.isArray(product.colorOptions)) {
              parsedCols = product.colorOptions;
            }
          }
          if (!parsedCols || parsedCols.length === 0) return null;
          return (
            <div className="flex items-center gap-1 pt-0.5">
              <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mr-0.5">Colors:</span>
              {parsedCols.slice(0, 5).map((col: any) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setSelectedColor(col.name)}
                  className={`h-4 w-4 rounded-full border transition-all cursor-pointer ${selectedColor === col.name ? 'ring-2 ring-violet-500 border-white scale-110' : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  style={{ backgroundColor: col.code }}
                  title={`${col.name} (${col.priceAdjustment ? `+₹${col.priceAdjustment}` : 'Included'})`}
                />
              ))}
            </div>
          );
        })()}

        {/* Specifications Highlight Pills (IoT Products) */}
        {isIoT && product.specifications && (
          <div className="flex flex-wrap gap-1 text-[9px] text-zinc-500 dark:text-zinc-400">
            {product.specifications.electronics && (
              <span className="bg-zinc-100 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/50">
                {product.specifications.electronics}
              </span>
            )}
            {product.specifications.power && (
              <span className="bg-zinc-100 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/50">
                {product.specifications.power}
              </span>
            )}
          </div>
        )}

        {/* Price & Action Section */}
        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] uppercase font-semibold text-zinc-400 tracking-wider">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                ₹{(numDiscountPrice || numPrice).toLocaleString()}
              </span>
              {numDiscountPrice && (
                <span className="text-[10px] text-zinc-400 line-through font-mono">
                  ₹{numPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            {/* Add Cart Button with Soft Left-to-Right Color Wipe */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) onAddToCart(product);
              }}
              className="group/btn relative overflow-hidden w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-black uppercase tracking-wider shadow-xs transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer hover:border-cyan-500 hover:text-white"
              title="Add to Cart"
            >
              {/* Left to Right Color Fill Overlay */}
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-500 w-0 group-hover/btn:w-full transition-all duration-500 ease-out z-0" />

              <span className="relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-300">
                <ShoppingBag className="h-3.5 w-3.5" />
                Add Cart
              </span>
            </button>

            {/* Buy Now Button with Soft Left-to-Right Color Wipe */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onBuyNow) {
                  onBuyNow(product);
                } else if (onAddToCart) {
                  onAddToCart(product);
                }
              }}
              className="group/btn relative overflow-hidden w-full py-2 px-3 rounded-xl border border-violet-600 bg-violet-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-violet-600/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer hover:border-violet-500"
              title="Instant Purchase"
            >
              {/* Left to Right Color Fill Overlay */}
              <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-indigo-600 w-0 group-hover/btn:w-full transition-all duration-500 ease-out z-0" />

              <span className="relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-300">
                <Zap className="h-3.5 w-3.5 fill-current" />
                Buy Now
              </span>
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}