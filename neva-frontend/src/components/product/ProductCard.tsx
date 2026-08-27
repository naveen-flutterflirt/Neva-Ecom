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

  // Helper to extract image URL based on selected color option
  const getDisplayImage = () => {
    if (selectedColor) {
      const targetColor = selectedColor.trim().toLowerCase();

      // 1. Check if color object inside colorOptions has a dedicated imageUrl
      if (product.colorOptions) {
        let parsedCols: any[] = [];
        if (typeof product.colorOptions === 'string') {
          try { parsedCols = JSON.parse(product.colorOptions); } catch (e) { parsedCols = []; }
        } else if (Array.isArray(product.colorOptions)) {
          parsedCols = product.colorOptions;
        }
        const matchedColObj = parsedCols.find((col: any) =>
          typeof col === 'object' && col !== null && (col.name || '').trim().toLowerCase() === targetColor
        );
        if (matchedColObj && matchedColObj.imageUrl) {
          return matchedColObj.imageUrl;
        }
      }

      // 2. Check if product.images gallery has an image tagged with this color
      if (product.images && product.images.length > 0) {
        const colorImg = product.images.find(img => img.color && img.color.trim().toLowerCase() === targetColor);
        if (colorImg) return colorImg.imageUrl;
      }
    }

    // 3. Fallback to Primary Cover Image
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.isPrimary && (img.mediaType || 'image') === 'image') || product.images[0];
      return primary.imageUrl;
    }
    return product.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  };

  // Helper to extract material information
  const getMaterialString = () => {
    let variants: any[] = [];
    if (product.materialVariants) {
      if (typeof product.materialVariants === 'string') {
        try {
          const parsed = JSON.parse(product.materialVariants);
          variants = Array.isArray(parsed) ? parsed : [];
        } catch {
          variants = [];
        }
      } else if (Array.isArray(product.materialVariants)) {
        variants = product.materialVariants;
      }
    }

    if (variants && variants.length > 0) {
      return variants
        .map((m: any) => {
          const str = typeof m === 'string' ? m : (m?.name || m?.label || (typeof m === 'object' ? JSON.stringify(m) : String(m || '')));
          return str ? str.replace(/\s*\(Base\)/gi, '') : '';
        })
        .filter(Boolean)
        .join(' / ');
    }

    if (product.specifications && product.specifications.material) {
      const matStr = typeof product.specifications.material === 'string'
        ? product.specifications.material
        : String(product.specifications.material?.name || product.specifications.material || '');
      return matStr.replace(/\s*\(Base\)/gi, '');
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
      {/* Dynamic Image Container - Perfect Square Aspect Ratio */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800/50 group/img">
        <Link href={`/products/${product.id}`} className="w-full h-full block">
          <img
            src={getDisplayImage()}
            alt={product.name}
            className="h-full w-full cursor-pointer object-cover object-center "
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