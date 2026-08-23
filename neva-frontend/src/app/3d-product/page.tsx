'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Layers, ArrowLeft, RefreshCw, SlidersHorizontal, Grid, LayoutGrid, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProductCard from '../../components/product/ProductCard';
import QuickViewModal from '../../components/product/QuickViewModal';
import Toast from '../../components/ui/Toast';
import { Product } from '../../types/product';
import { apiClient } from '../../lib/api';

import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart } from '../../store/cartSlice';

const safeParseJSON = (val: any, fallback: any = []) => {
  if (!val) return fallback;
  if (Array.isArray(val) || typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parsed !== null ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
};

export default function ThreeDProductsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch 3D Products from backend API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/products');
      if (res && Array.isArray(res.data)) {
        // Filter out IoT products to only include 3D products
        const threeDList: Product[] = res.data
          .filter((p: any) => {
            const catName = typeof p.category === 'object' && p.category !== null ? p.category.name : (p.category || '');
            const catSlug = typeof p.category === 'object' && p.category !== null ? p.category.slug : '';
            const isIoT = p.isIoT || catName.toLowerCase().includes('iot') || catSlug.toLowerCase().includes('iot');
            return !isIoT;
          })
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            category: typeof p.category === 'object' && p.category !== null ? (p.category.name || '3D Product') : (p.category || '3D Product'),
            price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
            discountPrice: p.discountPrice ? (typeof p.discountPrice === 'string' ? parseFloat(p.discountPrice) : p.discountPrice) : null,
            stock: p.stock || 0,
            status: p.status || 'active',
            rating: p.rating || 4.9,
            image: p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            images: p.images || [],
            isIoT: false,
            description: p.description || '',
            materialVariants: safeParseJSON(p.materialVariants, []),
            colorOptions: safeParseJSON(p.colorOptions, []),
            sizeVariants: safeParseJSON(p.sizeVariants, []),
            careInstructions: safeParseJSON(p.careInstructions, []),
            keyFeatures: safeParseJSON(p.keyFeatures, []),
            specifications: safeParseJSON(p.specifications, {}),
            specs: safeParseJSON(p.specifications, {}),
          }));
        setProducts(threeDList);
      }
    } catch (err) {
      console.error('Failed to load 3D products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    try {
      const alreadyInCart = cartItems.some((item) => item.product.id === product.id);
      if (alreadyInCart) {
        showToast(`⚠️ "${product.name}" is already in your cart! 🛍️`);
        return;
      }
      dispatch(addToCart({ product, quantity: 1 }));
      showToast(`✓ Added "${product.name}" to cart! 🛍️`);
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
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

    const alreadyInCart = cartItems.some((item) => String(item.product.id) === String(product.id));
    if (!alreadyInCart) {
      dispatch(addToCart({ product, quantity: 1 }));
    }
    router.push('/checkout');
  };

  // Filter & Sort 3D Products
  const processedProducts = products
    .filter(p => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <main className="min-h-screen bg-zinc-50/60 dark:bg-[#090a0f] pt-24 pb-20 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Minimal Clean Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <Link href="/" className="inline-flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Home
              </Link>
              <span>/</span>
              <span className="text-zinc-900 dark:text-zinc-200 font-medium">3D Catalog</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                3D Products
              </h1>
              {!isLoading && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50">
                  {processedProducts.length} items
                </span>
              )}
            </div>
          </div>

          {/* Action Bar: Search Input */}
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition shadow-sm text-zinc-900 dark:text-zinc-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Cards Grid / Loading / Empty */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="animate-pulse bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 space-y-4 shadow-sm"
              >
                <div className="w-full h-48 bg-zinc-200 dark:bg-zinc-800/60 rounded-xl" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800/60 rounded w-3/4" />
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800/40 rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-zinc-200 dark:bg-zinc-800/60 rounded w-1/3" />
                  <div className="h-8 bg-zinc-200 dark:bg-zinc-800/60 rounded-lg w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : processedProducts.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl space-y-4 shadow-sm">
            <Layers className="h-10 w-10 text-zinc-400 mx-auto opacity-60" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">No 3D Products Found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {searchQuery ? `No items found matching "${searchQuery}".` : 'There are currently no 3D products available.'}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {processedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedQuickViewProduct(p)}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}

      </div>

      {/* Quick View Modal */}
      {selectedQuickViewProduct && (
        <QuickViewModal
          product={selectedQuickViewProduct}
          onClose={() => setSelectedQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <Toast message={toastMessage} />
    </main>
  );
}
