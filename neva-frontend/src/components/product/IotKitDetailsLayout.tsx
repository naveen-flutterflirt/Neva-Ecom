'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '../../types/product';
import {
  Star,
  Zap,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  RotateCcw,
  LayoutGrid,
  ChevronDown,
  CheckCircle2,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IotKitDetailsLayoutProps {
  product: Product;
  selectedImage: string;
  finalSellingPrice: number;
  finalMrpPrice: number | null;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
}

// Dummy components removed, using real data from product prop

export default function IotKitDetailsLayout({
  product,
  selectedImage,
  finalSellingPrice,
  finalMrpPrice,
  handleAddToCart,
  handleBuyNow
}: IotKitDetailsLayoutProps) {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('included');
  const [currentImg, setCurrentImg] = useState(selectedImage || product.image || '');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const whatsIncluded = (product as any).whatsIncluded || [];
  const projects = (product as any).projects || [];
  const faqs = (product as any).faqs || [];

  useEffect(() => {
    if (selectedImage) setCurrentImg(selectedImage);
  }, [selectedImage]);

  const discountPercent = finalMrpPrice
    ? Math.round(((finalMrpPrice - finalSellingPrice) / finalMrpPrice) * 100)
    : 0;

  return (
    <div className="w-full">
      {/* Top Section: Image & Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">

        {/* Left: Product Image */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative aspect-square max-h-[440px] sm:max-h-[480px] w-full max-w-[500px] mx-auto rounded-3xl overflow-hidden bg-white dark:bg-[#0d0e15] border border-zinc-200/90 dark:border-zinc-800/90 shadow-md dark:shadow-2xl flex items-center justify-center group">
            <Image
              src={currentImg}
              alt={product.name}
              width={800}
              height={800}
              className="w-full h-full object-contain"
            />
            {/* Unboxing overlay button */}

          </div>

          {/* Thumbnail Strip */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-w-[500px] mx-auto">
            {product.images && product.images.length > 0 ? (
              product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImg(img.imageUrl)}
                  className={`aspect-square rounded-2xl border overflow-hidden bg-white dark:bg-[#0d0e14] p-1 transition-all duration-200 ${currentImg === img.imageUrl
                    ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-md shadow-purple-500/10 scale-105 z-10'
                    : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-purple-300 dark:hover:border-purple-800 opacity-70 hover:opacity-100'
                    }`}
                >
                  <Image src={img.imageUrl} alt="" width={200} height={200} className="w-full h-full object-contain rounded-xl p-1" />
                </button>
              ))
            ) : (
              <button
                type="button"
                className="aspect-square rounded-2xl border border-purple-500 ring-2 ring-purple-500/50 p-1 bg-white dark:bg-[#0d0e14]"
              >
                <Image src={product.image || ''} alt="" width={200} height={200} className="w-full h-full object-contain rounded-xl p-1" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-6 flex flex-col space-y-5 bg-white dark:bg-[#0c0d14]/70 p-4 sm:p-5 lg:p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-lg dark:shadow-2xl backdrop-blur-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1527] dark:text-white leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {product.averageRating || 4.8}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                ({product.reviewCount || 124} reviews) | 500+ students bought this
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-black text-[#0B1527] dark:text-white font-mono tracking-tighter">
              ₹{finalSellingPrice.toLocaleString()}
            </span>
            {finalMrpPrice && (
              <span className="text-lg text-zinc-400 line-through font-mono font-medium">
                ₹{finalMrpPrice.toLocaleString()}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-[#E5F7ED] text-[#00A95D] dark:bg-[#00A95D]/20 dark:text-[#00A95D] px-2 py-1 rounded text-xs font-extrabold">
                {discountPercent}% OFF
              </span>
            )}
            <div className="ml-auto flex items-center gap-1.5 bg-[#E5F7ED] dark:bg-[#00A95D]/10 px-2.5 py-1 rounded-full border border-[#00A95D]/20">
              <div className="h-2 w-2 rounded-full bg-[#00A95D] animate-pulse"></div>
              <span className="text-xs font-bold text-[#00A95D]">In Stock</span>
            </div>
          </div>

          <p className="text-[#4A5568] dark:text-zinc-400 text-sm leading-relaxed">
            {product.description || 'A complete hands-on kit to build exciting real-world projects. Perfect for students, educators, and hobbyists. Includes high-quality components, project guide, and online resources.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">


            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="group/btn relative overflow-hidden flex-1 min-w-[140px] h-12 flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700 hover:border-cyan-500 text-zinc-800 dark:text-zinc-200 hover:text-white font-extrabold rounded-2xl shadow-sm transition-all active:scale-95"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-500 w-0 group-hover/btn:w-full transition-all duration-500 ease-out z-0" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </span>
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              className="group/btn relative overflow-hidden flex-1 min-w-[140px] h-12 flex items-center justify-center gap-2 border border-violet-600 bg-violet-600 text-white font-extrabold rounded-2xl shadow-md shadow-violet-600/25 transition-all active:scale-95"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-indigo-600 w-0 group-hover/btn:w-full transition-all duration-500 ease-out z-0" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 fill-current" />
                Buy Now
              </span>
            </button>
          </div>

          {/* Features Strip */}
          <div className="flex items-center gap-6 pt-5 mt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">Free Shipping</span>
                <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">on orders above ₹499</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">Easy Returns</span>
                <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">7 days policy</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-zinc-200 dark:border-zinc-800 mb-8 bg-[#F8FAFC] dark:bg-zinc-900/50 rounded-t-xl">
        <button
          onClick={() => setActiveTab('included')}
          className={`px-8 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'included' ? 'text-[#0B1527] border-b-2 border-[#0B1527] dark:text-white dark:border-white' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
        >
          What's Included
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-8 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'projects' ? 'text-[#0B1527] border-b-2 border-[#0B1527] dark:text-white dark:border-white' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
        >
          Projects ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-8 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'faqs' ? 'text-[#0B1527] border-b-2 border-[#0B1527] dark:text-white dark:border-white' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
        >
          FAQs
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'included' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0B1527] dark:text-white">What's Included in the Kit?</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">20+ high-quality components to build 20 real-world projects</p>
            </div>

          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1.5 sm:gap-2">
            {whatsIncluded.map((comp: any, idx: number) => (
              <div key={idx} className="relative flex flex-col items-center justify-center p-1 sm:p-1.5 bg-[#F8FAFC] dark:bg-[#131720] border border-zinc-100 dark:border-zinc-800/50 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                <div className="w-full aspect-square rounded overflow-hidden flex items-center justify-center">
                  <Image src={comp.image || comp.img} alt={comp.name} width={200} height={200} className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal filter dark:invert-[.8]" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-center text-zinc-900 dark:text-zinc-200 leading-tight mt-1 px-1">
                  {comp.name}
                </span>
                <div className="mt-1.5 mb-1 bg-slate-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  {(() => {
                    const q = comp.quantity || comp.qty || '';
                    if (!q) return '';
                    const lowerQ = String(q).toLowerCase();
                    return (lowerQ.includes('pc') || lowerQ.includes('piece') || lowerQ.includes('set')) 
                      ? q 
                      : `${q} pcs`;
                  })()}
                </div>
              </div>
            ))}
          </div>

          <button className="sm:hidden mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-[#0B1527] dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 transition shadow-sm">
            <LayoutGrid className="h-4 w-4" />
            View Complete List
          </button>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="animate-in fade-in duration-500">
          <div className="text-center mb-10 max-w-2xl mx-auto mt-4">
            <h2 className="text-3xl font-black text-[#0B1527] dark:text-white tracking-tight">Build {projects.length} Real-World Projects</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-sm">Follow step-by-step guides to build these exciting IoT applications using the components in this kit.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj: string, idx: number) => (
              <div key={idx} className="p-5 bg-white dark:bg-[#131720] border border-zinc-200 dark:border-zinc-800/50 rounded-2xl relative overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-black shadow-inner shadow-violet-500/20">
                    <span className="relative z-10 text-sm">{idx + 1}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{proj}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="animate-in fade-in duration-500 max-w-3xl mx-auto mt-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#0B1527] dark:text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-sm">Got questions? We've got answers.</p>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq: any, idx: number) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`bg-white dark:bg-[#131720] border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-violet-500 shadow-md shadow-violet-500/5' : 'border-zinc-200 dark:border-zinc-800/50'}`}>
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px]">{faq.question}</span>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'bg-violet-600 text-white rotate-180' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 pt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/50 mx-6">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
