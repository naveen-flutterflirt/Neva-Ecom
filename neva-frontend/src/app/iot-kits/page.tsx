'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { Product } from '../../types/product';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart } from '../../store/cartSlice';
import { useRouter } from 'next/navigation';
import Toast from '../../components/ui/Toast';
import { apiClient } from '../../lib/api';

export default function IotKitsPage() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const router = useRouter();
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [kits, setKits] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKits = async () => {
      try {
        const res = await apiClient('/iot-kits');
        if (res.success) {
          const mappedKits = res.data.map((k: any) => ({
            ...k,
            isIoT: true, // Flag for ProductCard/Details to know it's a kit
            image: k.images && k.images.length > 0 ? k.images[0].imageUrl : '',
          }));
          setKits(mappedKits);
        }
      } catch (err) {
        console.error('Error fetching kits:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKits();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: Product) => {
    const isAlreadyInCart = cartItems.some((item) => String(item.product.id) === String(product.id));
    if (isAlreadyInCart) {
      showToast(`⚠️ "${product.name}" is already in your cart!`);
      return;
    }

    const pPrice = Number(product.price || 0);
    const pDisc = product.discountPrice ? Number(product.discountPrice) : null;
    const sellingPrice = (pDisc && pDisc > 0) ? Math.min(pPrice, pDisc) : pPrice;
    const mrpPrice = (pDisc && pDisc > 0) ? Math.max(pPrice, pDisc) : null;

    dispatch(addToCart({
      product: {
        ...product,
        price: sellingPrice,
        discountPrice: mrpPrice,
      },
      quantity: 1
    }));
    showToast(`✓ Added "${product.name}" to cart!`);
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

    const pPrice = Number(product.price || 0);
    const pDisc = product.discountPrice ? Number(product.discountPrice) : null;
    const sellingPrice = (pDisc && pDisc > 0) ? Math.min(pPrice, pDisc) : pPrice;
    const mrpPrice = (pDisc && pDisc > 0) ? Math.max(pPrice, pDisc) : null;

    localStorage.setItem('neva-buynow-item', JSON.stringify({
      product: {
        ...product,
        price: sellingPrice,
        discountPrice: mrpPrice,
      },
      quantity: 1
    }));
    router.push('/checkout?buyNow=true');
  };

  return (
    <main className="min-h-screen bg-zinc-50/60 dark:bg-[#090a0f] pt-24 pb-20 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Breadcrumb & Header */}
        <div className="flex flex-col border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-200 font-medium">IoT Kits</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Package className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              IoT Kits
            </h1>
          </div>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Complete, ready-to-build IoT bundles and educational kits for makers, students, and professionals.
          </p>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : kits.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-zinc-500">
            No IoT kits found.
          </div>
        ) : (
          <div className="flex flex-wrap justify-center sm:justify-start gap-5 sm:gap-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {kits.map((kit) => (
              <div key={kit.id} className="w-full max-w-[340px] sm:max-w-none sm:w-[280px] lg:w-[320px] shrink-0 flex">
                <ProductCard
                  product={kit}
                  onAddToCart={() => handleAddToCart(kit)}
                  onBuyNow={() => handleBuyNow(kit)}
                />
              </div>
            ))}
          </div>
        )}

      </div>

      <Toast message={toastMessage} />
    </main>
  );
}