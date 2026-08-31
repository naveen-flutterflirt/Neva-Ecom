'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Star, Cpu, Layers, Heart, ShoppingCart, Zap,
  Ruler, RefreshCw, Truck, RotateCcw, Palette, Info, Sparkles,
  Smile, Droplets, Smartphone, Code, ShieldCheck, Box, Sun, Home, ShieldAlert,
  Radio, Thermometer, Brain, MessageCircle
} from 'lucide-react';
import Toast from '../../../components/ui/Toast';
import { Product } from '../../../types/product';
import { apiClient } from '../../../lib/api';

import { useAppDispatch, useAppSelector } from '../../../store';
import { addToCart } from '../../../store/cartSlice';

export default function DynamicProductDetailsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState<number>(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number | null>(null);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCustomColorModalOpen, setIsCustomColorModalOpen] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Product Details by ID
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        // Extract ID from pathname: /products/123 -> 123
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[pathParts.length - 1];

        if (!id || id === '[id]') return;

        const res = await apiClient(`/products/${id}`);
        if (res && res.data) {
          const raw = res.data;
          const catString = typeof raw.category === 'object' ? (raw.category?.name || raw.category?.slug || '') : String(raw.category || '');
          const checkIsIoT = raw.isIoT || catString.toLowerCase().includes('iot') || (raw.name || '').toLowerCase().includes('iot');

          let parsedCare: string[] = [];
          if (raw.careInstructions) {
            if (typeof raw.careInstructions === 'string') {
              try { parsedCare = JSON.parse(raw.careInstructions); } catch (e) { parsedCare = []; }
            } else if (Array.isArray(raw.careInstructions)) {
              parsedCare = raw.careInstructions;
            }
          }

          let parsedFeatures: any[] = [];
          if (raw.keyFeatures) {
            if (typeof raw.keyFeatures === 'string') {
              try { parsedFeatures = JSON.parse(raw.keyFeatures); } catch (e) { parsedFeatures = []; }
            } else if (Array.isArray(raw.keyFeatures)) {
              parsedFeatures = raw.keyFeatures;
            }
          }

          let parsedColors: any[] = [];
          if (raw.colorOptions) {
            if (typeof raw.colorOptions === 'string') {
              try { parsedColors = JSON.parse(raw.colorOptions); } catch (e) { parsedColors = []; }
            } else if (Array.isArray(raw.colorOptions)) {
              parsedColors = raw.colorOptions;
            }
          }

          let parsedMaterials: any[] = [];
          if (raw.materialVariants) {
            if (typeof raw.materialVariants === 'string') {
              try { parsedMaterials = JSON.parse(raw.materialVariants); } catch (e) { parsedMaterials = []; }
            } else if (Array.isArray(raw.materialVariants)) {
              parsedMaterials = raw.materialVariants;
            }
          }

          let parsedSizes: any[] = [];
          if (raw.sizeVariants) {
            if (typeof raw.sizeVariants === 'string') {
              try { parsedSizes = JSON.parse(raw.sizeVariants); } catch (e) { parsedSizes = []; }
            } else if (Array.isArray(raw.sizeVariants)) {
              parsedSizes = raw.sizeVariants;
            }
          }

          const activeColorNames = parsedColors.map((c: any) => (c.name || '').toLowerCase().trim());
          const validImages = (raw.images || []).filter((img: any) => {
            if (!img.color || img.color.trim() === '') return true;
            return activeColorNames.includes(img.color.toLowerCase().trim());
          });

          const formatted: Product = {
            id: raw.id,
            name: raw.name,
            slug: raw.slug,
            sku: raw.sku,
            category: raw.category || (checkIsIoT ? 'IoT Product' : '3D Product'),
            price: typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price,
            discountPrice: raw.discountPrice ? (typeof raw.discountPrice === 'string' ? parseFloat(raw.discountPrice) : raw.discountPrice) : null,
            stock: raw.stock || 0,
            status: raw.status || 'active',
            rating: raw.rating || 4.9,
            image: validImages.length > 0 ? validImages[0].imageUrl : (raw.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'),
            images: validImages,
            isIoT: checkIsIoT,
            description: raw.description || 'Custom engineered 3D printed & IoT integrated hardware.',
            materialVariants: parsedMaterials,
            colorOptions: parsedColors,
            sizeVariants: parsedSizes,
            careInstructions: parsedCare,
            keyFeatures: parsedFeatures,
            specifications: raw.specifications || {},
            specs: raw.specifications || {},
          };

          setProduct(formatted);
          // Set initial showcase image to Primary Cover Image
          const primaryImgObj = (formatted.images || []).find(img => img.isPrimary && (img.mediaType || 'image') === 'image') || formatted.images?.[0];
          setSelectedImage(primaryImgObj?.imageUrl || formatted.image || '');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-white pt-28 pb-20 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-10 w-10 text-purple-600 dark:text-purple-400 animate-spin" />
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Loading Product Details...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-white pt-28 pb-20 flex flex-col items-center justify-center space-y-4">
        <Box className="h-12 w-12 text-zinc-400 dark:text-zinc-600" />
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <Link href="/" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition">
          Return to Home
        </Link>
      </main>
    );
  }

  // Price calculations
  const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const matAdj = product.materialVariants && product.materialVariants[selectedMaterialIdx] ? product.materialVariants[selectedMaterialIdx].priceAdjustment || 0 : 0;
  const colAdj = selectedColorIdx !== null && product.colorOptions && product.colorOptions[selectedColorIdx] ? product.colorOptions[selectedColorIdx].priceAdjustment || 0 : 0;
  const szAdj = product.sizeVariants && product.sizeVariants[selectedSizeIdx] ? product.sizeVariants[selectedSizeIdx].priceAdjustment || 0 : 0;

  const finalPrice = basePrice + matAdj + colAdj + szAdj;
  const rawDiscount = product.discountPrice ? (typeof product.discountPrice === 'string' ? parseFloat(product.discountPrice) : product.discountPrice) : null;
  const finalDiscountPrice = rawDiscount ? rawDiscount + matAdj + colAdj + szAdj : null;

  const categoryName = typeof product.category === 'object' && product.category !== null ? product.category.name : (product.category || 'Product');
  const isIoT = product.isIoT || categoryName.toLowerCase().includes('iot');

  // Active color item
  const activeColor = selectedColorIdx !== null && product.colorOptions && product.colorOptions[selectedColorIdx] ? product.colorOptions[selectedColorIdx] : null;
  const activeMaterial = product.materialVariants && product.materialVariants[selectedMaterialIdx] ? product.materialVariants[selectedMaterialIdx] : null;

  const handleAddToCart = () => {
    try {
      const isAlreadyInCart = cartItems.some((item) => String(item.product.id) === String(product.id));
      if (isAlreadyInCart) {
        showToast(`⚠️ "${product.name}" is already added to your cart!`);
        return false;
      }
      dispatch(addToCart({
        product: {
          ...product,
          price: finalDiscountPrice || finalPrice,
        },
        quantity: 1,
      }));
      showToast(`✓ Added "${product.name}" to cart! 🛍️`);
      return true;
    } catch (err) {
      console.error('Failed to update cart:', err);
      return false;
    }
  };

  const handleWhatsAppChat = () => {
    if (!product) return;
    const phone = '919131450933';
    const text = encodeURIComponent(
      `Hello Nivashop! I would like to inquire about "${product.name}" (SKU: ${product.sku || 'N/A'}, Price: ₹${finalDiscountPrice || finalPrice}).`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleBuyNow = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('neva-token') : null;
    if (!token) {
      showToast('🔒 Please Sign In or Create an Account to proceed with Buy Now!');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    localStorage.setItem('neva-buynow-item', JSON.stringify({
      product: {
        ...product,
        price: finalDiscountPrice || finalPrice,
      },
      quantity: 1,
    }));
    router.push('/checkout?buyNow=true');
  };

  return (
    <main className="min-h-screen bg-zinc-50/60 dark:bg-[#07080c] text-zinc-900 dark:text-zinc-100 pt-20 pb-16 font-sans transition-colors duration-200 selection:bg-purple-500 selection:text-white">
      {/* Background ambient lighting for Dark Mode */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden dark:block">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-2/3 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Top Navigation & Breadcrumb Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3.5">
          <Link
            href={isIoT ? "/iot-product" : "/3d-product"}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            Back to {isIoT ? 'IoT Catalog' : '3D Products'}
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-800/60 shadow-sm">
            <span className="text-zinc-400 dark:text-zinc-500">Products</span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">{categoryName}</span>
          </div>
        </div>

        {/* Top Product Section Grid (2 Columns: 6 vs 6) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Left Column: Image Showcase & Thumbnail Gallery (6 Cols) */}
          <div className="lg:col-span-6 space-y-3">
            {/* Main Showcase Box */}
            <div className="relative aspect-square max-h-[440px] sm:max-h-[480px] w-full max-w-[500px] mx-auto overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#0d0e15] flex items-center justify-center p-0 group shadow-md dark:shadow-2xl">

              <img
                src={selectedImage || product.image || ''}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Strip & Scale Reference */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-w-[500px] mx-auto">
              {product.images && product.images.length > 0 ? (
                product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`aspect-square rounded-2xl border overflow-hidden bg-white dark:bg-[#0d0e14] p-1 transition-all duration-200 ${selectedImage === img.imageUrl
                      ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-md shadow-purple-500/10 scale-105 z-10'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-purple-300 dark:hover:border-purple-800 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  className="aspect-square rounded-2xl border border-purple-500 ring-2 ring-purple-500/50 p-1 bg-white dark:bg-[#0d0e14]"
                >
                  <img src={product.image || ''} alt="" className="w-full h-full object-cover rounded-xl" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Title, Price, Customization & Actions (6 Cols on Tablet & Laptop) */}
          <div className="md:col-span-6 space-y-3.5 bg-white dark:bg-[#0c0d14]/70 p-4 sm:p-5 lg:p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-lg dark:shadow-2xl backdrop-blur-xl">

            {/* Title & Review Rating */}
            <div className="space-y-1.5">


              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">4.9</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-600">•</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">42 Verified Reviews</span>
              </div>
            </div>

            {/* Price Header Box */}
            <div className="p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/90 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-0.5">Total Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-zinc-900 dark:text-white tracking-tight">
                    ₹{(finalDiscountPrice || finalPrice).toLocaleString()}
                  </span>
                  {finalDiscountPrice && (
                    <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 line-through">
                      ₹{finalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {finalDiscountPrice && (
                <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                  SAVE {Math.round(((finalPrice - finalDiscountPrice) / finalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs lg:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-b border-zinc-200/80 dark:border-zinc-800/80 py-2.5">
              {product.description}
            </p>

            {/* 1. Material Selector (If materialVariants available) */}
            {product.materialVariants && product.materialVariants.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-[10px]">MATERIAL TYPE</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{activeMaterial?.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.materialVariants.map((mat, idx) => (
                    <button
                      key={mat.name}
                      type="button"
                      onClick={() => setSelectedMaterialIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${selectedMaterialIdx === idx
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/20 text-purple-900 dark:text-white ring-1 ring-purple-500/50 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                    >
                      {mat.name} {mat.priceAdjustment ? `(+₹${mat.priceAdjustment})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Finish / Color Options Selector */}
            {product.colorOptions && product.colorOptions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-[10px]">FINISH / COLOR</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{activeColor ? activeColor.name : 'Select a color'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.colorOptions.map((col, idx) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => {
                        setSelectedColorIdx(idx);
                        if (col.imageUrl) {
                          setSelectedImage(col.imageUrl);
                        } else if (product.images) {
                          const matchingImg = product.images.find(i => i.color && i.color.toLowerCase() === col.name.toLowerCase());
                          if (matchingImg) setSelectedImage(matchingImg.imageUrl);
                        }
                      }}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${selectedColorIdx === idx
                        ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-[#090a0f] scale-110'
                        : 'border-zinc-300 dark:border-zinc-700 hover:scale-105'
                        }`}
                      style={{ backgroundColor: col.code }}
                      title={`${col.name} (${col.priceAdjustment ? `+₹${col.priceAdjustment}` : 'Included'})`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Request Custom Color Button */}
            <button
              type="button"
              onClick={() => {
                const message = encodeURIComponent(`Hello NEVA 3D! I would like to request a custom color option for product: "${product.name}".`);
                window.open(`https://wa.me/919900000000?text=${message}`, '_blank');
              }}
              className="w-full py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-500/50 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Palette className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              Request Custom Color / Finish
            </button>

            {/* Side-by-Side Action Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-1">
              {/* Buy Now Button (Matching Card Gradient Fill Overlay Style) */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="group/btn relative overflow-hidden w-full px-2 py-2.5 sm:py-3 rounded-2xl border border-violet-600 bg-violet-600 text-white text-[11px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider shadow-lg shadow-violet-600/25 transition-all duration-300 active:scale-98 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:border-violet-500"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-indigo-600 w-0 group-hover/btn:w-full transition-all duration-500 ease-out z-0" />
                <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 truncate">
                  <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current text-white shrink-0" />
                  <span>Buy Now</span>
                </span>
              </button>

              {/* Chat on WhatsApp Button */}
              <button
                type="button"
                onClick={handleWhatsAppChat}
                className="group/btn relative overflow-hidden w-full px-2 py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 active:scale-98 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-tight sm:tracking-wider transition-all duration-300 shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 w-0 group-hover/btn:w-full transition-all duration-500 ease-out z-0" />
                <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 truncate">
                  <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white text-white shrink-0" />
                  <span className="hidden sm:inline">Chat on WhatsApp</span>
                  <span className="sm:hidden">WhatsApp Chat</span>
                </span>
              </button>
            </div>

            {/* Delivery & Replacement Strip */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                </div>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-[11px]">SHIPPING</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Ships within 48 hours</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                  <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                </div>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-[11px]">RETURNS</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">7-day replacement policy</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Specs & Key Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80">
          {/* Left Box: Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="lg:col-span-6 space-y-4 bg-white dark:bg-[#0c0d14]/50 p-5 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-md dark:shadow-xl">
              <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
                <Cpu className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Technical Specifications</h3>
              </div>

              <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/60 text-xs space-y-2.5">
                {Object.entries(product.specifications).map(([key, val], idx) => {
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  const displayVal = typeof val === 'object' && val !== null ? (val.name || JSON.stringify(val)) : String(val);
                  return (
                    <div key={idx} className="flex items-center justify-between pt-2.5 pb-0.5">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium capitalize">{label}</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 text-right max-w-[280px]">
                        {displayVal}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Box: Key Features & Care Instructions */}
          <div className={`${(product.specifications && Object.keys(product.specifications).length > 0) ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Key Features &amp; Care</h3>
            </div>

            {/* Feature Cards Grid */}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.keyFeatures.map((feat, idx) => {
                  const titleText = typeof feat === 'string' ? feat : (feat.title || '');
                  const descText = typeof feat === 'object' ? feat.description : null;
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#12131a]/80 flex items-center gap-3 hover:border-purple-500/40 transition-all duration-200 shadow-sm">
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 shrink-0">
                        {idx % 4 === 0 ? <Cpu className="h-4 w-4" /> : idx % 4 === 1 ? <Droplets className="h-4 w-4" /> : idx % 4 === 2 ? <Smartphone className="h-4 w-4" /> : <Code className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block leading-snug">{titleText}</span>
                        {descText && descText.trim().length > 0 && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block leading-tight pt-0.5">{descText}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Care Instructions Box */}
            {product.careInstructions && product.careInstructions.length > 0 && (
              <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#12131a]/80 space-y-3 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                  CARE INSTRUCTIONS
                </span>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  {product.careInstructions.map((inst, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      {idx === 0 ? <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" /> : idx === 1 ? <Radio className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" /> : <Thermometer className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />}
                      <span className="leading-relaxed text-zinc-700 dark:text-zinc-300">{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>

      <Toast message={toastMessage} />
    </main>
  );
}
