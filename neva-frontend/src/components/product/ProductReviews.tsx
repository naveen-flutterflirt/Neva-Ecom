'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, CheckCircle2, User, ThumbsUp, MessageSquare } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  title?: string;
  images?: string[];
  helpfulCount: number;
  createdAt?: string;
}

interface ProductReviewsProps {
  productId: string | number;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        // We fetch by productName to match the orders logic, or you could use productId
        const res = await apiClient(`/reviews?productName=${encodeURIComponent(productName)}&t=${Date.now()}`);
        if (res && res.data) {
          // Format date for display
          const formattedReviews = res.data.map((r: any) => ({
            ...r,
            date: new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            helpfulCount: 0 // Mock helpful count for now
          }));
          setReviews(formattedReviews);
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (productName) {
      fetchReviews();
    }
  }, [productName]);
  
  // Distribution calculation
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1) 
    : '0.0';
    
  const getRatingPercent = (stars: number) => {
    if (totalReviews === 0) return 0;
    const count = reviews.filter(r => r.rating === stars).length;
    return Math.round((count / totalReviews) * 100);
  };

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <div className="w-full mt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-xl lg:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Ratings & Reviews
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Summary & Action */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6 bg-white dark:bg-[#0c0d14]/70 p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm sticky top-24">
          
          <div className="text-center space-y-1">
            <div className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
              {averageRating}
              <span className="text-lg text-zinc-400 dark:text-zinc-600 font-bold ml-1">/ 5</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 dark:fill-zinc-800 text-zinc-200 dark:text-zinc-800'}`} 
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium pt-1">Based on {totalReviews} reviews</p>
          </div>

          <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            {[5, 4, 3, 2, 1].map((stars) => {
              const percent = getRatingPercent(stars);
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 font-bold text-zinc-600 dark:text-zinc-400 w-8">
                    {stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-8 text-right font-medium text-zinc-500 dark:text-zinc-500">
                    {percent}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Reviews List */}
        <div className="md:col-span-8 lg:col-span-9 space-y-4">
          {visibleReviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-[#0c0d14]/50 p-4 lg:p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm">
              
              {/* Reviewer Header */}
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white leading-none">{review.userName}</span>
                      <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-bold leading-none">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500 block mt-1 leading-none">{review.date}</span>
                  </div>
                </div>
                
                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 bg-zinc-50 dark:bg-zinc-900/50 px-2 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mr-1">{review.rating}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>
              </div>

              {/* Review Content */}
              {review.title && <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{review.title}</h4>}
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                {review.comment}
              </p>

              {/* Attached Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {review.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedImage(img)}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <Image src={img} alt="Review Attachment" width={200} height={200} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="text-center py-8 bg-white dark:bg-[#0c0d14]/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
              <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-500 font-medium">No reviews yet. Be the first to review this product!</p>
            </div>
          )}

          {reviews.length > visibleCount && (
            <div className="pt-2 text-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 4)}
                className="px-6 py-2.5 bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-800/50 shadow-sm transition-all"
              >
                View More Reviews
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
              className="absolute -top-12 right-0 sm:-right-12 h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <Image 
              src={selectedImage} 
              alt="Expanded view" 
              width={1200}
              height={1200}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
